CREATE TABLE IF NOT EXISTS machine_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor TEXT NOT NULL,
  model TEXT NOT NULL,
  cpu TEXT NOT NULL,
  memory TEXT NOT NULL,
  disk TEXT NOT NULL,
  bandwidth TEXT NOT NULL,
  traffic TEXT NOT NULL,
  normalized_vendor TEXT NOT NULL,
  normalized_model TEXT NOT NULL,
  normalized_cpu TEXT NOT NULL,
  normalized_memory TEXT NOT NULL,
  normalized_disk TEXT NOT NULL,
  normalized_bandwidth TEXT NOT NULL,
  normalized_traffic TEXT NOT NULL,
  submitted_by_nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (
    normalized_vendor,
    normalized_model,
    normalized_cpu,
    normalized_memory,
    normalized_disk,
    normalized_bandwidth,
    normalized_traffic
  )
);

CREATE INDEX IF NOT EXISTS idx_machine_configs_search
  ON machine_configs (normalized_vendor, normalized_model, created_at DESC);
