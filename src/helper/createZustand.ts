import { create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type SetState<Type> = (
    newState: Type | Partial<Type> | ((state: Type) => Type | Partial<Type>),
    replace?: boolean,
) => void;
type GetState<Type> = () => Readonly<Type>;

export function createZustand<Type>(
    creator: (set: SetState<Type>, get: GetState<Type>) => Type,
    persistOptions: PersistOptions<Type> | string,
) {
    const storage = typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined;
    return create<Type>()(
        persist(
            creator,
            typeof persistOptions === 'string'
                ? {
                      name: persistOptions,
                      storage,
                  }
                : { storage, ...persistOptions },
        ),
    );
}
