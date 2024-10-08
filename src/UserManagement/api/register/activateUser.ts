import { UserManager } from '../../UserManager';
import type { Request, Response } from 'express';
import { setUserLoggedIn } from '../login/setUserLoggedIn';

export type ActivateOptions =
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

export async function activateUser(token: string, options?: ActivateOptions) {
    const userManager = UserManager.getInstance();
    const user = await userManager.activateUser(token);

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
