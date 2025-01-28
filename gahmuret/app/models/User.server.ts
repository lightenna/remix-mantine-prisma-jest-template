import {type user} from "@prisma/client";
import db from "@/db.server";
import {fatalError, writeToLogAtLevel} from "@/lib/errorops.server";
import {DisablePersistence} from "@/lib/constants.server";

export type User = user;

export async function getOrCreateUser(partial: Partial<User>): Promise<User> {
    let userdetails;
    if (!partial.email) {
        throw fatalError("No email provided", {status: 400});
    }
    try {
        userdetails = await getUser(partial.email);
        return userdetails;
    } catch (error: unknown) {
        if (error instanceof Response) {
            // user not found, so create
        } else {
            throw error;
        }
    }
    userdetails = await createUser(partial);
    return userdetails;
}

/**
 * Get user details from the database
 * @throws Response if user is not found
 * @param email
 */
export async function getUser(email: string): Promise<User> {
    const userdetails = await getUserFailQuietly(email);
    if (!userdetails) {
        throw fatalError("No user found", {status: 404});
    }
    return userdetails;
}

export async function getUserFailQuietly(email: string): Promise<User | null> {
    const userdetails = await db.user.findFirst({
        where: {
            email: email,
        }
    });
    return userdetails;
}

export async function createUser(partial: Partial<User>): Promise<User> {
    // create a new user record
    const userdetails = await db.user.create({
        data: {
            email: partial.email || 'no-such-email@example.com',
            ...partial,
        }
    });
    writeToLogAtLevel('info', 'createUser', `for ${userdetails.id}`);
    return userdetails;
}

export async function persistUser(userdetails: User) {
    const data = userdetails;
    // default to data to enable testing when `DisablePersistence` is true
    let persisted_entity: user = {
        ...data,
    };
    if (!DisablePersistence) {
        persisted_entity = await db.user.upsert({where: {id: userdetails.id}, create: persisted_entity, update: persisted_entity});
    }
    return persisted_entity;
}
