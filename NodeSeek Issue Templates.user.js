// ==UserScript==
// @name         NodeSeek Issue Templates
// @namespace    https://www.nodeseek.com/
// @version      1.2.61
// @description  在 NodeSeek 发帖或编辑帖页面用表单生成交易帖，并回填 Markdown 编辑器。
// @author       vico
// @match        https://www.nodeseek.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// @connect      api.nodeimage.com
// @connect      *.workers.dev
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

const APP_ID = 'nsit-app';
  const VERSION = '1.2.61';
  const NODEIMAGE_KEY = 'nsit-nodeimage-api-key';
  const RUNTIME_KEY = '__nodeSeekIssueTemplatesRuntime__';
  const STORAGE_KEY = 'nsit-single-server-draft-v1';
  const TG_CONTACT_KEY = 'nsit-tg-contact-v1';
  const CARD_TOGGLE_KEY = 'nsit-generate-value-card';
  const MACHINE_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'remainingTraffic', 'renewalCycle', 'renewalAmount', 'currency', 'expiryDate', 'tradeDate', 'nqUrl', 'tqUrl', 'askingPrice', 'askingPremium', 'remarks'];
  const RATE_CACHE_KEY = 'nsit-cny-rates-v1';
  const MACHINE_CATALOG_API_URL = 'https://nsit-machine-catalog.ruoqianfengshao.workers.dev';
  const MACHINE_CATALOG_FIELDS = ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic', 'renewalCycle', 'renewalAmount', 'currency'];
  const CURRENCY_CODES = { 'CNY 人民币': 'CNY', 'USD 美元': 'USD', 'EUR 欧元': 'EUR', 'GBP 英镑': 'GBP', 'JPY 日元': 'JPY', 'KRW 韩元': 'KRW', 'AUD 澳元': 'AUD', 'HKD 港元': 'HKD', 'TWD 新台币': 'TWD', 'CAD 加拿大元': 'CAD', 'SGD 新加坡元': 'SGD' };
  const CYCLE_MONTHS = { '月付': 1, '季付': 3, '半年付': 6, '年付': 12, '两年付': 24, '三年付': 36, '五年付': 60 };
  const OPTIONS = {
    vendors: ['搬瓦工', 'DMIT', 'RackNerd', 'Vultr', 'CloudCone', 'BuyVM', 'Hetzner', 'Linode', 'DigitalOcean', 'Lightlayer', '狗妈咪', '奶爸', 'Vmiss', '阿里云', '腾讯云', '火山云', '华为云'],
    cpu: ['0.5C', '1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C'],
    memory: ['0.5G', '1G', '2G', '3G', '4G', '6G', '8G'],
    disk: ['1G', '2G', '4G', '5G', '10G', '20G', '50G', '100G'],
    bandwidth: ['10M', '20M', '30M', '40M', '50M', '100M', '200M', '500M', '1G'],
    traffic: ['150G', '200G', '300G', '400G', '500G', '1T', '2T', '4T'],
    renewalCycle: ['月付', '季付', '半年付', '年付', '两年付', '三年付', '五年付'],
  };
  const VENDOR_ICONS = {
    DMIT: 'https://www.dmit.io/favicon.ico',
    RackNerd: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/racknerd.png',
    Vultr: 'https://cdn.simpleicons.org/vultr',
    CloudCone: 'https://cloudcone.com/wp-content/uploads/2017/06/cropped-logo-2-32x32.png',
    BuyVM: 'https://buyvm.net/favicon.ico',
    Hetzner: 'https://cdn.simpleicons.org/hetzner',
    Linode: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/linode.png',
    DigitalOcean: 'https://cdn.simpleicons.org/digitalocean',
    Lightlayer: 'https://www.lightlayer.net/favicon.ico',
    '狗妈咪': 'https://gomami.io/templates/webflow/images/favicon.png',
    '奶爸': 'https://neburst.com/favicon.svg',
    Vmiss: 'https://cdn.nodeimage.com/i/eT6R4CDGq0OyDcCtbTZ9MNZEYkXHNLr7.png',
    '阿里云': 'https://cdn.simpleicons.org/alibabacloud',
    '腾讯云': 'https://cloudcache.tencent-cloud.com/qcloud/favicon.ico?t=201902181234',
    '火山云': 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/volcengine.png',
    '华为云': 'https://cdn.simpleicons.org/huawei',
  };

  const fields = [
    ['postTitle', '帖子标题', 'text', '会根据填写内容自动生成，也可手动修改'],
    ['vendor', '厂商', 'list', '输入或选择厂商', 'vendors'],
    ['model', '型号', 'text', '请输入并查询'],
    ['cpu', 'CPU', 'list', '输入或选择', 'cpu'],
    ['memory', '内存', 'list', '输入或选择', 'memory'],
    ['disk', '硬盘', 'list', '输入或选择', 'disk'],
    ['bandwidth', '带宽', 'list', '输入或选择', 'bandwidth'],
    ['traffic', '流量', 'list', '输入或选择', 'traffic'],
    ['renewalCycle', '续费周期', 'list', '输入或选择', 'renewalCycle'],
    ['renewalAmount', '续费金额', 'number', '0.00'],
    ['currency', '币种', 'select', '', ['CNY 人民币', 'USD 美元', 'EUR 欧元', 'GBP 英镑', 'JPY 日元', 'KRW 韩元', 'AUD 澳元', 'HKD 港元', 'TWD 新台币', 'CAD 加拿大元', 'SGD 新加坡元']],
    ['expiryDate', '到期日期', 'date'],
    ['tradeDate', '交易日期', 'date'],
    ['nqUrl', 'NQ 地址', 'url', 'https://...'],
    ['tqUrl', 'TQ 地址', 'url', 'https://...'],
    ['tgContact', 'TG 联系', 'text', '@username 或 https://t.me/...'],
    ['askingPrice', '预出总价（人民币）', 'number', '一口价'],
    ['askingPremium', '预出溢价（人民币）', 'number', '请输入溢价'],
    ['remarks', '单机备注', 'textarea', '补充说明'],
    ['postRemarks', '整贴备注', 'textarea', '适用于整帖的补充说明'],
  ];
  const OPTIONAL_FIELDS = new Set(['nqUrl', 'tqUrl', 'tgContact', 'remarks', 'postRemarks', 'askingPrice', 'askingPremium']);

