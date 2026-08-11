# RFC Host 配置整理（第六批）

采集与复核时间：2026-08-10。候选配置见 [machine-catalog-round-6-rfchost.csv](./machine-catalog-round-6-rfchost.csv)。

- 厂商名统一为 `RFCHost`，币种为 `USD 美元`，价格按官网定价页展示的月付金额记录。
- 流量为官网说明的 IN&OUT 双向合计；官网 FAQ 说明超额后实例将暂停至下一个计费周期，故均使用实际流量值。
- 官网所示 `No limit` 端口以 `不限速` 保存，避免误写为不限流量。
- 本批共 24 条，署名 `vico`。
