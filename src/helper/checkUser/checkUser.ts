import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../UserManagement/models/User';
import { PrepareOptions } from './PrepareOptions';
import { prepareServer } from './prepareServer';

export async function checkUser(
    data: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
    options: {
        validateUser: false;
        accesses?: undefined;
    },
): Promise<undefined>;

export async function checkUser(
    data: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
    options?: {
        validateUser: true;
        needsUser?: false;
        accesses?: undefined;
    },
): Promise<User | undefined>;
export async function checkUser(
    data: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
    options?:
        | {
              validateUser: true;
              needsUser: true;
              accesses?: undefined | string | string[];
          }
        | string
        | string[],
): Promise<User>;
export async function checkUser(
    {
        req,
        res,
    }: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
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
    const device = await prepareServer(req, res, realOptions);
    return device?.user;
}
