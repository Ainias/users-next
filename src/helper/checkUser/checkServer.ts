import { UserManager } from '../../UserManagement/UserManager';
import { PrepareOptions } from './PrepareOptions';
import { AuthorizationError } from '../../UserManagement/error/AuthorizationError';
import type { Request, Response } from 'express';
import { getDeviceFromRequest } from '../getDeviceFromRequest';

export async function checkServer(req: Request, res: Response, options: PrepareOptions) {
    if (options.validateUser) {
        const newTokenData = await getDeviceFromRequest(req);

        if (newTokenData) {
            try {
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
                        );
                    }
                }

                return device;
            } catch (e) {
                console.error('Got token error', e);
                // Authorisation error should not delete the token, as the user is the user, but does not have the correct rights
                if (!(e instanceof AuthorizationError)) {
                    UserManager.deleteToken(res);
                }
                throw e;
            }
        } else {
            UserManager.deleteToken(res);
            if (options.needsUser) {
                throw new AuthorizationError('route needs user, but no token given');
            }
        }
    }
    return undefined;
}
