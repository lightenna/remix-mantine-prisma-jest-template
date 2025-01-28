import {createRemixStub} from "@remix-run/testing";
import {
    render,
    screen,
    waitFor, within,
} from "@testing-library/react";
import {default as AccountIndex} from "@/routes/account._index";
import {getComponentFactory, getTestUser} from "@/lib/testops.server";
import {json} from "@remix-run/node";
import IndexPage from "@/routes/_index";
import {getMessages, getTestTranslations} from "@/lib/messops.server";

describe("_index route", () => {

    it("renders page in English, unauthenticated", async () => {
        const RemixStub = createRemixStub([
            {
                path: "/",
                Component: await getComponentFactory(
                    <IndexPage/>,
                ),
                async loader() { return json({ userId: undefined }); },
            },
        ]);
        render(<RemixStub/>);
        await waitFor(() => screen.findByTestId('IndexPage'));
        const selector = screen.getByTestId('IndexPage');
        const messages = await getMessages();
        const t = getTestTranslations(messages);
        // unauthenticated, so should show log in button
        expect(within(selector).getByText(t('Menu.login'))).toBeInTheDocument();
        // check h1 for title
        expect(within(screen.getByRole('heading', {level: 1})).getByText(t('IndexPage.title'))).toBeInTheDocument();
    });

    it("renders page in English, authenticated", async () => {
        const user = await getTestUser();
        const RemixStub = createRemixStub([
            {
                path: "/",
                Component: await getComponentFactory(
                    <IndexPage/>,
                ),
                async loader() { return json({ userId: user?.id }); },
            },
        ]);
        render(<RemixStub/>);
        await waitFor(() => screen.findByTestId('IndexPage'));
        const selector = screen.getByTestId('IndexPage');
        const messages = await getMessages();
        const t = getTestTranslations(messages);
        // authenticated, so should show log out button
        expect(within(selector).getByText(t('Menu.logout'))).toBeInTheDocument();
    });

    it("renders page in Spanish, unauthenticated", async () => {
        const locale = 'es';
        const RemixStub = createRemixStub([
            {
                path: "/",
                Component: await getComponentFactory(
                    <IndexPage/>,
                    locale
                ),
                async loader() { return json({}); },
            },
        ]);
        render(<RemixStub/>);
        await waitFor(() => screen.findByTestId('IndexPage'));
        const selector = screen.getByTestId('IndexPage');
        const messages = await getMessages(locale);
        const t = getTestTranslations(messages);
        // unauthenticated, so should show log in button
        expect(within(selector).getByText(t('Menu.login'))).toBeInTheDocument();
        // check h1 for title
        expect(within(screen.getByRole('heading', {level: 1})).getByText(t('IndexPage.title'))).toBeInTheDocument();
    });

});
