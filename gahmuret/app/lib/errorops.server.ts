import {type TransformFunction} from "logform";
import {json} from "@remix-run/node";
import winston from "winston";
import util from 'util';
import NewrelicTransport from 'winston-newrelic-agent-transport'
import Debug from "debug";

const debug = Debug("gahmuret:app:lib:errorops.server");
const logSourceMaxLen = 24;
const newRelicJSONLogEntryLimit = 676 // theoretically 4094;

// https://stackoverflow.com/a/78208018/1444233
const combineTransform: TransformFunction = (info) => {
    const output: any = { ...info };
    const data: any = info[Symbol.for('splat')];
    if (data) { output.message = util.format(info.message, ...data); }
    return output;
};

const newrelicTransform: TransformFunction = (info) => {
    const output: any = {
        ...info,
        metadata: info.metadata || {},
    };
    const data: any = info[Symbol.for('splat')];
    // show all the data in the message, single-space and limit to ensure it fits in the New Relic log entry limit
    if (data) {
        const smush = util.format(...data).replaceAll(/\s\s+/g,' ').substring(0, newRelicJSONLogEntryLimit);
        output.message += (smush.length && smush[0] !== ' ' ? ' ' : '') + smush;
    }
    // look for shop data
    if (data[1] && data[1].shop) {
        // append to metadata for field-based searching
        output.metadata.abbrevshop = data[1];
    }
    return output;
};

// default is full-fat comprehensive logging, but different format is used for some transports
const default_format = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
    winston.format.errors({stack: true}),
    winston.format(combineTransform)(),
    winston.format.printf(
        ({ level, message, timestamp, label }) =>
            `${level.toUpperCase().slice(-5).padEnd(5, ' ')} ${message}`,
    ),
    winston.format.colorize(),
);

// standard options for files written to container's ephemeral storage (/tmp)
const stdFileOptions = {
    // 50MB file size limit
    maxsize: 50 * 1024 * 1024,
    // store at most 3 x 50MB files
    maxFiles: 3,
    tailable: true,
    format: default_format,
};

const transports = [
    // write out logs to container's stdout (console)
    new winston.transports.Console({
        level: 'info',
        format: default_format,
    }),
    // write out logs to a local file on container, for deeper digging
    new winston.transports.File({ filename: `/tmp/winston-${process.env.NEW_RELIC_APP_NAME}.log.erroronly`, level: 'error', ...stdFileOptions }),
    new winston.transports.File({ filename: `/tmp/winston-${process.env.NEW_RELIC_APP_NAME}.log`, level: 'debug', ...stdFileOptions }),
    // write out logs to New Relic, in cropped JSON format
    new NewrelicTransport({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.metadata({ key: 'metadata', fillExcept: ['level', 'message', 'timestamp'] }),
            winston.format(newrelicTransform)(),
            winston.format.json(),
        ),
    }),
];

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        service: process.env.NEW_RELIC_APP_NAME,
        NODE_ENV: process.env.NODE_ENV,
        // __PACKAGE_VERSION__ here breaks playwright tests
        // app_version: __PACKAGE_VERSION__ || '0.0.0'
    },
    transports,
});

export function isRedirect(error: any) {
    return error instanceof Response && error.status >= 300 && error.status < 400;
}

export function testError(data: string, additional: any = {}) {
    throw new Error(data, additional);
}

/**
 * Fatal errors are not translated
 * @param data
 * @param additional
 */
export function fatalError(data: string, additional: any = {status: 500}) {
    throw new Response(data, additional);
}

/**
 * (External) non-fatal errors should be returned to the client, translated and processed
 * @param field
 * @param type
 * @param tone
 * @param status
 */
export function nonFatalErrorReport(field: string, type: string, tone: string, status = 500) {
    return json(nonFatalErrorInternally(field, type, tone), {status: status});
}

/**
 * Internally thrown errors should be caught (server-side) and processed
 * @param field
 * @param type
 * @param tone
 * @param status
 */
export function nonFatalErrorInternally(field: string, type: string, tone: string, status = 500) {
    return {
        errors: {
            'field': field,
            'type': type,
            'tone': tone,
        }
    };
}

function formatFirstArg(arg: any, length: number) {
    if (arg && typeof arg === 'string') {
        // don't include opening '['
        return arg.slice(-length).padStart(length, ' ') + ']';
    }
    return arg;
}

/**
 * Write to the log
 * @param level
 * @param {array} data
 * data[0] source
 * data[1] message description
 * data[2] abbreviated shop details (if available)
 */
export function writeToLogAtLevel(level: string, ...data: Array<any>) {
    // format the first argument as a source
    let source = '';
    if (data[0]) {
        source = formatFirstArg(data.shift(), logSourceMaxLen);
    }
    logger.log(level, source, ...data);
}

export function writeToLog(...data: Array<any>) {
    writeToLogAtLevel('info', ...data);
}

export function writeToErrorLog(...data: Array<any>) {
    writeToLogAtLevel('error', ...data);
}
