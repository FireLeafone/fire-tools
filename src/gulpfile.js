/*
 * @File: gulpfile.js
 * @Project: <<projectname>>
 * @File Created: Friday, 27th March 2020 2:08:26 pm
 * @Author: NARUTOne (wznaruto326@163.com/wznarutone326@gamil.com)
 * -----
 * @Last Modified: Friday, 27th March 2020 2:13:27 pm
 * @Modified By: NARUTOne (wznaruto326@163.com/wznarutone326@gamil.com>)
 * -----
 * @Copyright <<projectCreationYear>> - 2020 ***, ***
 * @fighting: code is far away from bug with the animal protecting
 *  ┏┓      ┏┓
 *  ┏┛┻━━━┛┻┓
 *  |           |
 *  |     ━    |
 *  |  ┳┛ ┗┳ |
 *  |          |
 *  |     ┻   |
 *  |           |
 *  ┗━┓     ┏━┛
 *     |      | 神兽保佑 🚀🚀🚀
 *     |      | 代码无BUG ！！！
 *     |      ┗━━━┓
 *     |            ┣┓
 *     |            ┏┛
 *     ┗┓┓ ┏━┳┓┏┛
 *      |┫┫   |┫┫
 *      ┗┻┛   ┗┻┛
 */

const fs = require('fs');
const gulp = require('gulp');
const webpack = require('webpack');
const merge2 = require('merge2'); // 流合并
const rimraf = require('rimraf');
const argv = require('minimist')(process.argv.slice(2)); // 解析参数

const lessCompile = require('./compile/less-compile');
const assetsCompile = require('./compile/assets-compile');
const {tsCompile, jsCompile} = require('./compile/ts-compile');

const tsLintWrapper = require('./lint/ts-lint');

const { getProjectPath, getConfig } = require('./utils/projectHelper');

const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

/**
 * 获取全局tools配置
 */
const { 
  basePath,
  buildPath,
  webpackConfigPath,
  lessPath,
  compileLess,
  compileAssets,
  compileTs,
  distFin,
  compileFin, 
} = getConfig();

/**
 * 打包
 *
 * @param {*} done
 */
function dist (done) {
  if (fs.existsSync(getProjectPath(buildPath))) {
    rimraf.sync(getProjectPath(buildPath));
  }
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(getProjectPath(webpackConfigPath));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);

    // 最后补充dist
    if (distFin.finalize) {
      console.log('[Dist] Finalization...');
      distFin.finalize();
    }

    done(0);
  });
}

/**
 * 编译
 *
 * @param {*} modules
 * @returns
 */
function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);

  const less = compileLess ? lessCompile({basePath, lessPath, modules}) : null;
  const assets = compileAssets ? assetsCompile({basePath, modules}) : null;
  const {tsFilesStream, tsd} = compileTs ? tsCompile({basePath, modules}) : {};
  const js = jsCompile({basePath, modules});

  const streams = [];

  // 注意顺序
  if (less) streams.push(less);
  if (tsFilesStream) streams.push(tsFilesStream);
  if (tsd) streams.push(tsd);

  streams.push(js);
  
  if (assets) streams.push(assets);

  return merge2(streams);
}

// gulp 编译

// fire-tools run clean
gulp.task('clean', () => {
  const fileName = argv.f;
  rimraf.sync(getProjectPath('lib'));
  rimraf.sync(getProjectPath('es'));
  rimraf.sync(getProjectPath('dist'));
  if (fileName) rimraf.sync(getProjectPath(fileName));
});

// fire-tools run dist
gulp.task(
  'dist',
  gulp.series(done => {
    console.log("dist start ...");
    dist(done);
  })
);

// lint ts
gulp.task('ts-lint', gulp.series(tsLintWrapper([], {basePath})));

gulp.task('ts-lint-fix', gulp.series(tsLintWrapper(['--fix'], {basePath})));

// fire-tools run compile
gulp.task('compile-with-es', done => {
  console.log('[Parallel] Compile to es...');
  compile(false).on('finish', done);
});

gulp.task('compile-with-lib', done => {
  console.log('[Parallel] Compile to js...');
  compile().on('finish', done);
});

gulp.task('compile-finalize', done => {
  // Additional process of compile finalize
  if (compileFin.finalize) {
    console.log('[Compile] Finalization...');
    compileFin.finalize();
  }
  done();
});

gulp.task(
  'compile',
  gulp.series(gulp.parallel('compile-with-es', 'compile-with-lib'), 'compile-finalize') // 避免重复错误 series + parallel
);
