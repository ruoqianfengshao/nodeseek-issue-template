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
    initializeMachines(app);
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
        refreshVendorPicker(picker);
      }
      if (event.target.name === 'askingPrice' || event.target.name === 'askingPremium') syncPriceFields(app);
      if (event.target.name !== 'postTitle') refreshTitle(app);
      refreshCard(app); refreshPricePreview(app); saveDraft(app);
      saveActiveMachine(app); renderMachineTabs(app);
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
      refreshTitle(app); refreshCard(app); refreshPricePreview(app); saveDraft(app);
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
