const { execSync } = require("child_process");
const { log } = require("./logger");

function getBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();
}

function ensureBaseBranch(base) {
  log(`Checking base branch: ${base}`);

  try {
    execSync(`git show-ref --verify refs/heads/${base}`);
  } catch {
    log(`Base branch not found. Creating ${base}...`);

    execSync(`git checkout -b ${base}`, { stdio: "inherit" });
    execSync(`git push -u origin ${base}`, { stdio: "inherit" });
    execSync(`git checkout -`, { stdio: "inherit" });
  }
}

function syncWithBase(base) {
  try {
    execSync(`git fetch origin`);
    execSync(`git rebase origin/${base}`);
    log("Rebased with base branch");
  } catch {
    log("Rebase failed, merging...");
    execSync(`git merge origin/${base}`);
  }
}

module.exports = { getBranch, ensureBaseBranch, syncWithBase };