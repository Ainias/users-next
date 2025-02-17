import { User, UserType } from '../models/User';
import * as crypto from 'crypto';
import { EncryptJWT, jwtDecrypt, JWTPayload } from 'jose';
import { Device } from '../models/Device';
import { RoleManager } from './RoleManager';
import { ArrayHelper, DateHelper } from '@ainias42/js-helper';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Response } from 'express';
import { DeviceWithUser } from '../models/DeviceWithUser';
import { AuthorizationError } from './error/AuthorizationError';
import { UserTokenPayload } from './UserTokenPayload';
import { TokenError } from './error/TokenError';
import { TokenErrorCode } from './error/TokenErrorCode';
import { UserError } from './error/UserError';
import { UserErrorCode } from './error/UserErrorCode';

const defaultUserManagerConfig = {
    saltLength: 12,
    expiresIn: 60 * 60 * 24 * 7,
    activateTokenExpiresIn: 60 * 60 * 24,
    recheckPasswordAfterSeconds: 60 * 5,
    userNeedsToBeActivated: true,
    getTimestampInSeconds: () => Math.floor(DateHelper.now() / 1000),
};
export type UserManagerConfig = typeof defaultUserManagerConfig;

export class UserManager {
    private static instance: UserManager;
    private config = { ...defaultUserManagerConfig };
    private readonly pepper: string;
    private readonly jwtSecret: string;

    private constructor(pepper: string, jwtSecret: string, config: Partial<UserManagerConfig> = {}) {
        this.config = { ...defaultUserManagerConfig, ...config };
        this.pepper = pepper;
        this.jwtSecret = jwtSecret;
    }

    static getInstance() {
        if (!this.instance) {
            if (!process.env.USERS_NEXT_PEPPER || !process.env.USERS_NEXT_JWT_SECRET) {
                throw new Error(
                    'You need to set USERS_NEXT_PEPPER and USERS_NEXT_JWT_SECRET env variables for this module to work!',
                );
            }
            this.instance = new UserManager(process.env.USERS_NEXT_PEPPER, process.env.USERS_NEXT_JWT_SECRET);
        }
        return this.instance;
    }

