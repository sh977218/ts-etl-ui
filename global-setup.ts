import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import jwt from 'jsonwebtoken';

const PROJECT_ROOT_FOLDER = __dirname;
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, 'e2e_nyc_output');
const COVERAGE_REPORT_FOLDER = join(PROJECT_ROOT_FOLDER, 'coverage-e2e');

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