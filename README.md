# NodeSeek Issue Templates

为 NodeSeek 交易帖准备的 Tampermonkey 脚本。通过表单快速生成单机或多机交易帖的标题与 Markdown，减少重复填写，让配置信息更清晰、交易内容更易读。

## 安装

在 Tampermonkey 中直接安装：[NodeSeek Issue Templates.min.user.js](https://github.com/ruoqianfengshao/nodeseek-issue-template/releases/latest/download/NodeSeek.Issue.Templates.min.user.js)。

脚本覆盖 NodeSeek 全站，但只会在包含帖子标题和 Markdown 编辑器的新帖页或编辑帖页注入“出🐔模板”入口，不影响普通浏览。

## 使用界面

点击发帖页面的“出🐔模板”入口，填写机器配置、交易信息和常用标签后，即可生成可直接发布的内容；“收🐔模板”则提供独立的轻量收购表单。

![“出🐔模板”入口](docs/images/entry.png)

![模板主界面](docs/images/main-interface.png)

支持文本和表格两种 Markdown 格式，也可以在一篇帖子中整理多台机器。

| 文本格式 | 表格格式 |
| --- | --- |
| ![文本格式结果](docs/images/text-output.png) | ![表格格式结果](docs/images/table-output.png) |

![多机编辑](docs/images/multiple-machines.png)

可选导出剩余价值卡片，帮助买家快速了解剩余价值。

![剩余价值卡片](docs/images/remaining-value-card.png)

## 功能

- 支持厂商、型号、CPU、内存、硬盘、带宽、流量等配置的选择、匹配和自由新增
- 支持单机、多机书签编辑与统一标题生成
- 支持剩余价值计算、续费金额人民币换算和实时汇率；可选择是否导出价值卡片
- 支持预出总价与溢价二选一校验及价格预览
- 支持填写 NodeSeek / TQ 地址，以及常用标签快捷选择
- TG 地址本地缓存：填写一次后可自动回填
- 支持文本和表格两种 Markdown 导出格式
- 支持在发帖页一键设置抽奖，发布后自动把抽奖信息写进正文
- 支持新帖与编辑已有帖子；编辑时会自动解析当前 Markdown，还原单机或多机表单
- 支持独立的收🐔模板，可填写目标机器、配置、续费与交易要求，并选择溢价收、剩余价值折收、剩余价值收、总价收或带价聊

## 抽奖

发帖页「发布」按钮旁有独立的「🎁 抽奖配置」入口，只对当前页面这一次发布生效，重新打开发帖页就要重新填：

- 开奖时间（默认 24 小时后，使用日期时间选择器）、奖品数量、起始楼层（三项同一行）、楼层去重
- 参与方式合并写成一行，互动（点赞 / 鸡腿）排在回复内容（任意回复 / 包含回复 / 固定回复）前面
- 抽奖信息按配置写在正文末尾或开头；「显示信息」里可单独关闭参与方式、开奖时间、中奖人数的显示
- 「标题」默认 `# 🎁 抽奖信息`，会作为抽奖块的第一行写进正文（支持 Markdown，留空则不写标题行）
- 弹窗左侧是抽奖信息与参与方式，右侧是正文回写配置和实时预览
- 回复内容选「包含回复」「固定回复」时，要求回复的内容会以 Markdown 引用（`> xxx`）写在参与方式下方，方便参与者直接复制
- 参与方式不是单纯「任意回复」时，会多出「不满足条件时顺延至下一位」的勾选项，勾上后这行会写进正文

点「保存本次抽奖」会把这块模板直接插入正文，开奖链接里的帖子 ID 先写占位符 `__POST_ID__`，你可以在编辑器里自己审阅、调整位置或补充说明。之后照常用 NodeSeek 自己的「发布」按钮发帖：帖子发出后脚本只做一件事——把正文里的 `__POST_ID__` 换成真实帖子 ID，其余内容一律不动。

几点行为约定：重复保存会替换掉上一次插入的那一块，不会堆叠；如果正文里那块被手动改过、或者刷新后配置已失效导致匹配不上，保存时会二次弹窗让你选择「保留编辑器内容」还是「强制覆盖」（强制覆盖会删掉旧的那块再按本次配置插入）。发布时只有「正文里确实写着 `__POST_ID__`」且「本地还留着这次的抽奖配置」两个条件同时成立，脚本才会去替换 ID；任意一条不满足就完全不碰帖子，按普通流程发布——所以想把抽奖撤掉，直接把正文里那块模板删掉即可。万一发布后的替换失败（例如站点结构变化），右下角会给出提醒和可复制的链接。

抽奖链接使用 NodeSeek 官方 [抽奖程序](https://www.nodeseek.com/lucky) 的格式。NodeSeek 的抽奖工具仅按楼层计算，点赞、鸡腿和回复内容只能写进说明，需要自行核对。

## 配置共建

机器型号和市场变化很快，因此脚本提供了可选的配置共建机制。

启用“提交时检查机器配置”后，生成帖子时会检查当前机器配置；数据库中没有的配置会被登记为新的可复用配置。若不希望提交配置，关闭该选项即可，脚本不会检查或上报机器信息。

![配置提交选项](docs/images/catalog-submission.png)

已登记的配置会记录贡献者，方便查看自己贡献过的机器配置。

![已登记配置](docs/images/catalog-contributions.png)

填写型号时，可根据输入内容搜索已登记配置；选中后会自动回填厂商、型号、CPU、内存、硬盘、带宽、流量、续费周期和续费金额，并展示贡献者昵称。

![配置自动回填](docs/images/catalog-autofill.png)

## 后续规划

- 增加更多个人配置，减少重复填写
- 增加收机帖模板能力
- 在完成官方认证后，探索已上报机器的删除与管理能力
- 支持机器以外的交易内容

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
