import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT_FOLDER = __dirname;
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, '.nyc_output');
const COVERAGE_REPORT_FOLDER = join(PROJECT_ROOT_FOLDER, 'coverage-e2e');

async function globalSetup() {
  await rmSync(NYC_OUTPUT_FOLDER, { recursive: true, force: true });
  await mkdirSync(NYC_OUTPUT_FOLDER);
  await rmSync(COVERAGE_REPORT_FOLDER, { recursive: true, force: true });
  await mkdirSync(COVERAGE_REPORT_FOLDER);
}

export default globalSetup;