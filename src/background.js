/**
 * Deslopifai Background Service Worker
 * Manages storage, context menus, badge updates, and premium stubs
 */

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

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  // Set default settings on install
  if (details.reason === 'install') {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }

  // Create context menus
  setupContextMenus();
});

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'deslopifai-trust',
      title: 'Deslopifai: Trust this site',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.create({
      id: 'deslopifai-block',
      title: 'Deslopifai: Always flag this site',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.create({
      id: 'deslopifai-separator',
      type: 'separator',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.create({
      id: 'deslopifai-mark-human',
      title: 'Deslopifai: Mark selection as human-written',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'deslopifai-mark-ai',
      title: 'Deslopifai: Mark selection as AI-generated',
      contexts: ['selection']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const domain = new URL(tab.url).hostname.replace(/^www\./, '');

  switch (info.menuItemId) {
    case 'deslopifai-trust':
      await trustDomain(domain);
      notifyTab(tab.id, 'rescan');
      break;

    case 'deslopifai-block':
      await blockDomain(domain);
      notifyTab(tab.id, 'rescan');
      break;

    case 'deslopifai-mark-human':
      if (info.selectionText) {
        await storeSelectionCorrection(info.selectionText, true, tab.url);
        notifyTab(tab.id, 'rescan');
      }
      break;

    case 'deslopifai-mark-ai':
      if (info.selectionText) {
        await storeSelectionCorrection(info.selectionText, false, tab.url);
        notifyTab(tab.id, 'rescan');
      }
      break;
  }
});

// Domain management functions
async function trustDomain(domain) {
  const data = await chrome.storage.sync.get(['trustedDomains', 'blockedDomains']);
  const trusted = data.trustedDomains || [];
  const blocked = data.blockedDomains || [];

  if (!trusted.includes(domain)) {
    trusted.push(domain);
  }

  const newBlocked = blocked.filter(d => d !== domain);

  await chrome.storage.sync.set({
    trustedDomains: trusted,
    blockedDomains: newBlocked
  });
}

async function blockDomain(domain) {
  const data = await chrome.storage.sync.get(['trustedDomains', 'blockedDomains']);
  const trusted = data.trustedDomains || [];
  const blocked = data.blockedDomains || [];

  if (!blocked.includes(domain)) {
    blocked.push(domain);
  }

  const newTrusted = trusted.filter(d => d !== domain);

  await chrome.storage.sync.set({
    trustedDomains: newTrusted,
    blockedDomains: blocked
  });
}

// Store correction for selected text
async function storeSelectionCorrection(text, isHuman, url) {
  const hash = hashContent(text);
  const data = await chrome.storage.sync.get(['userCorrections', 'stats']);
  const corrections = data.userCorrections || {};
  const stats = data.stats || DEFAULT_SETTINGS.stats;

  corrections[hash] = {
    isHuman,
    url,
    timestamp: Date.now()
  };

  if (isHuman) {
    stats.userMarkedHuman++;
  } else {
    stats.userMarkedAI++;
  }

  await chrome.storage.sync.set({ userCorrections: corrections, stats });
}

// Simple hash function
function hashContent(text) {
  let hash = 0;
  const sample = text.slice(0, 500);
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Notify content script
async function notifyTab(tabId, type, data = {}) {
  try {
    await chrome.tabs.sendMessage(tabId, { type, ...data });
  } catch (e) {
    // Tab might not have content script
  }
}

// Track flagged content per tab for badge
const tabStats = new Map();

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'contentFlagged') {
    const tabId = sender.tab?.id;
    if (tabId) {
      const stats = tabStats.get(tabId) || { count: 0, highestScore: 0 };
      stats.count++;
      stats.highestScore = Math.max(stats.highestScore, message.data.score);
      tabStats.set(tabId, stats);
      updateBadge(tabId, stats);
    }

    // Update global stats
    updateGlobalStats(true);
    sendResponse({ success: true });
  }

  if (message.type === 'getDomainStatus') {
    getDomainStatus(message.domain).then(status => {
      sendResponse({ status });
    });
    return true;
  }

  if (message.type === 'trustDomain') {
    trustDomain(message.domain).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'blockDomain') {
    blockDomain(message.domain).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'resetDomain') {
    resetDomain(message.domain).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  return true;
});

async function getDomainStatus(domain) {
  const data = await chrome.storage.sync.get(['trustedDomains', 'blockedDomains']);
  const trusted = data.trustedDomains || [];
  const blocked = data.blockedDomains || [];

  if (trusted.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'trusted';
  }
  if (blocked.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'blocked';
  }
  return 'neutral';
}

async function resetDomain(domain) {
  const data = await chrome.storage.sync.get(['trustedDomains', 'blockedDomains']);
  const trusted = (data.trustedDomains || []).filter(d => d !== domain);
  const blocked = (data.blockedDomains || []).filter(d => d !== domain);
  await chrome.storage.sync.set({ trustedDomains: trusted, blockedDomains: blocked });
}

// Update badge
async function updateBadge(tabId, stats) {
  const settings = await chrome.storage.sync.get(['showBadge', 'enabled']);

  if (!settings.enabled || !settings.showBadge) {
    await chrome.action.setBadgeText({ tabId, text: '' });
    return;
  }

  if (stats.count > 0) {
    const color = stats.highestScore >= 70 ? '#f44336' :
                  stats.highestScore >= 40 ? '#ff9800' : '#4caf50';

    await chrome.action.setBadgeText({ tabId, text: String(stats.count) });
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
  } else {
    await chrome.action.setBadgeText({ tabId, text: '' });
  }
}

// Update global statistics
async function updateGlobalStats(flagged) {
  const data = await chrome.storage.sync.get(['stats']);
  const stats = data.stats || DEFAULT_SETTINGS.stats;
  stats.totalScanned++;
  if (flagged) stats.flagged++;
  await chrome.storage.sync.set({ stats });
}

// Clear tab stats when tab is closed or navigated
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabStats.delete(tabId);
    chrome.action.setBadgeText({ tabId, text: '' });
  }
});

