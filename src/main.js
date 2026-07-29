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
    applyPersonalSettings(app);
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
      const tag = event.target.matches('[name="transferTags"], [name="presetTags"]') ? event.target : null;
      if (tag?.checked && ['transfer', 'broker', 'push', 'payment'].includes(tag.dataset.tagGroup)) {
        app.querySelectorAll(`[name="${tag.name}"][data-tag-group="${tag.dataset.tagGroup}"]`).forEach((input) => {
          if (input !== tag) input.checked = false;
        });
      }
      refreshTitle(app); refreshCard(app); refreshPricePreview(app); refreshRemainingTrafficValidity(app); saveDraft(app);
      saveActiveMachine(app); renderMachineTabs(app);
      if (event.target.name === 'currency') loadRate(app);
    });
    app.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.matches('[data-nsit-custom-tag-input]')) {
        event.preventDefault();
        event.target.closest('[data-nsit-personalization-form]')?.querySelector('[data-action="add-custom-tag"]')?.click();
        return;
      }
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
      if (action === 'open-personalization') {
        openPersonalization(app);
        return;
      }
      if (action === 'close-personalization') {
        closePersonalization(app);
        return;
      }
      if (action === 'move-title-field') {
        const item = event.target.closest('[data-nsit-title-field]');
        const target = event.target.dataset.direction === 'up' ? item?.previousElementSibling : item?.nextElementSibling;
        if (item && target) item.parentElement.insertBefore(item, event.target.dataset.direction === 'up' ? target : target.nextElementSibling);
        refreshTitlePreview(app);
        return;
      }
      if (action === 'add-title-field' || action === 'remove-title-field') {
        const item = event.target.closest('[data-nsit-title-field]');
        const destination = app.querySelector(action === 'add-title-field' ? '[data-nsit-title-field-order]' : '[data-nsit-title-field-available]');
        if (item && destination) destination.append(item);
        refreshTitlePreview(app);
        return;
      }
      if (action === 'add-custom-tag') {
        const form = event.target.closest('[data-nsit-personalization-form]');
        const input = form?.querySelector('[data-nsit-custom-tag-input]');
        const list = form?.querySelector('[data-nsit-custom-tag-list]');
        const value = input?.value.trim();
        if (value && list && !Array.from(list.querySelectorAll('[data-nsit-custom-tag]')).some((item) => item.dataset.nsitCustomTag === value)) {
          const tag = document.createElement('span');
          tag.className = 'nsit-custom-tag'; tag.dataset.nsitCustomTag = value;
          tag.append(document.createTextNode(value));
          const remove = document.createElement('button');
          remove.type = 'button'; remove.dataset.action = 'remove-custom-tag'; remove.setAttribute('aria-label', `删除 ${value}`); remove.textContent = '×';
          tag.append(remove); list.append(tag); input.value = '';
        }
        input?.focus();
        return;
      }
      if (action === 'remove-custom-tag') {
        event.target.closest('[data-nsit-custom-tag]')?.remove();
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
    app.querySelector('.nsit-personalization-modal').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closePersonalization(app);
    });
    app.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-nsit-personalization-form]')) return;
      event.preventDefault();
      savePersonalizationForm(app);
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
