# SVG Editor · Lab1

TypeScript 面向对象 SVG 命令行编辑器，支持六种内置图形、Composite 分组、Command 撤销重做与 SVG 文件读写。

```sh
npm ci
npm run check
npm run cli
# 回放示例（输出 SVG 到 /tmp）
npm run cli < examples/flowchart.txt
# 编译后不需要 tsx
npm run build
node dist/cli/Main.js
```

要求 Node.js 22 或更新版本。输入 `help` 查看所有命令；Ctrl-D 结束。`#` 开头的行是注释，双引号包裹含空格文本，支持 `\"` 和 `\\` 转义。

完整架构、过程记录、质量检查与范围说明：[doc/README.md](doc/README.md)。本阶段 `box` 不实现；不支持的 SVG 功能明确报错，不静默破坏文件。

仓库：https://github.com/Bamboovan/fudan-svg-editor-lab1 （私有）。作业归属：朱凡 / 26213050517；AI 协作和真实开发日期见文档。
