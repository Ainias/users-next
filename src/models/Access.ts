import { Column, Entity } from 'typeorm';
import { BaseModel } from '@ainias42/typeorm-helper';

@Entity('access')
export class Access extends BaseModel {
    @Column()
    name: string = '';

    @Column()
    description: string = '';
}
