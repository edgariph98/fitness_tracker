const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  rootDir: "../../",
  setupFilesAfterEnv: ['<rootDir>/UnitTests/jest-config/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    "<rootDir>/UnitTests/**/*.test.tsx"
  ]
}

module.exports = createJestConfig(customJestConfig)