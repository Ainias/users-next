import { NextApiRequest, NextApiResponse } from 'next';
import { waitForSyncRepository } from '@ainias42/typeorm-sync';
import { User } from '../models/User';
import { UserManager } from '../UserManager';
import { Device } from '../models/Device';

export type LoginResponseData =
    | {
          success: true;
          user: User;
          accesses: string[];
      }
    | {
          success: false;
          message: string;
      };

export async function login(
    email: string,
    password: string,
    {
        req,
        res,
    }: {
        req: NextApiRequest;
        res: NextApiResponse<LoginResponseData>;
    },
) {
    const userRepository = await waitForSyncRepository(User);
    const user = await userRepository.findOneBy({ email: email.toLowerCase(), activated: true, blocked: false });
    const userManager = UserManager.getInstance();

    let token;
    if (user && userManager.hashPassword(user, password) === user.password) {
        // Logged in
        const device = new Device();
        device.user = user;
        device.userAgent = req.headers['user-agent'] ?? '';
        device.lastActive = new Date();

        const deviceRepository = await waitForSyncRepository(Device);
        await deviceRepository.save(device);

        token = await userManager.generateTokenFor(device);
    }

    if (token && user) {
        UserManager.setToken(token, user.id ?? -1, req, res);
        const accesses = (await UserManager.findAccessesForUserId(user?.id ?? -1)).map((a) => a.name);

        res.status(200).json({
            success: true,
            user,
            accesses,
        });
    } else {
        UserManager.deleteToken(req, res);
        res.status(403).json({
            success: false,
            message: 'wrong email or password',
        });
    }
}
