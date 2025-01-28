import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {Notifications} from "@mantine/notifications";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useLoaderData,
} from "@remix-run/react";
import {IntlProvider} from "use-intl";
import {getMessages, getTimezone, resolveLocale} from "@/lib/messops.server";
import type {LinksFunction} from "@remix-run/node";
import {ColorSchemeScript, MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';

export const links: LinksFunction = () => [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export async function loader({request}: {request: Request}) {
    const locale = resolveLocale(request);
    return {
        locale,
        messages: await getMessages(locale),
        timeZone: getTimezone(),
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const {locale, messages, timeZone} = useLoaderData<typeof loader>();

    return (
        <html lang={locale}>
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <Meta/>
            <Links/>
            <ColorSchemeScript defaultColorScheme="auto" />
        </head>
        <body>
        <IntlProvider locale={locale} messages={messages} timeZone={timeZone}>
            <MantineProvider defaultColorScheme="auto">
                <Notifications position="bottom-left" limit={1} />
                <ModalsProvider>
                    {children}
                </ModalsProvider>
            </MantineProvider>
        </IntlProvider>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function App() {
    return <Outlet/>;
}

