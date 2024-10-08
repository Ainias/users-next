import { useUserData } from './useUserData';
import { useRequest } from '@ainias42/express-app';

export function useIsLoggedIn() {
    if (typeof window === 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const request = useRequest();
        return !!request?.cookies.token;
    }
    // browser
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserData((s) => !!s.getUser());
}