// ============================================
// PREMIUM FEATURE STUBS
// ============================================

/**
 * Premium: LLM verification for ambiguous scores
 * Stub for future implementation
 */
async function verifyWithLLM(text, score) {
  // TODO: Implement LLM API call for premium users
  // This would send ambiguous content (scores 40-60) to an LLM
  // for more accurate classification
  console.log('Premium feature: LLM verification not yet implemented');
  return {
    available: false,
    message: 'Premium feature - upgrade to enable LLM verification'
  };
}

/**
 * Premium: Community-curated lists sync
 * Stub for future implementation
 */
async function syncCommunityLists() {
  // TODO: Implement community list sync
  // This would fetch crowd-sourced domain/author lists
  console.log('Premium feature: Community lists not yet implemented');
  return {
    available: false,
    message: 'Premium feature - upgrade to enable community lists'
  };
}

/**
 * Premium: Custom phrase lists
 * Stub for future implementation
 */
async function updateCustomPhrases(phrases) {
  // TODO: Implement custom phrase management
  // Premium users could add their own AI-indicator phrases
  console.log('Premium feature: Custom phrases not yet implemented');
  return {
    available: false,
    message: 'Premium feature - upgrade to enable custom phrase lists'
  };
}

/**
 * Premium: Export detailed analytics
 * Stub for future implementation
 */
async function exportAnalytics() {
  // TODO: Implement detailed analytics export
  // CSV/JSON export of all detection data
  console.log('Premium feature: Analytics export not yet implemented');
  return {
    available: false,
    message: 'Premium feature - upgrade to enable analytics export'
  };
}

// Export stubs for potential future use
self.DeslopifaiPremium = {
  verifyWithLLM,
  syncCommunityLists,
  updateCustomPhrases,
  exportAnalytics
};
