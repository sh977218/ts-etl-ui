import { mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';

import { COVERAGE_REPORT_FOLDER, NYC_OUTPUT_FOLDER } from './tests/CONSTANT';

async function globalSetup() {
  if (!process.env['CI']) {
    execSync('npm run reset-db');
  }

  await rmSync(NYC_OUTPUT_FOLDER, { recursive: true, force: true });
  await mkdirSync(NYC_OUTPUT_FOLDER);
  await rmSync(COVERAGE_REPORT_FOLDER, { recursive: true, force: true });
  await mkdirSync(COVERAGE_REPORT_FOLDER);
}

export default globalSetup;