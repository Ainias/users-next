import { User } from '../../../models/User';
import { UserManager } from '../../UserManager';
import { getRepository } from '@ainias42/typeorm-helper';

export async function generateResetPasswordToken(email: string) {
    const userRepository = await getRepository(User);
    const user = await userRepository.findOneBy({ email });
    if (!user) {
        // TODO Better error
        throw new Error('User not found');
    }

    const userManager = UserManager.getInstance();
    const token = await userManager.generateResetPasswordToken(user);
    return { token, user };
}
