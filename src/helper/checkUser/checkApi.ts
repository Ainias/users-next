import { NextApiRequest, NextApiResponse } from 'next';
import { PrepareOptions } from './PrepareOptions';
import { checkServer } from './checkServer';
import { DeviceWithUser } from '../../UserManagement/models/DeviceWithUser';

export async function checkApi(
    data: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
    options: {
        validateUser: false;
        accesses?: undefined;
    },
): Promise<undefined>;

export async function checkApi(
    data: {
        req: NextApiRequest;
        res: NextApiResponse;
    },
    options?: {
        validateUser: true;
        needsUser?: false;
        accesses?: undefined;
    },
): Promise<DeviceWithUser | undefined>;
export async function checkApi(
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
): Promise<DeviceWithUser>;
export async function checkApi(
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
    return checkServer(req, res, realOptions);
}
