import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

type SetState<Type> = (
    newState: Type | Partial<Type> | ((state: Type) => Type | Partial<Type>),
    replace?: boolean,
) => void;
type GetState<Type> = () => Readonly<Type>;

export function createZustand<Type>(
    creator: (set: SetState<Type>, get: GetState<Type>) => Type,
    persistOptions: PersistOptions<Type> | string,
) {
    const storage = typeof window !== 'undefined' ? createJSONStorage<Type>(() => window.localStorage) : undefined;
    const persistedCreator = creator as StateCreator<Type, [['zustand/persist', unknown]], []>;
    return create<Type>()(
        persist(
            persistedCreator,
            typeof persistOptions === 'string'
                ? {
                      name: persistOptions,
                      storage,
                  }
                : { storage, ...persistOptions },
        ),
    );
}
