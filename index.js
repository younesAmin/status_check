const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");
const ( connected ) = require('process');

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

(async () => {
    try {
      checkFilExist("LICENSE")
    } catch (error){
      core.setFailed(error.message);
    }
})();

