import { User } from './models/User';
import * as crypto from 'crypto';
import { GlobalRef } from '../GlobalRef';
import { EncryptJWT, jwtDecrypt, JWTPayload } from 'jose';
import { Device } from './models/Device';
import { getSyncRepository } from '@ainias42/typeorm-sync';
import { deleteCookie, setCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { RoleManager } from './RoleManager';
import { IncomingMessage, ServerResponse } from 'http';
import { ArrayHelper } from '@ainias42/js-helper';

const defaultUserManagerConfig = {
    saltLength: 12,
    expiresIn: '7d',
    recheckPasswordAfterSeconds: 60 * 5,
    userNeedsToBeActivated: true,
};
export type UserManagerConfig = typeof defaultUserManagerConfig;

class UserManager {
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

    static setToken(
        token: string,
        userId: number,
        req: NextApiRequest | IncomingMessage,
        res: NextApiResponse | ServerResponse,
    ) {
        const time = 7 * 24 * 60 * 60;
        setCookie('token', token, {
            req,
            res,
            httpOnly: true,
            maxAge: time,
            secure: process.env.NODE_ENV !== 'development',
        });
        setCookie('userId', userId, {
            req,
            res,
            httpOnly: false,
            maxAge: time,
            secure: process.env.NODE_ENV !== 'development',
        });
    }

    static deleteToken(req: NextApiRequest | IncomingMessage, res: NextApiResponse | ServerResponse) {
        deleteCookie('token', { req, res });
        deleteCookie('userId', { req, res });
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
        const userRepository = getSyncRepository(User);
        const user = await userRepository.findOne({ where: { id: userId }, relations: ['roles', 'roles.accesses'] });
        if (!user?.roles) {
            return [];
        }
        const accessesForRoles = ArrayHelper.noUndefined(
            await Promise.all(user.roles.map((role) => RoleManager.findAccessesForRole(role))),
        );
        return accessesForRoles.flat();
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

    async generateTokenFor(device: Device) {
        return new EncryptJWT(UserManager.getTokenPayload(device))
            .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.expiresIn)
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

            const deviceRepository = getSyncRepository(Device);
            const device = await deviceRepository.findOne(findOptions);

            if (!device) {
                // TODO throw authentication error
                throw new Error('wrong token error');
            }
            device.lastActive = new Date();
            await deviceRepository.save(device);
            return [await this.generateTokenFor(device), device] as const;
        }

        const device = new Device();
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

        return [token, device] as const;
    }

    private generateSalt() {
        const length = this.config.saltLength;
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
}

const userManagerGlobalRef = new GlobalRef<typeof UserManager>('smd-mail.userManager');
if (!userManagerGlobalRef.value()) {
    userManagerGlobalRef.setValue(UserManager);
}
const val = userManagerGlobalRef.value() as typeof UserManager;
export { val as UserManager };
