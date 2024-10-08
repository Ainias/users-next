import { User } from '../models/User';
import * as crypto from 'crypto';
import { EncryptJWT, jwtDecrypt, JWTPayload } from 'jose';
import { Device } from '../models/Device';
import { RoleManager } from './RoleManager';
import { ArrayHelper } from '@ainias42/js-helper';
import { getRepository } from '@ainias42/typeorm-helper';
import type { Response } from 'express';
import { DeviceWithUser } from '../models/DeviceWithUser';

const defaultUserManagerConfig = {
    saltLength: 12,
    expiresIn: '7d',
    activateTokenExpiresIn: '1d',
    recheckPasswordAfterSeconds: 60 * 5,
    userNeedsToBeActivated: true,
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
            .setIssuedAt()
            .setExpirationTime(this.config.expiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateActivateToken(user: User) {
        return new EncryptJWT({ type: 'activate', userId: user.id, version: user.version })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    generateResetPasswordToken(user: User) {
        return new EncryptJWT({ type: 'reset-password', userId: user.id, version: user.version })
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.activateTokenExpiresIn)
            .encrypt(new TextEncoder().encode(this.jwtSecret));
    }

    async validateToken(token: string) {
        const { payload } = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret))) as unknown as {
            payload: JWTPayload & ReturnType<typeof UserManager.getTokenPayload>;
        };
        const nowInSeconds = Math.floor(new Date().getTime() / 1000);

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
                // TODO throw authentication error
                throw new Error('wrong token error');
            }
            device.lastActive = new Date();
            await deviceRepository.save(device);
            return [await this.generateTokenFor(device), device as DeviceWithUser] as const;
        }

        const device = new Device();
        device.id = payload.deviceId;
        device.userAgent = payload.userAgent;
        device.lastActive = new Date(payload.lastActive);
        device.deletedAt = payload.deviceDeletedAt ? new Date(payload.deviceDeletedAt) : undefined;
        device.createdAt = payload.deviceCreatedAt ? new Date(payload.deviceCreatedAt) : undefined;
        device.updatedAt = payload.deviceUpdatedAt ? new Date(payload.deviceUpdatedAt) : undefined;

        device.user = new User();
        device.user.id = payload.userId;
        device.user.password = payload.passwordHash;
        device.user.email = payload.email;
        device.user.username = payload.username;
        device.user.activated = payload.activated;
        device.user.blocked = payload.blocked;

        device.user.deletedAt = payload.userDeletedAt ? new Date(payload.userDeletedAt) : undefined;
        device.user.createdAt = payload.userCreatedAt ? new Date(payload.userCreatedAt) : undefined;
        device.user.updatedAt = payload.userUpdatedAt ? new Date(payload.userUpdatedAt) : undefined;

        return [token, device as DeviceWithUser] as const;
    }

    async activateUser(token: string) {
        const { payload } = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret))) as unknown as {
            payload: JWTPayload & { type: 'activate'; userId: number; version: number };
        };
        if (payload.type !== 'activate') {
            // TODO better error
            throw new Error('Wrong token type');
        }
        const userRepository = getRepository(User);
        const user = await userRepository.findOneBy({ id: payload.userId });

        if (!user) {
            // TODO better error
            throw new Error('User not found');
        }

        if (user.version !== payload.version) {
            // TODO better error
            throw new Error('Token is outdated!');
        }

        if (user.blocked) {
            // TODO better error
            throw new Error('User is blocked!');
        }

        user.activated = true;
        await userRepository.save(user);
        return user;
    }

    async resetPassword(token: string, newPassword: string) {
        const { payload } = (await jwtDecrypt(token, new TextEncoder().encode(this.jwtSecret))) as unknown as {
            payload: JWTPayload & { type: 'reset-password'; userId: number; version: number };
        };
        if (payload.type !== 'reset-password') {
            // TODO better error
            throw new Error('Wrong token type');
        }

        const userRepository = getRepository(User);
        const user = await userRepository.findOneBy({ id: payload.userId });

        if (!user) {
            // TODO better error
            throw new Error('User not found');
        }

        if (user.version !== payload.version) {
            // TODO better error
            throw new Error('Token is outdated!');
        }

        if (user.blocked) {
            // TODO better error
            throw new Error('User is blocked!');
        }

        user.activated = true;
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
