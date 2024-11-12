import { UserErrorCode } from './UserErrorCode';

export class UserError extends Error {
    code: UserErrorCode;

    constructor(code: UserErrorCode, message: string) {
        super(message);
        this.name = 'UserError';
        this.code = code;
    }
}
