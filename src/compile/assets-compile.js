/**
 * 静态资源编译
 */

const gulp = require("gulp");

const { getProjectPath } = require('../utils/projectHelper');
const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

function assetsCompile (opt) {
  const {basePath, modules} = opt;
  return gulp
    .src([(basePath || "src") + '/**/*.@(png|jpg|jpeg|gif|svg)'])
    .pipe(gulp.dest(modules === false ? esDir : libDir));
}

module.exports = assetsCompile;