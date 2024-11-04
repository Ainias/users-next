import { UserManager } from '../../UserManager';
import { setUserLoggedIn } from '../login/setUserLoggedIn';
import type { Request, Response } from 'express';

export type ChangeEmailOptions =
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

export async function changeEmail(token: string, options?: ChangeEmailOptions) {
    const userManager = UserManager.getInstance();
    const user = await userManager.changeEmail(token);

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
