/**
 * 版本相关
 */
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');

function checkVersion() {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 });

  if (notifier.update) {
    notifier.notify();
  }
}

module.exports = {
  checkVersion
}