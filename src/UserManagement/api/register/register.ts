import { DuplicateError } from './DuplicateError';
import { QueryFailedError } from 'typeorm';
import { User } from '../../../models/User';
import { UserManager } from '../../UserManager';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Role } from '../../../models/Role';

export async function register(
    email: string,
    username: string,
    password: string,
    roles: Role[],
    options?: {
        autoActivated?: boolean;
    },
) {
    const activated = options?.autoActivated ?? false;

    const userRepository = await getRepository(User);

    const userManager = UserManager.getInstance();
    const user = new User();
    user.email = email;
    user.username = username;
    // this one also sets the salt
    user.password = userManager.hashPassword(user, password);
    user.activated = activated;
    user.blocked = false;
    user.roles = roles;

    try {
        await userRepository.save(user);
    } catch (error) {
        if (error instanceof QueryFailedError && error.message.startsWith("Duplicate entry '")) {
            if (error.message.startsWith(`Duplicate entry '${email}`)) {
                throw new DuplicateError('E-Mail', email);
            } else if (error.message.startsWith(`Duplicate entry '${username}`)) {
                throw new DuplicateError('Username', username);
            }
            throw Object.assign(new Error('Username or email already taken'), { cause: error });
        }
        throw error;
    }

    if (user.id === undefined) {
        throw new Error('User not saved');
    }

    if (activated) {
        return { user, token: '' };
    }
    try {
        const token = await userManager.generateActivateToken(user);
        return { token, user };
    } catch (error) {
        console.log("Couldn't generate activation token", error);
        throw error;
    }
}
