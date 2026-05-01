const notifier = require("node-notifier");

function notify(title, message) {
  notifier.notify({
    title,
    message,
    sound: true,
  });
}

module.exports = { notify };