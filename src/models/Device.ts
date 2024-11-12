import { Column, Entity, ManyToOne } from 'typeorm';
import { User, type UserType } from './User';
import { BaseModel } from '@ainias42/typeorm-helper';
import { DateHelper } from '@ainias42/js-helper';

@Entity('device')
export class Device extends BaseModel {
    @Column()
    userAgent: string = '';

    @Column()
    lastActive: Date = DateHelper.newDate();

    @ManyToOne(() => User, (user) => user.devices, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
    })
    user?: UserType;
}
