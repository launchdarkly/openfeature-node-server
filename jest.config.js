module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testMatch: ["**/__tests__/**/*test.ts?(x)"],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    "src/**/*.ts",
  ],
  reporters: [
    "default",
    ["jest-junit", { suiteName: "jest tests", outputFile: "reports/junit/js-test-results.xml" }]
  ]
};
