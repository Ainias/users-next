import { UserManager } from '../../UserManagement/UserManager';
import { PrepareOptions } from './PrepareOptions';
import { AuthorizationError } from '../../UserManagement/error/AuthorizationError';
import type { Request, Response } from 'express';
import { getDeviceFromRequest } from '../getDeviceFromRequest';

export async function checkServer(req: Request, res: Response, options: PrepareOptions) {
    if (options.validateUser) {
        try {
            const newTokenData = await getDeviceFromRequest(req);

            if (newTokenData) {
                const [newToken, device] = newTokenData;
                UserManager.setToken(newToken, device.user?.id ?? -1, res);
                // TODO cache accesses?
                if (options.accesses) {
                    const neededAccesses = Array.isArray(options.accesses) ? options.accesses : [options.accesses];
                    if (!(await UserManager.hasAccesses(device.user?.id ?? 1, neededAccesses))) {
                        const accesses = (await UserManager.findAccessesForUserId(device.user?.id ?? -1)).map(
                            (a) => a.name,
                        );
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
        } catch (e) {
            if (e instanceof AuthorizationError && e.isLoggedOut) {
                UserManager.deleteToken(res);
            }
            throw e;
        }
    }
    return undefined;
}
