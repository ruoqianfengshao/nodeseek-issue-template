# NodeSeek Issue Templates

NodeSeek 交易帖模板油猴脚本：用表单生成单机或多机交易帖，并回填标题、Markdown 与剩余价值卡片。

## 安装

在 Tampermonkey 中点击安装：[NodeSeek Issue Templates.min.user.js](https://github.com/ruoqianfengshao/nodeseek-issue-template/releases/latest/download/NodeSeek.Issue.Templates.min.user.js)。

脚本覆盖 NodeSeek 全站，但只会在检测到帖子标题和 Markdown 编辑器的新帖页或编辑帖页面注入“出🐔模板”入口，不影响普通浏览页面。

## 功能

- 单机、多机书签编辑与统一标题生成
- 剩余价值、续费金额人民币换算和实时汇率
- 预出总价/溢价二选一校验与价格预览
- 文本与表格两种 Markdown 格式
- NodeImage 剩余价值卡片上传
- 新帖、编辑已有帖子均可使用
- 打开编辑帖弹窗时，自动解析当前 Markdown 并还原单机或多机书签表单
- 共享机器配置：按厂商、型号、CPU、内存、硬盘、带宽、流量搜索并一键回填；生成帖子前自动收录首次出现的配置

## 开发

依赖：Node.js 20 或更高版本。

```sh
node tools/build.js build
node --check 'NodeSeek Issue Templates.user.js'
node --check 'NodeSeek Issue Templates.min.user.js'
git diff --check
```

源码位于 `src/`，本地厂商图标在 `assets/vendors/`。根目录的 `NodeSeek Issue Templates.user.js` 与 `NodeSeek Issue Templates.min.user.js` 分别是可读版和压缩版构建产物，不直接编辑；修改源码后执行构建命令。

GitHub Actions 会在推送和 Pull Request 时重新构建，并验证构建产物没有未提交差异。推送 `v*` 标签会自动创建 GitHub Release 并附带两份脚本。

## 共享配置服务

服务端位于 [`worker/`](worker/README.md)，部署到 Cloudflare Workers + D1。部署后将 Worker 地址填入 [`src/config.js`](src/config.js) 的 `MACHINE_CATALOG_API_URL`，再构建并发布 userscript。
