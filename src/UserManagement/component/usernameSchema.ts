import { string } from 'yup';

export const usernameSchema = string()
    .required()
    .matches(/^[a-zA-Z0-9_-]+$/, 'users:user.username.invalid-signs');
