import * as React from 'react';
import {
    Block,
    Button,
    Grid,
    GridItem,
    HookForm,
    PasswordInputController,
    Text,
    withMemo,
} from '@ainias42/react-bootstrap-mobile';
import { object } from 'yup';
import { passwordValidation } from '../validation/passwordValidation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useT } from '../../i18n/useT';
import { useUserData } from '../useUserData';
import { useYupResolver } from '../../useYupResolver';
import type { InferType } from 'yup';
import type { URecord } from '@ainias42/js-helper';
import type { User } from '../../models/User';

const newPasswordSchema = object({
    ...passwordValidation,
});

export type NewPasswordFormProps = {
    token: string;
    resetPassword: (passwordData: { password: string; token: string }) => Promise<
        | {
              success: true;
              user?: User;
              accesses?: string[];
          }
        | { success: false; errors: URecord<string, string> }
    >;
};

export const NewPasswordForm = withMemo(function NewPasswordFormComponent({ token, resetPassword }: NewPasswordFormProps) {
    // Refs

    // States/Variables/Selectors
    const { t } = useT();
    const [resettedPassword, setResettedPassword] = useState(false);

    const methods = useForm<InferType<typeof newPasswordSchema>>({
        resolver: useYupResolver(newPasswordSchema),
    });

    const setUser = useUserData((s) => s.setUser);
    const setAccesses = useUserData((s) => s.setAccesses);

    // Dispatch

    // Callbacks
    const doResetPassword = methods.handleSubmit(
        useCallback(
            async (values) => {
                const res = await resetPassword({ token, password: values.password });
                if (res.success) {
                    setResettedPassword(true);
                    if (res.user) {
                        setUser(res.user);
                        setAccesses(res.accesses ?? []);
                    }
                } else if ('errors' in res) {
                    methods.setError('password', { message: res.errors.password });
                }
            },
            [methods, resetPassword, setAccesses, setUser, token],
        ),
    );

    // Effects

    // Other

    // RenderFunctions

    if (resettedPassword) {
        return (
            <Block>
                <Text>{t('reset-password.success')}</Text>
            </Block>
        );
    }

    return (
        <HookForm {...methods}>
            <Grid>
                <GridItem size={12} md={6}>
                    <PasswordInputController name="password" label={t('user.password.label')} />
                </GridItem>
                <GridItem size={12} md={6}>
                    <PasswordInputController name="passwordConfirm" label={t('user.password.repeat.label')} />
                </GridItem>
                <GridItem size={12}>
                    <Button onClick={doResetPassword} fullWidth={true}>
                        <Text>{t('reset-password.send.label')}</Text>
                    </Button>
                </GridItem>
            </Grid>
        </HookForm>
    );
});
