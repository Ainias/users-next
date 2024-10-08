/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersFixRoleParentChild1726038264578 implements MigrationInterface {
    name = 'UsersFixRoleParentChild1726038264578';

    async up(queryRunner: QueryRunner) {
        await queryRunner.renameColumn('role__children', 'childId', 'tmpNameId');
        await queryRunner.renameColumn('role__children', 'parentId', 'childId');
        await queryRunner.renameColumn('role__children', 'tmpNameId', 'parentId');
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.renameColumn('role__children', 'childId', 'tmpNameId');
        await queryRunner.renameColumn('role__children', 'parentId', 'childId');
        await queryRunner.renameColumn('role__children', 'tmpNameId', 'parentId');
    }
}
