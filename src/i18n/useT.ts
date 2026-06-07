import { useMemo } from 'react';
import { useUserData } from '../UserManagement/useUserData';

export function useT(): { t: (key: string, args?: Record<string, string | number>) => string } {
    const translateFunc = useUserData((s) => s.getTranslate());
    return useMemo(
        () => ({
            t: (key: string, args?: Record<string, string | number>) => translateFunc(`users:${key}`, args),
        }),
        [translateFunc],
    );
}
