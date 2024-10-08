/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner, TableForeignKey, TableIndex } from 'typeorm';

export class UsersFixIndices1725984579048 implements MigrationInterface {
    name = 'UsersFixIndices1725984579048';

    async up(queryRunner: QueryRunner) {
        await queryRunner.dropForeignKey('role__children', 'FK_roleChildren_childId');
        await queryRunner.dropForeignKey('role__children', 'FK_roleChildren_parentId');
        await queryRunner.dropForeignKey('role__access', 'FK_roleAccess_accessId');
        await queryRunner.dropForeignKey('role__access', 'FK_roleAccess_roleId');
        await queryRunner.dropForeignKey('user__role', 'FK_userRole_roleId');
        await queryRunner.dropForeignKey('user__role', 'FK_userRole_userId');

        await queryRunner.dropIndex('role__children', 'IDX_roleChildren_childId');
        await queryRunner.dropIndex('role__children', 'IDX_roleChildren_parentId');
        await queryRunner.dropIndex('role__access', 'IDX_roleAccess_accessId');
        await queryRunner.dropIndex('role__access', 'IDX_roleAccess_roleId');
        await queryRunner.dropIndex('user__role', 'IDX_userRole_roleId');
        await queryRunner.dropIndex('user__role', 'IDX_userRole_userId');

        await queryRunner.createIndex(
            'role__children',
            new TableIndex({
                name: 'IDX_role__children_childId',
                columnNames: ['childId'],
            }),
        );
        await queryRunner.createIndex(
            'role__children',
            new TableIndex({
                name: 'IDX_role__children_parentId',
                columnNames: ['parentId'],
            }),
        );
        await queryRunner.createIndex(
            'role__access',
            new TableIndex({
                name: 'IDX_role__access_roleId',
                columnNames: ['roleId'],
            }),
        );
        await queryRunner.createIndex(
            'role__access',
            new TableIndex({
                name: 'IDX_role__access_accessId',
                columnNames: ['accessId'],
            }),
        );
        await queryRunner.createIndex(
            'user__role',
            new TableIndex({
                name: 'IDX_user__role_userId',
                columnNames: ['userId'],
            }),
        );
        await queryRunner.createIndex(
            'user__role',
            new TableIndex({
                name: 'IDX_user__role_roleId',
                columnNames: ['roleId'],
            }),
        );

        await queryRunner.createForeignKey(
            'role__children',
            new TableForeignKey({
                name: 'FK_role__children_parentId',
                columnNames: ['parentId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'role__children',
            new TableForeignKey({
                name: 'FK_role__children_childId',
                columnNames: ['childId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
            }),
        );
        await queryRunner.createForeignKey(
            'role__access',
            new TableForeignKey({
                name: 'FK_role__access_roleId',
                columnNames: ['roleId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'role__access',
            new TableForeignKey({
                name: 'FK_role__access_accessId',
                columnNames: ['accessId'],
                referencedTableName: 'access',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'user__role',
            new TableForeignKey({
                name: 'FK_user__role_userId',
                columnNames: ['userId'],
                referencedTableName: 'user',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'user__role',
            new TableForeignKey({
                name: 'FK_user__role_roleId',
                columnNames: ['roleId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.dropForeignKey('role__children', 'FK_role__children_childId');
        await queryRunner.dropForeignKey('role__children', 'FK_role__children_parentId');
        await queryRunner.dropForeignKey('role__access', 'FK_role__access_accessId');
        await queryRunner.dropForeignKey('role__access', 'FK_role__access_roleId');
        await queryRunner.dropForeignKey('user__role', 'FK_user__role_roleId');
        await queryRunner.dropForeignKey('user__role', 'FK_user__role_userId');

        await queryRunner.dropIndex('role__children', 'IDX_role__children_childId');
        await queryRunner.dropIndex('role__children', 'IDX_role__children_parentId');
        await queryRunner.dropIndex('role__access', 'IDX_role__access_accessId');
        await queryRunner.dropIndex('role__access', 'IDX_role__access_roleId');
        await queryRunner.dropIndex('user__role', 'IDX_user__role_roleId');
        await queryRunner.dropIndex('user__role', 'IDX_user__role_userId');

        await queryRunner.createIndex(
            'role__children',
            new TableIndex({
                name: 'IDX_roleChildren_childId',
                columnNames: ['childId'],
            }),
        );
        await queryRunner.createIndex(
            'role__children',
            new TableIndex({
                name: 'IDX_roleChildren_parentId',
                columnNames: ['parentId'],
            }),
        );
        await queryRunner.createIndex(
            'role__access',
            new TableIndex({
                name: 'IDX_roleAccess_roleId',
                columnNames: ['roleId'],
            }),
        );
        await queryRunner.createIndex(
            'role__access',
            new TableIndex({
                name: 'IDX_roleAccess_accessId',
                columnNames: ['accessId'],
            }),
        );
        await queryRunner.createIndex(
            'user__role',
            new TableIndex({
                name: 'IDX_userRole_userId',
                columnNames: ['userId'],
            }),
        );
        await queryRunner.createIndex(
            'user__role',
            new TableIndex({
                name: 'IDX_userRole_roleId',
                columnNames: ['roleId'],
            }),
        );

        await queryRunner.createForeignKey(
            'role__children',
            new TableForeignKey({
                name: 'FK_roleChildren_parentId',
                columnNames: ['parentId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'role__children',
            new TableForeignKey({
                name: 'FK_roleChildren_childId',
                columnNames: ['childId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
            }),
        );
        await queryRunner.createForeignKey(
            'role__access',
            new TableForeignKey({
                name: 'FK_roleAccess_roleId',
                columnNames: ['roleId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'role__access',
            new TableForeignKey({
                name: 'FK_roleAccess_accessId',
                columnNames: ['accessId'],
                referencedTableName: 'access',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'user__role',
            new TableForeignKey({
                name: 'FK_userRole_userId',
                columnNames: ['userId'],
                referencedTableName: 'user',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'user__role',
            new TableForeignKey({
                name: 'FK_userRole_roleId',
                columnNames: ['roleId'],
                referencedTableName: 'role',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }
}
