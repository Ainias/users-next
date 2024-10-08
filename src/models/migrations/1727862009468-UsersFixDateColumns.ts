/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersFixDateColumns1727862009468 implements MigrationInterface {
    name = 'UsersFixDateColumns1727862009468';

    async up(queryRunner: QueryRunner) {
        const queries = [
            'ALTER TABLE :table MODIFY COLUMN createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
            'ALTER TABLE :table MODIFY COLUMN updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)',
        ];

        const promises = queries.map(async (query) => {
            await queryRunner.query(query.replace(':table', 'access'));
            await queryRunner.query(query.replace(':table', 'role'));
            await queryRunner.query(query.replace(':table', 'user'));
            await queryRunner.query(query.replace(':table', 'device'));
        });

        await Promise.all(promises);
    }

    async down(queryRunner: QueryRunner) {
        const queries = [
            'ALTER TABLE :table MODIFY COLUMN createdAt datetime NOT NULL',
            'ALTER TABLE :table MODIFY COLUMN updatedAt datetime NOT NULL',
        ];

        const promises = queries.map(async (query) => {
            await queryRunner.query(query.replace(':table', 'access'));
            await queryRunner.query(query.replace(':table', 'role'));
            await queryRunner.query(query.replace(':table', 'user'));
            await queryRunner.query(query.replace(':table', 'device'));
        });

        await Promise.all(promises);
    }
}
