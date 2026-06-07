import { BaseModel } from '@ainias42/typeorm-helper';
import { Column, Entity } from 'typeorm';

@Entity('access')
export class Access extends BaseModel {
    @Column()
    name: string = '';

    @Column()
    description: string = '';
}
