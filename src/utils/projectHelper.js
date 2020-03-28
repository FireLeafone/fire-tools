const fs = require('fs');
const path = require('path');
const assign = require('object-assign');

const cwd = process.cwd(); // 方法返回 Node.js 进程的当前工作目录

const defaultProjectConfig = {
  basePath: "src", // 源代码基本路径
  buildPath: "dist", // 打包路径
  webpackConfigPath: "webpack.config.js", // webpack 配置路径
  lessPath: [], // 编译的less相对src路径，正则形式 /(\/|\\)style(\/|\\)index\.less$/
  compileLess: false, // 默认不编译
  compileAssets: false, // 默认不编译
  compileTs: false, // 默认不编译 tsconfig.json配置在根目录
  dist: {
    finalize: () => {} // 最后补充dist
  },
  compile: {
    finalize: () => {} // 最后补充compile
  }
}

function getProjectPath(...filePath) {
  const ss = path.join(cwd, ...filePath);
  return ss;
}

function resolve(moduleName) {
  return require.resolve(moduleName);
}

// We need hack the require to ensure use package module first
// For example, `typescript` is required by `gulp-typescript` but provided by `antd`
let injected = false;
function injectRequire() {
  if (injected) return;

  const Module = require('module');

  const oriRequire = Module.prototype.require;
  Module.prototype.require = function(...args) {
    const moduleName = args[0];
    try {
      return oriRequire.apply(this, args);
    } catch (err) {
      const newArgs = [...args];
      if (moduleName[0] !== '/') {
        newArgs[0] = getProjectPath('node_modules', moduleName);
      }
      return oriRequire.apply(this, newArgs);
    }
  };

  injected = true;
}

function getConfig() {
  const configPath = getProjectPath('fire-tools.config.js');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    return assign(defaultProjectConfig, config);
  }

  return defaultProjectConfig;
}

module.exports = {
  getProjectPath,
  resolve,
  injectRequire,
  getConfig,
};
