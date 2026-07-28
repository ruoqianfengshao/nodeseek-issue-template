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
        #${APP_ID} .nsit-catalog-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:rgba(20,29,45,.46)}#${APP_ID}.nsit-catalog-open .nsit-catalog-modal{display:grid;place-items:center}#${APP_ID} .nsit-catalog-dialog{width:min(720px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--nsit-line);border-radius:12px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.24)}#${APP_ID} .nsit-catalog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-head h3{font-size:16px}#${APP_ID} .nsit-catalog-head-copy{display:flex;align-items:baseline;gap:8px;min-width:0}#${APP_ID} .nsit-catalog-head-copy small{color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-catalog-search{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-search button{white-space:nowrap}#${APP_ID} .nsit-catalog-results{display:grid;gap:8px;min-height:88px;padding:14px 16px}#${APP_ID} .nsit-catalog-empty{margin:auto;color:var(--nsit-muted);font-size:14px}#${APP_ID} .nsit-catalog-result{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:11px 12px;text-align:left}#${APP_ID} .nsit-catalog-result strong{color:#27334a}#${APP_ID} .nsit-catalog-result span{color:#506078;font-size:13px;line-height:1.55}#${APP_ID} .nsit-catalog-result small{align-self:end;color:#8794aa;font-size:12px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{grid-template-columns:1fr}@media(max-width:820px){#${APP_ID} .nsit-body{display:block}#${APP_ID} .nsit-side{border-left:0;border-top:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-card{position:static}}@media(max-width:520px){#${APP_ID} .nsit-grid,#${APP_ID} .nsit-basic .nsit-grid,#${APP_ID} .nsit-report-remarks,#${APP_ID} .nsit-asking-price,#${APP_ID} .nsit-catalog-search{grid-template-columns:1fr}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model,#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic{grid-column:auto}#${APP_ID} .nsit-modal{padding:8px}#${APP_ID} .nsit-head small{display:none}#${APP_ID} .nsit-catalog-head-copy{align-items:flex-start;flex-direction:column;gap:2px}}
        #${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount > span:first-child{display:flex;align-items:center;justify-content:space-between;gap:4px}#${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount [data-nsit-amount-cny]{color:#2c8a4e;font-size:12px;font-weight:650;white-space:nowrap}#${APP_ID} .nsit-field-icon{display:inline-flex;vertical-align:-3px;margin-right:4px;color:inherit}#${APP_ID} .nsit-field-icon svg,#${APP_ID} .nsit-value-heading-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}#${APP_ID} .nsit-field--askingPrice .nsit-field-icon,#${APP_ID} .nsit-field--askingPrice .nsit-field-icon svg{color:#27834a}#${APP_ID} .nsit-field--askingPremium .nsit-field-icon,#${APP_ID} .nsit-field--askingPremium .nsit-field-icon svg{color:#c04444}#${APP_ID} .nsit-value-heading-icon{display:inline-block;margin-right:4px;vertical-align:-3px}#${APP_ID} .nsit-contact-post-remarks{display:grid;gap:10px}#${APP_ID} .nsit-value-result{align-items:flex-end}#${APP_ID} .nsit-value-result .nsit-price-preview{align-self:flex-end}#${APP_ID} .nsit-price-typing{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px;animation:nsit-type-in .24s steps(12,end)}@keyframes nsit-type-in{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes nsit-progress-slide{from{width:0;opacity:0;transform:translateX(-8px)}to{width:62px;opacity:1;transform:translateX(0)}}#${APP_ID} .nsit-title-progress.is-visible{animation:nsit-progress-slide .32s ease-out}#${APP_ID} .nsit-vendor-picker input{padding-left:34px}#${APP_ID} .nsit-vendor-input-icon{position:absolute;z-index:2;top:50%;left:9px;transform:translateY(-50%)}#${APP_ID} .nsit-vendor-icon{position:relative;display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:4px;background:#edf2f8;color:#52627c;font-size:11px;font-style:normal;overflow:hidden}#${APP_ID} .nsit-vendor-icon img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}#${APP_ID} .nsit-vendor-icon b{font:700 11px/1 sans-serif}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:flex;align-items:center;gap:7px}
      `;
    const modelSuggestionStyles = `
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
