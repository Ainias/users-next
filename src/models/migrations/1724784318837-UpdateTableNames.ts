/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableNames1724784318837 implements MigrationInterface {
    name = 'UpdateTableNames1724784318837';

    async up(queryRunner: QueryRunner) {
        await queryRunner.renameTable('roleAccess', 'role__access');
        await queryRunner.renameTable('roleChildren', 'role__children');
        await queryRunner.renameTable('userRole', 'user__role');
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.renameTable('role__access', 'roleAccess');
        await queryRunner.renameTable('role__children', 'roleChildren');
        await queryRunner.renameTable('user__role', 'userRole');
    }
}
