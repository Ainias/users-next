import { useUserData } from './useUserData';
import { User } from './models/User';

let serverUser: User | undefined;

export function useUser() {
    if (typeof window === 'undefined') {
        // server
        return serverUser;
    }
    // browser
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserData((s) => s.getUser());
}

export function setServerUser(user: User) {
    serverUser = user;
}
