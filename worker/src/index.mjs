const CONFIG_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'renewalCycle', 'renewalAmount', 'currency'];
const MAX_FIELD_LENGTH = 120;
const MAX_NICKNAME_LENGTH = 64;
const SEARCH_LIMIT = 30;
const SUBMITTED_RECORDS_LIMIT = 100;
const PUBLIC_LIST_LIMIT = 50;
const PUBLIC_CONTRIBUTOR_LIMIT = 10;

function text(value, maxLength = MAX_FIELD_LENGTH) {
  const normalized = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized) throw new Error('所有配置字段均为必填项');
  if (normalized.length > maxLength) throw new Error(`字段不能超过 ${maxLength} 个字符`);
  return normalized;
}

function normalizeText(value) {
  return text(value).toLocaleLowerCase('en-US');
}

function normalizeQuantity(value, targetUnit) {
  const raw = text(value).replace(/\s+/g, '').toUpperCase();
  const match = raw.match(/^(\d+(?:\.\d+)?)([KMGT])(?:IB|B)?$/);
  if (!match) return raw.toLocaleLowerCase('en-US');
  const amount = Number(match[1]);
  const unit = match[2];
  if (targetUnit === 'mbps') {
    const megabits = amount * { K: 0.001, M: 1, G: 1000, T: 1000000 }[unit];
    return String(Number(megabits.toFixed(6))) + 'mbps';
  }
  const gigabytes = amount * { K: 1 / 1024 / 1024, M: 1 / 1024, G: 1, T: 1024 }[unit];
  return String(Number(gigabytes.toFixed(6))) + 'gb';
}

export function normalizeConfig(input) {
  const config = Object.fromEntries(CONFIG_FIELDS.map((field) => [field, text(input?.[field])]));
  return {
    config,
    key: {
      vendor: normalizeText(config.vendor),
      model: normalizeText(config.model),
      cpu: normalizeText(config.cpu),
      memory: normalizeQuantity(config.memory, 'gb'),
      disk: normalizeQuantity(config.disk, 'gb'),
      bandwidth: normalizeQuantity(config.bandwidth, 'mbps'),
      traffic: normalizeQuantity(config.traffic, 'gb'),
      renewalCycle: normalizeText(config.renewalCycle),
      renewalAmount: String(Number(text(config.renewalAmount))),
      currency: normalizeText(config.currency),
    },
  };
}

function originHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowOrigin = origin === 'https://www.nodeseek.com' ? origin : 'https://www.nodeseek.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(request, data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { ...originHeaders(request), ...headers } });
}

function recordFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    vendor: row.vendor,
    model: row.model,
    cpu: row.cpu,
    memory: row.memory,
    disk: row.disk,
    bandwidth: row.bandwidth,
    traffic: row.traffic,
    renewalCycle: row.renewal_cycle,
    renewalAmount: row.renewal_amount,
    currency: row.currency,
    submittedByNickname: row.submitted_by_nickname,
    createdAt: row.created_at,
  };
}

const recordColumns = `id, vendor, model, cpu, memory, disk, bandwidth, traffic, renewal_cycle, renewal_amount, currency, submitted_by_nickname, created_at`;

async function findExact(db, key) {
  return db.prepare(`SELECT ${recordColumns} FROM machine_configs WHERE normalized_vendor = ? AND normalized_model = ? AND normalized_cpu = ? AND normalized_memory = ? AND normalized_disk = ? AND normalized_bandwidth = ? AND normalized_traffic = ? AND normalized_renewal_cycle = ? AND normalized_renewal_amount = ? AND normalized_currency = ?`)
    .bind(key.vendor, key.model, key.cpu, key.memory, key.disk, key.bandwidth, key.traffic, key.renewalCycle, key.renewalAmount, key.currency).first();
}

async function exact(request, env, url) {
  const { key } = normalizeConfig(Object.fromEntries(CONFIG_FIELDS.map((field) => [field, url.searchParams.get(field)])));
  return json(request, { record: recordFromRow(await findExact(env.DB, key)) });
}

async function search(request, env, url) {
  const vendor = url.searchParams.get('vendor')?.trim() || '';
  const model = url.searchParams.get('model')?.trim() || '';
  if (!vendor && !model) return json(request, { error: '请提供厂商或型号搜索条件' }, 400);
  if (vendor.length > MAX_FIELD_LENGTH || model.length > MAX_FIELD_LENGTH) return json(request, { error: '搜索条件过长' }, 400);
  const clauses = [];
  const values = [];
  if (vendor) { clauses.push('normalized_vendor LIKE ?'); values.push(`%${normalizeText(vendor)}%`); }
  if (model) { clauses.push('normalized_model LIKE ?'); values.push(`%${normalizeText(model)}%`); }
  const result = await env.DB.prepare(`SELECT ${recordColumns} FROM machine_configs WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ?`)
    .bind(...values, SEARCH_LIMIT).all();
  return json(request, { records: result.results.map(recordFromRow) }, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function submitted(request, env, url) {
  const nickname = text(url.searchParams.get('nickname'), MAX_NICKNAME_LENGTH);
  const result = await env.DB.prepare(`SELECT ${recordColumns} FROM machine_configs WHERE submitted_by_nickname = ? ORDER BY created_at DESC LIMIT ?`)
    .bind(nickname, SUBMITTED_RECORDS_LIMIT).all();
  return json(request, { records: result.results.map(recordFromRow) }, 200, { 'Cache-Control': 'public, max-age=60' });
}

function boundedInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, maximum)) : fallback;
}

