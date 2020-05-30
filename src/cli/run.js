#!/usr/bin/env node

'use strict';

require('colorful').colorful();
const gulp = require('gulp');
const program = require('commander');
const version = require('../version');

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
});

program.parse(process.argv);

function runTask(toRun) {
  version.checkVersion();

  const metadata = { task: toRun };
  // Gulp >= 4.0.0 (doesn't support events)
  const taskInstance = gulp.task(toRun); // 执行命令任务
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    taskInstance.apply(gulp);
    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    console.log(err)
    gulp.emit('task_err', err);
  }
}

const task = program.args[0];

if (!task) {
  program.help();
} else {
  console.log('fire-tools run', task);

  require('../gulpfile');

  runTask(task);
}
