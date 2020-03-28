/**
 * less 编译
 */
const gulp = require("gulp");
const through2 = require('through2'); // 处理 node 的 stream
const less = require('less');
const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const NpmImportPlugin = require('less-plugin-npm-import');
const postcssConfig = require('./postcssConfig');

const { getProjectPath } = require('../utils/projectHelper');
const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

// 转义less
function transformLess(lessFile, config = {}) {
  const { cwd = process.cwd() } = config;
  const resolvedLessFile = path.resolve(cwd, lessFile);

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, ''); // 字节顺序标记

  // Do less compile
  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true,
  };
  return less
    .render(data, lessOpts)
    .then(result => postcss(postcssConfig.plugins).process(result.css, { from: undefined }))
    .then(r => r.css);
}

function lessCompile (opt) {
  const {basePath, lessPath, modules} = opt
  return gulp
    .src([(basePath || "src") + '/**/*.less'])
    .pipe(
      through2.obj(function(file, encoding, next) {
        this.push(file.clone());
        if (
          lessPath && lessPath.length && lessPath.find(p => file.path.match(p))
        ) {
          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch(e => {
              console.error(e);
            });
        } else {
          next();
        }
      })
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}

module.exports = lessCompile;