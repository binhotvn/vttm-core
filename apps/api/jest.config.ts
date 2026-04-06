import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.entity.ts', '!src/**/*.dto.ts', '!src/**/*.module.ts', '!src/main.ts', '!src/database/**'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@vttm/shared$': '<rootDir>/../../packages/shared/src/index',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
