import { useRequest } from '@ainias42/express-app';
import { useUserData } from './useUserData';

export function useUser() {
    if (typeof window === 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const request = useRequest();
        return request?.device?.user;
    }
    // browser
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserData((s) => s.getUser());
}