async function publicMachineConfigs(request, env, url) {
  const limit = Math.max(1, boundedInteger(url.searchParams.get('limit'), 12, PUBLIC_LIST_LIMIT));
  const offset = boundedInteger(url.searchParams.get('offset'), 0, 1000000);
  const query = url.searchParams.get('q')?.trim() || '';
  if (query.length > MAX_FIELD_LENGTH) return json(request, { error: '搜索条件过长' }, 400);
  const clause = query ? 'WHERE normalized_vendor LIKE ? OR normalized_model LIKE ?' : '';
  const values = query ? [`%${normalizeText(query)}%`, `%${normalizeText(query)}%`] : [];
  const [recordsResult, totalResult] = await env.DB.batch([
    env.DB.prepare(`SELECT ${recordColumns} FROM machine_configs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset),
    env.DB.prepare(`SELECT COUNT(*) AS total FROM machine_configs ${clause}`).bind(...values),
  ]);
  return json(request, { records: recordsResult.results.map(recordFromRow), total: totalResult.results[0]?.total || 0, limit, offset }, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function publicSummary(request, env) {
  const result = await env.DB.prepare('SELECT COUNT(*) AS records, COUNT(DISTINCT vendor) AS vendors, COUNT(DISTINCT submitted_by_nickname) AS contributors FROM machine_configs').first();
  return json(request, result || { records: 0, vendors: 0, contributors: 0 }, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function publicContributors(request, env) {
  const result = await env.DB.prepare('SELECT submitted_by_nickname AS nickname, COUNT(*) AS count FROM machine_configs GROUP BY submitted_by_nickname ORDER BY count DESC, nickname ASC LIMIT ?')
    .bind(PUBLIC_CONTRIBUTOR_LIMIT).all();
  return json(request, { contributors: result.results }, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function create(request, env) {
  const body = await request.json();
  const { config, key } = normalizeConfig(body);
  const submittedByNickname = text(body?.submittedByNickname, MAX_NICKNAME_LENGTH);
  const result = await env.DB.prepare(`INSERT INTO machine_configs (
    vendor, model, cpu, memory, disk, bandwidth, traffic, renewal_cycle, renewal_amount, currency,
    normalized_vendor, normalized_model, normalized_cpu, normalized_memory, normalized_disk, normalized_bandwidth, normalized_traffic, normalized_renewal_cycle, normalized_renewal_amount, normalized_currency,
    submitted_by_nickname
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(normalized_vendor, normalized_model, normalized_cpu, normalized_memory, normalized_disk, normalized_bandwidth, normalized_traffic, normalized_renewal_cycle, normalized_renewal_amount, normalized_currency) DO NOTHING`)
    .bind(
      config.vendor, config.model, config.cpu, config.memory, config.disk, config.bandwidth, config.traffic, config.renewalCycle, config.renewalAmount, config.currency,
      key.vendor, key.model, key.cpu, key.memory, key.disk, key.bandwidth, key.traffic, key.renewalCycle, key.renewalAmount, key.currency,
      submittedByNickname,
    ).run();
  const record = await findExact(env.DB, key);
  return json(request, { created: result.meta.changes === 1, record: recordFromRow(record) }, result.meta.changes === 1 ? 201 : 200);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: originHeaders(request) });
    const url = new URL(request.url);
    try {
      if (request.method === 'GET' && url.pathname === '/') return new Response(catalogPage(), { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300' } });
      if (request.method === 'GET' && url.pathname === '/v1/public/machine-configs') return publicMachineConfigs(request, env, url);
      if (request.method === 'GET' && url.pathname === '/v1/public/summary') return publicSummary(request, env);
      if (request.method === 'GET' && url.pathname === '/v1/public/contributors') return publicContributors(request, env);
      if (request.method === 'GET' && url.pathname === '/v1/machine-configs/exact') return exact(request, env, url);
      if (request.method === 'GET' && url.pathname === '/v1/machine-configs/search') return search(request, env, url);
      if (request.method === 'GET' && url.pathname === '/v1/machine-configs/submitted') return submitted(request, env, url);
      if (request.method === 'POST' && url.pathname === '/v1/machine-configs') return create(request, env);
      return json(request, { error: '未找到接口' }, 404);
    } catch (error) {
      console.error('machine catalog request failed', error);
      const message = error instanceof SyntaxError ? '请求 JSON 格式不正确' : error?.message || '请求处理失败';
      return json(request, { error: message }, 400);
    }
  },
};
import { catalogPage } from './catalog-page.mjs';
