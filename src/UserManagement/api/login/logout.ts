import type { Request, Response } from 'express';
import { UserManager } from '../../UserManager';
import { checkApi } from '../../../helper/checkUser/checkApi';
import { Device } from '../../../models/Device';
import { getRepository } from '@ainias42/typeorm-helper';

export async function logout({ req, res }: { req: Request; res: Response }) {
    const device = await checkApi({ req, res }, { validateUser: true, needsUser: true });

    const deviceRepository = await getRepository(Device);
    await deviceRepository.remove(device);
    UserManager.deleteToken(res);
}
