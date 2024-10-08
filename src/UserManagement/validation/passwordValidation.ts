import { ref, string } from 'yup';

export const passwordValidation = {
    password: string().required().min(8),
    passwordConfirm: string()
        .required()
        .min(8)
        .oneOf([ref('password')]),
};
