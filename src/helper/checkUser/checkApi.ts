import type { Request, Response } from 'express';
import { PrepareOptions } from './PrepareOptions';
import { checkServer } from './checkServer';
import { DeviceWithUser } from '../../models/DeviceWithUser';

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
