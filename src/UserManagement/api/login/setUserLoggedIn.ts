import { Device } from '../../../models/Device';
import { UserManager } from '../../UserManager';
import { User } from '../../../models/User';
import type { Request, Response } from 'express';
import { getRepository } from '@ainias42/typeorm-helper';

export async function setUserLoggedIn(user: User, req: Request, res: Response) {
    const device = new Device();
    device.user = user;
    device.userAgent = req.headers['user-agent'] ?? '';
    device.lastActive = new Date();

    const deviceRepository = getRepository(Device);
    await deviceRepository.save(device);

    const userManager = UserManager.getInstance();
    const token = await userManager.generateTokenFor(device);
    UserManager.setToken(token, user.id ?? -1, res);
    return (await UserManager.findAccessesForUserId(user?.id ?? -1)).map((a) => a.name);
}
