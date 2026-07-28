# 共享机器配置 Worker

Cloudflare Worker + D1 API，为油猴脚本提供共享机器配置的精确查重、厂商/型号模糊搜索与首次收录。

## 部署

需要 Node.js 20+ 与已登录的 Cloudflare Wrangler。

```sh
cd worker
npx wrangler login
npx wrangler d1 create nsit-machine-catalog
```

将命令返回的数据库 ID 填入 `wrangler.toml` 的 `database_id`，然后执行：

```sh
npx wrangler d1 migrations apply nsit-machine-catalog --remote
npx wrangler deploy
```

部署成功后，将 Worker URL 填入 [`src/config.js`](../src/config.js) 的 `MACHINE_CATALOG_API_URL`，再在仓库根目录构建 userscript：

```sh
node tools/build.js build
```

## 接口

- `GET /v1/machine-configs/exact`：七项配置精确预查询。
- `GET /v1/machine-configs/search?vender=…&model=…`：厂商、型号独立模糊搜索，最多 30 条。
- `POST /v1/machine-configs`：新增配置；唯一键冲突时返回已有记录，保留首位收录昵称。

接口仅允许 `https://www.nodeseek.com` 作为跨域来源。昵称仅作为展示署名，不作身份验证；脚本无法读取当前页面昵称时不会新增记录。
