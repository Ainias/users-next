import { DeviceWithUser } from './models/DeviceWithUser';

declare module 'express' {
    interface Request {
        device?: DeviceWithUser;
    }
}

export const USERS_NEXT_TYPES = 0;
