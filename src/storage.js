/**
 * Storage Manager for Deslopifai
 * Handles whitelist/blacklist, user corrections, and settings
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  sensitivity: 50,
  showBadge: true,
  highlightStyle: 'subtle', // 'subtle', 'prominent', 'badge-only'
  trustedDomains: [],
  blockedDomains: [],
  trustedAuthors: [],
  blockedAuthors: [],
  customSelectors: [], // CSS selectors to scan
  excludeSelectors: [], // CSS selectors to skip
  userCorrections: {}, // contentHash -> { isHuman: boolean, url, timestamp }
  stats: {
    totalScanned: 0,
    flagged: 0,
    userMarkedHuman: 0,
    userMarkedAI: 0
  }
};

/**
 * Get all settings
 */
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return result;
  } catch (error) {
    console.error('Deslopifai: Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update settings
 */
async function updateSettings(updates) {
  try {
    await chrome.storage.sync.set(updates);
    return true;
  } catch (error) {
    console.error('Deslopifai: Error updating settings:', error);
    return false;
  }
}

/**
 * Check if a domain is trusted
 */
async function isDomainTrusted(domain) {
  const settings = await getSettings();
  return settings.trustedDomains.some(d =>
    domain === d || domain.endsWith('.' + d)
  );
}

/**
 * Check if a domain is blocked
 */
async function isDomainBlocked(domain) {
  const settings = await getSettings();
  return settings.blockedDomains.some(d =>
    domain === d || domain.endsWith('.' + d)
  );
}

/**
 * Add domain to trusted list
 */
async function trustDomain(domain) {
  const settings = await getSettings();
  if (!settings.trustedDomains.includes(domain)) {
    settings.trustedDomains.push(domain);
    // Remove from blocked if present
    settings.blockedDomains = settings.blockedDomains.filter(d => d !== domain);
    await updateSettings({
      trustedDomains: settings.trustedDomains,
      blockedDomains: settings.blockedDomains
    });
  }
  return true;
}

/**
 * Add domain to blocked list
 */
async function blockDomain(domain) {
  const settings = await getSettings();
  if (!settings.blockedDomains.includes(domain)) {
    settings.blockedDomains.push(domain);
    // Remove from trusted if present
    settings.trustedDomains = settings.trustedDomains.filter(d => d !== domain);
    await updateSettings({
      trustedDomains: settings.trustedDomains,
      blockedDomains: settings.blockedDomains
    });
  }
  return true;
}

/**
 * Remove domain from both lists
 */
async function resetDomain(domain) {
  const settings = await getSettings();
  settings.trustedDomains = settings.trustedDomains.filter(d => d !== domain);
  settings.blockedDomains = settings.blockedDomains.filter(d => d !== domain);
  await updateSettings({
    trustedDomains: settings.trustedDomains,
    blockedDomains: settings.blockedDomains
  });
  return true;
}

/**
 * Store user correction for content
 */
async function storeCorrection(contentHash, isHuman, url) {
  const settings = await getSettings();
  settings.userCorrections[contentHash] = {
    isHuman,
    url,
    timestamp: Date.now()
  };

  // Update stats
  if (isHuman) {
    settings.stats.userMarkedHuman++;
  } else {
    settings.stats.userMarkedAI++;
  }

  await updateSettings({
    userCorrections: settings.userCorrections,
    stats: settings.stats
  });
  return true;
}

/**
 * Get correction for content if exists
 */
async function getCorrection(contentHash) {
  const settings = await getSettings();
  return settings.userCorrections[contentHash] || null;
}

/**
 * Update scan statistics
 */
async function updateStats(flagged = false) {
  const settings = await getSettings();
  settings.stats.totalScanned++;
  if (flagged) {
    settings.stats.flagged++;
  }
  await updateSettings({ stats: settings.stats });
}

/**
 * Export settings for backup
 */
async function exportSettings() {
  const settings = await getSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from backup
 */
async function importSettings(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    // Validate structure
    const validated = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (key in imported && typeof imported[key] === typeof DEFAULT_SETTINGS[key]) {
        validated[key] = imported[key];
      }
    }
    await chrome.storage.sync.set(validated);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get domain status
 */
async function getDomainStatus(domain) {
  const settings = await getSettings();
  if (settings.trustedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'trusted';
  }
  if (settings.blockedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'blocked';
  }
  return 'neutral';
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.DeslopifaiStorage = {
    getSettings,
    updateSettings,
    isDomainTrusted,
    isDomainBlocked,
    trustDomain,
    blockDomain,
    resetDomain,
    storeCorrection,
    getCorrection,
    updateStats,
    exportSettings,
    importSettings,
    getDomainStatus,
    DEFAULT_SETTINGS
  };
}
