import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogPage } from '../src/catalog-page.mjs';

test('the rendered catalog page contains valid inline JavaScript', () => {
  const page = catalogPage();
  const match = page.match(/<script>([\s\S]*?)<\/script>/);

  assert.ok(match, 'catalog page should contain an inline script');
  assert.doesNotThrow(() => new Function(match[1]));
});
