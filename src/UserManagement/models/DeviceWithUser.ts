import { Device } from './Device';
import { User } from './User';

export type DeviceWithUser = Device & { user: User };
