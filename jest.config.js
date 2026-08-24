/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/reactNativeMock.js',
    '^react-native-url-polyfill/auto$': '<rootDir>/src/__mocks__/emptyMock.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__mocks__/asyncStorageMock.js',
  },
};
