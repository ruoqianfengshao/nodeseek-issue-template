CREATE INDEX IF NOT EXISTS idx_machine_configs_submitted_by_nickname
  ON machine_configs (submitted_by_nickname, created_at DESC);
