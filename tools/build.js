#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'NodeSeek Issue Templates.user.js');
const sourceDir = path.join(root, 'src');
const assetDir = path.join(root, 'assets', 'vendors');
const parts = ['config.js', 'ui.js', 'logic.js', 'main.js'];
const start = "(function () {\n  'use strict';\n\n";

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\n*$/, '\n'));
}

function split() {
  const script = read(output);
  const headerEnd = script.indexOf('// ==/UserScript==') + '// ==/UserScript=='.length;
  const bodyStart = script.indexOf(start, headerEnd) + start.length;
  const bodyEnd = script.lastIndexOf('\n})();');
  if (headerEnd < '// ==/UserScript=='.length || bodyStart < start.length || bodyEnd < bodyStart) throw new Error('无法识别 userscript 结构。');
  const body = script.slice(bodyStart, bodyEnd);
  const configEnd = body.indexOf('  function escapeHtml');
  const uiEnd = body.indexOf('  function formValues');
  const logicEnd = body.indexOf('  function initialize()');
  if ([configEnd, uiEnd, logicEnd].some((index) => index < 0)) throw new Error('无法识别源码分割点。');
  write(path.join(sourceDir, 'header.txt'), script.slice(0, headerEnd));
  write(path.join(sourceDir, 'config.js'), body.slice(0, configEnd));
  write(path.join(sourceDir, 'ui.js'), body.slice(configEnd, uiEnd));
  write(path.join(sourceDir, 'logic.js'), body.slice(uiEnd, logicEnd));
  write(path.join(sourceDir, 'main.js'), body.slice(logicEnd));
}

function build() {
  const header = read(path.join(sourceDir, 'header.txt')).trimEnd();
  const body = parts.map((part) => read(path.join(sourceDir, part)).trim()).join('\n\n').replace(/__NSIT_VENDOR_ASSET__\('([^']+)'\)/g, (_, file) => {
    const asset = path.join(assetDir, file);
    const extension = path.extname(file).slice(1);
    const mime = extension === 'svg' ? 'image/svg+xml' : extension === 'png' ? 'image/png' : 'image/x-icon';
    return JSON.stringify(`data:${mime};base64,${fs.readFileSync(asset).toString('base64')}`);
  });
  write(output, `${header}\n\n${start}${body}\n})();`);
}

const command = process.argv[2];
if (command === 'split') split();
else if (command === 'build') build();
else throw new Error('用法：node tools/build.js <split|build>');
