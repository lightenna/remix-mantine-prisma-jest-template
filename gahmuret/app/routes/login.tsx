import {Form} from "@remix-run/react";
import {authenticator, ProviderNameGoogle} from "@/services/auth.server";
import {ActionFunctionArgs, type LoaderFunctionArgs, redirect} from "@remix-run/node";
import Debug from "debug";
import {HashMapOf} from "@/types/general";
import {writeToLogAtLevel} from "@/lib/errorops.server";

const debug = Debug("gahmuret:app:routes:login");
const providers: HashMapOf<any> = {
    ProviderNameGoogle: {
        knownAs: 'Google'
    }
};

export async function loader(args: LoaderFunctionArgs) {
    // if we only have a single provider, just go ahead and authenticate
    if (Object.keys(providers)?.length === 1) {
        return action(args);
    }
}

export async function action(args: ActionFunctionArgs) {
    const {request, params} = args;
    writeToLogAtLevel('info', 'action', 'form params if set', params);
    return await authenticator.authenticate(ProviderNameGoogle, request);
}

export default function Login() {
    return (
        <Form method="post">
            {Object.keys(providers).map((name, index) => {
                const provider = providers[name];
                return (
                    <button key={`login-provider-${index}-${name}`} type="submit" value={provider.name}>
                        Login with {provider.knownAs}
                    </button>
                );
            })}
        </Form>
    )
}