function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function today() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function fieldLabel(name, label) {
    const icons = {
      askingPremium: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M39 6H9C7.34315 6 6 7.34315 6 9V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V9C42 7.34315 40.6569 6 39 6Z"/><path d="M13.4398 29.8347L19.0967 24.1778L23.4847 28.5555L34 18.0001"/><path d="M26 18H34V26"/></svg>`,
      askingPrice: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 14C4 12.8954 4.89543 12 6 12H42C43.1046 12 44 12.8954 44 14V40C44 41.1046 43.1046 42 42 42H6C4.89543 42 4 41.1046 4 40V14Z"/><path d="M19 19L24 24L29 19M18 25H30M18 31H30M24 25V35M8 6H40"/></svg>`,
    };
    return icons[name] ? `<span class="nsit-field-icon">${icons[name]}</span>${escapeHtml(label)}` : escapeHtml(label);
  }

  function remainingValueIcon() {
    return `<svg class="nsit-value-heading-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M40 4H8.0002C6.89565 4 6.00022 4.89541 6.0002 5.99996L5.99955 42C5.99953 43.1045 6.89497 44 7.99955 44H40C41.1046 44 42 43.1046 42 42V6C42 4.89543 41.1046 4 40 4Z"/><path d="M35 10H13V19H35V10Z"/><path d="M12 28L19 35M19 28L12 35M28 35H36M28 29H36"/></svg>`;
  }

  function exchangeRateIcon() {
    return `<svg class="nsit-value-heading-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 16H29V4L44 19L29 34V24H18V13L4 28L18 44V32H23"/></svg>`;
  }

  function vendorIconMarkup(value) {
    const initial = escapeHtml((value || '?').trim().slice(0, 1).toUpperCase());
    const icon = VENDOR_ICONS[value];
    return `<i class="nsit-vendor-icon">${icon ? `<img src="${escapeHtml(icon)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${initial}</b></i>`;
  }

  function inputMarkup(field, formId = '') {
    const [name, label, type, placeholder = '', options = []] = field;
    const safeName = escapeHtml(name);
    const form = formId ? ` form="${escapeHtml(formId)}"` : '';
    const hint = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : '';
    const required = OPTIONAL_FIELDS.has(name) ? '' : ' required';
    if (name === 'traffic') return trafficInputMarkup(form, hint, required, safeName);
    if (type === 'textarea') {
      const rows = name === 'remarks' ? '2' : '3';
      return `<label class="nsit-field nsit-field-wide nsit-field--${safeName}"><span>${fieldLabel(name, label)}</span><textarea name="${safeName}"${form}${hint}${required} rows="${rows}"></textarea></label>`;
    }
    if (type === 'select') {
      const values = options.map((value) => {
        const selected = (name === 'realName' && value === '否') || (name === 'currency' && value === 'USD 美元');
        return `<option value="${escapeHtml(value)}"${selected ? ' selected' : ''}>${escapeHtml(value)}</option>`;
      }).join('');
      return `<label class="nsit-field nsit-field--${safeName}"><span>${fieldLabel(name, label)}</span><select name="${safeName}"${form}${required}>${values}</select></label>`;
    }
    if (type === 'list') {
      const isVendor = name === 'vendor';
      const values = OPTIONS[options].map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${isVendor ? vendorIconMarkup(value) : ''}${escapeHtml(value)}</span>`).join('');
      const prefix = isVendor ? `<span class="nsit-vendor-input-icon" data-nsit-vendor-icon>${vendorIconMarkup('')}</span>` : '';
      const input = `<span class="nsit-picker${isVendor ? ' nsit-vendor-picker' : ''}" data-picker-name="${safeName}">${prefix}<input name="${safeName}"${form}${hint}${required} data-nsit-picker-input="true" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择${label}" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${values}</span></span>`;
      return `<label class="nsit-field nsit-field--${safeName}"><span>${fieldLabel(name, label)}</span>${input}</label>`;
    }
    if (name === 'model') {
      return `<label class="nsit-field nsit-field--${safeName}"><span>${fieldLabel(name, label)}</span><span class="nsit-model-suggest"><input name="${safeName}"${form} type="${type}"${hint}${required} autocomplete="off"><span class="nsit-model-suggest-menu" data-nsit-model-suggest-menu></span></span></label>`;
    }
    const value = name === 'tradeDate' ? ` value="${today()}"` : '';
    const min = type === 'number' ? ' min="0" step="0.01"' : '';
    const wide = name === 'postTitle' ? ' nsit-field-wide' : '';
    const titleHint = name === 'postTitle' ? '<small class="nsit-title-hint">（自动规则生成，手动修改建议在最后，否则可能会被覆盖）</small>' : '';
    return `<label class="nsit-field${wide} nsit-field--${safeName}"><span>${fieldLabel(name, label)}${titleHint}</span><input name="${safeName}"${form} type="${type}"${value}${min}${hint}${required}></label>`;
  }

  function trafficInputMarkup(form, hint, required, safeName) {
    const values = OPTIONS.traffic.map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${escapeHtml(value)}</span>`).join('');
    return `<div class="nsit-field nsit-field--${safeName} nsit-traffic-field"><span class="nsit-traffic-label"><span>流量</span><span class="nsit-traffic-label-actions"><span data-nsit-traffic-usage-tooltip title="剩余流量配置，请先配置流量"><button type="button" class="nsit-traffic-remaining-trigger" data-action="toggle-traffic-usage" data-nsit-remaining-traffic aria-label="配置剩余流量" disabled>剩余 ?</button></span></span></span><span class="nsit-picker" data-picker-name="traffic"><input name="traffic"${form}${hint}${required} data-nsit-picker-input="true" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择流量" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${values}</span></span><input type="hidden" name="remainingTraffic"${form}><span class="nsit-traffic-usage-popover" data-nsit-traffic-usage-popover hidden><label>已使用 <input type="number" min="0" step="0.01" inputmode="decimal" data-nsit-traffic-used><em data-nsit-traffic-used-unit></em></label><span class="nsit-traffic-slider-row"><input type="range" min="0" step="1" data-nsit-traffic-used-slider><small data-nsit-traffic-maximum>—</small></span><span class="nsit-traffic-usage-presets" data-nsit-traffic-usage-presets></span></span></div>`;
  }

  function section(title, names, description = '', className = '') {
    const byName = new Map(fields.map((field) => [field[0], field]));
    return `<section class="nsit-section ${className}">${title ? `<h3>${title}</h3>` : ''}${description ? `<p>${description}</p>` : ''}<div class="nsit-grid">${names.map((name) => inputMarkup(byName.get(name))).join('')}</div></section>`;
  }

  function basicConfigMarkup() {
    const byName = new Map(fields.map((field) => [field[0], field]));
    const input = (name) => inputMarkup(byName.get(name));
    return `<section class="nsit-section nsit-basic"><div class="nsit-grid">${['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic'].map(input).join('')}</div></section>`;
  }

  function transferTagsMarkup() {
    const groups = [
      ['transfer', ['原邮出', '改邮出']],
      ['identity', ['实名']],
      ['broker', ['包中介', '不包中介']],
      ['push', ['包 push', '不包 push']],
      ['payment', ['先机后款', '先款后机']],
      ['extras', ['支付宝口令红包', '无 PP 争议']],
    ];
    return `<section class="nsit-section nsit-transfer-tags"><div class="nsit-tag-list">${groups.flatMap(([group, labels]) => labels.map((label) => `<label class="nsit-tag nsit-tag--${group}"><input type="checkbox" name="transferTags" value="${label}" data-tag-group="${group}"><span>${label}</span></label>`)).join('')}</div></section>`;
  }

  function reportsAndRemarksMarkup() {
    const byName = new Map(fields.map((field) => [field[0], field]));
    return `<section class="nsit-section nsit-report-remarks"><div class="nsit-report-fields">${['nqUrl', 'tqUrl'].map((name) => inputMarkup(byName.get(name), 'nsit-form')).join('')}</div>${inputMarkup(byName.get('remarks'), 'nsit-form')}</section>`;
  }

  function contactAndPostRemarksMarkup() {
    const tgContact = fields.find(([name]) => name === 'tgContact');
    const postRemarks = fields.find(([name]) => name === 'postRemarks');
    return `<section class="nsit-section nsit-contact-post-remarks">${inputMarkup(tgContact, 'nsit-form')}${inputMarkup(postRemarks, 'nsit-form')}</section>`;
  }

  function valueCardMarkup() {
    const fieldsByName = new Map(fields.map((field) => [field[0], field]));
    const control = (name) => inputMarkup(fieldsByName.get(name), 'nsit-form');
    const currencies = fieldsByName.get('currency')[4].map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${escapeHtml(value)}</span>`).join('');
    const amountControl = `<label class="nsit-field nsit-field--renewalAmount"><span>续费金额 <small data-nsit-amount-cny>≈ ¥ ?</small></span><span class="nsit-amount-input"><span class="nsit-picker nsit-currency-picker" data-picker-name="currency"><input name="currency" form="nsit-form" value="USD 美元" required readonly aria-label="币种" data-nsit-picker-input="true" role="combobox" aria-autocomplete="none" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择币种" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${currencies}</span></span><input name="renewalAmount" form="nsit-form" type="number" min="0" step="0.01" placeholder="0.00" required></span></label>`;
    return `<div class="nsit-value-card"><div class="nsit-value-inputs nsit-value-row-one">${['renewalCycle', 'expiryDate', 'tradeDate'].map(control).join('')}</div><div class="nsit-value-inputs nsit-value-row-two">${amountControl}${control('askingPremium')}${control('askingPrice')}</div><div class="nsit-value-heading"><span>${remainingValueIcon()}剩余价值</span><span class="nsit-rate-value"><span>${exchangeRateIcon()}实时汇率：</span><strong data-nsit-rate>选择币种后加载</strong><button type="button" data-action="refresh-rate" title="刷新今日汇率">↻</button></span><span class="nsit-value-stats"><strong data-days>剩余 ? 天</strong><strong data-percent>周期占比 ?</strong><i class="nsit-title-progress" hidden><i data-progress></i></i></span></div><div class="nsit-value-result"><div><div class="nsit-value" data-nsit-value-output><small>¥</small>0.00</div></div><div class="nsit-price-preview" data-nsit-price-preview>填写预出价格后显示价格预览</div></div></div>`;
  }

  function machineTabsMarkup() {
    return '<aside class="nsit-machine-tabs" data-nsit-machine-tabs></aside>';
  }

  let stylesInjected = false;

  function injectStyles(styles) {
    if (stylesInjected) return;
    GM_addStyle(styles);
    stylesInjected = true;
  }

  function createApp() {
    const app = document.createElement('aside');
    app.id = APP_ID;
    app.dataset.nsitVersion = VERSION;
    const styles = `
        #${APP_ID}{--nsit-accent:#d9961c;--nsit-ink:#27334a;--nsit-muted:#718096;--nsit-line:#e5eaf1;display:contents;box-sizing:border-box;margin:0;color:var(--nsit-ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        #${APP_ID} *{box-sizing:border-box}#${APP_ID} .nsit-shell{background:#fff;border:1px solid var(--nsit-line);border-radius:12px;box-shadow:0 8px 24px rgba(29,40,65,.06);overflow:hidden}
        #${APP_ID} .nsit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--nsit-line);background:linear-gradient(110deg,#f9fbff,#fff8ea);flex:none}#${APP_ID} .nsit-head-copy{display:flex;align-items:baseline;gap:9px;min-width:0}#${APP_ID} .nsit-star-note{display:inline-flex;align-items:center;gap:3px;color:var(--nsit-muted);font-size:12px;white-space:nowrap}#${APP_ID} .nsit-star-note a{display:inline-flex;align-items:center;color:#8b641e;text-decoration:none}#${APP_ID} .nsit-star-note a:hover{text-decoration:underline}#${APP_ID} .nsit-github-icon{width:14px;height:14px;fill:currentColor}
        #${APP_ID} h2,#${APP_ID} h3{margin:0}#${APP_ID} h2{font-size:16px}#${APP_ID} h3{font-size:14px}#${APP_ID} .nsit-head small,#${APP_ID} p{color:var(--nsit-muted)}#${APP_ID} .nsit-head small{font-size:14px}
        #${APP_ID} .nsit-body{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.85fr);flex:1;min-height:0;overflow:hidden}#${APP_ID} .nsit-form,#${APP_ID} .nsit-side{min-height:0;overflow-y:auto;overscroll-behavior:contain;box-shadow:inset 0 7px 9px -12px rgba(29,40,65,.38)}#${APP_ID} .nsit-form{padding:4px 18px 18px}#${APP_ID} .nsit-side{padding:4px 18px 18px;border-left:1px solid var(--nsit-line);background:#fbfcfe}#${APP_ID} .nsit-machine-tabs{position:absolute;right:100%;top:52px;bottom:0;display:flex;flex-direction:column;align-items:flex-end;gap:7px;width:210px;padding:14px 0;overflow:visible}#${APP_ID} .nsit-machine-tab{display:flex;align-items:center;gap:7px;width:110px;min-height:34px;margin:0;padding:7px 9px;border:1px solid #d8e0eb;border-right:0;border-radius:7px 0 0 7px;background:#fff;color:#506078;font:inherit;text-align:left;transition:width .18s ease,background .15s,border-color .15s;cursor:pointer;white-space:nowrap;overflow:hidden}#${APP_ID} .nsit-machine-tab:hover,#${APP_ID} .nsit-machine-tab.is-active{width:210px;border-color:#d9961c;background:#fff8ea;color:#875800}#${APP_ID} .nsit-machine-tab.is-active{font-weight:650}#${APP_ID} .nsit-machine-logo{position:relative;display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:5px;background:#edf2f8;color:#52627c;font-size:11px;font-weight:700;overflow:hidden}#${APP_ID} .nsit-machine-logo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}#${APP_ID} .nsit-machine-tab.is-active .nsit-machine-logo{background:#f4c96c;color:#6d4900}#${APP_ID} .nsit-machine-index{flex:none;color:#8794aa;font-size:11px}#${APP_ID} .nsit-machine-name{overflow:hidden;text-overflow:ellipsis}#${APP_ID} .nsit-machine-meta{display:none;margin-left:auto;font-size:12px;color:#718096}#${APP_ID} .nsit-machine-tab:hover .nsit-machine-meta,#${APP_ID} .nsit-machine-tab.is-active .nsit-machine-meta{display:inline}#${APP_ID} .nsit-machine-add{border-style:dashed;background:#fff;color:#718096}#${APP_ID} .nsit-machine-add:disabled{cursor:not-allowed;opacity:.45}#${APP_ID} .nsit-machine-add:not(:disabled):hover{border-color:#d9961c;background:#fff8ea;color:#875800}
#${APP_ID} .nsit-section{padding:14px 0;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-section:last-child,#${APP_ID} .nsit-tg-contact{border-bottom:0}#${APP_ID} .nsit-section p{margin:3px 0 10px;font-size:14px}#${APP_ID} .nsit-basic .nsit-grid{grid-template-columns:repeat(10,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model{grid-column:span 5}#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic{grid-column:span 2}#${APP_ID} .nsit-title-divider{height:1px;margin:16px 0 0;background:var(--nsit-line)}#${APP_ID} .nsit-post-title{margin-top:0}#${APP_ID} .nsit-title-hint{margin-left:6px;color:var(--nsit-muted);font-size:12px;font-weight:400}
        #${APP_ID} .nsit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}#${APP_ID} .nsit-field{display:grid;gap:5px;min-width:0}#${APP_ID} .nsit-field span{font-size:14px;color:#506078}.nsit-field-wide{grid-column:1/-1}
        #${APP_ID} input,#${APP_ID} select,#${APP_ID} textarea{width:100%;min-width:0;border:1px solid #d8e0eb;border-radius:7px;background:#fff;color:var(--nsit-ink);padding:8px 9px;font:inherit;outline:none}#${APP_ID} textarea{resize:vertical}#${APP_ID} input:focus,#${APP_ID} select:focus,#${APP_ID} textarea:focus{border-color:var(--nsit-accent);box-shadow:0 0 0 3px rgba(217,150,28,.14)}#${APP_ID} .nsit-picker{position:relative;z-index:0;display:block;isolation:isolate}#${APP_ID} .nsit-picker input{padding-right:35px}#${APP_ID} .nsit-picker-toggle{position:absolute;z-index:1;top:50%;right:8px;display:grid;place-items:center;width:20px;height:20px;margin:0;padding:0;transform:translateY(-50%);border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#52627c}#${APP_ID} .nsit-picker-toggle i{display:block;width:18px;height:18px;background:center/18px 18px no-repeat url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 18L24 30L12 18' stroke='%23333' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}#${APP_ID} .nsit-picker-toggle:hover{color:#27334a}#${APP_ID} .nsit-picker-menu{display:none;position:absolute;z-index:20;top:calc(100% + 5px);left:0;width:100%;max-height:180px;overflow:auto;border:1px solid #d8e0eb;border-radius:8px;background:#fff;box-shadow:0 8px 18px rgba(31,44,67,.18);padding:5px}#${APP_ID} .nsit-picker.is-open{z-index:30}#${APP_ID} .nsit-picker.is-open .nsit-picker-menu{display:grid;gap:2px}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:block;width:100%;margin:0;border:0;border-radius:5px;background:transparent;padding:7px 9px;text-align:left;color:#33425a;font:inherit;cursor:pointer}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]:hover,#${APP_ID} .nsit-picker-menu [data-nsit-picker-option].is-active{background:#fff3da;color:#885700}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option][hidden]{display:none}#${APP_ID} .nsit-model-suggest{position:relative;z-index:0;display:block}#${APP_ID} .nsit-model-suggest-menu{display:none;position:absolute;z-index:40;top:calc(100% + 5px);left:0;width:100%;max-height:260px;overflow:auto;border:1px solid #d8e0eb;border-radius:8px;background:#fff;box-shadow:0 8px 18px rgba(31,44,67,.18);padding:5px}#${APP_ID} .nsit-model-suggest.is-open{z-index:35}#${APP_ID} .nsit-model-suggest.is-open .nsit-model-suggest-menu{display:grid;gap:2px}#${APP_ID} .nsit-model-suggestion{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:5px 10px;margin:0;border:0;border-radius:6px;background:transparent;padding:8px 9px;color:#33425a;font:inherit;text-align:left;cursor:pointer}#${APP_ID} .nsit-model-suggestion:hover{background:#fff3da;color:#885700}#${APP_ID} .nsit-model-suggestion strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${APP_ID} .nsit-model-suggestion small{color:#718096;font-size:12px;white-space:nowrap}#${APP_ID} .nsit-model-suggestion span{grid-column:1/-1;color:#66758d;font-size:12px;line-height:1.45}#${APP_ID} .nsit-model-suggest-empty{margin:0;padding:8px 9px;color:#718096;font-size:12px}#${APP_ID} .nsit-asking-price{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px}#${APP_ID} .nsit-asking-price .nsit-field{min-width:0}#${APP_ID} .nsit-price-preview{min-height:37px;border:1px solid #f0d49c;border-radius:7px;background:#fff8e9;padding:8px 10px;color:#8b641e;font-size:14px;line-height:19px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{display:grid;grid-template-columns:1fr;gap:12px}#${APP_ID} .nsit-report-remarks .nsit-field{min-width:0}#${APP_ID} .nsit-report-remarks .nsit-field-wide{grid-column:auto}#${APP_ID} .nsit-report-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#${APP_ID} .nsit-tag-list{display:flex;flex-wrap:wrap;gap:8px}#${APP_ID} .nsit-tag{position:relative;cursor:pointer}#${APP_ID} .nsit-tag input{position:absolute;opacity:0;pointer-events:none}#${APP_ID} .nsit-tag span{display:block;border:1px solid #d8e0eb;border-radius:999px;background:#fff;padding:6px 11px;color:#506078;font-size:14px;transition:.15s}#${APP_ID} .nsit-tag--transfer input:checked + span{border-color:#a9c6f5;background:#f2f7ff;color:#316ab7}#${APP_ID} .nsit-tag--identity input:checked + span{border-color:#cbb7ee;background:#f8f3ff;color:#7452ae}#${APP_ID} .nsit-tag--brokerWalk input:checked + span,#${APP_ID} .nsit-tag--broker input:checked + span{border-color:#83d1bf;background:#f0fbf7;color:#187961}#${APP_ID} .nsit-tag--push input:checked + span{border-color:#f2bd91;background:#fff6ee;color:#b35c20}#${APP_ID} .nsit-tag--payment input:checked + span{border-color:#e7ba74;background:#fff9ec;color:#996009}#${APP_ID} .nsit-tag--extras input:checked + span{border-color:#ea9db4;background:#fff3f6;color:#ad3c61}#${APP_ID} .nsit-tag input:checked + span{box-shadow:inset 0 0 0 1px currentColor;font-weight:650;filter:saturate(1.25)}#${APP_ID} .nsit-tag:hover span{transform:translateY(-1px)}
        #${APP_ID} .nsit-value-card{margin:14px 0;border:1px solid #f0cf8a;border-radius:12px;background:linear-gradient(145deg,#fff,#fff8e9);padding:14px}#${APP_ID} .nsit-value-inputs{display:grid;gap:8px;margin-bottom:8px}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-value-row-two{padding-bottom:8px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-inputs .nsit-field{gap:3px}#${APP_ID} .nsit-value-inputs .nsit-field span{font-size:14px;color:#506078}#${APP_ID} .nsit-value-inputs .nsit-field--askingPrice > span{color:#27834a}#${APP_ID} .nsit-value-inputs .nsit-field--askingPremium > span{color:#c04444}#${APP_ID} .nsit-value-inputs input,#${APP_ID} .nsit-value-inputs select{padding:6px 7px;font-size:14px}#${APP_ID} .nsit-amount-input{display:flex;min-width:0}#${APP_ID} .nsit-amount-input .nsit-currency-picker{width:112px;flex:none}#${APP_ID} .nsit-amount-input .nsit-currency-picker input{margin:0;border-radius:7px 0 0 7px;cursor:pointer}#${APP_ID} .nsit-currency-picker .nsit-picker-menu{width:max-content;min-width:100%}#${APP_ID} .nsit-currency-picker .nsit-picker-menu [data-nsit-picker-option]{white-space:nowrap}#${APP_ID} .nsit-amount-input > input{margin-left:-1px;border-radius:0 7px 7px 0}#${APP_ID} .nsit-value-inputs .nsit-picker input{padding-right:30px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle{right:5px;width:18px;height:18px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle i{width:15px;height:15px;background-size:15px 15px}#${APP_ID} .nsit-rate-value{display:flex;align-items:center;min-width:0;gap:4px;white-space:nowrap}#${APP_ID} .nsit-value-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;color:#8b6a2b;font-weight:600}#${APP_ID} .nsit-value-heading>.nsit-rate-value{margin-right:auto;color:#2c8a4e;font-weight:400}#${APP_ID} .nsit-value-heading>.nsit-rate-value strong{min-width:0;overflow:hidden;color:inherit;font-size:14px;font-weight:650;text-overflow:ellipsis}#${APP_ID} .nsit-value-heading>.nsit-rate-value button{width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;color:inherit;font-size:16px;line-height:1;cursor:pointer}#${APP_ID} .nsit-value-stats{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-width:0;white-space:nowrap}#${APP_ID} .nsit-value-heading strong{color:#8b641e;font-size:14px}#${APP_ID} .nsit-title-progress{display:block;width:62px;height:6px;overflow:hidden;border-radius:999px;background:#def0e3}.nsit-title-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6fbc82,#239652);transition:width .15s ease}#${APP_ID} .nsit-value-result{display:flex;align-items:flex-start;gap:12px;min-height:54px;margin-top:12px}#${APP_ID} .nsit-value{flex:none;margin:0;color:var(--nsit-accent);font-size:34px;font-weight:750;letter-spacing:-1px;line-height:1;word-break:break-all}#${APP_ID} .nsit-value small{margin-right:4px;font-size:15px;font-weight:inherit}#${APP_ID} .nsit-value-result .nsit-price-preview{display:flex;flex:1;align-items:flex-end;justify-content:flex-end;gap:8px;align-self:flex-start;min-width:0;padding:0;border:0;background:transparent;color:#718096;font-size:18px;font-weight:650;line-height:1.3;text-align:right;white-space:normal}#${APP_ID} .nsit-price-preview span{min-width:0}#${APP_ID} .nsit-price-preview b{display:inline-block;flex:none;font-size:34px;letter-spacing:-1px;line-height:1;white-space:nowrap}#${APP_ID} .nsit-price-preview[data-price-state="fair"]{color:#27834a}#${APP_ID} .nsit-price-preview[data-price-state="premium"]{color:#c04444}
        #${APP_ID} .nsit-formula{margin:0;font-size:14px;color:var(--nsit-muted)}#${APP_ID} .nsit-action-dock{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:12px 18px;border-top:1px solid var(--nsit-line);background:#fff;box-shadow:0 -8px 18px rgba(29,40,65,.05)}#${APP_ID} .nsit-toggle-group,#${APP_ID} .nsit-actions{display:flex;flex-wrap:wrap;gap:8px}#${APP_ID} .nsit-actions{justify-content:flex-end}#${APP_ID} .nsit-card-toggle{display:flex;align-items:center;gap:6px;color:#506078;cursor:pointer;white-space:nowrap}#${APP_ID} .nsit-card-toggle input{width:15px;height:15px;margin:0;accent-color:var(--nsit-accent)}#${APP_ID} .nsit-config-check-toggle{position:relative;gap:4px}#${APP_ID} .nsit-config-check-help{display:grid;place-items:center;width:15px;height:15px;border:1px solid currentColor;border-radius:50%;font-size:10px;font-weight:700;line-height:1}#${APP_ID} .nsit-config-check-tooltip{position:absolute;z-index:10;bottom:calc(100% + 8px);left:0;width:310px;padding:9px 11px;border-radius:7px;background:#27334a;color:#fff;font-size:12px;font-weight:400;line-height:1.55;white-space:normal;box-shadow:0 8px 18px rgba(31,44,67,.2);opacity:0;pointer-events:none;transform:translateY(3px);transition:opacity .15s,transform .15s}#${APP_ID} .nsit-config-check-tooltip::after{position:absolute;top:100%;left:22px;border:5px solid transparent;border-top-color:#27334a;content:""}#${APP_ID} .nsit-config-check-toggle:hover .nsit-config-check-tooltip{opacity:1;transform:translateY(0)}#${APP_ID} button{border:1px solid #d8e0eb;border-radius:7px;background:#fff;color:#40506a;padding:8px 11px;font:inherit;cursor:pointer}#${APP_ID} button:hover{border-color:var(--nsit-accent);color:#8b5c00}#${APP_ID} button.nsit-primary{background:#d9961c;border-color:#d9961c;color:#fff}#${APP_ID} .nsit-status{position:absolute;right:18px;bottom:100%;max-width:calc(100% - 36px);margin:0 0 7px;padding:4px 7px;border-radius:5px;background:rgba(39,51,74,.88);color:#fff;font-size:14px;opacity:0;pointer-events:none;transition:opacity .15s}.nsit-status:not(:empty){opacity:1}
        #${APP_ID} .nsit-trigger{display:inline;margin:0 7px 0 0;padding:3px 8px;border:1px solid #d9961c;border-radius:5px;background:#fff8ea;color:#875800;font:600 13px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;vertical-align:baseline}#${APP_ID} .nsit-trigger:hover{border-color:#b87500;background:#d9961c;color:#fff}#${APP_ID} .nsit-modal{display:none;position:fixed;z-index:2147483647;inset:0;overflow:auto;padding:28px 16px;background:rgba(20,29,45,.46)}#${APP_ID}.nsit-open .nsit-modal{display:grid;place-items:center}#${APP_ID} .nsit-dialog-wrap{position:relative;width:min(980px,100%);max-height:calc(100vh - 56px);margin:auto}#${APP_ID} .nsit-modal .nsit-shell{position:relative;display:flex;flex-direction:column;width:100%;max-height:calc(100vh - 56px);margin:0;box-shadow:0 20px 60px rgba(0,0,0,.24)}#${APP_ID} .nsit-close{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;font-size:25px;line-height:1;color:#62708a}#${APP_ID} .nsit-close:hover{background:#f0f3f8;color:#27334a}#${APP_ID} .nsit-head>div{min-width:0}#${APP_ID} .nsit-head>div:last-child{display:flex;align-items:center;gap:8px;white-space:nowrap}
        #${APP_ID} .nsit-catalog-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:rgba(20,29,45,.46)}#${APP_ID}.nsit-catalog-open .nsit-catalog-modal{display:grid;place-items:center}#${APP_ID} .nsit-catalog-dialog{width:min(720px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--nsit-line);border-radius:12px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.24)}#${APP_ID} .nsit-catalog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-head h3{font-size:16px}#${APP_ID} .nsit-catalog-head-copy{display:flex;align-items:baseline;gap:8px;min-width:0}#${APP_ID} .nsit-catalog-head-copy small{color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-catalog-search{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-search button{white-space:nowrap}#${APP_ID} .nsit-catalog-results{display:grid;gap:8px;min-height:88px;padding:14px 16px}#${APP_ID} .nsit-catalog-empty{margin:auto;color:var(--nsit-muted);font-size:14px}#${APP_ID} .nsit-catalog-result{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:11px 12px;text-align:left}#${APP_ID} .nsit-catalog-result strong{color:#27334a}#${APP_ID} .nsit-catalog-result span{color:#506078;font-size:13px;line-height:1.55}#${APP_ID} .nsit-catalog-result small{align-self:end;color:#8794aa;font-size:12px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{grid-template-columns:1fr}@media(max-width:820px){#${APP_ID} .nsit-body{display:block}#${APP_ID} .nsit-side{border-left:0;border-top:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-card{position:static}}@media(max-width:520px){#${APP_ID} .nsit-grid,#${APP_ID} .nsit-basic .nsit-grid,#${APP_ID} .nsit-report-remarks,#${APP_ID} .nsit-asking-price,#${APP_ID} .nsit-catalog-search{grid-template-columns:1fr}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model,#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic,#${APP_ID} .nsit-basic .nsit-field--remainingTraffic{grid-column:auto}#${APP_ID} .nsit-modal{padding:8px}#${APP_ID} .nsit-head small{display:none}#${APP_ID} .nsit-catalog-head-copy{align-items:flex-start;flex-direction:column;gap:2px}}
        #${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount > span:first-child{display:flex;align-items:center;justify-content:space-between;gap:4px}#${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount [data-nsit-amount-cny]{color:#2c8a4e;font-size:12px;font-weight:650;white-space:nowrap}#${APP_ID} .nsit-field-icon{display:inline-flex;vertical-align:-3px;margin-right:4px;color:inherit}#${APP_ID} .nsit-field-icon svg,#${APP_ID} .nsit-value-heading-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}#${APP_ID} .nsit-field--askingPrice .nsit-field-icon,#${APP_ID} .nsit-field--askingPrice .nsit-field-icon svg{color:#27834a}#${APP_ID} .nsit-field--askingPremium .nsit-field-icon,#${APP_ID} .nsit-field--askingPremium .nsit-field-icon svg{color:#c04444}#${APP_ID} .nsit-value-heading-icon{display:inline-block;margin-right:4px;vertical-align:-3px}#${APP_ID} .nsit-contact-post-remarks{display:grid;gap:10px}#${APP_ID} .nsit-value-result{align-items:flex-end}#${APP_ID} .nsit-value-result .nsit-price-preview{align-self:flex-end}#${APP_ID} .nsit-price-typing{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px;animation:nsit-type-in .24s steps(12,end)}@keyframes nsit-type-in{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes nsit-progress-slide{from{width:0;opacity:0;transform:translateX(-8px)}to{width:62px;opacity:1;transform:translateX(0)}}#${APP_ID} .nsit-title-progress.is-visible{animation:nsit-progress-slide .32s ease-out}#${APP_ID} .nsit-vendor-picker input{padding-left:34px}#${APP_ID} .nsit-vendor-input-icon{position:absolute;z-index:2;top:50%;left:9px;transform:translateY(-50%)}#${APP_ID} .nsit-vendor-icon{position:relative;display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:4px;background:#edf2f8;color:#52627c;font-size:11px;font-style:normal;overflow:hidden}#${APP_ID} .nsit-vendor-icon img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}#${APP_ID} .nsit-vendor-icon b{font:700 11px/1 sans-serif}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:flex;align-items:center;gap:7px}
      `;
    const modelSuggestionStyles = `
      #${APP_ID} .nsit-traffic-field{position:relative}#${APP_ID} .nsit-traffic-label{display:flex;align-items:center;justify-content:space-between;gap:6px}#${APP_ID} .nsit-traffic-label-actions{display:flex;align-items:center;gap:4px}#${APP_ID} .nsit-traffic-remaining-trigger{margin:0;padding:0;border:0;background:transparent;color:#27834a;font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap}#${APP_ID} .nsit-traffic-remaining-trigger:hover{color:#d9961c}#${APP_ID} .nsit-traffic-remaining-trigger:disabled{color:#8794aa;cursor:not-allowed}#${APP_ID} .nsit-traffic-usage-popover{position:absolute;z-index:50;top:29px;right:0;display:grid;width:250px;gap:9px;border:1px solid #d8e0eb;border-radius:9px;background:#fff;padding:11px;box-shadow:0 10px 24px rgba(31,44,67,.2);color:#506078}#${APP_ID} .nsit-traffic-usage-popover label{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:7px;white-space:nowrap;font-size:14px}#${APP_ID} .nsit-traffic-usage-popover label input{min-width:0;padding:5px 7px}#${APP_ID} .nsit-traffic-usage-popover label em{font-style:normal;white-space:nowrap}#${APP_ID} .nsit-traffic-slider-row{display:flex;align-items:center;gap:8px}#${APP_ID} .nsit-traffic-slider-row small{color:#718096;font-size:14px;text-align:right;white-space:nowrap}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]{flex:1;min-width:0;height:6px;margin:4px 0;padding:0;border:0;background:linear-gradient(90deg,#f4c96c 0 var(--nsit-traffic-used-percent,0%),#e5eaf1 var(--nsit-traffic-used-percent,0%) 100%);accent-color:#f4c96c;appearance:none;-webkit-appearance:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]:focus{border:0;box-shadow:none;outline:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-webkit-slider-runnable-track{height:6px;border:0;border-radius:999px;background:transparent}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-webkit-slider-thumb{width:16px;height:16px;margin-top:-5px;border:2px solid #f4c96c;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(139,100,30,.18);-webkit-appearance:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-track{height:6px;border:0;border-radius:999px;background:#e5eaf1}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-progress{height:6px;border:0;border-radius:999px;background:#f4c96c}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-thumb{width:16px;height:16px;border:2px solid #f4c96c;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(139,100,30,.18)}#${APP_ID} .nsit-traffic-usage-presets{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}#${APP_ID} .nsit-traffic-usage-presets button{margin:0;padding:3px 0;border-radius:4px;color:#66758d;font-size:12px}#${APP_ID} .nsit-traffic-usage-presets button:hover{border-color:#d9961c;background:#fff8ea;color:#8b5c00}
      #${APP_ID} .nsit-model-suggest-menu{right:0;left:auto;width:min(400px,calc(100vw - 32px));max-width:none}
      #${APP_ID} .nsit-model-suggestion{grid-template-columns:minmax(0,1fr) auto}
      #${APP_ID} .nsit-model-suggestion strong{grid-column:1;grid-row:1;min-width:0;overflow:visible;text-overflow:clip}
      #${APP_ID} .nsit-model-suggestion small{grid-column:2;grid-row:1;justify-self:end;max-width:96px;overflow:hidden;text-overflow:ellipsis}
      #${APP_ID} .nsit-model-suggestion span{grid-column:auto;min-width:0;white-space:normal}
      #${APP_ID} .nsit-model-suggestion-vendor{grid-column:1;grid-row:2;color:#52627c!important}
      #${APP_ID} .nsit-model-suggestion-spec{grid-column:2;grid-row:2;text-align:right}
      #${APP_ID} .nsit-model-suggestion-network{grid-column:1;grid-row:3;color:#52627c!important}
      #${APP_ID} .nsit-model-suggestion-renewal{grid-column:2;grid-row:3;text-align:right}
      #${APP_ID} .nsit-machine-registered{margin-top:auto;border-color:#b9c9df;background:#f5f8fc;color:#506078}
      #${APP_ID} .nsit-machine-registered .nsit-machine-logo{border-radius:4px 4px 2px 2px;background:#dce8f8;color:#3f6d9f}
      #${APP_ID} .nsit-registered-machine-configs-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:rgba(20,29,45,.46)}
      #${APP_ID}.nsit-registered-machine-configs-open .nsit-registered-machine-configs-modal{display:grid;place-items:center}
      #${APP_ID} .nsit-registered-machine-configs-dialog{width:min(720px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--nsit-line);border-radius:12px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.24)}
      #${APP_ID} .nsit-registered-machine-configs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}
      #${APP_ID} .nsit-registered-machine-configs-head h3{font-size:16px}
      #${APP_ID} .nsit-registered-machine-configs{display:grid;gap:8px;min-height:120px;padding:14px 16px}
      #${APP_ID} .nsit-registered-machine-config{display:grid;gap:4px;border:1px solid #e2e8f0;border-radius:8px;background:#fbfcfe;padding:11px 12px}
      #${APP_ID} .nsit-registered-machine-config strong{color:#27334a}
      #${APP_ID} .nsit-registered-machine-config span{color:#506078;font-size:13px;line-height:1.55}
      #${APP_ID} .nsit-registered-machine-config small{color:#8794aa;font-size:12px}
    `;
    injectStyles(`${styles}\n${modelSuggestionStyles}`);
    app.innerHTML = `
      <button type="button" class="nsit-trigger" aria-haspopup="dialog">出🐔模板</button>
      <div class="nsit-modal" aria-hidden="true">
      <div class="nsit-dialog-wrap">
        ${machineTabsMarkup()}
      <div class="nsit-shell" role="dialog" aria-modal="true" aria-label="单机转让帖模板">
        <header class="nsit-head"><div class="nsit-head-copy"><h2>出鸡</h2><small class="nsit-star-note">如果你觉得有帮助，请给我一个<a href="https://github.com/ruoqianfengshao/nodeseek-issue-template" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 仓库"><svg class="nsit-github-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.337-2.22-.253-4.555-1.11-4.555-4.944 0-1.092.39-1.985 1.029-2.684-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.8c.85.004 1.706.115 2.505.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.684 0 3.843-2.338 4.688-4.566 4.937.359.309.678.92.678 1.854 0 1.338-.012 2.418-.012 2.747 0 .268.18.58.688.482A10.002 10.002 0 0 0 22 12c0-5.523-4.477-10-10-10Z"/></svg></a><a href="https://github.com/ruoqianfengshao/nodeseek-issue-template" target="_blank" rel="noopener noreferrer">小星星</a>，感谢</small></div><div><small>不会自动发布</small><button type="button" class="nsit-close" data-action="close" aria-label="关闭表单" title="关闭">×</button></div></header>
        <div class="nsit-body">
          <form id="nsit-form" class="nsit-form" novalidate>
            ${basicConfigMarkup()}
            ${valueCardMarkup()}
            <div class="nsit-title-divider" aria-hidden="true"></div>
            ${section('', ['postTitle'], '', 'nsit-post-title')}
          </form>
          <aside class="nsit-side">${reportsAndRemarksMarkup()}${transferTagsMarkup()}${contactAndPostRemarksMarkup()}</aside>
        </div>
        <div class="nsit-action-dock"><div class="nsit-toggle-group"><label class="nsit-card-toggle"><input type="checkbox" name="generateCard" checked>生成剩余价值图片</label><label class="nsit-card-toggle nsit-config-check-toggle"><input type="checkbox" name="checkMachineConfig" checked><span>授权检查配置并提示</span><i class="nsit-config-check-help" aria-hidden="true">?</i><span class="nsit-config-check-tooltip" role="tooltip">感谢贡献机器配置，配置包含厂商、型号、CPU、内存、硬盘、带宽、流量、续费周期和续费金额，请确认配置信息准确。出鸡时使用配置将看到贡献者的昵称。</span></label></div><div class="nsit-actions"><button type="button" class="nsit-primary" data-action="fill">生成文本模式</button><button type="button" data-action="fill-table">生成表格模式</button><button type="button" data-action="clear">清空表单</button></div><div class="nsit-status" role="status"></div></div>
      </div>
      </div>
      </div>
      <div class="nsit-catalog-modal" aria-hidden="true">
        <section class="nsit-catalog-dialog" role="dialog" aria-modal="true" aria-label="共享机器配置">
          <header class="nsit-catalog-head"><div class="nsit-catalog-head-copy"><h3>查询历史出鸡</h3><small>如果搜不到想出的🐔，请你提交第一份配置</small></div><button type="button" class="nsit-close" data-action="close-machine-catalog" aria-label="关闭查询历史出鸡">×</button></header>
          <form class="nsit-catalog-search" data-nsit-catalog-search><input name="catalogVendor" placeholder="厂商（模糊搜索）" autocomplete="off"><input name="catalogModel" placeholder="型号（模糊搜索）" autocomplete="off"><button type="submit">搜索</button></form>
          <div class="nsit-catalog-results" data-nsit-catalog-results><p class="nsit-catalog-empty">输入厂商或型号后搜索共享配置。</p></div>
        </section>
      </div>
      <div class="nsit-registered-machine-configs-modal" aria-hidden="true">
        <section class="nsit-registered-machine-configs-dialog" role="dialog" aria-modal="true" aria-label="已注册机器配置">
          <header class="nsit-registered-machine-configs-head"><div><h3>已注册机器配置</h3><small>仅首次上报配置会成为贡献者</small></div><button type="button" class="nsit-close" data-action="close-registered-machine-configs" aria-label="关闭已注册机器配置">×</button></header>
          <div class="nsit-registered-machine-configs" data-nsit-registered-machine-configs><p class="nsit-catalog-empty">正在查询…</p></div>
        </section>
      </div>
      `;
    return app;
  }

