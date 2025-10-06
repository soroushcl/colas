// jest.config.ts
// @ts-ignore
import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],
  // moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'], 
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', {useESM: true,  tsconfig: './tsconfig.json'}]
  },
  moduleNameMapper: {
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@services/mailer(.*)$': '<rootDir>/services/mailer/$1',
    '^@auth/authenticationHandlers(.*)$': '<rootDir>/authentication/authenticationHandlers/$1',
    '^@auth/(.*)$': '<rootDir>/authentication/$1',
    '^@testHelpers/generators/(.*)$': '<rootDir>/test/generators/$1',
    '^@testHelpers/(.*)$': '<rootDir>/test/$1',
  },
  testPathIgnorePatterns: ['./dist']
}

export default config;
