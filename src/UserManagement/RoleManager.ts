import { Role } from '../models/Role';
import { ArrayHelper } from '@ainias42/js-helper';
import { Access } from '../models/Access';
import { getRepository } from '@ainias42/typeorm-helper';

export class RoleManager {
    private static instance: RoleManager;

    static getInstance() {
        if (!RoleManager.instance) {
            RoleManager.instance = new RoleManager();
        }
        return RoleManager.instance;
    }

    static async findAccessesForRole(role: Role): Promise<Access[]> {
        const { accesses } = role;

        const roleRepository = getRepository(Role);
        const parentRoles = await roleRepository.find({
            where: { children: { id: role.id } },
            relations: ['accesses'],
        });
        const parentAccesses = await Promise.all(
            parentRoles.map(async (parentRole) => RoleManager.findAccessesForRole(parentRole)),
        );

        return [...(accesses ?? []), ...ArrayHelper.noUndefined(parentAccesses).flat()];
    }
}
