# 机器配置市场入库预览

采集时间：2026-07-30。此文件与同目录的 CSV 一一对应，**每一行都可直接作为一条机器配置入库**，列顺序和接口字段完全一致：

```text
vendor, model, cpu, memory, disk, bandwidth, traffic, renewalCycle, renewalAmount, currency
```

例如：

```json
{
  "vendor": "MoeCloud",
  "model": "UK Special Plan micro",
  "cpu": "1C",
  "memory": "1G",
  "disk": "10G",
  "bandwidth": "500M",
  "traffic": "1T",
  "renewalCycle": "年付",
  "renewalAmount": "549",
  "currency": "CNY 人民币"
}
```

## 已排除的内容

- `起` 配置的可选配套餐：实际下单配置不固定。
- 未给出硬盘、流量或续费价格的页面概览。
- 独服、托管、vGPU 等附加项：先不与 VPS 配置混入。
- “不限流量”套餐：当前 Worker 可将其保存为文本键；是否收录仍待你决定。
- 搬瓦工与 Evoxt：分别有 48 / 33 条固定套餐，下一批会按相同格式逐条展开，不再用系列合并写法。

## 第一批：37 条固定 VPS 配置

| 厂商 | 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 周期 | 金额 | 币种 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MoeCloud | UK Special Plan mini | 1C | 1G | 10G | 1000M | 500G | 年付 | 349 | CNY 人民币 |
| MoeCloud | UK Special Plan micro | 1C | 1G | 10G | 500M | 1T | 年付 | 549 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super 1C/1G 450G | 1C | 1G | 10G | 200M | 450G | 月付 | 59 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super 1C/1G 900G | 1C | 1G | 10G | 200M | 900G | 月付 | 119 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super HighData 1C/1G | 1C | 1G | 10G | 50M | 1.3T | 月付 | 119 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super Commercial 1C/2G | 1C | 2G | 15G | 1000M | 2048G | 月付 | 259 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super Commercial 2C/4G/6T | 2C | 4G | 30G | 1000M | 6T | 月付 | 769 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super Commercial 2C/4G/10T | 2C | 4G | 30G | 1000M | 10T | 月付 | 1199 | CNY 人民币 |
| MoeCloud | UK CN2 GIA Super Commercial 4C/8G | 4C | 8G | 60G | 1000M | 20T | 月付 | 2399 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-A2 mini 年付特惠套餐 | 1C | 1G | 15G | 1000M | 800G | 年付 | 449 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-B1 mini 年付特惠套餐 | 1C | 1G | 20G | 1000M | 1200G | 年付 | 699 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-B1 | 1C | 1.5G | 20G | 1000M | 1500G | 月付 | 129.99 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-B2 | 1C | 2G | 30G | 1000M | 3T | 月付 | 233 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-C1 | 1C | 2G | 30G | 1000M | 4T | 月付 | 388.88 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-D1 | 2C | 4G | 40G | 1000M | 6T | 月付 | 588.88 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-E1 | 4C | 8G | 60G | 1000M | 9T | 月付 | 888.88 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-F1 | 4C | 8G | 60G | 1000M | 12T | 月付 | 1188.88 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-U1 | 2C | 2G | 20G | 30M | 不限 | 月付 | 1200 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-U2 | 4C | 8G | 50G | 50M | 不限 | 月付 | 2100 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-U3 | 4C | 8G | 80G | 100M | 不限 | 月付 | 4200 | CNY 人民币 |
| AkkoCloud | 美国圣何塞 KVM-CN2-U4 | 8C | 16G | 100G | 200M | 不限 | 月付 | 8400 | CNY 人民币 |
| RackNerd | KVM VPS 512MB | 1C | 512M | 30G | 1000M | 500G | 年付 | 26.99 | USD 美元 |
| RackNerd | KVM VPS 1GB | 2C | 1G | 50G | 1000M | 1T | 月付 | 17.99 | USD 美元 |
| RackNerd | KVM VPS 2GB | 3C | 2G | 75G | 1000M | 2T | 月付 | 20.59 | USD 美元 |
| RackNerd | KVM VPS 4GB | 4C | 4G | 130G | 1000M | 3T | 月付 | 24.59 | USD 美元 |
| RackNerd | KVM VPS 6GB | 5C | 6G | 170G | 1000M | 4T | 月付 | 27.59 | USD 美元 |
| RackNerd | KVM VPS 8GB | 6C | 8G | 220G | 1000M | 5T | 月付 | 36.59 | USD 美元 |
| RackNerd | KVM VPS 12GB | 7C | 12G | 300G | 1000M | 6T | 月付 | 55.99 | USD 美元 |
| DediRock | Los Angeles KVM VPS Starter | 1C | 1G | 20G | 1000M | 750G | 月付 | 5.99 | USD 美元 |
| DediRock | Los Angeles KVM VPS Essentials | 2C | 2G | 40G | 1000M | 1T | 月付 | 8.99 | USD 美元 |
| DediRock | Los Angeles KVM VPS Plus | 4C | 4G | 100G | 1000M | 2T | 月付 | 12.99 | USD 美元 |
| DediRock | Los Angeles KVM VPS Advanced | 6C | 8G | 200G | 1000M | 2T | 月付 | 19.99 | USD 美元 |
| DediRock | Los Angeles KVM VPS Premium | 8C | 16G | 300G | 1000M | 4T | 月付 | 34.99 | USD 美元 |
| Isvoro | DE 9929 Core | 1C | 1G | 5G | 200M | 1T | 月付 | 19.9 | CNY 人民币 |
| Isvoro | DE 9929 Core | 1C | 1G | 5G | 200M | 1T | 年付 | 199 | CNY 人民币 |
| Isvoro | DE 9929 Standard | 1C | 1G | 10G | 300M | 2T | 月付 | 39.9 | CNY 人民币 |
| Isvoro | DE 9929 Pro | 2C | 2G | 20G | 500M | 2.5T | 月付 | 59 | CNY 人民币 |

注意：这里的 `不限` 在数据库中可保存，其标准化键是字符串，不会与数字流量混淆；表格保留这四条，由你决定是否纳入。
