import { string } from 'yup';

export const usernameSchema = string()
    .required()
    .matches(/^[\w-]+$/, 'users:user.username.invalid-signs');
