import {type LoaderFunctionArgs, redirect} from "@remix-run/node";
import {clearSession} from "@/services/session.server";
import {writeToLog, writeToLogAtLevel} from "@/lib/errorops.server";

export async function loader(args: LoaderFunctionArgs) {
    const {request} = args;
    const {user, headers} = await clearSession(request);
    writeToLogAtLevel('info', 'logout/loader', `cleared session for ${user?.id}`, user);
    return redirect('/', {headers});
}
