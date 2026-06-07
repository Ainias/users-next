import { DateHelper } from '@ainias42/js-helper';
import { Device } from '../../../models/Device';
import { UserManager } from '../../UserManager';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Request, Response } from 'express';
import type { User } from '../../../models/User';

export async function setUserLoggedIn(user: User, req: Request, res: Response) {
    const device = new Device();
    device.user = user;
    device.userAgent = req.headers['user-agent'] ?? '';
    device.lastActive = DateHelper.newDate();

    const deviceRepository = getRepository(Device);
    await deviceRepository.save(device);

    const userManager = UserManager.getInstance();
    const token = await userManager.generateTokenFor(device);
    UserManager.setToken(token, user.id ?? -1, res);
    const accesses = await UserManager.findAccessesForUserId(user?.id ?? -1);
    return accesses.map((a) => a.name);
}
