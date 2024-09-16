import NYC from 'nyc';
import { execSync } from 'child_process';

const nycConfig = require('./.nycrc.json');

const PROJECT_ROOT_FOLDER = __dirname;

async function globalTeardown() {
  try {
    const generateNycReportCmdReturn = execSync('npm run coverage-report').toString().trim();
    console.log(`${generateNycReportCmdReturn}`);
  } catch (e) {
    // NYC doesn't throw error when coverage is not met. bug
    throw new Error(`nyc coverage check failed: ${e}`);
  }
}

export default globalTeardown;