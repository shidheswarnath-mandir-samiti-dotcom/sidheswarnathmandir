/* =====================================================================
   MAHADEV AI — QUERY ENGINE (CENTRAL ROUTER) — Project Kailash K-012
   =====================================================================
   User → Gemini (NLU, optional) → validated JSON → intent
          (falls back automatically to existing IntentDetector)
          → Existing Handlers → Response
   ===================================================================== */

const QueryEngine = (function () {
  'use strict';

  function normalize(rawText) {
    if (typeof LanguageNormalizer !== 'undefined' && LanguageNormalizer.normalize) {
      return LanguageNormalizer.normalize(rawText);
    }
    return (rawText || '').toString().toLowerCase().replace(/[।?!,.;:"'`]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function detectLanguage(rawText) {
    if (typeof LangDetector !== 'undefined' && LangDetector.detect) {
      try {
        return LangDetector.detect(rawText);
      } catch (err) {
        console.error('[QueryEngine] LangDetector failed:', err);
        return 'hindi';
      }
    }
    return 'hindi';
  }

  const MEMBER_INTENTS = ['MEMBER_TOTAL', 'MEMBER_MONTH', 'MEMBER_HISTORY'];
  const FINANCIAL_INTENTS = [
    'CURRENT_BALANCE', 'TOTAL_INCOME', 'TOTAL_EXPENSE', 'MARKET_INCOME',
    'SHUBH_KARY_INCOME', 'ALL_MEMBERS', 'SHOW_MARKET_RECORD',
    'SHOW_EXPENSE_RECORD', 'SHOW_SHUBH_KARY'
  ];
  const KNOWLEDGE_INTENTS = [
    'TEMPLE_HISTORY', 'TEMPLE_LOCATION', 'TEMPLE_TIMING', 'DONATION_INFO', 'LIBRARY'
  ];

  async function resolveIntent(rawText) {
    // 1. Try Gemini (NLU only) — isolated, optional, never authoritative on its own
    if (typeof GeminiService !== 'undefined' && GeminiService.classify) {
      try {
        const geminiResult = await GeminiService.classify(rawText);
        if (geminiResult && GeminiService.isValidIntent(geminiResult.intent) && geminiResult.intent !== 'UNKNOWN') {
          return { intent: geminiResult.intent, source: 'gemini' };
        }
      } catch (err) {
        console.error('[QueryEngine] GeminiService failed, falling back:', err);
      }
    }

    // 2. Fallback — existing local Intent Detector (unchanged, always available)
    if (typeof IntentDetector !== 'undefined' && IntentDetector.detect) {
      return { intent: IntentDetector.detect(rawText), source: 'intent-detector' };
    }

    return { intent: 'UNKNOWN', source: 'none' };
  }

  async function process(rawText) {
    const normalizedText = normalize(rawText);
    const detectedLang    = detectLanguage(rawText);
    const resolved         = await resolveIntent(rawText);
    const intent             = resolved.intent;

    let reply = null;
    let handledBy = null;

    if (MEMBER_INTENTS.includes(intent) && typeof MemberQueryHandler !== 'undefined') {
      try {
        reply = await MemberQueryHandler.handleMemberQuery(rawText, intent);
        if (reply) handledBy = 'MemberQueryHandler';
      } catch (err) {
        console.error('[QueryEngine] MemberQueryHandler failed:', err);
      }
    } else if (FINANCIAL_INTENTS.includes(intent) && typeof FinancialQueryHandler !== 'undefined') {
      try {
        reply = await FinancialQueryHandler.handleFinancialQuery(rawText);
        if (reply) handledBy = 'FinancialQueryHandler';
      } catch (err) {
        console.error('[QueryEngine] FinancialQueryHandler failed:', err);
      }
    } else if (KNOWLEDGE_INTENTS.includes(intent) && typeof searchKnowledgeBase === 'function') {
      reply = searchKnowledgeBase(rawText, detectedLang);
      if (reply) handledBy = 'KnowledgeBase';
    }

    // UNKNOWN or empty result → original cascade (member → financial → knowledge)
    if (!reply) {
      if (typeof MemberQueryHandler !== 'undefined') {
        try {
          reply = await MemberQueryHandler.handleMemberQuery(rawText);
          if (reply) handledBy = 'MemberQueryHandler';
        } catch (err) {
          console.error('[QueryEngine] MemberQueryHandler failed:', err);
        }
      }
      if (!reply && typeof FinancialQueryHandler !== 'undefined') {
        try {
          reply = await FinancialQueryHandler.handleFinancialQuery(rawText);
          if (reply) handledBy = 'FinancialQueryHandler';
        } catch (err) {
          console.error('[QueryEngine] FinancialQueryHandler failed:', err);
        }
      }
      if (!reply && typeof searchKnowledgeBase === 'function') {
        reply = searchKnowledgeBase(rawText, detectedLang);
        if (reply) handledBy = 'KnowledgeBase';
      }
    }

    return {
      reply: reply,
      meta: {
        normalizedText: normalizedText,
        intent: intent,
        nluSource: resolved.source,
        language: detectedLang,
        handledBy: handledBy
      }
    };
  }

  return {
    process,
    normalize,
    detectLanguage
  };

})();