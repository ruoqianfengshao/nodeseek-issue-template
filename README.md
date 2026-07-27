# NodeSeek Issue Templates

NodeSeek 交易帖模板油猴脚本：用表单生成单机或多机交易帖，并回填标题、Markdown 与剩余价值卡片。

## 安装

在 Tampermonkey 中点击安装：[NodeSeek Issue Templates.user.js](https://raw.githubusercontent.com/ruoqianfengshao/nodeseek-issue-template/main/NodeSeek%20Issue%20Templates.user.js)。

脚本覆盖 NodeSeek 全站，但只会在检测到帖子标题和 Markdown 编辑器的新帖页或编辑帖页面注入“出🐔模板”入口，不影响普通浏览页面。

## 功能

- 单机、多机书签编辑与统一标题生成
- 剩余价值、续费金额人民币换算和实时汇率
- 预出总价/溢价二选一校验与价格预览
- 文本与表格两种 Markdown 格式
- NodeImage 剩余价值卡片上传
- 新帖、编辑已有帖子均可使用
- 打开编辑帖弹窗时，自动解析当前 Markdown 并还原单机或多机书签表单

## 开发

依赖：Node.js 20 或更高版本。

```sh
node tools/build.js build
node --check 'NodeSeek Issue Templates.user.js'
git diff --check
```

源码位于 `src/`，本地厂商图标在 `assets/vendors/`。不要直接编辑根目录的 userscript 构建产物；修改源码后执行构建命令。

GitHub Actions 会在推送和 Pull Request 时重新构建，并验证构建产物没有未提交差异。
