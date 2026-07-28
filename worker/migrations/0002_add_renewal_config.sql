CREATE TABLE machine_configs_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor TEXT NOT NULL,
  model TEXT NOT NULL,
  cpu TEXT NOT NULL,
  memory TEXT NOT NULL,
  disk TEXT NOT NULL,
  bandwidth TEXT NOT NULL,
  traffic TEXT NOT NULL,
  renewal_cycle TEXT NOT NULL,
  renewal_amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  normalized_vendor TEXT NOT NULL,
  normalized_model TEXT NOT NULL,
  normalized_cpu TEXT NOT NULL,
  normalized_memory TEXT NOT NULL,
  normalized_disk TEXT NOT NULL,
  normalized_bandwidth TEXT NOT NULL,
  normalized_traffic TEXT NOT NULL,
  normalized_renewal_cycle TEXT NOT NULL,
  normalized_renewal_amount TEXT NOT NULL,
  normalized_currency TEXT NOT NULL,
  submitted_by_nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (
    normalized_vendor,
    normalized_model,
    normalized_cpu,
    normalized_memory,
    normalized_disk,
    normalized_bandwidth,
    normalized_traffic,
    normalized_renewal_cycle,
    normalized_renewal_amount,
    normalized_currency
  )
);

INSERT INTO machine_configs_v2 (
  id, vendor, model, cpu, memory, disk, bandwidth, traffic,
  renewal_cycle, renewal_amount, currency,
  normalized_vendor, normalized_model, normalized_cpu, normalized_memory, normalized_disk, normalized_bandwidth, normalized_traffic,
  normalized_renewal_cycle, normalized_renewal_amount, normalized_currency,
  submitted_by_nickname, created_at
)
SELECT
  id, vendor, model, cpu, memory, disk, bandwidth, traffic,
  '', '', '',
  normalized_vendor, normalized_model, normalized_cpu, normalized_memory, normalized_disk, normalized_bandwidth, normalized_traffic,
  '', '', '',
  submitted_by_nickname, created_at
FROM machine_configs;

DROP TABLE machine_configs;
ALTER TABLE machine_configs_v2 RENAME TO machine_configs;

CREATE INDEX idx_machine_configs_search
  ON machine_configs (normalized_vendor, normalized_model, created_at DESC);
