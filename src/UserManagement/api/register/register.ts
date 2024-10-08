import { User } from '../../../models/User';
import { Role } from '../../../models/Role';
import { UserManager } from '../../UserManager';
import { QueryFailedError } from 'typeorm';
import { DuplicateError } from './DuplicateError';
import { getRepository } from '@ainias42/typeorm-helper';

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
            throw new Error('Username or email already taken');
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
