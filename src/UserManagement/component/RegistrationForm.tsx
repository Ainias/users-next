import * as React from 'react';
import { ReactNode, useCallback, useState } from 'react';
import {
    Block,
    Button,
    Grid,
    GridItem,
    HookForm,
    InputController,
    PasswordInputController,
    Text,
    withMemo,
} from '@ainias42/react-bootstrap-mobile';
import { useUser } from '../useUser';
import { useForm } from 'react-hook-form';
import { InferType, object, string } from 'yup';
import { useT } from '../../i18n/useT';
import { URecord } from '@ainias42/js-helper';
import { useYupResolver } from '../../useYupResolver';
import { passwordValidation } from '../validation/passwordValidation';
import { usernameSchema } from './usernameSchema';

const registerSchema = object({
    username: usernameSchema,
    email: string().email().required(),
    ...passwordValidation,
});

type RegisterFormData = InferType<typeof registerSchema>;

export type RegistrationFormProps = {
    registration: (registrationData: {
        username: string;
        email: string;
        password: string;
    }) => Promise<{ success: false; errors?: URecord<string, string> } | { success: true }>;
    extraFields?: () => ReactNode;
};

export const RegistrationForm = withMemo(function RegistrationForm({
    registration,
    extraFields,
}: RegistrationFormProps) {
    // Refs

    // States/Variables/Selectors
    const { t } = useT();
    const [registrated, setRegistrated] = useState(false);

    const methods = useForm<RegisterFormData>({
        resolver: useYupResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
        },
    });

    const user = useUser();

    // Dispatch

    // Callbacks
    const doRegistration = methods.handleSubmit(
        useCallback(
            async (values) => {
                const res = await registration({ ...values, password: values.password });
                if (res.success) {
                    setRegistrated(true);
                } else if ('errors' in res) {
                    methods.setError('username', { message: res.errors?.username });
                    methods.setError('email', { message: res.errors?.email });
                    methods.setError('password', { message: res.errors?.password });
                }
            },
            [methods, registration],
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

    if (registrated) {
        return (
            <Block>
                <Text>{t('registration.success')}</Text>
            </Block>
        );
    }

    return (
        <HookForm {...methods}>
            <Grid __allowChildren={'all'}>
                <GridItem size={12} md={6}>
                    <InputController name="username" label={t('user.username.label')} />
                </GridItem>
                <GridItem size={12} md={6}>
                    <InputController name="email" label={t('user.email.label')} />
                </GridItem>
                <GridItem size={12} md={6}>
                    <PasswordInputController name="password" label={t('user.password.label')} />
                </GridItem>
                <GridItem size={12} md={6}>
                    <PasswordInputController name="passwordConfirm" label={t('user.password.repeat.label')} />
                </GridItem>
                {extraFields?.()}
                <GridItem size={12}>
                    <Button onClick={doRegistration} fullWidth={true}>
                        <Text>{t('user.registration.label')}</Text>
                    </Button>
                </GridItem>
            </Grid>
        </HookForm>
    );
});
