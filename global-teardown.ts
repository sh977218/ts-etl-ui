import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT_FOLDER = __dirname;
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, '.nyc_output');

async function globalTeardown() {
  if (!!process.env['CI'] || process.env['COVERAGE']) {
    const coverageRowData = readdirSync(NYC_OUTPUT_FOLDER);
    if (!coverageRowData.length) {
      throw new Error(`no nyc coverage found. Coverage does not work.`);
    }
    try {
      execSync('npm run coverage-report').toString().trim();
    } catch (e) {
      throw new Error(`nyc coverage check failed: \n\n\n ${e.stderr}`);
    }
  }
}

export default globalTeardown;