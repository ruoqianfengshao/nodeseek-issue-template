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
    if (unit) unit.textContent = '（G）';
    if (presets) {
      presets.innerHTML = [0, 25, 50, 75, 100].map((percent) => {
        const value = Math.round(total.gigabytes * percent / 100);
        return `<button type="button" data-nsit-traffic-used-preset="${value}">${percent}%</button>`;
      }).join('');
    }
    const configured = Boolean(String(remaining.value || '').trim());
    trigger.textContent = configured ? `剩余：${remaining.value}` : '剩余 ?';
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
