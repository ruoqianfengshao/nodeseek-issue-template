# 第三批机器配置入库候选

采集时间：2026-08-10。完整候选在 [machine-catalog-round-3.csv](./machine-catalog-round-3.csv)，格式与共享目录 API 的十个必填字段一致。本批仅收录官网当前可见、配置与价格/周期均完整的固定套餐；**尚未导入 D1**。

| 厂商 | 条目数 | 官方来源 | 备注 |
| --- | ---: | --- | --- |
| CSTServer | 8 | [Cloud Server 商店](https://cstserver.com/store.php?c=cloud) | 仅保留下单按钮可用的香港/美国固定 KVM 套餐；磁盘保留官网的 `40G+…GB` 写法。 |
| V.PS | 9 | [Cloud KVM VPS](https://v.ps/products/cloud-kvm-vps/)、[Edge KVM VPS](https://v.ps/products/edge-kvm-vps/)、[Storage KVM VPS](https://v.ps/products/storage-kvm-vps/)、[Mini KVM VPS](https://v.ps/products/mini-kvm-vps/)、[Nano KVM VPS](https://v.ps/products/nano-kvm-vps/) | 按官网区域与产品线拆分。 |
| RFCHost | 3 | [官网定价页](https://rfchost.com/#pricing) | 香港中国优化线路套餐。 |

## 候选清单

| 厂商 | 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 周期 | 金额 | 币种 |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| CSTServer | HK KVM Cloud 2H | 2C | 2G | 40G+20GB | 10M | 不限流量 | 月付 | 6.98 | USD 美元 |
| CSTServer | HK KVM Cloud 4H | 4C | 4G | 40G+40GB | 15M | 不限流量 | 月付 | 12.98 | USD 美元 |
| CSTServer | HK KVM Cloud 6H | 6C | 6G | 40G+60GB | 20M | 不限流量 | 月付 | 19.98 | USD 美元 |
| CSTServer | HK KVM Cloud 8H | 8C | 8G | 40G+80GB | 25M | 不限流量 | 月付 | 29.98 | USD 美元 |
| CSTServer | US KVM Cloud 1H | 1C | 1G | 40G+10GB | 10M | 不限流量 | 月付 | 4.98 | USD 美元 |
| CSTServer | US KVM Cloud 2H | 2C | 2G | 40G+20GB | 20M | 不限流量 | 月付 | 6.98 | USD 美元 |
| CSTServer | US KVM Cloud 4H | 4C | 4G | 40G+40GB | 30M | 不限流量 | 月付 | 12.98 | USD 美元 |
| CSTServer | US KVM Cloud 6H | 6C | 6G | 40G+60GB | 40M | 不限流量 | 月付 | 19.98 | USD 美元 |
| V.PS | Cloud KVM VPS · Asia Pacific | 2C | 1G | 20G | 1G | 1T | 月付 | 6.95 | EUR 欧元 |
| V.PS | Cloud KVM VPS · Europe | 2C | 1G | 20G | 1G | 1T | 月付 | 6.95 | EUR 欧元 |
| V.PS | Cloud KVM VPS · North America | 2C | 1G | 20G | 1G | 1T | 月付 | 8.95 | EUR 欧元 |
| V.PS | Edge KVM VPS · Asia Pacific | 1C | 2G | 20G | 1G | 1T | 月付 | 15.95 | EUR 欧元 |
| V.PS | Storage KVM VPS · Europe | 1C | 2G | 500G | 1G | 5T | 月付 | 6.95 | EUR 欧元 |
| V.PS | Mini KVM VPS · Asia Pacific | 1C | 1G | 15G | 400M | 500G | 年付 | 39.95 | EUR 欧元 |
| V.PS | Mini KVM VPS · Europe | 1C | 1G | 15G | 500M | 600G | 年付 | 49.95 | EUR 欧元 |
| V.PS | Mini KVM VPS · North America | 1C | 1G | 15G | 500M | 600G | 年付 | 49.95 | EUR 欧元 |
| V.PS | Nano KVM VPS · Europe | 1C | 1G | 15G | 1G | 1T | 年付 | 9.95 | EUR 欧元 |
| RFCHost | HK-CO-Mini | 1C | 1G | 15G | 200M | 1500G | 月付 | 24.99 | USD 美元 |
| RFCHost | HK-CO-Standard | 1C | 2G | 30G | 500M | 2500G | 月付 | 50.99 | USD 美元 |
| RFCHost | HK-CO-Advanced | 2C | 3G | 45G | 500M | 3500G | 月付 | 76.99 | USD 美元 |

## 待补采或排除

| 厂商 | 当前结论 |
| --- | --- |
| SadCloud | 已确认官网入口为 SadIDC，但公开页面未提供可完整核验的固定套餐。 |
| CoreNetCloud | 官网公开接口返回规格与库存，但价格与周期为 `0` / 缺失，不能作为续费价入库。 |
| ZgoCloud、BestVM | 当前 HTTPS 连接失败，未取得可验证官方页面。 |
| CloudLeadInno | 官网入口返回 404，未取得产品页。 |
| HostHatch、KFCloud | 官网为前端应用；未发现可匿名读取且同时包含规格、价格与周期的公开套餐接口。 |
| Isvoro | 已在第一批整理并入库 4 条，本批不重复。 |
