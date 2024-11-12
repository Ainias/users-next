import { getRepository } from '@ainias42/typeorm-helper';
import { User } from '../../../models/User';
import { UserManager } from '../../UserManager';

export async function generateChangeEmailToken(user: User, newEmail: string) {
    const userRepository = await getRepository(User);

    const otherUser = await userRepository.findOneBy({ email: newEmail });
    if (otherUser) {
        // TODO Better error
        throw new Error('New E-Mail has already an account');
    }

    const userManager = UserManager.getInstance();
    const token = await userManager.generateChangeEmailToken(user, newEmail);
    const keepEmailToken = await userManager.generateKeepEmailToken(user);
    return { token, user, keepEmailToken };
}
