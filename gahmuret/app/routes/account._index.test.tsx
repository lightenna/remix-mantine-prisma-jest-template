import {createRemixStub} from "@remix-run/testing";
import {
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {default as AccountIndex} from "@/routes/account._index";
import {getComponentFactory, getTestUser} from "@/lib/testops.server";
import {json} from "@remix-run/node";

describe("account._index route", () => {

    it("renders page in English", async () => {
        const user = await getTestUser();
        const RemixStub = createRemixStub([
            {
                path: "/",
                Component: await getComponentFactory(
                    <AccountIndex/>,
                ),
                async loader() { return json({ user: user?.id }); },
            },
        ]);
        render(<RemixStub/>);
        await waitFor(() => screen.findByTestId('AccountPage'));
    });

    it("renders page in Spanish", async () => {
        const user = await getTestUser();
        const RemixStub = createRemixStub([
            {
                path: "/",
                Component: await getComponentFactory(
                    <AccountIndex/>,
                    "es"
                ),
                async loader() { return json({ user: user?.id }); },
            },
        ]);
        render(<RemixStub/>);
        await waitFor(() => screen.findByTestId('AccountPage'));
    });

});
