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
  const payload = JSON.stringify(github.context.payload.pull_request, undefined, 2)

  console.log(`The event payload: ${payload}`);
}

(async () => {
    try {
      checkFilExist("LICENSE.txt")
      checkFilExist("README.md")
      checkFilExist("CONTRIBUTING.md")
      checkFilExist("SECURITY.md")
      // checkFileStartsWithHeader("README.md");
      if (
          ! await checkFileStartsWithHeader("README.md")
      ) {
          // get token for octokit
          const token = core.getInput('repo-token');
          const octokit = new github.getOctokit(token);
          // call octokit to create a check with annotation and details
          const check = await octokit.rest.checks.create({
              owner: github.context.repo.owner,
              repo: github.context.repo.repo,
              name: 'Readme Validator',
              head_sha: github.context.sha,
              status: 'completed',
              conclusion: 'failure',
              output: {
                  title: 'README.md must start with a title',
                  summary: 'Please use markdown syntax to create a title',
                  annotations: [
                      {
                          path: 'README.md',
                          start_line: 1,
                          end_line: 1,
                          annotation_level: 'failure',
                          message: 'README.md must start with a header',
                          start_column: 1,
                          end_column: 1
                      }
                  ]
              }
          });
      }
         


      checkNamingStandards();
    } catch (error){
      core.setFailed(error.message);
    }
})();

