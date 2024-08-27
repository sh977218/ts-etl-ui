import { readFile, writeFile } from 'fs';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse HEAD').toString().trim();
const indexHtmlPath = './dist/ts-etl-ui/browser/index.html';

function insertCommitHash() {
  readFile(indexHtmlPath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    console.info(`latest master commit hash: ${commitHash}`);
    const result = data.replace(/<!--COMMIT_HASH-->/g, commitHash);

    writeFile(indexHtmlPath, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

if (process.env.CI) {
  insertCommitHash();
}
