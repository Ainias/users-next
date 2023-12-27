import { useUserData } from './useUserData';
import { User } from './models/User';

let serverUser: User | undefined;

export function useUser() {
    if (typeof window === 'undefined') {
        // server
        console.log('LOG-d returning from server');
        return serverUser;
    }
    // browser
    console.log('LOG-d returning from client');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserData((s) => s.getUser());
}

export function setServerUser(user: User) {
    serverUser = user;
}
