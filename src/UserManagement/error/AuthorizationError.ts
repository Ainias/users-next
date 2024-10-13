export class AuthorizationError extends Error {
    isLoggedOut: boolean;

    constructor(message: string, isLoggedOut: boolean) {
        super(message);
        this.isLoggedOut = isLoggedOut;
        this.name = 'AuthorizationError';
    }
}
