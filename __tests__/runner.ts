// Test runner: executed with ts-node so that .ts spec files can be
// required directly by jasmine.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jasmine = require('jasmine');

const runner = new Jasmine();

runner.loadConfig({
  spec_dir: '__tests__',
  spec_files: [
    '**/*.spec.ts'
  ],
  env: {
    stopSpecOnExpectationFailure: true
  }
});

runner.execute();
