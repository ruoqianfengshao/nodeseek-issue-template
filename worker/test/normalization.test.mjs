import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig } from '../src/index.mjs';

const base = { vendor: 'DMIT', model: ' PVM.LAX.Pro ', cpu: '2C', memory: '1G', disk: '20G', bandwidth: '100M', traffic: '1T', renewalCycle: '月付', renewalAmount: '9.99', currency: 'USD 美元' };

test('normalizes case, whitespace, and storage units for the unique key', () => {
  const first = normalizeConfig(base);
  const second = normalizeConfig({ ...base, vendor: 'dmit', memory: '1024M', disk: '20 GB', bandwidth: '0.1G', traffic: '1024G' });
  assert.deepEqual(first.key, second.key);
  assert.equal(first.config.model, 'PVM.LAX.Pro');
});

test('accepts binary unit suffixes', () => {
  assert.equal(normalizeConfig({ ...base, memory: '512MiB' }).key.memory, '0.5gb');
});

test('normalizes renewal amount and keeps its period and currency in the unique key', () => {
  assert.equal(normalizeConfig({ ...base, renewalAmount: '09.990' }).key.renewalAmount, '9.99');
  assert.notDeepEqual(normalizeConfig(base).key, normalizeConfig({ ...base, renewalCycle: '年付' }).key);
  assert.notDeepEqual(normalizeConfig(base).key, normalizeConfig({ ...base, currency: 'EUR 欧元' }).key);
});
