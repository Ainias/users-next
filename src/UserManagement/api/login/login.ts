import type { Request, Response } from 'express';
import { User } from '../../../models/User';
import { UserManager } from '../../UserManager';
import { setUserLoggedIn } from './setUserLoggedIn';
import { getRepository } from '@ainias42/typeorm-helper';

export type LoginResponseData =
    | {
          success: true;
          user: User;
          accesses: string[];
      }
    | {
          success: false;
          message?: string;
      };

export async function login(
    emailOrUsername: string,
    password: string,
    {
        req,
        res,
    }: {
        req: Request;
        res: Response;
    },
): Promise<LoginResponseData> {
    const userRepository = getRepository(User);
    const where = emailOrUsername.includes('@')
        ? { email: emailOrUsername.toLowerCase() }
        : { username: emailOrUsername };

    const user = await userRepository.findOneBy({ ...where, activated: true, blocked: false });
    const userManager = UserManager.getInstance();

    if (user && userManager.hashPassword(user, password) === user.password) {
        const accesses = await setUserLoggedIn(user, req, res);
        return {
            success: true,
            user,
            accesses,
        };
    }
    UserManager.deleteToken(res);
    return {
        success: false,
        message: 'wrong email or password',
    };
}
