/**
 * AI Content Detection Engine
 * Heuristic-based scoring for identifying AI-generated text
 */

// AI-telltale phrases with weights (higher = more indicative)
const AI_PHRASES = [
  // High confidence markers
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

  // Phrase patterns
  { pattern: /\bin conclusion\b/gi, weight: 1.5 },
  { pattern: /\bto summarize\b/gi, weight: 1 },
  { pattern: /\blet'?s (?:dive|explore|unpack)\b/gi, weight: 3 },
  { pattern: /\bwithout further ado\b/gi, weight: 2 },
  { pattern: /\bthe bottom line\b/gi, weight: 1.5 },
  { pattern: /\bfood for thought\b/gi, weight: 2 },
  { pattern: /\btip of the iceberg\b/gi, weight: 1.5 },
  { pattern: /\ba myriad of\b/gi, weight: 3 },
  { pattern: /\ba plethora of\b/gi, weight: 3 },
  { pattern: /\bcountless\b/gi, weight: 1 },
  { pattern: /\binnumerable\b/gi, weight: 2 },
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
  { pattern: /\bexceptional\b/gi, weight: 1 },
  { pattern: /\bremarkable\b/gi, weight: 1 },
  { pattern: /\bprofound(?:ly)?\b/gi, weight: 2 },
  { pattern: /\bsignificant(?:ly)?\b/gi, weight: 0.5 },
  { pattern: /\bsubstantial(?:ly)?\b/gi, weight: 1 },
  { pattern: /\benhance(?:d|ment)?\b/gi, weight: 1 },
  { pattern: /\belevat(?:e|ing)\b/gi, weight: 1.5 },
  { pattern: /\bamplifiy(?:ing)?\b/gi, weight: 1.5 },
  { pattern: /\breshap(?:e|ing)\b/gi, weight: 2 },
  { pattern: /\bredefin(?:e|ing)\b/gi, weight: 2 },
  { pattern: /\breimagin(?:e|ing)\b/gi, weight: 2.5 },
  { pattern: /\breinvent(?:ing)?\b/gi, weight: 2 },
  { pattern: /\brevamp(?:ing)?\b/gi, weight: 2 },
  { pattern: /\boverhaul(?:ing)?\b/gi, weight: 1.5 },
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
  { pattern: /\bdouble[ -]?edged sword\b/gi, weight: 2 },
  { pattern: /\bblessing in disguise\b/gi, weight: 2 },
  { pattern: /\bat the end of the day\b/gi, weight: 2 },
  { pattern: /\bwhen all is said and done\b/gi, weight: 2.5 },
  { pattern: /\ball things considered\b/gi, weight: 1.5 },
  { pattern: /\bthat being said\b/gi, weight: 1.5 },
  { pattern: /\bhaving said that\b/gi, weight: 1.5 },
  { pattern: /\bwith that in mind\b/gi, weight: 1.5 },
  { pattern: /\bon the other hand\b/gi, weight: 0.5 },
  { pattern: /\bin light of\b/gi, weight: 1 },
  { pattern: /\bin the realm of\b/gi, weight: 2.5 },
  { pattern: /\bin the context of\b/gi, weight: 1 },
  { pattern: /\bin terms of\b/gi, weight: 0.5 },
  { pattern: /\bwith respect to\b/gi, weight: 1 },
  { pattern: /\bwith regard to\b/gi, weight: 1 },
  { pattern: /\bpertaining to\b/gi, weight: 1.5 },
  { pattern: /\bas such\b/gi, weight: 1 },
  { pattern: /\bthus\b/gi, weight: 0.5 },
  { pattern: /\bhence\b/gi, weight: 1 },
  { pattern: /\bthereby\b/gi, weight: 1.5 },
  { pattern: /\btherefore\b/gi, weight: 0.5 },
  { pattern: /\baccordingly\b/gi, weight: 1 },

  // Hedging language often used by AI
  { pattern: /\bit'?s worth noting\b/gi, weight: 2.5 },
  { pattern: /\bit bears mentioning\b/gi, weight: 3 },
  { pattern: /\bone could argue\b/gi, weight: 2 },
  { pattern: /\bit can be said\b/gi, weight: 2 },
  { pattern: /\bwhile it'?s true\b/gi, weight: 2 },
  { pattern: /\bthat said\b/gi, weight: 1 },
  { pattern: /\bgenerally speaking\b/gi, weight: 1.5 },
  { pattern: /\bbroadly speaking\b/gi, weight: 1.5 },
  { pattern: /\bby and large\b/gi, weight: 1.5 },
  { pattern: /\bfor the most part\b/gi, weight: 1 },
  { pattern: /\bto a large extent\b/gi, weight: 1.5 },
  { pattern: /\bto some degree\b/gi, weight: 1 },
  { pattern: /\bin many ways\b/gi, weight: 1 },
  { pattern: /\bin various ways\b/gi, weight: 1 },
  { pattern: /\bin myriad ways\b/gi, weight: 3 },
  { pattern: /\bto a certain extent\b/gi, weight: 1 },
  { pattern: /\bmore often than not\b/gi, weight: 1.5 },
  { pattern: /\btends to\b/gi, weight: 0.5 },
  { pattern: /\bseems to\b/gi, weight: 0.5 },
  { pattern: /\bappears to\b/gi, weight: 0.5 }
];

/**
 * Calculate word count for a text
 */
function getWordCount(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate sentence lengths and check for uniformity
 */
function analyzeSentenceStructure(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return { uniformity: 0, avgLength: 0 };

  const lengths = sentences.map(s => getWordCount(s));
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Lower stdDev relative to average means more uniform sentences
  const uniformity = avgLength > 0 ? Math.max(0, 1 - (stdDev / avgLength)) : 0;

  return { uniformity, avgLength, sentenceCount: sentences.length };
}

/**
 * Calculate lexical diversity (type-token ratio)
 */
function calculateLexicalDiversity(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length < 50) return 1; // Not enough data

  const uniqueWords = new Set(words);
  // Use root TTR to normalize for text length
  return uniqueWords.size / Math.sqrt(words.length);
}

/**
 * Count structural signals
 */
function analyzeStructure(text) {
  const bulletPoints = (text.match(/^[\s]*[-*•]\s/gm) || []).length;
  const numberedLists = (text.match(/^[\s]*\d+[.)]\s/gm) || []).length;
  const headers = (text.match(/^#{1,6}\s|^[A-Z][^.!?]*:[\s]*$/gm) || []).length;
  const wordCount = getWordCount(text);

  // Excessive structure relative to content length
  const structureRatio = wordCount > 0 ? (bulletPoints + numberedLists) / wordCount * 100 : 0;

  return {
    bulletPoints,
    numberedLists,
    headers,
    structureRatio
  };
}

/**
 * Main detection function
 * Returns a score from 0-100 where higher = more likely AI
 */
function detectAIContent(text, sensitivity = 50) {
  if (!text || text.trim().length < 100) {
    return { score: 0, confidence: 'low', details: { reason: 'Text too short' } };
  }

  const wordCount = getWordCount(text);
  let phraseScore = 0;
  const matchedPhrases = [];

  // Check for AI-telltale phrases
  for (const { pattern, weight } of AI_PHRASES) {
    const matches = text.match(pattern);
    if (matches) {
      phraseScore += matches.length * weight;
      matchedPhrases.push({ phrase: pattern.source, count: matches.length, weight });
    }
  }

  // Normalize phrase score by word count (per 1000 words)
  const normalizedPhraseScore = (phraseScore / wordCount) * 1000;

  // Analyze sentence structure
  const sentenceAnalysis = analyzeSentenceStructure(text);

  // Calculate lexical diversity
  const lexicalDiversity = calculateLexicalDiversity(text);

  // Analyze structural patterns
  const structureAnalysis = analyzeStructure(text);

  // Combine signals into final score
  // Each component contributes to the final score

  // Phrase density: 0-40 points
  const phraseComponent = Math.min(40, normalizedPhraseScore * 2);

  // Sentence uniformity: 0-20 points (high uniformity = more likely AI)
  const uniformityComponent = sentenceAnalysis.uniformity * 20;

  // Low lexical diversity: 0-20 points
  // Lower diversity (below ~7 for root TTR) suggests AI
  const diversityComponent = Math.max(0, (8 - lexicalDiversity) * 4);

  // Excessive structure: 0-20 points
  const structureComponent = Math.min(20, structureAnalysis.structureRatio * 5);

  // Raw score before sensitivity adjustment
  let rawScore = phraseComponent + uniformityComponent + diversityComponent + structureComponent;

  // Apply sensitivity adjustment (50 = neutral, 100 = most sensitive, 0 = least)
  const sensitivityMultiplier = 0.5 + (sensitivity / 100);
  rawScore = rawScore * sensitivityMultiplier;

  // Clamp to 0-100
  const finalScore = Math.min(100, Math.max(0, rawScore));

  // Determine confidence level
  let confidence;
  if (wordCount < 200) confidence = 'low';
  else if (wordCount < 500) confidence = 'medium';
  else confidence = 'high';

  return {
    score: Math.round(finalScore),
    confidence,
    details: {
      wordCount,
      phraseScore: Math.round(normalizedPhraseScore * 10) / 10,
      matchedPhrases: matchedPhrases.slice(0, 10), // Top 10 matches
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

/**
 * Generate a simple hash for content (for storing user corrections)
 */
function hashContent(text) {
  let hash = 0;
  const sample = text.slice(0, 500); // Use first 500 chars
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.DeslopifaiDetector = {
    detect: detectAIContent,
    hashContent
  };
}
