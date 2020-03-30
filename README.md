# fire-tools 🔥

> 对于一些`React / JS / TS` 项目，进行一些编译，打包等工作

[参考 antd-tools](https://github.com/ant-design/antd-tools)

---

[![fire-tools][fire-tools-img]][fire-tools-url]
[![fire-tools version][npm-img]][npm-url]
[![npm download][download-img]][download-url]

[fire-tools-url]: https://github.com/FireLeafone/fire-tools
[fire-tools-img]: https://img.shields.io/badge/fire--tools-img-green
[npm-url]: https://www.npmjs.com/package/fire-tools
[npm-img]: https://img.shields.io/npm/v/fire-tools.svg
[download-url]: https://www.npmjs.com/package/fire-tools
[download-img]: https://img.shields.io/npm/dm/fire-tools.svg

## 使用

```sh
# 下载

npm install -g fire-tools
```

## 命令支持

- `fire-tools run compile` 编译
- `fire-tools run dist` 打包
- `fire-tools run clean` 清除打包文件 `-f _site`
- `fire-tools run ts-lint` ts规范检查
- `fire-tools run ts-lint-fix` ts规范检查，并修复

## 输出

- lib：支持到ES5
- es：支持ES6
- dist：压缩文件

## 文档

- [babel-config](./docs/babelConfig.md)
- [fire-tools-config](./docs/fireToolsConfig.md)
