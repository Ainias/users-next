import { useUserData } from './useUserData';
import { useRequest } from '@ainias42/express-app';
import { UserManager } from './UserManager';

export function useIsLoggedIn() {
    if (typeof window === 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const request = useRequest();
        const tokenCookieName = UserManager.getInstance().getTokenCookieName();
        return !!request?.cookies[tokenCookieName];
    }
    // browser
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserData((s) => !!s.getUser());
}
