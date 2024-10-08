import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Role } from './Role';
import { Device } from './Device';
import { BaseModel } from '@ainias42/typeorm-helper';

@Entity('user')
export class User extends BaseModel {
    @Column({ unique: true })
    username: string = '';

    @Column({ unique: true })
    email: string = '';

    @Column()
    password: string = '';

    @Column()
    activated: boolean = false;

    @Column()
    blocked: boolean = false;

    @Column()
    salt: string = '';

    @ManyToMany(() => Role)
    @JoinTable({ name: 'user__role' })
    roles?: Role[];

    @OneToMany(() => Device, (device) => device.user)
    devices?: Device[];

    toJSON() {
        return {
            ...this,
            password: '',
            salt: '',
        };
    }
}

export type UserType = User;
