import { UserManager } from '../UserManagement/UserManager';
import type { Request } from 'express';

export async function getDeviceFromRequest(req: Request) {
    const userManager = UserManager.getInstance();

    if (!req.cookies) {
        throw new Error('No cookies found in request. Are you sure you are using cookie-parser?');
    }

    const {token} = req.cookies;

    if (token) {
        if (req.device) {
            return [token, req.device] as const;
        }

        const [newToken, device] = await userManager.validateToken(token);
        req.device = device;
        return [newToken, device] as const;
    }
    return undefined;
}
