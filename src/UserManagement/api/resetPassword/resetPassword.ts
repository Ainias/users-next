import { UserManager } from '../../UserManager';
import type { Request, Response } from 'express';
import { setUserLoggedIn } from '../login/setUserLoggedIn';

export type ResetPasswordOptions =
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

export async function resetPassword(token: string, password: string, options?: ResetPasswordOptions) {
    const userManager = UserManager.getInstance();
    const user = await userManager.resetPassword(token, password);

    if (!options?.autoLogin) {
        return {
            user,
        };
    }

    const { req, res } = options;
    const accesses = await setUserLoggedIn(user, req, res);

    return {
        accesses,
        user,
    };
}
