import { UserManager } from '../../UserManagement/UserManager';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage, ServerResponse } from 'http';
import { PrepareOptions } from './PrepareOptions';
import { setServerUser } from '../../UserManagement/useUser';
import { AuthorizationError } from '../../UserManagement/error/AuthorizationError';

export async function checkServer(
    req: NextApiRequest | IncomingMessage,
    res: NextApiResponse | ServerResponse,
    options: PrepareOptions,
) {
    if (options.validateUser) {
        const userManager = UserManager.getInstance();
        const token = getCookie('token', { req, res }) as string;
        if (token) {
            try {
                const [newToken, device] = await userManager.validateToken(token);
                UserManager.setToken(newToken, device.user?.id ?? -1, req, res);

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
                if (device?.user) {
                    setServerUser(device.user);
                }

                return device;
            } catch (e) {
                console.error('Got token error', e);
                // Authorisation error should not delete the token, as the user is the user, but does not have the correct rights
                if (!(e instanceof AuthorizationError)) {
                    UserManager.deleteToken(req, res);
                }
                throw e;
            }
        } else {
            UserManager.deleteToken(req, res);
            if (options.needsUser) {
                throw new Error('route needs user, but no token given');
            }
        }
    }
    return undefined;
}
