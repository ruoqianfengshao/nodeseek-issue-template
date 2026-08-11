# Netcup 配置整理（第七批）

采集与复核时间：2026-08-10。候选配置见 [machine-catalog-round-7-netcup.csv](./machine-catalog-round-7-netcup.csv)。

- 包含 vServer Lite 6 条、VPS x86 G12 5 条、VPS ARM64 G11 6 条，共 17 条；ARM64 系列当前官网标注售罄，仍按用户指示作为历史可参考配置收录。
- 官网标示 `Traffic included` / `Traffic Flatrate`；按确认的录入规则，流量统一为 `不限流量`。商品页同时说明高于近 24 小时平均阈值时可能临时降速：Lite 为 100 Mbps，x86 与 ARM 为 2 TB 后降至 200 Mbps。
- 价格采用官网总览页当前显示的含税月均价；字段 `renewalAmount` 按对应商品页实际 `Billing period` 计算为该期应付总额：Lite 分别为年/半年/半年/季/两年/月付，x86 为年付，ARM 为月付。
- 带宽以商品页 `Interface Speed` / `Network connection` 录入。所有记录署名 `vico`。
