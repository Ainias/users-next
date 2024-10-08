export class DuplicateError extends Error {
    field: string;
    value: string;
    name = 'DuplicateError';

    constructor(field: string, value: string) {
        super(`DuplicateError: ${  field  } with value '${  value  }' already exists`);
        this.field = field;
        this.value = value;
    }
}
