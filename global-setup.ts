import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT_FOLDER = __dirname;
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, 'e2e_nyc_output');

async function globalSetup() {
  await rmSync(NYC_OUTPUT_FOLDER, { recursive: true, force: true });
  await mkdirSync(NYC_OUTPUT_FOLDER);
}

export default globalSetup;