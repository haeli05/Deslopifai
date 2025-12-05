/**
 * Deslopifai Popup Script
 */

(async function() {
  'use strict';

  // DOM elements
  const mainToggle = document.getElementById('mainToggle');
  const siteDomain = document.getElementById('siteDomain');
  const siteBadge = document.getElementById('siteBadge');
  const flaggedCount = document.getElementById('flaggedCount');
  const totalCount = document.getElementById('totalCount');
  const rescanBtn = document.getElementById('rescanBtn');
  const trustBtn = document.getElementById('trustBtn');
  const blockBtn = document.getElementById('blockBtn');
  const resetBtn = document.getElementById('resetBtn');
  const settingsLink = document.getElementById('settingsLink');

  let currentDomain = '';
  let currentTabId = null;

  // Get current tab info
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  // Get domain from URL
  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  // Load settings
  async function loadSettings() {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      highlightStyle: 'hidden',
      stats: { totalScanned: 0, flagged: 0 }
    });
    return settings;
  }

  // Get domain status
  async function getDomainStatus(domain) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getDomainStatus', domain }, (response) => {
        resolve(response?.status || 'neutral');
      });
    });
  }

  // Get page stats from content script
  async function getPageStats(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { type: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ flagged: 0 });
        } else {
          resolve(response || { flagged: 0 });
        }
      });
    });
  }

  // Update UI based on current state
  async function updateUI() {
    const tab = await getCurrentTab();
    if (!tab?.url) return;

    currentTabId = tab.id;
    currentDomain = getDomain(tab.url);

    // Update domain display
    siteDomain.textContent = currentDomain || 'Unknown';

    // Load settings and stats
    const settings = await loadSettings();

    // Update toggle
    if (settings.enabled) {
      mainToggle.classList.add('active');
    } else {
      mainToggle.classList.remove('active');
    }

    // Update total count
    totalCount.textContent = settings.stats.totalScanned.toLocaleString();

    // Get domain status
    const status = await getDomainStatus(currentDomain);

    // Update site badge and buttons
    updateSiteStatus(status);

    // Get page-specific stats
    const pageStats = await getPageStats(currentTabId);
    flaggedCount.textContent = pageStats.flagged || 0;
  }

  // Update site status display
  async function updateSiteStatus(status) {
    const settings = await loadSettings();
    siteBadge.classList.remove('trusted', 'blocked', 'scanning', 'hiding');
    trustBtn.classList.remove('hidden', 'disabled');
    blockBtn.classList.remove('hidden', 'disabled');
    resetBtn.classList.add('hidden');

    switch (status) {
      case 'trusted':
        siteBadge.textContent = 'Trusted';
        siteBadge.classList.add('trusted');
        trustBtn.classList.add('disabled');
        resetBtn.classList.remove('hidden');
        break;

      case 'blocked':
        siteBadge.textContent = 'Blocked';
        siteBadge.classList.add('blocked');
        blockBtn.classList.add('disabled');
        resetBtn.classList.remove('hidden');
        break;

      default:
        if (settings.highlightStyle === 'hidden') {
          siteBadge.textContent = 'Hiding Slop';
          siteBadge.classList.add('hiding');
        } else {
          siteBadge.textContent = 'Scanning';
          siteBadge.classList.add('scanning');
        }
    }
  }

  // Event handlers
  mainToggle.addEventListener('click', async () => {
    const settings = await loadSettings();
    const newEnabled = !settings.enabled;

    await chrome.storage.sync.set({ enabled: newEnabled });

    if (newEnabled) {
      mainToggle.classList.add('active');
    } else {
      mainToggle.classList.remove('active');
    }

    // Notify content script
    if (currentTabId) {
      chrome.tabs.sendMessage(currentTabId, { type: 'settingsUpdated' });
    }
  });

  rescanBtn.addEventListener('click', async () => {
    if (currentTabId) {
      rescanBtn.disabled = true;
      rescanBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> Scanning...';

      chrome.tabs.sendMessage(currentTabId, { type: 'rescan' }, () => {
        setTimeout(async () => {
          rescanBtn.disabled = false;
          rescanBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> Rescan Page';
          await updateUI();
        }, 500);
      });
    }
  });

  trustBtn.addEventListener('click', async () => {
    if (!currentDomain) return;

    chrome.runtime.sendMessage({ type: 'trustDomain', domain: currentDomain }, async () => {
      updateSiteStatus('trusted');
      if (currentTabId) {
        chrome.tabs.sendMessage(currentTabId, { type: 'rescan' });
      }
    });
  });

  blockBtn.addEventListener('click', async () => {
    if (!currentDomain) return;

    chrome.runtime.sendMessage({ type: 'blockDomain', domain: currentDomain }, async () => {
      updateSiteStatus('blocked');
      if (currentTabId) {
        chrome.tabs.sendMessage(currentTabId, { type: 'rescan' });
      }
    });
  });

  resetBtn.addEventListener('click', async () => {
    if (!currentDomain) return;

    chrome.runtime.sendMessage({ type: 'resetDomain', domain: currentDomain }, async () => {
      updateSiteStatus('neutral');
      if (currentTabId) {
        chrome.tabs.sendMessage(currentTabId, { type: 'rescan' });
      }
    });
  });

  settingsLink.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Initialize
  updateUI();
})();
