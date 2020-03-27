/**
 * ts 编译
 */

const gulp = require("gulp");
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const stripCode = require('gulp-strip-code'); // 删除无用代码：环境，国际化等，
const argv = require('minimist')(process.argv.slice(2)); // 解析参数

const tsConfig = require('./getTSCommonConfig')();
const getBabelCommonConfig = require('./getBabelCommonConfig');
const replaceLib = require('./replaceLib');

const { getProjectPath } = require('../utils/projectHelper');
const { cssInjection } = require('../utils/styleUtil');
const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

const tsDefaultReporter = ts.reporter.defaultReporter(); // 向控制台输出基本错误

// babel 处理
function babelify(js, modules) {
  const babelConfig = getBabelCommonConfig(modules);
  delete babelConfig.cacheDirectory;
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  }
  let stream = js.pipe(babel(babelConfig)).pipe(
    through2.obj(function z(file, encoding, next) {
      this.push(file.clone());
      if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
        const content = file.contents.toString(encoding);
        if (content.indexOf("'react-native'") !== -1) {
          // actually in antd-mobile@2.0, this case will never run,
          // since we both split style/index.mative.js style/index.js
          // but let us keep this check at here
          // in case some of our developer made a file name mistake ==
          next();
          return;
        }

        file.contents = Buffer.from(cssInjection(content)); // 返回一个新的 Buffer
        file.path = file.path.replace(/index\.js/, 'css.js');
        this.push(file);
        next();
      } else {
        next();
      }
    })
  );
  if (modules === false) {
    stream = stream.pipe(
      stripCode({
        start_comment: '@remove-on-es-build-begin',
        end_comment: '@remove-on-es-build-end',
      })
    );
  }
  return stream.pipe(gulp.dest(modules === false ? esDir : libDir));
}

function tsCompile (opt) {
  const {basePath, modules} = opt;

  let error = 0;
  const source = [basePath + '/**/*.tsx', basePath + '/**/*.ts', basePath + '/**/*.d.ts'];
  // allow jsx file in basePath/xxx/
  if (tsConfig.allowJs) {
    source.unshift(basePath + '/**/*.jsx');
  }
  const tsResult = gulp.src(source).pipe(
    ts(tsConfig, {
      error(e) {
        tsDefaultReporter.error(e);
        error = 1;
      },
      finish: tsDefaultReporter.finish,
    })
  );

  function check() {
    if (error && !argv['ignore-error']) {
      process.exit(1);
    }
  }

  tsResult.on('finish', check);
  tsResult.on('end', check);
  const tsFilesStream = babelify(tsResult.js, modules);
  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir));

  return {
    tsFilesStream, 
    tsd
  }
}

module.exports = tsCompile;