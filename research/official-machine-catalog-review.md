# 机器配置市场：首批官方套餐校对清单

> 采集时间：2026-07-29（Asia/Shanghai）
> 用途：人工校对，不会自动写入 D1。价格、库存和促销随时可能变动；请以每行的官方链接为准。

## 字段与标记

- `库存` 仅记录页面实际显示的数量或状态：`页面未显示` 不等于有货。
- `流量` 未特别标注时均为每月；`不限` 保留为不限，不折算为数值。
- `起` 表示销售页是可选配产品的最低规格，不能直接当作固定套餐入库。
- 当前建议仅把有完整固定规格的行列为“候选”；托管、附加项、定制器不进入机器配置市场。

## 采集覆盖情况

| 厂商 | 来源 | 已读取的公开条目 | 备注 |
| --- | --- | ---: | --- |
| MoeCloud | [官方商店](https://lite.moe/index.php/store) | 9 | 固定套餐，页面给出可用数 |
| AkkoCloud | [官方商店](https://www.akkocloud.com/cart.php?gid=17) | 45 | 32 VPS、10 独服、3 托管；页面未显示库存 |
| 搬瓦工 | [官方 VPS 页面](https://bandwagonhost.com/vps-hosting.php) | 48 | 官方公开配置接口显示均可订 |
| Evoxt | [官方价格页](https://evoxt.com/pricing/) | 33 | 三种网络组各 11 档 |
| RackNerd | [官方 KVM VPS 页面](https://www.racknerd.com/kvm-vps) | 7 | 固定套餐，页面提供下单入口 |
| LightLayer | [官方价格页](https://lightlayer.net/pricing-eo) | 3 | 官网仅展示 3 档概览 |
| AndNode | [官方购物车](https://cloud.andnode.com/cart?fid=1) | 18 | 有库存数量；部分为“起”配置 |
| Geelinx | [官方购物车](https://www.geelinx.com/cart?fid=1) | 8 | 含售罄项；不含 vGPU 附加项 |
| Isvoro | [官方选购页](https://isvoro.com/buy) | 3 | 德国 9929 预售套餐 |
| VMRack | [官方价格页](https://www.vmrack.net/pricing) | 3 | 固定独服均售罄；VPS 为定制器 |
| DediRock | [官方洛杉矶 KVM VPS](https://dedirock.com/kvm-vps-los-angeles/) | 5 | 固定套餐 |

## 1. MoeCloud

来源：[官方商店](https://lite.moe/index.php/store)。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 | 库存 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UK Special Plan mini | 1 vCPU | 1G DDR4 | 10GB SSD RAID1 | 1000Mbps | 500G | CNY 349/年（原 499） | 3 |
| UK Special Plan micro | 1 vCPU | 1G DDR4 | 10GB SSD RAID1 | 500Mbps | 1000G | CNY 549/年 | 4 |
| UK CN2 GIA Super 1C/1G 450G | Gold 6139 × 1 | 1G DDR4 | 10GB SSD RAID1 | 200Mbps | 450G | CNY 59/月 | 0 |
| UK CN2 GIA Super 1C/1G 900G | Gold 6139 × 1 | 1G DDR4 | 10GB SSD RAID1 | 200Mbps | 900G | CNY 119/月 | 0 |
| UK CN2 GIA Super HighData 1C/1G | Gold 6139 × 1 | 1G DDR4 | 10GB SSD RAID1 | 50Mbps | 1.3T | CNY 119/月 | 0 |
| UK CN2 GIA Super Commercial 1C/2G | Gold 6139 × 1 | 2G DDR4 | 15GB SSD RAID1 | 1000Mbps | 2048G | CNY 259/月 | 0 |
| UK CN2 GIA Super Commercial 2C/4G/6T | Gold 6139 × 2 | 4G DDR4 | 30GB SSD RAID1 | 1000Mbps | 6T | CNY 769/月 | 3 |
| UK CN2 GIA Super Commercial 2C/4G/10T | Gold 6139 × 2 | 4G DDR4 | 30GB SSD RAID1 | 1000Mbps | 10T | CNY 1199/月 | 1 |
| UK CN2 GIA Super Commercial 4C/8G | Gold 6139 × 4 | 8G DDR4 | 60GB SSD RAID1 | 1000Mbps | 20T | CNY 2399/月 | 1 |

## 2. AkkoCloud

来源：美国 [圣何塞 CN2 GIA](https://www.akkocloud.com/cart.php?gid=17)、[法兰克福 CN2 GIA](https://www.akkocloud.com/cart.php?gid=7)、[伦敦 CN2 GIA](https://www.akkocloud.com/cart.php?gid=27)。所有 VPS 行均为“页面未显示库存”。

### 美国圣何塞 CN2 GIA

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- |
| KVM-CN2-A2 mini 年付 | 1 vCPU | 1G | 15GB SSD | 1000Mbps | 800G | CNY 449/年 |
| KVM-CN2-B1 mini 年付 | 1 vCPU | 1G | 20GB SSD | 1000Mbps | 1200G | CNY 699/年 |
| KVM-CN2-B1 | 1 vCPU | 1.5G | 20GB SSD | 1000Mbps | 1500G | CNY 129.99/月 |
| KVM-CN2-B2 | 1 vCPU | 2G | 30GB SSD | 1000Mbps | 3000G | CNY 233/月 |
| KVM-CN2-C1 | 1 vCPU | 2G | 30GB SSD | 1000Mbps | 4000G | CNY 388.88/月 |
| KVM-CN2-D1 | 2 vCPU | 4G | 40GB SSD | 1000Mbps | 6000G | CNY 588.88/月 |
| KVM-CN2-E1 | 4 vCPU | 8G | 60GB SSD | 1000Mbps | 9000G | CNY 888.88/月 |
| KVM-CN2-F1 | 4 vCPU | 8G | 60GB SSD | 1000Mbps | 12T | CNY 1188.88/月 |
| KVM-CN2-U1 | 2 vCPU | 2G | 20GB SSD | 30Mbps | 不限 | CNY 1200/月 |
| KVM-CN2-U2 | 4 vCPU | 8G | 50GB SSD | 50Mbps | 不限 | CNY 2100/月 |
| KVM-CN2-U3 | 4 vCPU | 8G | 80GB SSD | 100Mbps | 不限 | CNY 4200/月 |
| KVM-CN2-U4 | 8 vCPU | 16G | 100GB SSD | 200Mbps | 不限 | CNY 8400/月 |

### 法兰克福 / 伦敦 CN2 GIA

| 地区 | 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 法兰克福 | A2 mini 年付 | 1 | 1G | 15GB SSD | 1000Mbps | 800G | CNY 449/年 |
| 法兰克福 | B1 mini 年付 | 1 | 1G | 20GB SSD | 1000Mbps | 1200G | CNY 699/年 |
| 法兰克福 | B1 / B2 / C1 | 1 | 1.5G / 2G / 2G | 20GB / 30GB / 30GB SSD | 1000Mbps | 1500G / 3000G / 4000G | CNY 129.99 / 299.99 / 459.99 月付 |
| 法兰克福 | D1 / E1 / F1 | 2 / 4 / 4 | 4G / 8G / 8G | 40GB / 60GB / 60GB SSD | 1000Mbps | 6000G / 9000G / 12T | CNY 699.99 / 1049.99 / 1399.99 月付 |
| 法兰克福 | U1 / U2 / U3 / U4 | 2 / 4 / 4 / 8 | 2G / 8G / 8G / 16G | 20GB / 50GB / 80GB / 100GB SSD | 30 / 50 / 100 / 200Mbps | 不限 | CNY 1200 / 2100 / 4200 / 8400 月付 |
| 伦敦 | A2 mini 年付 | 1 | 1G | 15GB SSD | 1000Mbps | 800G | CNY 449/年 |
| 伦敦 | B1 mini 年付 | 1 | 1G | 20GB SSD | 1000Mbps | 1200G | CNY 699/年 |
| 伦敦 | B1 / B2 / C1 | 1 | 1.5G / 2G / 2G | 20GB / 30GB / 30GB SSD | 1000Mbps | 1500G / 3000G / 4000G | CNY 129.99 / 299.99 / 459.99 月付 |
| 伦敦 | D1 / E1 / F1 | 2 / 4 / 4 | 4G / 8G / 8G | 40GB / 60GB / 60GB SSD | 1000Mbps | 6000G / 9000G / 12T | CNY 699.99 / 1049.99 / 1399.99 月付 |

### 独立服务器（不建议与 VPS 混入同一搜索结果）

| 地区/型号 | CPU | 内存 | 硬盘 | 带宽/流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- |
| 圣何塞 9929 E5-2697v2 PLAN1 / PLAN2 | E5-2697v2 × 2（24C/48T） | 256G DDR3 | 2TB SSD | 500Mbps / 1000Mbps，9929 | CNY 15000 / 26000 月付 |
| 圣何塞 CN2 GIA E5-2697v2 PLAN1 / PLAN2 | E5-2697v2 × 2（24C/48T） | 256G DDR3 | 2TB SSD | 500Mbps / 1000Mbps，CN2 GIA | CNY 25000 起 / 50000 月付 |
| 圣何塞 E5-2650v4 | E5-2650v4 × 2（24C/48T） | 128G DDR4 | 1TB SSD | 100Mbps BGP 或 30Mbps CN2 GIA 或 50Mbps 9929 | CNY 2300 起/月 |
| 法兰克福 CN2 GIA-5950X | R9 5950X（16C/32T） | 128G DDR4 | 2×3.84TB SSD | 500Mbps CN2 GIA | CNY 25800/月 |
| 法兰克福 9929-5950X | R9 5950X（16C/32T） | 128G DDR4 | 2×3.84TB SSD | 页面写 500Mbps CN2 GIA，待核对线路名 | CNY 25800/月 |
| 伦敦 CN2 GIA E5-2650v4 | E5-2650v4 × 2（24C/48T） | 128G DDR4 | 6×480GB SSD | 500Mbps CN2 GIA | CNY 28500/月 |
| 伦敦 CN2 GIA Silver 4214 | Silver 4214 × 2（24C/48T） | 128G DDR4 | 3×480GB SSD | 500Mbps CN2 GIA | CNY 29000/月 |
| 伦敦 CN2 GIA EPYC 7552 | EPYC 7552 × 2（96C/192T） | 512G DDR4 | 10×1TB SSD | 500Mbps CN2 GIA | CNY 33000/月 |

## 3. 搬瓦工（BandwagonHost）

来源：[官方 VPS 价格页](https://bandwagonhost.com/vps-hosting.php)。官方配置接口当前返回 48 个产品、`outOfStock: false`；下表用系列矩阵完整保留配置。

### Basic VPS（可订）

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- |
| 20G KVM PROMO | 2C | 1G | 20G | 1000Mbps | 1T | USD 49.99/年 |
| 40G KVM PROMO | 3C | 2G | 40G | 1000Mbps | 2T | USD 52.99/半年；99.99/年 |
| 80G / 160G / 320G / 480G KVM PROMO | 4 / 5 / 6 / 7C | 4 / 8 / 16 / 24G | 80 / 160 / 320 / 480G | 1000Mbps | 3 / 4 / 5 / 6T | USD 19.99 / 39.99 / 79.99 / 119.99 月付（另有季/半年/年） |

### CN2 GIA E-Commerce（可订）

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 最低可选周期价格 |
| --- | --- | --- | --- | --- | --- | --- |
| 20G / 40G V5 | 2 / 3C | 1 / 2G | 20 / 40G | 2500Mbps | 1 / 2T | USD 49.99 / 89.99 季付 |
| 80G / 160G / 320G V5 | 4 / 6 / 8C | 4 / 8 / 16G | 80 / 160 / 320G | 2500 / 5000 / 5000Mbps | 3 / 5 / 8T | USD 56.99 / 86.99 / 159.99 月付 |
| 640G / 1280G V5 | 10 / 12C | 32 / 64G | 640 / 1280G | 10000Mbps | 10 / 12T | USD 289.99 / 549.99 月付 |
| 1280G HIBW 15T / 20T | 12C | 64G | 1280G | 10000Mbps | 15 / 20T | USD 679 / 899 月付 |

### CN2 GIA Ultra：香港、东京、大阪、新加坡（可订）

| 地区 | 型号序列 | CPU/内存/硬盘 | 带宽 | 流量 | 起始月付 |
| --- | --- | --- | --- | --- | --- |
| 香港 | 40G / 80G / 160G / 320G / 640G / 1280G | 2C2G40G → 12C64G1280G | 1000Mbps | 500G → 8T | USD 89.99 |
| 东京 | 40G / 80G / 160G / 320G / 640G / 1280G | 2C2G40G → 12C64G1280G | 1200Mbps | 500G → 8T | USD 89.99 |
| 大阪 | 40G / 80G / 160G / 320G / 640G / 1280G | 2C2G40G → 12C64G1280G | 1500Mbps | 500G → 8T | USD 49.99 |
| 新加坡 | 40G / 80G / 160G / 320G / 640G / 1280G | 2C2G40G → 12C64G1280G | 1500 / 1500 / 2500 / 2500 / 5000 / 5000Mbps | 500G → 8T | USD 49.99 |

### E-Commerce SLA Los Angeles（可订）

| 型号序列 | CPU/内存/硬盘 | 带宽 | 流量 | 起始月付 |
| --- | --- | --- | --- | --- |
| 20G / 40G / 80G / 160G / 320G / 640G / 1280G | 2C1G20G → 12C64G1280G | 2500 / 2500 / 2500 / 5000 / 5000 / 10000 / 10000Mbps | 1 / 2 / 3 / 5 / 8 / 10 / 12T | USD 65.89 季付 / 116.99 季付 / 69.99 / 109.99 / 199.99 / 369.99 / 699.99 月付 |
| 1280G HIBW 15T / 20T | 12C / 64G / 1280G | 10000Mbps | 15 / 20T | USD 879.99 / 1159.99 月付 |

## 4. Evoxt

来源：[官方价格页](https://evoxt.com/pricing/)，三种网络的 CPU、内存、硬盘、价格一致，区别在月流量；端口均为 1Gbps，均含周备份。

| 型号 | CPU | 内存 | 硬盘 | 月付 |
| --- | --- | --- | --- | --- |
| VM-0.5 | 1C | 512MB | 5GB | USD 2.99（Premium Plus 为 3.49） |
| VM-0.75 | 1C | 1G | 10GB | USD 4.99 |
| VM-1 | 1C | 2G | 20GB | USD 5.99 |
| VM-1.5 | 2C | 2G | 20GB | USD 6.95 |
| VM-2 | 2C | 4G | 30GB | USD 11.99 |
| VM-3 | 4C | 4G | 30GB | USD 14.99 |
| VM-4 | 4C | 8G | 60GB | USD 23.99 |
| VM-6 | 8C | 8G | 60GB | USD 29.99 |
| VM-8 | 8C | 16G | 80GB | USD 47.99 |
| VM-12 | 16C | 16G | 80GB | USD 60.95 |
| VM-16 | 16C | 32G | 100GB | USD 95.99 |

| 网络组 | 覆盖地区 | VM-0.5 → VM-16 的月流量 |
| --- | --- | --- |
| Standard | 美国、英国、加拿大、德国、波兰、阿姆斯特丹、东京、马来西亚、澳大利亚 | 500G / 750G / 1T / 1.5T / 2T / 3T / 4T / 5T / 6T / 8T / 10T |
| Premium | 香港、大阪 | 250G / 250G / 500G / 500G / 1T / 1T / 2T / 2T / 3T / 3T / 5T |
| Premium Plus | 马来西亚 Premium | 150G / 250G / 300G / 300G / 600G / 700G / 1T / 1.25T / 2T / 2.5T / 4T |

## 5. RackNerd

来源：[官方 KVM VPS 页面](https://www.racknerd.com/kvm-vps)。页面提供“Order now”，未显示具体库存。

| 型号（以内存命名） | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- |
| 512MB RAM | 1 vCore | 512MB | 30GB RAID-10 SSD | 1Gbps | 500G | USD 26.99/年 |
| 1GB RAM | 2 vCore | 1G | 50GB RAID-10 SSD | 1Gbps | 1T | USD 17.99/月 |
| 2GB RAM | 3 vCore | 2G | 75GB RAID-10 SSD | 1Gbps | 2T | USD 20.59/月 |
| 4GB RAM | 4 vCore | 4G | 130GB RAID-10 SSD | 1Gbps | 3T | USD 24.59/月 |
| 6GB RAM | 5 vCore | 6G | 170GB RAID-10 SSD | 1Gbps | 4T | USD 27.59/月 |
| 8GB RAM | 6 vCore | 8G | 220GB RAID-10 SSD | 1Gbps | 5T | USD 36.59/月 |
| 12GB RAM | 7 vCore | 12G | 300GB RAID-10 SSD | 1Gbps | 6T | USD 55.99/月 |

## 6. LightLayer

来源：[官方价格页](https://lightlayer.net/pricing-eo)。官网没有给出硬盘容量，也未显示库存，因此这些行不适合直接入库。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- |
| Startup | 1C | 1G | 未展示 | 100Mbps | 不限 | USD 4/月 |
| Pay As You Go（起） | 2C 起 | 2G 起 | 未展示 | 200Mbps 起 | 不限 | USD 5.6/月起 |
| Business | 32C | 32G | 未展示 | 200Mbps | 不限 | USD 53.6/月 |

## 7. AndNode

来源：[云服务器购物车](https://cloud.andnode.com/cart?fid=1)、[轻量服务器购物车](https://cloud.andnode.com/cart?fid=2)。云服务器基础/专业/进阶均为“起”配置，建议只作为待确认候选。

| 地区/型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 | 库存 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 香港 CN2 基础 / 专业 / 进阶 | 2 / 8 / 20C 起 | 2 / 8 / 20G 起 | 50 / 60 / 70G 起 | 10 / 30 / 50Mbps 起 | 不限 | CNY 18 / 88 / 288 月付 | 8 / 8 / 10 |
| 美国 9929 标准 / 高端 / 旗舰 | 2 / 8 / 20C 起 | 2 / 8 / 20G 起 | 30 / 50 / 70G 起 | 30 / 50 / 70Mbps 起 | 不限 | CNY 18 / 88 / 288 月付 | 22 / 3 / 2 |
| 日本国际 标准 / 高端 / 旗舰 | 2 / 8 / 20C 起 | 2 / 8 / 20G 起 | 40 / 50 / 70G 起 | 40 / 70 / 100Mbps 起 | 不限 | CNY 20 / 99 / 299 月付 | 0 / 10 / 11 |
| 香港 CTG 标准 / 高端 / 旗舰 | 2 / 8 / 20C 起 | 2 / 8 / 20G 起 | 30 / 50 / 70G 起 | 20 / 40 / 60Mbps 起 | 不限 | CNY 18 / 88 / 288 月付 | 0 / 4 / 0 |
| 香港轻量 Z | 2C | 2G | 50G | 20Mbps | 500G | CNY 16/月 | 2 |
| 香港轻量 Y | 2C | 4G | 50G | 30Mbps | 500G | CNY 26/月 | 6 |
| 香港轻量 X | 4C | 4G | 50G | 40Mbps | 500G | CNY 36/月 | 4 |
| 香港轻量 W | 4C | 8G | 60G | 40Mbps | 500G | CNY 56/月 | 4 |
| 香港轻量 V | 8C | 8G | 70G | 50Mbps | 500G | CNY 76/月 | 5 |
| 香港轻量 U | 10C | 10G | 80G | 60Mbps | 500G | CNY 96/月 | 4 |

## 8. Geelinx

来源：[官方购物车](https://www.geelinx.com/cart?fid=1)。不含两项仅可购买的 vGPU 附加项。

| 地区/型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 | 库存 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| London BGP Darwin | 2 vCPU | 2G | 20G | 100Mbps | 500G，仅出站 | EUR 4.99/月 | 0 |
| 香港 INTL Lion | 4 vCPU | 8G | 100G | 2Gbps（公平使用） | 4T | EUR 12.90/月 | 5 |
| 香港 INTL Harbour | 6 vCPU | 12G | 150G | 2Gbps（公平使用） | 6T | EUR 16.90/月 | 7 |
| 香港 INTL Peak | 8 vCPU | 16G | 200G | 2Gbps（公平使用） | 8T | EUR 19.90/月 | 6 |
| 阿姆斯特丹 INTL Rembrandt | 2 vCPU | 2G | 40G 高速盘 | 1Gbps（公平使用） | 1T，仅出站 | EUR 29/年 | 0 |
| 阿姆斯特丹 INTL Vermeer | 2 vCPU | 2G | 40G 高速盘 | 1Gbps（公平使用） | 1T，仅出站 | EUR 29/年 | 0 |
| 芝加哥 INTL Wicker | 4 vCPU | 8G | 80G | 3Gbps（公平使用） | 2T，仅出站 | EUR 29/年 | 0 |

## 9. Isvoro

来源：[官方选购页](https://isvoro.com/buy)。均标为预售，预计 8 月 1 日发货，页面显示的是剩余预售名额。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 | 预售余量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DE 9929 Core | 1C | 1G | 5G | 200Mbps | 1T | CNY 19.90/月；199/年 | 143/200 |
| DE 9929 Standard | 1C | 1G | 10G | 300Mbps | 2T | CNY 39.90/月 | 197/200 |
| DE 9929 Pro | 2C | 2G | 20G | 500Mbps | 2.5T | CNY 59/月 | 196/200 |

## 10. VMRack

来源：[官方价格页](https://www.vmrack.net/pricing)。VPS 是配置器，基础价在未选择具体资源前显示 USD 0，不能当固定套餐入库；以下是页面列出的固定独服，均售罄。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 | 库存 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L3.Metal1.Intel 6150 | Xeon Gold 6150，72C | 256G DDR4 | 1T + 2T SSD | 200Mbps | 不限 | USD 1390/月 | 售罄 |
| L3.Metal2.Intel 6150 | Xeon Gold 6150，72C | 256G DDR4 | 1T + 2T SSD | 500Mbps | 不限 | USD 2990/月 | 售罄 |
| L3.Metal3.Intel 6150 | Xeon Gold 6150，72C | 256G DDR4 | 1T + 2T SSD | 1Gbps | 不限 | USD 5800/月 | 售罄 |

## 11. DediRock

来源：[官方洛杉矶 KVM VPS 页面](https://dedirock.com/kvm-vps-los-angeles/)。页面提供下单入口，未显示库存。

| 型号 | CPU | 内存 | 硬盘 | 带宽 | 流量 | 金额/周期 |
| --- | --- | --- | --- | --- | --- | --- |
| LA Starter | 1C | 1G | 20G SSD | 1Gbps | 750G | USD 5.99/月 |
| LA Essentials | 2C | 2G | 40G SSD | 1Gbps | 1T | USD 8.99/月 |
| LA Plus | 4C | 4G | 100G SSD | 1Gbps | 2T | USD 12.99/月 |
| LA Advanced | 6C | 8G | 200G | 1Gbps | 2T | USD 19.99/月 |
| LA Premium | 8C | 16G | 300G | 1Gbps | 4T | USD 34.99/月 |

## 尚未可靠收录的名单

| 名称 | 当前结论 |
| --- | --- |
| VMISS、DMIT、NovixLink | 官网有反爬/访问限制，尚未从官方销售页读取到可校验配置 |
| 酷网云、RFC、NoBrand、华纳云、Zouter | 仅凭名称无法可靠确认官方域名，先不采集，避免误收第三方信息 |
| Goumami、Wawo | `goumami.com` 和 `wawo.io` 当前都跳转至域名出售页 |

## 校对重点

1. 是否把“CPU/内存/硬盘 `起`”的可选配产品排除，直到可以获得实际可下单的固定档位。
2. 是否将独服与 VPS 分开保存和搜索。
3. 是否保留库存为 `0` / 售罄的套餐；本清单保留它们，是为满足“无货也收集”的要求。
4. AkkoCloud 法兰克福 `9929-5950X` 的销售页规格文字仍写 CN2 GIA，线路名称需要人工确认。
