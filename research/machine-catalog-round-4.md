# 第四批机器配置整理预览

采集时间：2026-08-10。完整的可导入候选见 [machine-catalog-round-4.csv](./machine-catalog-round-4.csv)，字段顺序与共享目录 API 的十个必填字段一致。**本批仅整理预览，尚未写入 D1。**

| 厂商 | 可导入条目 | 官方来源 | 收录规则 |
| --- | ---: | --- | --- |
| BestVM | 101 | [产品商店](https://bestvm.cloud/) | 保留商品页展示的基础规格、明确价格与周期；排除流量或带宽标为“起”的可变套餐。 |
| ZgoCloud | 121 | [产品目录](https://clients.zgovps.com/index.php?/products/) | 仅含普通 VPS 固定套餐及其在售付款周期；未收录 VDS、附加服务和售罄档位。 |
| SadIDC | 39 | [购物车](https://sadidc.com/cart) | 依据公开产品接口的现货固定 VPS；排除 CDN、虚拟主机、游戏云/NAT 云电脑、售罄或缺少流量字段的商品。 |
| CoreNetCloud | 0 | [云服务器](https://www.corenetcloud.com/cloud) | 公开接口可验证规格，但固定套餐均库存 0 且价格为 0 / 未给出续费周期，单列待补价，不导入。 |

## 可导入候选摘要

CSV 共 261 条：BestVM 101 条、ZgoCloud 121 条、SadIDC 39 条。所有记录均通过 Worker 的十字段规范化校验，署名与实际入库须在提交时使用 vico。

### BestVM 示例

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 周期 | 金额 | 币种 |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| 德国Pro-Special-1 | 1C | 1G | 10G | 500M | 1000G | 年付 | 492.00 | CNY 人民币 |
| 德国Pro-Special-2 | 1C | 2G | 15G | 500M | 3000G | 年付 | 984.00 | CNY 人民币 |
| 德国Pro-Special-3 | 2C | 2G | 20G | 500M | 5000G | 年付 | 1476.00 | CNY 人民币 |
| 美国Pro-Special-1 | 1C | 1G | 10G | 1000M | 1000G | 年付 | 276.00 | CNY 人民币 |
| 美国Pro-Special-2 | 1C | 2G | 15G | 1000M | 3000G | 年付 | 552.00 | CNY 人民币 |
| 美国Pro-Special-3 | 2C | 2G | 20G | 1000M | 5000G | 年付 | 828.00 | CNY 人民币 |
| 日本BGP-Special-1 | 1C | 1G | 10G | 1000M | 1000G | 年付 | 298.00 | CNY 人民币 |
| 日本BGP-Special-2 | 1C | 2G | 15G | 1000M | 3000G | 年付 | 598.00 | CNY 人民币 |

### ZgoCloud 示例

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 周期 | 金额 | 币种 |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| special-offer · DE Frankfurt AMD VPS - Specials - Starter | 1C | 1G | 10G | 200M | 1T | 年付 | 45.00 | USD 美元 |
| special-offer · DE Frankfurt AMD VPS - Specials - Standard | 2C | 2G | 20G | 200M | 2T | 年付 | 88.00 | USD 美元 |
| special-offer · Los Angeles AMD ISP VPS - Specials - Starter | 1C | 1G | 10G | 100M | 500G | 年付 | 58.00 | USD 美元 |
| special-offer · Los Angeles AMD ISP VPS - Specials - Standard | 2C | 2G | 20G | 100M | 1T | 年付 | 108.00 | USD 美元 |
| special-offer · Los Angeles AMD Optimised VPS - Specials - Standard | 2C | 2G | 20G | 200M | 1T | 年付 | 96.00 | USD 美元 |
| special-offer · HongKong AMD VPS - Specials - Starter | 1C | 1G | 10G | 100M | 500G | 年付 | 52.00 | USD 美元 |
| special-offer · HongKong AMD VPS - Specials - Standard | 2C | 2G | 20G | 100M | 1T | 年付 | 96.00 | USD 美元 |
| hongkong-amd-vps · Starter | 1C | 1G | 10G | 100M | 500G | 季付 | 18.00 | USD 美元 |

### SadIDC 示例

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 周期 | 金额 | 币种 |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| Us-Phoenix Lv1 | 1C | 1G | 10G | 5000M | 1T | 月付 | 9.90 | CNY 人民币 |
| Us-Phoenix Lv2 | 2C | 2G | 10G | 5000M | 2T | 月付 | 15.99 | CNY 人民币 |
| Us-Phoenix Lv3 | 2C | 4G | 15G | 10000M | 4T | 月付 | 29.99 | CNY 人民币 |
| Us-Phoenix Lv4 | 4C | 4G | 20G | 10000M | 8T | 月付 | 48.99 | CNY 人民币 |
| Us-Eagle Lv2 | 2C | 2G | 20G | 1000M | 10T | 月付 | 19.99 | CNY 人民币 |
| Us-Eagle Lv3 | 2C | 4G | 30G | 1000M | 15T | 月付 | 34.99 | CNY 人民币 |
| Us-Eagle Lv4 | 4C | 4G | 30G | 1000M | 30T | 月付 | 58.99 | CNY 人民币 |
| Us-Eagle Lv5 | 8C | 8G | 40G | 1000M | 30T | 月付 | 78.99 | CNY 人民币 |
| Tokyo-Elaina Lv1 | 1C | 1G | 10G | 500M | 512G | 月付 | 13.99 | CNY 人民币 |
| Tokyo-Elaina Lv2 | 2C | 2G | 20G | 500M | 1T | 月付 | 21.99 | CNY 人民币 |

## CoreNetCloud：已核验、待补价格与库存

下列为 [公开产品接口](https://www.corenetcloud.com/apiv1/console/v1/products) 返回的香港按流量固定规格。接口返回的 stock_qty 均为 0，且商品价格为 0；因此没有虚构金额或付款周期，不能导入目录。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 库存 | 价格 / 周期 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| HK.EN2.A | 1C | 1G | 20G | 100M | 250G | 0 | 待补（接口为 0） |
| HK.EN2.B | 2C | 2G | 30G | 200M | 500G | 0 | 待补（接口为 0） |
| HK.EN2.C | 4C | 4G | 50G | 300M | 1T | 0 | 待补（接口为 0） |
| HK.EN2.D | 8C | 8G | 100G | 500M | 2T | 0 | 待补（接口为 0） |
| HK.BGP.A | 1C | 1G | 20G | 1G | 2T | 0 | 待补（接口为 0） |
| HK.BGP.B | 2C | 2G | 30G | 1200M | 3T | 0 | 待补（接口为 0） |
| HK.BGP.C | 4C | 4G | 50G | 1500M | 5T | 0 | 待补（接口为 0） |
| HK.BGP.D | 8C | 8G | 100G | 2G | 10T | 0 | 待补（接口为 0） |

## 排除说明

- BestVM 排除 16 条：IEPL 流量“起”、带宽“起”的独享档及其它无法形成唯一固定配置的页面项目。
- ZgoCloud 排除 7 个售罄商品档位；VDS 与 IP/流量包附加服务不在 VPS 目录范围内。
- SadIDC 排除 20 条：售罄、缺少完整流量字段或不属于 VPS 的商品。
- “不限”“不限制”等公开描述统一记为 不限流量，以匹配当前前端流量字段选项。
