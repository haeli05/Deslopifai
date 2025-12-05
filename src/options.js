/**
 * Deslopifai Options Page Script
 */

(async function() {
  'use strict';

  // DOM Elements
  const enabledToggle = document.getElementById('enabledToggle');
  const showBadgeToggle = document.getElementById('showBadgeToggle');
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const highlightStyleSelect = document.getElementById('highlightStyleSelect');

  const trustedList = document.getElementById('trustedList');
  const blockedList = document.getElementById('blockedList');
  const trustedInput = document.getElementById('trustedInput');
  const blockedInput = document.getElementById('blockedInput');
  const addTrustedBtn = document.getElementById('addTrustedBtn');
  const addBlockedBtn = document.getElementById('addBlockedBtn');

  const statTotal = document.getElementById('statTotal');
  const statFlagged = document.getElementById('statFlagged');
  const statHuman = document.getElementById('statHuman');
  const statAI = document.getElementById('statAI');

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const resetBtn = document.getElementById('resetBtn');
  const importFile = document.getElementById('importFile');

  const toast = document.getElementById('toast');

  // Default settings
  const DEFAULT_SETTINGS = {
    enabled: true,
    sensitivity: 50,
    showBadge: true,
    highlightStyle: 'hidden',
    trustedDomains: [],
    blockedDomains: [],
    trustedAuthors: [],
    blockedAuthors: [],
    customSelectors: [],
    excludeSelectors: [],
    userCorrections: {},
    stats: {
      totalScanned: 0,
      flagged: 0,
      userMarkedHuman: 0,
      userMarkedAI: 0
    }
  };

  // Show toast notification
  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} visible`;
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }

  // Load settings
  async function loadSettings() {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return settings;
  }

  // Save settings
  async function saveSettings(updates) {
    await chrome.storage.sync.set(updates);
  }

  // Update toggle state
  function updateToggle(element, active) {
    if (active) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  }

  // Render domain list
  function renderList(container, items, listType) {
    if (items.length === 0) {
      container.innerHTML = '<div class="list-empty">No domains added</div>';
      return;
    }

    container.innerHTML = items.map(domain => `
      <div class="list-item">
        <span class="list-item-text">${domain}</span>
        <button class="list-item-remove" data-domain="${domain}" data-list="${listType}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
    `).join('');

    // Add click handlers for remove buttons
    container.querySelectorAll('.list-item-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const domain = btn.dataset.domain;
        const list = btn.dataset.list;
        await removeDomain(domain, list);
      });
    });
  }

  // Add domain to list
  async function addDomain(domain, listType) {
    domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

    if (!domain || !/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(domain)) {
      showToast('Invalid domain format', 'error');
      return false;
    }

    const settings = await loadSettings();
    const listKey = listType === 'trusted' ? 'trustedDomains' : 'blockedDomains';
    const otherKey = listType === 'trusted' ? 'blockedDomains' : 'trustedDomains';

    if (settings[listKey].includes(domain)) {
      showToast('Domain already in list', 'error');
      return false;
    }

    settings[listKey].push(domain);
    settings[otherKey] = settings[otherKey].filter(d => d !== domain);

    await saveSettings({
      [listKey]: settings[listKey],
      [otherKey]: settings[otherKey]
    });

    showToast(`Added ${domain} to ${listType} list`);
    return true;
  }

  // Remove domain from list
  async function removeDomain(domain, listType) {
    const settings = await loadSettings();
    const listKey = listType === 'trusted' ? 'trustedDomains' : 'blockedDomains';

    settings[listKey] = settings[listKey].filter(d => d !== domain);
    await saveSettings({ [listKey]: settings[listKey] });

    showToast(`Removed ${domain}`);
    await updateUI();
  }

  // Update UI with current settings
  async function updateUI() {
    const settings = await loadSettings();

    // Update toggles
    updateToggle(enabledToggle, settings.enabled);
    updateToggle(showBadgeToggle, settings.showBadge);

    // Update slider
    sensitivitySlider.value = settings.sensitivity;
    sensitivityValue.textContent = settings.sensitivity;

    // Update select
    highlightStyleSelect.value = settings.highlightStyle;

    // Update lists
    renderList(trustedList, settings.trustedDomains, 'trusted');
    renderList(blockedList, settings.blockedDomains, 'blocked');

    // Update stats
    statTotal.textContent = settings.stats.totalScanned.toLocaleString();
    statFlagged.textContent = settings.stats.flagged.toLocaleString();
    statHuman.textContent = settings.stats.userMarkedHuman.toLocaleString();
    statAI.textContent = settings.stats.userMarkedAI.toLocaleString();
  }

  // Event handlers
  enabledToggle.addEventListener('click', async () => {
    const settings = await loadSettings();
    await saveSettings({ enabled: !settings.enabled });
    updateToggle(enabledToggle, !settings.enabled);
    showToast(settings.enabled ? 'Detection disabled' : 'Detection enabled');
  });

  showBadgeToggle.addEventListener('click', async () => {
    const settings = await loadSettings();
    await saveSettings({ showBadge: !settings.showBadge });
    updateToggle(showBadgeToggle, !settings.showBadge);
    showToast(settings.showBadge ? 'Badge hidden' : 'Badge shown');
  });

  sensitivitySlider.addEventListener('input', () => {
    sensitivityValue.textContent = sensitivitySlider.value;
  });

  sensitivitySlider.addEventListener('change', async () => {
    await saveSettings({ sensitivity: parseInt(sensitivitySlider.value) });
    showToast(`Sensitivity set to ${sensitivitySlider.value}`);
  });

  highlightStyleSelect.addEventListener('change', async () => {
    await saveSettings({ highlightStyle: highlightStyleSelect.value });
    showToast(`Highlight style: ${highlightStyleSelect.value}`);
  });

  addTrustedBtn.addEventListener('click', async () => {
    if (await addDomain(trustedInput.value, 'trusted')) {
      trustedInput.value = '';
      await updateUI();
    }
  });

  trustedInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      if (await addDomain(trustedInput.value, 'trusted')) {
        trustedInput.value = '';
        await updateUI();
      }
    }
  });

  addBlockedBtn.addEventListener('click', async () => {
    if (await addDomain(blockedInput.value, 'blocked')) {
      blockedInput.value = '';
      await updateUI();
    }
  });

  blockedInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      if (await addDomain(blockedInput.value, 'blocked')) {
        blockedInput.value = '';
        await updateUI();
      }
    }
  });

  exportBtn.addEventListener('click', async () => {
    const settings = await loadSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `deslopifai-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Settings exported');
  });

  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      // Validate and merge
      const validated = { ...DEFAULT_SETTINGS };
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (key in imported && typeof imported[key] === typeof DEFAULT_SETTINGS[key]) {
          validated[key] = imported[key];
        }
      }

      await chrome.storage.sync.set(validated);
      await updateUI();
      showToast('Settings imported successfully');
    } catch (error) {
      showToast('Invalid settings file', 'error');
    }

    importFile.value = '';
  });

  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      await chrome.storage.sync.clear();
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      await updateUI();
      showToast('All settings reset');
    }
  });

  // Initialize
  updateUI();
})();
