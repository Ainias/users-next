import { createZustand } from '../helper/createZustand';
import type { UserJson } from '../models/UserJson';

const initialState = {
    user: undefined as UserJson | undefined,
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
type UserDataState = UserState & typeof initialState;

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
        const { user } = get();
        return user;
    },
    getAccesses() {
        const { accesses } = get();
        return accesses;
    },
    setUser(user: UserJson | undefined) {
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
export const useUserData = createZustand<UserDataState>(
    (set, get) => ({
        ...initialState,
        ...actionsGenerator(set, get as GetState),
    }),
    {
        name: 'user',
        version: 0,
    },
);

function checkLoggedIn() {
    useUserData.getState().getUser();
    setTimeout(checkLoggedIn, 3000);
}

if (typeof window !== 'undefined') {
    checkLoggedIn();
}
