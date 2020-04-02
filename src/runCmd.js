'use strict';

const isWindows = require('is-windows'); // window 判断
const getRunCmdEnv = require('./utils/getRunCmdEnv');

function runCmd(cmd, _args, fn) {
  const args = _args || [];

  if (isWindows()) {
    args.unshift(cmd);
    args.unshift('/c');
    cmd = process.env.ComSpec;
  }

  // 运行命令
  const runner = require('child_process').spawn(cmd, args, {
    // keep color
    stdio: 'inherit',
    env: getRunCmdEnv(),
  });

  runner.on('close', (code) => {
    if (fn) {
      fn(code);
    }
  });
}

module.exports = runCmd;
