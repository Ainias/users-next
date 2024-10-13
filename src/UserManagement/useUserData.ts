import { User } from '../models/User';
import { createZustand } from '../helper/createZustand';

const initialState = {
    user: undefined as User | undefined,
    accesses: [] as string[],
    translate: ((key) => key) as (key: string, args?: Record<string, string | number>) => string,
};

type SetState = (
    newState:
        | UserState
        | Partial<UserState & typeof initialState>
        | ((
              state: UserState & typeof initialState,
          ) => (UserState & typeof initialState) | Partial<UserState & typeof initialState>),
    replace?: boolean,
) => void;
type GetState = () => Readonly<UserState> & typeof initialState;

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
    checkUser() {
        const { user, accesses } = get();
        if (!user && accesses.length === 0) {
            return;
        }

        const cookieUserId = getCookieUserId();
        if (!cookieUserId || cookieUserId !== user?.id) {
            get().logout();
        }
    },
    getUser() {
        get().checkUser();
        const { user } = get();
        return user;
    },
    getAccesses() {
        get().checkUser();
        const { accesses } = get();
        return accesses;
    },
    setUser(user: User | undefined) {
        set({ user });
    },
    setAccesses(accesses: string[]) {
        set({ accesses });
    },
    setTranslate(translate: (key: string, args?: Record<string, string | number>) => string) {
        set({ translate });
    },
    getTranslate() {
        return get().translate;
    },
    logout() {
        set((old) => ({
            user: old.user ? undefined : old.user,
            accesses: old.accesses.length ? [] : old.accesses,
        }));
    },
});

export type UserState = ReturnType<typeof actionsGenerator>;
export const useUserData = createZustand<UserState>(
    (set, get) => ({
        ...initialState,
        ...actionsGenerator(set, get as GetState),
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
            setItem: (...args) => {
                if (typeof window === 'undefined') {
                    return;
                }
                window.localStorage.setItem(...args);
            },
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
