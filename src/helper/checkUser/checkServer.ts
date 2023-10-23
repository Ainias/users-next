import { UserManager } from '../../UserManagement/UserManager';
import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage, ServerResponse } from 'http';
import { PrepareOptions } from './PrepareOptions';
import { setServerUser } from '../../UserManagement/useUser';

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
                UserManager.setToken(newToken, req, res);

                // TODO cache accesses?
                if (options.accesses) {
                    const neededAccesses = Array.isArray(options.accesses) ? options.accesses : [options.accesses];
                    const accesses = (await UserManager.findAccessesForUserId(device.user?.id ?? -1)).map(
                        (a) => a.name,
                    );
                    const accessSet = new Set(accesses);
                    if (neededAccesses.some((a) => !accessSet.has(a))) {
                        throw new Error(
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
                throw e;
            }
        } else if (options.needsUser) {
            throw new Error('route needs user, but no token given');
        }
    }
    return undefined;
}
