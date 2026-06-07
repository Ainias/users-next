import { Device } from '../../../models/Device';
import { UserManager } from '../../UserManager';
import { checkApi } from '../../../helper/checkUser/checkApi';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Request, Response } from 'express';

export async function logout({ req, res }: { req: Request; res: Response }) {
    const device = await checkApi({ req, res }, { validateUser: true, needsUser: true });

    const deviceRepository = await getRepository(Device);
    await deviceRepository.remove(device);
    UserManager.deleteToken(res);
}
