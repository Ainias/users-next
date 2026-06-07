import type { Device } from './Device';
import type { User } from './User';

export type DeviceWithUser = Device & { user: User };
