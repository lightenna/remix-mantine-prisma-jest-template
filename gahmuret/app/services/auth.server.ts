import {Authenticator} from 'remix-auth';
import {GoogleStrategy} from '@/custom/coji/remix-auth-google';
import {getOrCreateUser} from "@/models/User.server";
import Debug from "debug";
import {redirect} from "@remix-run/node";
import {getSession, SessionUserKeyInSession, type SessionUser, unifiedSessionStorage} from "@/services/session.server";

const debug = Debug("gahmuret:app:services:auth");

export const ProviderNameGoogle = 'google';
export const authenticator = new Authenticator<SessionUser>();

const options = {
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || 'no-such-client-id',
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || 'no-such-client-secret',
    redirectURI: `${process.env.APP_URL}/auth/google/callback`,
};
const verify = async ({accessToken, tokens}: any) => {
    // get the user data from API using the tokens and profile
    const profile = await GoogleStrategy.userProfile(tokens)
    // get the user from the database or create a new user if they don't exist; debug(profile);
    return await getOrCreateUser({
        email: profile?.emails[0].value,
        displayName: profile?.name?.givenName || profile?.displayName,
        pictureUrl: profile?.photos[0]?.value,
    });
};
const googleStrategy = new GoogleStrategy(options, verify);
authenticator.use(googleStrategy);

/**
 * `authenticate` helper function to check if the user is logged in on authenticated routes
 * @param request
 * @param return_to
 */
export async function authenticate(request: Request, return_to?: string) {
    const session = await getSession(request);
    const user = session?.get(SessionUserKeyInSession);
    // if we already have a user, return it
    if (user) return {
        session,
        user,
    };
    // otherwise, save return_to in anon session
    if (return_to) session?.set("returnTo", return_to);
    // redirect anonymous user to /login
    throw redirect("/login", {
        headers: {"Set-Cookie": await unifiedSessionStorage.commitSession(session)},
    });
}

export async function getUserIfAvailable(request: Request) {
    const session = await getSession(request);
    const user = session?.get(SessionUserKeyInSession);
    // both session and user could be undefined
    return {
        session,
        user,
    };
}
