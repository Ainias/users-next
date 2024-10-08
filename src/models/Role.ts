import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Access } from './Access';
import { BaseModel } from '@ainias42/typeorm-helper';

@Entity('role')
export class Role extends BaseModel {
    @Column()
    name: string = '';

    @Column()
    description: string = '';

    @ManyToMany(() => Role, (role) => role.children)
    @JoinTable({
        name: 'role__children',
        joinColumn: { name: 'childId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'parentId', referencedColumnName: 'id' },
    })
    parents?: Role[];

    @ManyToMany(() => Role, (role) => role.parents)
    children?: Role[];

    @ManyToMany(() => Access)
    @JoinTable({ name: 'role__access' })
    accesses?: Access[];
}
