import { checkServer } from './checkServer';
import type { DeviceWithUser } from '../../models/DeviceWithUser';
import type { PrepareOptions } from './PrepareOptions';
import type { Request, Response } from 'express';

const defaultCheckApiOptions: PrepareOptions = { validateUser: true };

export async function checkApi(
    data: {
        req: Request;
        res: Response;
    },
    options: {
        validateUser: false;
        needsUser?: false;
        accesses?: undefined;
    },
): Promise<undefined>;

export async function checkApi(
    data: {
        req: Request;
        res: Response;
    },
    options?: {
        validateUser: true;
        needsUser?: false;
        accesses?: undefined;
    },
): Promise<DeviceWithUser | undefined>;
export async function checkApi(
    data: {
        req: Request;
        res: Response;
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
        req: Request;
        res: Response;
    },
    options: PrepareOptions | string | string[] = defaultCheckApiOptions,
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
