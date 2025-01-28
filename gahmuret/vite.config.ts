import {vitePlugin as remix} from "@remix-run/dev";
import {defineConfig, type UserConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json" with { type: "json" };

const host = new URL(process.env.APP_URL || "http://localhost")
    .hostname;

let hmrConfig;
if (host === "localhost") {
    hmrConfig = {
        protocol: "ws",
        host: "localhost",
        port: 64999,
        clientPort: 64999,
    };
} else {
    hmrConfig = {
        protocol: "wss",
        host: host,
        port: process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 8002,
        clientPort: 443,
    };
}

const plugins = [
    remix({
        future: {
            // opt-in early to Remix v3 features (silences start-up warning), see https://remix.run/docs/en/main/start/future-flags
            v3_fetcherPersist: true,
            v3_lazyRouteDiscovery: true,
            v3_relativeSplatPath: true,
            v3_singleFetch: true,
            v3_throwAbortReason: true,
            // can't work out where to set _React Router_ future flags, as ignored here
            // v7_startTransition: true,
            // v7_relativeSplatPath: true,
        },
        ignoredRouteFiles: [
            "**/.*",
            "**/*.test.ts", "**/*.test.tsx"
        ],
        presets: [],
    }),
    tsconfigPaths(),
];

// add `remix-development-tools` before remix() plugin, but only in the dev environment
const current_env = process.env.NODE_ENV || 'development';
if (current_env === "development") {
    // plugins.unshift(remixDevTools());
}

export default defineConfig({
    build: {
        assetsInlineLimit: 0,
    },
    css: {
        preprocessorOptions: {
            api: 'modern',
        },
    },
    define:  {
        // can't include package.json (security risk) so only include the version then publish as `process.env` var
        '__PACKAGE_VERSION__': JSON.stringify(pkg.version)
    },
    optimizeDeps: {
        // stop vite from pre-bundling newrelic (`no loader is configured for`... error), see https://stackoverflow.com/questions/77721584/react-vite-app-shows-the-error-no-loader-is-configured-for-html-files-se
        exclude: ['newrelic']
    },
    plugins: plugins,
    server: {
        port: Number(process.env.PORT || 4000),
        hmr: hmrConfig,
        fs: {
            // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
            allow: ["app", "node_modules"],
        },
        watch: {
            ignored: ["node_modules/**"],
        }
    },
}) satisfies UserConfig;
