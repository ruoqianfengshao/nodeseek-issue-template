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

  function personalizationIconMarkup() {
    return '<svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M512 42.666667c123.093333 0 241.962667 43.946667 330.24 123.434666C930.688 245.674667 981.333333 354.645333 981.333333 469.333333a256 256 0 0 1-256 256h-96a32.042667 32.042667 0 0 0-25.6 51.2l12.8 17.066667a117.418667 117.418667 0 0 1-32.213333 170.197333A117.333333 117.333333 0 0 1 522.666667 981.333333H512a469.333333 469.333333 0 1 1 0-938.666666z m0 85.333333a384 384 0 1 0 0 768h10.666667a32.042667 32.042667 0 0 0 25.6-51.2l-12.8-17.066667a117.418667 117.418667 0 0 1 32.213333-170.197333A117.333333 117.333333 0 0 1 629.333333 640H725.333333l8.448-0.213333A170.666667 170.666667 0 0 0 896 469.333333c0-89.002667-39.253333-175.36-110.848-239.829333C713.429333 164.906667 615.253333 128 512 128z m-234.666667 341.333333a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m469.333334-85.333333a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m-384-128a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m213.333333-42.666667a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" fill="currentColor"></path></svg>';
  }

  function vendorIconMarkup(value) {
    const initial = escapeHtml((value || '?').trim().slice(0, 1).toUpperCase());
    const icon = VENDOR_ICONS[value];
    return `<i class="nsit-vendor-icon">${icon ? `<img src="${escapeHtml(icon)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${initial}</b></i>`;
  }

  function machineCatalogTriggerMarkup() {
    return '<button type="button" class="nsit-machine-catalog-trigger" data-action="toggle-inline-machine-catalog" aria-label="打开机器列表" title="打开机器列表"><svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M224.304762 951.398942a290.043034 52.373898 0 1 0 580.086067 0 290.043034 52.373898 0 1 0-580.086067 0Z" fill="#C5C1BD"></path><path d="M404.182011 772.244092h79.102645v155.315696h-79.102645zM472.809877 956.094533h-61.403881c-18.782363 0-34.313933-15.53157-34.313933-34.313933v-12.280776c0-18.782363 15.53157-34.313933 34.313933-34.313933h61.403881c18.782363 0 34.313933 15.53157 34.313933 34.313933v12.280776c0 19.143563-15.53157 34.313933-34.313933 34.313933zM551.551323 772.244092h79.102645v155.315696h-79.102645zM620.179189 956.094533h-61.40388c-18.782363 0-34.313933-15.53157-34.313933-34.313933v-12.280776c0-18.782363 15.53157-34.313933 34.313933-34.313933h61.40388c18.782363 0 34.313933 15.53157 34.313933 34.313933v12.280776c0 19.143563-15.53157 34.313933-34.313933 34.313933z" fill="#EFA124"></path><path d="M131.115344 703.977425l-19.504762-13.725573c-30.340741-21.671958-37.564727-63.932275-15.892769-94.273016L285.347443 328.330159c21.671958-30.340741 63.932275-37.564727 94.273016-15.892769l19.504761 13.725573c30.340741 21.671958 37.564727 63.932275 15.892769 94.273016l-189.990829 267.648677c-20.949559 30.340741-63.571076 37.564727-93.911816 15.892769zM900.469841 703.977425l19.504762-13.725573c30.340741-21.671958 37.564727-63.932275 15.892769-94.273016l-189.990829-267.648677c-21.671958-30.340741-63.932275-37.564727-94.273016-15.892769l-19.504762 13.725573c-30.340741 21.671958-37.564727 63.932275-15.892769 94.273016l189.990829 267.648677c21.310758 30.340741 63.932275 37.564727 94.273016 15.892769z" fill="#F2B121"></path><path d="M832.203175 499.177425c0 202.994004-107.998589 338.804938-315.688184 338.804938-195.047619 0-315.688183-135.810935-315.688183-338.804938S342.416931 103.302998 516.87619 103.302998s315.326984 192.880423 315.326985 395.874427z" fill="#F5D021"></path><path d="M621.623986 403.459612c-28.173545 0-50.929101-28.534744-50.929101-63.571076 0-35.036332 22.755556-63.571076 50.929101-63.571076s50.929101 28.534744 50.9291 63.571076c0.361199 35.036332-22.755556 63.571076-50.9291 63.571076zM409.961199 403.459612c-28.173545 0-50.929101-28.534744-50.9291-63.571076 0-35.036332 22.755556-63.571076 50.9291-63.571076s50.929101 28.534744 50.929101 63.571076c0.361199 35.036332-22.755556 63.571076-50.929101 63.571076z" fill="#1F1204"></path><path d="M514.347795 373.84127c-35.75873 0-65.015873 28.895944-65.015873 67.183069 0 27.089947 29.257143 33.591534 65.015873 33.591534s65.015873-6.862787 65.015873-33.591534c-0.361199-38.648325-29.257143-67.183069-65.015873-67.183069z" fill="#F29D27"></path><path d="M515.070194 443.913933c-24.922751 0-40.454321-9.391182-41.17672-9.752381-4.334392-2.889594-5.779189-8.668783-3.250793-13.003175 2.889594-4.334392 8.668783-5.779189 13.003174-3.250793 1.083598 0.722399 27.812346 15.892769 67.544268-0.722399 4.695591-2.167196 10.47478 0.361199 12.280776 5.05679 2.167196 4.695591-0.361199 10.47478-5.05679 12.280776-16.253968 7.223986-30.70194 9.391182-43.343915 9.391182z" fill="#DA4E2A"></path><path d="M607.898413 81.269841c0-30.340741-24.561552-54.902293-54.902293-54.902292-13.725573 0-26.006349 5.05679-35.75873 13.003174-9.752381-8.307584-22.033157-13.003175-35.75873-13.003174-30.340741 0-54.902293 24.561552-54.902293 54.902292s24.561552 54.902293 54.902293 54.902293c3.973192 0 7.585185-0.361199 11.558377-1.083598v24.922751s88.132628-23.116755 99.691005-40.81552c9.391182-9.752381 15.17037-23.477954 15.170371-37.925926z" fill="#E34227"></path></svg><span>机器列表</span></button>';
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
      const labelMarkup = isVendor ? `<span class="nsit-vendor-label"><span>${fieldLabel(name, label)}</span>${machineCatalogTriggerMarkup()}</span>` : `<span>${fieldLabel(name, label)}</span>`;
      return `<label class="nsit-field nsit-field--${safeName}">${labelMarkup}${input}</label>`;
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
    return `<section class="nsit-section nsit-transfer-tags"><div class="nsit-tag-list">${groups.flatMap(([group, labels]) => labels.map((label) => `<label class="nsit-tag nsit-tag--${group}"><input type="checkbox" name="transferTags" value="${label}" data-tag-group="${group}"><span>${label}</span></label>`)).join('')}<span data-nsit-personal-tags></span></div></section>`;
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

  function inlineMachineCatalogMarkup() {
    return `<aside class="nsit-inline-catalog" aria-label="共享机器配置"><header class="nsit-inline-catalog-head"><h3>机器配置库</h3><button type="button" class="nsit-close nsit-inline-catalog-close" data-action="close-inline-machine-catalog" aria-label="收起机器配置库">×</button></header><label class="nsit-inline-catalog-search"><input type="search" data-nsit-inline-catalog-search placeholder="搜索厂商或型号" autocomplete="off" aria-label="搜索机器配置"></label><div class="nsit-inline-catalog-results" data-nsit-inline-catalog-results><p class="nsit-catalog-empty">正在加载机器配置…</p></div></aside>`;
  }

  function buyMachineCatalogMarkup() {
    return `<aside class="nsit-buy-catalog" aria-label="机器列表"><label><input type="search" data-nsit-buy-catalog-search placeholder="请输入搜索机器" autocomplete="off" aria-label="搜索机器配置"></label><div data-nsit-buy-catalog-results><p class="nsit-catalog-empty">正在加载机器配置…</p></div></aside>`;
  }

  function buyRenewalFieldsMarkup() {
    const cycles = OPTIONS.renewalCycle.map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${escapeHtml(value)}</span>`).join('');
    const currencies = Object.keys(CURRENCY_CODES).map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${escapeHtml(value)}</span>`).join('');
    return `<section class="nsit-section"><div class="nsit-grid nsit-buy-grid"><label class="nsit-field"><span>续费周期</span><span class="nsit-picker" data-picker-name="buyRenewalCycle"><input name="buyRenewalCycle" value="" placeholder="输入或选择" autocomplete="off" aria-label="续费周期" data-nsit-picker-input="true" role="combobox" aria-autocomplete="list" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择续费周期" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${cycles}</span></span></label><label class="nsit-field"><span>续费金额</span><span class="nsit-amount-input"><span class="nsit-picker nsit-currency-picker" data-picker-name="buyRenewalCurrency"><input name="buyRenewalCurrency" value="USD 美元" readonly aria-label="币种" data-nsit-picker-input="true" role="combobox" aria-autocomplete="none" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择币种" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${currencies}</span></span><input name="buyRenewalAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00"></span></label></div></section>`;
  }

  function buyBasicConfigMarkup() {
    const picker = (name, label, placeholder, optionKey) => {
      const isVendor = name === 'buyVendor';
      const options = OPTIONS[optionKey].map((value) => `<span data-nsit-picker-option="true" data-value="${escapeHtml(value)}">${isVendor ? vendorIconMarkup(value) : ''}${escapeHtml(value)}</span>`).join('');
      const prefix = isVendor ? `<span class="nsit-vendor-input-icon" data-nsit-vendor-icon>${vendorIconMarkup('')}</span>` : '';
      return `<label class="nsit-field"><span>${label}</span><span class="nsit-picker${isVendor ? ' nsit-vendor-picker' : ''}" data-picker-name="${name}">${prefix}<input name="${name}" placeholder="${placeholder}" autocomplete="off" data-nsit-picker-input="true" role="combobox" aria-autocomplete="list" aria-expanded="false"><button type="button" class="nsit-picker-toggle" aria-label="选择${label}" aria-expanded="false"><i></i></button><span class="nsit-picker-menu">${options}</span></span></label>`;
    };
    const model = '<label class="nsit-field"><span>型号</span><span class="nsit-model-suggest nsit-buy-model-suggest"><input name="buyModel" placeholder="请输入并查询" autocomplete="off"><span class="nsit-model-suggest-menu" data-nsit-buy-model-suggest-menu></span></span></label>';
    return `<section class="nsit-section"><div class="nsit-grid nsit-buy-grid">${picker('buyVendor', '厂商', '输入或选择厂商', 'vendors')}${model}</div><div class="nsit-buy-spec-grid">${picker('buyCpu', 'CPU', '输入或选择', 'cpu')}${picker('buyMemory', '内存', '输入或选择', 'memory')}${picker('buyDisk', '硬盘', '输入或选择', 'disk')}${picker('buyBandwidth', '带宽', '输入或选择', 'bandwidth')}${picker('buyTraffic', '流量', '输入或选择', 'traffic')}</div></section>`;
  }

  function buyTemplateMarkup() {
    const priceMode = [
      ['remainingValue', '剩余价值收', ''], ['discount', '剩余价值', '折数'], ['premium', '剩余价值 +', '金额'], ['total', '总价', '金额'], ['remainingValueMinus', '剩余价值 −', '金额'], ['offer', '带价聊', ''],
    ].map(([value, label, placeholder], index) => `<label class="nsit-buy-price-option"><input type="radio" name="buyPriceMode" value="${value}" tabindex="0"${index === 0 ? ' checked' : ''}><span>${label}</span>${placeholder ? `<input type="text" name="buyPriceValue-${value}" inputmode="decimal" placeholder="${placeholder}" aria-label="${label}${placeholder}">` : ''}<em>${value === 'discount' ? '折收' : value === 'remainingValue' || value === 'offer' ? '' : '收'}</em></label>`).join('');
    const tags = BUY_PRESET_TAGS.map((label) => `<label class="nsit-tag nsit-tag--${BUY_TAG_GROUPS[label]}"><input type="checkbox" name="buyTags" value="${label}" data-buy-tag-group="${BUY_TAG_GROUPS[label]}"><span>${label}</span></label>`).join('');
    return `
      <button type="button" class="nsit-trigger nsit-buy-trigger" aria-haspopup="dialog">收🐔模板</button>
      <div class="nsit-buy-modal" aria-hidden="true">
        <section class="nsit-buy-shell" role="dialog" aria-modal="true" aria-label="收鸡帖模板">
          <header class="nsit-head"><div class="nsit-head-copy"><h2>收鸡</h2>${starNoteMarkup()}</div><div><button type="button" class="nsit-personalization-trigger" data-action="open-buy-personalization">${personalizationIconMarkup()}<span>个性化设置</span></button><i class="nsit-head-divider" aria-hidden="true"></i><button type="button" class="nsit-close" data-action="close-buy" aria-label="关闭收鸡表单" title="关闭">×</button></div></header>
          <div class="nsit-buy-body">${buyMachineCatalogMarkup()}<form id="nsit-buy-form" class="nsit-buy-form" novalidate><main class="nsit-buy-main">
            ${buyBasicConfigMarkup()}
            ${buyRenewalFieldsMarkup()}<section class="nsit-section"><div class="nsit-field nsit-buy-price"><span>收购方式</span><div class="nsit-buy-price-options" role="radiogroup" aria-label="收购方式">${priceMode}</div></div></section>
            <section class="nsit-section"><label class="nsit-field"><span>帖子标题</span><input name="buyPostTitle" placeholder="自动生成，也可手动修改"></label></section>
          </main><aside class="nsit-buy-side">
            <section class="nsit-section"><div class="nsit-grid nsit-buy-contact-grid"><label class="nsit-field"><span>TG 联系</span><input name="buyTgContact" placeholder="@username 或 https://t.me/..."></label><label class="nsit-field nsit-buy-tags-field"><span>标签</span><span class="nsit-tag-list nsit-buy-tags">${tags}<span data-nsit-buy-personal-tags></span></span></label><label class="nsit-field"><span>备注</span><textarea name="buyPostRemarks" rows="2" placeholder="补充说明（可选）"></textarea></label></div></section>
          </aside></form></div>
          <footer class="nsit-action-dock"><div class="nsit-actions"><button type="button" class="nsit-primary" data-action="fill-buy">生成收鸡帖</button><button type="button" data-action="clear-buy">清空表单</button></div><div class="nsit-status" data-nsit-buy-status role="status"></div></footer>
        </section>
      </div>`;
  }

  let baseStylesInjected = false;

  function injectStyles(styles) {
    GM_addStyle(styles);
  }

  /* token 与跨页面共用的基础规则：必须最先注入，页面样式块才能正常覆盖它。 */
  function injectBaseStyles() {
    if (baseStylesInjected) return;
    baseStylesInjected = true;
    GM_addStyle(`
        /* 主题 token。浅色值是默认值，body.dark-layout 覆盖为深色
           （NodeSeek 的主题开关就是给 body 加 dark-layout 类）。
           抽奖弹窗、帖子过滤面板、交易状态按钮等节点挂在 body 下、不在 #nsit-app 内，
           所以 token 必须定义在 :root。
           不要再写 #nsit-app{--nsit-*} 定义默认值：#nsit-app 优先级 (1,0,0) 高于
           body.dark-layout (0,1,1)，会把深色值盖回浅色。 */
        :root{
        --nsit-accent:#d9961c;
        --nsit-accent-hover:#b87500;
        --nsit-accent-hover-2:#b97c12;
        --nsit-accent-hover-3:#c98a12;
        --nsit-accent-ink:#875800;
        --nsit-accent-ink-2:#8b5c00;
        --nsit-accent-ink-3:#885700;
        --nsit-accent-ink-4:#a56b00;
        --nsit-accent-ink-5:#8b641e;
        --nsit-accent-line:#f0d49c;
        --nsit-accent-line-2:#f0cf8a;
        --nsit-accent-ring:rgba(217,150,28,.14);
        --nsit-accent-ring-2:rgba(217,150,28,.18);
        --nsit-accent-ring-3:rgba(139,100,30,.18);
        --nsit-accent-soft:#fff8ea;
        --nsit-accent-soft-2:#fff8e9;
        --nsit-badge-red:#f01212;
        --nsit-chip:#edf2f8;
        --nsit-chip-active-ink:#6d4900;
        --nsit-chip-active-soft:#f4c96c;
        --nsit-chip-info-ink:#3f6d9f;
        --nsit-chip-info-soft:#dce8f8;
        --nsit-custom-from:#eaf8ff;
        --nsit-custom-to:#fff4df;
        --nsit-danger:#c04444;
        --nsit-danger-deep:#a04e59;
        --nsit-danger-edge:#e0a5a5;
        --nsit-danger-ink:#b34b4b;
        --nsit-danger-ink-2:#b4515d;
        --nsit-danger-ink-3:#913945;
        --nsit-danger-line-2:#e9c3c7;
        --nsit-danger-line-3:#eec2c2;
        --nsit-danger-soft-2:#fff8f8;
        --nsit-danger-soft-3:#fff0f0;
        --nsit-dim:#62708a;
        --nsit-dim-2:#7b8798;
        --nsit-dim-3:#888;
        --nsit-faint:#8794aa;
        --nsit-fieldline:#b8c5d5;
        --nsit-fold-warn:#7e5c1d;
        --nsit-head-from:#f9fbff;
        --nsit-head-from-2:#f7faff;
        --nsit-hl-veil:rgba(0,0,0,0);
        --nsit-hover:rgba(127,142,164,.16);
        --nsit-hover-bg:#f0f3f8;
        --nsit-info:#3976bc;
        --nsit-info-ink:#316ab7;
        --nsit-info-ink-2:#245892;
        --nsit-info-line-2:#b7cef0;
        --nsit-info-line-3:#6d9bd2;
        --nsit-info-ring:rgba(57,118,188,.14);
        --nsit-info-ring-2:rgba(57,118,188,.12);
        --nsit-info-soft:#f2f7ff;
        --nsit-ink:#27334a;
        --nsit-ink-soft:#506078;
        --nsit-ink-soft-2:#40506a;
        --nsit-ink-soft-3:#52627c;
        --nsit-ink-soft-4:#39485f;
        --nsit-ink-soft-5:#33425a;
        --nsit-ink-soft-6:#394962;
        --nsit-input-line:#c9d2de;
        --nsit-inset:#f4f6fa;
        --nsit-knob-off:#aebacd;
        --nsit-line:#e5eaf1;
        --nsit-line-2:#e5e7eb;
        --nsit-line-soft:#eef2f7;
        --nsit-line-soft-2:#edf1f5;
        --nsit-line-soft-3:#e2e8f0;
        --nsit-line-soft-4:#e3e9f2;
        --nsit-line-strong:#d8e0eb;
        --nsit-line-strong-2:#b9c9df;
        --nsit-muted:#718096;
        --nsit-muted-2:#66758d;
        --nsit-notice-err-bg:#fff6f6;
        --nsit-notice-ok-bg:#f4fbf6;
        --nsit-notice-ok-line:#a9d8b8;
        --nsit-ok:#27834a;
        --nsit-ok-ink:#2c8a4e;
        --nsit-ok-line:#9ad6b1;
        --nsit-ok-soft:#effaf3;
        --nsit-ok-soft-2:rgba(239,250,243,.82);
        --nsit-on-accent:#fff;
        --nsit-on-info:#fff;
        --nsit-overlay-bg:rgba(255,255,255,.82);
        --nsit-pill-bg:rgba(39,51,74,.88);
        --nsit-pill-bg-2:#27334a;
        --nsit-pill-ink:#fff;
        --nsit-preview-bg:#f8fafc;
        --nsit-progress-from:#6fbc82;
        --nsit-progress-to:#239652;
        --nsit-progress-track:#def0e3;
        --nsit-raised:#f6f8fb;
        --nsit-registered-soft:#f5f8fc;
        --nsit-scrim:rgba(20,29,45,.46);
        --nsit-scrim-2:rgba(24,32,48,.42);
        --nsit-scrim-3:rgba(24,32,48,.28);
        --nsit-shadow:rgba(31,44,67,.24);
        --nsit-shadow-2:rgba(0,0,0,.24);
        --nsit-shadow-soft:rgba(31,44,67,.18);
        --nsit-shadow-soft-2:rgba(31,44,67,.16);
        --nsit-shadow-soft-3:rgba(31,44,67,.2);
        --nsit-shadow-soft-4:rgba(31,44,67,.08);
        --nsit-shadow-soft-5:rgba(29,40,65,.06);
        --nsit-shadow-soft-6:rgba(29,40,65,.05);
        --nsit-shadow-soft-7:rgba(29,40,65,.38);
        --nsit-shadow-soft-8:rgba(15,23,38,.28);
        --nsit-shadow-soft-9:rgba(15,23,38,.2);
        --nsit-site-ink:#333;
        --nsit-spinner:#e8eef6;
        --nsit-sunken:#fbfcfe;
        --nsit-surface:#fff;
        --nsit-surface-3:rgba(35,47,67,.76);
        --nsit-switch-knob:#fff;
        --nsit-switch-on:#41a76c;
        --nsit-tag-broker-ink:#187961;
        --nsit-tag-broker-line:#83d1bf;
        --nsit-tag-broker-soft:#f0fbf7;
        --nsit-tag-contact-ink:#c04444;
        --nsit-tag-contact-line:#efb0b0;
        --nsit-tag-contact-soft:#fff1f1;
        --nsit-tag-extras-ink:#ad3c61;
        --nsit-tag-extras-line:#ea9db4;
        --nsit-tag-extras-soft:#fff3f6;
        --nsit-tag-identity-ink:#7452ae;
        --nsit-tag-identity-line:#cbb7ee;
        --nsit-tag-identity-soft:#f8f3ff;
        --nsit-tag-payment-ink:#996009;
        --nsit-tag-payment-line:#e7ba74;
        --nsit-tag-payment-soft:#fff9ec;
        --nsit-tag-push-ink:#b35c20;
        --nsit-tag-push-line:#f2bd91;
        --nsit-tag-push-soft:#fff6ee;
        --nsit-tag-transfer-ink:#316ab7;
        --nsit-tag-transfer-line:#a9c6f5;
        --nsit-tag-transfer-soft:#f2f7ff;
        --nsit-warn:#e7ba74;
        --nsit-warn-ink:#8b6a2b;
        --nsit-warn-soft:#fff3da;}
        body.dark-layout{
        --nsit-accent:#e8ac3c;
        --nsit-accent-hover:#f5c76a;
        --nsit-accent-hover-2:#f5c76a;
        --nsit-accent-hover-3:#f5c76a;
        --nsit-accent-ink:#f0bd5f;
        --nsit-accent-ink-2:#f0bd5f;
        --nsit-accent-ink-3:#f0bd5f;
        --nsit-accent-ink-4:#f0bd5f;
        --nsit-accent-ink-5:#f0bd5f;
        --nsit-accent-line:#7a6431;
        --nsit-accent-line-2:#7a6431;
        --nsit-accent-ring:rgba(232,172,60,.22);
        --nsit-accent-ring-2:rgba(232,172,60,.22);
        --nsit-accent-ring-3:rgba(232,172,60,.22);
        --nsit-accent-soft:#4e422b;
        --nsit-accent-soft-2:#4e422b;
        --nsit-badge-red:#f01212;
        --nsit-chip:#373737;
        --nsit-chip-active-ink:#c5b699;
        --nsit-chip-active-soft:#322c21;
        --nsit-chip-info-ink:#b2c5d9;
        --nsit-chip-info-soft:#2b323a;
        --nsit-custom-from:#2b323a;
        --nsit-custom-to:#3d3529;
        --nsit-danger:#e88b8b;
        --nsit-danger-deep:#d4afb4;
        --nsit-danger-edge:#483e3e;
        --nsit-danger-ink:#ddb1b6;
        --nsit-danger-ink-2:#ddb1b6;
        --nsit-danger-ink-3:#ddb1b6;
        --nsit-danger-line-2:#6b4747;
        --nsit-danger-line-3:#6b4747;
        --nsit-danger-soft-2:#4a3636;
        --nsit-danger-soft-3:#4a3636;
        --nsit-dim:#a8a8b2;
        --nsit-dim-2:#a8a8b2;
        --nsit-dim-3:#a8a8b2;
        --nsit-faint:#8f8f98;
        --nsit-fieldline:#414346;
        --nsit-fold-warn:#e7ba74;
        --nsit-head-from:#2c2c2c;
        --nsit-head-from-2:#2c3138;
        --nsit-hl-veil:rgba(0,0,0,.88);
        --nsit-hover:rgba(255,255,255,.12);
        --nsit-hover-bg:#3a3a3a;
        --nsit-info:#7cb0e8;
        --nsit-info-ink:#8fbfef;
        --nsit-info-ink-2:#8fbfef;
        --nsit-info-line-2:#546a80;
        --nsit-info-line-3:#546a80;
        --nsit-info-ring:rgba(124,176,232,.22);
        --nsit-info-ring-2:rgba(124,176,232,.22);
        --nsit-info-soft:#38424e;
        --nsit-ink:#e8e8e8;
        --nsit-ink-soft:#c9c9c9;
        --nsit-ink-soft-2:#c9c9c9;
        --nsit-ink-soft-3:#c9c9c9;
        --nsit-ink-soft-4:#c9c9c9;
        --nsit-ink-soft-5:#c9c9c9;
        --nsit-ink-soft-6:#c9c9c9;
        --nsit-input-line:#444648;
        --nsit-inset:#2a2a2a;
        --nsit-knob-off:#5a5a5a;
        --nsit-line:#3d3d3d;
        --nsit-line-2:#3d3d3d;
        --nsit-line-soft:#333333;
        --nsit-line-soft-2:#333333;
        --nsit-line-soft-3:#333333;
        --nsit-line-soft-4:#333333;
        --nsit-line-strong:#4d4d4d;
        --nsit-line-strong-2:#4d4d4d;
        --nsit-muted:#a1a1aa;
        --nsit-muted-2:#a1a1aa;
        --nsit-notice-err-bg:#332a2a;
        --nsit-notice-ok-bg:#252e28;
        --nsit-notice-ok-line:#3e4741;
        --nsit-ok:#6fbc82;
        --nsit-ok-ink:#7ccb8f;
        --nsit-ok-line:#3c4640;
        --nsit-ok-soft:#26332b;
        --nsit-ok-soft-2:#26332b;
        --nsit-on-accent:#1f1204;
        --nsit-on-info:#16202c;
        --nsit-overlay-bg:rgba(39,39,39,.86);
        --nsit-pill-bg:#e8e8e8;
        --nsit-pill-bg-2:#e8e8e8;
        --nsit-pill-ink:#272727;
        --nsit-preview-bg:#2a2a2a;
        --nsit-progress-from:#6fbc82;
        --nsit-progress-to:#4ea46a;
        --nsit-progress-track:#2b3a30;
        --nsit-raised:#2f2f2f;
        --nsit-registered-soft:#2a2f36;
        --nsit-scrim:rgba(0,0,0,.58);
        --nsit-scrim-2:rgba(0,0,0,.58);
        --nsit-scrim-3:rgba(0,0,0,.58);
        --nsit-shadow:rgba(0,0,0,.6);
        --nsit-shadow-2:rgba(0,0,0,.6);
        --nsit-shadow-soft:rgba(0,0,0,.45);
        --nsit-shadow-soft-2:rgba(0,0,0,.45);
        --nsit-shadow-soft-3:rgba(0,0,0,.45);
        --nsit-shadow-soft-4:rgba(0,0,0,.45);
        --nsit-shadow-soft-5:rgba(0,0,0,.45);
        --nsit-shadow-soft-6:rgba(0,0,0,.45);
        --nsit-shadow-soft-7:rgba(0,0,0,.45);
        --nsit-shadow-soft-8:rgba(0,0,0,.45);
        --nsit-shadow-soft-9:rgba(0,0,0,.45);
        --nsit-site-ink:#c9c9c9;
        --nsit-spinner:#4a4a4a;
        --nsit-sunken:#232323;
        --nsit-surface:#272727;
        --nsit-surface-3:#2a2a2a;
        --nsit-switch-knob:#fff;
        --nsit-switch-on:#41a76c;
        --nsit-tag-broker-ink:#97c3b8;
        --nsit-tag-broker-line:#295e51;
        --nsit-tag-broker-soft:#253430;
        --nsit-tag-contact-ink:#e3abab;
        --nsit-tag-contact-line:#854141;
        --nsit-tag-contact-soft:#3f2c2c;
        --nsit-tag-extras-ink:#daa7b8;
        --nsit-tag-extras-line:#7b3c51;
        --nsit-tag-extras-soft:#3c2a30;
        --nsit-tag-identity-ink:#c0b1db;
        --nsit-tag-identity-line:#5b497b;
        --nsit-tag-identity-soft:#332e3d;
        --nsit-tag-payment-ink:#d1b790;
        --nsit-tag-payment-line:#705020;
        --nsit-tag-payment-soft:#393022;
        --nsit-tag-push-ink:#ddb69b;
        --nsit-tag-push-line:#7e4e2d;
        --nsit-tag-push-soft:#3d2f26;
        --nsit-tag-transfer-ink:#a2bcdf;
        --nsit-tag-transfer-line:#365680;
        --nsit-tag-transfer-soft:#29323e;
        --nsit-warn:#e7ba74;
        --nsit-warn-ink:#e7ba74;
        --nsit-warn-soft:#4a4029;;
        color-scheme:dark}
      /* 共享基础规则：这些类名在发帖页、列表页、帖子页都会用到，集中在这里，避免各页面样式块重复定义。
         裸类名不带 #nsit-app 前缀：抽奖/中奖弹窗、过滤面板挂在 body 下、不在 #nsit-app 内，带前缀就命中不到。
         nsit- 前缀是本脚本独占的，不会和站点样式冲突。 */
      .nsit-star-note{display:inline-flex;align-items:center;gap:3px;color:var(--nsit-muted);font-size:14px;white-space:nowrap}
      .nsit-star-note a{display:inline-flex;align-items:center;color:var(--nsit-accent-ink-5);text-decoration:none}
      .nsit-star-note a:hover{text-decoration:underline}
      .nsit-github-icon{width:14px;height:14px;fill:currentColor}
      /* 弹窗标题里的 star 行：选择器更具体，用于压过移动端的隐藏规则（窄屏下弹窗内仍显示） */
      .nsit-lucky-head .nsit-star-note{display:inline-flex;align-items:center;gap:3px;color:var(--nsit-muted);font-size:14px;white-space:nowrap}
      .nsit-lucky-head .nsit-star-note a{display:inline-flex;align-items:center;color:var(--nsit-accent-ink-5);text-decoration:none}
      .nsit-lucky-head .nsit-star-note a:hover{text-decoration:underline}
      .nsit-lucky-head .nsit-github-icon{width:14px;height:14px;fill:currentColor}
      /* 抽奖弹窗外壳：发帖页与列表页共用；尺寸差异由各自页面样式覆盖 */
      .nsit-lucky-modal{position:fixed;z-index:100000;inset:0;display:none;align-items:center;justify-content:center;padding:24px;background:var(--nsit-scrim-2)}
      .nsit-lucky-modal.is-open{display:flex}
      .nsit-lucky-dialog,.nsit-lucky-dialog *{box-sizing:border-box}
      .nsit-lucky-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--nsit-line);background:linear-gradient(110deg,var(--nsit-head-from),var(--nsit-accent-soft))}
      .nsit-lucky-head h3{margin:0;font-size:16px}
      .nsit-lucky-head-copy{display:flex;align-items:baseline;gap:9px;min-width:0}
      .nsit-lucky-head-title{display:flex;align-items:baseline;gap:9px;min-width:0}
      /* 深色下 placeholder 的可读性：Chrome 的 placeholder 默认色固定为 #757575，
         既不跟随 input 的 color，也不受 color-scheme 影响；它落在深色底上只有约 3.2 的对比度。
         这里只在深色下显式覆盖（浅色保持浏览器默认值，零回归）。
         抽奖弹窗与过滤面板挂在 body 下、不在 #nsit-app 内，所以单独列出。 */
      body.dark-layout #nsit-app input::placeholder,body.dark-layout #nsit-app textarea::placeholder,body.dark-layout .nsit-lucky-dialog input::placeholder,body.dark-layout .nsit-post-filter-panel input::placeholder{color:var(--nsit-muted);opacity:1}
    `);
  }

  function createApp({ replyMode = false } = {}) {
    const app = document.createElement('aside');
    app.id = APP_ID;
    app.dataset.nsitVersion = VERSION;
    app.dataset.nsitReplyMode = String(replyMode);
    const styles = `
        #${APP_ID}{display:contents;box-sizing:border-box;margin:0;color:var(--nsit-ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        #${APP_ID} *{box-sizing:border-box}#${APP_ID} .nsit-shell{background:var(--nsit-surface);border:1px solid var(--nsit-line);border-radius:12px;box-shadow:0 8px 24px var(--nsit-shadow-soft-5);overflow:hidden}#${APP_ID} .nsit-generation-loading{position:absolute;z-index:100;inset:0;display:none;place-items:center;background:var(--nsit-overlay-bg);backdrop-filter:blur(2px)}#${APP_ID}.nsit-generating .nsit-generation-loading{display:grid}#${APP_ID} .nsit-generation-loading-content{display:grid;justify-items:center;gap:10px;padding:18px 24px;border:1px solid var(--nsit-line-soft-3);border-radius:10px;background:var(--nsit-surface);box-shadow:0 10px 28px var(--nsit-shadow-soft-2);color:var(--nsit-ink-soft-6);font-weight:600}#${APP_ID} .nsit-generation-spinner{width:28px;height:28px;border:3px solid var(--nsit-spinner);border-top-color:var(--nsit-accent);border-radius:50%;animation:nsit-generation-spin .75s linear infinite}@keyframes nsit-generation-spin{to{transform:rotate(360deg)}}
        #${APP_ID} .nsit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--nsit-line);background:linear-gradient(110deg,var(--nsit-head-from),var(--nsit-accent-soft));flex:none}#${APP_ID} .nsit-head-copy{display:flex;align-items:baseline;gap:9px;min-width:0}/* star 提示行：出鸡/收鸡、抽奖配置、抽奖与中奖弹窗共用这一份定义。
   不带 #nsit-app 前缀：抽奖/中奖弹窗挂在 body 下、不在 #nsit-app 里，带前缀就命中不到。
   nsit- 前缀是本脚本独占的，裸类名不会和站点样式冲突。 */
        #${APP_ID} h2,#${APP_ID} h3{margin:0}#${APP_ID} h2{font-size:16px}#${APP_ID} h3{font-size:14px}#${APP_ID} p{color:var(--nsit-muted)}
        #${APP_ID} .nsit-body{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.85fr);flex:1;min-height:0;overflow:hidden}#${APP_ID} .nsit-form,#${APP_ID} .nsit-side{min-height:0;overflow-y:auto;overscroll-behavior:contain;box-shadow:inset 0 7px 9px -12px var(--nsit-shadow-soft-7)}#${APP_ID} .nsit-form{padding:4px 18px 18px}#${APP_ID} .nsit-side{padding:4px 18px 18px;border-left:1px solid var(--nsit-line);background:var(--nsit-sunken)}#${APP_ID} .nsit-machine-tabs{position:absolute;right:100%;top:52px;bottom:0;display:flex;flex-direction:column;align-items:flex-end;gap:7px;width:210px;padding:14px 0;overflow:visible}#${APP_ID} .nsit-machine-tab{display:flex;align-items:center;gap:7px;width:110px;min-height:34px;margin:0;padding:7px 9px;border:1px solid var(--nsit-line-strong);border-right:0;border-radius:7px 0 0 7px;background:var(--nsit-surface);color:var(--nsit-ink-soft);font:inherit;text-align:left;transition:width .18s ease,background .15s,border-color .15s;cursor:pointer;white-space:nowrap;overflow:hidden}#${APP_ID} .nsit-machine-tab:hover,#${APP_ID} .nsit-machine-tab.is-active{width:210px;border-color:var(--nsit-accent);background:var(--nsit-accent-soft);color:var(--nsit-accent-ink)}#${APP_ID} .nsit-machine-tab.is-active{font-weight:650}#${APP_ID} .nsit-machine-logo{position:relative;display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:5px;background:var(--nsit-chip);color:var(--nsit-ink-soft-3);font-size:11px;font-weight:700;overflow:hidden}#${APP_ID} .nsit-machine-logo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}#${APP_ID} .nsit-machine-tab.is-active .nsit-machine-logo{background:var(--nsit-chip-active-soft);color:var(--nsit-chip-active-ink)}#${APP_ID} .nsit-machine-index{flex:none;color:var(--nsit-faint);font-size:11px}#${APP_ID} .nsit-machine-name{overflow:hidden;text-overflow:ellipsis}#${APP_ID} .nsit-machine-meta{display:none;margin-left:auto;font-size:12px;color:var(--nsit-muted)}#${APP_ID} .nsit-machine-tab:hover .nsit-machine-meta,#${APP_ID} .nsit-machine-tab.is-active .nsit-machine-meta{display:inline}#${APP_ID} .nsit-machine-add{border-style:dashed;background:var(--nsit-surface);color:var(--nsit-muted)}#${APP_ID} .nsit-machine-add:disabled{cursor:not-allowed;opacity:.45}#${APP_ID} .nsit-machine-add:not(:disabled):hover{border-color:var(--nsit-accent);background:var(--nsit-accent-soft);color:var(--nsit-accent-ink)}
#${APP_ID} .nsit-section{padding:14px 0;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-section:last-child,#${APP_ID} .nsit-tg-contact{border-bottom:0}#${APP_ID} .nsit-section p{margin:3px 0 10px;font-size:14px}#${APP_ID} .nsit-basic .nsit-grid{grid-template-columns:repeat(10,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model{grid-column:span 5}#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic{grid-column:span 2}#${APP_ID} .nsit-title-divider{height:1px;margin:16px 0 0;background:var(--nsit-line)}#${APP_ID} .nsit-post-title{margin-top:0}#${APP_ID} .nsit-title-hint{margin-left:6px;color:var(--nsit-muted);font-size:12px;font-weight:400}
        #${APP_ID} .nsit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}#${APP_ID} .nsit-field{display:grid;gap:5px;min-width:0}#${APP_ID} .nsit-field span{font-size:14px;color:var(--nsit-ink-soft)}.nsit-field-wide{grid-column:1/-1}
        #${APP_ID} input,#${APP_ID} select,#${APP_ID} textarea{width:100%;min-width:0;border:1px solid var(--nsit-line-strong);border-radius:7px;background:var(--nsit-surface);color:var(--nsit-ink);padding:8px 9px;font:inherit;outline:none}#${APP_ID} textarea{resize:vertical}#${APP_ID} input:focus,#${APP_ID} select:focus,#${APP_ID} textarea:focus{border-color:var(--nsit-accent);box-shadow:0 0 0 3px var(--nsit-accent-ring)}#${APP_ID} .nsit-picker{position:relative;z-index:0;display:block;isolation:isolate}#${APP_ID} .nsit-picker input{padding-right:35px}#${APP_ID} .nsit-picker-toggle{position:absolute;z-index:1;top:50%;right:8px;display:grid;place-items:center;width:20px;height:20px;margin:0;padding:0;transform:translateY(-50%);border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:var(--nsit-ink-soft-3)}#${APP_ID} .nsit-picker-toggle i{display:block;width:18px;height:18px;background:center/18px 18px no-repeat url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 18L24 30L12 18' stroke='%23333' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}#${APP_ID} .nsit-picker-toggle:hover{color:var(--nsit-ink)}#${APP_ID} .nsit-picker-menu{display:none;position:absolute;z-index:20;top:calc(100% + 5px);left:0;width:100%;max-height:180px;overflow:auto;border:1px solid var(--nsit-line-strong);border-radius:8px;background:var(--nsit-surface);box-shadow:0 8px 18px var(--nsit-shadow-soft);padding:5px}#${APP_ID} .nsit-picker.is-open{z-index:30}#${APP_ID} .nsit-picker.is-open .nsit-picker-menu{display:grid;gap:2px}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:block;width:100%;margin:0;border:0;border-radius:5px;background:transparent;padding:7px 9px;text-align:left;color:var(--nsit-ink-soft-5);font:inherit;cursor:pointer}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]:hover,#${APP_ID} .nsit-picker-menu [data-nsit-picker-option].is-active{background:var(--nsit-warn-soft);color:var(--nsit-accent-ink-3)}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option][hidden]{display:none}#${APP_ID} .nsit-model-suggest{position:relative;z-index:0;display:block}#${APP_ID} .nsit-model-suggest-menu{display:none;position:absolute;z-index:40;top:calc(100% + 5px);left:0;width:100%;max-height:260px;overflow:auto;border:1px solid var(--nsit-line-strong);border-radius:8px;background:var(--nsit-surface);box-shadow:0 8px 18px var(--nsit-shadow-soft);padding:5px}#${APP_ID} .nsit-model-suggest.is-open{z-index:35}#${APP_ID} .nsit-model-suggest.is-open .nsit-model-suggest-menu{display:grid;gap:2px}#${APP_ID} .nsit-model-suggestion{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:5px 10px;margin:0;border:0;border-radius:6px;background:transparent;padding:8px 9px;color:var(--nsit-ink-soft-5);font:inherit;text-align:left;cursor:pointer}#${APP_ID} .nsit-model-suggestion:hover{background:var(--nsit-warn-soft);color:var(--nsit-accent-ink-3)}#${APP_ID} .nsit-model-suggestion strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${APP_ID} .nsit-model-suggestion small{color:var(--nsit-muted);font-size:12px;white-space:nowrap}#${APP_ID} .nsit-model-suggestion span{grid-column:1/-1;color:var(--nsit-muted-2);font-size:12px;line-height:1.45}#${APP_ID} .nsit-model-suggest-empty{margin:0;padding:8px 9px;color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-asking-price{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px}#${APP_ID} .nsit-asking-price .nsit-field{min-width:0}#${APP_ID} .nsit-price-preview{min-height:37px;border:1px solid var(--nsit-accent-line);border-radius:7px;background:var(--nsit-accent-soft-2);padding:8px 10px;color:var(--nsit-accent-ink-5);font-size:14px;line-height:19px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{display:grid;grid-template-columns:1fr;gap:12px}#${APP_ID} .nsit-report-remarks .nsit-field{min-width:0}#${APP_ID} .nsit-report-remarks .nsit-field-wide{grid-column:auto}#${APP_ID} .nsit-report-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#${APP_ID} .nsit-tag-list{display:flex;flex-wrap:wrap;gap:8px}#${APP_ID} .nsit-tag{position:relative;cursor:pointer}#${APP_ID} .nsit-tag input{position:absolute;opacity:0;pointer-events:none}#${APP_ID} .nsit-tag span{display:block;border:1px solid var(--nsit-line-strong);border-radius:999px;background:var(--nsit-surface);padding:6px 11px;color:var(--nsit-ink-soft);font-size:14px;transition:.15s}#${APP_ID} .nsit-tag--transfer input:checked + span{border-color:var(--nsit-tag-transfer-line);background:var(--nsit-tag-transfer-soft);color:var(--nsit-tag-transfer-ink)}#${APP_ID} .nsit-tag--identity input:checked + span{border-color:var(--nsit-tag-identity-line);background:var(--nsit-tag-identity-soft);color:var(--nsit-tag-identity-ink)}#${APP_ID} .nsit-tag--brokerWalk input:checked + span,#${APP_ID} .nsit-tag--broker input:checked + span{border-color:var(--nsit-tag-broker-line);background:var(--nsit-tag-broker-soft);color:var(--nsit-tag-broker-ink)}#${APP_ID} .nsit-tag--push input:checked + span{border-color:var(--nsit-tag-push-line);background:var(--nsit-tag-push-soft);color:var(--nsit-tag-push-ink)}#${APP_ID} .nsit-tag--payment input:checked + span{border-color:var(--nsit-tag-payment-line);background:var(--nsit-tag-payment-soft);color:var(--nsit-tag-payment-ink)}#${APP_ID} .nsit-tag--extras input:checked + span{border-color:var(--nsit-tag-extras-line);background:var(--nsit-tag-extras-soft);color:var(--nsit-tag-extras-ink)}#${APP_ID} .nsit-tag input:checked + span{box-shadow:inset 0 0 0 1px currentColor;font-weight:650;filter:saturate(1.25)}#${APP_ID} .nsit-tag:hover span{transform:translateY(-1px)}
        #${APP_ID} .nsit-value-card{margin:14px 0;border:1px solid var(--nsit-accent-line-2);border-radius:12px;background:linear-gradient(145deg,var(--nsit-surface),var(--nsit-accent-soft-2));padding:14px}#${APP_ID} .nsit-value-inputs{display:grid;gap:8px;margin-bottom:8px}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-value-row-two{padding-bottom:8px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-inputs .nsit-field{gap:3px}#${APP_ID} .nsit-value-inputs .nsit-field span{font-size:14px;color:var(--nsit-ink-soft)}#${APP_ID} .nsit-value-inputs .nsit-field--askingPrice > span{color:var(--nsit-ok)}#${APP_ID} .nsit-value-inputs .nsit-field--askingPremium > span{color:var(--nsit-danger)}#${APP_ID} .nsit-value-inputs input,#${APP_ID} .nsit-value-inputs select{padding:6px 7px;font-size:14px}#${APP_ID} .nsit-amount-input{display:flex;min-width:0}#${APP_ID} .nsit-amount-input .nsit-currency-picker{width:112px;flex:none}#${APP_ID} .nsit-amount-input .nsit-currency-picker input{margin:0;border-radius:7px 0 0 7px;cursor:pointer}#${APP_ID} .nsit-currency-picker .nsit-picker-menu{width:max-content;min-width:100%}#${APP_ID} .nsit-currency-picker .nsit-picker-menu [data-nsit-picker-option]{white-space:nowrap}#${APP_ID} .nsit-amount-input > input{margin-left:-1px;border-radius:0 7px 7px 0}#${APP_ID} .nsit-value-inputs .nsit-picker input{padding-right:30px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle{right:5px;width:18px;height:18px}#${APP_ID} .nsit-value-inputs .nsit-picker-toggle i{width:15px;height:15px;background-size:15px 15px}#${APP_ID} .nsit-rate-value{display:flex;align-items:center;min-width:0;gap:4px;white-space:nowrap}#${APP_ID} .nsit-value-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;color:var(--nsit-warn-ink);font-weight:600}#${APP_ID} .nsit-value-heading>.nsit-rate-value{margin-right:auto;color:var(--nsit-ok-ink);font-weight:400}#${APP_ID} .nsit-value-heading>.nsit-rate-value strong{min-width:0;overflow:hidden;color:inherit;font-size:14px;font-weight:650;text-overflow:ellipsis}#${APP_ID} .nsit-value-heading>.nsit-rate-value button{width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;color:inherit;font-size:16px;line-height:1;cursor:pointer}#${APP_ID} .nsit-value-stats{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-width:0;white-space:nowrap}#${APP_ID} .nsit-value-heading strong{color:var(--nsit-accent-ink-5);font-size:14px}#${APP_ID} .nsit-title-progress{display:block;width:62px;height:6px;overflow:hidden;border-radius:999px;background:var(--nsit-progress-track)}.nsit-title-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--nsit-progress-from),var(--nsit-progress-to));transition:width .15s ease}#${APP_ID} .nsit-value-result{display:flex;align-items:flex-start;gap:12px;min-height:54px;margin-top:12px}#${APP_ID} .nsit-value{flex:none;margin:0;color:var(--nsit-accent);font-size:34px;font-weight:750;letter-spacing:-1px;line-height:1;word-break:break-all}#${APP_ID} .nsit-value small{margin-right:4px;font-size:15px;font-weight:inherit}#${APP_ID} .nsit-value-result .nsit-price-preview{display:flex;flex:1;align-items:flex-end;justify-content:flex-end;gap:8px;align-self:flex-start;min-width:0;padding:0;border:0;background:transparent;color:var(--nsit-muted);font-size:18px;font-weight:650;line-height:1.3;text-align:right;white-space:normal}#${APP_ID} .nsit-price-preview span{min-width:0}#${APP_ID} .nsit-price-preview b{display:inline-block;flex:none;font-size:34px;letter-spacing:-1px;line-height:1;white-space:nowrap}#${APP_ID} .nsit-price-preview[data-price-state="fair"]{color:var(--nsit-ok)}#${APP_ID} .nsit-price-preview[data-price-state="premium"]{color:var(--nsit-danger)}
        #${APP_ID} .nsit-formula{margin:0;font-size:14px;color:var(--nsit-muted)}#${APP_ID} .nsit-action-dock{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:12px 18px;border-top:1px solid var(--nsit-line);background:var(--nsit-surface);box-shadow:0 -8px 18px var(--nsit-shadow-soft-6)}#${APP_ID} .nsit-toggle-group,#${APP_ID} .nsit-actions{display:flex;flex-wrap:wrap;gap:8px}#${APP_ID} .nsit-actions{justify-content:flex-end}#${APP_ID} .nsit-card-toggle{display:flex;align-items:center;gap:6px;color:var(--nsit-ink-soft);cursor:pointer;white-space:nowrap}#${APP_ID} .nsit-card-toggle input{width:15px;height:15px;margin:0;accent-color:var(--nsit-accent)}#${APP_ID} .nsit-config-check-toggle{position:relative;gap:4px}#${APP_ID} .nsit-config-check-help{display:grid;place-items:center;width:15px;height:15px;border:1px solid currentColor;border-radius:50%;font-size:10px;font-weight:700;line-height:1}#${APP_ID} .nsit-config-check-tooltip{position:absolute;z-index:10;bottom:calc(100% + 8px);left:0;width:310px;padding:9px 11px;border-radius:7px;background:var(--nsit-pill-bg-2);color:var(--nsit-pill-ink);font-size:12px;font-weight:400;line-height:1.55;white-space:normal;box-shadow:0 8px 18px var(--nsit-shadow-soft-3);opacity:0;pointer-events:none;transform:translateY(3px);transition:opacity .15s,transform .15s}#${APP_ID} .nsit-config-check-tooltip::after{position:absolute;top:100%;left:22px;border:5px solid transparent;border-top-color:var(--nsit-pill-bg-2);content:""}#${APP_ID} .nsit-config-check-toggle:hover .nsit-config-check-tooltip{opacity:1;transform:translateY(0)}#${APP_ID} button{border:1px solid var(--nsit-line-strong);border-radius:7px;background:var(--nsit-surface);color:var(--nsit-ink-soft-2);padding:8px 11px;font:inherit;cursor:pointer}#${APP_ID} button:hover{border-color:var(--nsit-accent);color:var(--nsit-accent-ink-2)}#${APP_ID} button.nsit-primary{background:var(--nsit-accent);border-color:var(--nsit-accent);color:var(--nsit-on-accent)}#${APP_ID} .nsit-status{position:absolute;right:18px;bottom:100%;max-width:calc(100% - 36px);margin:0 0 7px;padding:4px 7px;border-radius:5px;background:var(--nsit-pill-bg);color:var(--nsit-pill-ink);font-size:14px;opacity:0;pointer-events:none;transition:opacity .15s}.nsit-status:not(:empty){opacity:1}
        #${APP_ID} .nsit-trigger{display:inline;margin:0 7px 0 0;padding:3px 8px;border:1px solid var(--nsit-accent);border-radius:5px;background:var(--nsit-accent-soft);color:var(--nsit-accent-ink);font:600 13px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;vertical-align:baseline}#${APP_ID} .nsit-trigger:hover{border-color:var(--nsit-accent-hover);background:var(--nsit-accent);color:var(--nsit-on-accent)}#${APP_ID} .nsit-buy-trigger{border-color:var(--nsit-info-line-3);background:var(--nsit-info-soft);color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-trigger:hover{border-color:var(--nsit-info-ink);background:var(--nsit-info)}#${APP_ID} .nsit-modal,#${APP_ID} .nsit-buy-modal{display:none;position:fixed;z-index:2147483647;inset:0;overflow:auto;padding:28px 16px;background:var(--nsit-scrim)}#${APP_ID}.nsit-open .nsit-modal,#${APP_ID}.nsit-buy-open .nsit-buy-modal{display:grid;place-items:center}#${APP_ID} .nsit-dialog-wrap{position:relative;width:min(980px,100%);max-height:calc(100vh - 56px);margin:auto}#${APP_ID} .nsit-modal .nsit-shell,#${APP_ID} .nsit-buy-shell{position:relative;display:flex;flex-direction:column;width:min(680px,100%);max-height:calc(100vh - 56px);margin:0;border:1px solid var(--nsit-line);border-radius:12px;background:var(--nsit-surface);box-shadow:0 20px 60px var(--nsit-shadow-2);overflow:hidden}#${APP_ID} .nsit-modal .nsit-shell{width:100%}#${APP_ID} .nsit-close{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;font-size:25px;line-height:1;color:var(--nsit-dim)}#${APP_ID} .nsit-close:hover{background:var(--nsit-hover-bg);color:var(--nsit-ink)}#${APP_ID} .nsit-head>div{min-width:0}#${APP_ID} .nsit-head>div:last-child{display:flex;align-items:center;gap:8px;white-space:nowrap}#${APP_ID} .nsit-personalization-trigger{display:inline-flex;align-items:center;height:28px;gap:5px;margin:0;padding:0 4px;border:0;background:transparent;color:var(--nsit-accent);font:inherit;font-weight:600;line-height:1}#${APP_ID} .nsit-personalization-trigger:hover{border-color:transparent;background:var(--nsit-warn-soft);color:var(--nsit-accent-ink-4)}#${APP_ID} .nsit-personalization-trigger svg{width:18px;height:18px;fill:currentColor}#${APP_ID} .nsit-head-divider{width:1px;height:18px;background:var(--nsit-line-strong)}#${APP_ID} .nsit-buy-shell{width:min(940px,100%);height:min(640px,calc(100vh - 56px))}#${APP_ID} .nsit-buy-body{display:grid;grid-template-columns:290px minmax(0,1fr);min-height:0;flex:1}#${APP_ID} .nsit-buy-catalog{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--nsit-line);background:var(--nsit-sunken)}#${APP_ID} .nsit-buy-catalog>header{padding:10px 14px 6px}#${APP_ID} .nsit-buy-catalog h3{font-size:15px}#${APP_ID} .nsit-buy-catalog>label{padding:0 14px 8px}#${APP_ID} .nsit-buy-catalog>label input{padding:7px 8px}#${APP_ID} [data-nsit-buy-catalog-results]{display:grid;align-content:start;gap:7px;min-height:0;overflow:auto;padding:0 10px 12px}#${APP_ID} .nsit-buy-catalog-result{display:grid;gap:3px;width:100%;padding:9px 10px;text-align:left}#${APP_ID} .nsit-buy-catalog-result strong{color:var(--nsit-ink)}#${APP_ID} .nsit-buy-catalog-result span,#${APP_ID} .nsit-buy-catalog-result small{color:var(--nsit-muted-2);font-size:12px;line-height:1.4}#${APP_ID} .nsit-buy-catalog-result:hover{border-color:var(--nsit-info-line-3);background:var(--nsit-info-soft)}#${APP_ID} .nsit-buy-form{overflow:auto;padding:0 18px 12px}#${APP_ID} .nsit-buy-form .nsit-section{padding:10px 0}#${APP_ID} .nsit-buy-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px}#${APP_ID} .nsit-buy-spec-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px 10px;margin-top:8px}#${APP_ID} .nsit-buy-price{display:grid;gap:6px}#${APP_ID} .nsit-buy-price-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 10px}#${APP_ID} .nsit-buy-price-option{display:grid;grid-template-columns:auto auto minmax(64px,78px) auto;align-items:center;gap:5px;padding:4px 2px;color:var(--nsit-ink-soft);cursor:pointer}#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked){color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-price-option input[type="radio"]{width:15px;height:15px;margin:0;accent-color:var(--nsit-info)}#${APP_ID} .nsit-buy-price-option input[type="number"]{width:100%;min-width:0;padding:4px 5px;font-size:13px}#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked) input[type="number"]{border-color:var(--nsit-info);color:var(--nsit-info-ink);box-shadow:0 0 0 2px var(--nsit-info-ring-2)}#${APP_ID} .nsit-buy-price-option em{font-style:normal;white-space:nowrap}#${APP_ID} .nsit-buy-tags{padding-top:1px}#${APP_ID} .nsit-buy-shell .nsit-action-dock{justify-content:space-between;gap:12px;padding:10px 18px}#${APP_ID} [data-nsit-buy-status]{margin-left:auto;text-align:right}@media(max-width:760px){#${APP_ID} .nsit-buy-shell{height:auto;max-height:calc(100vh - 16px)}#${APP_ID} .nsit-buy-body{grid-template-columns:1fr;overflow:auto}#${APP_ID} .nsit-buy-catalog{max-height:245px;border-right:0;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-buy-form{overflow:visible}#${APP_ID} .nsit-buy-spec-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-buy-price-options{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){#${APP_ID} .nsit-buy-grid,#${APP_ID} .nsit-buy-price-options,#${APP_ID} .nsit-buy-spec-grid{grid-template-columns:1fr}#${APP_ID} .nsit-buy-modal{padding:8px}}
        #${APP_ID} .nsit-catalog-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:var(--nsit-scrim)}#${APP_ID}.nsit-catalog-open .nsit-catalog-modal{display:grid;place-items:center}#${APP_ID} .nsit-catalog-dialog{width:min(720px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--nsit-line);border-radius:12px;background:var(--nsit-surface);box-shadow:0 20px 60px var(--nsit-shadow-2)}#${APP_ID} .nsit-catalog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-head h3{font-size:16px}#${APP_ID} .nsit-catalog-head-copy{display:flex;align-items:baseline;gap:8px;min-width:0}#${APP_ID} .nsit-catalog-head-copy small{color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-catalog-search{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-catalog-search button{white-space:nowrap}#${APP_ID} .nsit-catalog-results{display:grid;gap:8px;min-height:88px;padding:14px 16px}#${APP_ID} .nsit-catalog-empty{margin:auto;color:var(--nsit-muted);font-size:14px}#${APP_ID} .nsit-catalog-result{display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:11px 12px;text-align:left}#${APP_ID} .nsit-catalog-result strong{color:var(--nsit-ink)}#${APP_ID} .nsit-catalog-result span{color:var(--nsit-ink-soft);font-size:13px;line-height:1.55}#${APP_ID} .nsit-catalog-result small{align-self:end;color:var(--nsit-faint);font-size:12px;white-space:nowrap}#${APP_ID} .nsit-report-remarks{grid-template-columns:1fr}@media(max-width:820px){#${APP_ID} .nsit-body{display:block}#${APP_ID} .nsit-side{border-left:0;border-top:1px solid var(--nsit-line)}#${APP_ID} .nsit-value-card{position:static}}@media(max-width:520px){#${APP_ID} .nsit-grid,#${APP_ID} .nsit-basic .nsit-grid,#${APP_ID} .nsit-report-remarks,#${APP_ID} .nsit-asking-price,#${APP_ID} .nsit-catalog-search{grid-template-columns:1fr}#${APP_ID} .nsit-value-row-one,#${APP_ID} .nsit-value-row-two{grid-template-columns:repeat(3,minmax(0,1fr))}#${APP_ID} .nsit-basic .nsit-field--vendor,#${APP_ID} .nsit-basic .nsit-field--model,#${APP_ID} .nsit-basic .nsit-field--cpu,#${APP_ID} .nsit-basic .nsit-field--memory,#${APP_ID} .nsit-basic .nsit-field--disk,#${APP_ID} .nsit-basic .nsit-field--bandwidth,#${APP_ID} .nsit-basic .nsit-field--traffic,#${APP_ID} .nsit-basic .nsit-field--remainingTraffic{grid-column:auto}#${APP_ID} .nsit-modal{padding:8px}.nsit-star-note{display:none}#${APP_ID} .nsit-catalog-head-copy{align-items:flex-start;flex-direction:column;gap:2px}}
        #${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount > span:first-child{display:flex;align-items:center;justify-content:space-between;gap:4px}#${APP_ID} .nsit-value-inputs .nsit-field--renewalAmount [data-nsit-amount-cny]{color:var(--nsit-ok-ink);font-size:12px;font-weight:650;white-space:nowrap}#${APP_ID} .nsit-field-icon{display:inline-flex;vertical-align:-3px;margin-right:4px;color:inherit}#${APP_ID} .nsit-field-icon svg,#${APP_ID} .nsit-value-heading-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}#${APP_ID} .nsit-field--askingPrice .nsit-field-icon,#${APP_ID} .nsit-field--askingPrice .nsit-field-icon svg{color:var(--nsit-ok)}#${APP_ID} .nsit-field--askingPremium .nsit-field-icon,#${APP_ID} .nsit-field--askingPremium .nsit-field-icon svg{color:var(--nsit-danger)}#${APP_ID} .nsit-value-heading-icon{display:inline-block;margin-right:4px;vertical-align:-3px}#${APP_ID} .nsit-contact-post-remarks{display:grid;gap:10px}#${APP_ID} .nsit-value-result{align-items:flex-end}#${APP_ID} .nsit-value-result .nsit-price-preview{align-self:flex-end}#${APP_ID} .nsit-price-typing{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px;animation:nsit-type-in .24s steps(12,end)}@keyframes nsit-type-in{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes nsit-progress-slide{from{width:0;opacity:0;transform:translateX(-8px)}to{width:62px;opacity:1;transform:translateX(0)}}#${APP_ID} .nsit-title-progress.is-visible{animation:nsit-progress-slide .32s ease-out}#${APP_ID} .nsit-vendor-picker input{padding-left:34px}#${APP_ID} .nsit-vendor-input-icon{position:absolute;z-index:2;top:50%;left:9px;transform:translateY(-50%)}#${APP_ID} .nsit-vendor-icon{position:relative;display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:4px;background:var(--nsit-chip);color:var(--nsit-ink-soft-3);font-size:11px;font-style:normal;overflow:hidden}#${APP_ID} .nsit-vendor-icon img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}#${APP_ID} .nsit-vendor-icon b{font:700 11px/1 sans-serif}#${APP_ID} .nsit-picker-menu [data-nsit-picker-option]{display:flex;align-items:center;gap:7px}
      `;
    const modelSuggestionStyles = `
      #${APP_ID} .nsit-traffic-field{position:relative}#${APP_ID} .nsit-traffic-label{display:flex;align-items:center;justify-content:space-between;gap:6px}#${APP_ID} .nsit-traffic-label-actions{display:flex;align-items:center;gap:4px}#${APP_ID} .nsit-traffic-remaining-trigger{margin:0;padding:0;border:0;background:transparent;color:var(--nsit-ok);font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap}#${APP_ID} .nsit-traffic-remaining-trigger:hover{color:var(--nsit-accent)}#${APP_ID} .nsit-traffic-remaining-trigger:disabled{color:var(--nsit-faint);cursor:not-allowed}#${APP_ID} .nsit-traffic-usage-popover{position:absolute;z-index:50;top:29px;right:0;display:grid;width:250px;gap:9px;border:1px solid var(--nsit-line-strong);border-radius:9px;background:var(--nsit-surface);padding:11px;box-shadow:0 10px 24px var(--nsit-shadow-soft-3);color:var(--nsit-ink-soft)}#${APP_ID} .nsit-traffic-usage-popover label{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:7px;white-space:nowrap;font-size:14px}#${APP_ID} .nsit-traffic-usage-popover label input{min-width:0;padding:5px 7px}#${APP_ID} .nsit-traffic-usage-popover label em{font-style:normal;white-space:nowrap}#${APP_ID} .nsit-traffic-slider-row{display:flex;align-items:center;gap:8px}#${APP_ID} .nsit-traffic-slider-row small{color:var(--nsit-muted);font-size:14px;text-align:right;white-space:nowrap}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]{flex:1;min-width:0;height:6px;margin:4px 0;padding:0;border:0;background:linear-gradient(90deg,var(--nsit-chip-active-soft) 0 var(--nsit-traffic-used-percent,0%),var(--nsit-line) var(--nsit-traffic-used-percent,0%) 100%);accent-color:var(--nsit-chip-active-soft);appearance:none;-webkit-appearance:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]:focus{border:0;box-shadow:none;outline:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-webkit-slider-runnable-track{height:6px;border:0;border-radius:999px;background:transparent}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-webkit-slider-thumb{width:16px;height:16px;margin-top:-5px;border:2px solid var(--nsit-chip-active-soft);border-radius:50%;background:var(--nsit-surface);box-shadow:0 1px 3px var(--nsit-accent-ring-3);-webkit-appearance:none}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-track{height:6px;border:0;border-radius:999px;background:var(--nsit-line)}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-progress{height:6px;border:0;border-radius:999px;background:var(--nsit-chip-active-soft)}#${APP_ID} .nsit-traffic-usage-popover input[type="range"]::-moz-range-thumb{width:16px;height:16px;border:2px solid var(--nsit-chip-active-soft);border-radius:50%;background:var(--nsit-surface);box-shadow:0 1px 3px var(--nsit-accent-ring-3)}#${APP_ID} .nsit-traffic-usage-presets{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}#${APP_ID} .nsit-traffic-usage-presets button{margin:0;padding:3px 0;border-radius:4px;color:var(--nsit-muted-2);font-size:12px}#${APP_ID} .nsit-traffic-usage-presets button:hover{border-color:var(--nsit-accent);background:var(--nsit-accent-soft);color:var(--nsit-accent-ink-2)}
      #${APP_ID} .nsit-model-suggest-menu{right:0;left:auto;width:min(400px,calc(100vw - 32px));max-width:none}
      #${APP_ID} .nsit-model-suggestion{grid-template-columns:minmax(0,1fr) auto}
      #${APP_ID} .nsit-model-suggestion strong{grid-column:1;grid-row:1;min-width:0;overflow:visible;text-overflow:clip}
      #${APP_ID} .nsit-model-suggestion small{grid-column:2;grid-row:1;justify-self:end;max-width:96px;overflow:hidden;text-overflow:ellipsis}
      #${APP_ID} .nsit-model-suggestion span{grid-column:auto;min-width:0;white-space:normal}
      #${APP_ID} .nsit-model-suggestion-vendor{grid-column:1;grid-row:2;color:var(--nsit-ink-soft-3)!important}
      #${APP_ID} .nsit-model-suggestion-spec{grid-column:2;grid-row:2;text-align:right}
      #${APP_ID} .nsit-model-suggestion-network{grid-column:1;grid-row:3;color:var(--nsit-ink-soft-3)!important}
      #${APP_ID} .nsit-model-suggestion-renewal{grid-column:2;grid-row:3;text-align:right}
      #${APP_ID} .nsit-machine-registered{margin-top:auto;border-color:var(--nsit-line-strong-2);background:var(--nsit-registered-soft);color:var(--nsit-ink-soft)}
      #${APP_ID} .nsit-machine-registered .nsit-machine-logo{border-radius:4px 4px 2px 2px;background:var(--nsit-chip-info-soft);color:var(--nsit-chip-info-ink)}
      #${APP_ID} .nsit-registered-machine-configs-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:var(--nsit-scrim)}
      #${APP_ID}.nsit-registered-machine-configs-open .nsit-registered-machine-configs-modal{display:grid;place-items:center}
      #${APP_ID} .nsit-registered-machine-configs-dialog{display:flex;flex-direction:column;width:min(720px,100%);height:620px;max-height:calc(100vh - 40px);overflow:hidden;border:1px solid var(--nsit-line);border-radius:12px;background:var(--nsit-surface);box-shadow:0 20px 60px var(--nsit-shadow-2)}
      #${APP_ID} .nsit-registered-machine-configs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}
      #${APP_ID} .nsit-registered-machine-configs-head h3{font-size:16px}
      #${APP_ID} .nsit-registered-machine-configs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));flex:1;align-content:start;gap:8px;min-height:0;overflow-y:auto;padding:14px 16px}
      #${APP_ID} .nsit-registered-machine-config{display:grid;gap:4px;border:1px solid var(--nsit-line-soft-3);border-radius:8px;background:var(--nsit-sunken);padding:11px 12px}
      #${APP_ID} .nsit-registered-machine-config strong{color:var(--nsit-ink)}
      #${APP_ID} .nsit-registered-machine-config span{color:var(--nsit-ink-soft);font-size:13px;line-height:1.55}
      #${APP_ID} .nsit-registered-machine-config small{color:var(--nsit-faint);font-size:12px}
      @media(max-width:620px){#${APP_ID} .nsit-registered-machine-configs{grid-template-columns:1fr}}
      #${APP_ID} [data-nsit-personal-tags]{display:contents}#${APP_ID} .nsit-personalization-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:var(--nsit-scrim)}#${APP_ID}.nsit-personalization-open .nsit-personalization-modal{display:grid;place-items:center}#${APP_ID} .nsit-personalization-dialog{display:flex;flex-direction:column;width:min(680px,100%);height:720px;max-height:calc(100vh - 40px);overflow:hidden;border:1px solid var(--nsit-line);border-radius:12px;background:var(--nsit-surface);box-shadow:0 20px 60px var(--nsit-shadow-2)}#${APP_ID} .nsit-personalization-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:14px 16px;border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-personalization-head>div{display:flex;align-items:baseline;gap:8px;min-width:0}#${APP_ID} .nsit-personalization-head h3{font-size:16px}#${APP_ID} .nsit-personalization-head small{color:var(--nsit-muted);font-size:12px;white-space:nowrap}#${APP_ID} [data-nsit-personalization-body]{display:flex;flex:1 1 0;min-height:0;overflow:hidden}#${APP_ID} .nsit-personalization-form{display:flex;flex:1 1 0;min-height:0;flex-direction:column;overflow:hidden}#${APP_ID} .nsit-personalization-content{display:grid;flex:1 1 0;gap:16px;min-height:0;overflow:auto;padding:16px}#${APP_ID} .nsit-personalization-form section{display:grid;gap:9px}#${APP_ID} .nsit-setting-label{display:flex;align-items:baseline;gap:8px}#${APP_ID} .nsit-personalization-form h4{margin:0;white-space:nowrap;font-size:14px}#${APP_ID} .nsit-personalization-form p{margin:0;color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-setting-checks{display:flex;flex-wrap:wrap;gap:8px 12px}#${APP_ID} .nsit-setting-checks label{display:flex;align-items:center;gap:5px;color:var(--nsit-ink-soft)}#${APP_ID} .nsit-setting-checks input{width:15px;height:15px;margin:0;accent-color:var(--nsit-accent)}#${APP_ID} .nsit-personalization-tags{align-items:center}#${APP_ID} .nsit-custom-tag-entry{display:inline-flex;gap:0}#${APP_ID} .nsit-custom-tag-entry input{width:100px;min-width:100px;height:32px;border-radius:999px 0 0 999px;padding:5px 8px;font-size:13px}#${APP_ID} .nsit-custom-tag-entry button{height:32px;margin-left:-1px;border-radius:0 999px 999px 0;padding:5px 8px;font-size:13px}#${APP_ID} .nsit-custom-tag-list{display:contents}#${APP_ID} .nsit-custom-tag{position:relative;display:inline-flex;align-items:center;border:1px solid var(--nsit-warn);border-radius:999px;background:var(--nsit-tag-payment-soft);padding:4px 20px 4px 9px;color:var(--nsit-tag-payment-ink);font-size:13px}#${APP_ID} .nsit-custom-tag button{position:absolute;top:-5px;right:-5px;display:grid;place-items:center;width:15px;height:15px;margin:0;padding:0;border:1px solid var(--nsit-line-strong);border-radius:50%;background:var(--nsit-surface);color:var(--nsit-muted);font-size:13px;line-height:1}#${APP_ID} .nsit-custom-tag button:hover{border-color:var(--nsit-danger);color:var(--nsit-danger)}#${APP_ID} .nsit-title-preview{border:1px solid var(--nsit-accent-line);border-radius:6px;background:var(--nsit-accent-soft-2);padding:7px 9px;color:var(--nsit-accent-ink-5);font-size:13px}#${APP_ID} .nsit-transfer-box{display:grid;grid-template-columns:1fr 1fr;gap:10px}#${APP_ID} .nsit-title-field-order{display:grid;align-content:start;gap:5px;min-height:180px;max-height:270px;margin:0;padding:8px;overflow:auto;border:1px solid var(--nsit-line-soft-3);border-radius:7px;list-style:none}#${APP_ID} .nsit-title-field-order::before{color:var(--nsit-faint);font-size:12px;font-weight:600}#${APP_ID} [data-nsit-title-field-available]::before{content:"所有字段"}#${APP_ID} [data-nsit-title-field-order]::before{content:"已选字段"}#${APP_ID} .nsit-title-field-order li{display:flex;align-items:center;gap:4px;border:1px solid var(--nsit-line-soft-3);border-radius:6px;padding:5px 7px;color:var(--nsit-ink-soft)}#${APP_ID} .nsit-title-field-order li span{margin-right:auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${APP_ID} .nsit-title-field-order button{padding:1px 5px;font-size:13px}#${APP_ID} [data-nsit-title-field-available] [data-action="remove-title-field"],#${APP_ID} [data-nsit-title-field-available] [data-action="move-title-field"],#${APP_ID} [data-nsit-title-field-order] [data-action="add-title-field"]{display:none}#${APP_ID} .nsit-value-card-style-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}#${APP_ID} .nsit-value-card-style{position:relative;display:block;min-width:0;cursor:pointer}#${APP_ID} .nsit-value-card-style>input{position:absolute;opacity:0;pointer-events:none}#${APP_ID} .nsit-value-card-style-preview{position:relative;display:block;overflow:hidden;aspect-ratio:2.18;border:2px solid var(--nsit-line-strong);border-radius:8px;background:var(--nsit-preview-bg);box-shadow:0 1px 2px var(--nsit-shadow-soft-4);transition:border-color .15s ease,box-shadow .15s ease}#${APP_ID} .nsit-value-card-style-preview>img{display:block;width:100%;height:100%;object-fit:cover}#${APP_ID} .nsit-value-card-style-preview>strong{position:absolute;right:6px;bottom:6px;padding:2px 6px;border-radius:4px;background:var(--nsit-surface-3);color:#fff;font-size:11px;line-height:1.35}#${APP_ID} .nsit-value-card-style>input:checked+.nsit-value-card-style-preview{border-color:var(--nsit-accent);box-shadow:0 0 0 3px var(--nsit-accent-ring-2)}#${APP_ID} .nsit-value-card-style>input:checked+.nsit-value-card-style-preview::after{position:absolute;top:5px;right:5px;display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--nsit-accent);color:#fff;content:"✓";font-size:12px;font-weight:800}#${APP_ID} .nsit-personalization-form footer{display:flex;justify-content:flex-end;gap:8px;flex:none;padding:12px 16px;border-top:1px solid var(--nsit-line);background:var(--nsit-surface)}
        #${APP_ID} .nsit-value-card-custom-empty{display:grid;width:100%;height:100%;place-items:center;background:linear-gradient(135deg,var(--nsit-custom-from),var(--nsit-custom-to));color:var(--nsit-muted);font-size:12px}#${APP_ID} .nsit-value-card-upload{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px;color:var(--nsit-ink-soft);font-size:13px}#${APP_ID} .nsit-value-card-upload input{min-width:0;padding:5px}#${APP_ID} .nsit-value-card-upload small{grid-column:1/-1;color:var(--nsit-muted);font-size:12px}
        #${APP_ID} .nsit-body{position:relative}#${APP_ID} .nsit-inline-catalog{position:absolute;z-index:60;top:0;bottom:0;left:0;display:flex;flex-direction:column;width:320px;overflow:hidden;border-right:1px solid var(--nsit-line);background:var(--nsit-surface);box-shadow:8px 0 20px var(--nsit-shadow-soft);transform:translateX(-101%);transition:transform .22s ease}#${APP_ID} .nsit-inline-catalog-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex:none;padding:8px 14px;border-bottom:1px solid var(--nsit-line);background:linear-gradient(110deg,var(--nsit-head-from),var(--nsit-accent-soft))}#${APP_ID} .nsit-inline-catalog-head h3{font-size:15px}#${APP_ID} .nsit-inline-catalog-close{display:none}#${APP_ID}.nsit-machine-catalog-ready.nsit-inline-catalog-open .nsit-inline-catalog-close{display:grid}#${APP_ID} .nsit-inline-catalog-search{display:block;flex:none;padding:12px 14px 8px}#${APP_ID} .nsit-inline-catalog-search input{padding:8px 9px}#${APP_ID} .nsit-inline-catalog-results{display:grid;align-content:start;gap:7px;min-height:0;overflow:auto;padding:6px 10px 12px}#${APP_ID} .nsit-inline-catalog-result{display:grid;width:100%;gap:4px;margin:0;padding:10px;border-color:var(--nsit-line-soft-3);background:var(--nsit-surface);text-align:left}#${APP_ID} .nsit-inline-catalog-result:hover{background:var(--nsit-accent-soft)}#${APP_ID} .nsit-inline-catalog-result strong{color:var(--nsit-ink)}#${APP_ID} .nsit-inline-catalog-result span{color:var(--nsit-ink-soft);font-size:12px;line-height:1.5}#${APP_ID} .nsit-inline-catalog-result .nsit-inline-catalog-spec{display:flex;align-items:center;gap:8px;min-width:0}#${APP_ID} .nsit-inline-catalog-spec>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${APP_ID} .nsit-inline-catalog-result small{flex:none;margin-left:auto;color:var(--nsit-faint);font-size:12px;white-space:nowrap}#${APP_ID} .nsit-catalog-drawer-toggle{position:absolute;z-index:4;top:50%;left:-32px;display:none;width:32px;height:52px;margin:0;padding:5px;transform:translateY(-50%);border-radius:8px 0 0 8px;background:var(--nsit-surface);box-shadow:-3px 4px 12px var(--nsit-shadow-soft-2)}#${APP_ID} .nsit-catalog-drawer-toggle svg{display:block;width:22px;height:22px}#${APP_ID}.nsit-inline-catalog-open .nsit-inline-catalog{transform:translateX(0)}#${APP_ID}.nsit-machine-catalog-ready:not(.nsit-inline-catalog-open) .nsit-catalog-drawer-toggle{display:grid;place-items:center}#${APP_ID}.nsit-catalog-required .nsit-side{display:none}#${APP_ID}.nsit-catalog-required .nsit-form{grid-column:1/-1}#${APP_ID}.nsit-catalog-required .nsit-inline-catalog{transform:translateX(0)}#${APP_ID}.nsit-catalog-required .nsit-catalog-drawer-toggle{display:none}@media(max-width:820px){#${APP_ID} .nsit-inline-catalog{width:min(320px,88vw)}}
        #${APP_ID}.nsit-catalog-required .nsit-body{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(0,1.65fr)}#${APP_ID}.nsit-catalog-required .nsit-inline-catalog{position:relative;z-index:0;top:auto;bottom:auto;left:auto;width:auto;min-height:0;box-shadow:none;transform:none}#${APP_ID}.nsit-catalog-required .nsit-inline-catalog-results{flex:1}#${APP_ID}.nsit-catalog-required .nsit-form{grid-column:auto}@media(max-width:640px){#${APP_ID}.nsit-catalog-required .nsit-body{grid-template-columns:minmax(190px,.8fr) minmax(0,1.2fr)}}
        #${APP_ID} .nsit-catalog-drawer-toggle{display:none!important}#${APP_ID} .nsit-vendor-label{display:flex;align-items:center;justify-content:space-between;gap:8px}#${APP_ID} .nsit-machine-catalog-trigger{display:none;align-items:center;gap:4px;margin:-4px 0;padding:2px 5px;border:0;background:transparent;color:var(--nsit-muted);font-size:12px;line-height:18px;white-space:nowrap}#${APP_ID} .nsit-machine-catalog-trigger svg{width:18px;height:18px;flex:none}#${APP_ID} .nsit-machine-catalog-trigger:hover{background:var(--nsit-accent-soft);color:var(--nsit-accent-ink-2)}#${APP_ID}.nsit-machine-catalog-ready:not(.nsit-inline-catalog-open) .nsit-machine-catalog-trigger{display:inline-flex}
        #${APP_ID} .nsit-buy-form>.nsit-section:first-child{border-bottom:1px solid var(--nsit-line)}#${APP_ID} .nsit-buy-personalization-modal{display:none;position:fixed;z-index:2147483647;inset:0;padding:20px;background:var(--nsit-scrim)}#${APP_ID}.nsit-buy-personalization-open .nsit-buy-personalization-modal{display:grid;place-items:center}
        #${APP_ID} .nsit-buy-shell{width:min(1180px,100%)}#${APP_ID} .nsit-buy-body{grid-template-columns:260px minmax(0,1fr)}#${APP_ID} .nsit-buy-form{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(240px,.85fr);min-height:0;overflow:hidden;padding:0}#${APP_ID} .nsit-buy-main,#${APP_ID} .nsit-buy-side{min-width:0;min-height:0;overflow:auto;padding:0 18px 12px;box-shadow:inset 0 7px 9px -12px var(--nsit-shadow-soft-7)}#${APP_ID} .nsit-buy-side{border-left:1px solid var(--nsit-line);background:var(--nsit-sunken)}#${APP_ID} .nsit-buy-side .nsit-buy-contact-grid{grid-template-columns:1fr}#${APP_ID} .nsit-buy-side .nsit-buy-tags-field{grid-column:auto}#${APP_ID} .nsit-buy-main .nsit-buy-price-options{grid-template-columns:repeat(2,minmax(0,1fr))}#${APP_ID} .nsit-buy-main .nsit-currency-picker{width:132px}#${APP_ID} [data-nsit-buy-personalization-body]{display:flex;flex:1 1 0;min-height:0;overflow:hidden}#${APP_ID} [data-nsit-buy-personalization-body] .nsit-personalization-content{align-content:start;grid-auto-rows:max-content}#${APP_ID} [data-nsit-buy-personalization-body] .nsit-title-field-order{min-height:240px;max-height:330px}@media(max-width:760px){#${APP_ID} .nsit-buy-form{grid-template-columns:1fr;overflow:visible}#${APP_ID} .nsit-buy-main,#${APP_ID} .nsit-buy-side{overflow:visible}#${APP_ID} .nsit-buy-side{border-top:1px solid var(--nsit-line);border-left:0}}
    `;
    injectStyles(`${styles}\n${modelSuggestionStyles}\n#${APP_ID} .nsit-buy-shell{--nsit-accent:var(--nsit-info)}#${APP_ID} .nsit-buy-shell .nsit-head{background:linear-gradient(110deg,var(--nsit-head-from-2),var(--nsit-info-soft))}#${APP_ID} .nsit-buy-shell .nsit-star-note a,#${APP_ID} .nsit-buy-shell .nsit-personalization-trigger{color:var(--nsit-info)}#${APP_ID} .nsit-buy-shell .nsit-personalization-trigger:hover{background:var(--nsit-info-soft);color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-shell button:hover{border-color:var(--nsit-info);color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-shell button.nsit-primary,#${APP_ID} .nsit-buy-shell button.nsit-primary:hover{border-color:var(--nsit-info);background:var(--nsit-info);color:var(--nsit-on-accent)}#${APP_ID} .nsit-buy-shell button.nsit-primary:hover{background:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-shell input:not([type="radio"]):focus,#${APP_ID} .nsit-buy-shell textarea:focus{border-color:var(--nsit-info);box-shadow:0 0 0 3px var(--nsit-info-ring)}#${APP_ID} .nsit-buy-personalization-modal{--nsit-accent:var(--nsit-info)}#${APP_ID} .nsit-buy-personalization-modal button:hover{border-color:var(--nsit-info);color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-personalization-modal button.nsit-primary{border-color:var(--nsit-info);background:var(--nsit-info);color:var(--nsit-on-accent)}#${APP_ID} .nsit-buy-personalization-modal button.nsit-primary:hover{background:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-personalization-modal input:focus{border-color:var(--nsit-info);box-shadow:0 0 0 3px var(--nsit-info-ring)}#${APP_ID} .nsit-buy-personalization-modal .nsit-title-preview{border-color:var(--nsit-info-line-2);background:var(--nsit-info-soft);color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-personalization-modal .nsit-tag--transfer input:checked+span{border-color:var(--nsit-tag-transfer-line);background:var(--nsit-tag-transfer-soft);color:var(--nsit-tag-transfer-ink)}#${APP_ID} .nsit-buy-price-option{justify-self:start;background:transparent!important;text-align:left}#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked){background:transparent!important;color:var(--nsit-info-ink)}#${APP_ID} .nsit-buy-price{gap:5px}#${APP_ID} .nsit-buy-price-option input[type="radio"]{appearance:auto;width:15px;height:15px;border:initial;border-radius:initial;background:initial;accent-color:var(--nsit-info);box-shadow:none}#${APP_ID} .nsit-buy-price-option input[type="radio"]:checked{background:initial}#${APP_ID} .nsit-buy-price-option input[name^="buyPriceValue-"]{height:30px;border:0;border-bottom:1px solid var(--nsit-knob-off);border-radius:0;background:transparent;box-shadow:none;font-size:14px}#${APP_ID} .nsit-buy-price-option>span,#${APP_ID} .nsit-buy-price-option>em{display:flex;align-items:center;height:30px;line-height:30px}#${APP_ID} .nsit-buy-price-option input[name^="buyPriceValue-"]::placeholder{font-size:14px}#${APP_ID} .nsit-buy-price-option input[name^="buyPriceValue-"]:focus{border:0;border-bottom:1px solid var(--nsit-info);box-shadow:none}#${APP_ID} .nsit-buy-price-option input[type="radio"]:focus{outline:0;box-shadow:none}#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked)>span,#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked)>em,#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked) input[name^="buyPriceValue-"]{color:var(--nsit-info-ink);background:transparent;box-shadow:none}#${APP_ID} .nsit-buy-price-option:has(input[type="radio"]:checked) input[name^="buyPriceValue-"]{border:0;border-bottom:1px solid var(--nsit-info)}#${APP_ID} .nsit-buy-contact-grid{grid-template-columns:repeat(4,minmax(0,1fr))}#${APP_ID} .nsit-buy-tags-field{grid-column:span 3}#${APP_ID} .nsit-buy-catalog>label{margin:6px 0;padding:0 10px}#${APP_ID} .nsit-buy-contact-grid+.nsit-buy-grid{margin-top:10px}#${APP_ID} .nsit-buy-shell .nsit-actions{margin-left:auto}`);
    injectStyles(`.message-input .mde-toolbar>#${APP_ID} .nsit-trigger{align-self:center;flex:none;margin:0 4px 0 0;white-space:nowrap}.message-input .mde-toolbar>#${APP_ID} .nsit-trigger:first-child{margin-left:auto}`);
    injectStyles(`#${APP_ID} .nsit-tag--contact input:checked+span{border-color:var(--nsit-tag-contact-line);background:var(--nsit-tag-contact-soft);color:var(--nsit-tag-contact-ink)}`);
    app.innerHTML = `
      <button type="button" class="nsit-trigger" aria-haspopup="dialog">出🐔模板</button>
      ${buyTemplateMarkup()}
      <div class="nsit-modal" aria-hidden="true">
      <div class="nsit-dialog-wrap">
        ${machineTabsMarkup()}
      <div class="nsit-shell" role="dialog" aria-modal="true" aria-label="${replyMode ? '回帖出鸡模板' : '单机转让帖模板'}">
        <header class="nsit-head"><div class="nsit-head-copy"><h2>${replyMode ? '回帖出鸡' : '出鸡'}</h2>${starNoteMarkup()}</div><div><button type="button" class="nsit-personalization-trigger" data-action="open-personalization"><svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M204.060444 555.463111c-14.506667 1.763556-26.225778 15.473778-27.761777 32.540445-2.104889 23.324444 14.620444 43.064889 34.702222 40.618666 14.449778-1.763556 26.168889-15.530667 27.761778-32.654222 2.048-23.324444-14.791111-42.951111-34.702223-40.504889zM265.102222 495.388444c21.845333-2.275556 39.480889-22.926222 41.472-48.583111 2.503111-33.507556-21.219556-61.44-49.777778-58.368-21.788444 2.275556-39.424 22.869333-41.415111 48.583111-2.616889 33.336889 21.219556 61.269333 49.720889 58.368zM415.687111 252.586667c-28.501333 2.104889-51.655111 29.240889-53.475555 62.691555-2.161778 40.448 26.453333 74.069333 60.984888 71.452445 28.558222-2.104889 51.655111-29.240889 53.475556-62.691556 2.104889-40.618667-26.453333-74.069333-60.984889-71.452444z m206.336-15.36c-35.100444 2.56-63.431111 35.84-65.649778 76.970666-2.730667 49.777778 32.426667 91.079111 74.865778 87.779556 35.157333-2.56 63.488-35.896889 65.706667-76.970667 2.787556-49.777778-32.369778-91.022222-74.922667-87.779555zM967.111111 263.793778a35.441778 0 0 0-9.841778-23.04l-0.682666-0.682667a26.510222 26.510222 0 0 0-18.773334-8.192 26.908444 26.908444 0 0 0-21.617777 11.605333l-342.072889 461.653334-43.52 100.352 1.137777 1.024-4.949333 13.312 11.093333-6.940445 1.536 1.536 78.051556-63.715555 342.698667-462.506667a37.603556 37.603556 0 0 0 6.940444-24.462222z m-68.835555 234.609778c-13.767111-1.649778-26.737778 8.704-30.378667 24.291555-6.940444 28.899556-19.342222 75.719111-35.157333 114.801778-22.812444 56.604444-64.967111 135.395556-135.736889 189.212444-72.248889 55.068444-142.904889 66.56-189.44 66.56-37.034667 0-72.248889-7.168-101.831111-20.764444-26.908444-12.344889-46.421333-28.899556-54.954667-46.648889-3.413333-7.111111-7.224889-15.075556-11.207111-23.665778-17.237333-36.522667-36.636444-78.051556-49.777778-90.851555-15.928889-15.473778-39.139556-17.635556-59.847111-17.635556-8.135111 0-40.846222 1.536-48.583111 1.536-33.109333 0-49.493333-7.623111-56.149334-26.282667-17.806222-49.607111-7.281778-134.144 26.851556-215.267555C204.8 328.362667 299.747556 236.657778 412.444444 202.24c40.049778-12.401778 81.294222-22.186667 121.457778-22.186667 85.674667 0 188.017778 38.570667 252.757334 90.680889 11.377778 9.102222 26.965333 6.826667 35.783111-5.802666 10.410667-14.791111 7.111111-36.807111-6.826667-46.648889-23.324444-16.497778-58.026667-39.936-86.414222-55.296A392.931556 392.931556 0 0 0 539.875556 113.777778c-68.152889 0-148.935111 19.228444-217.429334 55.409778-78.222222 41.073778-135.395556 99.783111-179.598222 173.112888-36.408889 60.302222-67.868444 130.389333-80.213333 197.973334-7.509333 41.244444-6.826667 67.413333-2.389334 103.082666 4.209778 34.304 13.425778 61.667556 26.908445 79.246223 22.414222 29.468444 51.598222 43.918222 89.144889 43.918222 13.880889 0 56.32-5.859556 63.146666-5.859556 7.395556 0 12.231111 1.365333 14.392889 4.437334 6.428444 8.704 14.449778 26.282667 23.779556 46.819555 7.509333 16.554667 15.928889 35.328 25.429333 53.191111 12.060444 22.869333 36.920889 47.445333 66.56 65.592889 27.022222 16.554667 71.964444 36.408889 132.323556 36.408889 72.135111 0 148.48-27.704889 226.986666-82.261333 74.979556-52.110222 123.164444-139.605333 150.357334-203.776 19.057778-44.942222 34.759111-102.4 43.861333-139.832889 4.835556-20.309333-6.997333-40.732444-24.803556-42.837333z"/></svg><span>个性化设置</span></button><i class="nsit-head-divider" aria-hidden="true"></i><button type="button" class="nsit-close" data-action="close" aria-label="关闭表单" title="关闭">×</button></div></header>
        <div class="nsit-body">
          ${inlineMachineCatalogMarkup()}
          <form id="nsit-form" class="nsit-form" novalidate>
            ${basicConfigMarkup()}
            ${valueCardMarkup()}
            ${replyMode ? '' : `<div class="nsit-title-divider" aria-hidden="true"></div>${section('', ['postTitle'], '', 'nsit-post-title')}`}
          </form>
          <aside class="nsit-side">${reportsAndRemarksMarkup()}${transferTagsMarkup()}${contactAndPostRemarksMarkup()}</aside>
        </div>
        <div class="nsit-action-dock"><div class="nsit-toggle-group"><label class="nsit-card-toggle"><input type="checkbox" name="generateCard" checked>生成剩余价值图片</label>${replyMode ? '' : '<label class="nsit-card-toggle nsit-config-check-toggle"><input type="checkbox" name="checkMachineConfig" checked><span>授权检查配置并提示</span><i class="nsit-config-check-help" aria-hidden="true">?</i><span class="nsit-config-check-tooltip" role="tooltip">感谢贡献机器配置，配置包含厂商、型号、CPU、内存、硬盘、带宽、流量、续费周期和续费金额，请确认配置信息准确。出鸡时使用配置将看到贡献者的昵称。</span></label>'}</div><div class="nsit-actions"><button type="button" class="nsit-primary" data-action="fill">${replyMode ? '回填文本模式' : '生成文本模式'}</button><button type="button" data-action="fill-table">${replyMode ? '回填表格模式' : '生成表格模式'}</button><button type="button" data-action="clear">清空表单</button></div><div class="nsit-status" role="status"></div></div>
        <div class="nsit-generation-loading" aria-hidden="true"><div class="nsit-generation-loading-content" role="status" aria-live="polite"><i class="nsit-generation-spinner" aria-hidden="true"></i><span>正在生成，请稍候…</span></div></div>
      </div>
      <button type="button" class="nsit-catalog-drawer-toggle" data-action="toggle-inline-machine-catalog" aria-label="打开机器配置库" title="打开机器配置库"><svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M224.304762 951.398942a290.043034 52.373898 0 1 0 580.086067 0 290.043034 52.373898 0 1 0-580.086067 0Z" fill="#C5C1BD"></path><path d="M404.182011 772.244092h79.102645v155.315696h-79.102645zM472.809877 956.094533h-61.403881c-18.782363 0-34.313933-15.53157-34.313933-34.313933v-12.280776c0-18.782363 15.53157-34.313933 34.313933-34.313933h61.403881c18.782363 0 34.313933 15.53157 34.313933 34.313933v12.280776c0 19.143563-15.53157 34.313933-34.313933 34.313933zM551.551323 772.244092h79.102645v155.315696h-79.102645zM620.179189 956.094533h-61.40388c-18.782363 0-34.313933-15.53157-34.313933-34.313933v-12.280776c0-18.782363 15.53157-34.313933 34.313933-34.313933h61.40388c18.782363 0 34.313933 15.53157 34.313933 34.313933v12.280776c0 19.143563-15.53157 34.313933-34.313933 34.313933z" fill="#EFA124"></path><path d="M131.115344 703.977425l-19.504762-13.725573c-30.340741-21.671958-37.564727-63.932275-15.892769-94.273016L285.347443 328.330159c21.671958-30.340741 63.932275-37.564727 94.273016-15.892769l19.504761 13.725573c30.340741 21.671958 37.564727 63.932275 15.892769 94.273016l-189.990829 267.648677c-20.949559 30.340741-63.571076 37.564727-93.911816 15.892769zM900.469841 703.977425l19.504762-13.725573c30.340741-21.671958 37.564727-63.932275 15.892769-94.273016l-189.990829-267.648677c-21.671958-30.340741-63.932275-37.564727-94.273016-15.892769l-19.504762 13.725573c-30.340741 21.671958-37.564727 63.932275-15.892769 94.273016l189.990829 267.648677c21.310758 30.340741 63.932275 37.564727 94.273016 15.892769z" fill="#F2B121"></path><path d="M832.203175 499.177425c0 202.994004-107.998589 338.804938-315.688184 338.804938-195.047619 0-315.688183-135.810935-315.688183-338.804938S342.416931 103.302998 516.87619 103.302998s315.326984 192.880423 315.326985 395.874427z" fill="#F5D021"></path><path d="M621.623986 403.459612c-28.173545 0-50.929101-28.534744-50.929101-63.571076 0-35.036332 22.755556-63.571076 50.929101-63.571076s50.929101 28.534744 50.9291 63.571076c0.361199 35.036332-22.755556 63.571076-50.9291 63.571076zM409.961199 403.459612c-28.173545 0-50.929101-28.534744-50.9291-63.571076 0-35.036332 22.755556-63.571076 50.9291-63.571076s50.929101 28.534744 50.929101 63.571076c0.361199 35.036332-22.755556 63.571076-50.929101 63.571076z" fill="#1F1204"></path><path d="M514.347795 373.84127c-35.75873 0-65.015873 28.895944-65.015873 67.183069 0 27.089947 29.257143 33.591534 65.015873 33.591534s65.015873-6.862787 65.015873-33.591534c-0.361199-38.648325-29.257143-67.183069-65.015873-67.183069z" fill="#F29D27"></path><path d="M515.070194 443.913933c-24.922751 0-40.454321-9.391182-41.17672-9.752381-4.334392-2.889594-5.779189-8.668783-3.250793-13.003175 2.889594-4.334392 8.668783-5.779189 13.003174-3.250793 1.083598 0.722399 27.812346 15.892769 67.544268-0.722399 4.695591-2.167196 10.47478 0.361199 12.280776 5.05679 2.167196 4.695591-0.361199 10.47478-5.05679 12.280776-16.253968 7.223986-30.70194 9.391182-43.343915 9.391182z" fill="#DA4E2A"></path><path d="M607.898413 81.269841c0-30.340741-24.561552-54.902293-54.902293-54.902292-13.725573 0-26.006349 5.05679-35.75873 13.003174-9.752381-8.307584-22.033157-13.003175-35.75873-13.003174-30.340741 0-54.902293 24.561552-54.902293 54.902292s24.561552 54.902293 54.902293 54.902293c3.973192 0 7.585185-0.361199 11.558377-1.083598v24.922751s88.132628-23.116755 99.691005-40.81552c9.391182-9.752381 15.17037-23.477954 15.170371-37.925926z" fill="#E34227"></path></svg></button>
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
      <div class="nsit-personalization-modal" aria-hidden="true"><section class="nsit-personalization-dialog" role="dialog" aria-modal="true" aria-label="个性化配置"><header class="nsit-personalization-head"><div><h3>个性化配置</h3><small>仅保存到当前浏览器本地</small></div><button type="button" class="nsit-close" data-action="close-personalization" aria-label="关闭个性化配置">×</button></header><div data-nsit-personalization-body></div></section></div>
      <div class="nsit-buy-personalization-modal" aria-hidden="true"><section class="nsit-personalization-dialog" role="dialog" aria-modal="true" aria-label="收鸡个性化配置"><header class="nsit-personalization-head"><div><h3>收鸡个性化配置</h3><small>仅保存到当前浏览器本地</small></div><button type="button" class="nsit-close" data-action="close-buy-personalization" aria-label="关闭收鸡个性化配置">×</button></header><div data-nsit-buy-personalization-body></div></section></div>
      `;
    const personalizationIcon = app.querySelector('[data-action="open-personalization"] svg');
    if (personalizationIcon) personalizationIcon.innerHTML = '<path d="M512 42.666667c123.093333 0 241.962667 43.946667 330.24 123.434666C930.688 245.674667 981.333333 354.645333 981.333333 469.333333a256 256 0 0 1-256 256h-96a32.042667 32.042667 0 0 0-25.6 51.2l12.8 17.066667a117.418667 117.418667 0 0 1-32.213333 170.197333A117.333333 117.333333 0 0 1 522.666667 981.333333H512a469.333333 469.333333 0 1 1 0-938.666666z m0 85.333333a384 384 0 1 0 0 768h10.666667a32.042667 32.042667 0 0 0 25.6-51.2l-12.8-17.066667a117.418667 117.418667 0 0 1 32.213333-170.197333A117.333333 117.333333 0 0 1 629.333333 640H725.333333l8.448-0.213333A170.666667 170.666667 0 0 0 896 469.333333c0-89.002667-39.253333-175.36-110.848-239.829333C713.429333 164.906667 615.253333 128 512 128z m-234.666667 341.333333a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m469.333334-85.333333a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m-384-128a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m213.333333-42.666667a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" fill="currentColor"></path>';
    return app;
  }

  // 「点个 star」提示行：出鸡/收鸡、抽奖配置、抽奖与中奖弹窗共用同一份文案和图标
  function starNoteMarkup() {
    return '<small class="nsit-star-note">如果你觉得有帮助，请给我一个<a href="https://github.com/ruoqianfengshao/nodeseek-issue-template" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 仓库"><svg class="nsit-github-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.337-2.22-.253-4.555-1.11-4.555-4.944 0-1.092.39-1.985 1.029-2.684-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.8c.85.004 1.706.115 2.505.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.684 0 3.843-2.338 4.688-4.566 4.937.359.309.678.92.678 1.854 0 1.338-.012 2.418-.012 2.747 0 .268.18.58.688.482A10.002 10.002 0 0 0 22 12c0-5.523-4.477-10-10-10Z"/></svg></a><a href="https://github.com/ruoqianfengshao/nodeseek-issue-template" target="_blank" rel="noopener noreferrer">小星星</a>，感谢</small>';
  }

  function luckyTriggerMarkup() {
    return '<button type="button" class="nsit-lucky-trigger" data-nsit-lucky-trigger aria-haspopup="dialog" aria-expanded="false"><span aria-hidden="true">🎁</span><b data-nsit-lucky-trigger-label>抽奖配置</b></button>';
  }

  function luckyDialogMarkup() {
    const reply = LUCKY_REPLY_OPTIONS.map(([value, label], index) => `<label class="nsit-lucky-option"><input type="radio" name="luckyReply" value="${value}"${index === 0 ? ' checked' : ''}><span>${escapeHtml(label)}</span></label>`).join('');
    const interactions = LUCKY_INTERACTION_OPTIONS.map(([value, label]) => `<label class="nsit-lucky-option"><input type="checkbox" name="luckyInteraction" value="${value}"><span>${escapeHtml(label)}</span></label>`).join('');
    const positions = LUCKY_POSITION_OPTIONS.map(([value, label], index) => `<label class="nsit-lucky-option"><input type="radio" name="luckyPosition" value="${value}"${index === 0 ? ' checked' : ''}><span>${escapeHtml(label)}</span></label>`).join('');
    return `<div class="nsit-lucky-modal" data-nsit-lucky-modal aria-hidden="true">
      <section class="nsit-lucky-dialog" role="dialog" aria-modal="true" aria-label="抽奖设置">
        <header class="nsit-lucky-head"><div class="nsit-lucky-head-copy"><div class="nsit-lucky-head-title"><h3>抽奖配置</h3>${starNoteMarkup()}</div></div><button type="button" class="nsit-lucky-close" data-nsit-lucky-action="close" aria-label="关闭抽奖配置"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></header>
        <div class="nsit-lucky-body">
          <div class="nsit-lucky-form">
          <section class="nsit-lucky-section">
            <h4>抽奖信息</h4>
            <div class="nsit-lucky-grid nsit-lucky-time-row">
              <label class="nsit-lucky-field"><span class="nsit-lucky-label-row">开奖时间<em class="nsit-lucky-countdown" data-nsit-lucky-countdown></em></span><input type="datetime-local" name="luckyTime" step="60" data-nsit-lucky-time></label>
              <label class="nsit-lucky-field"><span>奖品数量</span><input type="number" name="luckyCount" min="1" step="1" inputmode="numeric" value="1"></label>
              <label class="nsit-lucky-field"><span>起始楼层</span><input type="number" name="luckyStart" min="0" step="1" inputmode="numeric" value="1"></label>
            </div>
            <label class="nsit-lucky-option nsit-lucky-dedupe"><input type="checkbox" name="luckyDedupe" checked><span>楼层去重（同一用户只算一次）</span></label>
          </section>
          <section class="nsit-lucky-section">
            <h4>参与方式</h4>
            <div class="nsit-lucky-group"><span class="nsit-lucky-group-label">回复内容</span><div class="nsit-lucky-options">${reply}</div><input class="nsit-lucky-extra" data-nsit-lucky-reply-text placeholder="回复需要包含的文字" hidden></div>
            <div class="nsit-lucky-group"><span class="nsit-lucky-group-label">互动（与回复是且的关系）</span><div class="nsit-lucky-options">${interactions}</div></div>
            <p class="nsit-lucky-hint">NodeSeek 的抽奖工具仅按楼层计算，点赞、鸡腿和回复内容只能写进说明，需要自行核对</p>
            <label class="nsit-lucky-option nsit-lucky-fallback" hidden><input type="checkbox" data-nsit-lucky-fallback checked><span>不满足条件时顺延至下一位</span></label>
          </section>
          </div>
          <aside class="nsit-lucky-preview-panel">
            <section class="nsit-lucky-panel-block">
              <h4>正文回写</h4>
              <div class="nsit-lucky-grid nsit-lucky-writeback-row">
                <div class="nsit-lucky-field"><span>写入位置</span><div class="nsit-lucky-options">${positions}</div></div>
                <div class="nsit-lucky-field"><span>显示信息</span><div class="nsit-lucky-options"><label class="nsit-lucky-option"><input type="checkbox" data-nsit-lucky-show="participation" checked><span>参与方式</span></label><label class="nsit-lucky-option"><input type="checkbox" data-nsit-lucky-show="time" checked><span>开奖时间</span></label><label class="nsit-lucky-option"><input type="checkbox" data-nsit-lucky-show="count" checked><span>中奖人数</span></label></div></div>
                <label class="nsit-lucky-field nsit-lucky-wide"><span>标题</span><input name="luckyHeading" value="${escapeHtml(LUCKY_DEFAULT_HEADING)}" placeholder="支持 Markdown，留空则不写标题"></label>
              </div>
            </section>
            <section class="nsit-lucky-panel-block">
              <h4>写进正文的内容</h4>
              <pre class="nsit-lucky-preview" data-nsit-lucky-preview></pre>
              <p class="nsit-lucky-hint">预览里的 __POST_ID__ 是占位：保存后整块会插入正文，帖子发布时自动换成真实帖子 ID。</p>
            </section>
          </aside>
        </div>
        <footer class="nsit-lucky-foot">
          <span class="nsit-lucky-foot-hint">只对当前页面这一次发布生效；保存即插入正文，发布后自动替换帖子 ID</span>
          <span class="nsit-lucky-status" data-nsit-lucky-status role="status"></span>
          <button type="button" data-nsit-lucky-action="close">取消</button>
          <button type="button" class="nsit-lucky-primary" data-nsit-lucky-action="save">保存本次抽奖</button>
        </footer>
      </section>
    </div>
    <div class="nsit-lucky-confirm" data-nsit-lucky-confirm>
      <section class="nsit-lucky-dialog nsit-lucky-confirm-dialog" role="dialog" aria-modal="true" aria-label="正文里已有抽奖模板">
        <header class="nsit-lucky-head"><div><h3>抽奖配置冲突</h3></div><button type="button" class="nsit-lucky-close" data-nsit-lucky-action="confirm-cancel" aria-label="关闭确认弹窗"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></header>
        <div class="nsit-lucky-confirm-body"><p>原有抽奖配置被手改动过，请确认生成策略</p></div>
        <footer class="nsit-lucky-foot"><span class="nsit-lucky-status"></span><button type="button" data-nsit-lucky-action="confirm-cancel">取消</button><button type="button" data-nsit-lucky-action="confirm-keep">保留编辑器内容</button><button type="button" class="nsit-lucky-primary" data-nsit-lucky-action="confirm-overwrite">强制覆盖</button></footer>
      </section>
    </div>`;
  }

  function luckyStyles() {
    return `
      .nsit-lucky-trigger{display:inline-flex;align-items:center;gap:4px;margin:0 0 0 8px;padding:3px 8px;border:1px solid var(--nsit-accent);border-radius:5px;background:var(--nsit-accent-soft);color:var(--nsit-accent-ink);font:600 13px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;white-space:nowrap;vertical-align:middle;cursor:pointer}
      .nsit-lucky-trigger:hover{border-color:var(--nsit-accent-hover);background:var(--nsit-accent);color:var(--nsit-on-accent)}
      .nsit-lucky-trigger[data-nsit-lucky-armed]{border-color:var(--nsit-accent);background:var(--nsit-accent);color:var(--nsit-on-accent)}
      .nsit-lucky-trigger[data-nsit-lucky-armed]:hover{border-color:var(--nsit-accent-hover);background:var(--nsit-accent-hover)}
      .nsit-lucky-dialog{display:flex;flex-direction:column;width:min(960px,100%);min-width:0;max-width:100%;max-height:min(660px,92vh);overflow:hidden;border-radius:12px;background:var(--nsit-surface);color:var(--nsit-ink);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 20px 48px var(--nsit-shadow-soft-8)}
      .nsit-lucky-dialog input,.nsit-lucky-dialog pre{max-width:100%}
      .nsit-lucky-close{display:grid;place-items:center;width:28px;height:28px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:var(--nsit-dim);cursor:pointer}
      .nsit-lucky-close:hover{background:var(--nsit-hover-bg);color:var(--nsit-ink)}
      .nsit-lucky-body{display:grid;flex:1 1 auto;min-height:0;overflow:hidden;grid-template-columns:minmax(0,1fr) minmax(320px,1.05fr)}
      .nsit-lucky-form{min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 18px 12px}
      .nsit-lucky-preview-panel{min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 18px;border-left:1px solid var(--nsit-line-soft);background:var(--nsit-sunken)}
      .nsit-lucky-panel-block{padding:12px 0;border-bottom:1px solid var(--nsit-line-soft)}
      .nsit-lucky-panel-block:first-child{padding-top:0}
      .nsit-lucky-panel-block:last-child{padding-bottom:0;border-bottom:0}
      .nsit-lucky-panel-block h4{margin:0 0 8px;font-size:14px}
      .nsit-lucky-section{padding:12px 0;border-bottom:1px solid var(--nsit-line-soft)}
      .nsit-lucky-section:last-of-type{border-bottom:0}
      .nsit-lucky-section h4{margin:0 0 8px;font-size:14px}
      .nsit-lucky-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}
      .nsit-lucky-time-row{grid-template-columns:1.4fr minmax(0,1fr) minmax(0,1fr)}
      .nsit-lucky-writeback-row{grid-template-columns:2fr 3fr}
      .nsit-lucky-wide{grid-column:1/-1}
      .nsit-lucky-field{display:grid;gap:5px;min-width:0}
      .nsit-lucky-field>span,.nsit-lucky-group-label{color:var(--nsit-ink-soft);font-size:14px}
      .nsit-lucky-label-row{display:flex;align-items:baseline;gap:8px;min-width:0}
      /* 剩余时间推到这一行最右边 */
      .nsit-lucky-countdown{margin-left:auto;font-style:normal;color:var(--nsit-accent-ink-5);font-size:12px;white-space:nowrap}
      .nsit-lucky-countdown:empty{display:none}
      .nsit-lucky-dialog input[type="datetime-local"],.nsit-lucky-dialog input[type="number"],.nsit-lucky-dialog input[type="text"],.nsit-lucky-dialog input[type="search"],.nsit-lucky-dialog input:not([type]){width:100%;min-width:0;padding:8px 9px;border:1px solid var(--nsit-line-strong);border-radius:7px;background:var(--nsit-surface);color:var(--nsit-ink);font:inherit;outline:none}
      .nsit-lucky-dialog input:focus{border-color:var(--nsit-accent);box-shadow:0 0 0 3px var(--nsit-accent-ring)}
      .nsit-lucky-options{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px}
      .nsit-lucky-option{display:inline-flex;align-items:center;gap:6px;color:var(--nsit-ink-soft-2);cursor:pointer}
      .nsit-lucky-dialog .nsit-lucky-option input{flex:none;width:15px;height:15px;margin:0;padding:0;border:1px solid var(--nsit-input-line);border-radius:4px;background:var(--nsit-surface);box-shadow:none;outline:none;appearance:none;-webkit-appearance:none;cursor:pointer}
      .nsit-lucky-dialog .nsit-lucky-option input[type="radio"]{border-radius:50%}
      .nsit-lucky-dialog .nsit-lucky-option input:checked{border-color:var(--nsit-accent);outline:none;box-shadow:none}
      .nsit-lucky-dialog .nsit-lucky-option input[type="radio"]:checked{border:5px solid var(--nsit-accent);background:var(--nsit-surface)}
      .nsit-lucky-dialog .nsit-lucky-option input[type="checkbox"]:checked{background:var(--nsit-accent) center/11px 11px no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 6L9 17l-5-5' fill='none' stroke='%23fff' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
      .nsit-lucky-dialog .nsit-lucky-option input:focus,.nsit-lucky-dialog .nsit-lucky-option input:focus-visible,.nsit-lucky-dialog .nsit-lucky-option input:active{outline:none;box-shadow:none}
      .nsit-lucky-option[hidden],.nsit-lucky-extra[hidden]{display:none}
      .nsit-lucky-group{margin-top:10px}
      .nsit-lucky-extra{margin-top:7px}
      .nsit-lucky-dedupe{margin-top:10px}
      .nsit-lucky-fallback{margin-top:10px}
      .nsit-lucky-hint{margin:8px 0 0;color:var(--nsit-muted);font-size:12px;line-height:1.6}
      .nsit-lucky-preview{margin:0;padding:10px 12px;border:1px solid var(--nsit-line-soft-4);border-radius:8px;background:var(--nsit-surface);color:var(--nsit-ink-soft-4);font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-all}
      .nsit-lucky-preview-panel .nsit-lucky-hint{margin-top:8px}
      @media (max-width:760px){.nsit-lucky-dialog{width:min(560px,100%)}.nsit-lucky-body{grid-template-columns:1fr;overflow-y:auto}.nsit-lucky-form,.nsit-lucky-preview-panel{overflow:visible;padding:4px 18px}.nsit-lucky-preview-panel{border-top:1px solid var(--nsit-line-soft);border-left:0;background:transparent}}
      .nsit-lucky-foot{display:flex;align-items:center;gap:8px;padding:12px 18px;border-top:1px solid var(--nsit-line);background:var(--nsit-surface)}
      .nsit-lucky-foot button{margin:0;padding:8px 11px;border:1px solid var(--nsit-line-strong);border-radius:7px;background:var(--nsit-surface);color:var(--nsit-ink-soft-2);font:inherit;cursor:pointer}
      .nsit-lucky-foot button:hover{border-color:var(--nsit-accent);color:var(--nsit-accent-ink-2)}
      .nsit-lucky-foot button.nsit-lucky-primary{border-color:var(--nsit-accent);background:var(--nsit-accent);color:var(--nsit-on-accent)}
      .nsit-lucky-foot button.nsit-lucky-primary:hover{background:var(--nsit-accent-hover-3);border-color:var(--nsit-accent-hover-3)}
      .nsit-lucky-foot .nsit-lucky-status{flex:0 0 auto;color:var(--nsit-danger-ink);font-size:12px}
      .nsit-lucky-foot-hint{flex:1 1 auto;min-width:0;color:var(--nsit-muted);font-size:12px;line-height:1.5}
      .nsit-lucky-notice{position:fixed;z-index:100001;right:18px;bottom:18px;display:none;max-width:min(420px,92vw);padding:12px 14px;border:1px solid var(--nsit-line-strong);border-radius:10px;background:var(--nsit-surface);color:var(--nsit-ink);font:13px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 12px 30px var(--nsit-shadow-soft-9)}
      .nsit-lucky-notice.is-open{display:block}
      .nsit-lucky-notice[data-nsit-lucky-tone="success"]{border-color:var(--nsit-notice-ok-line);background:var(--nsit-notice-ok-bg)}
      .nsit-lucky-notice[data-nsit-lucky-tone="error"]{border-color:var(--nsit-danger-line-3);background:var(--nsit-notice-err-bg)}
      .nsit-lucky-notice p{margin:0}
      .nsit-lucky-notice code{display:block;margin-top:6px;padding:6px 8px;border-radius:6px;background:var(--nsit-inset);color:var(--nsit-ink-soft-4);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
      .nsit-lucky-notice-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
      .nsit-lucky-notice-actions button{margin:0;padding:5px 9px;border:1px solid var(--nsit-line-strong);border-radius:6px;background:var(--nsit-surface);color:var(--nsit-ink-soft-2);font:inherit;font-size:12px;cursor:pointer}
      .nsit-lucky-notice-actions button:hover{border-color:var(--nsit-accent);color:var(--nsit-accent-ink-2)}
      .nsit-lucky-confirm{position:fixed;z-index:100001;inset:0;display:none;align-items:center;justify-content:center;padding:24px;background:var(--nsit-scrim-3)}
      .nsit-lucky-confirm.is-open{display:flex}
      .nsit-lucky-confirm .nsit-lucky-dialog{width:min(460px,100%);max-height:min(440px,84vh)}
      .nsit-lucky-confirm-body{padding:16px 18px 20px;color:var(--nsit-ink-soft);font-size:14px;line-height:1.8}
      .nsit-lucky-confirm-body p{margin:0}
    `;
  }
