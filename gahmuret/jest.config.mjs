// jest.config.mjs
// hinted from https://www.jest-preview.com/docs/examples/remix/
const config = {
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**'
    ],
    moduleNameMapper: {
        // enable app (@) and root (~) shortcuts in imports
        '@/(.*)': '<rootDir>/app/$1',
        '~/(.*)': '<rootDir>/$1',
        // mock imported CSS files
        '\\.(css|less|scss|sass)$': '<rootDir>/mocks/cssFileMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.cache/',
        '<rootDir>/build/'
    ],
    testEnvironment: '@quramy/jest-prisma/environment',
    transform: {
        // Use @swc/jest to transpile tests because it dramatically quicker than ts-jest (> 80s)
        // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
        '^.+\\.(js|jsx|ts|tsx)$': '@swc/jest'
    },
    transformIgnorePatterns: [
        'node_modules/(?!@?web3-storage)/'
    ]
};

export default config;
