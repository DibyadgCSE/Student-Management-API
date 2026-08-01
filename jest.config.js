module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/config/',
    '/src/docs/'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
