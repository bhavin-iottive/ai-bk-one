// --->>> All setup okay just create new bracnh and check PR setup
const { execSync, execFileSync } = require("child_process");
const { log } = require("../utils/logger");
const { notify } = require("../utils/notifier");
const { getBranch, ensureBaseBranch, syncWithBase } = require("../utils/git");
const fs = require("fs");
const config = require("../config.json");
const { generatePR, generateCodeReview } = require("./ai-generate");

try {
  log("🚀 Auto PR System Started");

  const branch = getBranch();
  const BASE = config.baseBranch;

  if (["main", "HEAD", BASE].includes(branch)) {  
    log("⛔ Skipping base branch");
    process.exit(0);
  }

  ensureBaseBranch(BASE);
  syncWithBase(BASE);

  const commitMsg = execSync("git log -1 --pretty=%B").toString().trim();

  // Optional flag
  // if (!commitMsg.includes("[ai-pr]")) {
  //   log("⏩ Skipping AI PR (no flag)");
  //   process.exit(0);
  // }

  // Check tools
  try {
    execSync("gh --version");
    execSync("ollama --version");
  } catch {
    log("❌ Missing gh or ollama");
    notify("AI PR Tool", "Missing dependencies ❌");
    process.exit(1);
  }

  let hasOpenPR = false;
  try {
    const prs = JSON.parse(
      execSync(`gh pr list --head ${branch} --state open --json number`)
    );
    hasOpenPR = prs.length > 0;
  } catch {}

  log("⬆️ Pushing branch...");
  execSync(`git push -u origin ${branch}`, { stdio: "inherit" });

  // 🔁 EXISTING PR → COMMENT
  if (hasOpenPR) {
    log("PR exists → adding review");

    let diff = execSync("git diff HEAD~1...HEAD")
      .toString()
      .slice(0, config.maxDiffSize);

    const review = generateCodeReview(diff);

    execFileSync("gh", [
      "pr",
      "comment",
      branch,
      "--body",
      review,
    ]);

    notify("AI PR", "Review added to existing PR ✅");
    process.exit(0);
  }

  // 🆕 NEW PR
  const diff = execSync(`git diff origin/${BASE}...HEAD`)
    .toString()
    .slice(0, config.maxDiffSize);

  log("🤖 Generating PR...");
  const content = generatePR(commitMsg, diff);

  const lines = content.split("\n");
  const titleIndex = lines.findIndex(l => l.includes("PR Title"));
  const title = lines[titleIndex + 1] || commitMsg;

  log("🚀 Creating PR...");

  execFileSync("gh", [
    "pr",
    "create",
    "--base",
    BASE,
    "--head",
    branch,
    "--title",
    title,
    "--body",
    content,
  ], { stdio: "inherit" });

  execSync(`gh pr comment ${branch} --body "🤖 AI Review Added"`);

  notify("AI PR", "PR created successfully 🚀");
  log("✅ PR Created");

} catch (err) {
  log("❌ Error: " + err.message);
  notify("AI PR Failed", err.message);
}

