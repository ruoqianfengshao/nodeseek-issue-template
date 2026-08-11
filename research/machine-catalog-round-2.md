# 第二批机器配置入库候选

采集时间：2026-07-30。完整可校对数据见 [machine-catalog-round-2.csv](./machine-catalog-round-2.csv)。

CSV 严格使用当前 API 的十个必填字段：

```text
vendor,model,cpu,memory,disk,bandwidth,traffic,renewalCycle,renewalAmount,currency
```

每一行都是一条独立的唯一配置。续费周期或金额不同的同规格套餐，会拆为不同记录。

| 厂商 | 条目数 | 来源 | 说明 |
| --- | ---: | --- | --- |
| 搬瓦工 | 183 | [官方配置接口](https://bandwagonhost.com/order/get-data) | 48 个套餐、183 个有效的金额/周期组合；接口当前标记均可订 |
| Evoxt | 33 | [官方价格页](https://evoxt.com/pricing/) | Standard、Premium、Premium Plus 各 11 条；型号中已包含网络组，以区分不同流量 |
| GoMami | 6 | [官方首页/商店](https://gomami.io/store) | Peak X5 与 Plus 各 3 条 |
| AndNode | 6 | [官方轻量服务器购物车](https://cloud.andnode.com/cart?fid=2) | 香港轻量固定规格；采集时各自库存为 1、5、5、4、5、4 |
| Geelinx | 3 | [官方香港计算型套餐](https://www.geelinx.com/cart?fid=6&gid=20) | 香港 INTL 三个可订固定套餐 |
| 华纳云 | 4 | [官方香港云服务器页](https://www.hncloud.com/hk_ecs.html) | 香港 CN2 云服务器；售价使用页面显示的当前优惠续费价格 |

## 暂不纳入的来源

- LightLayer：官网公开套餐未给出硬盘容量，无法填满必填字段。
- VMRack：VPS 是自定义配置器，未选资源时没有固定续费价。
- AkkoCloud：本次访问其剩余地区被官方安全策略拦截；不会把上次合并展示的数据直接加入候选。
- DediRock Buffalo：当前访问遇到安全验证，未能再取得可校验规格。
- VMISS、DMIT、NovixLink：官网访问受安全策略限制。
- NoBrand、Goumami 旧域名、Wawo：当前均为域名出售页或已失效入口。

## 校对建议

1. 搬瓦工接口给出的 RAM 是精确 MiB 值（例如 32678MiB），CSV 原样写作 `32678M`，不强行四舍五入成 `32G`，避免把不同规格合并。
2. `不限` 流量作为文本字段可入库，不会与数值流量配置重复；华纳云 4 条使用此格式。
3. 华纳云页面同时展示原价和当前优惠价，CSV 选择当前显示的价格（首个金额）。
4. 此文件仅为候选清单，尚未导入 D1。