function formValues(app) {
    const form = app.querySelector('form');
    const values = Object.fromEntries(new FormData(form).entries());
    values.transferTags = Array.from(app.querySelectorAll('[name="transferTags"]:checked'), (input) => input.value);
    return values;
  }

  function machineSnapshot(app) {
    const values = formValues(app);
    return { ...Object.fromEntries(MACHINE_FIELDS.map((name) => [name, values[name] || ''])), transferTags: values.transferTags };
  }

  function machineReady(machine) {
    return Boolean(machine.vendor?.trim() && machine.model?.trim());
  }

  function machineDisplay(machine) {
    const fullName = [machine.vendor, machine.model].filter(Boolean).join(' · ');
    return { fullName: fullName || '填写厂商和型号', model: machine.model || '未命名', logo: (machine.vendor || '?').trim().slice(0, 1).toUpperCase(), icon: VENDOR_ICONS[machine.vendor] || '' };
  }

  function saveActiveMachine(app) {
    if (!app._nsitMachines?.length) return;
    app._nsitMachines[app._nsitActiveMachine] = machineSnapshot(app);
  }

  function applyMachine(app, machine) {
    MACHINE_FIELDS.forEach((name) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control) control.value = machine[name] || (name === 'currency' ? 'USD 美元' : '');
    });
    app.querySelectorAll('[name="transferTags"]').forEach((control) => { control.checked = (machine.transferTags || []).includes(control.value); });
    syncPriceFields(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); loadRate(app);
  }

  function renderMachineTabs(app) {
    const container = app.querySelector('[data-nsit-machine-tabs]');
    if (!container || !app._nsitMachines) return;
    container.innerHTML = app._nsitMachines.map((machine, index) => {
      const info = machineDisplay(machine);
      const active = index === app._nsitActiveMachine;
      const total = effectiveAskingPrice(machine, rateForValues(app, machine));
      const price = Number.isFinite(total) ? `¥${total.toFixed(2)}` : '待定价';
      const logo = info.icon ? `<img src="${escapeHtml(info.icon)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">${escapeHtml(info.logo)}` : escapeHtml(info.logo);
      return `<button type="button" class="nsit-machine-tab${active ? ' is-active' : ''}" data-machine-index="${index}" title="${escapeHtml(info.fullName)}"><small class="nsit-machine-index">#${index + 1}</small><i class="nsit-machine-logo">${logo}</i><span class="nsit-machine-name">${escapeHtml(info.model)}</span><small class="nsit-machine-meta">${escapeHtml(price)}</small></button>`;
    }).join('') + `<button type="button" class="nsit-machine-tab nsit-machine-add" data-action="add-machine"${machineReady(app._nsitMachines[app._nsitActiveMachine]) ? '' : ' disabled'}><i class="nsit-machine-logo">＋</i><span class="nsit-machine-name">添加单机</span></button><button type="button" class="nsit-machine-tab nsit-machine-registered" data-action="open-registered-machine-configs"><i class="nsit-machine-logo">🐔</i><span class="nsit-machine-name">已注册机器配置</span></button>`;
  }

  function initializeMachines(app) {
    app._nsitMachines = [machineSnapshot(app)];
    app._nsitActiveMachine = 0;
    renderMachineTabs(app);
  }

  function switchMachine(app, index) {
    if (index === app._nsitActiveMachine || !app._nsitMachines[index]) return;
    saveActiveMachine(app);
    app._nsitActiveMachine = index;
    applyMachine(app, app._nsitMachines[index]);
    renderMachineTabs(app);
  }

  function addMachine(app) {
    saveActiveMachine(app);
    if (!machineReady(app._nsitMachines[app._nsitActiveMachine])) return;
    app._nsitMachines.push({ currency: 'USD 美元', tradeDate: today() });
    app._nsitActiveMachine = app._nsitMachines.length - 1;
    applyMachine(app, app._nsitMachines[app._nsitActiveMachine]);
    renderMachineTabs(app);
  }

  function removeActiveMachine(app) {
    if (!app._nsitMachines || app._nsitMachines.length < 2) return false;
    app._nsitMachines.splice(app._nsitActiveMachine, 1);
    app._nsitActiveMachine = Math.min(app._nsitActiveMachine, app._nsitMachines.length - 1);
    applyMachine(app, app._nsitMachines[app._nsitActiveMachine]);
    renderMachineTabs(app);
    refreshTitle(app);
    return true;
  }

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
  }

  function differenceInDays(later, earlier) {
    return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 86400000));
  }

  function addMonths(date, months) {
    const result = new Date(date.getTime());
    const originalDay = result.getUTCDate();
    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);
    const endOfMonth = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
    result.setUTCDate(Math.min(originalDay, endOfMonth));
    return result;
  }

  function calculation(values) {
    const expiry = parseDate(values.expiryDate);
    const trade = parseDate(values.tradeDate);
    const amount = Number(values.renewalAmount);
    const months = CYCLE_MONTHS[values.renewalCycle];
    if (!expiry || !trade || !Number.isFinite(amount) || amount < 0) return null;
    const cycleDays = months ? differenceInDays(expiry, addMonths(expiry, -months)) : 0;
    if (!Number.isFinite(cycleDays) || cycleDays <= 0) return null;
    const daysLeft = differenceInDays(expiry, trade);
    return { amount, cycleDays, daysLeft, percentage: Math.min(100, daysLeft / cycleDays * 100), value: amount * daysLeft / cycleDays };
  }

  function trafficMeasurement(value) {
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*([gt])b?$/i);
    if (!match) return null;
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount < 0) return null;
    const unit = match[2].toUpperCase();
    return { amount, unit, gigabytes: amount * (unit === 'T' ? 1024 : 1) };
  }

  function trafficInGigabytes(value) {
    const measurement = trafficMeasurement(value);
    return measurement?.gigabytes ?? null;
  }

  function formatTrafficAmount(amount, unit) {
    const value = Math.round((Math.max(0, amount) + Number.EPSILON) * 100) / 100;
    return `${value}${unit}`;
  }

  function trafficUsageFromRemaining(total, remainingTraffic) {
    const remaining = trafficInGigabytes(remainingTraffic);
    if (remaining === null) return 0;
    return Math.max(0, Math.min(total.gigabytes, total.gigabytes - remaining));
  }

  function updateTrafficUsageUi(app) {
    const total = trafficMeasurement(app.querySelector('[name="traffic"]')?.value);
    const trigger = app.querySelector('[data-nsit-remaining-traffic]');
    const tooltip = app.querySelector('[data-nsit-traffic-usage-tooltip]');
    const popover = app.querySelector('[data-nsit-traffic-usage-popover]');
    const usedInput = app.querySelector('[data-nsit-traffic-used]');
    const slider = app.querySelector('[data-nsit-traffic-used-slider]');
    const maximum = app.querySelector('[data-nsit-traffic-maximum]');
    const unit = app.querySelector('[data-nsit-traffic-used-unit]');
    const presets = app.querySelector('[data-nsit-traffic-usage-presets]');
    const remaining = app.querySelector('[name="remainingTraffic"]');
    if (!trigger || !remaining) return;
    trigger.disabled = !total;
    trigger.title = total ? '配置剩余流量' : '剩余流量配置，请先配置流量';
    if (tooltip) tooltip.title = trigger.title;
    if (!total) {
      popover.hidden = true;
      trigger.textContent = '剩余 ?';
      if (maximum) maximum.textContent = '—';
      return;
    }
    if (!String(remaining.value || '').trim() || trafficInGigabytes(remaining.value) > total.gigabytes) {
      remaining.value = formatTrafficAmount(total.gigabytes, 'G');
    }
    const used = trafficUsageFromRemaining(total, remaining.value);
    if (usedInput) { usedInput.max = String(total.gigabytes); usedInput.value = String(used); }
    if (slider) {
      slider.max = String(total.gigabytes); slider.step = '1'; slider.value = String(Math.round(used));
      slider.style.setProperty('--nsit-traffic-used-percent', `${total.gigabytes ? used / total.gigabytes * 100 : 0}%`);
    }
    if (unit) unit.textContent = 'G';
    if (maximum) maximum.textContent = app.querySelector('[name="traffic"]')?.value || '—';
    if (presets) {
      presets.innerHTML = [0, 25, 50, 75, 100].map((percent) => {
        const value = Math.round(total.gigabytes * percent / 100);
        return `<button type="button" data-nsit-traffic-used-preset="${value}">${percent}%</button>`;
      }).join('');
    }
    const configured = Boolean(String(remaining.value || '').trim());
    trigger.textContent = configured ? `剩余: ${remaining.value}` : '剩余 ?';
    trigger.title = configured ? '修改剩余流量' : '剩余流量配置，请先配置流量';
  }

  function setTrafficUsage(app, used) {
    const total = trafficMeasurement(app.querySelector('[name="traffic"]')?.value);
    const remaining = app.querySelector('[name="remainingTraffic"]');
    if (!total || !remaining) return;
    const normalizedUsed = Math.round(Math.max(0, Math.min(total.gigabytes, Number(used) || 0)) * 100) / 100;
    remaining.value = formatTrafficAmount(total.gigabytes - normalizedUsed, 'G');
    updateTrafficUsageUi(app);
  }

  function remainingTrafficError(machine) {
    if (!String(machine.remainingTraffic || '').trim()) return '';
    const remaining = trafficInGigabytes(machine.remainingTraffic);
    if (remaining === null) return '剩余流量请填写数量加单位，例如 500G 或 1T。';
    const total = trafficInGigabytes(machine.traffic);
    if (total === null) return '填写剩余流量时，流量也请填写数量加单位，例如 1T。';
    return remaining > total ? '剩余流量不能超过流量。' : '';
  }

  function refreshRemainingTrafficValidity(app) {
    const input = app.querySelector('[name="remainingTraffic"]');
    if (input) input.setCustomValidity(remainingTrafficError(formValues(app)));
    updateTrafficUsageUi(app);
  }

  function trafficDisplay(values) {
    if (!values.traffic) return '';
    return values.remainingTraffic ? `${values.traffic}（剩余：${values.remainingTraffic}）` : values.traffic;
  }

  function currencySymbol(currency) {
    return ({
      'CNY 人民币': '¥', 'USD 美元': '$', 'EUR 欧元': '€', 'GBP 英镑': '£',
      'JPY 日元': '¥', 'KRW 韩元': '₩', 'AUD 澳元': 'A$', 'HKD 港元': 'HK$',
      'TWD 新台币': 'NT$', 'CAD 加拿大元': 'C$', 'SGD 新加坡元': 'S$',
    })[currency] || '';
  }

  function currencyCode(currency) {
    return CURRENCY_CODES[currency] || '';
  }

  function rateFromCache(code) {
    if (code === 'CNY') return { rate: 1, updatedAt: Date.now() };
    try {
      const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || '{}');
      const record = cached[code];
      return record && Number.isFinite(record.rate) ? record : null;
    } catch (_) {
      return null;
    }
  }

  function saveRateToCache(code, rate) {
    try {
      const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || '{}');
      cached[code] = { rate, updatedAt: Date.now() };
      localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cached));
    } catch (_) { /* 缓存失败时仍可使用当前汇率 */ }
  }

  function activeRate(app) {
    const code = currencyCode(formValues(app).currency);
    if (!code) return null;
    return app._nsitRates?.[code] || rateFromCache(code);
  }

  function rateForValues(app, values) {
    const code = currencyCode(values.currency);
    return code ? app._nsitRates?.[code] || rateFromCache(code) : null;
  }

  function refreshRateDisplay(app, message = '') {
    const values = formValues(app);
    const code = currencyCode(values.currency);
    const target = app.querySelector('[data-nsit-rate]');
    if (!code) { target.textContent = '选择币种后加载'; return; }
    const record = activeRate(app);
    if (!record) { target.textContent = message || '汇率未加载'; return; }
    target.textContent = code === 'CNY' ? '1 CNY = 1.0000' : `1 ${code} = ${record.rate.toFixed(4)}`;
  }

  async function loadRate(app, force = false) {
    const code = currencyCode(formValues(app).currency);
    if (!code) return;
    const cached = rateFromCache(code);
    if (!force && cached && Date.now() - cached.updatedAt < 3600000) {
      app._nsitRates = { ...(app._nsitRates || {}), [code]: cached };
      refreshRateDisplay(app);
      refreshCard(app); refreshPricePreview(app); refreshTitle(app);
      return;
    }
    if (code === 'CNY') {
      const record = { rate: 1, updatedAt: Date.now() };
      app._nsitRates = { ...(app._nsitRates || {}), [code]: record };
      refreshRateDisplay(app);
      refreshCard(app); refreshPricePreview(app); refreshTitle(app);
      return;
    }
    refreshRateDisplay(app, '正在加载…');
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(code)}`);
      const data = await response.json();
      const rate = Number(data?.rates?.CNY);
      if (!response.ok || !Number.isFinite(rate) || rate <= 0) throw new Error('invalid rate');
      const record = { rate, updatedAt: Date.now() };
      app._nsitRates = { ...(app._nsitRates || {}), [code]: record };
      saveRateToCache(code, rate);
      refreshRateDisplay(app);
    } catch (_) {
      refreshRateDisplay(app, '汇率加载失败');
    }
    refreshCard(app); refreshPricePreview(app); refreshTitle(app);
  }

  function refreshCard(app) {
    const values = formValues(app);
    const result = calculation(values);
    const rate = activeRate(app);
    const amountCny = app.querySelector('[data-nsit-amount-cny]');
    const output = app.querySelector('[data-nsit-value-output]');
    const days = app.querySelector('[data-days]');
    const percent = app.querySelector('[data-percent]');
    const progress = app.querySelector('[data-progress]');
    const progressTrack = app.querySelector('.nsit-title-progress');
    const amount = parsePrice(values.renewalAmount);
    amountCny.textContent = Number.isFinite(amount) && rate ? `≈ ¥${(amount * rate.rate).toFixed(2)}` : '≈ ¥ ?';
    if (!result) {
      output.innerHTML = '<small>¥</small>0.00';
      days.textContent = '剩余 ? 天'; percent.textContent = '周期占比 ?'; progress.style.width = '0%'; progressTrack.hidden = true; progressTrack.classList.remove('is-visible');
      return;
    }
    output.innerHTML = rate ? `<small>¥</small>${(result.value * rate.rate).toFixed(2)}` : '<small>¥</small>—';
    days.textContent = `剩余 ${result.daysLeft} 天`; percent.textContent = `周期占比 ${result.percentage.toFixed(1)}%`; progress.style.width = `${result.percentage}%`;
    const wasHidden = progressTrack.hidden;
    progressTrack.hidden = false;
    if (wasHidden) { progressTrack.classList.remove('is-visible'); void progressTrack.offsetWidth; progressTrack.classList.add('is-visible'); }
  }

  function parsePrice(value) {
    const matched = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return matched ? Number(matched[0]) : NaN;
  }

  function effectiveAskingPrice(values, rate) {
    const askingPrice = parsePrice(values.askingPrice);
    if (Number.isFinite(askingPrice)) return askingPrice;
    const premium = parsePrice(values.askingPremium);
    const result = calculation(values);
    return Number.isFinite(premium) && result && rate ? result.value * rate.rate + premium : NaN;
  }

  function syncPriceFields(app) {
    const asking = app.querySelector('[name="askingPrice"]');
    const premium = app.querySelector('[name="askingPremium"]');
    const hasAsking = Number.isFinite(parsePrice(asking.value));
    const hasPremium = Number.isFinite(parsePrice(premium.value));
    if (hasAsking && hasPremium) premium.value = '';
    asking.disabled = !hasAsking && hasPremium;
    premium.disabled = hasAsking;
  }

  function formatPrice(value, symbol) {
    return `${symbol}${value.toFixed(2)}`;
  }

  function formatAmount(value) {
    const amount = parsePrice(value);
    return Number.isFinite(amount) ? amount.toFixed(2) : '';
  }

  function formatPreviewOperand(value) {
    return Number(value).toFixed(2);
  }

  function setPricePreview(app, state, html) {
    const preview = app.querySelector('[data-nsit-price-preview]');
    if (preview.dataset.previewHtml === html && preview.dataset.priceState === state) return;
    preview.dataset.priceState = state;
    preview.dataset.previewHtml = html;
    preview.innerHTML = '';
    const content = document.createElement('span');
    content.className = 'nsit-price-typing';
    content.innerHTML = html;
    preview.append(content);
  }

  function refreshPricePreview(app) {
    const values = formValues(app);
    const preview = app.querySelector('[data-nsit-price-preview]');
    const premium = parsePrice(values.askingPremium);
    const askingPrice = effectiveAskingPrice(values, activeRate(app));
    const result = calculation(values);
    const rate = activeRate(app);
    const symbol = '¥';
    if (!Number.isFinite(askingPrice) || askingPrice < 0) {
      setPricePreview(app, 'neutral', '填写预出价格或预出溢价后显示价格预览');
      return;
    }
    const remainingCny = result && rate ? result.value * rate.rate : null;
    if (Number.isFinite(premium)) {
      if (!Number.isFinite(remainingCny) || remainingCny === 0) {
        setPricePreview(app, 'premium', `<b>溢价 ${formatPrice(premium, symbol)}</b>`);
      } else {
        setPricePreview(app, 'premium', `<span>${formatPreviewOperand(premium)} + ${formatPreviewOperand(remainingCny)} =</span><b>总价 ${formatPrice(askingPrice, symbol)}</b>`);
      }
      return;
    }
    if (!Number.isFinite(remainingCny) || remainingCny === 0) {
      setPricePreview(app, 'premium', `<span>溢价</span><b>${formatPrice(askingPrice, symbol)}</b>`);
      return;
    }
    if (askingPrice > remainingCny) {
      setPricePreview(app, 'premium', `<span>${formatPreviewOperand(askingPrice)} − ${formatPreviewOperand(remainingCny)} =</span><b>溢价 ${formatPrice(askingPrice - remainingCny, symbol)}</b>`);
      return;
    }
    if (askingPrice === remainingCny) {
      setPricePreview(app, 'fair', '<b>剩余价值出</b>');
      return;
    }
    setPricePreview(app, 'fair', `<span>${formatPreviewOperand(askingPrice)} ÷ ${formatPreviewOperand(remainingCny)} =</span><b>${(askingPrice / remainingCny * 10).toFixed(1)} 折</b>`);
  }

  function createValueCard(values, app, rate = activeRate(app)) {
    const result = calculation(values);
    if (!result || !rate) throw new Error('请先填写有效的续费信息并等待汇率加载完成');
    const askingPrice = effectiveAskingPrice(values, rate);
    const cny = result.value * rate.rate;
    const canvas = document.createElement('canvas');
    const cardWidth = 1200;
    const cardHeight = 550;
    canvas.width = cardWidth; canvas.height = cardHeight;
    const context = canvas.getContext('2d');
    const roundedBox = (x, y, width, height, radius, fill, stroke = '') => {
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
      if (fill) { context.fillStyle = fill; context.fill(); }
      if (stroke) { context.strokeStyle = stroke; context.lineWidth = 2; context.stroke(); }
    };
    const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    const date = values.tradeDate || '—';
    context.beginPath();
    context.roundRect(2, 2, cardWidth - 4, cardHeight - 4, 28);
    context.fillStyle = '#f8fafc'; context.fill();
    context.strokeStyle = '#dbe4ef'; context.lineWidth = 3; context.stroke();
    roundedBox(2, 2, cardWidth - 4, 108, 26, '#27334a');
    context.fillStyle = '#fff'; context.font = `700 34px ${sans}`;
    context.fillText('剩余价值', 42, 55);
    context.fillStyle = '#bdc9da'; context.font = `400 21px ${sans}`;
    context.fillText('按续费金额、周期与计算日期估算', 42, 88);
    context.textAlign = 'right'; context.fillStyle = '#fff3d8'; context.font = `600 24px ${sans}`;
    context.fillText(`剩余 ${result.daysLeft} 天`, 1158, 55);
    context.fillStyle = '#bdc9da'; context.font = `400 20px ${sans}`;
    context.fillText(`周期占比 ${result.percentage.toFixed(1)}%`, 1158, 87); context.textAlign = 'left';

    const info = [
      ['续费金额 / 周期', `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} / ${values.renewalCycle || '—'}`],
      ['到期日期', values.expiryDate || '—'],
      ['价值计算日期', date],
    ];
    const infoWidth = 368;
    info.forEach(([label, value], index) => {
      const x = 32 + index * (infoWidth + 16);
      roundedBox(x, 138, infoWidth, 98, 16, '#fff', '#dfe7f0');
      context.fillStyle = '#718096'; context.font = `500 19px ${sans}`;
      context.fillText(label, x + 20, 172);
      context.fillStyle = '#27334a'; context.font = `650 26px ${sans}`;
      context.fillText(value, x + 20, 210);
    });

    roundedBox(32, 264, 544, 238, 20, '#fff8e9', '#efd39a');
    context.fillStyle = '#8b641e'; context.font = `600 22px ${sans}`;
    context.fillText('剩余价值', 60, 305);
    context.fillStyle = '#d9961c'; context.font = `750 76px ${sans}`;
    context.fillText(`¥${cny.toFixed(2)}`, 60, 391);
    context.fillStyle = '#718096'; context.font = `500 18px ${sans}`;
    context.fillText(`${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} × ${result.daysLeft} 天 ÷ ${result.cycleDays} 天 = ${currencySymbol(values.currency)}${result.value.toFixed(2)}`, 60, 438);
    context.fillStyle = '#95a3b8'; context.font = `400 18px ${sans}`;
    context.fillText(`汇率：1 ${currencyCode(values.currency) || values.currency || '—'} = ${rate.rate.toFixed(4)} CNY`, 60, 476);

    let previewTop = '未填写预出价格';
    let previewBottom = '填写总价或溢价后显示预览';
    let previewColor = '#718096';
    if (Number.isFinite(askingPrice) && askingPrice >= 0) {
      if (cny === 0) { previewTop = `溢价 ¥${askingPrice.toFixed(2)}`; previewBottom = '剩余价值为 0'; previewColor = '#c04444'; }
      else if (askingPrice > cny) { previewTop = `溢价 ¥${(askingPrice - cny).toFixed(2)}`; previewBottom = `总价 ¥${askingPrice.toFixed(2)} − 剩余价值 ¥${cny.toFixed(2)}`; previewColor = '#c04444'; }
      else if (askingPrice === cny) { previewTop = '剩余价值出'; previewBottom = `总价 ¥${askingPrice.toFixed(2)}`; previewColor = '#27834a'; }
      else { previewTop = `${(askingPrice / cny * 10).toFixed(1)} 折`; previewBottom = `总价 ¥${askingPrice.toFixed(2)} ÷ 剩余价值 ¥${cny.toFixed(2)}`; previewColor = '#27834a'; }
    }
    roundedBox(592, 264, 576, 238, 20, '#fff', '#dfe7f0');
    context.fillStyle = '#52627c'; context.font = `600 22px ${sans}`;
    context.fillText('价格预览', 620, 305);
    context.fillStyle = previewColor; context.font = `750 65px ${sans}`;
    context.fillText(previewTop, 620, 391);
    context.fillStyle = '#718096'; context.font = `500 20px ${sans}`;
    context.fillText(previewBottom, 620, 438);
    context.fillStyle = '#95a3b8'; context.font = `400 18px ${sans}`;
    context.fillText('价格以人民币计算', 620, 474);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('卡片生成失败')), 'image/png'));
  }

  function nodeImageRequest(options) {
    if (typeof GM_xmlhttpRequest !== 'function') throw new Error('请在 Tampermonkey 中运行脚本以上传图片');
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({ ...options, withCredentials: true, responseType: 'json', onload: (response) => response.status === 200 ? resolve(response.response) : reject(Object.assign(new Error(`上传失败（HTTP ${response.status}）`), { status: response.status })), onerror: () => reject(new Error('图片上传网络错误')) });
    });
  }

  async function getNodeImageApiKey(force = false) {
    const cached = !force && typeof GM_getValue === 'function' ? GM_getValue(NODEIMAGE_KEY, '') : '';
    if (cached) return cached;
    const response = await nodeImageRequest({ method: 'GET', url: 'https://api.nodeimage.com/api/user/api-key', headers: { Accept: 'application/json' } });
    if (!response?.api_key) throw new Error('请先登录 NodeImage 后重试');
    GM_setValue(NODEIMAGE_KEY, response.api_key);
    return response.api_key;
  }

  async function uploadValueCard(values, app, rate) {
    const blob = await createValueCard(values, app, rate);
    const upload = async (forceKey = false) => {
      const data = new FormData();
      data.append('image', new File([blob], 'nodeseek-value-card.png', { type: 'image/png' }));
      const apiKey = await getNodeImageApiKey(forceKey);
      return nodeImageRequest({ method: 'POST', url: 'https://api.nodeimage.com/api/upload', headers: { Accept: 'application/json', 'X-API-Key': apiKey }, data });
    };
    let response;
    try {
      response = await upload();
    } catch (error) {
      if (error.status !== 401) throw error;
      typeof GM_setValue === 'function' && GM_setValue(NODEIMAGE_KEY, '');
      response = await upload(true);
    }
    if (!response?.success || !response?.links?.markdown) {
      if (String(response?.error || '').toLowerCase().match(/unauthorized|invalid api key|未授权|无效/)) typeof GM_setValue === 'function' && GM_setValue(NODEIMAGE_KEY, '');
      throw new Error(response?.error || 'NodeImage 未返回图片链接');
    }
    return response.links.markdown;
  }

  function titlePricePreview(values, rate) {
    const askingPrice = effectiveAskingPrice(values, rate);
    if (!Number.isFinite(askingPrice) || askingPrice < 0) return '';
    const result = calculation(values);
    const remainingCny = result && rate ? result.value * rate.rate : null;
    const premium = parsePrice(values.askingPremium);
    const total = `总价 ${formatPrice(askingPrice, '¥')}`;
    if (Number.isFinite(premium)) return Number.isFinite(remainingCny) && remainingCny !== 0 ? `${total} · 溢价 ¥${premium.toFixed(2)}` : `溢价 ¥${premium.toFixed(2)}`;
    if (!Number.isFinite(remainingCny) || remainingCny === 0) return `${total} · 溢价 ${formatPrice(askingPrice, '¥')}`;
    if (askingPrice > remainingCny) return `${total} · 溢价 ¥${(askingPrice - remainingCny).toFixed(2)}`;
    if (askingPrice < remainingCny) return `${total} · 剩余价值 ${(askingPrice / remainingCny * 10).toFixed(1)} 折`;
    return `剩余价值 ¥${askingPrice} 出`;
  }

  function suggestedTitle(values, rate) {
    const name = [values.vendor, values.model].filter(Boolean).join(' ');
    const spec = [values.cpu, values.memory, values.disk, values.bandwidth, values.traffic].filter(Boolean).join(' / ');
    const price = titlePricePreview(values, rate);
    if (!name && !spec && !price) return '';
    return `【出】${[price, name, spec].filter(Boolean).join(' · ')}`;
  }

  function multiMachineTitle(machines, app) {
    const entries = machines.map((machine) => {
      const name = [machine.vendor, machine.model].filter(Boolean).join(' ');
      const price = effectiveAskingPrice(machine, rateForValues(app, machine));
      return [name, Number.isFinite(price) ? `¥${price.toFixed(2)}` : '待定价'].filter(Boolean).join(' ');
    }).filter(Boolean);
    return entries.length ? `【出】${entries.join(' · ')}` : '';
  }

  function refreshTitle(app) {
    const title = app.querySelector('[name="postTitle"]');
    if (!title || !app._nsitMachines) return;
    saveActiveMachine(app);
    const machines = app._nsitMachines.filter(machineReady);
    const suggestion = machines.length > 1
      ? multiMachineTitle(machines, app)
      : suggestedTitle(formValues(app), activeRate(app));
    if (suggestion) title.value = suggestion;
  }

  function markdown(values, cardMarkdown = '', rate = null) {
    const result = calculation(values);
    const pair = (label, value) => value ? `- ${label}：${value}` : '';
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    const basic = [[values.vendor, values.model].filter(Boolean).join(' ') ? `- 厂商&型号：${[values.vendor, values.model].filter(Boolean).join(' ')}` : '', [['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', trafficDisplay(values)]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，') ? `- 配置：${[['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', trafficDisplay(values)]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，')}` : ''].filter(Boolean);
    const renewal = [values.renewalAmount || values.renewalCycle ? `- 续费金额 / 周期：${[values.renewalAmount ? `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}（${values.currency}）` : '', values.renewalCycle].filter(Boolean).join(' / ')}` : '', pair('到期日期', values.expiryDate), pair('交易日期', values.tradeDate)].filter(Boolean);
    if (result && rate) {
      const cnyValue = result.value * rate.rate;
      const originalValue = `${currencySymbol(values.currency)}${result.value.toFixed(2)}`;
      const calculation = `¥${cnyValue.toFixed(2)}`;
      const detail = currencyCode(values.currency) === 'CNY'
        ? `（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`
        : ` = ${originalValue} × ${rate.rate.toFixed(4)}（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`;
      renewal.push(`- 剩余价值：${calculation}${detail}`);
    } else if (result) {
      renewal.push(`- 剩余价值：${currencySymbol(values.currency)}${result.value.toFixed(2)}（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`);
    }
    const askingPrice = effectiveAskingPrice(values, rate);
    if (Number.isFinite(askingPrice)) renewal.push(`- 预出价格：¥${askingPrice.toFixed(2)}（人民币）`);
    if (cardMarkdown) renewal.push(cardMarkdown);
    const transfer = values.transferTags.map((tag) => `- ${tag}`);
    const reports = [values.nqUrl ? `- [NQ 地址](${values.nqUrl})` : '', values.tqUrl ? `- [TQ 地址](${values.tqUrl})` : '', pair('TG 联系', tgContact(values.tgContact))].filter(Boolean);
    const parts = [];
    if (basic.length) parts.push(`## 基本信息\n${basic.join('\n')}`);
    if (renewal.length) parts.push(`## 续费与价值\n${renewal.join('\n')}`);
    if (transfer.length) parts.push(`## 转让信息\n${transfer.join('\n')}`);
    if (reports.length) parts.push(`## 测试报告\n${reports.join('\n')}`);
    const remarks = String(values.remarks || '').trim();
    if (remarks) parts.push(`## 单机备注\n${remarks}`);
    const postRemarks = String(values.postRemarks || '').trim();
    if (postRemarks) parts.push(`## 整贴备注\n${postRemarks}`);
    return parts.join('\n\n');
  }

  function tableMarkdown(values, app, cardMarkdown) {
    const result = calculation(values);
    const rate = activeRate(app);
    const remaining = result && rate ? `¥${(result.value * rate.rate).toFixed(2)}` : '—';
    const vendorModel = [values.vendor, values.model].filter(Boolean).join(' · ');
    const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
    const network = [values.bandwidth, trafficDisplay(values)].filter(Boolean).join('/');
    const renewal = [values.renewalAmount ? `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}` : '', values.renewalCycle].filter(Boolean).join('/');
    const reports = [values.nqUrl ? `[NQ](${values.nqUrl})` : '', values.tqUrl ? `[TQ](${values.tqUrl})` : ''].filter(Boolean).join(' / ');
    const askingPrice = effectiveAskingPrice(values, rate);
    const remainingCny = result && rate ? result.value * rate.rate : null;
    let price = Number.isFinite(askingPrice) ? `总价 ¥${askingPrice.toFixed(2)}` : '—';
    if (Number.isFinite(askingPrice) && Number.isFinite(remainingCny)) {
      if (remainingCny === 0) price += ` · 溢价 ¥${askingPrice.toFixed(2)}`;
      else if (askingPrice > remainingCny) price += ` · 溢价 ¥${(askingPrice - remainingCny).toFixed(2)}`;
      else if (askingPrice === remainingCny) price = `剩余价值 ¥${askingPrice.toFixed(2)} 出`;
      else price += ` · ${(askingPrice / remainingCny * 10).toFixed(1)} 折`;
    }
    const table = `| 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 测试报告 | 价格 |\n| --- | --- | --- | --- | --- | --- | --- |\n| ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${reports} | ${price} |`;
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    const other = [values.transferTags.length ? `- 转让信息：${values.transferTags.join('、')}` : '', values.tgContact ? `- TG 联系：${tgContact(values.tgContact)}` : '', String(values.remarks || '').trim() ? `- 单机备注：${String(values.remarks).trim()}` : '', String(values.postRemarks || '').trim() ? `- 整贴备注：${String(values.postRemarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cardMarkdown ? `## 剩余价值\n${cardMarkdown}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function textMarkdownForMachines(machines, app, cards, shared) {
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    if (machines.length === 1) {
      const other = [shared.tgContact ? `## 联系方式\n- TG 联系：${tgContact(shared.tgContact)}` : '', String(shared.postRemarks || '').trim() ? `## 整贴备注\n${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
      return [markdown(machines[0], cards[0] || '', rateForValues(app, machines[0])), ...other].join('\n\n');
    }
    const blocks = machines.map((machine, index) => `## #${index + 1} 鸡\n\n${markdown(machine, cards[index] || '', rateForValues(app, machine))}`);
    const other = [shared.tgContact ? `## 联系方式\n- TG 联系：${tgContact(shared.tgContact)}` : '', String(shared.postRemarks || '').trim() ? `## 整贴备注\n${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
    return [...blocks, ...other].filter(Boolean).join('\n\n---\n\n');
  }

  function tableMarkdownForMachines(machines, app, cards, shared) {
    if (machines.length === 1) return tableMarkdown({ ...machines[0], tgContact: shared.tgContact, postRemarks: shared.postRemarks }, app, cards[0] || '');
    const rows = machines.map((values, index) => {
      const result = calculation(values);
      const rate = rateForValues(app, values);
      const remaining = result && rate ? `¥${(result.value * rate.rate).toFixed(2)}` : '—';
      const vendorModel = [values.vendor, values.model].filter(Boolean).join(' · ');
      const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
      const network = [values.bandwidth, trafficDisplay(values)].filter(Boolean).join('/');
      const renewal = [values.renewalAmount ? `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}` : '', values.renewalCycle].filter(Boolean).join('/');
      const reports = [values.nqUrl ? `[NQ](${values.nqUrl})` : '', values.tqUrl ? `[TQ](${values.tqUrl})` : ''].filter(Boolean).join(' / ');
      const askingPrice = effectiveAskingPrice(values, rate);
      const remainingCny = result && rate ? result.value * rate.rate : null;
      let price = Number.isFinite(askingPrice) ? `总价 ¥${askingPrice.toFixed(2)}` : '—';
      if (Number.isFinite(askingPrice) && Number.isFinite(remainingCny)) {
        if (remainingCny === 0) price += ` · 溢价 ¥${askingPrice.toFixed(2)}`;
        else if (askingPrice > remainingCny) price += ` · 溢价 ¥${(askingPrice - remainingCny).toFixed(2)}`;
        else if (askingPrice === remainingCny) price = `剩余价值 ¥${askingPrice.toFixed(2)} 出`;
        else price += ` · ${(askingPrice / remainingCny * 10).toFixed(1)} 折`;
      }
      return `| #${index + 1} | ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${reports} | ${price} |`;
    });
    const table = `| 编号 | 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 测试报告 | 价格 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}`;
    const notes = machines.flatMap((machine, index) => {
      const reference = `#${index + 1} ${[machine.vendor, machine.model].filter(Boolean).join(' ')}`;
      return [
      machine.transferTags?.length ? `- ${reference} 转让信息：${machine.transferTags.join('、')}` : '',
      String(machine.remarks || '').trim() ? `- ${reference} 单机备注：${String(machine.remarks).trim()}` : '',
      ];
    }).filter(Boolean);
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    const other = [shared.tgContact ? `- TG 联系：${tgContact(shared.tgContact)}` : '', ...notes, String(shared.postRemarks || '').trim() ? `- 整贴备注：${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cards.filter(Boolean).length ? `## 剩余价值\n${cards.filter(Boolean).join('\n\n')}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function saveDraft(app) {
    const values = formValues(app);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    const tgContact = String(values.tgContact || '').trim();
    if (tgContact) localStorage.setItem(TG_CONTACT_KEY, tgContact);
  }

  function restoreDraft(app) {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.entries(draft).forEach(([name, value]) => {
        if (name === 'transferTags' && Array.isArray(value)) {
          value.forEach((tag) => {
            const control = app.querySelector(`[name="transferTags"][value="${CSS.escape(tag)}"]`);
            if (control) control.checked = true;
          });
          return;
        }
        const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
        if (control) control.value = value;
      });
    } catch (_) { /* 无效草稿时忽略 */ }
    try {
      const tgContact = localStorage.getItem(TG_CONTACT_KEY)?.trim();
      const control = app.querySelector('[name="tgContact"]');
      if (tgContact && control) control.value = tgContact;
    } catch (_) { /* 存储不可用时忽略 */ }
  }

  function restoreCardToggle(app) {
    try {
      const saved = localStorage.getItem(CARD_TOGGLE_KEY);
      if (saved !== null) app.querySelector('[name="generateCard"]').checked = saved === 'true';
    } catch (_) { /* 存储不可用时使用默认勾选 */ }
  }

  function editorContent(app) {
    const codeMirror = Array.from(document.querySelectorAll('.CodeMirror')).find((element) => !app.contains(element));
    if (codeMirror?.CodeMirror && typeof codeMirror.CodeMirror.getValue === 'function') return codeMirror.CodeMirror.getValue();
    const textarea = Array.from(document.querySelectorAll('#mde-title ~ textarea, textarea')).find((element) => !app.contains(element));
    return textarea?.value || '';
  }

  function sectionContent(content, heading) {
    const match = content.match(new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, 'm'));
    return match ? match[1].trim() : '';
  }

  function valueFromMarkdown(content, label) {
    const match = content.match(new RegExp(`^- ${label}：[ \\t]*(.+)$`, 'm'));
    return match ? match[1].trim() : '';
  }

  function splitVendorModel(value) {
    const source = String(value || '').trim();
    const vendor = OPTIONS.vendors.find((item) => source === item || source.startsWith(`${item} `));
    if (vendor) return { vendor, model: source.slice(vendor.length).trim() };
    const [fallbackVendor = '', ...model] = source.split(/\s+/);
    return { vendor: fallbackVendor, model: model.join(' ') };
  }

  function currencyFromSymbol(symbol) {
    return Object.keys(CURRENCY_CODES).find((currency) => currencySymbol(currency) === symbol) || 'USD 美元';
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function textMachineFromMarkdown(content, app) {
    const machine = { currency: 'USD 美元', tradeDate: today(), transferTags: [] };
    const basic = sectionContent(content, '基本信息');
    const renewal = sectionContent(content, '续费与价值');
    const reports = sectionContent(content, '测试报告');
    Object.assign(machine, splitVendorModel(valueFromMarkdown(basic, '厂商&型号')));
    const config = valueFromMarkdown(basic, '配置');
    [['cpu', 'CPU'], ['memory', '内存'], ['disk', '硬盘'], ['bandwidth', '带宽'], ['traffic', '流量']].forEach(([name, label]) => {
      const match = config.match(new RegExp(`${label}：([^，\\n]+)`));
      if (match) {
        const traffic = match[1].trim();
        if (name === 'traffic') {
          const remaining = traffic.match(/^(.*?)（剩余：(.+)）$/);
          machine.traffic = (remaining?.[1] || traffic).trim();
          if (remaining) machine.remainingTraffic = remaining[2].trim();
        } else machine[name] = traffic;
      }
    });
    ['renewalCycle', 'expiryDate', 'tradeDate'].forEach((name) => {
      const label = fields.find(([fieldName]) => fieldName === name)?.[1];
      machine[name] = valueFromMarkdown(renewal, label) || machine[name];
    });
    const amount = valueFromMarkdown(renewal, '续费金额');
    const amountMatch = amount.match(/^(.+?)([\d.]+)（(.+?)）$/);
    if (amountMatch) { machine.renewalAmount = amountMatch[2]; machine.currency = amountMatch[3]; }
    const asking = valueFromMarkdown(renewal, '预出价格').match(/¥([\d.]+)/);
    if (asking) machine.askingPrice = asking[1];
    [['nqUrl', 'NQ 地址'], ['tqUrl', 'TQ 地址']].forEach(([name, label]) => { machine[name] = valueFromMarkdown(reports, label); });
    const transfer = sectionContent(content, '转让信息');
    machine.transferTags = Array.from(app.querySelectorAll('[name="transferTags"]'), (control) => control.value)
      .filter((tag) => new RegExp(`^- ${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(transfer));
    machine.remarks = sectionContent(content, '单机备注') || sectionContent(content, '备注');
    return machine;
  }

  function tableMachinesFromMarkdown(content, app) {
    const rows = content.split('\n').filter((line) => /^\|\s*#\d+\s*\|/.test(line));
    return rows.map((row, index) => {
      const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
      const machine = { currency: 'USD 美元', tradeDate: today(), transferTags: [] };
      const vendorModel = cells[1].split(/\s*·\s*|<br\s*\/?>/i).map((value) => value.trim());
      machine.vendor = vendorModel[0] || '';
      machine.model = vendorModel[1] || '';
      [machine.cpu, machine.memory, machine.disk] = (cells[2] || '').split('/').map((value) => value.trim());
      [machine.bandwidth, machine.traffic] = (cells[3] || '').split('/').map((value) => value.trim());
      const remainingTraffic = String(machine.traffic || '').match(/^(.*?)（剩余：(.+)）$/);
      if (remainingTraffic) {
        machine.traffic = remainingTraffic[1].trim();
        machine.remainingTraffic = remainingTraffic[2].trim();
      }
      const renewal = (cells[4] || '').match(/^(.+?)([\d.]+)\/(.+)$/);
      if (renewal) {
        machine.currency = currencyFromSymbol(renewal[1]);
        machine.renewalAmount = renewal[2];
        machine.renewalCycle = renewal[3];
      }
      machine.expiryDate = (cells[5] || '').split('/').pop().trim();
      const reports = cells[6] || '';
      machine.nqUrl = reports.match(/\[NQ\]\(([^)]+)\)/)?.[1] || '';
      machine.tqUrl = reports.match(/\[TQ\]\(([^)]+)\)/)?.[1] || '';
      machine.askingPrice = (cells[7] || '').match(/(?:总价|剩余价值)\s*¥([\d.]+)/)?.[1] || '';
      const reference = `#${index + 1} ${[machine.vendor, machine.model].filter(Boolean).join(' ')}`;
      const transfer = content.match(new RegExp(`^- ${escapeRegExp(reference)} 转让信息：[ \\t]*(.+)$`, 'm'))?.[1] || '';
      machine.transferTags = Array.from(app.querySelectorAll('[name="transferTags"]'), (control) => control.value)
        .filter((tag) => transfer.split('、').includes(tag));
      machine.remarks = content.match(new RegExp(`^- ${escapeRegExp(reference)} 单机备注：[ \\t]*(.+)$`, 'm'))?.[1] || '';
      return machine;
    }).filter(machineReady);
  }

  function restoreFromEditor(app) {
    const content = editorContent(app);
    const blocks = content.split(/^## #\d+ 鸡\s*$/m).slice(1)
      .map((block) => block.split(/^---\s*$/m)[0].trim()).filter(Boolean);
    const machines = blocks.length ? blocks.map((block) => textMachineFromMarkdown(block, app)).filter(machineReady) : tableMachinesFromMarkdown(content, app);
    if (machines.length) {
      app._nsitMachines = machines;
      app._nsitActiveMachine = 0;
      applyMachine(app, machines[0]);
      const setSharedValue = (name, value) => {
        const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
        if (control && value) control.value = value;
      };
      setSharedValue('tgContact', valueFromMarkdown(sectionContent(content, '联系方式'), 'TG 联系'));
      setSharedValue('postRemarks', sectionContent(content, '整贴备注'));
      const title = document.querySelector('#mde-title')?.value.trim();
      if (title) setSharedValue('postTitle', title);
      renderMachineTabs(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
      return true;
    }
    if (!/^## (基本信息|续费与价值|转让信息|测试报告|单机备注|整贴备注)$/m.test(content)) return false;
    const basic = sectionContent(content, '基本信息');
    const renewal = sectionContent(content, '续费与价值');
    const reports = sectionContent(content, '测试报告');
    const setValue = (name, value) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control && value) control.value = value;
    };
    [['vendor', '厂商'], ['model', '型号'], ['cpu', 'CPU'], ['memory', '内存'], ['disk', '硬盘'], ['bandwidth', '带宽']].forEach(([name, label]) => setValue(name, valueFromMarkdown(basic, label)));
    const traffic = valueFromMarkdown(basic, '流量');
    const remainingTraffic = traffic.match(/^(.*?)（剩余：(.+)）$/);
    setValue('traffic', (remainingTraffic?.[1] || traffic).trim());
    if (remainingTraffic) setValue('remainingTraffic', remainingTraffic[2].trim());
    [['renewalCycle', '续费周期'], ['expiryDate', '到期日期'], ['tradeDate', '交易日期'], ['nqUrl', 'NQ 地址'], ['tqUrl', 'TQ 地址'], ['tgContact', 'TG 联系']].forEach(([name, label]) => setValue(name, valueFromMarkdown(name === 'nqUrl' || name === 'tqUrl' || name === 'tgContact' ? reports : renewal, label)));
    const amount = valueFromMarkdown(renewal, '续费金额');
    const amountMatch = amount.match(/^(.+?)([\d.]+)（(.+?)）$/);
    if (amountMatch) { setValue('renewalAmount', amountMatch[2]); setValue('currency', amountMatch[3]); }
    const asking = valueFromMarkdown(renewal, '预出价格').match(/¥([\d.]+)/);
    if (asking) setValue('askingPrice', asking[1]);
    const transfer = sectionContent(content, '转让信息');
    app.querySelectorAll('[name="transferTags"]').forEach((control) => { control.checked = new RegExp(`^- ${control.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(transfer); });
    setValue('remarks', sectionContent(content, '单机备注') || sectionContent(content, '备注'));
    setValue('postRemarks', sectionContent(content, '整贴备注'));
    const title = document.querySelector('#mde-title')?.value.trim();
    if (title) setValue('postTitle', title);
    refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); refreshTitle(app); saveDraft(app);
    return true;
  }

  function setEditorContent(app, content) {
    const codeMirror = Array.from(document.querySelectorAll('.CodeMirror')).find((element) => !app.contains(element));
    if (codeMirror && codeMirror.CodeMirror && typeof codeMirror.CodeMirror.setValue === 'function') {
      codeMirror.CodeMirror.setValue(content);
      codeMirror.CodeMirror.focus();
      return true;
    }
    const textarea = Array.from(document.querySelectorAll('#mde-title ~ textarea, textarea')).find((element) => !app.contains(element));
    if (!textarea) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(textarea, content);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function selectTradeCategory() {
    const category = document.querySelector('#category');
    if (!category || category.value === 'trade') return;
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setter.call(category, 'trade');
    category.dispatchEvent(new Event('input', { bubbles: true }));
    category.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setStatus(app, message) {
    app.querySelector('.nsit-status').textContent = message;
  }

  function missingRequiredMachineField(machine) {
    return MACHINE_FIELDS.find((name) => !OPTIONAL_FIELDS.has(name) && !String(machine[name] || '').trim()) || '';
  }

  function hasSalePrice(machine) {
    return Number.isFinite(parsePrice(machine.askingPrice)) || Number.isFinite(parsePrice(machine.askingPremium));
  }

  function machineFieldLabel(name) {
    if (name === 'askingPrice') return '预出总价或预出溢价';
    return fields.find(([fieldName]) => fieldName === name)?.[1] || name;
  }

  function closeModal(app) {
    app.classList.remove('nsit-open');
    app.querySelector('.nsit-modal').setAttribute('aria-hidden', 'true');
  }

  function catalogApiUrl(path, params = null) {
    if (!MACHINE_CATALOG_API_URL) return '';
    const url = new URL(path, MACHINE_CATALOG_API_URL.replace(/\/$/, '') + '/');
    if (params) Object.entries(params).forEach(([name, value]) => {
      if (String(value || '').trim()) url.searchParams.set(name, value);
    });
    return url.toString();
  }

  async function catalogRequest(path, options = {}) {
    const url = catalogApiUrl(path);
    if (!url) throw new Error('共享配置服务尚未配置');
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || `请求失败（HTTP ${response.status}）`);
    return data;
  }

  function machineConfig(machine) {
    return Object.fromEntries(MACHINE_CATALOG_FIELDS.map((name) => [name, String(machine[name] || '').trim()]));
  }

  function machineConfigComplete(machine) {
    return MACHINE_CATALOG_FIELDS.every((name) => machine[name]);
  }

  function currentNodeSeekNickname() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const memberName = pageWindow.__config__?.user?.member_name;
    if (typeof memberName === 'string' && memberName.trim() && memberName.trim().length <= 64) return memberName.trim();
    const selectors = ['[data-user-nickname]', '[data-username]', '.navbar .username', '.user-menu .username', 'a[href^="/u/"]'];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const nickname = element?.dataset.userNickname || element?.dataset.username || element?.textContent?.trim();
      if (nickname && nickname.length <= 64) return nickname;
    }
    return '';
  }

  function renderCatalogResults(app, records) {
    const container = app.querySelector('[data-nsit-catalog-results]');
    if (!records.length) {
      container.innerHTML = '<p class="nsit-catalog-empty">没有找到匹配的共享配置。</p>';
      return;
    }
    container.innerHTML = records.map((record, index) => `<button type="button" class="nsit-catalog-result" data-catalog-result="${index}"><span><strong>${escapeHtml(record.vendor)} · ${escapeHtml(record.model)}</strong><br>${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)} · ${escapeHtml(record.bandwidth)} · ${escapeHtml(record.traffic)}</span><small>首次收录：${escapeHtml(record.submittedByNickname)}</small></button>`).join('');
    app._nsitCatalogResults = records;
  }

  function openMachineCatalog(app) {
    const values = formValues(app);
    const form = app.querySelector('[data-nsit-catalog-search]');
    form.elements.catalogVendor.value = values.vendor || '';
    form.elements.catalogModel.value = values.model || '';
    app.classList.add('nsit-catalog-open');
    app.querySelector('.nsit-catalog-modal').setAttribute('aria-hidden', 'false');
    form.elements.catalogVendor.focus();
  }

  function closeMachineCatalog(app) {
    app.classList.remove('nsit-catalog-open');
    app.querySelector('.nsit-catalog-modal').setAttribute('aria-hidden', 'true');
  }

  function closeRegisteredMachineConfigs(app) {
    app.classList.remove('nsit-registered-machine-configs-open');
    app.querySelector('.nsit-registered-machine-configs-modal').setAttribute('aria-hidden', 'true');
  }

  function renderRegisteredMachineConfigs(app, records) {
    const container = app.querySelector('[data-nsit-registered-machine-configs]');
    if (!records.length) {
      container.innerHTML = '<p class="nsit-catalog-empty">你还没有注册过机器配置。</p>';
      return;
    }
    container.innerHTML = records.map((record) => `<article class="nsit-registered-machine-config"><strong>${escapeHtml(record.vendor)} · ${escapeHtml(record.model)}</strong><span>${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)} · 流量 ${escapeHtml(record.traffic)} · 带宽 ${escapeHtml(record.bandwidth)}</span><small>${escapeHtml(currencyCode(record.currency) || record.currency)} ${escapeHtml(record.renewalAmount)} / ${escapeHtml(record.renewalCycle)} · 收录于 ${escapeHtml(String(record.createdAt || '').slice(0, 10))}</small></article>`).join('');
  }

  async function openRegisteredMachineConfigs(app) {
    const nickname = currentNodeSeekNickname();
    const container = app.querySelector('[data-nsit-registered-machine-configs]');
    app.classList.add('nsit-registered-machine-configs-open');
    app.querySelector('.nsit-registered-machine-configs-modal').setAttribute('aria-hidden', 'false');
    if (!nickname) {
      container.innerHTML = '<p class="nsit-catalog-empty">未能读取当前 NodeSeek 昵称，无法查询已注册配置。</p>';
      return;
    }
    container.innerHTML = '<p class="nsit-catalog-empty">正在查询 @' + escapeHtml(nickname) + ' 注册的配置…</p>';
    try {
      const response = await fetch(catalogApiUrl('v1/machine-configs/submitted', { nickname }));
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `查询失败（HTTP ${response.status}）`);
      renderRegisteredMachineConfigs(app, data.records || []);
    } catch (error) {
      container.innerHTML = `<p class="nsit-catalog-empty">${escapeHtml(error.message || '查询失败，请稍后重试。')}</p>`;
    }
  }

  function closeModelSuggestions(app) {
    const suggest = app.querySelector('.nsit-model-suggest');
    if (suggest) suggest.classList.remove('is-open');
  }

  function renderModelSuggestions(app, records) {
    const suggest = app.querySelector('.nsit-model-suggest');
    const menu = app.querySelector('[data-nsit-model-suggest-menu]');
    if (!suggest || !menu) return;
    if (!records.length) {
      menu.innerHTML = '<p class="nsit-model-suggest-empty">未匹配到配置，直接输入即可，期待您贡献此配置</p>';
    } else {
      menu.innerHTML = records.map((record, index) => `<button type="button" class="nsit-model-suggestion" data-nsit-model-suggestion="${index}"><strong>${escapeHtml(record.model)}</strong><small>@${escapeHtml(record.submittedByNickname)}</small><span class="nsit-model-suggestion-vendor">${escapeHtml(record.vendor)}</span><span class="nsit-model-suggestion-spec">${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)}</span><span class="nsit-model-suggestion-network">流量 ${escapeHtml(record.traffic)} · 带宽 ${escapeHtml(record.bandwidth)}</span><span class="nsit-model-suggestion-renewal">${escapeHtml(currencyCode(record.currency) || record.currency)} ${escapeHtml(record.renewalAmount)} / ${escapeHtml(record.renewalCycle)}</span></button>`).join('');
    }
    app._nsitModelSuggestions = records;
    suggest.classList.add('is-open');
  }

  function searchModelSuggestions(app) {
    const values = formValues(app);
    const vendor = String(values.vendor || '').trim();
    const model = String(values.model || '').trim();
    const signature = `${vendor}\u0000${model}`;
    clearTimeout(app._nsitModelSearchTimer);
    app._nsitModelSearchAbort?.abort();
    app._nsitModelSearchSignature = signature;
    if (!MACHINE_CATALOG_API_URL || !model) {
      closeModelSuggestions(app);
      return;
    }
    app._nsitModelSearchTimer = setTimeout(async () => {
      try {
        const cached = app._nsitModelSearchCache?.get(signature);
        if (cached?.expiresAt > Date.now()) {
          renderModelSuggestions(app, cached.records);
          return;
        }
        const controller = new AbortController();
        app._nsitModelSearchAbort = controller;
        const response = await fetch(catalogApiUrl('v1/machine-configs/search', { vendor, model }), { signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || `搜索失败（HTTP ${response.status}）`);
        if (app._nsitModelSearchSignature !== signature) return;
        const records = data.records || [];
        const cache = app._nsitModelSearchCache ||= new Map();
        cache.set(signature, { records, expiresAt: Date.now() + 1500 });
        if (cache.size > 20) cache.delete(cache.keys().next().value);
        renderModelSuggestions(app, records);
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (app._nsitModelSearchSignature !== signature) return;
        closeModelSuggestions(app);
      }
    }, 300);
  }

  function applyModelSuggestion(app, record) {
    MACHINE_CATALOG_FIELDS.forEach((name) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control) control.value = record[name] || '';
    });
    refreshVendorPicker(app.querySelector('.nsit-vendor-picker'));
    refreshTitle(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
    saveActiveMachine(app); renderMachineTabs(app);
    closeModelSuggestions(app);
    setStatus(app, '已回填共享配置。');
  }

  async function searchMachineCatalog(app) {
    const form = app.querySelector('[data-nsit-catalog-search]');
    const vendor = form.elements.catalogVendor.value.trim();
    const model = form.elements.catalogModel.value.trim();
    const container = app.querySelector('[data-nsit-catalog-results]');
    if (!vendor && !model) {
      container.innerHTML = '<p class="nsit-catalog-empty">请至少输入厂商或型号。</p>';
      return;
    }
    if (!MACHINE_CATALOG_API_URL) {
      container.innerHTML = '<p class="nsit-catalog-empty">共享配置服务尚未配置。</p>';
      return;
    }
    container.innerHTML = '<p class="nsit-catalog-empty">正在搜索…</p>';
    try {
      const url = catalogApiUrl('v1/machine-configs/search', { vendor, model });
      const response = await fetch(url);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `搜索失败（HTTP ${response.status}）`);
      renderCatalogResults(app, data.records || []);
    } catch (error) {
      container.innerHTML = `<p class="nsit-catalog-empty">${escapeHtml(error.message || '搜索失败，请稍后重试。')}</p>`;
    }
  }

  function applyCatalogRecord(app, record) {
    MACHINE_CATALOG_FIELDS.forEach((name) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control) control.value = record[name] || '';
    });
    refreshVendorPicker(app.querySelector('.nsit-vendor-picker'));
    refreshTitle(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
    saveActiveMachine(app); renderMachineTabs(app);
    closeMachineCatalog(app);
    setStatus(app, '已回填共享配置。');
  }

  async function syncMachineCatalog(machine) {
    if (!MACHINE_CATALOG_API_URL) return;
    const config = machineConfig(machine);
    if (MACHINE_CATALOG_FIELDS.some((name) => !config[name])) return;
    const submittedByNickname = currentNodeSeekNickname();
    if (!submittedByNickname) throw new Error('未能读取当前 NodeSeek 昵称，已跳过共享配置收录');
    const exactUrl = catalogApiUrl('v1/machine-configs/exact', config);
    const existingResponse = await fetch(exactUrl);
    const existing = await existingResponse.json().catch(() => null);
    if (!existingResponse.ok) throw new Error(existing?.error || `查询失败（HTTP ${existingResponse.status}）`);
    if (existing?.record) return { created: false, record: existing.record };
    const created = await catalogRequest('v1/machine-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, submittedByNickname }),
    });
    return { created: Boolean(created.created), record: created.record };
  }

  async function offerMissingMachineConfigs(app, machines) {
    if (!MACHINE_CATALOG_API_URL) return;
    const handled = new Set();
    for (const machine of machines) {
      const config = machineConfig(machine);
      const signature = JSON.stringify(config);
      if (!machineConfigComplete(config) || handled.has(signature)) continue;
      handled.add(signature);
      try {
        const response = await fetch(catalogApiUrl('v1/machine-configs/exact', config));
        const existing = await response.json().catch(() => null);
        if (!response.ok || existing?.record) continue;
        const outcome = await syncMachineCatalog(config);
        console.info('[NSIT] 共享配置上报结果', outcome?.created ? 'created' : 'exists');
      } catch (error) {
        console.warn('[NSIT] 共享配置检查或上报失败', error);
        setStatus(app, `配置上报失败：${error?.message || '请稍后重试'}`);
      }
    }
  }

  async function fillPost(app, mode = 'text') {
    try {
      saveActiveMachine(app);
      const incompleteIndex = app._nsitMachines.findIndex((machine) => machineReady(machine) && missingRequiredMachineField(machine));
      if (incompleteIndex !== -1) {
        const fieldName = missingRequiredMachineField(app._nsitMachines[incompleteIndex]);
        switchMachine(app, incompleteIndex);
        const invalidField = app.querySelector(`[name="${CSS.escape(fieldName)}"]`);
        invalidField?.focus();
        setStatus(app, `#${incompleteIndex + 1} 鸡请先填写必填项：${machineFieldLabel(fieldName)}`);
        return;
      }
      const trafficInvalidIndex = app._nsitMachines.findIndex((machine) => machineReady(machine) && remainingTrafficError(machine));
      if (trafficInvalidIndex !== -1) {
        switchMachine(app, trafficInvalidIndex);
        app.querySelector('[name="remainingTraffic"]')?.focus();
        setStatus(app, `#${trafficInvalidIndex + 1} 鸡：${remainingTrafficError(app._nsitMachines[trafficInvalidIndex])}`);
        return;
      }
      const priceMissingIndex = app._nsitMachines.findIndex((machine) => machineReady(machine) && !hasSalePrice(machine));
      if (priceMissingIndex !== -1) {
        switchMachine(app, priceMissingIndex);
        app.querySelector('[name="askingPrice"]')?.focus();
        setStatus(app, `#${priceMissingIndex + 1} 鸡请填写预出总价或预出溢价。`);
        return;
      }
      const shared = formValues(app);
      const machines = app._nsitMachines.filter(machineReady);
      if (!machines.length) {
        setStatus(app, '请至少填写一项内容。');
        return;
      }
      const generateCard = app.querySelector('[name="generateCard"]').checked;
      if (generateCard) setStatus(app, `正在生成并上传 ${machines.length} 张剩余价值卡片…`);
      const cards = generateCard ? await Promise.all(machines.map((machine) => uploadValueCard(machine, app, rateForValues(app, machine)))) : [];
      const content = mode === 'table' ? tableMarkdownForMachines(machines, app, cards, shared) : textMarkdownForMachines(machines, app, cards, shared);
      const titleField = document.querySelector('#mde-title');
      const title = machines.length > 1 ? multiMachineTitle(machines, app) : shared.postTitle.trim();
      if (title && titleField) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(titleField, title);
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const didFill = setEditorContent(app, content);
      if (didFill) selectTradeCategory();
      setStatus(app, didFill ? '已回填标题和 Markdown；请检查后手动发布。' : '未找到 NodeSeek 正文编辑器，请刷新页面后重试。');
      if (didFill) closeModal(app);
      if (didFill && app.querySelector('[name="checkMachineConfig"]').checked) offerMissingMachineConfigs(app, machines);
    } catch (error) {
      console.error('[NSIT]', '生成异常', error);
      setStatus(app, `生成失败：${error?.message || '未知错误'}`);
    }
  }

  function setPickerOpen(picker, open) {
    picker.classList.toggle('is-open', open);
    picker.querySelector('input').setAttribute('aria-expanded', String(open));
    picker.querySelector('.nsit-picker-toggle').setAttribute('aria-expanded', String(open));
    if (!open) picker.querySelectorAll('.is-active').forEach((option) => option.classList.remove('is-active'));
  }

  function refreshVendorPicker(picker) {
    if (!picker?.classList.contains('nsit-vendor-picker')) return;
    const value = picker.querySelector('input').value;
    picker.querySelector('[data-nsit-vendor-icon]').innerHTML = vendorIconMarkup(value);
  }

  function filterPicker(picker) {
    const query = picker.querySelector('input').value.trim().toLowerCase();
    picker.querySelectorAll('[data-nsit-picker-option]').forEach((option) => {
      option.hidden = Boolean(query) && !option.dataset.value.toLowerCase().includes(query);
    });
  }

  function showAllPickerOptions(picker) {
    picker.querySelectorAll('[data-nsit-picker-option]').forEach((option) => { option.hidden = false; });
  }

  function pickerOptions(picker) {
    return Array.from(picker.querySelectorAll('[data-nsit-picker-option]')).filter((option) => !option.hidden);
  }

  function choosePickerOption(picker, value) {
    const input = picker.querySelector('input');
    input.value = value;
    refreshVendorPicker(picker);
    picker.querySelectorAll('[data-nsit-picker-option]').forEach((option) => { option.hidden = false; });
    setPickerOpen(picker, false);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

function initialize() {
    const existingApps = document.querySelectorAll(`#${APP_ID}`);
    const currentApp = Array.from(existingApps).find((element) => element.dataset.nsitVersion === VERSION);
    if (currentApp) return;
    existingApps.forEach((element) => element.remove());
    const title = document.querySelector('#mde-title');
    const editor = document.querySelector('#editor-body, .CodeMirror');
    if (!title || !editor) return;
    const app = createApp();
    const hint = document.querySelector('#editor-body .window_header a[href*="runoob.com/markdown"]');
    if (hint?.parentElement) hint.parentElement.prepend(app);
    else title.before(app);
    restoreDraft(app);
    restoreCardToggle(app);
    syncPriceFields(app);
    initializeMachines(app);
    refreshTitle(app);
    refreshCard(app);
    refreshPricePreview(app);
    refreshRemainingTrafficValidity(app);
    loadRate(app);
    app.addEventListener('input', (event) => {
      if (event.target.matches('[data-nsit-traffic-used], [data-nsit-traffic-used-slider]')) {
        if (event.target.matches('[data-nsit-traffic-used]')) {
          const [integer, decimals = ''] = event.target.value.split('.');
          if (decimals.length > 2) event.target.value = `${integer}.${decimals.slice(0, 2)}`;
        }
        setTrafficUsage(app, event.target.value);
        saveDraft(app); saveActiveMachine(app); renderMachineTabs(app);
        return;
      }
      const picker = event.target.matches('[data-nsit-picker-input="true"]') ? event.target.closest('.nsit-picker') : null;
      if (picker) {
        app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
          if (item !== picker) setPickerOpen(item, false);
        });
        filterPicker(picker);
        setPickerOpen(picker, true);
        refreshVendorPicker(picker);
      }
      if (event.target.name === 'askingPrice' || event.target.name === 'askingPremium') syncPriceFields(app);
      if (event.target.name !== 'postTitle') refreshTitle(app);
      refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
      saveActiveMachine(app); renderMachineTabs(app);
      if (event.target.name === 'vendor' || event.target.name === 'model') searchModelSuggestions(app);
      if (event.target.name === 'currency') loadRate(app);
    });
    app.addEventListener('focusin', (event) => {
      if (event.target.matches('input[type="date"]') && typeof event.target.showPicker === 'function') {
        try { event.target.showPicker(); } catch (_) { /* 已由浏览器打开或当前环境不允许 */ }
      }
      const picker = event.target.matches('[data-nsit-picker-input="true"]') ? event.target.closest('.nsit-picker') : null;
      app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
        if (item !== picker) setPickerOpen(item, false);
      });
      if (picker) {
        showAllPickerOptions(picker);
        setPickerOpen(picker, true);
      }
    });
    app.addEventListener('click', (event) => {
      const date = event.target.matches('input[type="date"]') ? event.target : null;
      if (date && typeof date.showPicker === 'function') {
        try { date.showPicker(); } catch (_) { /* 已由浏览器打开或当前环境不允许 */ }
      }
    });
    app.addEventListener('change', (event) => {
      if (['renewalAmount', 'askingPrice', 'askingPremium'].includes(event.target.name)) {
        const amount = formatAmount(event.target.value);
        if (amount) event.target.value = amount;
      }
      if (event.target.matches('[name="generateCard"]')) {
        try { localStorage.setItem(CARD_TOGGLE_KEY, String(event.target.checked)); } catch (_) { /* 存储不可用时忽略 */ }
      }
      const tag = event.target.matches('[name="transferTags"]') ? event.target : null;
      if (tag?.checked && ['transfer', 'broker', 'push', 'payment'].includes(tag.dataset.tagGroup)) {
        app.querySelectorAll(`[name="transferTags"][data-tag-group="${tag.dataset.tagGroup}"]`).forEach((input) => {
          if (input !== tag) input.checked = false;
        });
      }
      refreshTitle(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
      saveActiveMachine(app); renderMachineTabs(app);
      if (event.target.name === 'currency') loadRate(app);
    });
    app.addEventListener('keydown', (event) => {
      const picker = event.target.matches('[data-nsit-picker-input="true"]') ? event.target.closest('.nsit-picker') : null;
      if (!picker) return;
      const options = pickerOptions(picker);
      const active = picker.querySelector('.is-active');
      const currentIndex = options.indexOf(active);
      if (event.key === 'Escape') {
        setPickerOpen(picker, false);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!picker.classList.contains('is-open')) setPickerOpen(picker, true);
        if (!options.length) return;
        const nextIndex = event.key === 'ArrowDown' ? Math.min(currentIndex + 1, options.length - 1) : Math.max(currentIndex - 1, 0);
        if (active) active.classList.remove('is-active');
        options[nextIndex].classList.add('is-active');
        options[nextIndex].scrollIntoView({ block: 'nearest' });
      }
      if (event.key.length === 1 && !picker.classList.contains('is-open')) {
        setPickerOpen(picker, true);
      }
      if (event.key === 'Enter' && picker.classList.contains('is-open')) {
        event.preventDefault();
        choosePickerOption(picker, active?.dataset.value || event.target.value);
      }
    });
    app.addEventListener('pointerdown', (event) => {
      const pickerInput = event.target.matches('[data-nsit-picker-input="true"]') ? event.target : null;
      if (pickerInput) {
        const picker = pickerInput.closest('.nsit-picker');
        app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
          if (item !== picker) setPickerOpen(item, false);
        });
        showAllPickerOptions(picker);
        setPickerOpen(picker, true);
        return;
      }
      const pickerOption = event.target.closest('.nsit-picker-menu [data-nsit-picker-option]');
      if (!pickerOption) return;
      event.preventDefault();
      event.stopPropagation();
      choosePickerOption(pickerOption.closest('.nsit-picker'), pickerOption.dataset.value);
    }, true);
    app.addEventListener('click', async (event) => {
      const pickerOption = event.target.closest('.nsit-picker-menu [data-nsit-picker-option]');
      if (pickerOption) {
        return;
      }
      const modelSuggestionIndex = event.target.closest('[data-nsit-model-suggestion]')?.dataset.nsitModelSuggestion;
      if (modelSuggestionIndex !== undefined) {
        const record = app._nsitModelSuggestions?.[Number(modelSuggestionIndex)];
        if (record) applyModelSuggestion(app, record);
        return;
      }
      const pickerInput = event.target.matches('[data-nsit-picker-input="true"]') ? event.target : null;
      if (pickerInput) {
        const picker = pickerInput.closest('.nsit-picker');
        if (!picker.classList.contains('is-open')) {
          app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
            if (item !== picker) setPickerOpen(item, false);
          });
          showAllPickerOptions(picker);
          setPickerOpen(picker, true);
        }
        return;
      }
      const pickerToggle = event.target.closest('.nsit-picker-toggle');
      if (pickerToggle) {
        const picker = pickerToggle.closest('.nsit-picker');
        app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
          if (item !== picker) setPickerOpen(item, false);
        });
        showAllPickerOptions(picker);
        setPickerOpen(picker, !picker.classList.contains('is-open'));
        picker.querySelector('input').focus();
        return;
      }
      const action = event.target.closest('button')?.dataset.action;
      const machineIndex = event.target.closest('[data-machine-index]')?.dataset.machineIndex;
      if (machineIndex !== undefined) {
        switchMachine(app, Number(machineIndex));
        return;
      }
      if (action === 'add-machine') {
        addMachine(app);
        return;
      }
      if (action === 'refresh-rate') {
        loadRate(app, true);
        return;
      }
      if (action === 'toggle-traffic-usage') {
        const popover = app.querySelector('[data-nsit-traffic-usage-popover]');
        if (!popover || event.target.closest('button').disabled) return;
        popover.hidden = !popover.hidden;
        if (!popover.hidden) app.querySelector('[data-nsit-traffic-used]')?.focus();
        return;
      }
      const trafficPreset = event.target.closest('[data-nsit-traffic-used-preset]')?.dataset.nsitTrafficUsedPreset;
      if (trafficPreset !== undefined) {
        setTrafficUsage(app, trafficPreset);
        saveDraft(app); saveActiveMachine(app); renderMachineTabs(app);
        return;
      }
      if (action === 'open-machine-catalog') {
        openMachineCatalog(app);
        return;
      }
      if (action === 'open-registered-machine-configs') {
        openRegisteredMachineConfigs(app);
        return;
      }
      if (action === 'close-machine-catalog') {
        closeMachineCatalog(app);
        return;
      }
      if (action === 'close-registered-machine-configs') {
        closeRegisteredMachineConfigs(app);
        return;
      }
      const catalogResultIndex = event.target.closest('[data-catalog-result]')?.dataset.catalogResult;
      if (catalogResultIndex !== undefined) {
        const record = app._nsitCatalogResults?.[Number(catalogResultIndex)];
        if (record) applyCatalogRecord(app, record);
        return;
      }
      if (action === 'close') {
        closeModal(app);
        return;
      }
      if (!action) return;
      if (action === 'fill' || action === 'fill-table') return;
      if (action === 'clear') {
        if (app._nsitMachines?.length > 1) {
          removeActiveMachine(app);
          saveDraft(app); refreshCard(app); refreshPricePreview(app); setStatus(app, '已删除当前单机。');
          return;
        }
        app.querySelector('form').reset();
        app.querySelector('[name="tradeDate"]').value = today();
        app.querySelector('[name="remainingTraffic"]').value = '';
        app._nsitMachines[app._nsitActiveMachine] = machineSnapshot(app);
        refreshTitle(app);
        localStorage.removeItem(STORAGE_KEY); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); setStatus(app, '已清空表单。'); return;
      }
    });
    app.querySelector('[data-action="fill"]').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      fillPost(app);
    });
    app.querySelector('[data-action="fill-table"]').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      fillPost(app, 'table');
    });
    app.querySelector('[data-nsit-catalog-search]').addEventListener('submit', (event) => {
      event.preventDefault();
      searchMachineCatalog(app);
    });
    app.querySelector('.nsit-trigger').addEventListener('click', () => {
      app.classList.add('nsit-open');
      app.querySelector('.nsit-modal').setAttribute('aria-hidden', 'false');
      restoreFromEditor(app);
      syncPriceFields(app);
      saveActiveMachine(app); renderMachineTabs(app);
      if (/!\[[^\]]*\]\(https:\/\/cdn\.nodeimage\.com\/i\//.test(editorContent(app))) app.querySelector('[name="generateCard"]').checked = true;
      app.querySelector('[name="postTitle"]').focus();
      getNodeImageApiKey(true).catch(() => {});
    });
    app.querySelector('.nsit-modal').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        closeModal(app);
      }
    });
    app.querySelector('.nsit-catalog-modal').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeMachineCatalog(app);
    });
    app.querySelector('.nsit-registered-machine-configs-modal').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeRegisteredMachineConfigs(app);
    });
    document.addEventListener('click', (event) => {
      if (!app.isConnected) return;
      app.querySelectorAll('.nsit-picker.is-open').forEach((picker) => {
        if (!picker.contains(event.target)) setPickerOpen(picker, false);
      });
      if (!app.querySelector('.nsit-model-suggest')?.contains(event.target)) closeModelSuggestions(app);
      if (!app.querySelector('.nsit-traffic-field')?.contains(event.target)) {
        const popover = app.querySelector('[data-nsit-traffic-usage-popover]');
        if (popover) popover.hidden = true;
      }
    });
  }

  window[RUNTIME_KEY]?.disconnect?.();
  const observer = new MutationObserver(initialize);
  window[RUNTIME_KEY] = observer;
  observer.observe(document.documentElement, { childList: true, subtree: true });
  initialize();
})();
