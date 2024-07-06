import { useUserData } from '../useUserData';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Block, Button, Input, Text, withMemo } from '@ainias42/react-bootstrap-mobile';
import { LoginResponseData } from '../api/login';
import { useUser } from '../useUser';

export type LoginFormProps = { login: (email: string, password: string) => Promise<LoginResponseData> };

export const LoginForm = withMemo(function LoginForm({ login }: LoginFormProps) {
    // Refs

    // States/Variables/Selectors
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const setUser = useUserData((s) => s.setUser);
    const setAccesses = useUserData((s) => s.setAccesses);
    const user = useUser();

    // Dispatch

    // Callbacks
    const doLogin = useCallback(async () => {
        const res = await login(email, password);
        if (res.success) {
            setUser(res.user);
            setAccesses(res.accesses);
        } else {
            setUser(undefined);
        }
    }, [email, login, password, setAccesses, setUser]);

    // Effects

    // Other

    // RenderFunctions

    if (user) {
        return (
            <Block>
                <Text>Du bist bereits eingeloggt als {user.username}</Text>
            </Block>
        );
    }

    return (
        <form>
            <Input label="E-Mail" type="email" onChangeText={setEmail} />
            <Input label="Password" type="password" onChangeText={setPassword} />
            <Button onClick={doLogin}>
                <Text>Login</Text>
            </Button>
        </form>
    );
});
