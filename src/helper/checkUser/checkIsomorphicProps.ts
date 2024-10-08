import { PrepareOptions } from './PrepareOptions';
import { checkServer } from './checkServer';
import { useUserData } from '../../UserManagement/useUserData';
import { User } from '../../models/User';
import type { Request, Response } from 'express';

export async function checkIsomorphicProps(
    data: { req?: Request; res?: Response },
    options: {
        validateUser: false;
        accesses?: undefined;
    },
): Promise<undefined>;

export async function checkIsomorphicProps(
    data: { req?: Request; res?: Response },
    options?: {
        validateUser: true;
        needsUser?: false;
        accesses?: undefined;
    },
): Promise<User | undefined>;
export async function checkIsomorphicProps(
    data: { req?: Request; res?: Response },
    options?:
        | {
              validateUser: true;
              needsUser: true;
              accesses?: undefined | string | string[];
          }
        | string
        | string[],
): Promise<User>;

export async function checkIsomorphicProps(
    { req, res }: { req?: Request; res?: Response },
    options: PrepareOptions | string | string[] = { validateUser: true },
) {
    const realOptions: PrepareOptions =
        typeof options === 'string' || Array.isArray(options)
            ? {
                  validateUser: true,
                  needsUser: true,
                  accesses: options,
              }
            : options;

    // Server
    if (req && res) {
        const device = await checkServer(req, res, realOptions);
        return device?.user;
    }

    // Client
    if (realOptions.validateUser && realOptions.needsUser && !useUserData.getState().getUser()) {
        // TODO change error to UserError/ValidationError
        throw new Error('user not logged in, but route need logged in user!');
    }
    if (realOptions.accesses) {
        const neededAccesses = Array.isArray(realOptions.accesses) ? realOptions.accesses : [realOptions.accesses];
        const accessSet = new Set(useUserData.getState().getAccesses());
        if (neededAccesses.some((a) => !accessSet.has(a))) {
            throw new Error(
                `user needed accesses '${neededAccesses.join("', '")}' but got accesses '${useUserData
                    .getState()
                    .getAccesses()
                    .join("', '")}'`,
            );
        }
    }
    return useUserData.getState().getUser();
}
