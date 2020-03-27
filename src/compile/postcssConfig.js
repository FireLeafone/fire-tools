const rucksack = require('rucksack-css'); // 有趣的css 包装
const autoprefixer = require('autoprefixer'); // 兼容

module.exports = {
  plugins: [rucksack(), autoprefixer()],
};
