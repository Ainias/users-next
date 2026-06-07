import { AuthorizationError } from '../../UserManagement/error/AuthorizationError';
import { UserManager } from '../../UserManagement/UserManager';
import { getDeviceFromRequest } from '../getDeviceFromRequest';
import type { PrepareOptions } from './PrepareOptions';
import type { Request, Response } from 'express';

export async function checkServer(req: Request, res: Response, options: PrepareOptions) {
    if (options.validateUser) {
        try {
            const newTokenData = await getDeviceFromRequest(req);

            if (newTokenData) {
                const [newToken, device] = newTokenData;
                UserManager.setToken(newToken, device.user?.id ?? -1, res);
                if (options.accesses) {
                    const neededAccesses = Array.isArray(options.accesses) ? options.accesses : [options.accesses];
                    if (!(await UserManager.hasAccesses(device.user?.id ?? 1, neededAccesses))) {
                        const userAccesses = await UserManager.findAccessesForUserId(device.user?.id ?? -1);
                        const accesses = userAccesses.map((a) => a.name);
                        throw new AuthorizationError(
                            `user with id ${device.user?.id} needed accesses '${neededAccesses.join(
                                "', '",
                            )}' but got accesses '${accesses.join("', '")}'`,
                            false,
                        );
                    }
                }

                return device;
            }

            if (options.needsUser) {
                throw new AuthorizationError('route needs user, but no token given', true);
            }
        } catch (error) {
            if (error instanceof AuthorizationError && error.isLoggedOut) {
                UserManager.deleteToken(res);
            }

            if (options.needsUser || error instanceof AuthorizationError) {
                throw error;
            } else {
                console.error('Error while validating user', error);
            }
        }
    }
    return undefined;
}
