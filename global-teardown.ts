import NYC from 'nyc';

const nycConfig = require('./.nycrc.json');

const PROJECT_ROOT_FOLDER = __dirname;

async function globalTeardown() {
  try {
    const nycInstance = new NYC({
      cwd: PROJECT_ROOT_FOLDER,
      reportDir: `coverage-e2e`,
      reporter: ['lcov', 'json', 'text-summary'],
    });
    await nycInstance.checkCoverage({
      statements: nycConfig.statements,
      branches: nycConfig.branches,
      functions: nycConfig.functions,
      lines: nycConfig.lines,
    });
    await nycInstance.report();
  } catch (e) {
    throw new Error(`nyc coverage check failed: ${e}`);
  }
}

export default globalTeardown;