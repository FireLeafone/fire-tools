/**
 * ts lint
 */

const path = require('path');
const runCmd = require('../runCmd');

const tsLintWrapper = (cmd, opt) => (done) => {
  const { basePath } = opt;
  if (cmd && !Array.isArray(cmd)) {
    console.error('tslint parameter error!');
    process.exit(1);
  }
  const lastCmd = cmd || [];
  const tslintBin = require.resolve('tslint/bin/tslint');
  const tslintConfig = path.join(__dirname, './tslint.json');
  const args = [tslintBin, '-c', tslintConfig, `${basePath}/**/*.tsx`].concat(lastCmd);
  runCmd('node', args, done);
};

module.exports = tsLintWrapper;
