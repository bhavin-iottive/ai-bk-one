const fs = require("fs");
const path = require("path");
const config = require("../config.json");

function log(message) {
  const time = new Date().toISOString();
  const final = `[${time}] ${message}`;

  console.log(final);

  fs.appendFileSync(
    path.resolve(config.logFile),
    final + "\n"
  );
}

module.exports = { log };