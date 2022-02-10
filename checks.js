const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");
const { connected } = require('process');

async function checkFilExist(path) {
  return fs.promises.access(path, fs.constants.F_OK)
  .then(() => {
    core.info(`${path} exists`);
    return true;
  })
  .catch(() => {
    core.setFailed(`${path} does not exist`);
    return false;
  })

}

async function checkFileStartsWithHeader(filePath) {
  return fs.promises.readFile(filePath, 'utf8')
  .then(fileContent => {

      // remove all empty lines ad the beginning of the file
      fileContent = fileContent.replace(/^\s*\n/gm, '');

      if (fileContent.startsWith('#')) {
          core.info(`File ${filePath} starts with a header`);
          return true;
      } else {
          core.setFailed(`File ${filePath} does not start with a header`);
          return false;
      }
  });
}

async function checkNamingStandards() {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload.pull_request.head.ref}`);
}

(async () => {
    try {
      checkFilExist("LICENSE.txt")
      checkFilExist("README.md")
      checkFilExist("CONTRIBUTING.md")
      checkFilExist("SECURITY.md")
      checkFileStartsWithHeader("README.md");
      checkNamingStandards();
    } catch (error){
      core.setFailed(error.message);
    }
})();

