/* =====================================================================
   MAHADEV AI — GEMINI SERVICE (Project Kailash — Task K-012)
   =====================================================================
   ISOLATED module. NLU only — no financial logic, no calculations,
   no knowledge answers. Returns validated structured JSON or null.
   ===================================================================== */

const GeminiService = (function () {
  'use strict';

  const VALID_INTENTS = [
    'CURRENT_BALANCE', 'TOTAL_INCOME', 'TOTAL_EXPENSE', 'MARKET_INCOME',
    'SHUBH_KARY_INCOME', 'MEMBER_TOTAL', 'MEMBER_MONTH', 'MEMBER_HISTORY',
    'ALL_MEMBERS', 'SHOW_MARKET_RECORD', 'SHOW_EXPENSE_RECORD',
    'SHOW_SHUBH_KARY', 'TEMPLE_HISTORY', 'TEMPLE_LOCATION', 'TEMPLE_TIMING',
    'DONATION_INFO', 'LIBRARY', 'UNKNOWN'
  ];

  const SYSTEM_PROMPT = `You are an intent classifier for a temple website chatbot.
Read the user's message (Hindi, English, or Maithili) and return ONLY raw JSON, nothing else — no explanation, no markdown fences.

Classify into exactly one of these intents:
CURRENT_BALANCE, TOTAL_INCOME, TOTAL_EXPENSE, MARKET_INCOME, SHUBH_KARY_INCOME,
MEMBER_TOTAL, MEMBER_MONTH, MEMBER_HISTORY, ALL_MEMBERS, SHOW_MARKET_RECORD,
SHOW_EXPENSE_RECORD, SHOW_SHUBH_KARY, TEMPLE_HISTORY, TEMPLE_LOCATION,
TEMPLE_TIMING, DONATION_INFO, LIBRARY, UNKNOWN

Rules:
- Do NOT calculate or state any amount.
- Do NOT answer the question yourself.
- Only understand and classify.
- If a person's name is mentioned, include it in "member".
- If a month is mentioned, include it in "month".
- If nothing fits, use "UNKNOWN".

Output JSON shape:
{ "intent": "...", "member": "..." (optional), "month": "..." (optional) }

User message: `;

  function isValidIntent(intent) {
    return typeof intent === 'string' && VALID_INTENTS.includes(intent);
  }

  function extractJSON(text) {
    if (!text) return null;
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      return null;
    }
  }

  async function classify(userText) {
    if (!GEMINI_CONFIG.API_KEY) {
      return null; // no key configured — caller falls back automatically
    }
    if (!userText || !userText.trim()) return null;

    const url = `${GEMINI_CONFIG.ENDPOINT}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

    const body = {
      contents: [{ parts: [{ text: SYSTEM_PROMPT + userText }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const rawText = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

      const parsed = extractJSON(rawText);
      if (!parsed || !isValidIntent(parsed.intent)) return null;

      return {
        intent: parsed.intent,
        member: typeof parsed.member === 'string' ? parsed.member : null,
        month:  typeof parsed.month  === 'string' ? parsed.month  : null
      };

    } catch (err) {
      console.error('[GeminiService] Request failed:', err);
      return null;
    }
  }

  return {
    classify,
    isValidIntent,
    VALID_INTENTS
  };

})();