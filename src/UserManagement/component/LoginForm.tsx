import { useUserData } from '../useUserData';
import * as React from 'react';
import { useCallback } from 'react';
import {
    Block,
    Button,
    Grid,
    HookForm,
    InputController,
    PasswordInputController,
    Text,
    withMemo,
} from '@ainias42/react-bootstrap-mobile';
import { LoginResponseData } from '../api/login/login';
import { useUser } from '../useUser';
import { useT } from '../../i18n/useT';
import { useForm } from 'react-hook-form';
import { InferType, object, string } from 'yup';
import { useYupResolver } from '../../useYupResolver';

const loginSchema = object({
    emailOrUsername: string().required(),
    password: string().required(),
});

export type LoginFormProps = { login: (emailOrUsername: string, password: string) => Promise<LoginResponseData> };

export const LoginForm = withMemo(function LoginForm({ login }: LoginFormProps) {
    // Refs

    // States/Variables/Selectors
    const { t } = useT();

    const setUser = useUserData((s) => s.setUser);
    const setAccesses = useUserData((s) => s.setAccesses);
    const user = useUser();

    const methods = useForm<InferType<typeof loginSchema>>({
        resolver: useYupResolver(loginSchema),
        defaultValues: {
            emailOrUsername: '',
            password: '',
        },
    });

    // Dispatch

    // Callbacks
    const doLogin = methods.handleSubmit(
        useCallback(
            async (values) => {
                const res = await login(values.emailOrUsername, values.password);
                if (res.success) {
                    setUser(res.user);
                    setAccesses(res.accesses);
                } else {
                    setUser(undefined);
                }
            },
            [login, setAccesses, setUser],
        ),
    );

    // Effects

    // Other

    // RenderFunctions

    if (user) {
        return (
            <Block>
                <Text>{t('user.logged-in.already', { user: user.username })}</Text>
            </Block>
        );
    }

    return (
        <HookForm {...methods} onSend={doLogin}>
            <Grid columns={1}>
                <InputController label={t('user.email-or-username.label')} name="emailOrUsername" />
                <PasswordInputController label={t('user.password.label')} name="password" />
                <Button onClick={doLogin} fullWidth={true}>
                    <Text>{t('user.login.label')}</Text>
                </Button>
            </Grid>
        </HookForm>
    );
});
