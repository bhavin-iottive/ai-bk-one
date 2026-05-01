const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { log } = require("../utils/logger");

function getGuidelines() {
  try {
    const configPath = path.join(__dirname, "../config/review-guidelines.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return config.focusAreas ? config.focusAreas.join("\n- ") : "";
    }
  } catch (e) {
    log("⚠️ Failed to load review guidelines: " + e.message);
  }
  return "Review the code for general best practices.";
}

function generatePR(commitMsg, diff) {
  const prompt = `
You are a senior software engineer.

Generate a very brief, minimal GitHub Pull Request. Do not add any extra text or fluff.

STRICT FORMAT:

## 🚀 PR Title
<short title>

## 📄 PR Summary
<1-2 sentences summarizing the change>

## 🔑 Key Changes
- <bullet point>

## ⚠️ Notes / Risks
- <bullet point or 'None'>

Commit:
${commitMsg}

Diff:
${diff}
`;

  const result = execFileSync("ollama", ["run", "llama3.2:1b", prompt], {
    maxBuffer: 1024 * 1024 * 10,
  }).toString();

  return result;
}

function generateCodeReview(diff) {
  const guidelines = getGuidelines();
  const prompt = `
You are a strict, senior software engineer reviewing a pull request.
Review the following code changes based strictly on these focus areas:
- ${guidelines}

Provide a very brief, minimal review in Markdown. Do not add any extra text or fluff.
If the code looks perfect, just output: "✅ Code looks great!".

STRICT FORMAT:

### 🤖 AI Code Review
- **Bugs/Issues**: <list or 'None found'>
- **Improvements**: <short list or 'Looks good'>

Diff to review:
${diff}
`;

  const result = execFileSync("ollama", ["run", "llama3.2:1b", prompt], {
    maxBuffer: 1024 * 1024 * 10,
  }).toString();

  return result;
}

module.exports = { generatePR, generateCodeReview };