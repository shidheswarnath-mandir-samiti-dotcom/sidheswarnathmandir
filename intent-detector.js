/* =====================================================================
   MAHADEV AI — INTENT DETECTOR (Project Kailash — Task K-010)
   =====================================================================
   Classifies user text into exactly one of 18 intents. Classification
   only — no financial calculations, no sheet access, no duplication of
   existing handler logic. Dictionary-based keyword scoring.
   ===================================================================== */

const IntentDetector = (function () {
  'use strict';

  const INTENTS = {
    CURRENT_BALANCE:    'CURRENT_BALANCE',
    TOTAL_INCOME:       'TOTAL_INCOME',
    TOTAL_EXPENSE:      'TOTAL_EXPENSE',
    MARKET_INCOME:      'MARKET_INCOME',
    SHUBH_KARY_INCOME:  'SHUBH_KARY_INCOME',
    MEMBER_TOTAL:       'MEMBER_TOTAL',
    MEMBER_MONTH:       'MEMBER_MONTH',
    MEMBER_HISTORY:     'MEMBER_HISTORY',
    ALL_MEMBERS:        'ALL_MEMBERS',
    SHOW_MARKET_RECORD: 'SHOW_MARKET_RECORD',
    SHOW_EXPENSE_RECORD:'SHOW_EXPENSE_RECORD',
    SHOW_SHUBH_KARY:    'SHOW_SHUBH_KARY',
    TEMPLE_HISTORY:     'TEMPLE_HISTORY',
    TEMPLE_LOCATION:    'TEMPLE_LOCATION',
    TEMPLE_TIMING:      'TEMPLE_TIMING',
    DONATION_INFO:      'DONATION_INFO',
    LIBRARY:            'LIBRARY',
    UNKNOWN:            'UNKNOWN'
  };

  const MEMBER_GROUP_TRIGGERS = [
    'contribution', 'contributed', 'donation', 'donated', 'yogdan', 'योगदान',
    'chanda', 'चंदा', 'kitna diya', 'kitna diya hai', 'kitna contribute',
    'total donation', 'ka total', 'ki total', 'record dikhao', 'रिकॉर्ड दिखाइए'
  ];

  const MONTH_WORDS = [
    'jan', 'january', 'जनवरी', 'feb', 'february', 'फरवरी',
    'mar', 'march', 'मार्च', 'apr', 'april', 'अप्रैल',
    'may', 'मई', 'jun', 'june', 'जून', 'jul', 'july', 'जुलाई',
    'aug', 'august', 'अगस्त', 'sep', 'september', 'सितंबर',
    'oct', 'october', 'अक्टूबर', 'nov', 'november', 'नवंबर',
    'dec', 'december', 'दिसंबर'
  ];

  const MEMBER_HISTORY_KEYWORDS = [
    'complete contribution', 'poora record', 'पूरा योगदान', 'पूरा रिकॉर्ड',
    'full history', 'contribution history', 'history dikhao', 'history dikhaiye',
    'sara record', 'सारा रिकॉर्ड'
  ];

  const MEMBER_TOTAL_KEYWORDS = [
    'total contribution', 'total donation', 'kul kitna', 'कुल कितना',
    'ne kul kitna', 'total kitna', 'kitna total'
  ];

  const FINANCIAL_KEYWORDS = {
    CURRENT_BALANCE:     ['balance', 'shesh rashi', 'शेष राशि', 'baki paisa', 'current balance', 'today balance', 'aaj ka balance'],
    TOTAL_INCOME:        ['total income', 'kul aay', 'कुल आय', 'total aay', 'kitni aay'],
    TOTAL_EXPENSE:       ['total expense', 'kul vyay', 'कुल व्यय', 'total kharch', 'kitna kharch'],
    MARKET_INCOME:       ['market income', 'bazar income', 'बाजार आय', 'market collection'],
    SHUBH_KARY_INCOME:   ['shubh kary income', 'shubh karya income', 'शुभ कार्य आय', 'shubh kary'],
    ALL_MEMBERS:         ['all member', 'sabhi sadasya', 'member contribution', 'सभी सदस्य', 'member list', 'sadasya yogdan', 'kitne member', 'how many member', 'total members', 'sadasya sankhya', 'सदस्य संख्या'],
    SHOW_MARKET_RECORD:  ['show market', 'market income list', 'बाजार आय दिखाओ', 'market details'],
    SHOW_EXPENSE_RECORD: ['show expense', 'expense list', 'व्यय दिखाओ', 'kharch ki list', 'expense details'],
    SHOW_SHUBH_KARY:     ['shubh kary list', 'shubh karya list', 'शुभ कार्य सूची', 'shubh kary details', 'shubh kary record']
  };

  const KNOWLEDGE_KEYWORDS = {
    TEMPLE_HISTORY:  ['itihas', 'history', 'sthapna', 'kab bana', 'kisne banaya', 'founder', 'sthapit', 'puratan', 'prachin', 'kahani', 'story', 'when built', 'who built'],
    TEMPLE_LOCATION: ['address', 'pata', 'location', 'kaha hai', 'kaise pahuche', 'kaise jaye', 'direction', 'gaon', 'village', 'darbhanga', 'where is', 'how to reach'],
    TEMPLE_TIMING:   ['aarti', 'puja time', 'samay', 'timing', 'kab khulta', 'kab band', 'darshan time', 'pooja ka samay', 'shayan', 'opening time', 'closing time'],
    DONATION_INFO:   ['donation', 'daan', 'chanda', 'paisa kaise de', 'upi', 'qr', 'bank', 'donate', 'contribution kaise kare', 'how to donate'],
    LIBRARY:         ['library', 'pustakalay', 'chalisa', 'aarti path', 'mantra', 'stotra', 'bhajan', 'shiv chalisa', 'hanuman chalisa']
  };

  function scoreKeywords(query, keywordList) {
    let score = 0;
    keywordList.forEach(k => {
      if (query.includes(k.toLowerCase())) score += k.length;
    });
    return score;
  }

  function bestFromMap(query, keywordMap) {
    let bestIntent = null;
    let bestScore = 0;
    for (const intent in keywordMap) {
      const score = scoreKeywords(query, keywordMap[intent]);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    return bestScore > 0 ? bestIntent : null;
  }

  function detect(rawText) {
    const query = (rawText || '').toString().toLowerCase().trim();
    if (!query) return INTENTS.UNKNOWN;

    // 1. MEMBER GROUP (highest priority — matches original handler order)
    const isMemberQuery = MEMBER_GROUP_TRIGGERS.some(t => query.includes(t));
    if (isMemberQuery) {
      const hasHistoryPhrase = MEMBER_HISTORY_KEYWORDS.some(k => query.includes(k));
      if (hasHistoryPhrase) return INTENTS.MEMBER_HISTORY;

      const hasMonthWord = MONTH_WORDS.some(m => query.includes(m));
      if (hasMonthWord) return INTENTS.MEMBER_MONTH;

      const hasTotalPhrase = MEMBER_TOTAL_KEYWORDS.some(k => query.includes(k));
      if (hasTotalPhrase) return INTENTS.MEMBER_TOTAL;

      return INTENTS.MEMBER_HISTORY; // default within member group
    }

    // 2. FINANCIAL GROUP
    const financialMatch = bestFromMap(query, FINANCIAL_KEYWORDS);
    if (financialMatch) return INTENTS[financialMatch];

    // 3. KNOWLEDGE GROUP
    const knowledgeMatch = bestFromMap(query, KNOWLEDGE_KEYWORDS);
    if (knowledgeMatch) return INTENTS[knowledgeMatch];

    // 4. Nothing matched
    return INTENTS.UNKNOWN;
  }

  return {
    detect,
    INTENTS
  };

})();