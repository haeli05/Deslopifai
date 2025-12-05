/**
 * Deslopifai Content Script
 * Scans DOM for content and applies detection overlays
 */

// Import detector and storage (injected via manifest)
// These will be loaded before content.js runs

(async function() {
  'use strict';

  // ============================================
  // DETECTOR MODULE (inline to avoid import issues)
  // ============================================

  const AI_PHRASES = [
    { pattern: /\bdelve\b/gi, weight: 3 },
    { pattern: /\btapestry\b/gi, weight: 3 },
    { pattern: /\bunlock(?:ing)? the potential\b/gi, weight: 4 },
    { pattern: /\bit'?s important to note\b/gi, weight: 3 },
    { pattern: /\bin today'?s (?:fast-paced|digital|modern|ever-changing)\b/gi, weight: 4 },
    { pattern: /\bgame[ -]?changer\b/gi, weight: 2 },
    { pattern: /\bseamless(?:ly)?\b/gi, weight: 2 },
    { pattern: /\bleverage\b/gi, weight: 2 },
    { pattern: /\bsynergy\b/gi, weight: 3 },
    { pattern: /\bholistic(?:ally)?\b/gi, weight: 2 },
    { pattern: /\brobust\b/gi, weight: 1.5 },
    { pattern: /\bpivotal\b/gi, weight: 2 },
    { pattern: /\bembark(?:ing)? on\b/gi, weight: 3 },
    { pattern: /\bjourney\b/gi, weight: 1.5 },
    { pattern: /\blandscape\b/gi, weight: 1.5 },
    { pattern: /\bparadigm\b/gi, weight: 2 },
    { pattern: /\bcutting[ -]?edge\b/gi, weight: 2 },
    { pattern: /\bstate[ -]?of[ -]?the[ -]?art\b/gi, weight: 2 },
    { pattern: /\binnovative\b/gi, weight: 1 },
    { pattern: /\bgroundbreaking\b/gi, weight: 2 },
    { pattern: /\brevolutionize\b/gi, weight: 2 },
    { pattern: /\btransformative\b/gi, weight: 2 },
    { pattern: /\bempowering\b/gi, weight: 2 },
    { pattern: /\bfoster(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bcultivat(?:e|ing)\b/gi, weight: 1.5 },
    { pattern: /\bnavigat(?:e|ing)\b/gi, weight: 1.5 },
    { pattern: /\bharnessing\b/gi, weight: 2.5 },
    { pattern: /\bunveil(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bmeticulously\b/gi, weight: 2.5 },
    { pattern: /\bcomprehensive\b/gi, weight: 1.5 },
    { pattern: /\bstrategic(?:ally)?\b/gi, weight: 1 },
    { pattern: /\boptimize\b/gi, weight: 1 },
    { pattern: /\bstreamline\b/gi, weight: 1.5 },
    { pattern: /\bfacilitate\b/gi, weight: 1.5 },
    { pattern: /\baugment\b/gi, weight: 2 },
    { pattern: /\bameliorat(?:e|ing)\b/gi, weight: 3 },
    { pattern: /\bmitigat(?:e|ing)\b/gi, weight: 1.5 },
    { pattern: /\bexacerbat(?:e|ing)\b/gi, weight: 2 },
    { pattern: /\bpropel(?:ling)?\b/gi, weight: 2 },
    { pattern: /\bcatapult(?:ing)?\b/gi, weight: 2.5 },
    { pattern: /\btranscend(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bunderpin(?:ning)?\b/gi, weight: 2 },
    { pattern: /\bspearhead(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bchampion(?:ing)?\b/gi, weight: 1.5 },
    { pattern: /\bbolster(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bfortify(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bsafeguard(?:ing)?\b/gi, weight: 1.5 },
    { pattern: /\bin conclusion\b/gi, weight: 1.5 },
    { pattern: /\bto summarize\b/gi, weight: 1 },
    { pattern: /\blet'?s (?:dive|explore|unpack)\b/gi, weight: 3 },
    { pattern: /\bwithout further ado\b/gi, weight: 2 },
    { pattern: /\ba myriad of\b/gi, weight: 3 },
    { pattern: /\ba plethora of\b/gi, weight: 3 },
    { pattern: /\bmoreover\b/gi, weight: 1 },
    { pattern: /\bfurthermore\b/gi, weight: 1 },
    { pattern: /\badditionally\b/gi, weight: 1 },
    { pattern: /\bnevertheless\b/gi, weight: 1 },
    { pattern: /\bnonetheless\b/gi, weight: 1.5 },
    { pattern: /\bnotwithstanding\b/gi, weight: 2 },
    { pattern: /\bconsequently\b/gi, weight: 1 },
    { pattern: /\bsubsequently\b/gi, weight: 1.5 },
    { pattern: /\bultimately\b/gi, weight: 1 },
    { pattern: /\bfundamentally\b/gi, weight: 1.5 },
    { pattern: /\binherently\b/gi, weight: 1.5 },
    { pattern: /\bintrinsically\b/gi, weight: 2 },
    { pattern: /\bparamount\b/gi, weight: 2.5 },
    { pattern: /\bimperative\b/gi, weight: 2 },
    { pattern: /\bindispensable\b/gi, weight: 2 },
    { pattern: /\bpinnacle\b/gi, weight: 2.5 },
    { pattern: /\bepitome\b/gi, weight: 2 },
    { pattern: /\bquintessential\b/gi, weight: 2.5 },
    { pattern: /\bexemplary\b/gi, weight: 1.5 },
    { pattern: /\bstellar\b/gi, weight: 1.5 },
    { pattern: /\bprofound(?:ly)?\b/gi, weight: 2 },
    { pattern: /\benhance(?:d|ment)?\b/gi, weight: 1 },
    { pattern: /\belevat(?:e|ing)\b/gi, weight: 1.5 },
    { pattern: /\breshap(?:e|ing)\b/gi, weight: 2 },
    { pattern: /\bredefin(?:e|ing)\b/gi, weight: 2 },
    { pattern: /\breimagin(?:e|ing)\b/gi, weight: 2.5 },
    { pattern: /\breinvent(?:ing)?\b/gi, weight: 2 },
    { pattern: /\bstakeholder\b/gi, weight: 2 },
    { pattern: /\becosystem\b/gi, weight: 1.5 },
    { pattern: /\bvalue proposition\b/gi, weight: 3 },
    { pattern: /\bactionable insights?\b/gi, weight: 3 },
    { pattern: /\bbest practices?\b/gi, weight: 1.5 },
    { pattern: /\bkey takeaways?\b/gi, weight: 2 },
    { pattern: /\bcore competenc(?:y|ies)\b/gi, weight: 2.5 },
    { pattern: /\bmove the needle\b/gi, weight: 3 },
    { pattern: /\bthink outside the box\b/gi, weight: 2 },
    { pattern: /\blow[ -]?hanging fruit\b/gi, weight: 2.5 },
    { pattern: /\bwin[ -]?win\b/gi, weight: 2 },
    { pattern: /\bat the end of the day\b/gi, weight: 2 },
    { pattern: /\bin the realm of\b/gi, weight: 2.5 },
    { pattern: /\bit'?s worth noting\b/gi, weight: 2.5 },
    { pattern: /\bit bears mentioning\b/gi, weight: 3 },
    { pattern: /\bone could argue\b/gi, weight: 2 },
    { pattern: /\bwhile it'?s true\b/gi, weight: 2 },
    { pattern: /\bgenerally speaking\b/gi, weight: 1.5 },
    { pattern: /\bbroadly speaking\b/gi, weight: 1.5 },
    { pattern: /\bin myriad ways\b/gi, weight: 3 }
  ];

  function getWordCount(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  function analyzeSentenceStructure(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 3) return { uniformity: 0, avgLength: 0 };
    const lengths = sentences.map(s => getWordCount(s));
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const uniformity = avgLength > 0 ? Math.max(0, 1 - (stdDev / avgLength)) : 0;
    return { uniformity, avgLength, sentenceCount: sentences.length };
  }

  function calculateLexicalDiversity(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    if (words.length < 50) return 1;
    const uniqueWords = new Set(words);
    return uniqueWords.size / Math.sqrt(words.length);
  }

  function analyzeStructure(text) {
    const bulletPoints = (text.match(/^[\s]*[-*•]\s/gm) || []).length;
    const numberedLists = (text.match(/^[\s]*\d+[.)]\s/gm) || []).length;
    const wordCount = getWordCount(text);
    const structureRatio = wordCount > 0 ? (bulletPoints + numberedLists) / wordCount * 100 : 0;
    return { bulletPoints, numberedLists, structureRatio };
  }

  function detectAIContent(text, sensitivity = 50) {
    if (!text || text.trim().length < 100) {
      return { score: 0, confidence: 'low', details: { reason: 'Text too short' } };
    }

    const wordCount = getWordCount(text);
    let phraseScore = 0;
    const matchedPhrases = [];

    for (const { pattern, weight } of AI_PHRASES) {
      const matches = text.match(pattern);
      if (matches) {
        phraseScore += matches.length * weight;
        matchedPhrases.push({ phrase: pattern.source, count: matches.length, weight });
      }
    }

    const normalizedPhraseScore = (phraseScore / wordCount) * 1000;
    const sentenceAnalysis = analyzeSentenceStructure(text);
    const lexicalDiversity = calculateLexicalDiversity(text);
    const structureAnalysis = analyzeStructure(text);

    const phraseComponent = Math.min(40, normalizedPhraseScore * 2);
    const uniformityComponent = sentenceAnalysis.uniformity * 20;
    const diversityComponent = Math.max(0, (8 - lexicalDiversity) * 4);
    const structureComponent = Math.min(20, structureAnalysis.structureRatio * 5);

    let rawScore = phraseComponent + uniformityComponent + diversityComponent + structureComponent;
    const sensitivityMultiplier = 0.5 + (sensitivity / 100);
    rawScore = rawScore * sensitivityMultiplier;

    const finalScore = Math.min(100, Math.max(0, rawScore));
    let confidence = wordCount < 200 ? 'low' : wordCount < 500 ? 'medium' : 'high';

    return {
      score: Math.round(finalScore),
      confidence,
      details: {
        wordCount,
        phraseScore: Math.round(normalizedPhraseScore * 10) / 10,
        matchedPhrases: matchedPhrases.slice(0, 10),
        sentenceUniformity: Math.round(sentenceAnalysis.uniformity * 100) / 100,
        lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
        structureRatio: Math.round(structureAnalysis.structureRatio * 100) / 100,
        components: {
          phrases: Math.round(phraseComponent),
          uniformity: Math.round(uniformityComponent),
          diversity: Math.round(diversityComponent),
          structure: Math.round(structureComponent)
        }
      }
    };
  }

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

  // ============================================
  // CONTENT SCRIPT MAIN
  // ============================================

  const CONTENT_SELECTORS = [
    'article',
    '[role="article"]',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content-body',
    '.story-body',
    'main p',
    '.post p',
    '.blog-post',
    '.article-body'
  ];

  const EXCLUDE_SELECTORS = [
    'nav',
    'header',
    'footer',
    'aside',
    '.sidebar',
    '.navigation',
    '.menu',
    '.comments',
    '.advertisement',
    '.ad',
    'script',
    'style',
    'noscript'
  ];

  const MIN_WORD_COUNT = 50;
  const SCORE_THRESHOLD = 35;

  let settings = null;
  let processedElements = new WeakSet();
  let activeTooltip = null;

  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        sensitivity: 50,
        showBadge: true,
        highlightStyle: 'hidden',
        trustedDomains: [],
        blockedDomains: [],
        customSelectors: [],
        excludeSelectors: [],
        userCorrections: {}
      });
      settings = result;
      return settings;
    } catch (e) {
      console.error('Deslopifai: Failed to load settings', e);
      settings = {
        enabled: true,
        sensitivity: 50,
        showBadge: true,
        highlightStyle: 'hidden',
        trustedDomains: [],
        blockedDomains: [],
        customSelectors: [],
        excludeSelectors: [],
        userCorrections: {}
      };
      return settings;
    }
  }

  function getDomain() {
    return window.location.hostname.replace(/^www\./, '');
  }

  function isDomainInList(domain, list) {
    return list.some(d => domain === d || domain.endsWith('.' + d));
  }

  function getTextContent(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll(EXCLUDE_SELECTORS.join(',')).forEach(el => el.remove());
    return clone.textContent || '';
  }

  function createBadge(score, confidence) {
    const badge = document.createElement('span');
    badge.className = 'deslopifai-badge-inline pulse';
    badge.textContent = `AI ${score}%`;
    badge.dataset.score = score;
    badge.dataset.confidence = confidence;
    return badge;
  }

  function createTooltip(element, result, contentHash) {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'deslopifai-tooltip';

    const scoreClass = result.score < 40 ? 'low' : result.score < 70 ? 'medium' : 'high';

    tooltip.innerHTML = `
      <div class="deslopifai-tooltip-header">
        <span class="deslopifai-tooltip-title">AI Detection</span>
        <span class="deslopifai-tooltip-score ${scoreClass}">${result.score}%</span>
      </div>
      <div class="deslopifai-score-bar">
        <div class="deslopifai-score-bar-fill ${scoreClass}" style="width: ${result.score}%"></div>
      </div>
      <div class="deslopifai-tooltip-details">
        <div class="deslopifai-tooltip-detail-row">
          <span>Confidence:</span>
          <span class="deslopifai-confidence deslopifai-confidence-${result.confidence}">${result.confidence}</span>
        </div>
        <div class="deslopifai-tooltip-detail-row">
          <span>Word count:</span>
          <span>${result.details.wordCount}</span>
        </div>
        <div class="deslopifai-tooltip-detail-row">
          <span>AI phrases:</span>
          <span>${result.details.components.phrases}/40</span>
        </div>
        <div class="deslopifai-tooltip-detail-row">
          <span>Uniformity:</span>
          <span>${result.details.components.uniformity}/20</span>
        </div>
      </div>
      <div class="deslopifai-tooltip-actions">
        <button class="deslopifai-tooltip-btn deslopifai-tooltip-btn-human" data-action="human">
          Mark as Human
        </button>
        <button class="deslopifai-tooltip-btn deslopifai-tooltip-btn-ai" data-action="ai">
          Mark as AI
        </button>
      </div>
    `;

    tooltip.querySelectorAll('.deslopifai-tooltip-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const isHuman = action === 'human';

        await chrome.storage.sync.get({ userCorrections: {} }, async (data) => {
          data.userCorrections[contentHash] = {
            isHuman,
            url: window.location.href,
            timestamp: Date.now()
          };
          await chrome.storage.sync.set({ userCorrections: data.userCorrections });
        });

        element.classList.remove('deslopifai-user-human', 'deslopifai-user-ai');
        element.classList.add(isHuman ? 'deslopifai-user-human' : 'deslopifai-user-ai');

        const badge = element.querySelector('.deslopifai-badge-inline');
        if (badge) {
          badge.textContent = isHuman ? 'Human' : 'AI';
        }

        tooltip.remove();
        activeTooltip = null;
      });
    });

    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    return tooltip;
  }

  function positionTooltip(tooltip, anchor) {
    const rect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left;

    if (top + tooltipRect.height > window.innerHeight) {
      top = rect.top - tooltipRect.height - 8;
    }

    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 16;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${Math.max(8, left)}px`;

    requestAnimationFrame(() => {
      tooltip.classList.add('visible');
    });
  }

  function flagElement(element, result) {
    if (!settings) return;

    const contentHash = hashContent(getTextContent(element));

    // Check for user corrections
    const correction = settings.userCorrections[contentHash];
    if (correction && correction.isHuman) {
      // User marked as human - show it normally
      element.classList.add('deslopifai-user-human');
      element.dataset.deslopifaiProcessed = 'true';
      element.dataset.deslopifaiScore = result.score;
      return;
    }

    // Apply display style based on settings
    if (settings.highlightStyle === 'hidden') {
      // Hide the AI content completely
      element.classList.add('deslopifai-hidden');

      // Create a placeholder that can be clicked to reveal
      const placeholder = document.createElement('div');
      placeholder.className = 'deslopifai-hidden-placeholder';
      placeholder.innerHTML = `
        <div class="deslopifai-hidden-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="deslopifai-hidden-text">
          <span class="deslopifai-hidden-title">AI Content Hidden</span>
          <span class="deslopifai-hidden-score">Score: ${result.score}%</span>
        </div>
        <button class="deslopifai-hidden-show">Show</button>
      `;

      placeholder.querySelector('.deslopifai-hidden-show').addEventListener('click', (e) => {
        e.stopPropagation();
        element.classList.remove('deslopifai-hidden');
        element.classList.add('deslopifai-revealed');
        placeholder.remove();

        // Add a small indicator that this was AI content
        const revealBadge = document.createElement('span');
        revealBadge.className = 'deslopifai-badge-inline revealed';
        revealBadge.textContent = `AI ${result.score}%`;
        revealBadge.addEventListener('click', (e) => {
          e.stopPropagation();
          const tooltip = createTooltip(element, result, contentHash);
          positionTooltip(tooltip, revealBadge);
        });
        element.insertBefore(revealBadge, element.firstChild);
      });

      element.parentNode.insertBefore(placeholder, element);
    } else if (settings.highlightStyle !== 'badge-only') {
      element.classList.add(`deslopifai-flagged-${settings.highlightStyle}`);
    }

    // Add badge if enabled and not hidden mode
    if (settings.showBadge && settings.highlightStyle !== 'hidden') {
      const badge = createBadge(result.score, result.confidence);

      if (correction) {
        badge.textContent = correction.isHuman ? 'Human' : 'AI';
      }

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const tooltip = createTooltip(element, result, contentHash);
        positionTooltip(tooltip, badge);
      });

      // Find a good place to insert the badge
      const firstChild = element.firstElementChild;
      if (firstChild && (firstChild.tagName === 'H1' || firstChild.tagName === 'H2' || firstChild.tagName === 'H3')) {
        firstChild.appendChild(badge);
      } else {
        element.insertBefore(badge, element.firstChild);
      }
    }

    // Store element reference for potential cleanup
    element.dataset.deslopifaiProcessed = 'true';
    element.dataset.deslopifaiScore = result.score;
  }

  function scanElement(element) {
    if (processedElements.has(element)) return;
    if (element.dataset.deslopifaiProcessed) return;

    const text = getTextContent(element);
    const wordCount = getWordCount(text);

    if (wordCount < MIN_WORD_COUNT) return;

    processedElements.add(element);

    const result = detectAIContent(text, settings.sensitivity);

    if (result.score >= SCORE_THRESHOLD) {
      flagElement(element, result);

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'contentFlagged',
        data: {
          score: result.score,
          confidence: result.confidence,
          url: window.location.href
        }
      }).catch(() => {});
    }
  }

  function scanPage() {
    if (!settings || !settings.enabled) return;

    const domain = getDomain();

    // Check domain lists
    if (isDomainInList(domain, settings.trustedDomains)) {
      return; // Skip trusted domains
    }

    const isBlocked = isDomainInList(domain, settings.blockedDomains);

    // Get all content selectors
    const selectors = [...CONTENT_SELECTORS, ...settings.customSelectors];
    const excludeSelectors = [...EXCLUDE_SELECTORS, ...settings.excludeSelectors];

    // Find content elements
    const elements = document.querySelectorAll(selectors.join(','));

    elements.forEach(element => {
      // Skip excluded elements
      if (excludeSelectors.some(sel => element.closest(sel))) return;

      if (isBlocked) {
        // Auto-flag blocked domain content
        const text = getTextContent(element);
        if (getWordCount(text) >= MIN_WORD_COUNT) {
          processedElements.add(element);
          flagElement(element, { score: 100, confidence: 'high', details: { reason: 'Blocked domain' } });
        }
      } else {
        scanElement(element);
      }
    });
  }

  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldRescan = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldRescan = true;
              break;
            }
          }
        }
        if (shouldRescan) break;
      }

      if (shouldRescan) {
        // Debounce rescans
        clearTimeout(window.deslopifaiRescanTimeout);
        window.deslopifaiRescanTimeout = setTimeout(scanPage, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Close tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (activeTooltip && !activeTooltip.contains(e.target) && !e.target.classList.contains('deslopifai-badge-inline')) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  });

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'rescan') {
      processedElements = new WeakSet();
      // Remove all placeholders
      document.querySelectorAll('.deslopifai-hidden-placeholder').forEach(p => p.remove());
      // Reset all processed elements
      document.querySelectorAll('[data-deslopifai-processed]').forEach(el => {
        el.removeAttribute('data-deslopifai-processed');
        el.removeAttribute('data-deslopifai-score');
        el.classList.remove(
          'deslopifai-flagged-subtle',
          'deslopifai-flagged-prominent',
          'deslopifai-user-human',
          'deslopifai-user-ai',
          'deslopifai-hidden',
          'deslopifai-revealed'
        );
        el.querySelectorAll('.deslopifai-badge-inline').forEach(b => b.remove());
      });
      loadSettings().then(scanPage);
      sendResponse({ success: true });
    } else if (message.type === 'getStats') {
      const flagged = document.querySelectorAll('[data-deslopifai-processed]').length;
      const hidden = document.querySelectorAll('.deslopifai-hidden').length;
      sendResponse({ flagged, hidden });
    } else if (message.type === 'settingsUpdated') {
      loadSettings().then(() => {
        sendResponse({ success: true });
      });
    }
    return true;
  });

  // Initialize
  async function init() {
    await loadSettings();

    if (!settings.enabled) {
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        scanPage();
        setupMutationObserver();
      });
    } else {
      scanPage();
      setupMutationObserver();
    }
  }

  init();
})();
