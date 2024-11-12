import type { Request, Response } from 'express';
import { UserManager } from '../UserManager';
import { setUserLoggedIn } from './login/setUserLoggedIn';

export type HandleUserTokenOptions =
    | {
          autoLogin?: false;
          req?: Request;
          res?: Response;
      }
    | {
          autoLogin: true;
          req: Request;
          res: Response;
      };

export async function handleUserToken(token: string, options?: HandleUserTokenOptions) {
    const userManager = UserManager.getInstance();
    const { user, tokenType } = await userManager.handleToken(token);

    if (!options?.autoLogin) {
        return {
            user,
            tokenType,
        };
    }

    const { req, res } = options;
    const accesses = await setUserLoggedIn(user, req, res);

    return {
        accesses,
        user,
        tokenType,
    };
}