    static setToken(token: string, userId: number, res: Response) {
        const time = 1000 * 60 * 60 * 24 * 7;

        // HTTP-Only or a XXS attack can steal the token
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: time,
            secure: process.env.NODE_ENV !== 'development',
        });

        res.cookie('userId', userId, {
            httpOnly: false,
            maxAge: time,
            secure: process.env.NODE_ENV !== 'development',
        });
    }

    static deleteToken(res: Response) {
        res.clearCookie('token');
        res.clearCookie('userId');
    }

    static getTokenPayload(device: Device) {
        return {
            deviceId: device.id,
            userAgent: device.userAgent,
            lastActive: device.lastActive.toISOString(),
            deviceUpdatedAt: device.updatedAt?.toISOString(),
            deviceCreatedAt: device.createdAt?.toISOString(),
            deviceDeletedAt: device.deletedAt?.toISOString(),

            userId: device.user?.id ?? -1,
            passwordHash: device.user?.password ?? '',
            email: device.user?.email ?? '',
            username: device.user?.username ?? '',
            activated: device.user?.activated ?? false,
            blocked: device.user?.blocked ?? false,
            userUpdatedAt: device.user?.updatedAt?.toISOString(),
            userCreatedAt: device.user?.createdAt?.toISOString(),
            userDeletedAt: device.user?.deletedAt?.toISOString(),
        };
    }

    static async findAccessesForUserId(userId: number) {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId }, relations: ['roles', 'roles.accesses'] });
        if (!user?.roles) {
            return [];
        }
        const accessesForRoles = ArrayHelper.noUndefined(
            await Promise.all(user.roles.map((role) => RoleManager.findAccessesForRole(role))),
        );
        return accessesForRoles.flat();
    }

    static async hasAccesses(userId: number, accessNames: string[]) {
        const accesses = (await UserManager.findAccessesForUserId(userId)).map((a) => a.name);
        const accessSet = new Set(accesses);
        return accessNames.every((a) => accessSet.has(a));
    }

    hashPassword(user: User, password: string) {
        if (!this.pepper) {
            throw new Error('hashPassword: No pepper defined!');
        }

        if (!user.salt) {
            user.salt = this.generateSalt();
        }
        const hash = crypto.createHmac('sha512', user.salt + this.pepper);
        hash.update(password);
        return hash.digest('hex');
    }

    generateTokenFor(device: Device) {
        return new EncryptJWT(UserManager.getTokenPayload(device))
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt(this.config.getTimestampInSeconds())
            .setExpirationTime(this.config.getTimestampInSeconds() + this.config.expiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateActivateToken(user: User) {
        return new EncryptJWT({ type: 'activate', userId: user.id, version: user.version })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt(this.config.getTimestampInSeconds())
            .setExpirationTime(this.config.getTimestampInSeconds() + this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateResetPasswordToken(user: User) {
        return new EncryptJWT({ type: 'reset-password', userId: user.id, version: user.version })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt(this.config.getTimestampInSeconds())
            .setExpirationTime(this.config.getTimestampInSeconds() + this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateChangeEmailToken(user: User, newEmail: string) {
        return new EncryptJWT({ type: 'change-email', userId: user.id, version: user.version, newEmail })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt(this.config.getTimestampInSeconds())
            .setExpirationTime(this.config.getTimestampInSeconds() + this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateKeepEmailToken(user: User) {
        return new EncryptJWT({ type: 'keep-email', userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt(this.config.getTimestampInSeconds())
            .setExpirationTime(this.config.getTimestampInSeconds() + this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    async validateToken(token: string) {
        let payload: JWTPayload & ReturnType<typeof UserManager.getTokenPayload>;
        try {
            const data = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret), {
                currentDate: new Date(this.config.getTimestampInSeconds() * 1000),
            })) as unknown as {
                payload: JWTPayload & ReturnType<typeof UserManager.getTokenPayload>;
            };
            payload = data.payload;
        } catch (error) {
            if (typeof error === 'object' && error?.name === 'JWTExpired') {
                throw new AuthorizationError('Token expired', true);
            }
            throw error;
        }
        const nowInSeconds = this.config.getTimestampInSeconds();

        if (nowInSeconds - (payload.iat ?? 0) > this.config.recheckPasswordAfterSeconds) {
            const findOptions = {
                where: {
                    id: payload.deviceId,
                    user: {
                        id: payload.userId,
                        password: payload.passwordHash,
                        blocked: false,
                        activated: this.config.userNeedsToBeActivated ? true : undefined,
                    },
                },
                relations: ['user'],
            };

            const deviceRepository = getRepository(Device);
            const device = await deviceRepository.findOne(findOptions);

            if (!device) {
                throw new AuthorizationError('Wrong token given', true);
            }
            device.lastActive = new Date(this.config.getTimestampInSeconds() * 1000);
            await deviceRepository.save(device);
            return [await this.generateTokenFor(device), device as DeviceWithUser] as const;
        }

        const device = new Device();
        device.id = payload.deviceId;
        device.userAgent = payload.userAgent;
        device.lastActive = new Date(payload.lastActive);
        device.deletedAt = payload.deviceDeletedAt ? new Date(payload.deviceDeletedAt) : null;
        device.createdAt = new Date(payload.deviceCreatedAt ?? 0);
        device.updatedAt = new Date(payload.deviceUpdatedAt ?? 0);

        device.user = new User();
        device.user.id = payload.userId;
        device.user.password = payload.passwordHash;
        device.user.email = payload.email;
        device.user.username = payload.username;
        device.user.activated = payload.activated;
        device.user.blocked = payload.blocked;

        device.user.deletedAt = payload.userDeletedAt ? new Date(payload.userDeletedAt) : null;
        device.user.createdAt = new Date(payload.userCreatedAt ?? 0);
        device.user.updatedAt = new Date(payload.userUpdatedAt ?? 0);

        return [token, device as DeviceWithUser] as const;
    }

    async handleToken(token: string) {
        let payload: UserTokenPayload;
        try {
            const data = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret), {
                currentDate: new Date(this.config.getTimestampInSeconds() * 1000),
            })) as unknown as {
                payload: UserTokenPayload;
            };
            payload = data.payload;
        } catch (error) {
            console.error(error);
            throw new TokenError(TokenErrorCode.TOKEN_EXPIRED, 'Token is expired!');
        }

        if (payload.type !== 'activate' && payload.type !== 'change-email' && payload.type !== 'keep-email') {
            throw new TokenError(TokenErrorCode.WRONG_TYPE, 'Wrong token type');
        }
        const userRepository = getRepository(User);
        const user = await userRepository.findOneBy({ id: payload.userId });

        if (!user) {
            throw new TokenError(TokenErrorCode.USER_NOT_FOUND, 'User not found');
        }

        if (payload.version && user.version !== payload.version) {
            throw new TokenError(TokenErrorCode.TOKEN_EXPIRED, 'Token is expired!');
        }

        switch (payload.type) {
            case 'activate': {
                if (user.blocked) {
                    throw new TokenError(TokenErrorCode.USER_BLOCKED, 'User is blocked!');
                }
                user.activated = true;
                break;
            }
            case 'change-email': {
                if (user.blocked) {
                    throw new TokenError(TokenErrorCode.USER_BLOCKED, 'User is blocked!');
                }
                user.email = payload.newEmail;
                break;
            }
            case 'keep-email': {
                // Update updatedAt in order to increase version, when email is not changed
                // version-update invalidates other email-changing tokens
                user.email = payload.email;
                user.updatedAt = new Date(this.config.getTimestampInSeconds() * 1000);
                break;
            }
        }

        await userRepository.save(user);
        return { user, tokenType: payload.type };
    }

    async changePassword(user: UserType, oldPassword: string, newPassword: string) {
        if (this.hashPassword(user, oldPassword) !== user.password) {
            throw new UserError(UserErrorCode.WRONG_PASSWORD, 'Wrong password!');
        }

        // Reset salt to renew it
        user.salt = '';
        user.password = this.hashPassword(user, newPassword);

        const userRepository = getRepository(User);
        await userRepository.save(user);
        return user;
    }

    async resetPassword(token: string, newPassword: string) {
        let payload: (JWTPayload & { type: 'reset-password'; userId: number; version: number }) | undefined;
        try {
            const tokenData = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret), {
                currentDate: new Date(this.config.getTimestampInSeconds() * 1000),
            })) as unknown as {
                payload: JWTPayload & { type: 'reset-password'; userId: number; version: number };
            };
            payload = tokenData.payload;
        } catch (error) {
            throw new TokenError(TokenErrorCode.TOKEN_EXPIRED, 'Token is expired!');
        }
        if (payload.type !== 'reset-password') {
            throw new TokenError(TokenErrorCode.WRONG_TYPE, 'Wrong token type');
        }

        const userRepository = getRepository(User);
        const user = await userRepository.findOneBy({ id: payload.userId });

        if (!user) {
            throw new TokenError(TokenErrorCode.USER_NOT_FOUND, 'User not found');
        }

        if (user.version !== payload.version) {
            throw new TokenError(TokenErrorCode.TOKEN_EXPIRED, 'Token is expired!');
        }

        if (user.blocked) {
            throw new TokenError(TokenErrorCode.USER_BLOCKED, 'User is blocked!');
        }

        // Activate user for those, where the user lost the activation mail
        user.activated = true;

        // Reset salt to renew it
        user.salt = '';
        user.password = this.hashPassword(user, newPassword);
        await userRepository.save(user);
        return user;
    }

    private generateSalt() {
        const length = this.config.saltLength;
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
}
