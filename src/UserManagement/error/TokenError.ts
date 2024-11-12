import { TokenErrorCode } from './TokenErrorCode';

export class TokenError extends Error {
    code: TokenErrorCode;

    constructor(code: TokenErrorCode, message: string) {
        super(message);
        this.name = 'TokenError';
        this.code = code;
    }
}
