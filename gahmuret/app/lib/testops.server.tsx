import {type ComponentType, type ReactElement} from "react";
import {getMessages, getTimezone} from "@/lib/messops.server";
import {IntlProvider} from "use-intl";
import {EmptyObject} from "@/types/general";
import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";
import {getUser, User} from "@/models/User.server";

const TestGoogleAccountEmailAddress = 'your-test-account-email@example.com';

export async function getComponentFactory(children: ReactElement, locale = 'en'): Promise<ComponentType<EmptyObject>> {
    const messages = await getMessages(locale);
    const component = () =>
        <IntlProvider locale="en" messages={messages} timeZone={getTimezone()}>
            <MantineProvider defaultColorScheme="auto">
                <Notifications position="bottom-left" limit={1} />
                <ModalsProvider>
                    {children}
                </ModalsProvider>
            </MantineProvider>
        </IntlProvider>;
    return component;
}

export async function getTestUser(): Promise<User | null> {
    return getUser(TestGoogleAccountEmailAddress);
}

/**
 * Official workaround from Jest documentation
 * fixes `match.current?.addEventListener is not a function` jest error [in Mantine](https://github.com/mantinedev/mantine/blob/d252819327208f3c1d3d80e1f044d323a5797b54/packages/%40mantine/core/src/core/MantineProvider/use-mantine-color-scheme/use-provider-color-scheme.ts)
 * https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
 */
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
