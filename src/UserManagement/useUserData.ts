import { User } from './models/User';
import { createZustand } from '../helper/createZustand';

const initialState = {
    user: undefined as User | undefined,
    accesses: [] as string[],
};

type SetState = (
    newState: UserState | Partial<UserState> | ((state: UserState) => UserState | Partial<UserState>),
    replace?: boolean,
) => void;
type GetState = () => Readonly<UserState>;

function getCookieUserId() {
    if (typeof window === 'undefined') {
        return null;
    }
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((currentCookie) => currentCookie.startsWith('userId='));
    if (!cookie) {
        return null;
    }
    return Number(cookie.split('=')[1]);
}

const actionsGenerator = (set: SetState, get: GetState) => ({
    getUser() {
        const { user } = get();
        if (!user) {
            return undefined;
        }
        const cookieUserId = getCookieUserId();
        if (cookieUserId !== user.id) {
            set({ user: undefined });
            return undefined;
        }
        return user;
    },
    setUser(user: User | undefined) {
        set({ user });
    },
    setAccesses(accesses: string[]) {
        set({ accesses });
    },
    clear() {
        set({ ...actionsGenerator(set, get) }, true);
    },
});

export type UserState = typeof initialState & ReturnType<typeof actionsGenerator>;
export const useUserData = createZustand<UserState>(
    (set, get) => ({
        ...initialState,
        ...actionsGenerator(set, get),
    }),
    {
        name: 'user',
        version: 0,
        getStorage: () => ({
            getItem: (...args) => {
                if (typeof window === 'undefined') {
                    return null;
                }
                return window.localStorage.getItem(...args);
            },
            setItem: (...args) => window.localStorage.setItem(...args),
            removeItem: (...args) => window.localStorage.removeItem(...args),
        }),
    },
);

function checkLoggedIn() {
    useUserData.getState().getUser();
    setTimeout(checkLoggedIn, 3000);
}

if (typeof window !== 'undefined') {
    checkLoggedIn();
}
