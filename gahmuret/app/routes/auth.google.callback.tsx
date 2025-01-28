import {type LoaderFunctionArgs, redirect} from "@remix-run/node";
import {authenticator, ProviderNameGoogle} from '@/services/auth.server'
import {saveSession} from "@/services/session.server";
import Debug from "debug";
import {writeToLogAtLevel} from "@/lib/errorops.server";

const debug = Debug("gahmuret:app:routes:auth:google:callback");

export async function loader(args: LoaderFunctionArgs) {
    const {request} = args;
    const user = await authenticator.authenticate(ProviderNameGoogle, request);
    const {session, headers} = await saveSession(request, user);
    // session has a getter called 'data', that returns all data in the session; we want the 'data' element inside it
    const session_data = session.data?.data;
    const return_to = session_data?.returnTo || '/';
    writeToLogAtLevel('info', 'loader', `user ${user.id} logged in, returnTo ${return_to}`, user);
    return redirect(return_to, {headers});
}
