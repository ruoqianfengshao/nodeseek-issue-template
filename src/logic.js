  function formValues(app) {
    const form = app.querySelector('#nsit-form');
    const values = Object.fromEntries(new FormData(form).entries());
    values.transferTags = Array.from(app.querySelectorAll('[name="transferTags"]:checked'), (input) => input.value);
    return values;
  }

  function personalSettings() {
    const defaults = {
      presetTags: [], customTags: [], titleFields: DEFAULT_TITLE_FIELDS, tgContact: '', postRemarks: '', renewalFields: DEFAULT_RENEWAL_FIELDS, valueCardStyle: 'stardew-spring', customValueCardBackground: '',
    };
    try {
      const saved = JSON.parse(localStorage.getItem(PERSONALIZATION_KEY) || '{}');
      const legacyTgContact = localStorage.getItem(TG_CONTACT_KEY)?.trim() || '';
      return {
        ...defaults,
        ...saved,
        presetTags: Array.isArray(saved.presetTags) ? saved.presetTags.filter((tag) => PRESET_TRANSFER_TAGS.includes(tag)) : defaults.presetTags,
        customTags: Array.isArray(saved.customTags) ? saved.customTags.filter(Boolean) : (Array.isArray(saved.machineTags) ? saved.machineTags.filter(Boolean) : defaults.customTags),
        postRemarks: String(saved.postRemarks || (Array.isArray(saved.remarks) ? saved.remarks.filter(Boolean).join('\n') : saved.remarks) || '').trim(),
        titleFields: Array.isArray(saved.titleFields) ? saved.titleFields.filter((name) => TITLE_FIELD_OPTIONS.some(([value]) => value === name)) : defaults.titleFields,
        renewalFields: Array.isArray(saved.renewalFields) ? saved.renewalFields.filter((name) => DEFAULT_RENEWAL_FIELDS.includes(name)) : defaults.renewalFields,
        valueCardStyle: VALUE_CARD_STYLES.some(([value]) => value === saved.valueCardStyle) ? saved.valueCardStyle : defaults.valueCardStyle,
        customValueCardBackground: typeof saved.customValueCardBackground === 'string' && saved.customValueCardBackground.startsWith('data:image/') ? saved.customValueCardBackground : '',
        tgContact: String(saved.tgContact || legacyTgContact).trim(),
      };
    } catch (_) { return defaults; }
  }

  function savePersonalSettings(settings) {
    localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(settings));
  }

  function compressValueCardBackground(file) {
    return new Promise((resolve, reject) => {
      if (!file?.type.startsWith('image/')) { reject(new Error('请选择图片文件')); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('背景图片读取失败'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('背景图片解析失败'));
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1200; canvas.height = 550;
          const context = canvas.getContext('2d');
          const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
          const width = image.width * scale; const height = image.height * scale;
          context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
          resolve(canvas.toDataURL('image/jpeg', .86));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPersonalization(app) {
    const settings = personalSettings();
    const personalTags = app.querySelector('[data-nsit-personal-tags]');
    const selected = new Set(app._nsitMachines?.[app._nsitActiveMachine]?.transferTags || []);
    const tagMarkup = (tag) => {
      const group = TRANSFER_TAG_GROUPS[tag] || 'extras';
      return `<label class="nsit-tag nsit-tag--${group}"><input type="checkbox" name="transferTags" value="${escapeHtml(tag)}"${TRANSFER_TAG_GROUPS[tag] ? ` data-tag-group="${TRANSFER_TAG_GROUPS[tag]}"` : ''}${selected.has(tag) ? ' checked' : ''}><span>${escapeHtml(tag)}</span></label>`;
    };
    if (personalTags) {
      const baseTags = new Set(Array.from(app.querySelectorAll('.nsit-tag-list > .nsit-tag input'), (input) => input.value));
      personalTags.innerHTML = settings.customTags
        .filter((tag) => !baseTags.has(tag))
        .map(tagMarkup).join('');
    }
  }

  function applyPersonalSettings(app) {
    const settings = personalSettings();
    const tg = app.querySelector('[name="tgContact"]');
    if (tg && settings.tgContact && !tg.value) tg.value = settings.tgContact;
    const postRemarks = app.querySelector('[name="postRemarks"]');
    if (postRemarks && settings.postRemarks && !postRemarks.value) postRemarks.value = settings.postRemarks;
    renderPersonalization(app);
  }

  function personalizationDialogMarkup() {
    const settings = personalSettings();
    const checkboxes = (options, selected, name) => options.map(([value, label]) => `<label><input type="checkbox" name="${name}" value="${value}"${selected.includes(value) ? ' checked' : ''}>${label}</label>`).join('');
    const presetTag = (tag) => {
      const group = TRANSFER_TAG_GROUPS[tag] || 'extras';
      return `<label class="nsit-tag nsit-tag--${group}"><input type="checkbox" name="presetTags" value="${escapeHtml(tag)}"${TRANSFER_TAG_GROUPS[tag] ? ` data-tag-group="${TRANSFER_TAG_GROUPS[tag]}"` : ''}${settings.presetTags.includes(tag) ? ' checked' : ''}><span>${escapeHtml(tag)}</span></label>`;
    };
    const customTag = (tag) => `<span class="nsit-custom-tag" data-nsit-custom-tag="${escapeHtml(tag)}">${escapeHtml(tag)}<button type="button" data-action="remove-custom-tag" aria-label="删除 ${escapeHtml(tag)}">×</button></span>`;
    const titleItem = (value) => {
      const label = TITLE_FIELD_OPTIONS.find(([key]) => key === value)?.[1] || value;
      return `<li data-nsit-title-field="${value}"><span>${escapeHtml(label)}</span><button type="button" data-action="add-title-field" aria-label="加入">＋</button><button type="button" data-action="remove-title-field" aria-label="移除">−</button><button type="button" data-action="move-title-field" data-direction="up" aria-label="上移">↑</button><button type="button" data-action="move-title-field" data-direction="down" aria-label="下移">↓</button></li>`;
    };
    const available = TITLE_FIELD_OPTIONS.map(([value]) => value).filter((value) => !settings.titleFields.includes(value));
    const titlePreview = settings.titleFields.map((value) => TITLE_FIELD_OPTIONS.find(([key]) => key === value)?.[1]).filter(Boolean).join(' · ') || '未选择字段';
    const valueCardStyle = VALUE_CARD_STYLES.map(([value, label]) => {
      const previewSource = value === 'custom' ? settings.customValueCardBackground : VALUE_CARD_BACKGROUNDS[value];
      const preview = previewSource ? `<img src="${previewSource}" alt="${escapeHtml(label)}主题预览">` : '<span class="nsit-value-card-custom-empty">上传背景图</span>';
      return `<label class="nsit-value-card-style"><input type="radio" name="valueCardStyle" value="${value}"${settings.valueCardStyle === value ? ' checked' : ''}><span class="nsit-value-card-style-preview">${preview}<strong>${escapeHtml(label)}</strong></span></label>`;
    }).join('');
    return `<form class="nsit-personalization-form" data-nsit-personalization-form><div class="nsit-personalization-content"><section><div class="nsit-setting-label"><h4>标签设置</h4><p>预置标签可设为新建单机默认勾选；自定义标签仅追加到主表单。</p></div><div class="nsit-tag-list nsit-personalization-tags">${PRESET_TRANSFER_TAGS.map(presetTag).join('')}<span class="nsit-custom-tag-list" data-nsit-custom-tag-list>${settings.customTags.map(customTag).join('')}</span><span class="nsit-custom-tag-entry"><input data-nsit-custom-tag-input placeholder="自定义标签"><button type="button" data-action="add-custom-tag">添加</button></span></div></section><section><div class="nsit-setting-label"><h4>标题字段和顺序</h4><p>左侧所有字段，右侧为已选字段；用按钮移动和排序。</p></div><div class="nsit-title-preview" data-nsit-title-preview>标题预览：${escapeHtml(titlePreview)}</div><div class="nsit-transfer-box"><ol class="nsit-title-field-order" data-nsit-title-field-available>${available.map(titleItem).join('')}</ol><ol class="nsit-title-field-order" data-nsit-title-field-order>${settings.titleFields.map(titleItem).join('')}</ol></div></section><section><div class="nsit-setting-label"><h4>TG 默认配置</h4><p>仅在当前 TG 字段为空时自动填入。</p></div><input name="tgContact" value="${escapeHtml(settings.tgContact)}" placeholder="@username 或 https://t.me/..." autocomplete="off"></section><section><div class="nsit-setting-label"><h4>整贴备注</h4><p>打开空表单时完整自动填入，已有备注不覆盖。</p></div><textarea name="postRemarks" rows="4" placeholder="例如：到期前可协助迁移\n不接受议价">${escapeHtml(settings.postRemarks)}</textarea></section><section><div class="nsit-setting-label"><h4>续费与价值展示</h4><p>仅控制生成内容中的展示，不影响表单填写。</p></div><div class="nsit-setting-checks">${checkboxes(RENEWAL_FIELD_OPTIONS, settings.renewalFields, 'renewalFields')}</div></section><section><div class="nsit-setting-label"><h4>剩余价值图片风格</h4><p>仅影响导出的单张剩余价值图片；自定义背景仅存本机浏览器。</p></div><div class="nsit-value-card-style-grid">${valueCardStyle}</div><label class="nsit-value-card-upload">自定义背景<input type="file" accept="image/*" data-nsit-custom-value-card-background><small>自动缩放压缩至 1200 × 550，上传后选择“自定义背景”即可使用。</small></label></section></div><footer><button type="button" data-action="close-personalization">取消</button><button type="submit" class="nsit-primary">保存配置</button></footer></form>`;
  }

  function refreshTitlePreview(app) {
    const preview = app.querySelector('[data-nsit-title-preview]');
    if (!preview) return;
    const fields = Array.from(app.querySelectorAll('[data-nsit-title-field-order] [data-nsit-title-field]'), (item) => item.querySelector('span')?.textContent).filter(Boolean);
    preview.textContent = `标题预览：${fields.join(' · ') || '未选择字段'}`;
  }

  function openPersonalization(app) {
    app.querySelector('[data-nsit-personalization-body]').innerHTML = personalizationDialogMarkup();
    app.classList.add('nsit-personalization-open');
  }

  function closePersonalization(app) {
    app.classList.remove('nsit-personalization-open');
  }

  function savePersonalizationForm(app) {
    const form = app.querySelector('[data-nsit-personalization-form]');
    if (!form) return;
    const titleFields = Array.from(form.querySelectorAll('[data-nsit-title-field-order] [data-nsit-title-field]'), (item) => item.dataset.nsitTitleField);
    const settings = {
      presetTags: Array.from(form.querySelectorAll('[name="presetTags"]:checked'), (input) => input.value),
      customTags: Array.from(form.querySelectorAll('[data-nsit-custom-tag]'), (item) => item.dataset.nsitCustomTag),
      titleFields,
      tgContact: form.elements.tgContact.value.trim(),
      postRemarks: form.elements.postRemarks.value.trim(),
      renewalFields: Array.from(form.querySelectorAll('[name="renewalFields"]:checked'), (input) => input.value),
      valueCardStyle: form.querySelector('[name="valueCardStyle"]:checked')?.value || 'stardew-spring',
      customValueCardBackground: form.dataset.nsitCustomValueCardBackground || personalSettings().customValueCardBackground,
    };
    savePersonalSettings(settings);
    const tg = app.querySelector('[name="tgContact"]');
    if (tg && settings.tgContact) tg.value = settings.tgContact;
    renderPersonalization(app);
    refreshTitle(app); saveDraft(app); saveActiveMachine(app);
    closePersonalization(app);
    setStatus(app, '个性化配置已保存到本地。');
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
    renderPersonalization(app);
    syncPriceFields(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); loadRate(app);
    syncInlineMachineCatalogState(app);
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
    const machine = machineSnapshot(app);
    const settings = personalSettings();
    if (!machine.transferTags.length) machine.transferTags = settings.presetTags;
    app._nsitMachines = [machine];
    app._nsitActiveMachine = 0;
    app.querySelectorAll('[name="transferTags"]').forEach((control) => { control.checked = machine.transferTags.includes(control.value); });
    renderPersonalization(app);
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
    const settings = personalSettings();
    app._nsitMachines.push({ currency: 'USD 美元', tradeDate: today(), transferTags: settings.presetTags });
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

  function formatTrafficDisplay(value) {
    const gigabytes = trafficInGigabytes(value);
    if (gigabytes === null || gigabytes < 1024) return String(value || '');
    return formatTrafficAmount(gigabytes / 1024, 'T');
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
    trigger.textContent = configured ? `剩余: ${formatTrafficDisplay(remaining.value)}` : '剩余 ?';
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
    return values.remainingTraffic ? `${values.traffic}（剩余：${formatTrafficDisplay(values.remainingTraffic)}）` : values.traffic;
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

  function createStardewValueCard(values, rate, result, askingPrice, style) {
    const cardWidth = 600;
    const cardHeight = 275;
    const canvas = document.createElement('canvas');
    canvas.width = cardWidth * 2; canvas.height = cardHeight * 2;
    const background = new Image();
    const seasonName = { 'stardew-spring': '春', 'stardew-summer': '夏', 'stardew-autumn': '秋', 'stardew-winter': '冬' }[style] || '春';
    const accent = { 'stardew-spring': '#519b48', 'stardew-summer': '#d78d25', 'stardew-autumn': '#b65524', 'stardew-winter': '#5194bd' }[style] || '#519b48';
    const roundedBox = (context, x, y, width, height, radius, fill, stroke = '') => {
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
      if (fill) { context.fillStyle = fill; context.fill(); }
      if (stroke) { context.strokeStyle = stroke; context.lineWidth = 2; context.stroke(); }
    };
    const text = (context, value, x, y, font, color, align = 'left') => {
      context.font = font;
      context.fillStyle = color;
      context.textAlign = align;
      context.fillText(value, x, y);
    };
    return new Promise((resolve, reject) => {
      background.onload = () => {
        const context = canvas.getContext('2d');
        context.scale(2, 2);
        const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
        const cny = result.value * rate.rate;
        const renewal = `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} / ${values.renewalCycle || '—'}`;
        const rateText = values.currency === 'CNY' ? '今日汇率 · 人民币' : `今日汇率 · ${rate.rate.toFixed(4)}`;
        const dateText = `${seasonName} · ${values.tradeDate || '—'}`;
        const progressText = `${result.daysLeft} / ${result.cycleDays} 天 · ${result.percentage.toFixed(1)}%`;
        const filledPixels = Math.max(0, Math.min(10, Math.round(result.percentage / 10)));
        context.drawImage(background, 0, 0, cardWidth, cardHeight);
        context.beginPath(); context.roundRect(1.5, 1.5, 597, 272, 5); context.strokeStyle = '#714321'; context.lineWidth = 3; context.stroke();
        roundedBox(context, 17, 13, 566, 249, 5, 'rgba(255,243,210,.94)', '#70451f');
        context.beginPath(); context.roundRect(19.5, 15.5, 561, 244, 4); context.strokeStyle = 'rgba(255,250,229,.68)'; context.lineWidth = 2; context.stroke();
        context.save();
        context.beginPath(); context.roundRect(19, 15, 562, 245, 4); context.clip();
        context.strokeStyle = 'rgba(130,83,39,.10)'; context.lineWidth = 1;
        for (let y = 31; y < 260; y += 21) { context.beginPath(); context.moveTo(19, y); context.lineTo(581, y); context.stroke(); }
        context.restore();

        roundedBox(context, 30, 27, 132, 22, 6, '#b5d94c', '#518238');
        roundedBox(context, 436, 27, 134, 22, 6, '#b5d94c', '#518238');
        text(context, rateText, 96, 42, `700 12px ${sans}`, '#274f25', 'center');
        text(context, dateText, 503, 42, `700 12px ${sans}`, '#274f25', 'center');

        roundedBox(context, 191, 3, 218, 34, 4, accent, '#73431f');
        context.strokeStyle = 'rgba(255,239,179,.72)'; context.lineWidth = 1; context.strokeRect(194, 6, 212, 28);
        context.fillStyle = '#edcb78'; context.beginPath(); context.arc(198, 9, 2.5, 0, Math.PI * 2); context.fill(); context.beginPath(); context.arc(402, 9, 2.5, 0, Math.PI * 2); context.fill();
        text(context, '剩余价值', 300, 26, `800 17px ${sans}`, '#fff6d7', 'center');

        roundedBox(context, 31, 68, 207, 120, 5, 'rgba(255,248,231,.94)', '#c99444');
        context.beginPath(); context.roundRect(33, 70, 203, 116, 3); context.strokeStyle = '#f6dfac'; context.lineWidth = 2; context.stroke();
        roundedBox(context, 43, 96, 43, 43, 21, '#f4b13a', '#60983e');
        context.beginPath(); context.arc(64.5, 117.5, 17.5, 0, Math.PI * 2); context.strokeStyle = '#ffe37c'; context.lineWidth = 3; context.stroke();
        context.beginPath(); context.ellipse(65, 87, 7, 10, -0.28, 0, Math.PI * 2); context.fillStyle = '#8fca54'; context.fill(); context.strokeStyle = '#4b8a38'; context.lineWidth = 2; context.stroke();
        text(context, '剩余价值', 96, 94, `700 12px ${sans}`, '#876232');
        text(context, `¥${cny.toFixed(2)}`, 96, 126, `800 27px ${sans}`, '#9b5c19');
        text(context, `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} × ${result.daysLeft} 天`, 96, 146, `500 12px ${sans}`, '#80633e');
        text(context, `÷ ${result.cycleDays} 天 = ${currencySymbol(values.currency)}${formatAmount(result.value)}`, 96, 163, `500 12px ${sans}`, '#80633e');

        roundedBox(context, 250, 68, 319, 64, 4, 'rgba(255,250,229,.80)', '#d6ac67');
        context.strokeStyle = '#e0c48e'; context.lineWidth = 1; context.beginPath(); context.moveTo(409.5, 69); context.lineTo(409.5, 131); context.stroke();
        text(context, '续费金额 / 周期', 262, 91, `400 12px ${sans}`, '#8b6b42');
        text(context, renewal, 262, 117, `700 13px ${sans}`, '#365a31');
        text(context, '到期日期', 422, 91, `400 12px ${sans}`, '#8b6b42');
        text(context, values.expiryDate || '—', 422, 117, `700 13px ${sans}`, '#365a31');
        roundedBox(context, 250, 144, 319, 44, 4, '#fff8e6', '#d5aa62');
        text(context, '剩余天数 / 周期', 262, 160, `400 12px ${sans}`, '#8b6b42');
        text(context, progressText, 262, 178, `700 12px ${sans}`, '#2e6b39');
        for (let index = 0; index < 10; index += 1) {
          const x = 447 + index * 12;
          context.fillStyle = index < filledPixels ? accent : '#f1e6c6';
          context.fillRect(x, 169, 10, 8);
          context.strokeStyle = index < filledPixels ? '#2e7331' : '#b89b67'; context.lineWidth = 1; context.strokeRect(x + .5, 169.5, 9, 7);
        }

        let previewTop = '未填写预出价格';
        let previewBottom = '填写总价或溢价后显示预览';
        let previewColor = '#718096';
        if (Number.isFinite(askingPrice) && askingPrice >= 0) {
          if (cny === 0) { previewTop = `溢价 ¥${askingPrice.toFixed(2)}`; previewBottom = '剩余价值为 0'; previewColor = '#c04444'; }
          else if (askingPrice > cny) { previewTop = `溢价 ¥${(askingPrice - cny).toFixed(2)}`; previewBottom = `总价 ¥${askingPrice.toFixed(2)} − 剩余价值 ¥${cny.toFixed(2)}`; previewColor = '#c04444'; }
          else if (askingPrice === cny) { previewTop = '剩余价值出'; previewBottom = `总价 ¥${askingPrice.toFixed(2)}`; previewColor = '#27834a'; }
          else { previewTop = `${(askingPrice / cny * 10).toFixed(1)} 折`; previewBottom = `总价 ¥${askingPrice.toFixed(2)} ÷ 剩余价值 ¥${cny.toFixed(2)}`; previewColor = '#27834a'; }
        }
        roundedBox(context, 31, 200, 538, 43, 5, '#f2d681', '#a6702a');
        context.beginPath(); context.roundRect(33, 202, 534, 39, 3); context.strokeStyle = '#ffe8a8'; context.lineWidth = 2; context.stroke();
        roundedBox(context, 42, 208, 29, 29, 15, '#f3b632', '#966326');
        text(context, '¥', 56.5, 230, `800 16px Georgia`, '#8b5520', 'center');
        text(context, '价格预览', 82, 228, `700 12px ${sans}`, '#7c4b20');
        context.font = `800 20px ${sans}`;
        const previewTopWidth = context.measureText(previewTop).width;
        text(context, previewTop, 140, 232, `800 20px ${sans}`, previewColor);
        text(context, previewBottom, Math.min(558, 148 + previewTopWidth), 229, `500 12px ${sans}`, '#89633a');
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('卡片生成失败')), 'image/png');
      };
      background.onerror = () => reject(new Error('卡片背景加载失败'));
      background.crossOrigin = 'anonymous';
      background.src = VALUE_CARD_BACKGROUNDS[style];
    });
  }

  function createCustomValueCard(values, rate, result, askingPrice, backgroundSource) {
    const cardWidth = 600;
    const cardHeight = 275;
    const canvas = document.createElement('canvas');
    canvas.width = cardWidth * 2; canvas.height = cardHeight * 2;
    const background = new Image();
    const box = (context, x, y, width, height, radius, fill, stroke = '') => {
      context.beginPath(); context.roundRect(x, y, width, height, radius);
      if (fill) { context.fillStyle = fill; context.fill(); }
      if (stroke) { context.strokeStyle = stroke; context.lineWidth = 1; context.stroke(); }
      if (fill) {
        context.save(); context.beginPath(); context.roundRect(x + 1, y + 1, width - 2, height - 2, Math.max(0, radius - 1)); context.clip();
        const highlight = context.createLinearGradient(0, y, 0, y + 12); highlight.addColorStop(0, 'rgba(255,255,255,.24)'); highlight.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = highlight; context.fillRect(x + 1, y + 1, width - 2, 12); context.restore();
      }
    };
    const text = (context, value, x, y, font, color, align = 'left', shadow = '') => {
      context.save(); context.font = font; context.fillStyle = color; context.textAlign = align;
      if (shadow) { context.shadowColor = shadow; context.shadowBlur = 2; context.shadowOffsetY = 1; }
      context.fillText(value, x, y); context.restore();
    };
    return new Promise((resolve, reject) => {
      background.onload = () => {
        const context = canvas.getContext('2d');
        context.scale(2, 2);
        const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
        const cny = result.value * rate.rate;
        const renewal = `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} / ${values.renewalCycle || '—'}`;
        const rateText = values.currency === 'CNY' ? '人民币计价' : `$1 = ¥${rate.rate.toFixed(5)}`;
        let preview = '未填写预出价格'; let previewColor = '#ff95ca';
        if (Number.isFinite(askingPrice) && askingPrice >= 0) {
          if (cny === 0) preview = `溢价 ¥${askingPrice.toFixed(2)}`;
          else if (askingPrice > cny) preview = `溢价 ¥${(askingPrice - cny).toFixed(2)}`;
          else if (askingPrice === cny) { preview = '剩余价值出'; previewColor = '#91ffb2'; }
          else { preview = `${(askingPrice / cny * 10).toFixed(1)} 折`; previewColor = '#91ffb2'; }
        }
        const backdrop = document.createElement('canvas'); backdrop.width = cardWidth * 2; backdrop.height = cardHeight * 2;
        const backdropContext = backdrop.getContext('2d');
        backdropContext.scale(2, 2);
        backdropContext.save(); backdropContext.beginPath(); backdropContext.roundRect(0, 0, 600, 275, 24); backdropContext.clip();
        backdropContext.filter = 'brightness(1.04) saturate(1.05)'; backdropContext.drawImage(background, -6, -3, 612, 281); backdropContext.filter = 'none';
        const shade = backdropContext.createLinearGradient(0, 0, 600, 275);
        shade.addColorStop(0, 'rgba(72,192,255,.08)'); shade.addColorStop(.48, 'rgba(255,255,255,.03)'); shade.addColorStop(1, 'rgba(255,182,127,.08)');
        backdropContext.fillStyle = shade; backdropContext.fillRect(0, 0, 600, 275); backdropContext.restore();
        context.save(); context.beginPath(); context.roundRect(0, 0, 600, 275, 24); context.clip();
        context.drawImage(backdrop, 0, 0, cardWidth, cardHeight);
        context.filter = 'blur(4px) saturate(160%)'; context.drawImage(backdrop, 0, 0, cardWidth, cardHeight); context.filter = 'none';
        context.fillStyle = 'rgba(255,255,255,.10)'; context.fillRect(0, 0, 600, 275);
        const top = context.createLinearGradient(0, 0, 600, 0); top.addColorStop(0, '#83e7ff'); top.addColorStop(.48, '#fff19a'); top.addColorStop(1, '#ffb3d5'); context.fillStyle = top; context.fillRect(0, 0, 600, 4);
        context.restore();
        context.beginPath(); context.roundRect(.5, .5, 599, 274, 24); context.strokeStyle = 'rgba(255,255,255,.56)'; context.stroke();
        text(context, '剩余价值', 24, 32, `800 14px ${sans}`, '#fff', 'left', 'rgba(7,42,67,.58)');
        text(context, `¥${cny.toFixed(2)}`, 24, 65, `800 30px ${sans}`, '#fff36b', 'left', 'rgba(80,50,0,.58)');
        text(context, '价值计算日期', 576, 29, `700 12px ${sans}`, '#fff', 'right', 'rgba(7,42,67,.58)');
        text(context, values.tradeDate || '—', 576, 51, `700 14px ${sans}`, '#7eeaff', 'right', 'rgba(0,67,93,.68)');
        const cards = [
          ['续费金额 / 周期', renewal, '#fff069'],
          ['到期日期', values.expiryDate || '—', '#73eaff'],
          ['剩余天数', `${result.daysLeft} 天`, '#91ffb2'],
        ];
        cards.forEach(([label, value, color], index) => {
          const x = 24 + index * 188;
          box(context, x, 80, 176, 69, 14, 'rgba(255,255,255,.16)', 'rgba(255,255,255,.35)');
          text(context, label, x + 13, 106, `700 12px ${sans}`, '#fff', 'left', 'rgba(7,42,67,.58)');
          text(context, value, x + 13, 130, `700 15px ${sans}`, color, 'left', color === '#fff069' ? 'rgba(80,50,0,.6)' : color === '#73eaff' ? 'rgba(0,67,93,.7)' : 'rgba(0,74,37,.7)');
        });
        box(context, 24, 159, 264, 34, 12, 'rgba(255,255,255,.13)');
        box(context, 300, 159, 276, 34, 12, 'rgba(255,255,255,.13)');
        text(context, '剩余百分比', 37, 181, `700 12px ${sans}`, '#fff', 'left', 'rgba(7,42,67,.58)'); text(context, `${result.percentage.toFixed(1)}%`, 275, 181, `700 15px ${sans}`, '#fff069', 'right', 'rgba(80,50,0,.6)');
        text(context, '今日汇率', 313, 181, `700 12px ${sans}`, '#fff', 'left', 'rgba(7,42,67,.58)'); text(context, rateText, 563, 181, `700 15px ${sans}`, '#91ffb2', 'right', 'rgba(0,74,37,.7)');
        context.beginPath(); context.moveTo(24, 214.5); context.lineTo(576, 214.5); context.strokeStyle = 'rgba(255,255,255,.35)'; context.stroke();
        text(context, '价格预览', 24, 244, `800 13px ${sans}`, '#fff', 'left', 'rgba(7,42,67,.58)'); text(context, preview, 576, 246, `800 21px ${sans}`, previewColor, 'right', previewColor === '#ff95ca' ? 'rgba(105,0,55,.68)' : 'rgba(0,74,37,.7)');
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('卡片生成失败')), 'image/png');
      };
      background.onerror = () => reject(new Error('自定义背景加载失败'));
      background.src = backgroundSource;
    });
  }

  function createTankValueCard(values, rate, result, askingPrice) {
    const cardWidth = 600;
    const cardHeight = 275;
    const canvas = document.createElement('canvas');
    canvas.width = cardWidth * 2; canvas.height = cardHeight * 2;
    const background = new Image();
    const text = (context, value, x, y, font, color, align = 'left') => {
      context.font = font;
      context.fillStyle = color;
      context.textAlign = align;
      context.fillText(value, x, y);
    };
    return new Promise((resolve, reject) => {
      background.onload = () => {
        const context = canvas.getContext('2d');
        context.scale(2, 2);
        const font = '"Courier New",monospace';
        const cny = result.value * rate.rate;
        const renewal = `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)} / ${values.renewalCycle || '—'}`;
        const currency = currencyCode(values.currency) || values.currency || '—';
        const rateText = values.currency === 'CNY' ? '人民币计价' : `${currencySymbol(values.currency)}1 = ¥${rate.rate.toFixed(5)}`;
        const rows = [
          ['续费金额 / 周期', renewal, '#d7bb82'],
          ['到期日期', values.expiryDate || '—', '#d7bb82'],
          ['剩余天数', `${result.daysLeft} 天`, '#f4f0df'],
          ['剩余百分比', `${result.percentage.toFixed(1)}%`, '#f4f0df'],
          ['今日汇率', rateText, '#6ac66f'],
        ];
        let previewTop = '未填写预出价格';
        let previewColor = '#d7bb82';
        if (Number.isFinite(askingPrice) && askingPrice >= 0) {
          if (cny === 0) { previewTop = `溢价 ¥${askingPrice.toFixed(2)}`; previewColor = '#dc6560'; }
          else if (askingPrice > cny) { previewTop = `溢价 ¥${(askingPrice - cny).toFixed(2)}`; previewColor = '#dc6560'; }
          else if (askingPrice === cny) { previewTop = '剩余价值出'; previewColor = '#6ac66f'; }
          else { previewTop = `${(askingPrice / cny * 10).toFixed(1)} 折`; previewColor = '#6ac66f'; }
        }

        context.drawImage(background, 0, 0, cardWidth, cardHeight);
        context.strokeStyle = '#b8b9b4'; context.lineWidth = 3; context.strokeRect(10.5, 10.5, 579, 254);
        context.strokeStyle = '#30312e'; context.lineWidth = 1; context.strokeRect(14.5, 14.5, 571, 246);
        context.beginPath(); context.moveTo(137.5, 10); context.lineTo(137.5, 265); context.moveTo(462.5, 10); context.lineTo(462.5, 265); context.strokeStyle = '#f4f0df'; context.lineWidth = 2; context.stroke();
        text(context, '剩余价值', 148, 31, `900 15px ${font}`, '#b94b4a');
        text(context, `¥${cny.toFixed(2)}`, 452, 31, `900 16px ${font}`, '#d7bb82', 'right');
        text(context, '结算日期', 285, 54, `900 14px ${font}`, '#f4f0df', 'right');
        text(context, values.tradeDate || '—', 312, 54, `900 14px ${font}`, '#d7bb82');

        rows.forEach(([label, value, color], index) => {
          const y = 87 + index * 31;
          text(context, label, 254, y, `900 14px ${font}`, '#f4f0df', 'right');
          text(context, value, 312, y, `900 14px ${font}`, color);
          if (index < rows.length - 1) {
            context.beginPath(); context.setLineDash([2, 2]); context.moveTo(148, y + 9.5); context.lineTo(452, y + 9.5); context.strokeStyle = '#555'; context.lineWidth = 1; context.stroke(); context.setLineDash([]);
          }
        });

        context.beginPath(); context.moveTo(148, 234); context.lineTo(452, 234); context.strokeStyle = '#f4f0df'; context.lineWidth = 2; context.stroke();
        text(context, '价格预览', 148, 257, `900 14px ${font}`, '#f4f0df');
        text(context, previewTop, 452, 257, `900 15px ${font}`, previewColor, 'right');
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('卡片生成失败')), 'image/png');
      };
      background.onerror = () => reject(new Error('卡片背景加载失败'));
      background.crossOrigin = 'anonymous';
      background.src = VALUE_CARD_BACKGROUNDS.tank;
    });
  }

  function createValueCard(values, app, rate = activeRate(app)) {
    const result = calculation(values);
    if (!result || !rate) throw new Error('请先填写有效的续费信息并等待汇率加载完成');
    const askingPrice = effectiveAskingPrice(values, rate);
    const settings = personalSettings();
    const style = settings.valueCardStyle;
    if (style === 'custom') {
      if (!settings.customValueCardBackground) throw new Error('请先在个性化配置上传自定义背景');
      return createCustomValueCard(values, rate, result, askingPrice, settings.customValueCardBackground);
    }
    if (style === 'tank') return createTankValueCard(values, rate, result, askingPrice);
    if (style !== 'default') return createStardewValueCard(values, rate, result, askingPrice, style);
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
    const titleValues = titleFieldValues(values, rate);
    const parts = personalSettings().titleFields.map((field) => titleValues[field]).filter(Boolean);
    return parts.length ? `【出】${parts.join(' · ')}` : '';
  }

  function titleFieldValues(values, rate) {
    return {
      ...Object.fromEntries(TITLE_FIELD_OPTIONS.map(([name]) => [name, String(values[name] || '').trim()])),
      askingPrice: titlePricePreview(values, rate),
      transferTags: (values.transferTags || []).join(' / '),
    };
  }

  function multiMachineTitle(machines, app) {
    const entries = machines.map((machine) => {
      const price = effectiveAskingPrice(machine, rateForValues(app, machine));
      const parts = titleFieldValues(machine, rateForValues(app, machine));
      if (!Number.isFinite(price)) parts.askingPrice = '';
      return personalSettings().titleFields.map((field) => parts[field]).filter(Boolean).join(' ');
    }).filter(Boolean);
    return entries.length ? `【出】${entries.join(' · ')}` : '';
  }

  function tableRenewalInfo(values) {
    const fields = personalSettings().renewalFields;
    return [
      fields.includes('renewal') && [values.renewalAmount ? `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}` : '', values.renewalCycle].filter(Boolean).join('/'),
      fields.includes('tradeDate') && values.tradeDate ? `交易 ${values.tradeDate}` : '',
    ].filter(Boolean).join(' · ');
  }

  function tableValueAndExpiry(values, rate) {
    const fields = personalSettings().renewalFields;
    const result = calculation(values);
    return [
      fields.includes('remainingValue') && result && rate ? `¥${(result.value * rate.rate).toFixed(2)}` : '',
      fields.includes('expiryDate') && values.expiryDate ? values.expiryDate : '',
    ].filter(Boolean).join('/') || '—';
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

  function buyFormValues(app) {
    const values = Object.fromEntries(new FormData(app.querySelector('#nsit-buy-form')).entries());
    values.buyTags = Array.from(app.querySelectorAll('[name="buyTags"]:checked'), (input) => input.value);
    return values;
  }

  function buyPersonalSettings() {
    const defaults = { presetTags: [], customTags: [], titleFields: DEFAULT_BUY_TITLE_FIELDS, postRemarks: '' };
    try {
      const saved = JSON.parse(localStorage.getItem(BUY_PERSONALIZATION_KEY) || '{}');
      return {
        presetTags: Array.isArray(saved.presetTags) ? saved.presetTags.filter((tag) => BUY_PRESET_TAGS.includes(tag)) : defaults.presetTags,
        customTags: Array.isArray(saved.customTags) ? saved.customTags.filter(Boolean) : defaults.customTags,
        titleFields: Array.isArray(saved.titleFields) ? saved.titleFields.filter((field) => BUY_TITLE_FIELD_OPTIONS.some(([value]) => value === field)) : defaults.titleFields,
        postRemarks: String(saved.postRemarks || '').trim(),
      };
    } catch (_) { return defaults; }
  }

  function renderBuyPersonalization(app) {
    const container = app.querySelector('[data-nsit-buy-personal-tags]');
    if (!container) return;
    const settings = buyPersonalSettings();
    const selected = new Set(Array.from(app.querySelectorAll('[name="buyTags"]:checked'), (input) => input.value));
    const baseTags = new Set(BUY_PRESET_TAGS);
    container.innerHTML = settings.customTags.filter((tag) => !baseTags.has(tag)).map((tag) => `<label class="nsit-tag nsit-tag--extras"><input type="checkbox" name="buyTags" value="${escapeHtml(tag)}"${selected.has(tag) ? ' checked' : ''}><span>${escapeHtml(tag)}</span></label>`).join('');
  }

  function applyBuyPersonalSettings(app) {
    const postRemarks = app.querySelector('[name="buyPostRemarks"]');
    const settings = buyPersonalSettings();
    if (postRemarks && settings.postRemarks && !postRemarks.value.trim()) postRemarks.value = settings.postRemarks;
  }

  function buyPersonalizationDialogMarkup() {
    const settings = buyPersonalSettings();
    const tag = (value) => `<label class="nsit-tag nsit-tag--${BUY_TAG_GROUPS[value]}"><input type="checkbox" name="buyPresetTags" value="${escapeHtml(value)}" data-buy-preset-tag-group="${BUY_TAG_GROUPS[value]}"${settings.presetTags.includes(value) ? ' checked' : ''}><span>${escapeHtml(value)}</span></label>`;
    const customTag = (value) => `<span class="nsit-custom-tag" data-nsit-buy-custom-tag="${escapeHtml(value)}">${escapeHtml(value)}<button type="button" data-action="remove-buy-custom-tag" aria-label="删除 ${escapeHtml(value)}">×</button></span>`;
    const titleItem = (value) => `<li data-nsit-buy-title-field="${value}"><span>${escapeHtml(BUY_TITLE_FIELD_OPTIONS.find(([key]) => key === value)?.[1] || value)}</span><button type="button" data-action="add-buy-title-field" aria-label="加入">＋</button><button type="button" data-action="remove-buy-title-field" aria-label="移除">−</button><button type="button" data-action="move-buy-title-field" data-direction="up" aria-label="上移">↑</button><button type="button" data-action="move-buy-title-field" data-direction="down" aria-label="下移">↓</button></li>`;
    const available = BUY_TITLE_FIELD_OPTIONS.map(([value]) => value).filter((value) => !settings.titleFields.includes(value));
    const preview = settings.titleFields.map((value) => BUY_TITLE_FIELD_OPTIONS.find(([key]) => key === value)?.[1]).filter(Boolean).join(' · ') || '未选择字段';
    return `<form class="nsit-personalization-form" data-nsit-buy-personalization-form><div class="nsit-personalization-content"><section><div class="nsit-setting-label"><h4>标签设置</h4><p>预置标签可设为新收鸡帖默认勾选；自定义标签会追加到收鸡表单。</p></div><div class="nsit-tag-list nsit-personalization-tags">${BUY_PRESET_TAGS.map(tag).join('')}<span class="nsit-custom-tag-list" data-nsit-buy-custom-tag-list>${settings.customTags.map(customTag).join('')}</span><span class="nsit-custom-tag-entry"><input data-nsit-buy-custom-tag-input placeholder="自定义标签"><button type="button" data-action="add-buy-custom-tag">添加</button></span></div></section><section><div class="nsit-setting-label"><h4>标题字段和顺序</h4><p>左侧所有字段，右侧为已选字段；用按钮移动和排序。</p></div><div class="nsit-title-preview" data-nsit-buy-title-preview>标题预览：${escapeHtml(preview)}</div><div class="nsit-transfer-box"><ol class="nsit-title-field-order" data-nsit-buy-title-field-available>${available.map(titleItem).join('')}</ol><ol class="nsit-title-field-order" data-nsit-buy-title-field-order>${settings.titleFields.map(titleItem).join('')}</ol></div></section><section><div class="nsit-setting-label"><h4>常用备注</h4><p>打开收鸡表单时自动填入，已有备注不覆盖。</p></div><textarea name="buyPostRemarks" rows="4" placeholder="输入自己常用的收鸡备注">${escapeHtml(settings.postRemarks)}</textarea></section></div><footer><button type="button" data-action="close-buy-personalization">取消</button><button type="submit" class="nsit-primary">保存配置</button></footer></form>`;
  }

  function openBuyPersonalization(app) {
    app.querySelector('[data-nsit-buy-personalization-body]').innerHTML = buyPersonalizationDialogMarkup();
    app.classList.add('nsit-buy-personalization-open');
  }

  function closeBuyPersonalization(app) { app.classList.remove('nsit-buy-personalization-open'); }

  function refreshBuyTitlePreview(app) {
    const preview = app.querySelector('[data-nsit-buy-title-preview]');
    if (preview) preview.textContent = `标题预览：${Array.from(app.querySelectorAll('[data-nsit-buy-title-field-order] [data-nsit-buy-title-field]'), (item) => item.querySelector('span')?.textContent).filter(Boolean).join(' · ') || '未选择字段'}`;
  }

  function saveBuyPersonalizationForm(app) {
    const form = app.querySelector('[data-nsit-buy-personalization-form]');
    if (!form) return;
    const presetTags = Array.from(form.querySelectorAll('[name="buyPresetTags"]:checked'), (input) => input.value);
    localStorage.setItem(BUY_PERSONALIZATION_KEY, JSON.stringify({
      presetTags,
      customTags: Array.from(form.querySelectorAll('[data-nsit-buy-custom-tag]'), (item) => item.dataset.nsitBuyCustomTag),
      titleFields: Array.from(form.querySelectorAll('[data-nsit-buy-title-field-order] [data-nsit-buy-title-field]'), (item) => item.dataset.nsitBuyTitleField),
      postRemarks: form.elements.buyPostRemarks.value.trim(),
    }));
    renderBuyPersonalization(app);
    refreshBuyTitle(app); saveBuyDraft(app); closeBuyPersonalization(app);
    app.querySelector('[data-nsit-buy-status]').textContent = '个性化配置已保存到本地。';
  }

  function buyPriceText(values, compact = false) {
    const amount = () => {
      const value = String(values[`buyPriceValue-${values.buyPriceMode}`] || '').trim();
      return value ? Number(value) : NaN;
    };
    const displayAmount = () => compact ? String(amount()) : amount().toFixed(2);
    if (values.buyPriceMode === 'remainingValue') return '剩余价值收';
    if (values.buyPriceMode === 'premium' && Number.isFinite(amount()) && amount() > .01) return `剩余价值 + ¥${displayAmount()} 收`;
    if (values.buyPriceMode === 'discount' && Number.isFinite(amount()) && amount() >= .1 && amount() <= 9.9) return `剩余价值 ${String(amount())} 折收`;
    if (values.buyPriceMode === 'remainingValueMinus' && Number.isFinite(amount()) && amount() > .01) return `剩余价值 − ¥${displayAmount()} 收`;
    if (values.buyPriceMode === 'total' && Number.isFinite(amount()) && amount() > .01) return `总价 ¥${displayAmount()} 收`;
    if (values.buyPriceMode === 'offer') return '带价聊';
    return '';
  }

  function suggestedBuyTitle(values) {
    const renewal = [values.buyRenewalAmount ? `${currencySymbol(values.buyRenewalCurrency)}${values.buyRenewalAmount}` : '', values.buyRenewalCycle].filter(Boolean).join(' / ');
    const fields = { price: buyPriceText(values, true), vendor: values.buyVendor, model: values.buyModel, cpu: values.buyCpu, memory: values.buyMemory, disk: values.buyDisk, bandwidth: values.buyBandwidth, traffic: values.buyTraffic, renewal, tags: values.buyTags?.join('、') };
    const parts = buyPersonalSettings().titleFields.map((field) => String(fields[field] || '').trim()).filter(Boolean);
    return parts.length ? `【收】${parts.join(' · ')}` : '';
  }

  function refreshBuyTitle(app) {
    const title = app.querySelector('[name="buyPostTitle"]');
    if (title) title.value = suggestedBuyTitle(buyFormValues(app));
  }

  function syncBuyPriceInputs(app) {
    const mode = app.querySelector('[name="buyPriceMode"]:checked')?.value;
    BUY_PRICE_MODES.forEach(([value]) => {
      const input = app.querySelector(`[name="buyPriceValue-${value}"]`);
      if (input) input.disabled = value !== mode;
    });
  }

  function focusBuyPriceValue(app, mode) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const input = app.querySelector(`[name="buyPriceValue-${mode}"]`);
      if (input && !input.disabled) input.focus();
    }));
  }

  function normalizeBuyPriceInput(input) {
    const raw = String(input.value || '').replace(/[^\d.]/g, '');
    const [whole = '', ...fractionParts] = raw.split('.');
    const fraction = fractionParts.join('').slice(0, 2);
    const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || (raw ? '0' : '');
    let value = fractionParts.length ? `${normalizedWhole}.${fraction}` : normalizedWhole;
    if (input.name === 'buyPriceValue-discount') {
      const amount = Number(value);
      if (Number.isFinite(amount) && amount > 9.9) value = '9.9';
    }
    input.value = value;
  }

  function renderBuyMachineCatalogResults(app, records) {
    const container = app.querySelector('[data-nsit-buy-catalog-results]');
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="nsit-catalog-empty">没有找到匹配的机器配置。</p>';
      return;
    }
    container.innerHTML = records.map((record, index) => `<button type="button" class="nsit-buy-catalog-result" data-nsit-buy-catalog-result="${index}"><strong>${escapeHtml(record.vendor)} · ${escapeHtml(record.model)}</strong><span>${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)}</span><small>${escapeHtml(record.bandwidth)} · ${escapeHtml(record.traffic)}</small></button>`).join('');
    app._nsitBuyCatalogResults = records;
  }

  async function loadBuyMachineCatalog(app) {
    const input = app.querySelector('[data-nsit-buy-catalog-search]');
    const container = app.querySelector('[data-nsit-buy-catalog-results]');
    if (!input || !container) return;
    const query = input.value.trim();
    app._nsitBuyCatalogSearchAbort?.abort();
    app._nsitBuyCatalogSearchSignature = query;
    if (!MACHINE_CATALOG_API_URL) {
      container.innerHTML = '<p class="nsit-catalog-empty">共享配置服务尚未配置。</p>';
      return;
    }
    container.innerHTML = '<p class="nsit-catalog-empty">正在加载机器配置…</p>';
    try {
      const controller = new AbortController();
      app._nsitBuyCatalogSearchAbort = controller;
      const response = await fetch(catalogApiUrl('v1/public/machine-configs', { q: query, limit: 30 }), { signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `查询失败（HTTP ${response.status}）`);
      if (app._nsitBuyCatalogSearchSignature !== query) return;
      renderBuyMachineCatalogResults(app, data.records || []);
    } catch (error) {
      if (error?.name === 'AbortError' || app._nsitBuyCatalogSearchSignature !== query) return;
      container.innerHTML = `<p class="nsit-catalog-empty">${escapeHtml(error.message || '查询失败，请稍后重试。')}</p>`;
    }
  }

  function scheduleBuyMachineCatalogSearch(app, immediate = false) {
    clearTimeout(app._nsitBuyCatalogSearchTimer);
    if (immediate) { loadBuyMachineCatalog(app); return; }
    app._nsitBuyCatalogSearchTimer = setTimeout(() => loadBuyMachineCatalog(app), 220);
  }

  function applyBuyMachineCatalogRecord(app, record) {
    const setValue = (name, value) => {
      const control = app.querySelector(`[name="${name}"]`);
      if (control) control.value = value;
    };
    setValue('buyVendor', record.vendor || '');
    setValue('buyModel', record.model || '');
    setValue('buyCpu', record.cpu || '');
    setValue('buyMemory', record.memory || '');
    setValue('buyDisk', record.disk || '');
    setValue('buyBandwidth', record.bandwidth || '');
    setValue('buyTraffic', record.traffic || '');
    setValue('buyRenewalCycle', record.renewalCycle || '');
    setValue('buyRenewalAmount', record.renewalAmount || '');
    setValue('buyRenewalCurrency', record.currency || 'USD 美元');
    refreshBuyTitle(app); saveBuyDraft(app);
    app.querySelector(`[name="buyPriceValue-${app.querySelector('[name="buyPriceMode"]:checked')?.value}"]`)?.focus();
  }

  function closeBuyModelSuggestions(app) {
    app.querySelector('.nsit-buy-model-suggest')?.classList.remove('is-open');
  }

  function searchBuyModelSuggestions(app) {
    const vendor = String(app.querySelector('[name="buyVendor"]')?.value || '').trim();
    const model = String(app.querySelector('[name="buyModel"]')?.value || '').trim();
    const signature = `${vendor}\u0000${model}`;
    clearTimeout(app._nsitBuyModelSearchTimer);
    app._nsitBuyModelSearchAbort?.abort();
    app._nsitBuyModelSearchSignature = signature;
    if (!MACHINE_CATALOG_API_URL || !model) { closeBuyModelSuggestions(app); return; }
    app._nsitBuyModelSearchTimer = setTimeout(async () => {
      try {
        const controller = new AbortController();
        app._nsitBuyModelSearchAbort = controller;
        const response = await fetch(catalogApiUrl('v1/machine-configs/search', { vendor, model }), { signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || `查询失败（HTTP ${response.status}）`);
        if (app._nsitBuyModelSearchSignature !== signature) return;
        const records = data.records || [];
        const menu = app.querySelector('[data-nsit-buy-model-suggest-menu]');
        const suggest = app.querySelector('.nsit-buy-model-suggest');
        if (!menu || !suggest) return;
        menu.innerHTML = records.length
          ? records.map((record, index) => `<button type="button" class="nsit-model-suggestion" data-nsit-buy-model-suggestion="${index}"><strong>${escapeHtml(record.model)}</strong><small>@${escapeHtml(record.submittedByNickname)}</small><span class="nsit-model-suggestion-vendor">${escapeHtml(record.vendor)}</span><span class="nsit-model-suggestion-spec">${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)}</span><span class="nsit-model-suggestion-network">流量 ${escapeHtml(record.traffic)} · 带宽 ${escapeHtml(record.bandwidth)}</span></button>`).join('')
          : '<p class="nsit-model-suggest-empty">未匹配到配置，直接输入即可</p>';
        app._nsitBuyModelSuggestions = records;
        suggest.classList.add('is-open');
      } catch (error) {
        if (error.name !== 'AbortError' && app._nsitBuyModelSearchSignature === signature) closeBuyModelSuggestions(app);
      }
    }, 300);
  }

  function applyBuyModelSuggestion(app, record) {
    [['buyVendor', 'vendor'], ['buyModel', 'model'], ['buyCpu', 'cpu'], ['buyMemory', 'memory'], ['buyDisk', 'disk'], ['buyBandwidth', 'bandwidth'], ['buyTraffic', 'traffic'], ['buyRenewalCycle', 'renewalCycle'], ['buyRenewalAmount', 'renewalAmount'], ['buyRenewalCurrency', 'currency']].forEach(([name, key]) => {
      const control = app.querySelector(`[name="${name}"]`);
      if (control) control.value = record[key] || '';
    });
    refreshVendorPicker(app.querySelector('#nsit-buy-form .nsit-vendor-picker'));
    closeBuyModelSuggestions(app);
    refreshBuyTitle(app); saveBuyDraft(app);
  }

  function saveBuyDraft(app) {
    try { localStorage.setItem(BUY_STORAGE_KEY, JSON.stringify(buyFormValues(app))); } catch (_) { /* 存储不可用时忽略 */ }
  }

  function restoreBuyDraft(app) {
    let draft = {};
    try {
      draft = JSON.parse(localStorage.getItem(BUY_STORAGE_KEY) || '{}');
      Object.entries(draft).forEach(([name, value]) => {
        if (name === 'buyTags') return;
        const controls = app.querySelectorAll(`[name="${CSS.escape(name)}"]`);
        controls.forEach((control) => {
          if (control.type === 'radio') control.checked = control.value === value;
          else control.value = value;
        });
      });
    } catch (_) { /* 无效草稿时忽略 */ }
    const savedTags = Array.isArray(draft.buyTags) ? draft.buyTags : [];
    app.querySelectorAll('[name="buyTags"]').forEach((input) => { input.checked = savedTags.includes(input.value); });
    const tg = app.querySelector('[name="buyTgContact"]');
    if (tg && !tg.value) tg.value = personalSettings().tgContact;
    syncBuyPriceInputs(app); refreshBuyTitle(app);
  }

  function buyMarkdown(values) {
    const pair = (label, value) => String(value || '').trim() ? `- ${label}：${String(value).trim()}` : '';
    const tg = String(values.buyTgContact || '').trim();
    const tgContact = /^https?:\/\/\S+$/i.test(tg) ? `[${tg}](${tg})` : tg;
    const target = [values.buyVendor, values.buyModel].map((value) => String(value || '').trim()).filter(Boolean).join(' ');
    const config = [['CPU', values.buyCpu], ['内存', values.buyMemory], ['硬盘', values.buyDisk], ['带宽', values.buyBandwidth], ['流量', values.buyTraffic]].filter(([, value]) => String(value || '').trim()).map(([label, value]) => `${label}：${String(value).trim()}`).join('，');
    const renewal = [values.buyRenewalAmount ? `${currencySymbol(values.buyRenewalCurrency)}${values.buyRenewalAmount}（${values.buyRenewalCurrency}）` : '', values.buyRenewalCycle].filter(Boolean).join(' / ');
    const contactTags = (values.buyTags || []).filter((tag) => BUY_TAG_GROUPS[tag] === 'contact');
    const transactionTags = (values.buyTags || []).filter((tag) => BUY_TAG_GROUPS[tag] !== 'contact');
    const lines = [pair('目标机器', target), pair('目标配置', config), pair('续费金额 / 周期', renewal), pair('收购价格', buyPriceText(values)), transactionTags.length ? `- 交易要求：${transactionTags.join('、')}` : ''].filter(Boolean);
    const parts = [`## 收购信息\n${lines.join('\n')}`];
    const contacts = [tgContact ? `- TG 联系：${tgContact}` : '', ...contactTags.map((tag) => `- ${tag}`)].filter(Boolean);
    if (contacts.length) parts.push(`## 联系方式\n${contacts.join('\n')}`);
    if (String(values.buyPostRemarks || '').trim()) parts.push(`## 备注\n${String(values.buyPostRemarks).trim()}`);
    return parts.join('\n\n');
  }

  function fillBuyPost(app) {
    const values = buyFormValues(app);
    const hasTarget = ['buyVendor', 'buyModel', 'buyCpu', 'buyMemory', 'buyDisk', 'buyBandwidth', 'buyTraffic'].some((name) => String(values[name] || '').trim());
    const price = buyPriceText(values);
    const status = app.querySelector('[data-nsit-buy-status]');
    const showValidation = (name, message) => {
      const field = app.querySelector(`[name="${name}"]`);
      status.textContent = message;
      if (!field) return;
      field.setCustomValidity(message);
      field.reportValidity();
      field.focus();
    };
    app.querySelectorAll('#nsit-buy-form input, #nsit-buy-form textarea').forEach((field) => field.setCustomValidity(''));
    if (!hasTarget) { showValidation('buyVendor', '请至少填写厂商、型号或目标配置。'); return; }
    if (Boolean(String(values.buyRenewalCycle || '').trim()) !== Boolean(String(values.buyRenewalAmount || '').trim())) {
      showValidation(values.buyRenewalCycle ? 'buyRenewalAmount' : 'buyRenewalCycle', '续费周期和续费金额请同时填写，或同时留空。');
      return;
    }
    if (!price) { showValidation(`buyPriceValue-${values.buyPriceMode}`, '请填写收购方式对应的金额或折数。'); return; }
    const title = values.buyPostTitle.trim() || suggestedBuyTitle(values);
    const titleField = document.querySelector('#mde-title');
    if (title && titleField) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(titleField, title);
      titleField.dispatchEvent(new Event('input', { bubbles: true }));
      titleField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const didFill = setEditorContent(app, buyMarkdown(values));
    if (didFill) { selectTradeCategory(); app.classList.remove('nsit-buy-open'); app.querySelector('.nsit-buy-modal').setAttribute('aria-hidden', 'true'); }
    status.textContent = didFill ? '已回填标题和 Markdown；请检查后手动发布。' : '未找到 NodeSeek 正文编辑器，请刷新页面后重试。';
  }

  function markdown(values, cardMarkdown = '', rate = null) {
    const result = calculation(values);
    const pair = (label, value) => value ? `- ${label}：${value}` : '';
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    const basic = [[values.vendor, values.model].filter(Boolean).join(' ') ? `- 厂商&型号：${[values.vendor, values.model].filter(Boolean).join(' ')}` : '', [['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', trafficDisplay(values)]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，') ? `- 配置：${[['CPU', values.cpu], ['内存', values.memory], ['硬盘', values.disk], ['带宽', values.bandwidth], ['流量', trafficDisplay(values)]].filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join('，')}` : ''].filter(Boolean);
    const renewalFields = personalSettings().renewalFields;
    const renewal = [
      renewalFields.includes('renewal') && (values.renewalAmount || values.renewalCycle) ? `- 续费金额 / 周期：${[values.renewalAmount ? `${currencySymbol(values.currency)}${formatAmount(values.renewalAmount)}（${values.currency}）` : '', values.renewalCycle].filter(Boolean).join(' / ')}` : '',
      renewalFields.includes('expiryDate') ? pair('到期日期', values.expiryDate) : '',
      renewalFields.includes('tradeDate') ? pair('交易日期', values.tradeDate) : '',
    ].filter(Boolean);
    if (renewalFields.includes('remainingValue') && result && rate) {
      const cnyValue = result.value * rate.rate;
      const originalValue = `${currencySymbol(values.currency)}${result.value.toFixed(2)}`;
      const calculation = `¥${cnyValue.toFixed(2)}`;
      const detail = currencyCode(values.currency) === 'CNY'
        ? `（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`
        : ` = ${originalValue} × ${rate.rate.toFixed(4)}（剩余 ${result.daysLeft} 天，${result.percentage.toFixed(1)}%）`;
      renewal.push(`- 剩余价值：${calculation}${detail}`);
    } else if (renewalFields.includes('remainingValue') && result) {
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
    const remaining = tableValueAndExpiry(values, rate);
    const vendorModel = [values.vendor, values.model].filter(Boolean).join(' · ');
    const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
    const network = [values.bandwidth, trafficDisplay(values)].filter(Boolean).join('/');
    const renewal = tableRenewalInfo(values);
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
    const hasReports = Boolean(values.nqUrl || values.tqUrl);
    const table = hasReports
      ? `| 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 测试报告 | 价格 |\n| --- | --- | --- | --- | --- | --- | --- |\n| ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${reports} | ${price} |`
      : `| 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 价格 |\n| --- | --- | --- | --- | --- | --- |\n| ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${price} |`;
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    const other = [values.transferTags.length ? `- 转让信息：${values.transferTags.join('、')}` : '', values.tgContact ? `- TG 联系：${tgContact(values.tgContact)}` : '', String(values.remarks || '').trim() ? `- 单机备注：${String(values.remarks).trim()}` : '', String(values.postRemarks || '').trim() ? `- 整贴备注：${String(values.postRemarks).trim()}` : ''].filter(Boolean);
    return [`## 基础信息\n${table}`, cardMarkdown ? `## 剩余价值\n${cardMarkdown}` : '', other.length ? `## 其他信息\n${other.join('\n')}` : ''].filter(Boolean).join('\n\n');
  }

  function textMarkdownForMachines(machines, app, cards, shared) {
    const tgContact = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim()) ? `[${String(value).trim()}](${String(value).trim()})` : value;
    if (machines.length === 1) {
      const other = [shared.tgContact ? `## 联系方式\n- TG 联系：${tgContact(shared.tgContact)}` : '', String(shared.postRemarks || '').trim() ? `## 整贴备注\n${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
      return [markdown(machines[0], cards[0] || '', rateForValues(app, machines[0])), ...other].join('\n\n').replace(/^## /gm, '# ');
    }
    const blocks = machines.map((machine, index) => {
      const machineName = [machine.vendor, machine.model].filter(Boolean).join(' ');
      return `# #${index + 1} ${machineName}\n\n${markdown(machine, cards[index] || '', rateForValues(app, machine))}`;
    });
    const other = [shared.tgContact ? `## 联系方式\n- TG 联系：${tgContact(shared.tgContact)}` : '', String(shared.postRemarks || '').trim() ? `## 整贴备注\n${String(shared.postRemarks).trim()}` : ''].filter(Boolean);
    return [...blocks, ...other].filter(Boolean).join('\n\n---\n\n');
  }

  function tableMarkdownForMachines(machines, app, cards, shared) {
    if (machines.length === 1) return tableMarkdown({ ...machines[0], tgContact: shared.tgContact, postRemarks: shared.postRemarks }, app, cards[0] || '');
    const hasReports = machines.some((machine) => machine.nqUrl || machine.tqUrl);
    const rows = machines.map((values, index) => {
      const result = calculation(values);
      const rate = rateForValues(app, values);
      const remaining = tableValueAndExpiry(values, rate);
      const vendorModel = [values.vendor, values.model].filter(Boolean).join(' · ');
      const spec = [values.cpu, values.memory, values.disk].filter(Boolean).join('/');
      const network = [values.bandwidth, trafficDisplay(values)].filter(Boolean).join('/');
      const renewal = tableRenewalInfo(values);
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
      return hasReports
        ? `| #${index + 1} | ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${reports} | ${price} |`
        : `| #${index + 1} | ${vendorModel} | ${spec} | ${network} | ${renewal} | ${remaining}/${values.expiryDate || '—'} | ${price} |`;
    });
    const table = hasReports
      ? `| 编号 | 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 测试报告 | 价格 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}`
      : `| 编号 | 厂商&型号 | CPU/内存/硬盘 | 带宽/流量 | 续费信息 | 剩余价值/到期时间 | 价格 |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}`;
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

  function editorTarget(app) {
    if (app._nsitEditor?.isConnected) return app._nsitEditor;
    return document.querySelector('#editor-body') || Array.from(document.querySelectorAll('.CodeMirror')).find((element) => !app.contains(element)) || null;
  }

  function editorContent(app) {
    const target = editorTarget(app);
    const codeMirror = target?.matches?.('.CodeMirror') ? target : target?.querySelector?.('.CodeMirror');
    if (codeMirror?.CodeMirror && typeof codeMirror.CodeMirror.getValue === 'function') return codeMirror.CodeMirror.getValue();
    const textarea = target?.matches?.('textarea') ? target : target?.querySelector?.('textarea') || Array.from(document.querySelectorAll('#mde-title ~ textarea, textarea')).find((element) => !app.contains(element));
    return textarea?.value || '';
  }

  function sectionContent(content, heading) {
    const match = content.match(new RegExp(`^#{1,2} ${heading}\\s*\\n([\\s\\S]*?)(?=^#{1,2}\\s|$(?![\\s\\S]))`, 'm'));
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
    const hasReports = /^\|\s*编号\s*\|.*\|\s*测试报告\s*\|/m.test(content);
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
      const reports = hasReports ? cells[6] || '' : '';
      machine.nqUrl = reports.match(/\[NQ\]\(([^)]+)\)/)?.[1] || '';
      machine.tqUrl = reports.match(/\[TQ\]\(([^)]+)\)/)?.[1] || '';
      machine.askingPrice = (cells[hasReports ? 7 : 6] || '').match(/(?:总价|剩余价值)\s*¥([\d.]+)/)?.[1] || '';
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
    const blocks = content.split(/^#{1,2} #\d+(?: [^\n]*)?\s*$/m).slice(1)
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
    if (!/^#{1,2} (基本信息|续费与价值|转让信息|测试报告|单机备注|整贴备注)$/m.test(content)) return false;
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
    const target = editorTarget(app);
    const codeMirror = target?.matches?.('.CodeMirror') ? target : target?.querySelector?.('.CodeMirror');
    if (codeMirror && codeMirror.CodeMirror && typeof codeMirror.CodeMirror.setValue === 'function') {
      codeMirror.CodeMirror.setValue(content);
      codeMirror.CodeMirror.focus();
      return true;
    }
    const textarea = target?.matches?.('textarea') ? target : target?.querySelector?.('textarea') || Array.from(document.querySelectorAll('#mde-title ~ textarea, textarea')).find((element) => !app.contains(element));
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

  function setGenerating(app, generating) {
    app.classList.toggle('nsit-generating', generating);
    app.querySelector('.nsit-generation-loading')?.setAttribute('aria-hidden', String(!generating));
    app.querySelectorAll('[data-action="fill"], [data-action="fill-table"]').forEach((button) => {
      button.disabled = generating;
    });
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

  function mergeRepliedComments(payload) {
    if (!payload?.success || !Array.isArray(payload.comments)) return;
    const storageKey = repliedPostsStorageKey();
    if (!storageKey) return;
    let posts = {};
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) posts = saved;
    } catch (_) { /* 损坏或不可用的本地存储直接从空记录开始 */ }

    let changed = false;
    payload.comments.forEach((comment) => {
      const postId = Number(comment?.post_id);
      const floorId = Number(comment?.floor_id);
      if (!Number.isInteger(postId) || postId <= 0 || !Number.isInteger(floorId) || floorId <= 0) return;
      const key = String(postId);
      const floors = Array.isArray(posts[key]) ? posts[key].filter((floor) => Number.isInteger(floor) && floor >= 0) : [];
      if (!floors.includes(floorId)) {
        floors.push(floorId);
        posts[key] = floors.sort((left, right) => left - right);
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem(storageKey, JSON.stringify(posts)); } catch (_) { /* 存储不可用时忽略 */ }
      renderRepliedPostMenu();
      renderRepliedPostLabels();
    }
  }

  function currentPostId() {
    const match = location.pathname.match(/(?:^|\/)post-(\d+)(?:-|$)|(?:^|\/)post\/(\d+)(?:\/|$)/);
    return match?.[1] || match?.[2] || '';
  }

  function currentPostPage() {
    return Number(location.pathname.match(/\/post-\d+-(\d+)(?:\/|$)/)?.[1] || 1);
  }

  function currentNodeSeekUserId() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const configuredId = pageWindow.__config__?.user?.member_id || pageWindow.__config__?.user?.id;
    if (/^\d+$/.test(String(configuredId || ''))) return String(configuredId);
    const href = document.querySelector('.Username[href^="/space/"]')?.getAttribute('href') || '';
    return href.match(/^\/space\/(\d+)/)?.[1] || '';
  }

  function tradePostContext() {
    const postId = currentPostId();
    const titleElement = document.querySelector('.post-title');
    const firstFloor = document.querySelector('.content-item[id="0"]')
      || Array.from(document.querySelectorAll('.content-item')).find((item) => item.querySelector('.floor-link[href="#0"]'));
    const title = titleElement?.textContent?.trim() || '';
    const ownId = currentNodeSeekUserId();
    const authorHref = firstFloor?.querySelector('a.author-name[href^="/space/"], a[href^="/space/"]')?.getAttribute('href') || '';
    const categoryHref = firstFloor?.querySelector('.content-category a')?.getAttribute('href') || '';
    const authorId = authorHref.match(/^\/space\/(\d+)/)?.[1] || '';
    if (!postId || !title || !firstFloor || !ownId || authorId !== ownId || !/\/categories\/trade(?:[?#]|$)/.test(categoryHref)) return null;
    const status = title.match(/[【\[]\s*(已出|不出了|不出|出|已收|不收了|不收|收)\s*[】\]]/)?.[1] || '';
    const type = status.includes('收') || (!status && title.includes('收')) ? 'buy' : title.includes('出') ? 'sell' : '';
    if (!type) return null;
    return { firstFloor, titleElement, title, type };
  }

  function tradeTitleWithStatus(title, status) {
    const base = String(title || '').trim().replace(/^[【\[]\s*(?:已出|不出了|不出|出|已收|不收了|不收|收)\s*[】\]]\s*/, '').trim();
    return `【${status}】${base ? ` ${base}` : ''}`;
  }

  function waitForElement(getter, timeout = 2200) {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        const element = getter();
        if (element || Date.now() - startedAt >= timeout) {
          clearInterval(timer);
          resolve(element || null);
        }
      }, 40);
    });
  }

  async function updateTradePostTitle(button, status) {
    if (button.disabled) return;
    const context = tradePostContext();
    if (!context) return;
    const nextTitle = tradeTitleWithStatus(context.title, status);
    if (nextTitle === context.title) return;
    button.disabled = true;
    try {
      // 走编辑接口改标题，不打开编辑器；正文原样回传，避免被清空
      const postId = currentPostId();
      const content = luckyPostMarkdownFromConfig(postId)
        || context.firstFloor.querySelector('.post-content')?.textContent
        || '';
      if (!content) throw new Error('没有取到正文内容');
      await luckyEditPostViaApi({ postId, title: nextTitle, content });
      luckyRefreshPostView();
    } catch (error) {
      console.warn('[NSIT] 更新交易状态失败', error);
      button.disabled = false;
    }
  }

  function renderTradeStatusActions() {
    const context = tradePostContext();
    const existing = document.querySelector('[data-nsit-trade-status-actions]');
    if (!context || document.querySelector('#mde-title') || (context.type === 'sell' ? /已出|不出/.test(context.title) : /已收|不收/.test(context.title))) {
      existing?.remove();
      return;
    }
    const floorLink = context.firstFloor.querySelector('.floor-link[href="#0"]');
    if (!floorLink) return;
    if (existing?.nextElementSibling === floorLink) return;
    existing?.remove();
    const actions = document.createElement('span');
    actions.dataset.nsitTradeStatusActions = '';
    actions.className = 'nsit-trade-status-actions';
    const specs = context.type === 'sell' ? [['已出', '已出'], ['不出了', '不出了']] : [['已收', '已收'], ['不收了', '不收了']];
    specs.forEach(([label, status]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nsit-trade-status-button';
      button.dataset.nsitTradeStatus = status;
      button.textContent = label;
      button.title = `标记为${label}`;
      actions.append(button);
    });
    floorLink.before(actions);
  }

  function installTradeStatusActions() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    if (pageWindow[TRADE_STATUS_RUNTIME_KEY]) return;
    pageWindow[TRADE_STATUS_RUNTIME_KEY] = true;
    GM_addStyle('.nsit-trade-status-actions{display:inline-flex;align-items:center;gap:5px;margin-right:8px;vertical-align:middle}.nsit-trade-status-button{margin:0;padding:4px 7px;border:1px solid #d8e0eb;border-radius:5px;background:#fff;color:#40506a;font:inherit;font-size:12px;line-height:1;cursor:pointer}.nsit-trade-status-button:hover{border-color:#b8c5d5;background:#f6f8fb}.nsit-trade-status-button[data-nsit-trade-status="已出"]{border-color:#d9961c;background:#d9961c;color:#fff}.nsit-trade-status-button[data-nsit-trade-status="已出"]:hover{border-color:#b97c12;background:#b97c12}.nsit-trade-status-button[data-nsit-trade-status="已收"]{border-color:#3976bc;background:#3976bc;color:#fff}.nsit-trade-status-button[data-nsit-trade-status="已收"]:hover{border-color:#316ab7;background:#316ab7}.nsit-trade-status-button:disabled{cursor:wait;opacity:.55}');
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-nsit-trade-status]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      updateTradePostTitle(button, button.dataset.nsitTradeStatus);
    });
  }

  function repliedPostsStorageKey() {
    const uid = currentNodeSeekUserId();
    return uid ? `${REPLIED_POSTS_STORAGE_KEY}-${uid}` : '';
  }

  function repliedFloors(postId) {
    const storageKey = repliedPostsStorageKey();
    if (!storageKey) return [];
    try {
      const posts = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const floors = posts?.[postId];
      return Array.isArray(floors) ? floors.filter((floor) => Number.isInteger(floor) && floor > 0).sort((left, right) => left - right) : [];
    } catch (_) {
      return [];
    }
  }

  function postIdFromUrl(url) {
    return String(url || '').match(/\/post-(\d+)(?:-|$)/)?.[1] || '';
  }

  function postFilterRules() {
    try {
      const saved = JSON.parse(localStorage.getItem(POST_FILTER_RULES_STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.map((rule) => ({
        id: String(rule?.id || ''),
        keywords: String(rule?.keywords || '').trim(),
        keywordMode: rule?.keywordMode === 'all' ? 'all' : 'any',
        author: String(rule?.author || '').trim(),
        action: ['hide', 'fold', 'highlight'].includes(rule?.action) ? rule.action : 'fold',
        color: /^#[0-9a-f]{6}$/i.test(rule?.color || '') ? rule.color : '#fff9c4',
        enabled: rule?.enabled !== false,
        createdAt: Number(rule?.createdAt) || 0,
      })).filter((rule) => rule.id && (rule.keywords || rule.author));
    } catch (_) {
      return [];
    }
  }

  function savePostFilterRules(rules) {
    localStorage.setItem(POST_FILTER_RULES_STORAGE_KEY, JSON.stringify(rules));
  }

  function postFilterKeywords(rule) {
    return rule.keywords.split(/[，,]/).map((word) => word.trim().toLocaleLowerCase()).filter(Boolean);
  }

  function postFilterUsers(rule) {
    return rule.author.split(/[，,]/).map((name) => name.trim().toLocaleLowerCase()).filter(Boolean);
  }

  function postFilterAuthor(item) {
    const selectors = [
      '[data-user-nickname]', '[data-username]', '.info-author', '.post-author', '.post-list-author',
      '.post-list-meta a[href^="/space/"]', '.post-list-info a[href^="/space/"]',
      'a[href^="/space/"]', 'a[href^="/u/"]',
    ];
    for (const selector of selectors) {
      const element = item.querySelector(selector);
      const name = element?.dataset.userNickname || element?.dataset.username || element?.textContent?.trim();
      if (name) return name.toLocaleLowerCase();
    }
    return '';
  }

  function postFilterRuleMatches(rule, title, author) {
    if (!rule.enabled) return false;
    const words = postFilterKeywords(rule);
    const keywordMatches = !words.length || (rule.keywordMode === 'all'
      ? words.every((word) => title.includes(word))
      : words.some((word) => title.includes(word)));
    const users = postFilterUsers(rule);
    return keywordMatches && (!users.length || users.includes(author));
  }

  function resetPostFilterItem(item) {
    item.classList.remove('nsit-filter-hidden', 'nsit-filter-folded', 'nsit-filter-highlighted');
    item.style.removeProperty('--nsit-filter-highlight');
    item.querySelectorAll('[data-nsit-filter-fold-notice]').forEach((notice) => notice.remove());
    delete item.dataset.nsitFilterProcessed;
    delete item.dataset.nsitFilterUnfolded;
  }

  function addPostFilterFoldNotice(item, rules) {
    if (item.querySelector('[data-nsit-filter-fold-notice]')) return;
    const notice = document.createElement('div');
    notice.className = 'nsit-filter-fold-notice';
    notice.dataset.nsitFilterFoldNotice = '';
    const labels = rules.map((rule) => rule.keywords || `用户：${rule.author}`).join('、');
    notice.innerHTML = `<span>已折叠匹配过滤条件「${escapeHtml(labels)}」的主题</span><button type="button">查看</button>`;
    notice.querySelector('button').addEventListener('click', () => {
      item.classList.remove('nsit-filter-folded');
      item.dataset.nsitFilterUnfolded = 'true';
      notice.remove();
    });
    item.prepend(notice);
  }

  function filterPostListItems({ reapply = false } = {}) {
    const rules = postFilterRules();
    document.querySelectorAll('.post-list-item').forEach((item) => {
      if (reapply) resetPostFilterItem(item);
      if (item.dataset.nsitFilterProcessed || item.dataset.nsitFilterUnfolded) return;
      const title = item.querySelector('.post-title > a')?.textContent?.trim().toLocaleLowerCase() || '';
      if (!title) return;
      const matches = rules.filter((rule) => postFilterRuleMatches(rule, title, postFilterAuthor(item)));
      if (!matches.length) return;
      const hidden = matches.some((rule) => rule.action === 'hide');
      const folded = matches.filter((rule) => rule.action === 'fold');
      const colors = [...new Set(matches.filter((rule) => rule.action === 'highlight').map((rule) => rule.color))];
      if (hidden) item.classList.add('nsit-filter-hidden');
      else if (folded.length) {
        item.classList.add('nsit-filter-folded');
        addPostFilterFoldNotice(item, folded);
      } else if (colors.length) {
        item.classList.add('nsit-filter-highlighted');
        item.style.setProperty('--nsit-filter-highlight', colors.length === 1 ? colors[0] : `linear-gradient(90deg, ${colors.join(', ')})`);
      }
      item.dataset.nsitFilterProcessed = 'true';
    });
  }

  function postFilterRuleSummary(rule) {
    const relation = rule.keywords ? (rule.keywordMode === 'all' ? '全部命中' : '任一命中') : '不限制关键词';
    const author = rule.author ? ` · 用户昵称（任一完全匹配）：${rule.author}` : '';
    const action = { hide: '彻底隐藏', fold: '折叠展示', highlight: '高亮' }[rule.action];
    return `${relation}${author} · ${action}`;
  }

  function postFilterRuleTitle(rule) {
    if (rule.author && rule.keywords) return `@${rule.author} · ${rule.keywords}`;
    if (rule.author) return `@${rule.author}`;
    return rule.keywords;
  }

  function postFilterRuleDetail(rule) {
    const relation = rule.keywords ? (rule.keywordMode === 'all' ? '关键词全部命中' : '关键词任一命中') : '用户昵称任一完全匹配';
    const action = { hide: '彻底隐藏', fold: '折叠展示', highlight: '高亮' }[rule.action];
    return `${relation} · ${action}`;
  }

  function filterPostFilterRuleList(panel) {
    const query = panel._nsitPostFilterState?.query || '';
    const list = panel.querySelector('.nsit-filter-rule-list');
    if (!list) return;
    const rules = Array.from(list.querySelectorAll('[data-nsit-filter-search-text]'));
    let matches = 0;
    rules.forEach((item) => {
      const matched = !query || item.dataset.nsitFilterSearchText.includes(query);
      item.hidden = !matched;
      if (matched) matches += 1;
    });
    let empty = list.querySelector('[data-nsit-filter-search-empty]');
    if (!matches && rules.length) {
      if (!empty) {
        empty = document.createElement('li');
        empty.className = 'nsit-filter-empty';
        empty.dataset.nsitFilterSearchEmpty = '';
        empty.textContent = '没有符合搜索条件的规则。';
        list.append(empty);
      }
    } else {
      empty?.remove();
    }
  }

  function renderPostFilterPanel() {
    const panel = document.querySelector('[data-nsit-post-filter-panel]');
    if (!panel) return;
    const state = panel._nsitPostFilterState || { tab: 'block', query: '', editingId: '' };
    const rules = postFilterRules();
    const visible = rules.filter((rule) => state.tab === 'highlight' ? rule.action === 'highlight' : rule.action !== 'highlight');
    const editing = rules.find((rule) => rule.id === state.editingId);
    const ruleForm = editing || { keywords: '', keywordMode: 'any', author: '', action: state.tab === 'highlight' ? 'highlight' : 'fold', color: '#fff9c4', enabled: true };
    const form = state.editingId === 'new' || editing ? `<form data-nsit-post-filter-form class="nsit-filter-rule-form">
      <div class="nsit-filter-keywords"><label>关键词<input name="keywords" value="${escapeHtml(ruleForm.keywords)}" placeholder="可选；用逗号分隔多个关键词"></label><span class="nsit-filter-keyword-mode"><span>关键词关系</span><span role="group" aria-label="关键词关系"><label><input type="radio" name="keywordMode" value="any"${ruleForm.keywordMode !== 'all' ? ' checked' : ''}>任一</label><label><input type="radio" name="keywordMode" value="all"${ruleForm.keywordMode === 'all' ? ' checked' : ''}>全部</label></span></span></div>
      <label>用户昵称<input name="author" value="${escapeHtml(ruleForm.author)}" placeholder="可选；逗号分隔，任一昵称完全匹配"></label>
      <label>处理方式<select name="action"><option value="fold"${ruleForm.action === 'fold' ? ' selected' : ''}>折叠展示</option><option value="hide"${ruleForm.action === 'hide' ? ' selected' : ''}>彻底隐藏</option><option value="highlight"${ruleForm.action === 'highlight' ? ' selected' : ''}>高亮</option></select></label>
      <label class="nsit-filter-color-field${ruleForm.action === 'highlight' ? '' : ' is-hidden'}">高亮颜色<input name="color" type="color" value="${escapeHtml(ruleForm.color)}"></label>
      <div class="nsit-filter-form-actions"><button type="button" data-nsit-filter-action="cancel-edit">取消</button><button type="submit">${editing ? '保存条件' : '添加条件'}</button></div>
    </form>` : '';
    const list = visible.length ? visible.map((rule) => `<li class="${rule.enabled ? '' : 'is-disabled'}" data-nsit-filter-search-text="${escapeHtml(`${rule.keywords} ${rule.author} ${postFilterRuleSummary(rule)}`.toLocaleLowerCase())}"><span class="nsit-filter-rule-color" style="background:${escapeHtml(rule.action === 'highlight' ? rule.color : rule.action === 'hide' ? '#d85b5b' : '#d89b32')}"></span><div class="nsit-filter-rule-copy"><strong>${escapeHtml(postFilterRuleTitle(rule))}</strong><small>${escapeHtml(postFilterRuleDetail(rule))}</small></div><span class="nsit-filter-rule-tools"><label class="nsit-filter-switch" title="${rule.enabled ? '禁用条件' : '启用条件'}"><input type="checkbox" data-nsit-filter-toggle="${escapeHtml(rule.id)}"${rule.enabled ? ' checked' : ''}><i></i></label><span class="nsit-filter-rule-actions"><button type="button" data-nsit-filter-action="edit" data-rule-id="${escapeHtml(rule.id)}">编辑</button><button type="button" data-nsit-filter-action="delete" data-rule-id="${escapeHtml(rule.id)}">删除</button></span></span></li>`).join('') : '<li class="nsit-filter-empty">还没有符合条件的规则。</li>';
    panel.innerHTML = `<div class="nsit-filter-panel-head"><strong>内容与用户过滤</strong><button type="button" data-nsit-filter-action="close" aria-label="关闭">×</button></div><div class="nsit-filter-toolbar"><input type="search" data-nsit-filter-search value="${escapeHtml(state.query)}" placeholder="搜索过滤条件"><button type="button" data-nsit-filter-action="new">＋ 新增</button></div><div class="nsit-filter-tabs"><button type="button" data-nsit-filter-tab="block" class="${state.tab === 'block' ? 'is-active' : ''}">🚫 屏蔽</button><button type="button" data-nsit-filter-tab="highlight" class="${state.tab === 'highlight' ? 'is-active' : ''}">🎨 高亮</button><button type="button" class="nsit-filter-clear" data-nsit-filter-action="clear">清空当前组</button></div>${form}<ul class="nsit-filter-rule-list">${list}</ul>`;
    panel._nsitPostFilterState = state;
    filterPostFilterRuleList(panel);
  }

  function ensurePostFilterPanel() {
    let panel = document.querySelector('[data-nsit-post-filter-panel]');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'nsit-post-filter-panel';
    panel.dataset.nsitPostFilterPanel = '';
    document.body.append(panel);
    panel.addEventListener('input', (event) => {
      if (event.target.matches('[name="keywords"], [name="author"]')) event.target.form?.querySelector('[name="keywords"]')?.setCustomValidity('');
      if (event.target.matches('[data-nsit-filter-search]')) {
        panel._nsitPostFilterState.query = event.target.value.toLocaleLowerCase();
        filterPostFilterRuleList(panel);
      }
    });
    panel.addEventListener('change', (event) => {
      const id = event.target.dataset.nsitFilterToggle;
      if (id) {
        savePostFilterRules(postFilterRules().map((rule) => rule.id === id ? { ...rule, enabled: event.target.checked } : rule));
        filterPostListItems({ reapply: true }); renderPostFilterPanel();
        return;
      }
      if (!event.target.matches('[name="action"]')) return;
      const color = event.target.form?.querySelector('.nsit-filter-color-field');
      if (color) color.classList.toggle('is-hidden', event.target.value !== 'highlight');
    });
    panel.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-nsit-post-filter-form]')) return;
      event.preventDefault();
      const values = new FormData(event.target);
      const state = panel._nsitPostFilterState;
      const existing = postFilterRules().find((rule) => rule.id === state.editingId);
      const next = { id: state.editingId === 'new' ? `${Date.now()}-${Math.random().toString(36).slice(2)}` : state.editingId, keywords: String(values.get('keywords') || '').trim(), keywordMode: values.get('keywordMode') === 'all' ? 'all' : 'any', author: String(values.get('author') || '').trim(), action: values.get('action'), color: String(values.get('color') || '#fff9c4'), enabled: existing?.enabled !== false, createdAt: Date.now() };
      if (!postFilterKeywords(next).length && !next.author) {
        event.target.querySelector('[name="keywords"]')?.setCustomValidity('请至少填写关键词或用户昵称');
        event.target.querySelector('[name="keywords"]')?.reportValidity();
        return;
      }
      const rules = postFilterRules();
      const index = rules.findIndex((rule) => rule.id === next.id);
      if (index >= 0) rules[index] = { ...rules[index], ...next }; else rules.unshift(next);
      savePostFilterRules(rules); state.editingId = ''; filterPostListItems({ reapply: true }); renderPostFilterPanel();
    });
    panel.addEventListener('click', (event) => {
      const action = event.target.closest('[data-nsit-filter-action]')?.dataset.nsitFilterAction;
      const id = event.target.closest('[data-rule-id]')?.dataset.ruleId;
      const state = panel._nsitPostFilterState;
      if (event.target.matches('[data-nsit-filter-tab]')) { state.tab = event.target.dataset.nsitFilterTab; state.editingId = ''; renderPostFilterPanel(); return; }
      if (action === 'close') { panel.classList.remove('is-open'); return; }
      if (action === 'new') { state.editingId = 'new'; renderPostFilterPanel(); return; }
      if (action === 'cancel-edit') { state.editingId = ''; renderPostFilterPanel(); return; }
      if (action === 'edit') { state.editingId = id; renderPostFilterPanel(); return; }
      if (action === 'delete') { savePostFilterRules(postFilterRules().filter((rule) => rule.id !== id)); filterPostListItems({ reapply: true }); renderPostFilterPanel(); return; }
      if (action === 'clear') {
        const group = state.tab === 'highlight' ? '高亮' : '屏蔽';
        if (!window.confirm(`确定清空“${group}”组的全部过滤条件吗？此操作无法撤销。`)) return;
        savePostFilterRules(postFilterRules().filter((rule) => state.tab === 'highlight' ? rule.action !== 'highlight' : rule.action === 'highlight'));
        filterPostListItems({ reapply: true }); renderPostFilterPanel();
      }
    });
    return panel;
  }

  function openPostFilterPanel() {
    const panel = ensurePostFilterPanel();
    panel.classList.add('is-open');
    renderPostFilterPanel();
  }

  function ensurePostFilterTrigger() {
    const head = document.querySelector('#nsk-head');
    if (!head || head.querySelector('[data-nsit-post-filter-trigger]')) return;
    let group = head.querySelector('[data-nsit-post-filter-icon-group]');
    if (!group) {
      group = document.createElement('div');
      group.className = 'right-button-group';
      group.dataset.nsitPostFilterIconGroup = '';
      const anchor = head.querySelector('.color-theme-switcher, .search-box');
      if (anchor?.parentElement === head) head.insertBefore(group, anchor);
      else head.append(group);
    }
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'nsit-post-filter-trigger'; trigger.dataset.nsitPostFilterTrigger = '';
    trigger.title = '关键字过滤管理'; trigger.setAttribute('aria-label', trigger.title);
    trigger.innerHTML = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M6 9L20.4 25.8178V38.4444L27.6 42V25.8178L42 9H6Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>';
    trigger.addEventListener('click', openPostFilterPanel);
    group.append(trigger);
  }

  function installPostFilters() {
    if (window[POST_FILTER_RUNTIME_KEY]) return;
    window[POST_FILTER_RUNTIME_KEY] = true;
    GM_addStyle('#nsk-head [data-nsit-post-filter-icon-group]{display:flex;align-items:center;gap:0;border-left:1px solid var(--border-color,#e5e7eb);margin-left:6px;padding-left:6px;height:30px}.nsit-post-filter-trigger{display:inline-grid;place-items:center;width:30px;height:30px;margin:0;padding:0 6px;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer}.nsit-post-filter-trigger:hover{background:rgba(127,142,164,.16)}.nsit-post-filter-trigger svg{width:17px;height:17px}.post-list-item.nsit-filter-hidden{display:none!important}.post-list-item.nsit-filter-highlighted{background:var(--nsit-filter-highlight)!important}.post-list-item.nsit-filter-folded>:not(.nsit-filter-fold-notice){display:none!important}.nsit-filter-fold-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;color:#7e5c1d;font-size:13px}.nsit-filter-fold-notice button{border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.nsit-post-filter-panel{position:fixed;z-index:2147483647;top:62px;right:18px;display:none;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 80px);overflow:auto;border:1px solid #d8e0eb;border-radius:10px;background:#fff;color:#27334a;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 16px 42px rgba(31,44,67,.24)}.nsit-post-filter-panel.is-open{display:block}.nsit-filter-panel-head,.nsit-filter-toolbar,.nsit-filter-tabs,.nsit-filter-form-actions{display:flex;align-items:center;gap:8px}.nsit-filter-panel-head{box-sizing:border-box;height:48px;margin:0;padding:8px 14px;border:0;border-bottom:1px solid #e5eaf1;background:#fff}.nsit-filter-panel-head strong{font-size:16px;line-height:1.2}.nsit-filter-panel-head button{display:grid;place-items:center;flex:none;width:28px;height:28px;margin:0 0 0 auto;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#62708a!important;font:22px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;cursor:pointer}.nsit-filter-panel-head button:hover{background:#f0f3f8!important;color:#27334a!important}.nsit-filter-toolbar{padding:12px 14px 8px}.nsit-filter-toolbar input{min-width:0;flex:1}.nsit-post-filter-panel input,.nsit-post-filter-panel select{box-sizing:border-box;width:100%;border:1px solid #d8e0eb;border-radius:6px;padding:7px 8px;background:#fff;color:inherit;font:inherit}.nsit-post-filter-panel button{border:1px solid #d8e0eb;border-radius:6px;background:#fff;color:#40506a;padding:6px 9px;font:inherit;cursor:pointer}.nsit-filter-tabs{padding:0 14px 10px;border-bottom:1px solid #e5eaf1}.nsit-filter-clear{margin-left:auto!important;border-color:#e9c3c7!important;background:#fff8f8!important;color:#a04e59!important}.nsit-filter-tabs .is-active{border-color:#d9961c;background:#fff8ea;color:#875800}.nsit-filter-rule-form{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:0;padding:14px;border:0;border-bottom:1px solid #e5eaf1;background:#fbfcfe}.nsit-filter-rule-form label{display:grid;gap:4px;color:#506078;font-size:12px}.nsit-filter-keywords{display:grid;grid-column:1/-1;grid-template-columns:minmax(0,1fr) auto;gap:9px}.nsit-filter-keywords>label,.nsit-filter-keyword-mode{display:grid;gap:4px;color:#506078;font-size:12px}.nsit-filter-keyword-mode>span:first-child{line-height:1.45}.nsit-filter-keyword-mode>[role="group"]{display:flex;align-items:center;gap:8px;min-height:34px}.nsit-filter-keyword-mode label{display:flex;align-items:center;gap:3px;color:#506078;cursor:pointer}.nsit-filter-keyword-mode input{width:15px;height:15px;margin:0;padding:0;accent-color:#3976bc}.nsit-filter-rule-form .nsit-filter-form-actions{grid-column:1/-1}.nsit-filter-rule-form input[type="color"]{height:34px;padding:3px}.nsit-filter-color-field.is-hidden{display:none}.nsit-filter-form-actions{justify-content:flex-end;margin:5px -14px -14px;padding:12px 14px;border-top:1px solid #e5eaf1;background:#fff}.nsit-filter-form-actions button:last-child{border-color:#3976bc;background:#3976bc;color:#fff}.nsit-filter-rule-list{display:grid;gap:0;margin:0;padding:0;list-style:none}.nsit-filter-rule-list li{display:grid;grid-template-columns:9px minmax(0,1fr) auto;align-items:center;column-gap:14px;margin:0;padding:8px 14px;border-bottom:1px solid #edf1f5}.nsit-filter-rule-list li[hidden]{display:none}.nsit-filter-rule-list li.is-disabled{opacity:.5}.nsit-filter-rule-copy{display:grid;gap:1px;min-width:0}.nsit-filter-rule-list strong,.nsit-filter-rule-list small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nsit-filter-rule-list strong{line-height:20px}.nsit-filter-rule-list small{color:#718096;font-size:12px;line-height:17px}.nsit-filter-rule-color{width:9px;height:30px;border-radius:99px}.nsit-filter-rule-tools{display:flex;align-items:center;gap:9px;height:28px;white-space:nowrap}.nsit-filter-switch{position:relative;display:block;flex:none;width:30px;height:18px;cursor:pointer}.nsit-filter-switch input{position:absolute;opacity:0}.nsit-filter-switch i{display:block;width:30px;height:18px;border-radius:99px;background:#aebacd}.nsit-filter-switch i::after{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;content:"";transition:transform .15s}.nsit-filter-switch input:checked+i{background:#41a76c}.nsit-filter-switch input:checked+i::after{transform:translateX(12px)}.nsit-filter-rule-actions{display:flex;align-items:center;gap:2px;height:28px;white-space:nowrap}.nsit-filter-rule-actions button{display:inline-flex;align-items:center;height:28px;margin:0;padding:0 4px;border:0;background:transparent;color:#3976bc;font-size:12px;line-height:1}.nsit-filter-rule-actions button:hover{background:transparent;color:#245892;text-decoration:underline}.nsit-filter-rule-actions button[data-nsit-filter-action="delete"]{color:#b4515d}.nsit-filter-rule-actions button[data-nsit-filter-action="delete"]:hover{color:#913945}.nsit-filter-empty{margin:0;padding:22px 14px;color:#718096;text-align:center}');
    ensurePostFilterTrigger();
    filterPostListItems();
  }

  function renderRepliedPostLabels() {
    let posts = {};
    const storageKey = repliedPostsStorageKey();
    if (!storageKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) posts = saved;
    } catch (_) { /* 无法读取本地记录时不展示标签 */ }

    document.querySelectorAll('.post-list-item').forEach((item) => {
      const postId = postIdFromUrl(item.querySelector('.post-title a[href*="/post-"]')?.getAttribute('href'));
      const content = item.querySelector('.post-list-content');
      const existing = item.querySelector('[data-nsit-replied-post-label]');
      if (!postId || !content || !Array.isArray(posts[postId]) || !posts[postId].length) {
        existing?.remove();
        return;
      }
      if (existing) return;
      const label = document.createElement('span');
      label.className = 'nsit-replied-post-label-badge';
      label.dataset.nsitRepliedPostLabel = '';
      label.textContent = '已回复';
      content.append(label);
    });
  }

  function scrollToRepliedFloor(floorId) {
    const escapedFloor = CSS.escape(String(floorId));
    const directTarget = document.querySelector(`#comment-${escapedFloor}, #floor-${escapedFloor}, [data-floor-id="${escapedFloor}"], [data-floor="${escapedFloor}"], [data-comment-floor="${escapedFloor}"]`);
    const floorLink = Array.from(document.querySelectorAll('a[href]')).find((link) => {
      const href = link.getAttribute('href') || '';
      return href === `#${floorId}` || href === `#comment-${floorId}` || href.includes(`floor_id=${floorId}`);
    });
    const target = directTarget || floorLink?.closest('.comment, [class*="comment"]') || floorLink;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const postId = currentPostId();
    if (!postId) return;
    const page = Math.floor((floorId - 1) / 10) + 1;
    location.assign(`/post-${postId}-${page}#${floorId}`);
  }

  function renderRepliedPostMenu() {
    const postId = currentPostId();
    const menu = document.querySelector('.comment-menu');
    const current = document.querySelector('[data-nsit-replied-post-menu]');
    const floors = postId ? repliedFloors(postId) : [];
    if (!menu || !floors.length) {
      current?.remove();
      return;
    }

    const visible = floors.slice(0, 10);
    const extra = floors.slice(10);
    const signature = floors.join(',');
    const post = menu.closest('.nsk-post');
    const title = post?.querySelector('.post-title');
    const topPager = document.querySelector('.post-top-pager');
    const pagerNavigation = topPager?.querySelector('[role="navigation"]');
    const pagerRow = topPager?.parentElement;
    const showWithPager = currentPostPage() > 1 && Boolean(pagerNavigation && pagerRow);
    if (current?.dataset.nsitRepliedFloors === signature) {
      if (showWithPager) {
        if (current.parentElement !== pagerRow || current.nextElementSibling !== topPager) {
          current.classList.add('nsit-replied-post-menu--pager');
          topPager.before(current);
        }
      } else if (title && current.previousElementSibling !== title) {
        current.classList.remove('nsit-replied-post-menu--pager');
        title.after(current);
      }
      return;
    }
    current?.remove();

    const tracker = document.createElement('span');
    tracker.className = 'nsit-replied-post-menu';
    tracker.dataset.nsitRepliedPostMenu = '';
    tracker.dataset.nsitRepliedFloors = signature;
    tracker.innerHTML = `<span class="nsit-replied-post-label">我的回复</span>${visible.map((floor) => `<button type="button" data-nsit-replied-floor="${floor}">#${floor}</button>`).join('')}${extra.length ? `<span class="nsit-replied-more-wrap"><button type="button" data-nsit-replied-more aria-expanded="false">更多 (${extra.length})</button><span class="nsit-replied-more-panel" hidden>${extra.map((floor) => `<button type="button" data-nsit-replied-floor="${floor}">#${floor}</button>`).join('')}</span></span>` : ''}`;
    if (showWithPager) {
      tracker.classList.add('nsit-replied-post-menu--pager');
      topPager.before(tracker);
    }
    else if (title) title.after(tracker);
    else (menu.closest('.content-item') || menu.parentElement)?.before(tracker);
  }

  async function syncRepliedComments() {
    const uid = currentNodeSeekUserId();
    if (!uid || !currentPostId()) return;
    const before = repliedFloors(currentPostId());
    const hasLocalData = before.length > 0;
    for (let page = 1; page <= 3; page += 1) {
      try {
        const response = await fetch(`/api/content/list-comments?uid=${encodeURIComponent(uid)}&page=${page}`);
        const payload = await response.json();
        if (!response.ok || !payload?.success || !Array.isArray(payload.comments)) return;
        const encounteredKnownComment = hasLocalData && payload.comments.some((comment) => before.includes(Number(comment?.floor_id)) && String(comment?.post_id) === currentPostId());
        mergeRepliedComments(payload);
        if (encounteredKnownComment || !payload.comments.length) return;
      } catch (_) {
        return;
      }
    }
  }

  function isOwnCommentListRequest(url) {
    try {
      const requestUrl = new URL(url, location.href);
      return requestUrl.origin === location.origin
        && requestUrl.pathname === '/api/content/list-comments'
        && requestUrl.searchParams.get('uid') === currentNodeSeekUserId();
    } catch (_) {
      return false;
    }
  }

  function installCommentListResponseListener() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    if (pageWindow[COMMENT_LISTENER_KEY]) return;

    GM_addStyle('.nsit-replied-post-menu{position:relative;display:flex;box-sizing:border-box;align-items:center;flex-wrap:wrap;gap:5px;width:100%;max-width:100%;margin:0 0 10px;padding:8px 10px;border:1px solid #f0d49c;border-radius:7px;background:#fff8e9;color:#8b641e;font-size:12px;line-height:1.4}.nsit-replied-post-menu--pager{display:inline-flex;width:fit-content;max-width:100%;margin:0 auto 0 0;padding:7px 10px}.nsit-replied-post-label{margin-right:2px;font-weight:600;white-space:nowrap}.nsit-replied-post-menu button{margin:0;padding:0;border:0;background:transparent;color:#3976bc;font:inherit;font-size:12px;cursor:pointer}.nsit-replied-post-menu button:hover{text-decoration:underline}.nsit-replied-more-wrap{position:relative;display:inline-flex}.nsit-replied-more-panel{position:absolute;z-index:1000;top:calc(100% + 6px);right:0;display:flex;flex-wrap:wrap;gap:6px;width:max-content;max-width:240px;padding:8px;border:1px solid #d8e0eb;border-radius:7px;background:#fff;box-shadow:0 8px 18px rgba(31,44,67,.18)}.post-list-item:has(.nsit-replied-post-label-badge){position:relative;background:rgba(239,250,243,.82)}.nsit-replied-post-label-badge{position:absolute;z-index:1;right:56px;bottom:7px;display:inline-block;margin:0;padding:2px 6px;border:1px solid #9ad6b1;border-radius:4px;background:#effaf3;color:#27834a;font-size:12px;line-height:16px;pointer-events:none}');
    document.addEventListener('click', (event) => {
      const floorButton = event.target.closest('[data-nsit-replied-floor]');
      if (floorButton) {
        event.preventDefault();
        scrollToRepliedFloor(Number(floorButton.dataset.nsitRepliedFloor));
        floorButton.closest('[data-nsit-replied-post-menu]')?.querySelector('[data-nsit-replied-more-panel]')?.setAttribute('hidden', '');
        floorButton.closest('[data-nsit-replied-post-menu]')?.querySelector('[data-nsit-replied-more]')?.setAttribute('aria-expanded', 'false');
        return;
      }
      const moreButton = event.target.closest('[data-nsit-replied-more]');
      if (moreButton) {
        const panel = moreButton.parentElement?.querySelector('[data-nsit-replied-more-panel]');
        if (!panel) return;
        panel.hidden = !panel.hidden;
        moreButton.setAttribute('aria-expanded', String(!panel.hidden));
        return;
      }
      document.querySelectorAll('[data-nsit-replied-more-panel]:not([hidden])').forEach((panel) => { panel.hidden = true; });
      document.querySelectorAll('[data-nsit-replied-more][aria-expanded="true"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    });

    const handleResponse = (response) => {
      if (!response?.ok) return;
      response.clone().json().then(mergeRepliedComments).catch(() => {});
    };
    const originalFetch = pageWindow.fetch;
    if (typeof originalFetch === 'function') {
      pageWindow.fetch = function (...args) {
        const response = originalFetch.apply(this, args);
        const request = args[0];
        const url = typeof request === 'string' || request instanceof URL ? request : request?.url;
        if (isOwnCommentListRequest(url)) Promise.resolve(response).then(handleResponse).catch(() => {});
        return response;
      };
    }

    const xhrPrototype = pageWindow.XMLHttpRequest?.prototype;
    if (xhrPrototype) {
      const originalOpen = xhrPrototype.open;
      const originalSend = xhrPrototype.send;
      xhrPrototype.open = function (method, url, ...args) {
        this.__nsitCommentListRequest = isOwnCommentListRequest(url);
        return originalOpen.call(this, method, url, ...args);
      };
      xhrPrototype.send = function (...args) {
        if (this.__nsitCommentListRequest) {
          this.addEventListener('load', () => {
            if (this.status < 200 || this.status >= 300) return;
            try {
              const payload = this.responseType === 'json' ? this.response : JSON.parse(this.responseText);
              mergeRepliedComments(payload);
            } catch (_) { /* 非 JSON 或不可读响应直接忽略 */ }
          }, { once: true });
        }
        return originalSend.apply(this, args);
      };
    }

    pageWindow[COMMENT_LISTENER_KEY] = true;
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

  function syncInlineMachineCatalogState(app) {
    const values = formValues(app);
    const required = !(String(values.vendor || '').trim() && String(values.model || '').trim());
    app.classList.toggle('nsit-catalog-required', required);
    app.classList.toggle('nsit-machine-catalog-ready', !required);
    if (required) app.classList.add('nsit-inline-catalog-open');
    else app.classList.remove('nsit-inline-catalog-open');
    return required;
  }

  function renderInlineMachineCatalogResults(app, records) {
    const container = app.querySelector('[data-nsit-inline-catalog-results]');
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="nsit-catalog-empty">没有找到匹配的机器配置。</p>';
      return;
    }
    container.innerHTML = records.map((record, index) => `<button type="button" class="nsit-inline-catalog-result" data-nsit-inline-catalog-result="${index}"><strong>${escapeHtml(record.vendor)} · ${escapeHtml(record.model)}</strong><span class="nsit-inline-catalog-spec"><span>${escapeHtml(record.cpu)} · ${escapeHtml(record.memory)} · ${escapeHtml(record.disk)}</span><small>@${escapeHtml(record.submittedByNickname)}</small></span><span>流量 ${escapeHtml(record.traffic)} · 带宽 ${escapeHtml(record.bandwidth)}</span></button>`).join('');
    app._nsitInlineCatalogResults = records;
  }

  async function loadInlineMachineCatalog(app) {
    const input = app.querySelector('[data-nsit-inline-catalog-search]');
    const container = app.querySelector('[data-nsit-inline-catalog-results]');
    if (!input || !container) return;
    const query = input.value.trim();
    app._nsitInlineCatalogSearchAbort?.abort();
    app._nsitInlineCatalogSearchSignature = query;
    if (!MACHINE_CATALOG_API_URL) {
      container.innerHTML = '<p class="nsit-catalog-empty">共享配置服务尚未配置。</p>';
      return;
    }
    container.innerHTML = '<p class="nsit-catalog-empty">正在加载机器配置…</p>';
    try {
      const controller = new AbortController();
      app._nsitInlineCatalogSearchAbort = controller;
      const response = await fetch(catalogApiUrl('v1/public/machine-configs', { q: query, limit: 30 }), { signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `查询失败（HTTP ${response.status}）`);
      if (app._nsitInlineCatalogSearchSignature !== query) return;
      renderInlineMachineCatalogResults(app, data.records || []);
    } catch (error) {
      if (error?.name === 'AbortError' || app._nsitInlineCatalogSearchSignature !== query) return;
      container.innerHTML = `<p class="nsit-catalog-empty">${escapeHtml(error.message || '查询失败，请稍后重试。')}</p>`;
    }
  }

  function scheduleInlineMachineCatalogSearch(app, immediate = false) {
    clearTimeout(app._nsitInlineCatalogSearchTimer);
    if (immediate) {
      loadInlineMachineCatalog(app);
      return;
    }
    app._nsitInlineCatalogSearchTimer = setTimeout(() => loadInlineMachineCatalog(app), 220);
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
    syncInlineMachineCatalogState(app);
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
    syncInlineMachineCatalogState(app);
    closeMachineCatalog(app);
    setStatus(app, '已回填共享配置。');
  }

  function applyInlineMachineCatalogRecord(app, record) {
    MACHINE_CATALOG_FIELDS.forEach((name) => {
      const control = app.querySelector(`[name="${CSS.escape(name)}"]`);
      if (control) control.value = record[name] || '';
    });
    refreshVendorPicker(app.querySelector('.nsit-vendor-picker'));
    refreshTitle(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
    saveActiveMachine(app); renderMachineTabs(app);
    syncInlineMachineCatalogState(app);
    closeModelSuggestions(app);
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
    if (app.classList.contains('nsit-generating')) return;
    setGenerating(app, true);
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
      const title = app.dataset.nsitReplyMode === 'true' ? '' : machines.length > 1 ? multiMachineTitle(machines, app) : String(shared.postTitle || '').trim();
      if (title && titleField) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(titleField, title);
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const didFill = setEditorContent(app, content);
      if (didFill && app.dataset.nsitReplyMode !== 'true') selectTradeCategory();
      setStatus(app, didFill ? (app.dataset.nsitReplyMode === 'true' ? '已回填回帖 Markdown；请检查后手动发布。' : '已回填标题和 Markdown；请检查后手动发布。') : '未找到 NodeSeek 正文编辑器，请刷新页面后重试。');
      if (didFill) closeModal(app);
      if (didFill && app.dataset.nsitReplyMode !== 'true' && app.querySelector('[name="checkMachineConfig"]')?.checked) offerMissingMachineConfigs(app, machines);
    } catch (error) {
      console.error('[NSIT]', '生成异常', error);
      setStatus(app, `生成失败：${error?.message || '未知错误'}`);
    } finally {
      setGenerating(app, false);
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

  /* 抽奖 ---------------------------------------------------------------------
   * 发帖页一次性配置，发布后自动把抽奖信息写进正文；只对本标签页的下一次发布生效。
   * ------------------------------------------------------------------------- */

  let luckyArmedCache;
  let luckyWritebackRunning = false;
  let luckyStylesReady = false;

  function luckyEditorPage() {
    return Boolean(document.querySelector('#mde-title')) && !currentPostId();
  }

  // 用 localStorage 而不是 sessionStorage：发布后 NodeSeek 可能开新页签展示新帖，
  // sessionStorage 只在同一个浏览上下文里可见，跨页签会丢 armed 配置。
  // LUCKY_ARMED_KEY 自带 submitAt + 10 分钟窗口，语义仍是“单次有效”。
  function luckyReadStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function luckyWriteStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* 存储不可用时忽略 */ }
  }

  function luckyRemoveStorage(key) {
    try { localStorage.removeItem(key); } catch (_) { /* 存储不可用时忽略 */ }
  }

  function luckyArmedConfig() {
    if (luckyArmedCache === undefined) luckyArmedCache = luckyReadStorage(LUCKY_ARMED_KEY);
    return luckyArmedCache;
  }

  function saveLuckyArmedConfig(config) {
    luckyArmedCache = config;
    luckyWriteStorage(LUCKY_ARMED_KEY, config);
  }

  function clearLuckyArmedConfig() {
    luckyArmedCache = null;
    luckyRemoveStorage(LUCKY_ARMED_KEY);
  }

  function luckyPad(value) {
    return String(value).padStart(2, '0');
  }

  function luckyTimeText(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${luckyPad(date.getMonth() + 1)}-${luckyPad(date.getDate())} ${luckyPad(date.getHours())}:${luckyPad(date.getMinutes())}`;
  }

  function luckyTimeInputValue(timestamp) {
    const date = new Date(timestamp);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function luckyTimestampFromInput(value) {
    const timestamp = new Date(String(value || '').trim().replace(' ', 'T')).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function luckyDefaultTimestamp() {
    const date = new Date(Date.now() + LUCKY_DEFAULT_HOURS * 60 * 60 * 1000);
    date.setSeconds(0, 0);
    return date.getTime();
  }

  function luckyInteger(value, fallback, minimum) {
    const text = String(value ?? '').trim();
    const number = Number(text);
    return text && Number.isFinite(number) ? Math.max(minimum, Math.floor(number)) : fallback;
  }

  function luckyNormalized(source) {
    const config = source && typeof source === 'object' ? source : {};
    const show = config.show && typeof config.show === 'object' ? config.show : {};
    const keyword = String(config.keyword || '').trim();
    const exact = String(config.exact || '').trim();
    const reply = LUCKY_REPLY_OPTIONS.some(([value]) => value === config.reply) ? config.reply : 'any';
    return {
      time: luckyInteger(config.time, luckyDefaultTimestamp(), 1),
      count: luckyInteger(config.count, 1, 1),
      start: luckyInteger(config.start, 1, 0),
      dedupe: config.dedupe !== false,
      reply: (reply === 'contains' && !keyword) || (reply === 'exact' && !exact) ? 'any' : reply,
      keyword,
      exact,
      interactions: Array.isArray(config.interactions) ? config.interactions.filter((value) => LUCKY_INTERACTION_OPTIONS.some(([key]) => key === value)) : [],
      fallback: config.fallback !== false,
      position: config.position === 'start' ? 'start' : 'end',
      heading: typeof config.heading === 'string' ? config.heading.trim() : LUCKY_DEFAULT_HEADING,
      show: { participation: show.participation !== false, time: show.time !== false, count: show.count !== false },
      title: String(config.title || '').trim(),
      insertedText: String(config.insertedText || ''),
      submitAt: Number(config.submitAt) || 0,
      createdAt: Number(config.createdAt) || Date.now(),
      // 回写重试次数：持久化在配置里，刷新页面后继续累计
      writebackAttempts: Number(config.writebackAttempts) || 0,
    };
  }

  function luckyLink(config, postId) {
    const query = [['post', postId], ['time', config.time], ['count', config.count], ['start', config.start], ['duplicate', config.dedupe ? 'false' : 'true'], ['mode', 'view']]
      .map(([key, value]) => `${key}=${value}`).join('&');
    return `https://www.nodeseek.com/lucky?${query}`;
  }

  function luckyReplyText(config) {
    if (config.reply === 'any') return '回复本帖';
    if (config.reply === 'contains') return '回复内容需包含';
    if (config.reply === 'exact') return '回复内容需为';
    return '';
  }

  function luckyInteractionText(config) {
    const parts = [];
    if (config.interactions.includes('like')) parts.push('点赞本帖');
    if (config.interactions.includes('chicken')) parts.push('给本帖加鸡腿');
    return parts.join('、');
  }

  function luckyParticipationText(config) {
    // 互动放在回复内容前面
    return [luckyInteractionText(config), luckyReplyText(config)].filter(Boolean).join('，且');
  }

  function luckyQuotedReply(config) {
    if (config.reply === 'contains') return config.keyword;
    if (config.reply === 'exact') return config.exact;
    return '';
  }

  function luckyHasCondition(config) {
    return config.reply !== 'any' || config.interactions.length > 0;
  }

  function luckyBlockMarkdown(config, postId) {
    const lines = [];
    if (config.show.participation) {
      const participation = luckyParticipationText(config);
      if (participation) {
        lines.push(`参与方式：${participation}`);
        const quoted = luckyQuotedReply(config);
        if (quoted) {
          lines.push(`> ${quoted}`);
          // 引用行后面要空一行，否则后面的内容会被当成引用的懒延续
          lines.push('');
        }
      }
      if (config.fallback && luckyHasCondition(config)) lines.push('不满足条件时顺延至下一位');
    }
    if (config.show.time) lines.push(`开奖时间：${luckyTimeText(config.time)}`);
    if (config.show.count) lines.push(`中奖人数：${config.count}`);
    lines.push(`开奖链接：[${LUCKY_DEFAULT_LINK_TEXT}](${luckyLink(config, postId)})`);
    return (config.heading ? [config.heading, ...lines] : lines).join('\n');
  }

  function luckyInsertContent(content, block, position) {
    const base = String(content || '').trimEnd();
    if (!base) return block;
    return position === 'start' ? `${block}\n\n${base}` : `${base}\n\n${block}`;
  }

  function luckyTriggerButton() {
    return document.querySelector('[data-nsit-lucky-trigger]');
  }

  function luckyDialogElement() {
    return document.querySelector('[data-nsit-lucky-modal]');
  }

  function luckySubmitButton() {
    const title = document.querySelector('#mde-title');
    if (!title) return null;
    const scopes = [title.closest('form'), document.querySelector('#editor-body')?.closest('form'), document].filter(Boolean);
    const seen = new Set();
    const buttons = scopes
      .flatMap((scope) => Array.from(scope.querySelectorAll('button.submit.btn, button.submit, .submit.btn, button[type="submit"], button')))
      .filter((button) => {
        if (seen.has(button)) return false;
        seen.add(button);
        return !button.closest(`#${APP_ID}`) && !button.hasAttribute('data-nsit-lucky-trigger') && !button.disabled;
      });
    return buttons.find((button) => /^\s*发布/.test(button.textContent.trim()) && !/草稿/.test(button.textContent))
      || buttons.find((button) => button.matches('button.submit.btn, button.submit, .submit.btn'))
      || buttons.find((button) => button.matches('button[type="submit"]'))
      || null;
  }

  function injectLuckyStyles() {
    if (luckyStylesReady) return;
    luckyStylesReady = true;
    injectStyles(luckyStyles());
  }

  function ensureLuckyDialog() {
    let dialog = luckyDialogElement();
    if (!dialog) {
      const holder = document.createElement('div');
      holder.innerHTML = luckyDialogMarkup();
      dialog = holder.firstElementChild;
      document.body.append(...holder.children);
    }
    return dialog;
  }

  function renderLuckyTrigger() {
    const submit = luckyEditorPage() ? luckySubmitButton() : null;
    const trigger = luckyTriggerButton();
    if (!submit) {
      trigger?.remove();
      return;
    }
    injectLuckyStyles();
    ensureLuckyDialog();
    let button = trigger;
    if (!button) {
      const holder = document.createElement('div');
      holder.innerHTML = luckyTriggerMarkup();
      button = holder.firstElementChild;
    }
    if (button.nextElementSibling !== submit) submit.before(button);
    if (!button._nsitLuckyPlaced) {
      button._nsitLuckyPlaced = true;
      const rect = button.getBoundingClientRect();
      const submitRect = submit.getBoundingClientRect();
      // 发布按钮通常靠 margin-left:auto 贴右边，这段空档会落在两个按钮之间；
      // 把 auto 外边距让给抽奖配置按钮，发布按钮位置不变，抽奖配置紧贴它左边
      if (rect.width && submitRect.width && submitRect.left - rect.right > 48) {
        submit.style.marginLeft = '0';
        button.style.marginLeft = 'auto';
        button.style.marginRight = '8px';
      }
    }
    const label = button.querySelector('[data-nsit-lucky-trigger-label]');
    const stored = luckyArmedConfig();
    const config = stored ? luckyNormalized(stored) : null;
    if (config) {
      const title = document.querySelector('#mde-title')?.value.trim() || '';
      if (title !== config.title) saveLuckyArmedConfig({ ...config, title });
    }
    const armed = Boolean(config);
    const nextTitle = armed ? `${luckyTimeText(config.time)} 开奖 · ${config.count} 份，点击修改本次抽奖` : '设置本次发布的抽奖';
    const nextLabel = armed ? `抽奖配置 ${luckyTimeText(config.time).slice(5)} · ${config.count} 份` : '抽奖配置';
    if (button.getAttribute('data-nsit-lucky-armed') !== (armed ? '' : null)) {
      if (armed) button.setAttribute('data-nsit-lucky-armed', '');
      else button.removeAttribute('data-nsit-lucky-armed');
    }
    if (button.title !== nextTitle) button.title = nextTitle;
    if (label && label.textContent !== nextLabel) label.textContent = nextLabel;
  }

  function luckyDialogStatus(message) {
    const node = luckyDialogElement()?.querySelector('[data-nsit-lucky-status]');
    if (node) node.textContent = message || '';
  }

  function luckyFieldValues() {
    const dialog = luckyDialogElement();
    const field = (selector) => dialog?.querySelector(selector) || null;
    const reply = field('[name="luckyReply"]:checked')?.value || 'any';
    const replyText = field('[data-nsit-lucky-reply-text]')?.value || '';
    return {
      time: luckyTimestampFromInput(field('[data-nsit-lucky-time]')?.value),
      count: field('[name="luckyCount"]')?.value,
      start: field('[name="luckyStart"]')?.value,
      dedupe: Boolean(field('[name="luckyDedupe"]')?.checked),
      reply,
      keyword: reply === 'contains' ? replyText : '',
      exact: reply === 'exact' ? replyText : '',
      interactions: Array.from(dialog?.querySelectorAll('[name="luckyInteraction"]:checked') || []).map((input) => input.value),
      fallback: Boolean(field('[data-nsit-lucky-fallback]')?.checked),
      position: field('[name="luckyPosition"]:checked')?.value || 'end',
      heading: field('[name="luckyHeading"]')?.value ?? LUCKY_DEFAULT_HEADING,
      show: {
        participation: Boolean(field('[data-nsit-lucky-show="participation"]')?.checked),
        time: Boolean(field('[data-nsit-lucky-show="time"]')?.checked),
        count: Boolean(field('[data-nsit-lucky-show="count"]')?.checked),
      },
    };
  }

  function syncLuckyDialog() {
    const dialog = luckyDialogElement();
    if (!dialog) return;
    const reply = dialog.querySelector('[name="luckyReply"]:checked')?.value || 'any';
    const replyText = dialog.querySelector('[data-nsit-lucky-reply-text]');
    if (replyText) {
      replyText.hidden = reply === 'any';
      replyText.placeholder = reply === 'exact' ? '回复需要填写的内容（完全一致）' : '回复需要包含的文字';
    }
    const interactions = Array.from(dialog.querySelectorAll('[name="luckyInteraction"]:checked')).map((input) => input.value);
    const fallback = dialog.querySelector('[data-nsit-lucky-fallback]');
    if (fallback) fallback.closest('label').hidden = !luckyHasCondition({ reply, interactions });
    const preview = dialog.querySelector('[data-nsit-lucky-preview]');
    if (preview) preview.textContent = luckyBlockMarkdown(luckyNormalized(luckyFieldValues()), LUCKY_POST_ID_PLACEHOLDER);
  }

  function openLuckyDialog() {
    const dialog = ensureLuckyDialog();
    const config = luckyNormalized(luckyArmedConfig());
    const setValue = (selector, value) => {
      const node = dialog.querySelector(selector);
      if (node) node.value = value;
    };
    const setChecked = (selector, checked) => {
      const node = dialog.querySelector(selector);
      if (node) node.checked = checked;
    };
    injectLuckyStyles();
    setValue('[data-nsit-lucky-time]', luckyTimeInputValue(config.time));
    setValue('[name="luckyCount"]', String(config.count));
    setValue('[name="luckyStart"]', String(config.start));
    setValue('[data-nsit-lucky-reply-text]', config.keyword || config.exact);
    setValue('[name="luckyHeading"]', config.heading);
    setChecked('[name="luckyDedupe"]', config.dedupe);
    dialog.querySelectorAll('[name="luckyReply"]').forEach((input) => { input.checked = input.value === config.reply; });
    dialog.querySelectorAll('[name="luckyInteraction"]').forEach((input) => { input.checked = config.interactions.includes(input.value); });
    dialog.querySelectorAll('[name="luckyPosition"]').forEach((input) => { input.checked = input.value === config.position; });
    setChecked('[data-nsit-lucky-fallback]', config.fallback);
    dialog.querySelectorAll('[data-nsit-lucky-show]').forEach((input) => { input.checked = config.show[input.dataset.nsitLuckyShow] !== false; });
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    luckyTriggerButton()?.setAttribute('aria-expanded', 'true');
    luckyDialogStatus('');
    syncLuckyDialog();
  }

  function closeLuckyDialog() {
    const dialog = luckyDialogElement();
    if (!dialog) return;
    closeLuckyConfirm();
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    luckyTriggerButton()?.setAttribute('aria-expanded', 'false');
    luckyDialogStatus('');
  }

  let pendingLuckySave = null;

  function luckyConfirmElement() {
    return document.querySelector('[data-nsit-lucky-confirm]');
  }

  function closeLuckyConfirm() {
    pendingLuckySave = null;
    luckyConfirmElement()?.classList.remove('is-open');
  }

  function saveLuckyFromDialog(mode = 'auto') {
    const values = luckyFieldValues();
    const config = luckyNormalized(values);
    if (!values.time) { luckyDialogStatus('请选择开奖时间。'); return; }
    if (config.time <= Date.now()) { luckyDialogStatus('开奖时间需要晚于当前时间。'); return; }
    if (values.reply === 'contains' && !config.keyword) { luckyDialogStatus('请填写回复需要包含的文字。'); return; }
    if (values.reply === 'exact' && !config.exact) { luckyDialogStatus('请填写回复需要填写的内容。'); return; }
    const previousConfig = luckyArmedConfig();
    const saved = {
      ...config,
      insertedText: String(previousConfig?.insertedText || ''),
      title: document.querySelector('#mde-title')?.value.trim() || '',
      createdAt: Date.now(),
      submitAt: 0,
    };
    if (mode === 'auto' && luckyTemplateNeedsConfirm(saved)) {
      pendingLuckySave = saved;
      luckyConfirmElement()?.classList.add('is-open');
      return;
    }
    if (mode === 'keep') saved.insertedText = '';
    else if (applyLuckyTemplate(saved, mode)) saved.insertedText = luckyTemplateBlock(saved);
    else {
      saveLuckyArmedConfig(saved);
      renderLuckyTrigger();
      luckyDialogStatus('未找到正文编辑器：配置已保存，发布后会写进正文。');
      return;
    }
    closeLuckyConfirm();
    saveLuckyArmedConfig(saved);
    renderLuckyTrigger();
    closeLuckyDialog();
  }

  function luckyNoticeElement() {
    let notice = document.querySelector('[data-nsit-lucky-notice]');
    if (notice) return notice;
    injectLuckyStyles();
    notice = document.createElement('div');
    notice.className = 'nsit-lucky-notice';
    notice.dataset.nsitLuckyNotice = '';
    notice.innerHTML = '<p data-nsit-lucky-notice-text></p><code data-nsit-lucky-notice-link hidden></code><div class="nsit-lucky-notice-actions"><button type="button" data-nsit-lucky-action="copy-link">复制链接</button><button type="button" data-nsit-lucky-action="close-notice">关闭</button></div>';
    document.body.append(notice);
    return notice;
  }

  function showLuckyNotice(message, { link = '', sticky = false, tone = 'info' } = {}) {
    const notice = luckyNoticeElement();
    notice.dataset.nsitLuckyTone = tone;
    notice.querySelector('[data-nsit-lucky-notice-text]').textContent = message;
    const linkNode = notice.querySelector('[data-nsit-lucky-notice-link]');
    linkNode.textContent = link;
    linkNode.hidden = !link;
    notice.querySelector('[data-nsit-lucky-action="copy-link"]').hidden = !link;
    notice.classList.add('is-open');
    clearTimeout(notice._nsitLuckyTimer);
    if (!sticky) notice._nsitLuckyTimer = setTimeout(() => notice.classList.remove('is-open'), 6000);
  }

  function hideLuckyNotice() {
    luckyNoticeElement().classList.remove('is-open');
  }

  function luckyCopyText(text) {
    if (!text) return;
    const fallback = () => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      } catch (_) { /* 复制不可用时用户可手动选中链接 */ }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
      return;
    }
    fallback();
  }

  function luckyPostTitle() {
    const element = document.querySelector('.post-title');
    if (element?.textContent?.trim()) return element.textContent.trim();
    return document.title.replace(/\s*[-–]\s*NodeSeek\s*$/i, '').trim();
  }

  function luckyTitleKey(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function luckyFirstFloor() {
    return document.querySelector('.content-item[id="0"]')
      || Array.from(document.querySelectorAll('.content-item')).find((item) => item.querySelector('.floor-link[href="#0"]'))
      || null;
  }

  // 只有正文里确实写着占位符（模板块真的在帖子里）才需要回写，否则照常发布
  function luckyPostHasPlaceholder() {
    const firstFloor = luckyFirstFloor();
    if (!firstFloor) return false;
    return firstFloor.innerHTML.includes(LUCKY_POST_ID_PLACEHOLDER) || firstFloor.textContent.includes(LUCKY_POST_ID_PLACEHOLDER);
  }

  function luckyEditAction() {
    const firstFloor = luckyFirstFloor();
    return Array.from(firstFloor?.querySelectorAll('.comment-menu .menu-item') || []).find((item) => item.textContent.trim() === '编辑') || null;
  }

  // NS 的编辑接口是 POST /api/content/edit-discussion，请求头 csrf-token 由前端自行生成
  // （随机 16 位串，不依赖服务端下发），所以可以直接调接口，不必走
  // 「点编辑按钮 → 等弹窗 → 填表单 → 点提交」那套脆弱的 UI 自动化。
  function luckyRandomToken(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let index = 0; index < length; index += 1) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  function luckyPostRankFromConfig(postId) {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const postData = pageWindow.__config__?.postData;
    if (!postData) return 0;
    if (postId && String(postData.postId || '') !== String(postId)) return 0;
    const rank = Number(postData.rank);
    return Number.isFinite(rank) ? rank : 0;
  }

  // NS 提交编辑时总会带上 title，这里保持一致：不传空会让接口报错或把标题清掉
  function luckyPostTitleFromConfig(postId) {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const postData = pageWindow.__config__?.postData;
    if (postData && (!postId || String(postData.postId || '') === String(postId))) {
      const fromConfig = String(postData.title || '').trim();
      if (fromConfig) return fromConfig;
    }
    return luckyAnnounceTargetTitle();
  }

  // NS 编辑成功后自己会 location.reload()；走接口改完数据也要刷新，
  // 否则页面还显示旧的标题/正文，用户以为没生效
  function luckyRefreshPostView() {
    try {
      location.reload();
    } catch (_) {
      /* 测试环境不支持导航时忽略 */
    }
  }

  // 直接调编辑接口改标题和正文；成功返回 true
  async function luckyEditPostViaApi({ postId, title = '', content = '' } = {}) {
    const id = Number(postId);
    if (!Number.isInteger(id) || id <= 0) throw new Error('帖子 ID 无效');
    if (!content) throw new Error('正文内容为空');
    const body = {
      content,
      mode: 'edit-discussion',
      postId: id,
      // title 必传：沿用当前标题，避免被清空
      title: title || luckyPostTitleFromConfig(postId),
      rank: luckyPostRankFromConfig(postId),
    };
    const response = await fetch('/api/content/edit-discussion', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': luckyRandomToken(16),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`编辑接口返回 ${response.status}`);
    const payload = await response.json().catch(() => null);
    if (!payload?.success) throw new Error(payload?.message || '编辑接口未返回成功');
    return true;
  }

  // NS 把整个帖子的数据挂在页面全局变量上：__config__.postData.comments[0].markdown
  // 就是 #0 楼正文的 Markdown 源码。直接读它比读编辑弹窗里的编辑器可靠得多：
  // 编辑器是异步灌内容的，读早了会拿到空串。
  function luckyPostMarkdownFromConfig(postId) {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const postData = pageWindow.__config__?.postData;
    if (!postData) return '';
    // 页面 data 可能还是上一篇帖子的（跳转场景），用 postId 校验一下
    if (postId && String(postData.postId || '') !== String(postId)) return '';
    const comments = postData.comments;
    if (!Array.isArray(comments)) return '';
    const first = comments.find((comment) => Number(comment?.floorIndex) === 0) || comments[0];
    return typeof first?.markdown === 'string' ? first.markdown : '';
  }

  function luckyEditorWithin(scopeRoot) {
    const scope = scopeRoot || (document.querySelector('#editor-body') ? document : null);
    if (!scope) return null;
    const container = scope.querySelector('#editor-body') || scope.querySelector('.md-editor') || scope.querySelector('.CodeMirror')?.closest('.md-editor') || scope;
    const codeMirror = container.matches?.('.CodeMirror') ? container : container.querySelector?.('.CodeMirror');
    if (codeMirror?.CodeMirror) return codeMirror;
    if (container.matches?.('textarea')) return container;
    return container.querySelector?.('textarea') || null;
  }

  function luckyTemplateBlock(config) {
    return luckyBlockMarkdown(config, LUCKY_POST_ID_PLACEHOLDER);
  }

  function luckyTemplateLinkLine(config) {
    return `开奖链接：[${LUCKY_DEFAULT_LINK_TEXT}](${luckyLink(config, LUCKY_POST_ID_PLACEHOLDER)})`;
  }

  // 从正文里去掉旧的那块抽奖模板（用于「强制覆盖」）：从带占位符的那行往上吃掉连续的模板行
  function stripLuckyTemplate(content) {
    const lines = String(content || '').split('\n');
    const index = lines.findIndex((line) => line.includes(LUCKY_POST_ID_PLACEHOLDER));
    if (index < 0) return content;
    const templateLine = /^(#{1,6}\s|>\s?|参与方式：|互动：|不满足条件时顺延至下一位|开奖时间：|中奖人数：|开奖链接：)/;
    let start = index;
    while (start > 0) {
      const previous = lines[start - 1];
      if (templateLine.test(previous)) { start -= 1; continue; }
      if (previous.trim() === '' && start - 2 >= 0 && templateLine.test(lines[start - 2])) { start -= 1; continue; }
      break;
    }
    lines.splice(start, index - start + 1);
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  // 保存抽奖配置时，把整块模板写进正文；再次保存时替换上一次插入的内容，不重复堆叠
  function applyLuckyTemplate(config, mode = 'auto') {
    const editor = luckyEditorWithin(null);
    if (!editor) return false;
    const current = luckyEditorValue(editor);
    const block = luckyTemplateBlock(config);
    const previous = String(config.insertedText || '');
    let next;
    if (mode === 'overwrite') next = luckyInsertContent(stripLuckyTemplate(current), block, config.position);
    else if (previous && current.includes(previous)) next = current.replace(previous, block);
    else if (current.includes(LUCKY_POST_ID_PLACEHOLDER)) {
      const linkLine = luckyTemplateLinkLine(config);
      next = current.split('\n').map((line) => (line.includes(LUCKY_POST_ID_PLACEHOLDER) ? linkLine : line)).join('\n');
    } else next = luckyInsertContent(current, block, config.position);
    if (next !== current) luckySetEditorValue(editor, next);
    return true;
  }

  // 判断这次保存会不会和正文里已有的模板打架：能整块匹配就直接替换，匹配不上才需要用户确认
  function luckyTemplateNeedsConfirm(config) {
    const editor = luckyEditorWithin(null);
    if (!editor) return false;
    const current = luckyEditorValue(editor);
    const previous = String(config.insertedText || '');
    if (previous && current.includes(previous)) return false;
    return Boolean(previous) || current.includes(LUCKY_POST_ID_PLACEHOLDER);
  }

  // 发帖页把模板写进正文时用：那里是草稿编辑器，没有接口可调，只能直接写编辑器
  function luckyEditorValue(editor) {
    if (editor?.CodeMirror?.getValue) return editor.CodeMirror.getValue();
    return editor?.value || '';
  }

  function luckySetEditorValue(editor, content) {
    if (editor?.CodeMirror?.setValue) {
      editor.CodeMirror.setValue(content);
      return true;
    }
    if (editor?.value === undefined) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    if (setter) setter.call(editor, content);
    else editor.value = content;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function luckyWritebackTarget(config) {
    if (document.querySelector('#mde-title')) return false;
    const now = Date.now();
    const armedAt = Number(config.createdAt) || 0;
    const recent = Boolean(config.submitAt) && now - config.submitAt <= LUCKY_SUBMIT_WINDOW;
    const stillFresh = armedAt && now - armedAt <= LUCKY_SUBMIT_WINDOW;
    const stored = luckyTitleKey(config.title);
    if (!stored) return recent || stillFresh;
    return recent || stillFresh || stored === luckyTitleKey(luckyPostTitle());
  }

  // 把模板里的 __POST_ID__ 换成真实 ID，或者把模板块追加/插入正文
  function luckyWritebackContent(config, postId, current) {
    if (current.includes(LUCKY_POST_ID_PLACEHOLDER)) {
      return current.split(LUCKY_POST_ID_PLACEHOLDER).join(postId);
    }
    if (current.includes(`lucky?post=${postId}`)) return current;
    return luckyInsertContent(current, luckyBlockMarkdown(config, postId), config.position);
  }

  // 成功后清配置；失败时保留，刷新页面还能重试（但同一帖最多重试 N 次，避免死循环）
  const LUCKY_WRITEBACK_MAX_ATTEMPTS = 3;

  async function performLuckyWriteback(config, postId) {
    luckyWritebackRunning = true;
    const link = luckyLink(config, postId);
    try {
      // 正文优先取页面全局变量，拿不到再退回 DOM 文本
      const fromConfig = luckyPostMarkdownFromConfig(postId);
      const current = fromConfig || luckyFirstFloor()?.querySelector('.post-content')?.textContent || '';
      if (!current) throw new Error('没有取到正文内容');
      const next = luckyWritebackContent(config, postId, current);
      await luckyEditPostViaApi({ postId, content: next });
      // 只有真的提交成功才清掉一次性配置
      clearLuckyArmedConfig();
      // 记一条自己发起的抽奖，供右侧「抽奖 / 中奖」通知使用
      recordOwnLuckyDraw(config, postId);
      // 数据已落库，刷新页面让正文显示出来
      luckyRefreshPostView();
    } catch (error) {
      console.warn('[NSIT] 抽奖回写失败', error);
      const attempts = Number(config.writebackAttempts || 0) + 1;
      if (attempts >= LUCKY_WRITEBACK_MAX_ATTEMPTS) {
        // 重试太多次就放弃并清配置，避免每次开页面都弹提示
        clearLuckyArmedConfig();
        showLuckyNotice('抽奖信息没有自动写进帖子，请打开帖子手动补充开奖链接：', { link, sticky: true, tone: 'error' });
      } else {
        // 保留配置并在下次进入帖子时再试一次
        saveLuckyArmedConfig({ ...config, writebackAttempts: attempts });
      }
    } finally {
      luckyWritebackRunning = false;
    }
  }

  function runLuckyWriteback() {
    if (luckyWritebackRunning) return;
    const postId = currentPostId();
    if (!postId) return;
    const stored = luckyArmedConfig();
    if (!stored) return;
    const config = luckyNormalized(stored);
    if (!luckyWritebackTarget(config)) return;
    if (!luckyPostHasPlaceholder()) return;
    performLuckyWriteback(config, postId);
  }

  function showLuckyWritebackResult() {
    if (luckyWritebackRunning) return;
    const record = luckyReadStorage(LUCKY_DONE_KEY);
    if (!record || String(record.postId) !== currentPostId()) return;
    luckyRemoveStorage(LUCKY_DONE_KEY);
  }

  function markLuckySubmitAttempt() {
    const config = luckyArmedConfig();
    if (!config) return;
    saveLuckyArmedConfig({ ...config, submitAt: Date.now() });
  }

  function installLuckyRuntime() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    if (pageWindow[LUCKY_RUNTIME_KEY]) return;
    pageWindow[LUCKY_RUNTIME_KEY] = true;
    if (luckyEditorPage()) {
      // 抽奖配置只对当前这次发帖有效：重新打开或刷新发帖页都从头开始，
      // 除非 10 分钟内刚配置过 / 刚点过发布（可能被校验拦下重载）
      const stored = luckyReadStorage(LUCKY_ARMED_KEY);
      const fresh = Number(stored?.createdAt) && Date.now() - Number(stored.createdAt) <= LUCKY_SUBMIT_WINDOW;
      const submitted = Number(stored?.submitAt) && Date.now() - Number(stored.submitAt) <= LUCKY_SUBMIT_WINDOW;
      if (stored && !fresh && !submitted) luckyRemoveStorage(LUCKY_ARMED_KEY);
    }
    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-nsit-lucky-action]')?.dataset.nsitLuckyAction || '';
      if (event.target.closest('[data-nsit-lucky-trigger]')) {
        if (luckyDialogElement()?.classList.contains('is-open')) closeLuckyDialog();
        else openLuckyDialog();
        return;
      }
      if (action === 'close') { closeLuckyDialog(); return; }
      if (action === 'save') { saveLuckyFromDialog(); return; }
      if (action === 'confirm-keep') { if (pendingLuckySave) saveLuckyFromDialog('keep'); return; }
      if (action === 'confirm-overwrite') { if (pendingLuckySave) saveLuckyFromDialog('overwrite'); return; }
      if (action === 'confirm-cancel') { closeLuckyConfirm(); return; }
      if (action === 'close-notice') { hideLuckyNotice(); return; }
      if (action === 'copy-link') {
        luckyCopyText(luckyNoticeElement().querySelector('[data-nsit-lucky-notice-link]')?.textContent || '');
        return;
      }
      if (event.target.matches('[data-nsit-lucky-time]') && typeof event.target.showPicker === 'function') {
        try { event.target.showPicker(); } catch (_) { /* 已由浏览器打开或当前环境不允许 */ }
      }
      if (event.target.matches('[data-nsit-lucky-modal]')) closeLuckyDialog();
      if (event.target.matches('[data-nsit-lucky-confirm]')) closeLuckyConfirm();
    });
    document.addEventListener('input', (event) => {
      if (event.target.closest('[data-nsit-lucky-modal]')) syncLuckyDialog();
    });
    document.addEventListener('change', (event) => {
      if (event.target.closest('[data-nsit-lucky-modal]')) syncLuckyDialog();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && luckyConfirmElement()?.classList.contains('is-open')) { closeLuckyConfirm(); return; }
      if (event.key === 'Escape' && luckyDialogElement()?.classList.contains('is-open')) closeLuckyDialog();
    });
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, input[type="submit"], a');
      if (!button || button.closest(`#${APP_ID}`) || button.hasAttribute('data-nsit-lucky-trigger')) return;
      if (!document.querySelector('#mde-title')) return;
      if (!/^\s*(发布|发帖|提交)/.test(button.textContent.trim())) return;
      markLuckySubmitAttempt();
    }, true);
    document.addEventListener('submit', (event) => {
      if (!document.querySelector('#mde-title') || !luckyArmedConfig()) return;
      if (event.target.closest?.(`#${APP_ID}`)) return;
      markLuckySubmitAttempt();
    }, true);
    // 回帖参与：按下「发布评论」就记为参与。未中奖的记录对用户不可见，
    // 所以不需要确认回帖是否成功；开奖后比对名单，没中奖直接清掉。
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, input[type="submit"], a');
      if (!button || button.closest(`#${APP_ID}`)) return;
      // 只认回帖场景：当前是帖子页、且不在发帖页
      if (!currentPostId() || document.querySelector('#mde-title')) return;
      if (!/^\s*(发布评论|回帖|回复)/.test(button.textContent.trim())) return;
      const draw = luckyDrawForReply();
      // 只记「参与别人的抽奖」。在自己发起的帖子里回复不算参与 ——
      // 否则会把 participated 改成 true，这条就从「我发起的抽奖」里消失了。
      if (draw && !luckyIsOwnDraw()) recordParticipation(draw);
    }, true);
  }

  /* 抽奖通知 ---------------------------------------------------------------
   * 只记录本脚本经手发起的抽奖（发布时写入），不回溯历史帖子。
   * - 「抽奖」：徽标 = 已开奖但正文里还没 @ 中奖人的帖子数
   * - 「中奖」：徽标 = 已开奖且我在中奖名单里、还没点开看过的帖子数
   * 中奖名单直接读 NS 自己的开奖页面（同源 iframe），不复刻抽奖算法。
   * ------------------------------------------------------------------------- */

  let luckyNotifyStylesReady = false;
  let luckyNotifyRecordsCache;
  let luckyNotifyChecking = false;

  // lucky 页也匹配本脚本，读名单用的隐藏 iframe 会让脚本在里层再跑一遍。
  // 不加这道判断，就会不断套娃创建 iframe。
  function luckyNotifyTopFrame() {
    try {
      return window.top === window.self;
    } catch (_) {
      return false;
    }
  }

  function luckyNotifyReadStorage() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LUCKY_RECORDS_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  // 每次都直接读 localStorage：渲染函数挂在 MutationObserver 上，
  // 内存缓存会和另一页签/发布流程的写入形成竞态，把刚亮起的徽标又擦掉。
  // 记录只有几条 JSON，直接读没有性能问题。
  function luckyNotifyRecords() {
    const fresh = luckyNotifyReadStorage();
    luckyNotifyRecordsCache = fresh;
    return fresh;
  }

  function luckyNotifyWriteRecords(records) {
    luckyNotifyRecordsCache = records;
    try { localStorage.setItem(LUCKY_RECORDS_KEY, JSON.stringify(records)); } catch (_) { /* 存储不可用时忽略 */ }
  }

  // 「我发起的抽奖」统一写入：抽奖配置发布后、以及进帖子从开奖链接解析到，
  // 两条来源都走这里，保证参数与状态字段的语义完全一致。
  // 参数没变 → 保留已拉到的名单和已读状态；参数变了 → 整组作废重来。
  function upsertOwnDraw(draw) {
    if (!draw || !/^\d+$/.test(String(draw.postId))) return false;
    const id = String(draw.postId);
    const records = { ...luckyNotifyRecords() };
    const previous = records[id];
    const next = {
      postId: id,
      // 归一化放在汇合点：无论来自抽奖配置还是链接解析，存进记录的都是毫秒
      time: luckyNormalizeTimestamp(draw.time),
      count: Number(draw.count) || 1,
      start: Number(draw.start) || 1,
      dedupe: draw.dedupe !== false,
    };
    const sameParams = Boolean(previous)
      && previous.time === next.time && previous.count === next.count
      && previous.start === next.start && previous.dedupe === next.dedupe;
    if (sameParams) return false;
    records[id] = {
      ...next,
      // 参与别人的抽奖不会被这里覆盖：那是另一条来源，participated 语义不同
      participated: previous?.participated === true,
      winners: null,
      checkedAt: 0,
      wonAt: 0,
      wonSeen: 0,
      announced: 0,
    };
    luckyNotifyWriteRecords(records);
    renderLuckyNotifyEntries();
    return true;
  }

  // 抽奖配置发布成功后调用
  function recordOwnLuckyDraw(config, postId) {
    const id = String(postId || '').trim();
    if (!/^\d+$/.test(id)) return;
    upsertOwnDraw({ postId: id, ...luckyNormalized(config) });
  }

  function luckyNotifyList() {
    return Object.values(luckyNotifyRecords())
      .filter((item) => item && /^\d+$/.test(String(item.postId)))
      .sort((left, right) => Number(right.time || 0) - Number(left.time || 0));
  }

  function luckyNotifyRevealed(item) {
    return Number(item?.time || 0) > 0 && Date.now() >= Number(item.time) + LUCKY_NOTIFY_REVEAL_SLACK;
  }

  function luckyNotifyWinners(item) {
    return Array.isArray(item?.winners) ? item.winners.filter((winner) => winner && winner.id) : null;
  }

  function luckyNotifyLuckyUrl(item) {
    return luckyLink({ time: item.time, count: item.count, start: item.start, dedupe: item.dedupe }, item.postId);
  }

  // 从一段 markdown 里解析开奖链接
  // 开奖时间统一成毫秒。NS 官方链接用 13 位毫秒，但手动贴的链接常见 10 位秒级，
  // 直接当毫秒用会让「还没开奖」被判断成「已开奖」。
  function luckyNormalizeTimestamp(value) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 0;
    // 10 位（秒）→ 毫秒；13 位及以上原样返回
    return num < 1e11 ? Math.round(num * 1000) : Math.round(num);
  }

  function luckyParseLinkFromText(text) {
    const match = String(text || '').match(/https?:\/\/[^\s)]*\/lucky\?[^\s)]*/)
      || String(text || '').match(/\/lucky\?[^\s)]*/);
    if (!match) return null;
    let url = null;
    try { url = new URL(match[0], location.origin); } catch (_) { return null; }
    if (!url.searchParams.get('post')) return null;
    const num = (key, fallback) => {
      const value = Number(url.searchParams.get(key));
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      postId: String(num('post', 0)),
      time: luckyNormalizeTimestamp(url.searchParams.get('time')),
      count: num('count', 1),
      start: num('start', 1),
      dedupe: url.searchParams.get('duplicate') !== 'true',
    };
  }

  // 判断当前帖子是不是抽奖贴，并取到开奖参数。
  // ① 优先从 __config__.postData 找楼层 0 的 markdown 解析（进非第一页时没有 0 楼）
  // ② 没有 0 楼时，用帖子 ID 拼开奖地址补拉第 1 页解析
  // 关键：postData.postId 在任何分页都可用，所以"是不是抽奖贴"总能判断
  function luckyCurrentDraw() {
    const postId = currentPostId();
    if (!postId) return null;
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const postData = pageWindow.__config__?.postData;
    const samePost = postData && String(postData.postId || '') === String(postId);
    // ① 当前页有 0 楼数据：直接解析
    if (samePost && Array.isArray(postData.comments)) {
      const floor0 = postData.comments.find((item) => Number(item?.floorIndex) === 0);
      const parsed = floor0 ? luckyParseLinkFromText(floor0.markdown) : null;
      if (parsed && parsed.postId === String(postId)) return parsed;
    }
    // ①b 退而用 DOM 里的 0 楼
    const domFloor = luckyFirstFloor();
    if (domFloor) {
      const parsed = luckyParseLinkFromText(domFloor.querySelector('a[href*="/lucky?"]')?.getAttribute('href') || '');
      if (parsed && parsed.postId === String(postId)) return parsed;
    }
    // ② 非第一页：拿不到 0 楼，交给上层补拉
    return null;
  }

  // 非第一页时的兜底：补拉第 1 页，解析出完整开奖参数
  async function luckyFetchDrawFromPostPage(postId) {
    try {
      const response = await fetch(`/post-${postId}-1`, { credentials: 'same-origin' });
      if (!response.ok) return null;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const floor0 = doc.querySelector('.content-item[id="0"] .post-content')
        || doc.querySelector('.content-item[id="0"]');
      if (!floor0) return null;
      // 从 a[href] 读：直接读 innerHTML 会拿到 HTML 实体（&amp;）和尾随标签
      const href = floor0.querySelector('a[href*="/lucky?"]')?.getAttribute('href') || '';
      const parsed = luckyParseLinkFromText(href);
      return parsed && parsed.postId === String(postId) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  // 非第一页时本页没有 0 楼，补拉第 1 页解析开奖参数，并缓存结果。
  // 不这样做的话，在 2 页以后回复别人就记不到参与。
  let luckyDrawCache = { postId: '', draw: null, resolved: false };

  // 判断当前帖是不是「我发起的抽奖」：我是楼主 + 帖子里有有效开奖链接。
  // 不看是否走过抽奖配置 —— 手动发起、后来补开奖链接的同样要跟踪。
  function luckyIsOwnDraw() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const postData = pageWindow.__config__?.postData;
    if (!postData) return false;
    const ownId = String(currentNodeSeekUserId() || '');
    if (!ownId) return false;
    const opUid = String(postData.op?.uid || '');
    if (!opUid) return false;
    return opUid === ownId;
  }

  async function resolveCurrentDraw() {
    const postId = currentPostId();
    if (!postId) return null;
    if (luckyDrawCache.postId !== postId) luckyDrawCache = { postId, draw: null, resolved: false };
    let draw = luckyCurrentDraw();
    if (!draw && !luckyDrawCache.resolved) {
      luckyDrawCache.resolved = true;
      draw = await luckyFetchDrawFromPostPage(postId);
      luckyDrawCache.draw = draw || null;
    }
    draw = draw || (luckyDrawCache.postId === postId ? luckyDrawCache.draw : null);
    // 我发起的抽奖：补一条跟踪记录（开奖检查、公布按钮都依赖它）
    if (draw && luckyIsOwnDraw()) trackOwnDrawFromPage(draw);
    return draw;
  }

  // 进帖子解析到开奖链接时补记「我发起的抽奖」；参数一致时不重复写
  function trackOwnDrawFromPage(draw) {
    upsertOwnDraw(draw);
  }

  // 点击回复时用：本页解析得到就直接用，否则用已解析好的缓存
  function luckyDrawForReply() {
    const postId = currentPostId();
    if (!postId) return null;
    const direct = luckyCurrentDraw();
    if (direct) return direct;
    return luckyDrawCache.postId === postId ? luckyDrawCache.draw : null;
  }

  // 点击「发布评论」就记为参与，不再确认回帖是否真的成功：
  // 未中奖的参与记录对用户完全不可见（「中奖」弹窗只列名单含我的，「抽奖」徽标只算我发起的），
  // 所以"记错"没有任何用户可见的代价；开奖后比对名单，没中奖直接清掉。
  function recordParticipation(draw) {
    if (!draw || !/^\d+$/.test(String(draw.postId))) return;
    if (Number(draw.time) <= Date.now()) return;
    const records = { ...luckyNotifyRecords() };
    const previous = records[draw.postId] || {};
    // 已有记录就不动，避免重复点击把已拉到的名单清掉
    if (previous.participated) return;
    // 兜底：这条已经标记为「我发起的抽奖」，不能改写成参与（会从弹窗里消失）
    if (previous.postId && previous.participated === false) return;
    records[draw.postId] = {
      ...previous,
      ...draw,
      winners: previous.winners ?? null,
      checkedAt: Number(previous.checkedAt) || 0,
      wonAt: Number(previous.wonAt) || 0,
      wonSeen: Number(previous.wonSeen) || 0,
      announced: Number(previous.announced) || 0,
      participated: true,
      participatedAt: Date.now(),
    };
    luckyNotifyWriteRecords(records);
    renderLuckyNotifyEntries();
  }

  // 徽标：已开奖、有人中奖，但正文里还没 @ 全部中奖人
  function luckyNotifyPendingAnnounceCount(source = luckyNotifyRecords()) {
    return Object.values(source)
      .filter((item) => item && /^\d+$/.test(String(item.postId)) && !item.participated)
      .filter((item) => {
      if (!luckyNotifyRevealed(item)) return false;
      const winners = luckyNotifyWinners(item);
      if (!winners || !winners.length) return false;
      return Number(item.announced) !== winners.length;
    }).length;
  }

  // 徽标：已开奖、我在名单里，且还没点开看过
  function luckyNotifyWonUnreadCount(source = luckyNotifyRecords()) {
    const ownId = String(currentNodeSeekUserId() || '');
    if (!ownId) return 0;
    return Object.values(source)
      .filter((item) => item && /^\d+$/.test(String(item.postId)))
      .filter((item) => {
      if (!luckyNotifyRevealed(item)) return false;
      if (Number(item.wonSeen)) return false;
      const winners = luckyNotifyWinners(item);
      return Boolean(winners) && winners.some((winner) => String(winner.id) === ownId);
    }).length;
  }

  function luckyNotifyPanel() {
    return document.querySelector('.user-card .user-stat');
  }

  function ensureLuckyNotifyStyles() {
    if (luckyNotifyStylesReady) return;
    luckyNotifyStylesReady = true;
    // 通知面板出现在列表页/帖子页，而这些页面不会渲染发帖页的抽奖弹窗，
    // 所以要自己带上弹窗外壳样式（.nsit-lucky-modal/.nsit-lucky-dialog 等）
    injectStyles(`
      /* 站点的 .stat-block / .iconpark-icon / .notify-count 规则都带 data-v 作用域，
         注入的节点匹配不到，所以这里自带一份等价样式。
         行距也要照抄，否则我们的两行会比原生条目挤在一起。 */
      [data-nsit-lucky-notify]{font-size:14px}
      /* 站点的链接色规则也带 data-v 作用域（.user-stat a[data-v-...]{color:#333}），
         我们的锚点匹配不到，会掉到全局的 #555，数字看着就比原生浅 */
      [data-nsit-lucky-notify] a{color:#333}
      [data-nsit-lucky-notify] a:hover{color:#888}
      [data-nsit-lucky-notify] .iconpark-icon{width:14px;height:14px;margin-right:3.8px;vertical-align:middle}
      /* 和站点一致：只有有数字时才画成红色胶囊，0 就是普通文字。
         站点规则里没有 line-height，这里也不能加，否则数字基线会偏。 */
      .nsit-lucky-notify-dot.is-hot{display:inline;padding:0 6px;border-radius:6px;font-size:12.6px;vertical-align:middle;background-color:#f01212;color:#fff}
      .nsit-lucky-modal{position:fixed;z-index:100000;inset:0;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(24,32,48,.42)}
      .nsit-lucky-modal.is-open{display:flex}
      .nsit-lucky-dialog{display:flex;flex-direction:column;width:min(560px,100%);min-width:0;max-width:100%;max-height:min(560px,86vh);overflow:hidden;border-radius:12px;background:#fff;color:#27334a;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 20px 48px rgba(15,23,38,.28)}
      .nsit-lucky-dialog,.nsit-lucky-dialog *{box-sizing:border-box}
      .nsit-lucky-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid #e5eaf1;background:linear-gradient(110deg,#f9fbff,#fff8ea)}
      .nsit-lucky-head h3{margin:0;font-size:16px}
      .nsit-lucky-head-copy{display:flex;align-items:baseline;gap:9px;min-width:0}
      .nsit-lucky-head-title{display:flex;align-items:baseline;gap:9px;min-width:0}
      /* 弹窗自带 star 行样式：ui.js 的样式只在发帖页注入，列表页打开弹窗时拿不到 */
      .nsit-lucky-head .nsit-star-note{display:inline-flex;align-items:center;gap:3px;color:#718096;font-size:14px;white-space:nowrap}
      .nsit-lucky-head .nsit-star-note a{display:inline-flex;align-items:center;color:#8b641e;text-decoration:none}
      .nsit-lucky-head .nsit-star-note a:hover{text-decoration:underline}
      .nsit-lucky-head .nsit-github-icon{width:14px;height:14px;fill:currentColor}
      .nsit-lucky-close{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;margin:0;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:#7b8798;cursor:pointer}
      .nsit-lucky-close:hover{border-color:#d8e0eb;background:#fff;color:#40506a}
      .nsit-lucky-notify-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 0}
      .nsit-lucky-notify-empty{padding:26px 18px;color:#718096;font-size:13px;text-align:center}
      .nsit-lucky-notify-item{display:flex;align-items:flex-start;gap:10px;padding:11px 18px;border-bottom:1px solid #eef2f7}
      .nsit-lucky-notify-item:last-child{border-bottom:0}
      .nsit-lucky-notify-main{display:grid;gap:3px;min-width:0;flex:1 1 auto}
      .nsit-lucky-notify-title{display:flex;align-items:center;gap:8px;color:#27334a;font-size:13px;font-weight:600;line-height:1.5;word-break:break-word}
      .nsit-lucky-notify-title a{min-width:0}
      .nsit-lucky-notify-title a,.nsit-lucky-notify-meta a,.nsit-lucky-notify-winners a{color:#3976bc}
      .nsit-lucky-notify-title a:hover,.nsit-lucky-notify-meta a:hover{text-decoration:underline}
      .nsit-lucky-notify-meta{color:#718096;font-size:12px;line-height:1.6}
      .nsit-lucky-notify-tag{flex:none;padding:1px 6px;border:1px solid transparent;border-radius:4px;font-size:12px;line-height:18px;white-space:nowrap}
      .nsit-lucky-notify-tag[data-tone="wait"]{border-color:#f0d49c;background:#fff8e9;color:#8b641e}
      .nsit-lucky-notify-tag[data-tone="done"]{border-color:#9ad6b1;background:#effaf3;color:#27834a}
      .nsit-lucky-notify-tag[data-tone="pending"]{border-color:#eec2c2;background:#fff6f6;color:#b34b4b}
      .nsit-lucky-announce-button{margin:0 8px 0 0;padding:2px 7px;border:1px solid #d9961c;border-radius:5px;background:#fff8ea;color:#875800;font:inherit;font-size:12px;line-height:1.4;vertical-align:middle;cursor:pointer}
      .nsit-lucky-announce-button:hover{border-color:#b87500;background:#d9961c;color:#fff}
      .nsit-lucky-announce-button:disabled{cursor:wait;opacity:.55}
      .nsit-lucky-notify-confirm{position:fixed;z-index:100001;inset:0;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(24,32,48,.28)}
      .nsit-lucky-notify-confirm.is-open{display:flex}
      .nsit-lucky-notify-confirm .nsit-lucky-dialog{width:min(400px,100%)}
      .nsit-lucky-notify-confirm-body{padding:16px 18px 20px;color:#506078;font-size:14px;line-height:1.8}
      .nsit-lucky-notify-confirm-body p{margin:0}
      .nsit-lucky-notify-confirm-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid #e5eaf1;background:#fff}
      .nsit-lucky-notify-confirm-foot button{margin:0;padding:7px 11px;border:1px solid #d8e0eb;border-radius:7px;background:#fff;color:#40506a;font:inherit;font-size:13px;cursor:pointer}
      .nsit-lucky-notify-confirm-foot button:hover{border-color:#b8c5d5;background:#f6f8fb}
      .nsit-lucky-notify-confirm-foot button.nsit-lucky-danger{border-color:#e0a5a5;background:#fff;color:#b34b4b}
      .nsit-lucky-notify-confirm-foot button.nsit-lucky-danger:hover{border-color:#b34b4b;background:#fff0f0}
      .nsit-lucky-notify-item-actions{display:flex;flex:none;flex-direction:column;align-items:flex-end;gap:5px}
      .nsit-lucky-notify-actions{margin-top:5px}
      .nsit-lucky-notify-actions button{margin:0;padding:3px 8px;border:1px solid #d8e0eb;border-radius:5px;background:#fff;color:#40506a;font:inherit;font-size:12px;line-height:1.4;cursor:pointer}
      .nsit-lucky-notify-actions button:hover{border-color:#d9961c;color:#8b5c00}
      .nsit-lucky-notify-actions button.nsit-lucky-primary{border-color:#d9961c;background:#d9961c;color:#fff}
      .nsit-lucky-notify-actions button.nsit-lucky-primary:hover{background:#c98a12;border-color:#c98a12;color:#fff}
      .nsit-lucky-notify-actions button:disabled{cursor:default;opacity:.6}
      .nsit-lucky-notify-item-actions .nsit-lucky-primary{margin:0;padding:3px 8px;border:1px solid #d9961c;border-radius:5px;background:#d9961c;color:#fff;font:inherit;font-size:12px;line-height:1.4;cursor:pointer}
      .nsit-lucky-notify-item-actions .nsit-lucky-primary:hover{background:#c98a12;border-color:#c98a12;color:#fff}
      .nsit-lucky-notify-delete{margin:0;padding:3px 8px;border:1px solid #eec2c2;border-radius:5px;background:#fff6f6;color:#b34b4b;font:inherit;font-size:12px;line-height:1.4;cursor:pointer}
      .nsit-lucky-notify-delete:hover{border-color:#b34b4b;background:#fff0f0;color:#b34b4b}
      .nsit-lucky-notify-winners{margin:2px 0 0;padding:0;list-style:none;color:#40506a;font-size:12px}
      .nsit-lucky-notify-winners li{margin:0;padding:0;line-height:1.7}
    `);
  }

  // user-stat 是两列（两个 .stat-block）。一个条目放一列：两列行数才齐，
  // 两个条目正好并排落在末行，左「抽奖」右「中奖」，与原先的上下顺序一致。
  const LUCKY_NOTIFY_ENTRIES = [
    ['own', '抽奖', 'box', 0],
    ['won', '中奖', 'trophy', 1],
  ];

  function renderLuckyNotifyEntries() {
    if (!luckyNotifyTopFrame()) return;
    const panel = luckyNotifyPanel();
    if (!panel || !currentNodeSeekUserId()) {
      document.querySelectorAll('[data-nsit-lucky-notify]').forEach((node) => node.remove());
      return;
    }
    ensureLuckyNotifyStyles();
    const blocks = Array.from(panel.querySelectorAll('.stat-block'));
    const counts = { own: luckyNotifyPendingAnnounceCount(), won: luckyNotifyWonUnreadCount() };
    LUCKY_NOTIFY_ENTRIES.forEach(([kind, label, icon, column]) => {
      // 追加到对应列末尾：其它脚本已注入的条目位置不受影响
      const host = blocks[column] || blocks[0] || panel;
      let node = document.querySelector(`[data-nsit-lucky-notify="${kind}"]`);
      if (!node) {
        // 和站点原生条目同构：<div><a>图标 文字 数字</a></div>
        const holder = document.createElement('div');
        holder.innerHTML = `<div data-nsit-lucky-notify="${kind}"><a href="javascript:void(0)"><svg class="iconpark-icon" aria-hidden="true"><use href="#${icon}"></use></svg><span>${escapeHtml(label)} </span><span class="nsit-lucky-notify-dot" data-nsit-lucky-notify-count>0</span></a></div>`;
        node = holder.firstElementChild;
      }
      if (node.parentElement !== host) host.append(node);
      const badge = node.querySelector('[data-nsit-lucky-notify-count]');
      const value = String(counts[kind]);
      // 只在真的变化时写 DOM：写 textContent 会造成 childList 变动，
      // 而本函数挂在 MutationObserver 上，无条件写会形成死循环
      if (badge.textContent !== value) badge.textContent = value;
      const hot = counts[kind] > 0;
      if (badge.classList.contains('is-hot') !== hot) badge.classList.toggle('is-hot', hot);
    });
  }

  function luckyNotifyModal(kind) {
    return document.querySelector(`[data-nsit-lucky-notify-modal="${kind}"]`);
  }

  function luckyNotifyItemMarkup(item, kind) {
    const revealed = luckyNotifyRevealed(item);
    const winners = luckyNotifyWinners(item);
    const ownId = String(currentNodeSeekUserId() || '');
    const won = Boolean(winners) && winners.some((winner) => String(winner.id) === ownId);
    const announced = Boolean(winners && winners.length) && Number(item.announced) === winners.length;
    // 「中奖」弹窗是参与者视角，「我发起的抽奖」是发起者视角，标签不能混用
    const tone = !revealed ? 'wait' : kind === 'won' ? 'done' : announced ? 'done' : 'pending';
    const tag = !revealed ? '未开奖' : kind === 'won' ? '已中奖' : announced ? '已公布' : '待公布';
    const postUrl = `https://www.nodeseek.com/post-${item.postId}-1`;
    const list = winners && winners.length && kind === 'own'
      ? `<ul class="nsit-lucky-notify-winners">${winners.map((winner) => `<li><a href="https://www.nodeseek.com/space/${escapeHtml(winner.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(winner.name || winner.id)}</a>${winner.floor ? ` · ${escapeHtml(String(winner.floor))}楼` : ''}</li>`).join('')}</ul>`
      : '';
    return `<article class="nsit-lucky-notify-item">
      <div class="nsit-lucky-notify-main">
        <div class="nsit-lucky-notify-title">
          <a href="${postUrl}" target="_blank" rel="noopener noreferrer">帖子 ${escapeHtml(item.postId)}</a>
          <span class="nsit-lucky-notify-tag" data-tone="${tone}">${escapeHtml(tag)}</span>
        </div>
        <div class="nsit-lucky-notify-meta">开奖 ${escapeHtml(luckyTimeText(Number(item.time || 0)))} · 奖品 ${Number(item.count) || 1} 个 · ${escapeHtml(luckyNotifyWinnerText(item, kind))}</div>
        <div class="nsit-lucky-notify-meta"><a href="${escapeHtml(luckyNotifyLuckyUrl(item))}" target="_blank" rel="noopener noreferrer">开奖链接</a></div>
        ${list}
      </div>
      <div class="nsit-lucky-notify-item-actions">
        ${kind === 'own' && revealed && winners && winners.length && !announced ? `<button type="button" class="nsit-lucky-primary" data-nsit-lucky-announce-post="${escapeHtml(item.postId)}">${escapeHtml(LUCKY_ANNOUNCE_BUTTON)}</button>` : ''}
        ${revealed ? `<button type="button" class="nsit-lucky-notify-delete" data-nsit-lucky-delete-post="${escapeHtml(item.postId)}" title="删除这条记录">删除</button>` : ''}
      </div>
    </article>`;
  }

  function luckyNotifyWinnerText(item, kind = 'own') {
    if (!luckyNotifyRevealed(item)) return '未开奖';
    const winners = luckyNotifyWinners(item);
    if (!winners) return '正在获取名单';
    if (!winners.length) return '无人中奖';
    if (kind === 'won') return '你中奖了';
    const ownId = String(currentNodeSeekUserId() || '');
    return winners.some((winner) => String(winner.id) === ownId) ? `中奖 ${winners.length} 人（包含你）` : `中奖 ${winners.length} 人`;
  }

  // 「中奖」只列我中了的帖子，「抽奖」列全部我发起或参与过的抽奖
  function luckyNotifyItemsFor(kind) {
    const items = luckyNotifyList();
    // 「我发起的抽奖」只列自己发布的；参与的只在「中奖」里体现
    if (kind !== 'won') return items.filter((item) => !item.participated);
    const ownId = String(currentNodeSeekUserId() || '');
    if (!ownId) return [];
    return items.filter((item) => {
      const winners = luckyNotifyWinners(item);
      return Boolean(winners) && winners.some((winner) => String(winner.id) === ownId);
    });
  }

  function luckyNotifyListMarkup(kind) {
    const items = luckyNotifyItemsFor(kind);
    if (!items.length) {
      return `<p class="nsit-lucky-notify-empty">${kind === 'won' ? '还没有中奖记录。' : '还没有用抽奖配置发起过抽奖。'}</p>`;
    }
    return items.map((item) => luckyNotifyItemMarkup(item, kind)).join('');
  }

  function luckyNotifyDialogMarkup(kind) {
    const title = kind === 'won' ? '中奖记录' : '我发起的抽奖';
    return `<div class="nsit-lucky-modal nsit-lucky-notify-dialog" data-nsit-lucky-notify-modal="${kind}" aria-hidden="true">
      <section class="nsit-lucky-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header class="nsit-lucky-head"><div class="nsit-lucky-head-copy"><div class="nsit-lucky-head-title"><h3>${escapeHtml(title)}</h3>${starNoteMarkup()}</div></div><button type="button" class="nsit-lucky-close" data-nsit-lucky-notify-action="close" aria-label="关闭${escapeHtml(title)}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></header>
        <div class="nsit-lucky-notify-body" data-nsit-lucky-notify-list></div>
      </section>
    </div>`;
  }

  function openLuckyNotifyModal(kind) {
    ensureLuckyNotifyStyles();
    let modal = luckyNotifyModal(kind);
    if (!modal) {
      const holder = document.createElement('div');
      holder.innerHTML = luckyNotifyDialogMarkup(kind);
      modal = holder.firstElementChild;
      document.body.append(modal);
    }
    modal.querySelector('[data-nsit-lucky-notify-list]').innerHTML = luckyNotifyListMarkup(kind);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    if (kind === 'won') markLuckyNotifyWonSeen();
  }

  function deleteLuckyNotifyRecord(postId) {
    const id = String(postId || '').trim();
    if (!/^\d+$/.test(id)) return;
    const records = { ...luckyNotifyRecords() };
    // 未开奖的记录不允许删除：开奖结果还没出来，删了就彻底追踪不到了
    if (!records[id] || !luckyNotifyRevealed(records[id])) return;
    delete records[id];
    luckyNotifyWriteRecords(records);
    // 刷新两个弹窗和右侧徽标
    document.querySelectorAll('[data-nsit-lucky-notify-modal]').forEach((modal) => {
      const kind = modal.getAttribute('data-nsit-lucky-notify-modal');
      modal.querySelector('[data-nsit-lucky-notify-list]').innerHTML = luckyNotifyListMarkup(kind);
    });
    renderLuckyNotifyEntries();
  }

  // 「待公布」的帖子删掉就找不回来了（通知入口消失），删除前二次确认；
  // 其他状态的记录直接删，不给用户添麻烦
  function luckyNotifyRecordNeedsConfirm(postId) {
    const record = luckyNotifyRecords()[String(postId || '').trim()];
    if (!record) return false;
    if (!luckyNotifyRevealed(record)) return false;
    const winners = luckyNotifyWinners(record);
    if (!winners || !winners.length) return false;
    return Number(record.announced) !== winners.length;
  }

  function ensureLuckyNotifyConfirm() {
    ensureLuckyNotifyStyles();
    let confirm = document.querySelector('[data-nsit-lucky-notify-confirm]');
    if (confirm) return confirm;
    const holder = document.createElement('div');
    holder.innerHTML = `<div class="nsit-lucky-notify-confirm" data-nsit-lucky-notify-confirm>
      <section class="nsit-lucky-dialog" role="dialog" aria-modal="true" aria-label="确认删除">
        <header class="nsit-lucky-head"><div class="nsit-lucky-head-copy"><div class="nsit-lucky-head-title"><h3>删除这条记录？</h3></div></div><button type="button" class="nsit-lucky-close" data-nsit-lucky-notify-confirm-action="cancel" aria-label="关闭"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></header>
        <div class="nsit-lucky-notify-confirm-body"><p>这条抽奖还没公布中奖名单，删掉后就没有提醒入口了。确定删除吗？</p></div>
        <footer class="nsit-lucky-notify-confirm-foot"><button type="button" data-nsit-lucky-notify-confirm-action="cancel">取消</button><button type="button" class="nsit-lucky-danger" data-nsit-lucky-notify-confirm-action="confirm">删除</button></footer>
      </section>
    </div>`;
    confirm = holder.firstElementChild;
    document.body.append(confirm);
    return confirm;
  }

  function closeLuckyNotifyConfirm() {
    document.querySelector('[data-nsit-lucky-notify-confirm]')?.classList.remove('is-open');
  }

  function openLuckyNotifyConfirm(postId) {
    const confirm = ensureLuckyNotifyConfirm();
    confirm.dataset.nsitLuckyConfirmPost = String(postId);
    confirm.classList.add('is-open');
  }

  function closeLuckyNotifyModals() {
    document.querySelectorAll('[data-nsit-lucky-notify-modal]').forEach((modal) => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  function markLuckyNotifyWonSeen() {
    const records = { ...luckyNotifyRecords() };
    let changed = false;
    const ownId = String(currentNodeSeekUserId() || '');
    Object.keys(records).forEach((key) => {
      const item = records[key];
      if (!item || Number(item.wonSeen)) return;
      // 只标记当前名单里确实包含我的记录；旧数据里 wonAt 可能来自上一次检查
      const winners = Array.isArray(item.winners) ? item.winners : [];
      const isWinner = Boolean(ownId) && winners.some((winner) => String(winner?.id) === ownId);
      if (!isWinner) return;
      item.wonSeen = Date.now();
      changed = true;
    });
    if (!changed) return;
    luckyNotifyWriteRecords(records);
    renderLuckyNotifyEntries();
  }

  // 借 NS 自己的开奖页面取名单：同源 iframe，读完即删，不复刻抽奖算法
  function luckyNotifyReadWinners(item, timeout = 15000) {
    return new Promise((resolve) => {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:700px;border:0;visibility:hidden';
      frame.setAttribute('aria-hidden', 'true');
      let done = false;
      const finish = (value) => {
        if (done) return;
        done = true;
        clearInterval(timer);
        clearTimeout(kill);
        frame.remove();
        resolve(value);
      };
      const read = () => {
        let doc = null;
        try { doc = frame.contentDocument; } catch (_) { return null; }
        if (!doc || !doc.body) return null;
        const rows = Array.from(doc.querySelectorAll('.rank-row'));
        if (rows.length) {
          return rows.map((row) => {
            const link = row.querySelector('.member-name a[href^="/space/"]');
            const id = String(link?.getAttribute('href') || '').match(/^\/space\/(\d+)/)?.[1] || '';
            const floor = String(row.querySelector('.coins')?.textContent || '').match(/(\d+)/)?.[1] || '';
            return { id, name: (link?.textContent || '').trim(), floor };
          }).filter((winner) => winner.id);
        }
        // 页面已渲染完但没有行：这帖确实没有合格中奖者
        return doc.body.innerText.includes('中奖名单') ? [] : null;
      };
      const timer = setInterval(() => {
        const winners = read();
        if (winners) finish(winners);
      }, 300);
      const kill = setTimeout(() => finish(null), timeout);
      frame.src = luckyNotifyLuckyUrl(item);
      (document.body || document.documentElement).append(frame);
    });
  }

  // 只看楼主楼层（#0）的正文里有没有 @ 全部中奖人。
  // 不能扫整页 HTML：评论区和页脚也会出现 @名字，会误判成已公布。
  function luckyNotifyAnnounced(postHtml, winners) {
    const html = String(postHtml || '');
    if (!html || !winners.length) return false;
    let text = '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const floor = doc.querySelector('.content-item[id="0"] .post-content')
        || doc.querySelector('.content-item[id="0"]');
      text = floor?.textContent || '';
    } catch (_) {
      return false;
    }
    if (!text) return false;
    return winners.every((winner) => winner.name && text.includes(`@${winner.name}`));
  }

  async function luckyNotifyFetchPostHtml(postId) {
    try {
      const response = await fetch(`/post-${postId}-1`, { credentials: 'same-origin' });
      if (!response.ok) return null;
      return await response.text();
    } catch (_) {
      return null;
    }
  }

  async function luckyNotifyCheckItem(item) {
    const winners = await luckyNotifyReadWinners(item);
    if (!winners) return false;
    const records = { ...luckyNotifyRecords() };
    const current = records[String(item.postId)];
    if (!current) return false;
    current.winners = winners;
    current.checkedAt = Date.now();
    const ownId = String(currentNodeSeekUserId() || '');
    const wonNow = Boolean(ownId) && winners.some((winner) => String(winner.id) === ownId);
    current.wonAt = wonNow ? Number(current.wonAt) || Date.now() : 0;
    // 名单里没有我时才清已读：有我时保留，否则复查会反复清掉 unread 状态
    if (!wonNow) current.wonSeen = 0;
    // 已开奖的帖子查一次正文，判断有没有 @ 全部中奖人。
    // 拉不到正文时保留原状态：网络失败不等于楼主没公布。
    if (winners.length) {
      const html = await luckyNotifyFetchPostHtml(current.postId);
      if (html) current.announced = luckyNotifyAnnounced(html, winners) ? winners.length : 0;
    }
    // 参与别人的抽奖且没中奖 → 记录没有用了，直接清掉。
    // 它是"点了评论就记"的推测数据，用户看不到，留着只会占地方。
    // （名单为空说明这帖无人中奖，同样清理）
    if (current.participated && !wonNow) {
      delete records[String(current.postId)];
    }
    luckyNotifyWriteRecords(records);
    return true;
  }

  async function runLuckyNotifyChecks() {
    if (luckyNotifyChecking) return;
    // 里层 iframe（lucky 页）不参与检查，否则会无限套娃
    if (!luckyNotifyTopFrame()) return;
    const due = luckyNotifyList().filter((item) => {
      if (!luckyNotifyRevealed(item)) return false;
      // 拿到名单后每小时复查一次，捕捉楼主后来才 @ 中奖人的情况
      return Date.now() - Number(item.checkedAt || 0) >= LUCKY_NOTIFY_RECHECK_MS;
    });
    if (!due.length) return;
    luckyNotifyChecking = true;
    try {
      for (const item of due) {
        await luckyNotifyCheckItem(item);
        renderLuckyNotifyEntries();
      }
    } finally {
      luckyNotifyChecking = false;
      renderLuckyNotifyEntries();
    }
  }

  function installLuckyNotifyRuntime() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    if (pageWindow[LUCKY_NOTIFY_RUNTIME_KEY]) return;
    if (!luckyNotifyTopFrame()) return;
    pageWindow[LUCKY_NOTIFY_RUNTIME_KEY] = true;
    document.addEventListener('click', (event) => {
      // 确认弹窗里的按钮
      const confirmAction = event.target.closest('[data-nsit-lucky-notify-confirm-action]')?.dataset.nsitLuckyNotifyConfirmAction;
      if (confirmAction) {
        event.preventDefault();
        event.stopPropagation();
        const confirm = document.querySelector('[data-nsit-lucky-notify-confirm]');
        const postId = confirm?.dataset.nsitLuckyConfirmPost || '';
        closeLuckyNotifyConfirm();
        if (confirmAction === 'confirm' && postId) deleteLuckyNotifyRecord(postId);
        return;
      }
      if (event.target.matches('[data-nsit-lucky-notify-confirm]')) {
        closeLuckyNotifyConfirm();
        return;
      }
      const deleteButton = event.target.closest('[data-nsit-lucky-delete-post]');
      if (deleteButton) {
        event.preventDefault();
        event.stopPropagation();
        const postId = deleteButton.getAttribute('data-nsit-lucky-delete-post');
        // 「待公布」删掉就没有提醒入口了，先二次确认
        if (luckyNotifyRecordNeedsConfirm(postId)) openLuckyNotifyConfirm(postId);
        else deleteLuckyNotifyRecord(postId);
        return;
      }
      if (event.target.closest('[data-nsit-lucky-notify-action="close"]')) {
        closeLuckyNotifyModals();
        return;
      }
      const entry = event.target.closest('[data-nsit-lucky-notify]');
      if (entry) {
        event.preventDefault();
        const kind = entry.getAttribute('data-nsit-lucky-notify');
        if (luckyNotifyModal(kind)?.classList.contains('is-open')) closeLuckyNotifyModals();
        else openLuckyNotifyModal(kind);
        return;
      }
      if (event.target.matches('[data-nsit-lucky-notify-modal]')) closeLuckyNotifyModals();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.querySelector('[data-nsit-lucky-notify-confirm].is-open')) { closeLuckyNotifyConfirm(); return; }
      if (event.key === 'Escape' && document.querySelector('[data-nsit-lucky-notify-modal].is-open')) closeLuckyNotifyModals();
    });
    // 开奖时间可能在这之后才到，到点了自动复查一次
    setInterval(() => runLuckyNotifyChecks(), LUCKY_NOTIFY_RECHECK_MS);
  }

  /* 开奖公告 ---------------------------------------------------------------
   * 把标题改成【已开奖】并把中奖名单回填到正文，走和「交易状态」「抽奖回写」
   * 一样的静默编辑：借楼主的编辑入口，隐藏浮层再提交。
   * 公告文案沿用 NS 自己的「生成@消息」格式。
   * ------------------------------------------------------------------------- */

  // 标题里写的标记
  const LUCKY_ANNOUNCE_STATUS = '已开奖';
  // 按钮上的文案（动作，不是状态）
  const LUCKY_ANNOUNCE_BUTTON = '公布中奖名单';
  const LUCKY_ANNOUNCE_KEY = 'nsit-lucky-announce-v1';
  const LUCKY_ANNOUNCE_RUNTIME_KEY = '__nodeSeekIssueTemplatesLuckyAnnounce__';

  let luckyAnnounceRunning = false;

  // 沿用 NS 抽奖页的格式：@名字 [#楼层](/post-xxx-N#楼层)
  function luckyNotifyMentionMarkdown(item, winner) {
    const floor = Number(winner.floor);
    if (!Number.isInteger(floor) || floor < 0) return `@${winner.name}`;
    const page = floor <= 10 ? 1 : Math.floor((floor - 1) / 10) + 1;
    return `@${winner.name} [#${floor}](https://www.nodeseek.com/post-${item.postId}-${page}#${floor})`;
  }

  function luckyAnnounceBlock(item, winners) {
    const mentions = winners.map((winner) => luckyNotifyMentionMarkdown(item, winner)).join(' ');
    return `${mentions} 恭喜中奖🎁`;
  }

  function luckyAnnounceTitle(title) {
    const base = String(title || '').trim()
      .replace(/^[【\[]\s*(?:已开奖|开奖)\s*[】\]]\s*/, '')
      .trim();
    return `【${LUCKY_ANNOUNCE_STATUS}】${base ? ` ${base}` : ''}`;
  }

  function luckyAnnounceTargetTitle() {
    const element = document.querySelector('.post-title');
    return element?.textContent?.trim() || document.title.replace(/\s*[-–]\s*NodeSeek\s*$/i, '').trim();
  }

  // 两次静默编辑开销不小，用一次性记录把结果回传给渲染层
  function luckyAnnounceWriteRecord(payload) {
    try { sessionStorage.setItem(LUCKY_ANNOUNCE_KEY, JSON.stringify(payload)); } catch (_) { /* 存储不可用时忽略 */ }
  }

  function luckyAnnounceReadRecord() {
    try {
      const raw = sessionStorage.getItem(LUCKY_ANNOUNCE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function luckyAnnounceClearRecord() {
    try { sessionStorage.removeItem(LUCKY_ANNOUNCE_KEY); } catch (_) { /* 存储不可用时忽略 */ }
  }

  // 借楼主的「编辑」入口做一次静默提交；title/insert 二选一
  // 通过编辑接口一次性改标题和正文；返回是否真的提交了
  async function luckyAnnounceEdit({ title = '', append = '' } = {}) {
    const postId = currentPostId();
    if (!postId) throw new Error('未找到帖子 ID');
    const fromConfig = luckyPostMarkdownFromConfig(postId);
    const current = fromConfig || luckyFirstFloor()?.querySelector('.post-content')?.textContent || '';
    if (!current) throw new Error('没有取到正文内容');
    const content = append ? luckyInsertContent(current, append, 'end') : current;
    await luckyEditPostViaApi({ postId, title, content });
    return true;
  }

  async function runLuckyAnnounce(item, winners) {
    if (luckyAnnounceRunning) return;
    if (!winners || !winners.length) return;
    luckyAnnounceRunning = true;
    const postId = String(item.postId);
    try {
      const currentTitle = luckyAnnounceTargetTitle();
      const nextTitle = luckyAnnounceTitle(currentTitle);
      const block = luckyAnnounceBlock(item, winners);
      const html = await luckyNotifyFetchPostHtml(postId);
      const already = html && luckyNotifyAnnounced(html, winners);
      // NS 的 edit-discussion 一次提交同时带上 title + content，
      // 所以标题和正文必须一次改完：提交成功后 NS 会 location.reload()，
      // 拆成两次的话第二次编辑会被页面重载打断、永远执行不到。
      const needTitle = nextTitle !== currentTitle;
      const didEdit = needTitle || !already;
      if (didEdit) {
        await luckyAnnounceEdit({ title: needTitle ? nextTitle : '', append: already ? '' : block });
      }
      // 同步本地状态：右侧「抽奖」徽标要立刻清零，弹窗按钮也要变成已完成
      const records = { ...luckyNotifyRecords() };
      const current = records[postId];
      if (current) {
        current.announced = winners.length;
        current.checkedAt = Date.now();
        luckyNotifyWriteRecords(records);
      }
      luckyAnnounceWriteRecord({ postId, at: Date.now(), ok: true });
      // 只有真的改过才刷新：否则「已公布」时每次进页面都会重载一次
      if (didEdit) luckyRefreshPostView();
      return true;
    } catch (error) {
      console.warn('[NSIT] 开奖公告失败', error);
      const message = String(error?.message || error);
      luckyAnnounceWriteRecord({ postId, at: Date.now(), ok: false, message });
      showLuckyNotice('开奖公告没有完成，请稍后重试；也可以打开帖子手动编辑标题和正文。', { sticky: true, tone: 'error' });
      return false;
    } finally {
      luckyAnnounceRunning = false;
    }
  }

  // 按钮的有无只看帖子本身，不看本地记录：
  // ① 当前页是抽奖贴（#0 楼有开奖链接）② 楼主是当前用户 ③ 还没公布名单
  function luckyAnnounceContext() {
    const postId = currentPostId();
    if (!postId) return null;
    // 编辑弹窗打开时不显示
    if (document.querySelector('#mde-title')) return null;
    const firstFloor = luckyFirstFloor();
    if (!firstFloor) return null;
    // 只认楼主楼层，避免在别人帖子里误伤
    const ownId = String(currentNodeSeekUserId() || '');
    const authorHref = firstFloor.querySelector('a[href^="/space/"]')?.getAttribute('href') || '';
    const authorId = authorHref.match(/^\/space\/(\d+)/)?.[1] || '';
    if (!ownId || authorId !== ownId) return null;
    // 帖子里必须有指向本贴的开奖链接
    const parsed = luckyCurrentDraw();
    if (!parsed || parsed.postId !== postId) return null;
    // 还没到开奖时间：没有名单可公布，不显示按钮
    if (!luckyNotifyRevealed(parsed)) return null;
    // 标题已经标记过【已开奖】→ 视为已公布
    if (/[【\[]\s*(?:已开奖|开奖)\s*[】\]]/.test(luckyAnnounceTargetTitle())) return null;
    // 本地已记录且正文已 @ 全部中奖人 → 已公布
    const record = luckyNotifyRecords()[postId];
    const winners = luckyNotifyWinners(record);
    if (winners && winners.length && Number(record.announced) === winners.length) return null;
    return { postId, record, winners, parsed, firstFloor };
  }

  // 拿中奖名单：本地有就用本地的，没有就现拉（首次点击时）
  async function resolveLuckyAnnounceWinners(context) {
    const cached = luckyNotifyWinners(context.record);
    if (cached && cached.length) return cached;
    const source = { ...(context.record || context.parsed) };
    if (!Number(source.time)) return null;
    return luckyNotifyReadWinners({ ...source, postId: context.postId });
  }

  function renderLuckyAnnounceButton() {
    if (!luckyNotifyTopFrame()) return;
    const existing = document.querySelector('[data-nsit-lucky-announce]');
    const context = luckyAnnounceContext();
    if (!context) {
      existing?.remove();
      return;
    }
    const floorLink = context.firstFloor.querySelector('.floor-link[href="#0"]');
    if (!floorLink) return;
    if (existing?.nextElementSibling === floorLink) return;
    existing?.remove();
    ensureLuckyNotifyStyles();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nsit-lucky-announce-button';
    button.setAttribute('data-nsit-lucky-announce', '');
    button.textContent = LUCKY_ANNOUNCE_BUTTON;
    button.title = `把标题改成【${LUCKY_ANNOUNCE_STATUS}】并把中奖名单写进正文`;
    floorLink.before(button);
  }

  // 从弹窗跨页面跳过来：URL 带 nsit-lucky-announce=1，落地后自动执行
  function runLuckyAnnounceFromUrl() {
    if (luckyAnnounceRunning) return;
    const params = new URLSearchParams(location.search);
    if (params.get('nsit-lucky-announce') !== '1') return;
    const postId = currentPostId();
    if (!postId) return;
    const record = luckyNotifyRecords()[postId];
    const winners = luckyNotifyWinners(record);
    if (!record || !winners || !winners.length) return;
    // 先把标记从 URL 清掉再执行：成功后 runLuckyAnnounce 会 location.reload()，
    // 若标记还在，重载后会再次触发，形成循环
    params.delete('nsit-lucky-announce');
    const rest = params.toString();
    try {
      history.replaceState(null, '', rest ? `${location.pathname}?${rest}${location.hash}` : `${location.pathname}${location.hash}`);
    } catch (_) { /* 测试环境不支持时忽略 */ }
    // 楼层可能稍后才渲染出来，等一下再执行
    waitForElement(luckyFirstFloor, 8000).then((firstFloor) => {
      if (!firstFloor) {
        showLuckyNotice('页面还没加载完成，开奖公告没有执行；请刷新后重试。', { sticky: true, tone: 'error' });
        return;
      }
      return runLuckyAnnounce(record, winners);
    });
  }

  function installLuckyAnnounceRuntime() {
    const pageWindow = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    if (pageWindow[LUCKY_ANNOUNCE_RUNTIME_KEY]) return;
    pageWindow[LUCKY_ANNOUNCE_RUNTIME_KEY] = true;
    document.addEventListener('click', (event) => {
      const modalButton = event.target.closest('[data-nsit-lucky-announce-post]');
      if (modalButton) {
        event.preventDefault();
        event.stopPropagation();
        if (modalButton.disabled) return;
        const postId = modalButton.getAttribute('data-nsit-lucky-announce-post');
        const record = luckyNotifyRecords()[postId];
        const winners = luckyNotifyWinners(record);
        if (!record || !winners || !winners.length) return;
        // 静默编辑依赖当前页面里的楼主编辑入口；跨页面时先带标记跳过去，落地后自动执行
        if (String(record.postId) !== currentPostId()) {
          const target = new URL(`/post-${record.postId}-1`, location.origin);
          target.searchParams.set('nsit-lucky-announce', '1');
          location.assign(target);
          return;
        }
        modalButton.disabled = true;
        const label = modalButton.textContent;
        modalButton.textContent = '处理中…';
        runLuckyAnnounce(record, winners).then((ok) => {
          modalButton.textContent = ok ? '已公布' : label;
          if (!ok) modalButton.disabled = false;
          if (ok) {
            const modal = luckyNotifyModal('own');
            if (modal) modal.querySelector('[data-nsit-lucky-notify-list]').innerHTML = luckyNotifyListMarkup('own');
          }
          renderLuckyNotifyEntries();
        });
        return;
      }
      const button = event.target.closest('[data-nsit-lucky-announce]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (button.dataset.nsitLuckyBusy) return;
      const context = luckyAnnounceContext();
      if (!context) return;
      button.dataset.nsitLuckyBusy = '1';
      button.textContent = '处理中…';
      resolveLuckyAnnounceWinners(context).then((winners) => {
        if (!winners || !winners.length) {
          delete button.dataset.nsitLuckyBusy;
          button.textContent = LUCKY_ANNOUNCE_BUTTON;
          showLuckyNotice('还没拿到中奖名单，请确认已到开奖时间后重试。', { sticky: true, tone: 'error' });
          return null;
        }
        return runLuckyAnnounce({ ...(context.record || context.parsed), postId: context.postId }, winners);
      }).then((ok) => {
        if (ok === null) return;
        delete button.dataset.nsitLuckyBusy;
        renderLuckyNotifyEntries();
        if (ok) renderLuckyAnnounceButton();
        else button.textContent = LUCKY_ANNOUNCE_BUTTON;
      });
    });
  }
