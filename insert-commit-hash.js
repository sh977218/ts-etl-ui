const fs = require('fs');
const child_process = require('child_process');

const commitHash = child_process.execSync('git rev-parse HEAD').toString().trim();
const indexHtmlPath = './dist/ts-etl-ui/browser/index.html';

fs.readFile(indexHtmlPath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }

  console.info(`latest master commit hash: ${commitHash}`);
  const result = data.replace(/<!--COMMIT_HASH-->/g, commitHash);

  fs.writeFile(indexHtmlPath, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
