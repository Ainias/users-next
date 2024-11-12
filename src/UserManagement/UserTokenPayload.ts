import { JWTPayload } from 'jose';

export type ActivateUserTokenPayload = JWTPayload & { type: 'activate'; userId: number; version: number };
export type ChangeEmailTokenPayload = JWTPayload & {
    type: 'change-email';
    userId: number;
    version: number;
    newEmail: string;
};
export type KeepEmailTokenPayload = JWTPayload & { type: 'keep-email'; userId: number; email: string };
export type UserTokenPayload = ActivateUserTokenPayload | ChangeEmailTokenPayload | KeepEmailTokenPayload;
