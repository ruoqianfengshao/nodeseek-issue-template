# NodeSeek Issue Templates 源码

- `config.js`：常量、字段配置与选项。
- `ui.js`：表单模板、样式与多机器书签界面。
- `logic.js`：计算、汇率、图片上传、Markdown 与表单状态。
- `main.js`：NodeSeek 编辑器集成、事件处理和启动。

修改源码后执行：

```sh
node tools/build.js build
node --check 'NodeSeek Issue Templates.user.js'
```

根目录的 `NodeSeek Issue Templates.user.js` 是可直接导入油猴的构建产物，不直接编辑。
