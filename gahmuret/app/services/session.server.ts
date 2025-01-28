import {
    createCookie,
    createCookieSessionStorage,
    createMemorySessionStorage,
    createSessionStorage
} from "@remix-run/node";
import {User} from "@/models/User.server";
import db from "@/db.server";
import Debug from "debug";
import {writeToErrorLog} from "@/lib/errorops.server";
const debug = Debug("gahmuret:app:routes:account._index");

export type SessionUser = User;

export const SessionUserKeyInSession = 'user';
const genericCookieOptions = {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as (boolean | "lax" | "strict" | "none" | undefined),
    secrets: [process.env.SESSION_SECRET || 'no-such-session-secret'],
    secure: process.env.NODE_ENV === 'production',
};
// export const unifiedSessionStorage = getCookieBasedSessionStorage();
export const unifiedSessionStorage = getDatabaseBasedSessionStorage();

//
// alternative methods for storing session data
//

function getCookieBasedSessionStorage() {
    return createCookieSessionStorage<{
        [SessionUserKeyInSession]: SessionUser,
        returnTo?: string,
    }>({
        cookie: genericCookieOptions,
    });
}

function getMemoryBasedSessionStorage() {
    return createMemorySessionStorage({
        cookie: createCookie(genericCookieOptions.name, genericCookieOptions),
    });
}

function getDatabaseBasedSessionStorage() {
    return createSessionStorage({
        cookie: genericCookieOptions,
        async createData(data, expires) {
            // `expires` is a Date after which the data should be considered
            // invalid. You could use it to invalidate the data somehow or
            // automatically purge this record from your database.
            debug('createData', data, expires);
            const session = await db.session.create({
                data: {
                    data: JSON.stringify(data),
                    expires: expires,
                },
            });
            debug('session after createData', session);
            return session.id;
        },
        async readData(id) {
            debug('readData', id);
            const session = await db.session.findUnique({
                where: { id },
                // automatically join the user record if the session has a userId
                include: { user: true },
            }) || null;
            if (session && session.data && typeof session.data === 'string') {
                try {
                    session.data = JSON.parse(session.data);
                } catch (e) {
                    writeToErrorLog('error', 'createSessionStorage:readData', 'failed to deserialize session data', e);
                }
            }
            debug('session after readData', session);
            return session;
        },
        async updateData(id, data, expires) {
            debug('updateData', id, data, expires);
            const session = await db.session.update({
                where: { id },
                data: {
                    data: JSON.stringify(data.data),
                    expires,
                    userId: data.user?.id,
                },
            });
            debug('session after updateData', session);
        },
        async deleteData(id) {
            debug('deleteData', id);
            const session = await db.session.delete({ where: { id } });
            debug('session after deleteData', session);
        },
    });
}

//
// standard session interface functions
//

export async function getSession(request: Request) {
    return await unifiedSessionStorage.getSession(request.headers.get('Cookie'));
}

export async function saveSession(request: Request, user: SessionUser){
    const session = await getSession(request);
    session.set(SessionUserKeyInSession, user);
    const headers = new Headers({
        'Set-Cookie': await unifiedSessionStorage.commitSession(session),
    });
    return {session, headers};
}

export async function clearSession(request: Request) {
    const session = await unifiedSessionStorage.getSession(request.headers.get("cookie"));
    const user = session.get(SessionUserKeyInSession);
    return {
        session,
        user,
        headers: {
            "Set-Cookie": await unifiedSessionStorage.destroySession(session)
        }
    };
}
