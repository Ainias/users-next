import type { User } from './User';

export type UserJson = Omit<User, 'toJSON'>;
