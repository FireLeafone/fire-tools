#!/usr/bin/env node

'use strict';

require('colorful').colorful();
const program = require('commander');
const pkg = require('../../package.json');

// fire-tools -v
// fire-tools -h
program.version(pkg.version, '-v, --version').usage('<command> [options]');
program.command('run [name]', "run specified task"); // 如果存在，且没有显示调用action(fn)，就会启动子命令程序 fire-tools-run，否则会报错，
program.parse(process.argv);

// https://github.com/tj/commander.js/pull/260
const proc = program.runningCommand;
if (proc) {
  proc.on('close', process.exit.bind(process));
  proc.on('error', () => {
    process.exit(1);
  });
}

const subCmd = program.args[0];
if (!subCmd || subCmd !== 'run') {
  program.help();
}