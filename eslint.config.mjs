import defaultConfig from '@ainias42/config/eslint.config.js';

export default [
    ...defaultConfig,
    {
        rules: {
            'jsx-a11y/interactive-supports-focus': 'off',
            'no-underscore-dangle': [
                'off',
                {
                    allow: [
                        '_EA_NAME',
                        '_EA_SERVICE_WORKER_ENABLED',
                        '_EA_SERVER_ADDRESS',
                        '_EA_SERVER_HMR',
                        '_EA_ALLOW_ORIGIN',
                        '_EA_QUERY_BUSTER',
                    ],
                },
            ],
        },
    },
    {
        files: ['src/models/Device.ts', 'src/models/User.ts'],
        rules: {
            'import/no-cycle': 'off',
        },
    },
    {
        files: ['src/models/migrations/*.ts', 'src/users-next.ts'],
        rules: {
            'unicorn/filename-case': 'off',
        },
    },
];
