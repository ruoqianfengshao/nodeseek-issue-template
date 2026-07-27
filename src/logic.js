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
    syncPriceFields(app); refreshCard(app); refreshPricePreview(app); loadRate(app);
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
    }).join('') + `<button type="button" class="nsit-machine-tab nsit-machine-add" data-action="add-machine"${machineReady(app._nsitMachines[app._nsitActiveMachine]) ? '' : ' disabled'}><i class="nsit-machine-logo">＋</i><span class="nsit-machine-name">添加单机</span></button>`;
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

  function createValueCard(values, app, rate = activeRate(app)) {
    const result = calculation(values);
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
    const basic = [[values.vendor, values.model].filter(Boolean).join(' ') ? `- 厂商&型号：${[values.vendor, values.model].filter(Boolean).join(' ')}` : '', [['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', values.traffic]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，') ? `- 配置：${[['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', values.traffic]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，')}` : ''].filter(Boolean);
    const renewal = [pair('续费周期', values.renewalCycle), values.renewalAmount ? `- 续费金额：${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}（${values.currency}）` : '', pair('到期日期', values.expiryDate), pair('交易日期', values.tradeDate)].filter(Boolean);
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
    const network = [values.bandwidth, values.traffic].filter(Boolean).join('/');
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
    const other = [values.transferTags.length ? `- 转让信息：${values.transferTags.join('、')}` : '', values.tgContact ? `- TG 联系：${values.tgContact}` : '', String(values.remarks || '').trim() ? `- 单机备注：${String(values.remarks).trim()}` : '', String(values.postRemarks || '').trim() ? `- 整贴备注：${String(values.postRemarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cardMarkdown ? `## 剩余价值\n${cardMarkdown}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function textMarkdownForMachines(machines, app, cards, shared) {
    const blocks = machines.map((machine, index) => `## #${index + 1} 鸡\n\n${markdown(machine, cards[index] || '', rateForValues(app, machine))}`);
    const other = [shared.tgContact ? `## 联系方式\n- TG 联系：${shared.tgContact}` : '', String(shared.postRemarks || '').trim() ? `## 整贴备注\n${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
    return [...blocks, ...other].filter(Boolean).join('\n\n---\n\n');
  }

  function tableMarkdownForMachines(machines, app, cards, shared) {
    const rows = machines.map((values, index) => {
      const result = calculation(values);
      const rate = rateForValues(app, values);
      const remaining = result && rate ? `¥${(result.value * rate.rate).toFixed(2)}` : '—';
      const vendorModel = [values.vendor, values.model].filter(Boolean).join(' · ');
      const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
      const network = [values.bandwidth, values.traffic].filter(Boolean).join('/');
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
    const other = [shared.tgContact ? `- TG 联系：${shared.tgContact}` : '', ...notes, String(shared.postRemarks || '').trim() ? `- 整贴备注：${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cards.filter(Boolean).length ? `## 剩余价值\n${cards.filter(Boolean).join('\n\n')}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function saveDraft(app) {
    const values = formValues(app);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
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
      if (match) machine[name] = match[1].trim();
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
      renderMachineTabs(app); refreshCard(app); refreshPricePreview(app); saveDraft(app);
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
    [['vendor', '厂商'], ['model', '型号'], ['cpu', 'CPU'], ['memory', '内存'], ['disk', '硬盘'], ['bandwidth', '带宽'], ['traffic', '流量']].forEach(([name, label]) => setValue(name, valueFromMarkdown(basic, label)));
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
