import { Role } from './models/Role';
import { getSyncRepository } from '@ainias42/typeorm-sync';
import { ArrayHelper } from '@ainias42/js-helper';
import { Access } from './models/Access';

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

        const roleRepository = getSyncRepository(Role);
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
