import { ValidationError } from 'yup';
import { useCallback } from 'react';
import { useUserData } from './UserManagement/useUserData';
import type { AnyObject, InferType, Maybe, ObjectSchema } from 'yup';

export function useYupResolver<ObjectType extends Maybe<AnyObject>>(validationSchema: ObjectSchema<ObjectType>) {
    const translate = useUserData((s) => s.getTranslate());

    return useCallback(
        async (data: InferType<ObjectSchema<ObjectType>>) => {
            try {
                const values = await validationSchema.validate(data, {
                    abortEarly: false,
                });

                return {
                    values,
                    errors: {},
                };
            } catch (error) {
                if (!(error instanceof ValidationError)) {
                    throw error;
                }
                const reducedErrors = (error.inner as ValidationError[]).reduce(
                    (allErrors, currentError) => {
                        if (currentError.path === undefined) {
                            return allErrors;
                        }

                        let message = currentError.message as
                            | string
                            | {
                                  key: string;
                                  args?: Record<string, string | number>;
                              };
                        if (typeof message === 'object') {
                            message = translate(message.key, message.args);
                        } else {
                            message = translate(message);
                        }
                        allErrors[currentError.path] = {
                            type: currentError.type ?? 'validation',
                            message,
                        };
                        return allErrors;
                    },
                    {} as Record<string, { type: string; message: string }>,
                );

                return {
                    values: {},
                    errors: reducedErrors,
                };
            }
        },
        [translate, validationSchema],
    );
}
