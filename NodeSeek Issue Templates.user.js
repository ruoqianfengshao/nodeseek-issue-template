// ==UserScript==
// @name         NodeSeek Issue Templates
// @namespace    https://www.nodeseek.com/
// @version      1.0.93
// @description  在 NodeSeek 发帖页用表单生成单机转让帖，并回填 Markdown 编辑器。
// @author       vico
// @match        https://www.nodeseek.com/new-discussion*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.nodeimage.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const APP_ID = 'nsit-app';
  const VERSION = '1.0.93';
  const NODEIMAGE_KEY = 'nsit-nodeimage-api-key';
  const RUNTIME_KEY = '__nodeSeekIssueTemplatesRuntime__';
  const STORAGE_KEY = 'nsit-single-server-draft-v1';
  const CARD_TOGGLE_KEY = 'nsit-generate-value-card';
  const RATE_CACHE_KEY = 'nsit-cny-rates-v1';
  const CURRENCY_CODES = { 'CNY 人民币': 'CNY', 'USD 美元': 'USD', 'EUR 欧元': 'EUR', 'GBP 英镑': 'GBP', 'JPY 日元': 'JPY', 'KRW 韩元': 'KRW', 'AUD 澳元': 'AUD', 'HKD 港元': 'HKD', 'TWD 新台币': 'TWD', 'CAD 加拿大元': 'CAD', 'SGD 新加坡元': 'SGD' };
  const CYCLE_MONTHS = { '月付': 1, '季付': 3, '半年付': 6, '年付': 12, '两年付': 24, '三年付': 36, '5 年付': 60 };
  const OPTIONS = {
    vendors: ['搬瓦工', 'DMIT', 'RackNerd', 'Vultr', 'CloudCone', 'BuyVM', 'Hetzner', 'Linode', 'DigitalOcean'],
    cpu: ['0.5C', '1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C'],
    memory: ['0.5G', '1G', '2G', '3G', '4G', '6G', '8G'],
    disk: ['1G', '2G', '4G', '5G', '10G', '20G', '50G', '100G'],
    bandwidth: ['10M', '20M', '30M', '40M', '50M', '100M', '200M', '500M', '1G'],
    traffic: ['150G', '200G', '300G', '400G', '500G', '1T', '2T', '4T'],
    renewalCycle: ['月付', '季付', '半年付', '年付', '两年付', '三年付', '5 年付'],
  };

  const fields = [
    ['postTitle', '帖子标题', 'text', '会根据填写内容自动生成，也可手动修改'],
    ['vendor', '厂商', 'list', '输入或选择厂商', 'vendors'],
    ['model', '型号', 'text', '例如：PVM.LAX.Pro'],
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
    ['askingPrice', '🟢 预出总价（人民币）', 'number', '例如：60'],
    ['askingPremium', '🔴 预出溢价（人民币）', 'number', '例如：20'],
    ['remarks', '备注', 'textarea', '补充说明、联系方式等'],
  ];
  const OPTIONAL_FIELDS = new Set(['nqUrl', 'tqUrl', 'tgContact', 'remarks', 'askingPrice', 'askingPremium']);

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

  function inputMarkup(field, formId = '') {
    const [name, label, type, placeholder = '', options = []] = field;
    const safeName = escapeHtml(name);
    const form = formId ? ` form="${escapeHtml(formId)}"` : '';
    const hint = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : '';
    const required = OPTIONAL_FIELDS.has(name) ? '' : ' required';
    if (type === 'textarea') {
      return `<label class="nsit-field nsit-field-wide nsit-field--${safeName}"><span>${label}</span><textarea name="${safeName}"${form}${hint}${required} rows="3"></textarea></label>`;
    }
    if (type === 'select') {
      const values = options.map((value) => {
        const selected = (name === 'realName' && value === '否') || (name === 'currency' && value === 'USD 美元');
        return `<option value="${escapeHtml(value)}"${selected ? ' selected' : ''}>${escapeHtml(value)}</option>`;
      }).join('');
      return `<label class="nsit-field nsit-field--${safeName}"><span>${label}</span><select name="${safeName}"${form}${required}>${values}</select></label>`;
    }
    if (type === 'list') {
      const values = OPTIONS[options].map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${escapeHtml(value)}</span>`).join('');
      return `<label class="nsit-field nsit-field--${safeName}"><span>${label}</span><span class="nsit-picker" data-picker-name="${safeName}"><input name="${safeName}"${form}${hint}${required} data-nsit-picker-input="true" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择${label}" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${values}</span></span></label>`;
    }
    const value = name === 'tradeDate' ? ` value="${today()}"` : '';
    const min = type === 'number' ? ' min="0" step="0.01"' : '';
    const wide = name === 'postTitle' ? ' nsit-field-wide' : '';
    return `<label class="nsit-field${wide} nsit-field--${safeName}"><span>${label}</span><input name="${safeName}"${form} type="${type}"${value}${min}${hint}${required}></label>`;
  }

  function section(title, names, description = '', className = '') {
    const byName = new Map(fields.map((field) => [field[0], field]));
    return `<section class="nsit-section ${className}">${title ? `<h3>${title}</h3>` : ''}${description ? `<p>${description}</p>` : ''}<div class="nsit-grid">${names.map((name) => inputMarkup(byName.get(name))).join('')}</div></section>`;
  }

  function transferTagsMarkup() {
    const groups = [
      ['transfer', ['原邮出', '改邮出']],
      ['identity', ['实名']],
      ['brokerWalk', ['走中介']],
      ['broker', ['包中介', '不包中介']],
      ['push', ['包 push', '不包 push']],
      ['payment', ['先机后款', '先款后机']],
      ['extras', ['支付宝口令红包', '可小刀', '无 PP 争议']],
    ];
    return `<section class="nsit-section nsit-transfer-tags"><div class="nsit-tag-list">${groups.flatMap(([group, labels]) => labels.map((label) => `<label class="nsit-tag nsit-tag--${group}"><input type="checkbox" name="transferTags" value="${label}" data-tag-group="${group}"><span>${label}</span></label>`)).join('')}</div></section>`;
  }

  function reportsAndRemarksMarkup() {
    const byName = new Map(fields.map((field) => [field[0], field]));
    return `<section class="nsit-section nsit-report-remarks"><div class="nsit-report-fields">${['nqUrl', 'tqUrl', 'tgContact'].map((name) => inputMarkup(byName.get(name), 'nsit-form')).join('')}</div>${inputMarkup(byName.get('remarks'), 'nsit-form')}</section>`;
  }

  function valueCardMarkup() {
    const fieldsByName = new Map(fields.map((field) => [field[0], field]));
    const control = (name) => inputMarkup(fieldsByName.get(name), 'nsit-form');
    const currencies = fieldsByName.get('currency')[4].map((value) => `<option value="${escapeHtml(value)}"${value === 'USD 美元' ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('');
    const amountControl = `<label class="nsit-field nsit-field--renewalAmount"><span>续费金额</span><span class="nsit-amount-input"><select name="currency" form="nsit-form" required aria-label="币种">${currencies}</select><input name="renewalAmount" form="nsit-form" type="number" min="0" step="0.01" placeholder="0.00" required></span></label>`;
    return `<div class="nsit-value-card"><div class="nsit-value-inputs nsit-value-row-one">${['renewalCycle', 'expiryDate', 'tradeDate'].map(control).join('')}</div><div class="nsit-value-inputs nsit-value-row-two">${amountControl}${control('askingPremium')}${control('askingPrice')}</div><div class="nsit-value-heading"><span>💵 剩余价值<span class="nsit-title-formula">＝金额 × 剩余天数 ÷ 周期天数</span></span><span class="nsit-value-stats"><strong data-days>剩余 — 天</strong><strong data-percent>周期占比 —</strong><i class="nsit-title-progress"><i data-progress></i></i></span></div><div class="nsit-value-result"><div><div class="nsit-value" data-nsit-value-output><small>¥</small>0.00</div><span class="nsit-rate-value"><span>💱 实时汇率：</span><strong data-nsit-rate>选择币种后加载</strong><button type="button" data-action="refresh-rate" title="刷新今日汇率">↻</button></span></div><div class="nsit-price-preview" data-nsit-price-preview>填写预出价格后显示价格预览</div></div></div>`;
  }

  function createApp() {
    const app = document.createElement('aside');
    app.id = APP_ID;
    app.dataset.nsitVersion = VERSION;
    app.innerHTML = `
      <style>
        #${APP_ID}{--nsit-accent:#d9961c;--nsit-ink:#27334a;--nsit-muted:#718096;--nsit-line:#e5eaf1;display:contents;box-sizing:border-box;margin:0;color:var(--nsit-ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        #${APP_ID} *{box-sizing:border-box}#${APP_ID} .nsit-shell{background:#fff;border:1px solid var(--nsit-line);border-radius:12px;box-shadow:0 8px 24px rgba(29,40,65,.06);overflow:hidden}
        #${APP_ID} .nsit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--nsit-line);background:linear-gradient(110deg,#f9fbff,#fff8ea);flex:none}
        #${APP_ID} h2,#${APP_ID} h3{margin:0}#${APP_ID} h2{font-size:16px}#${APP_ID} h3{font-size:14px}#${APP_ID} .nsit-head small,#${APP_ID} p{color:var(--nsit-muted)}#${APP_ID} .nsit-head small{font-size:14px}
        #${APP_ID} .nsit-body{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.85fr);flex:1;min-height:0;overflow:auto}#${APP_ID} .nsit-form{padding:4px 18px 18px}#${APP_ID} .nsit-side{padding:4px 18px 18px;border-left:1px solid var(--nsit-line);background:#fbfcfe}
        #${APP_ID} .nsit-section{padding:14px 0;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-section:last-child{border:0}#${APP_ID} .nsit-section p{margin:3px 0 10px;font-size:14px}#${APP_ID} .nsit-basic .nsit-grid{grid-template-columns:repeat(10,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model{grid-column:span 5}#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic{grid-column:span 2}#${APP_ID} .nsit-title-divider{height:1px;margin:16px 0 0;background:var(--nsit-line)}#${APP_ID} .nsit-post-title{margin-top:0}
        #${APP_ID} .nsit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}#${APP_ID} .nsit-field{display:grid;gap:5px;min-width:0}#${APP_ID} .nsit-field span{font-size:14px;color:#506078}.nsit-field-wide{grid-column:1/-1}
        #${APP_ID} input,#${APP_ID} select,#${APP_ID} textarea{width:100%;min-width:0;border:1px solid #d8e0eb;border-radius:7px;background:#fff;color:var(--nsit-ink);padding:8px 9px;font:inherit;outline:none}#${APP_ID} textarea{resize:vertical}#${APP_ID} input:focus,#${APP_ID} select:focus,#${APP_ID} textarea:focus{border-color:var(--nsit-accent);box-shadow:0 0 0 3px rgba(217,150,28,.14)}#${APP_ID} .nsit-picker{position:relative;z-index:0;display:block;isolation:isolate}#${APP_ID} .nsit-picker input{padding-right:35px}#${APP_ID} .nsit-picker-toggle{position:absolute;z-index:1;top:50%;right:8px;display:grid;place-items:center;width:20px;height:20px;margin:0;padding:0;transform:translateY(-50%);border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#52627c}#${APP_ID} .nsit-picker-toggle i{display:block;width:0;height:0;border:6px solid transparent;border-top-color:currentColor;border-bottom:0}#${APP_ID} .nsit-picker-toggle:hover{color:#27334a}#${APP_ID} .nsit-picker-menu{display:none;position:absolute;z-index:20;top:calc(100% + 5px);left:0;width:100%;max-height:180px;overflow:auto;border:1px solid #d8e0eb;border-radius:8px;background:#fff;box-shadow:0 8px 18px rgba(31,44,67,.18);padding:5px}#${APP_ID} .nsit-picker.is-open{z-index:30}#${APP_ID} .nsit-picker.is-open .nsit-picker-menu{display:grid;gap:2px}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:block;width:100%;margin:0;border:0;border-radius:5px;background:transparent;padding:7px 9px;text-align:left;color:#33425a;font:inherit;cursor:pointer}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]:hover,#${APP_ID} .nsit-picker-menu [data-nsit-picker-option].is-active{background:#fff3da;color:#885700}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option][hidden]{display:none}#${APP_ID} .nsit-asking-price{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px}#${APP_ID} .nsit-asking-price .nsit-field{min-width:0}#${APP_ID} .nsit-price-preview{min-height:37px;border:1px solid #f0d49c;border-radius:7px;background:#fff8e9;padding:8px 10px;color:#8b641e;font-size:14px;line-height:19px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{display:grid;grid-template-columns:1fr 1fr;gap:12px}#${APP_ID} .nsit-report-remarks .nsit-field{min-width:0}#${APP_ID} .nsit-report-remarks .nsit-field-wide{grid-column:auto}#${APP_ID} .nsit-report-fields{display:grid;gap:10px}#${APP_ID} .nsit-tag-list{display:flex;flex-wrap:wrap;gap:8px}#${APP_ID} .nsit-tag{position:relative;cursor:pointer}#${APP_ID} .nsit-tag input{position:absolute;opacity:0;pointer-events:none}#${APP_ID} .nsit-tag span{display:block;border:1px solid #d8e0eb;border-radius:999px;background:#fff;padding:6px 11px;color:#506078;font-size:14px;transition:.15s}#${APP_ID} .nsit-tag--transfer input:checked + span{border-color:#a9c6f5;background:#f2f7ff;color:#316ab7}#${APP_ID} .nsit-tag--identity input:checked + span{border-color:#cbb7ee;background:#f8f3ff;color:#7452ae}#${APP_ID} .nsit-tag--brokerWalk input:checked + span,#${APP_ID} .nsit-tag--broker input:checked + span{border-color:#83d1bf;background:#f0fbf7;color:#187961}#${APP_ID} .nsit-tag--push input:checked + span{border-color:#f2bd91;background:#fff6ee;color:#b35c20}#${APP_ID} .nsit-tag--payment input:checked + span{border-color:#e7ba74;background:#fff9ec;color:#996009}#${APP_ID} .nsit-tag--extras input:checked + span{border-color:#ea9db4;background:#fff3f6;color:#ad3c61}#${APP_ID} .nsit-tag input:checked + span{box-shadow:inset 0 0 0 1px currentColor;font-weight:650;filter:saturate(1.25)}#${APP_ID} .nsit-tag:hover span{transform:translateY(-1px)}
        #${APP_ID} .nsit-value-card{margin:14px 0;border:1px solid #f0cf8a;border-radius:12px;background:linear-gradient(145deg,#fff,#fff8e9);padding:14px}#${APP_ID} .nsit-value-inputs{display:grid;gap:8px;margin-bottom:8px}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-value-row-two{padding-bottom:8px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-inputs .nsit-field{gap:3px}#${APP_ID} .nsit-value-inputs .nsit-field span{font-size:14px;color:#506078}#${APP_ID} .nsit-value-inputs .nsit-field--askingPrice > span{color:#27834a}#${APP_ID} .nsit-value-inputs .nsit-field--askingPremium > span{color:#c04444}#${APP_ID} .nsit-value-inputs input,#${APP_ID} .nsit-value-inputs select{padding:6px 7px;font-size:14px}#${APP_ID} .nsit-amount-input{display:flex;min-width:0}#${APP_ID} .nsit-amount-input select{width:112px;flex:none;border-radius:7px 0 0 7px}#${APP_ID} .nsit-amount-input input{margin-left:-1px;border-radius:0 7px 7px 0}#${APP_ID} .nsit-value-inputs .nsit-picker input{padding-right:30px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle{right:5px;width:18px;height:18px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle i{border-width:5px}#${APP_ID} .nsit-rate-row{display:grid;align-self:stretch;gap:3px;margin:0;padding:0;color:#506078;font-size:14px}#${APP_ID} .nsit-rate-value{display:flex;align-items:center;min-width:0;height:32px;gap:4px;white-space:nowrap}#${APP_ID} .nsit-rate-row strong{min-width:0;overflow:hidden;color:#2c8a4e;font-weight:650;text-overflow:ellipsis}#${APP_ID} .nsit-rate-row button{flex:none;width:18px;height:18px;margin:0;padding:0;border:0;background:transparent;color:#2c8a4e;font-size:15px;line-height:1}#${APP_ID} .nsit-rate-row button:hover{background:#eaf7ed;color:#176c37}#${APP_ID} .nsit-value-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;color:#8b6a2b;font-weight:600}#${APP_ID} .nsit-value-stats{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-width:0;white-space:nowrap}#${APP_ID} .nsit-value-heading strong{color:#8b641e;font-size:14px}#${APP_ID} .nsit-title-progress{display:block;width:62px;height:6px;overflow:hidden;border-radius:999px;background:#def0e3}.nsit-title-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6fbc82,#239652);transition:width .15s ease}#${APP_ID} .nsit-title-formula{margin-left:6px;color:var(--nsit-muted);font-size:14px;font-weight:400;white-space:nowrap}#${APP_ID} .nsit-value-result{display:flex;align-items:flex-start;gap:12px;min-height:54px;margin-top:12px}#${APP_ID} .nsit-value{flex:none;margin:0;color:var(--nsit-accent);font-size:34px;font-weight:750;letter-spacing:-1px;line-height:1;word-break:break-all}#${APP_ID} .nsit-value small{margin-right:4px;font-size:15px;font-weight:inherit}#${APP_ID} .nsit-value-result .nsit-rate-value{height:auto;margin-top:5px;color:#2c8a4e;font-size:13px;line-height:1.2}#${APP_ID} .nsit-value-result .nsit-rate-value strong{color:inherit;font-weight:650}#${APP_ID} .nsit-value-result .nsit-rate-value button{width:auto;height:auto;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;font-size:16px;line-height:1;cursor:pointer}#${APP_ID} .nsit-value-result .nsit-rate-value button:hover{border:0;background:transparent;color:#176c37}#${APP_ID} .nsit-value-result .nsit-price-preview{display:flex;flex:1;align-items:flex-end;justify-content:flex-end;gap:8px;align-self:flex-start;min-width:0;padding:0;border:0;background:transparent;color:#718096;font-size:18px;font-weight:650;line-height:1.3;text-align:right;white-space:normal}#${APP_ID} .nsit-price-preview span{min-width:0}#${APP_ID} .nsit-price-preview b{display:inline-block;flex:none;font-size:34px;letter-spacing:-1px;line-height:1;white-space:nowrap}#${APP_ID} .nsit-price-preview[data-price-state="fair"]{color:#27834a}#${APP_ID} .nsit-price-preview[data-price-state="premium"]{color:#c04444}
        #${APP_ID} .nsit-formula{margin:0;font-size:14px;color:var(--nsit-muted)}#${APP_ID} .nsit-action-dock{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:12px 18px;border-top:1px solid var(--nsit-line);background:#fff;box-shadow:0 -8px 18px rgba(29,40,65,.05)}#${APP_ID} .nsit-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}#${APP_ID} .nsit-card-toggle{display:flex;align-items:center;gap:6px;color:#506078;cursor:pointer;white-space:nowrap}#${APP_ID} .nsit-card-toggle input{width:15px;height:15px;margin:0;accent-color:var(--nsit-accent)}#${APP_ID} button{border:1px solid #d8e0eb;border-radius:7px;background:#fff;color:#40506a;padding:8px 11px;font:inherit;cursor:pointer}#${APP_ID} button:hover{border-color:var(--nsit-accent);color:#8b5c00}#${APP_ID} button.nsit-primary{background:#d9961c;border-color:#d9961c;color:#fff}#${APP_ID} .nsit-status{position:absolute;right:18px;bottom:100%;max-width:calc(100% - 36px);margin:0 0 7px;padding:4px 7px;border-radius:5px;background:rgba(39,51,74,.88);color:#fff;font-size:14px;opacity:0;pointer-events:none;transition:opacity .15s}.nsit-status:not(:empty){opacity:1}
        #${APP_ID} .nsit-trigger{display:inline;margin:0 7px 0 0;padding:3px 8px;border:1px solid #d9961c;border-radius:5px;background:#fff8ea;color:#875800;font:600 13px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;vertical-align:baseline}#${APP_ID} .nsit-trigger:hover{border-color:#b87500;background:#d9961c;color:#fff}#${APP_ID} .nsit-modal{display:none;position:fixed;z-index:2147483647;inset:0;overflow:auto;padding:28px 16px;background:rgba(20,29,45,.46)}#${APP_ID}.nsit-open .nsit-modal{display:grid;place-items:center}#${APP_ID} .nsit-modal .nsit-shell{display:flex;flex-direction:column;width:min(980px,100%);max-height:calc(100vh - 56px);margin:auto;box-shadow:0 20px 60px rgba(0,0,0,.24)}#${APP_ID} .nsit-close{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;font-size:25px;line-height:1;color:#62708a}#${APP_ID} .nsit-close:hover{background:#f0f3f8;color:#27334a}#${APP_ID} .nsit-head>div{min-width:0}#${APP_ID} .nsit-head>div:last-child{display:flex;align-items:center;gap:8px;white-space:nowrap}
        #${APP_ID} .nsit-report-remarks{grid-template-columns:1fr}@media(max-width:820px){#${APP_ID} .nsit-body{display:block}#${APP_ID} .nsit-side{border-left:0;border-top:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-card{position:static}}@media(max-width:520px){#${APP_ID} .nsit-grid,#${APP_ID} .nsit-basic .nsit-grid,#${APP_ID} .nsit-report-remarks,#${APP_ID} .nsit-asking-price{grid-template-columns:1fr}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model,#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic{grid-column:auto}#${APP_ID} .nsit-modal{padding:8px}#${APP_ID} .nsit-head small{display:none}}
      </style>
      <button type="button" class="nsit-trigger" aria-haspopup="dialog">🐔 单机出售</button>
      <div class="nsit-modal" aria-hidden="true">
      <div class="nsit-shell" role="dialog" aria-modal="true" aria-label="单机转让帖模板">
        <header class="nsit-head"><h2>出鸡</h2><div><small>不会自动发布</small><button type="button" class="nsit-close" data-action="close" aria-label="关闭表单" title="关闭">×</button></div></header>
        <div class="nsit-body">
          <form id="nsit-form" class="nsit-form" novalidate>
            ${section('', ['vendor', 'model', 'cpu', 'memory', 'disk', 'bandwidth', 'traffic'], '', 'nsit-basic')}
            ${valueCardMarkup()}
            <div class="nsit-title-divider" aria-hidden="true"></div>
            ${section('', ['postTitle'], '', 'nsit-post-title')}
          </form>
          <aside class="nsit-side">${reportsAndRemarksMarkup()}${transferTagsMarkup()}</aside>
        </div>
        <div class="nsit-action-dock"><label class="nsit-card-toggle"><input type="checkbox" name="generateCard" checked>生成剩余价值图片</label><div class="nsit-actions"><button type="button" class="nsit-primary" data-action="fill">生成文本模式</button><button type="button" data-action="fill-table">生成表格模式</button><button type="button" data-action="clear">清空表单</button></div><div class="nsit-status" role="status"></div></div>
      </div>
      </div>`;
    return app;
  }

  function formValues(app) {
    const form = app.querySelector('form');
    const values = Object.fromEntries(new FormData(form).entries());
    values.transferTags = Array.from(app.querySelectorAll('[name="transferTags"]:checked'), (input) => input.value);
    return values;
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
    const output = app.querySelector('[data-nsit-value-output]');
    const days = app.querySelector('[data-days]');
    const percent = app.querySelector('[data-percent]');
    const progress = app.querySelector('[data-progress]');
    if (!result) {
      output.innerHTML = '<small>¥</small>0.00';
      days.textContent = '剩余 — 天'; percent.textContent = '周期占比 —'; progress.style.width = '0%';
      return;
    }
    const rate = activeRate(app);
    output.innerHTML = rate ? `<small>¥</small>${(result.value * rate.rate).toFixed(2)}` : '<small>¥</small>—';
    days.textContent = `剩余 ${result.daysLeft} 天`; percent.textContent = `周期占比 ${result.percentage.toFixed(1)}%`; progress.style.width = `${result.percentage}%`;
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

  function refreshPricePreview(app) {
    const values = formValues(app);
    const preview = app.querySelector('[data-nsit-price-preview]');
    const premium = parsePrice(values.askingPremium);
    const askingPrice = effectiveAskingPrice(values, activeRate(app));
    const result = calculation(values);
    const rate = activeRate(app);
    const symbol = '¥';
    if (!Number.isFinite(askingPrice) || askingPrice < 0) {
      preview.dataset.priceState = 'neutral';
      preview.textContent = '填写预出价格或预出溢价后显示价格预览';
      return;
    }
    const remainingCny = result && rate ? result.value * rate.rate : null;
    if (Number.isFinite(premium)) {
      preview.dataset.priceState = 'premium';
      if (!Number.isFinite(remainingCny) || remainingCny === 0) {
        preview.innerHTML = `<b>溢价 ${formatPrice(premium, symbol)}</b>`;
      } else {
        preview.innerHTML = `<span>${formatPrice(premium, symbol)} + ${formatPrice(remainingCny, symbol)} =</span><b>总价 ${formatPrice(askingPrice, symbol)}</b>`;
      }
      return;
    }
    if (!Number.isFinite(remainingCny) || remainingCny === 0) {
      preview.dataset.priceState = 'premium';
      preview.innerHTML = `<span>溢价</span><b>${formatPrice(askingPrice, symbol)}</b>`;
      return;
    }
    if (askingPrice > remainingCny) {
      preview.dataset.priceState = 'premium';
      preview.innerHTML = `<span>${formatPrice(askingPrice, symbol)} − ${formatPrice(remainingCny, symbol)} =</span><b>溢价 ${formatPrice(askingPrice - remainingCny, symbol)}</b>`;
      return;
    }
    if (askingPrice === remainingCny) {
      preview.dataset.priceState = 'fair';
      preview.innerHTML = '<b>剩余价值出</b>';
      return;
    }
    preview.dataset.priceState = 'fair';
    preview.innerHTML = `<span>${formatPrice(askingPrice, symbol)} ÷ ${formatPrice(remainingCny, symbol)} =</span><b>${(askingPrice / remainingCny * 10).toFixed(1)} 折</b>`;
  }

  function drawCardText(context, text, x, y, maxWidth) {
    const words = String(text || '').split('');
    let line = '';
    let currentY = y;
    words.forEach((word) => {
      const next = line + word;
      if (context.measureText(next).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        currentY += 34;
        line = word;
      } else {
        line = next;
      }
    });
    if (line) context.fillText(line, x, currentY);
    return currentY;
  }

  function createValueCard(values, app) {
    const result = calculation(values);
    const rate = activeRate(app);
    if (!result || !rate) throw new Error('请先填写有效的续费信息并等待汇率加载完成');
    const askingPrice = effectiveAskingPrice(values, rate);
    const cny = result.value * rate.rate;
    const canvas = document.createElement('canvas');
    const cardWidth = 1200;
    const cardHeight = 260;
    const cardScale = 640 / cardWidth;
    canvas.width = 640; canvas.height = Math.round(cardHeight * cardScale);
    const context = canvas.getContext('2d');
    context.scale(cardScale, cardScale);
    const radius = 22;
    context.beginPath();
    context.roundRect(2, 2, cardWidth - 4, cardHeight - 4, radius);
    context.fillStyle = '#fffdf8'; context.fill();
    context.strokeStyle = '#f0cf8a'; context.lineWidth = 3; context.stroke();
    context.fillStyle = '#8b641e'; context.font = '600 27px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.fillText('💵 剩余价值', 38, 58);
    context.fillStyle = '#718096'; context.font = '24px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.fillText('＝金额 × 剩余天数 ÷ 周期天数', 196, 58);
    context.fillStyle = '#8b641e'; context.font = '600 26px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.fillText(`剩余 ${result.daysLeft} 天   周期占比 ${result.percentage.toFixed(1)}%`, 716, 58);
    context.fillStyle = '#def0e3'; context.beginPath(); context.roundRect(1054, 42, 108, 13, 7); context.fill();
    context.fillStyle = '#239652'; context.beginPath(); context.roundRect(1054, 42, Math.max(0, 108 * result.percentage / 100), 13, 7); context.fill();
    context.fillStyle = '#d9961c'; context.font = '700 68px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.fillText(`¥${cny.toFixed(2)}`, 38, 175);
    let previewLeft = '填写预出价格后显示价格预览';
    let previewRight = '';
    let previewColor = '#718096';
    if (Number.isFinite(askingPrice) && askingPrice >= 0) {
      if (cny === 0) { previewLeft = ''; previewRight = `溢价 ¥${askingPrice.toFixed(2)}`; previewColor = '#c04444'; }
      else if (askingPrice > cny) { previewLeft = `¥${askingPrice.toFixed(2)} − ¥${cny.toFixed(2)} =`; previewRight = `溢价 ¥${(askingPrice - cny).toFixed(2)}`; previewColor = '#c04444'; }
      else if (askingPrice === cny) { previewLeft = ''; previewRight = '剩余价值出'; previewColor = '#27834a'; }
      else { previewLeft = `¥${askingPrice.toFixed(2)} ÷ ¥${cny.toFixed(2)} =`; previewRight = `${(askingPrice / cny * 10).toFixed(1)} 折`; previewColor = '#27834a'; }
    }
    context.fillStyle = previewColor;
    context.font = '700 68px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.textAlign = 'right'; context.fillText(previewRight, 1162, 175);
    const rightWidth = context.measureText(previewRight).width;
    context.font = '600 35px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    context.fillText(previewLeft, 1144 - rightWidth, 175); context.textAlign = 'left';
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

  async function uploadValueCard(values, app) {
    const blob = await createValueCard(values, app);
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
    const total = `总价 ¥${askingPrice}`;
    if (Number.isFinite(premium)) return Number.isFinite(remainingCny) && remainingCny !== 0 ? `${total} · 溢价 ¥${premium.toFixed(2)}` : `溢价 ¥${premium.toFixed(2)}`;
    if (!Number.isFinite(remainingCny) || remainingCny === 0) return `${total} · 溢价 ¥${askingPrice}`;
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

  function refreshTitle(app) {
    if (app.dataset.titleEdited === 'true') return;
    const title = app.querySelector('[name="postTitle"]');
    const suggestion = suggestedTitle(formValues(app), activeRate(app));
    if (suggestion) title.value = suggestion;
  }

  function markdown(values, cardMarkdown = '', rate = null) {
    const result = calculation(values);
    const pair = (label, value) => value ? `- ${label}：${value}` : '';
    const basic = [[values.vendor, values.model].filter(Boolean).join(' ') ? `- 厂商&型号：${[values.vendor, values.model].filter(Boolean).join(' ')}` : '', [['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', values.traffic]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，') ? `- 配置：${[['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', values.traffic]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，')}` : ''].filter(Boolean);
    const renewal = [pair('续费周期', values.renewalCycle), values.renewalAmount ? `- 续费金额：${currencySymbol(values.currency)}${values.renewalAmount}（${values.currency}）` : '', pair('到期日期', values.expiryDate), pair('交易日期', values.tradeDate)].filter(Boolean);
    if (result) renewal.push(`- 剩余价值：${currencySymbol(values.currency)}${result.value.toFixed(2)}（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`);
    const askingPrice = effectiveAskingPrice(values, rate);
    if (Number.isFinite(askingPrice)) renewal.push(`- 预出价格：¥${askingPrice.toFixed(2)}（人民币）`);
    if (cardMarkdown) renewal.push(cardMarkdown);
    const transfer = values.transferTags.map((tag) => `- ${tag}`);
    const reports = [pair('NQ 地址', values.nqUrl), pair('TQ 地址', values.tqUrl), pair('TG 联系', values.tgContact)].filter(Boolean);
    const parts = [];
    if (basic.length) parts.push(`## 基本信息\n${basic.join('\n')}`);
    if (renewal.length) parts.push(`## 续费与价值\n${renewal.join('\n')}`);
    if (transfer.length) parts.push(`## 转让信息\n${transfer.join('\n')}`);
    if (reports.length) parts.push(`## 测试报告\n${reports.join('\n')}`);
    const remarks = String(values.remarks || '').trim();
    if (remarks) parts.push(`## 备注\n${remarks}`);
    return parts.join('\n\n');
  }

  function tableMarkdown(values, app, cardMarkdown) {
    const result = calculation(values);
    const rate = activeRate(app);
    const remaining = result && rate ? `¥${(result.value * rate.rate).toFixed(2)}` : '—';
    const vendorModel = [values.vendor, values.model].filter(Boolean).join(' ');
    const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
    const network = [values.bandwidth, values.traffic].filter(Boolean).join('/');
    const renewal = [values.renewalAmount ? `${currencySymbol(values.currency)}${values.renewalAmount}` : '', values.renewalCycle].filter(Boolean).join('/');
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
    const other = [values.transferTags.length ? `- 转让信息：${values.transferTags.join('、')}` : '', values.tgContact ? `- TG 联系：${values.tgContact}` : '', String(values.remarks || '').trim() ? `- 备注：${String(values.remarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cardMarkdown ? `## 剩余价值\n${cardMarkdown}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function saveDraft(app) {
    const values = formValues(app);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...values, _titleEdited: app.dataset.titleEdited === 'true' }));
  }

  function restoreDraft(app) {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.entries(draft).forEach(([name, value]) => {
        if (name === '_titleEdited') {
          if (value) app.dataset.titleEdited = 'true';
          return;
        }
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

  function restoreFromEditor(app) {
    const content = editorContent(app);
    if (!/^## (基本信息|续费与价值|转让信息|测试报告|备注)$/m.test(content)) return false;
    const basic = sectionContent(content, '基本信息');
    const renewal = sectionContent(content, '续费与价值');
    const reports = sectionContent(content, '测试报告');
    const setValue = (name, value) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control && value) control.value = value;
    };
    [['vendor', '厂商'], ['model', '型号'], ['cpu', 'CPU'], ['memory', '内存'], ['disk', '硬盘'], ['bandwidth', '带宽'], ['traffic', '流量']].forEach(([name, label]) => setValue(name, valueFromMarkdown(basic, label)));
    [['renewalCycle', '续费周期'], ['expiryDate', '到期日期'], ['tradeDate', '交易日期'], ['nqUrl', 'NQ 地址'], ['tqUrl', 'TQ 地址'], ['tgContact', 'TG 联系']].forEach(([name, label]) => setValue(name, valueFromMarkdown(name === 'nqUrl' || name === 'tqUrl' || name === 'tgContact' ? reports : renewal, label)));
    const amount = valueFromMarkdown(renewal, '续费金额');
    const amountMatch = amount.match(/^(.+?)([\d.]+)（(.+?)）$/);
    if (amountMatch) { setValue('renewalAmount', amountMatch[2]); setValue('currency', amountMatch[3]); }
    const asking = valueFromMarkdown(renewal, '预出价格').match(/¥([\d.]+)/);
    if (asking) setValue('askingPrice', asking[1]);
    const transfer = sectionContent(content, '转让信息');
    app.querySelectorAll('[name="transferTags"]').forEach((control) => { control.checked = new RegExp(`^- ${control.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(transfer); });
    setValue('remarks', sectionContent(content, '备注'));
    const title = document.querySelector('#mde-title')?.value.trim();
    if (title) { setValue('postTitle', title); app.dataset.titleEdited = 'true'; }
    refreshCard(app); refreshPricePreview(app); refreshTitle(app); saveDraft(app);
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

  function closeModal(app) {
    app.classList.remove('nsit-open');
    app.querySelector('.nsit-modal').setAttribute('aria-hidden', 'true');
  }

  async function fillPost(app, mode = 'text') {
    try {
      const form = app.querySelector('form');
      const invalidField = Array.from(form.elements).find((element) => element.required && !element.value.trim());
      if (invalidField) {
        invalidField.focus();
        setStatus(app, `请先填写必填项：${invalidField.closest('.nsit-field')?.querySelector(':scope > span')?.textContent || invalidField.name}`);
        return;
      }
      const values = formValues(app);
      let content = markdown(values, '', activeRate(app));
      if (!content) {
        setStatus(app, '请至少填写一项内容。');
        return;
      }
      const generateCard = app.querySelector('[name="generateCard"]').checked;
      if (generateCard) setStatus(app, '正在生成并上传剩余价值卡片…');
      const cardMarkdown = generateCard ? await uploadValueCard(values, app) : '';
      content = mode === 'table' ? tableMarkdown(values, app, cardMarkdown) : markdown(values, cardMarkdown, activeRate(app));
      const titleField = document.querySelector('#mde-title');
      if (values.postTitle.trim() && titleField) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(titleField, values.postTitle.trim());
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const didFill = setEditorContent(app, content);
      if (didFill) selectTradeCategory();
      setStatus(app, didFill ? '已回填标题和 Markdown；请检查后手动发布。' : '未找到 NodeSeek 正文编辑器，请刷新页面后重试。');
      if (didFill) closeModal(app);
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
    picker.querySelectorAll('[data-nsit-picker-option]').forEach((option) => { option.hidden = false; });
    setPickerOpen(picker, false);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function initialize() {
    if (!location.pathname.startsWith('/new-discussion')) return;
    const existingApps = document.querySelectorAll(`#${APP_ID}`);
    const currentApp = Array.from(existingApps).find((element) => element.dataset.nsitVersion === VERSION);
    if (currentApp) return;
    existingApps.forEach((element) => element.remove());
    const title = document.querySelector('#mde-title');
    if (!title) return;
    const app = createApp();
    const hint = document.querySelector('#editor-body .window_header a[href*="runoob.com/markdown"]');
    if (hint?.parentElement) hint.parentElement.prepend(app);
    else title.before(app);
    restoreDraft(app);
    restoreCardToggle(app);
    syncPriceFields(app);
    refreshTitle(app);
    refreshCard(app);
    refreshPricePreview(app);
    loadRate(app);
    app.addEventListener('input', (event) => {
      const picker = event.target.matches('[data-nsit-picker-input="true"]') ? event.target.closest('.nsit-picker') : null;
      if (picker) {
        app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
          if (item !== picker) setPickerOpen(item, false);
        });
        filterPicker(picker);
        setPickerOpen(picker, true);
      }
      if (event.target.name === 'postTitle') app.dataset.titleEdited = 'true';
      if (event.target.name === 'askingPrice' || event.target.name === 'askingPremium') syncPriceFields(app);
      refreshTitle(app); refreshCard(app); refreshPricePreview(app); saveDraft(app);
      if (event.target.name === 'currency') loadRate(app);
    });
    app.addEventListener('focusin', (event) => {
      const picker = event.target.matches('[data-nsit-picker-input="true"]') ? event.target.closest('.nsit-picker') : null;
      app.querySelectorAll('.nsit-picker.is-open').forEach((item) => {
        if (item !== picker) setPickerOpen(item, false);
      });
      if (picker) {
        showAllPickerOptions(picker);
        setPickerOpen(picker, true);
      }
    });
    app.addEventListener('change', (event) => {
      if (event.target.matches('[name="generateCard"]')) {
        try { localStorage.setItem(CARD_TOGGLE_KEY, String(event.target.checked)); } catch (_) { /* 存储不可用时忽略 */ }
      }
      const tag = event.target.matches('[name="transferTags"]') ? event.target : null;
      if (tag?.checked && ['transfer', 'broker', 'push', 'payment'].includes(tag.dataset.tagGroup)) {
        app.querySelectorAll(`[name="transferTags"][data-tag-group="${tag.dataset.tagGroup}"]`).forEach((input) => {
          if (input !== tag) input.checked = false;
        });
      }
      refreshTitle(app); refreshCard(app); refreshPricePreview(app); saveDraft(app);
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
      if (action === 'refresh-rate') {
        loadRate(app, true);
        return;
      }
      if (action === 'close') {
        closeModal(app);
        return;
      }
      if (!action) return;
      if (action === 'fill' || action === 'fill-table') return;
      if (action === 'clear') {
        app.querySelector('form').reset();
        app.querySelector('[name="tradeDate"]').value = today();
        delete app.dataset.titleEdited;
        refreshTitle(app);
        localStorage.removeItem(STORAGE_KEY); refreshCard(app); refreshPricePreview(app); setStatus(app, '已清空表单。'); return;
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
    app.querySelector('.nsit-trigger').addEventListener('click', () => {
      app.classList.add('nsit-open');
      app.querySelector('.nsit-modal').setAttribute('aria-hidden', 'false');
      restoreFromEditor(app);
      syncPriceFields(app);
      if (/!\[[^\]]*\]\(https:\/\/cdn\.nodeimage\.com\/i\//.test(editorContent(app))) app.querySelector('[name="generateCard"]').checked = true;
      app.querySelector('[name="postTitle"]').focus();
      getNodeImageApiKey(true).catch(() => {});
    });
    app.querySelector('.nsit-modal').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        closeModal(app);
      }
    });
    document.addEventListener('click', (event) => {
      if (!app.isConnected) return;
      app.querySelectorAll('.nsit-picker.is-open').forEach((picker) => {
        if (!picker.contains(event.target)) setPickerOpen(picker, false);
      });
    });
  }

  window[RUNTIME_KEY]?.disconnect?.();
  const observer = new MutationObserver(initialize);
  window[RUNTIME_KEY] = observer;
  observer.observe(document.documentElement, { childList: true, subtree: true });
  initialize();
})();
