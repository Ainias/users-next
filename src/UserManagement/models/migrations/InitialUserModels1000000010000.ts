/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { getCreateTableColumns } from '@ainias42/typeorm-sync';

export class InitialUserModels1000000010000 implements MigrationInterface {
    async up(queryRunner: QueryRunner) {
        await queryRunner.createTable(
            new Table({
                name: 'access',
                columns: [
                    ...getCreateTableColumns(),
                    { name: 'name', type: 'varchar', isNullable: false },
                    { name: 'description', type: 'varchar', isNullable: false },
                ],
            }),
        );
        await queryRunner.createTable(
            new Table({
                name: 'role',
                columns: [
                    ...getCreateTableColumns(),
                    { name: 'name', type: 'varchar', isNullable: false },
                    { name: 'description', type: 'varchar', isNullable: false },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'roleAccess',
                columns: [
                    {
                        name: 'roleId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                    {
                        name: 'accessId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['roleId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'role',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                    {
                        columnNames: ['accessId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'access',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                ],
                indices: [
                    {
                        columnNames: ['roleId'],
                    },
                    {
                        columnNames: ['accessId'],
                    },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'roleChildren',
                columns: [
                    {
                        name: 'parentId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                    {
                        name: 'childId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['parentId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'role',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                    {
                        columnNames: ['childId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'role',
                    },
                ],
                indices: [
                    {
                        columnNames: ['parentId'],
                    },
                    {
                        columnNames: ['childId'],
                    },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'user',
                columns: [
                    ...getCreateTableColumns(),
                    { name: 'username', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'password', type: 'varchar', isNullable: false },
                    { name: 'email', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'salt', type: 'varchar', isNullable: false },
                    { name: 'activated', type: 'tinyint', isNullable: false },
                    { name: 'blocked', type: 'tinyint', isNullable: false },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'userRole',
                columns: [
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                    {
                        name: 'roleId',
                        type: 'int',
                        isNullable: false,
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['userId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'user',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                    {
                        columnNames: ['roleId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'role',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                ],
                indices: [
                    {
                        columnNames: ['userId'],
                    },
                    {
                        columnNames: ['roleId'],
                    },
                ],
            }),
        );

        await this.addDeviceTable(queryRunner);
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.dropTable('roleChildren');
        await queryRunner.dropTable('roleAccess');
        await queryRunner.dropTable('userRole');
        await queryRunner.dropTable('device');
        await queryRunner.dropTable('user');
        await queryRunner.dropTable('role');
        await queryRunner.dropTable('access');
    }

    protected async addDeviceTable(queryRunner: QueryRunner) {
        await queryRunner.createTable(
            new Table({
                name: 'device',
                columns: [
                    ...getCreateTableColumns(),
                    { name: 'userAgent', type: 'varchar', isNullable: false },
                    { name: 'lastActive', type: 'datetime', isNullable: false },
                    { name: 'userId', type: 'int', isNullable: false },
                ],
                foreignKeys: [
                    {
                        columnNames: ['userId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'user',
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                    },
                ],
            }),
        );
    }
}
