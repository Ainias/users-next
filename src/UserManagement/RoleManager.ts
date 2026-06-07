import { ArrayHelper } from '@ainias42/js-helper';
import { Role } from '../models/Role';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Access } from '../models/Access';

export class RoleManager {
    private static instance: RoleManager;

    static getInstance() {
        if (!RoleManager.instance) {
            RoleManager.instance = new RoleManager();
        }
        return RoleManager.instance;
    }

    static async findAccessesForRole(role: Role): Promise<Access[]> {
        const { accesses, id } = role;

        const roleRepository = getRepository(Role);
        const parentRoles = await roleRepository.find({
            where: { children: { id } },
            relations: { accesses: true },
        });
        const parentAccesses = await Promise.all(
            parentRoles.map(async (parentRole) => RoleManager.findAccessesForRole(parentRole)),
        );

        return [...(accesses ?? []), ...ArrayHelper.noUndefined(parentAccesses).flat()];
    }
}
