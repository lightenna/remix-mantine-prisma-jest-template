import {type LoaderFunctionArgs} from "@remix-run/node";
import {
    List,
    Stack,
    Switch, Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import {json} from "@remix-run/node";
import {Link, Outlet, useLoaderData, useRouteError} from "@remix-run/react";
import Debug from "debug";
import {useTranslations} from "use-intl";
import {writeToLog} from "@/lib/errorops.server";
import {getUserIfAvailable} from "@/services/auth.server";
import Menu from "@/components/Menu";
const debug = Debug("gahmuret:app:routes:_index");

export async function loader(args: LoaderFunctionArgs) {
    const {request} = args;
    // authentication is optional
    const {user} = await getUserIfAvailable(request);
    writeToLog('index/loader', user ? 'authenticated' : 'anonymous', user);
    return json({ userId: user?.id });
}

export default function IndexPage() {
    const {userId} = useLoaderData<typeof loader>();
    const t = useTranslations();

    return (
        <div data-testid="IndexPage" className="IndexPage">
            <Stack gap="md" p="lg">
                <Title>{t('IndexPage.title')}</Title>
                <Menu loggedIn={userId !== undefined} />
            </Stack>
        </div>
    );
}
