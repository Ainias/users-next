import { SyncModel } from '@ainias42/typeorm-sync';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GlobalRef } from '../../GlobalRef';
import { User, UserType } from './User';

@Entity('device')
class Device extends SyncModel {
    @Column()
    userAgent: string;

    @Column()
    lastActive: Date;

    @ManyToOne(() => User, (user: UserType) => user.devices, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
    })
    user?: UserType;
}

const Saved = new GlobalRef<typeof Device>('model.Device');
if (!Saved.value()) {
    Saved.setValue(Device);
}
const GlobalDevice = Saved.typedValue();
type GlobalDevice = Device;
export { GlobalDevice as Device };
