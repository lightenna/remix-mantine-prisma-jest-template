import {type LoaderFunctionArgs} from "@remix-run/node";
import {
    Stack,
    Title,
} from "@mantine/core";
import {json} from "@remix-run/node";
import {Outlet, useLoaderData} from "@remix-run/react";
import Debug from "debug";
import {useTranslations} from "use-intl";
import {writeToLog} from "@/lib/errorops.server";
import {authenticate} from "@/services/auth.server";
import Menu from "@/components/Menu";
const route_name = 'account';
const debug = Debug(`gahmuret:app:routes:${route_name}`);

export async function loader(args: LoaderFunctionArgs) {
    const {request} = args;
    // authentication is mandatory
    const {user} = await authenticate(request, `/${route_name}`);
    writeToLog('index/loader', user ? 'authenticated' : 'anonymous', user);
    return json({ userId: user?.id });
}

export default function AccountLayout() {
    const {userId} = useLoaderData<typeof loader>();
    const t = useTranslations();

    return (
        <div data-testid="AccountLayout" className="AccountLayout">
            <Stack gap="md" p="lg">
                <Title>{t('AccountPage.title')}</Title>
                <Menu loggedIn={userId !== undefined} />
                <Outlet/>
            </Stack>
        </div>
    );
}
