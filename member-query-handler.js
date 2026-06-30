/* =====================================================================
   MAHADEV AI — MEMBER-SPECIFIC QUERY HANDLER
   =====================================================================
   Purpose : Detect when a user is asking about ONE SPECIFIC member's
             contribution (e.g. "Pawan Jha ka contribution kitna hai?")
             and answer using ONLY that member's parsed data.

   Depends on : sheet-parsers.js (must be loaded BEFORE this file),
                which itself depends on sheets-integration.js.

   Hard rule  : This file NEVER calls fetch() or talks to Google Sheets
                directly. It only reads from SheetParsers.buildFullKnowledge().

   Scope      : Name extraction + fuzzy matching + clean reply building.
                No AI API. No UI redesign.
   ===================================================================== */

const MemberQueryHandler = (function () {
  'use strict';

  const FRIENDLY_UNAVAILABLE =
    'क्षमा करें, अभी सदस्य डेटा लोड नहीं हो पा रहा है। कृपया कुछ देर बाद पुनः प्रयास करें। 🙏';

  /* -------------------------------------------------------------
     CURRENCY FORMATTER (kept local so this file has no hidden
     dependency on financial-query-handler.js)
     ----------------------------------------------------------- */
  function formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  /* -------------------------------------------------------------
     STEP 1 — INTENT DETECTION
     -------------------------------------------------------------
     A message is treated as a "member query" if it contains one
     of these trigger phrases (English + Hindi/Hinglish variants).
     This intentionally does NOT try to detect a name yet — that
     happens in Step 2 by elimination (remove the trigger phrase,
     whatever text remains is treated as the candidate name).
     ----------------------------------------------------------- */
  const TRIGGER_PHRASES = [
    'contribution', 'contributed', 'donation', 'donated', 'yogdan', 'योगदान',
    'chanda', 'चंदा', 'kitna diya', 'kitna diya hai', 'kitna contribute',
    'total donation', 'ka total', 'ki total', 'record dikhao', 'रिकॉर्ड दिखाइए'
  ];

  function looksLikeMemberQuery(text) {
    const query = (text || '').toLowerCase();
    return TRIGGER_PHRASES.some(phrase => query.includes(phrase));
  }

  /* -------------------------------------------------------------
     STEP 2 — NAME EXTRACTION
     -------------------------------------------------------------
     Strips common question words/phrases out of the message so
     that what's left is (most likely) the member's name.

     This is a simple, dependency-free heuristic — not true NLP —
     but works well for short, direct chat questions.
     ----------------------------------------------------------- */
  const STOPWORDS = [
    'how much has', 'how much did', 'how much', 'show', "'s contribution",
    'contribution', 'contributed nothing in', 'contributed', 'donation', 'donated',
    'total donation', 'total', 'ka contribution', 'ki contribution', 'ka total',
    'ki total', 'kitna diya hai', 'kitna diya', 'kitna contribute kiya', 'kitna',
    'diya hai', 'diya', 'ka', 'ki', 'kiya', 'hai', 'kitna hai', 'ne kitna',
    'ने कितना', 'योगदान कितना है', 'का योगदान दिया', 'का योगदान', 'की योगदान',
    'योगदान', 'कितना था', 'कितना है', 'कितना', 'था', 'है', 'का', 'की', 'चंदा',
    'kiya hai', 'in', 'for', 'complete contribution', 'poora record', 'पूरा योगदान',
    'पूरा रिकॉर्ड', 'full history', 'contribution history', 'history dikhao',
    'history dikhaiye', 'sara record', 'सारा रिकॉर्ड', 'record dikhao', 'रिकॉर्ड दिखाइए',
    'दिखाइए', 'दिखाओ'
  ];

  function extractCandidateName(text) {
    let cleaned = (text || '').trim();

    // Remove trailing question mark / punctuation
    cleaned = cleaned.replace(/[?？]+$/g, '').trim();

    // Remove any detected month word first (so "Pawan Jha January" → "Pawan Jha")
    const monthLabel = detectMonthInText(cleaned);
    if (monthLabel) {
      const allAliasesForMonth = MONTH_ALIASES[monthLabel.toLowerCase()] || [];
      allAliasesForMonth.forEach(alias => {
        const pattern = new RegExp(escapeRegex(alias), 'gi');
        cleaned = cleaned.replace(pattern, ' ');
      });
    }

    // Remove stopwords (longest phrases first so partial matches
    // don't break longer ones, e.g. remove "ka total" before "ka")
    const sortedStopwords = [...STOPWORDS].sort((a, b) => b.length - a.length);

    sortedStopwords.forEach(word => {
      const pattern = new RegExp(escapeRegex(word), 'gi');
      cleaned = cleaned.replace(pattern, ' ');
    });

    // Collapse extra spaces left behind
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* -------------------------------------------------------------
     STEP 3 — NORMALIZATION + FUZZY MATCHING
     -------------------------------------------------------------
     normalizeName(): lowercase, trim, collapse multiple spaces —
     makes matching tolerant of casing and stray spaces.

     levenshteinDistance(): classic edit-distance algorithm, used
     to tolerate small typos (e.g. "Pawn Jha" vs "Pawan Jha").
     ----------------------------------------------------------- */
  function normalizeName(name) {
    return (name || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * findMatchingMembers()
   * Returns an array of members whose name either:
   *   - contains the candidate text (substring match), OR
   *   - is within a small typo-tolerance distance (fuzzy match)
   * Sorted by best match first.
   */
  function findMatchingMembers(candidateName, members) {
    const target = normalizeName(candidateName);
    if (!target) return [];

    const scored = members.map(member => {
      const memberNameNorm = normalizeName(member.memberName);

      let score = 0;

      if (memberNameNorm === target) {
        score = 1000; // exact match — best possible
      } else if (memberNameNorm.includes(target) || target.includes(memberNameNorm)) {
        score = 500; // substring match
      } else {
        // fuzzy match: allow small typos relative to name length
        const distance = levenshteinDistance(memberNameNorm, target);
        const maxAllowed = Math.max(2, Math.floor(memberNameNorm.length * 0.3));
        if (distance <= maxAllowed) {
          score = 300 - distance; // closer typo = higher score
        }
      }

      return { member, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.member);
  }

  /* -------------------------------------------------------------
     MONTH NAME DICTIONARY
     -------------------------------------------------------------
     Maps every way a month might appear in a user's message
     (English, Hindi, short forms) to the EXACT month label used
     in the parsed sheet data (see sheet-parsers.js monthLabels):
       'Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026',
       'Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026',
       'Dec 2026','Jan 2027'
     ----------------------------------------------------------- */
  const MONTH_ALIASES = {
    'feb 2026':  ['feb', 'february', 'फरवरी'],
    'mar 2026':  ['mar', 'march', 'मार्च'],
    'apr 2026':  ['apr', 'april', 'अप्रैल', 'अप्रेल'],
    'may 2026':  ['may', 'मई'],
    'jun 2026':  ['jun', 'june', 'जून'],
    'jul 2026':  ['jul', 'july', 'जुलाई'],
    'aug 2026':  ['aug', 'august', 'अगस्त'],
    'sep 2026':  ['sep', 'sept', 'september', 'सितंबर', 'सितम्बर'],
    'oct 2026':  ['oct', 'october', 'अक्टूबर', 'अक्तूबर'],
    'nov 2026':  ['nov', 'november', 'नवंबर', 'नवम्बर'],
    'dec 2026':  ['dec', 'december', 'दिसंबर', 'दिसम्बर'],
    'jan 2027':  ['jan', 'january', 'जनवरी']
  };

  /** Finds the exact sheet month-label (e.g. "Feb 2026") referenced in the text, or null. */
  function detectMonthInText(text) {
    const query = (text || '').toLowerCase();

    // Sort aliases by length so longer/specific words match before short ones
    // (e.g. "september" before "sep").
    for (const [sheetLabel, aliases] of Object.entries(MONTH_ALIASES)) {
      const sorted = [...aliases].sort((a, b) => b.length - a.length);
      for (const alias of sorted) {
        if (query.includes(alias.toLowerCase())) {
          // Re-find the properly-cased label as stored in monthlyContributions keys
          return sheetLabel
            .split(' ')
            .map((part, i) => i === 0 ? part[0].toUpperCase() + part.slice(1) : part)
            .join(' ');
        }
      }
    }
    return null;
  }

  /* -------------------------------------------------------------
     QUERY TYPE DETECTION
     -------------------------------------------------------------
     Decides WHICH kind of answer the user wants:
       'month'   → contribution for one specific month
       'total'   → only the grand total amount
       'history' → full month-wise breakdown + total (default)
     ----------------------------------------------------------- */
  const TOTAL_ONLY_PHRASES = [
    'total contribution', 'total donation', 'kul kitna', 'कुल कितना',
    'ne kul kitna', 'total kitna', 'kitna total'
  ];

  const HISTORY_PHRASES = [
    'complete contribution', 'poora record', 'पूरा योगदान', 'पूरा रिकॉर्ड',
    'full history', 'contribution history', 'history dikhao', 'history dikhaiye',
    'sara record', 'सारा रिकॉर्ड'
  ];

  function detectQueryType(text, hasMonth) {
    const query = (text || '').toLowerCase();

    if (hasMonth) return 'month'; // a specific month was mentioned — that wins

    if (HISTORY_PHRASES.some(p => query.includes(p))) return 'history';
    if (TOTAL_ONLY_PHRASES.some(p => query.includes(p))) return 'total';

    return 'history'; // sensible default: show full breakdown + total
  }

  /** Single confident match → full month-wise breakdown. */
  function buildSingleMemberReply(member) {
    const monthRows = Object.entries(member.monthlyContributions)
      .map(([month, amount]) => `
        <tr>
          <td style="padding:5px 8px;border-bottom:1px solid #f5f5f5;">${month}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #f5f5f5;text-align:right;">
            ${amount > 0 ? formatINR(amount) : '—'}
          </td>
        </tr>`).join('');

    return `👤 <strong>${member.memberName}</strong> का योगदान<br><br>
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;font-size:12px;width:100%;">
          <thead>
            <tr>
              <th style="padding:5px 8px;text-align:left;border-bottom:1px solid #eee;">महीना</th>
              <th style="padding:5px 8px;text-align:right;border-bottom:1px solid #eee;">राशि</th>
            </tr>
          </thead>
          <tbody>${monthRows}</tbody>
        </table>
      </div><br>
      <strong>कुल योगदान: ${formatINR(member.totalContribution)}</strong>`;
  }

  /** Only the grand total (used for 'total' query type). */
  function buildTotalOnlyReply(member) {
    return `👤 <strong>${member.memberName}</strong><br><br>
      कुल योगदान: <strong>${formatINR(member.totalContribution)}</strong>`;
  }

  /** One specific month's contribution (used for 'month' query type). */
  function buildMonthSpecificReply(member, monthLabel) {
    const amount = member.monthlyContributions[monthLabel];

    // Month requested but not present in this member's record at all
    if (amount === undefined) {
      return `🙏 <strong>${member.memberName}</strong> के लिए <strong>${monthLabel}</strong> का कोई रिकॉर्ड उपलब्ध नहीं है।`;
    }

    // Month exists but contribution was zero / not given
    if (amount === 0) {
      return `👤 <strong>${member.memberName}</strong><br><br>
        <strong>${monthLabel}</strong> में कोई योगदान दर्ज नहीं है।<br>
        <em>No contribution is recorded for ${monthLabel}.</em>`;
    }

    return `👤 <strong>${member.memberName}</strong><br><br>
      <strong>${monthLabel}</strong> में योगदान: <strong>${formatINR(amount)}</strong>`;
  }

  /** Multiple ambiguous matches → ask user to choose. */
  function buildDisambiguationReply(matches) {
    const list = matches
      .slice(0, 5) // safety cap
      .map(m => `• ${m.memberName}`)
      .join('<br>');

    return `🤔 क्या आपका मतलब इनमें से किसी से है?<br><br>${list}<br><br>
      कृपया पूरा नाम लिखकर दोबारा पूछें।`;
  }

  /** No match at all. */
  function buildNoMatchReply(candidateName) {
    return `🙏 क्षमा करें, "<strong>${escapeHtml(candidateName)}</strong>" नाम का कोई सदस्य रिकॉर्ड नहीं मिला।<br><br>
      कृपया नाम की वर्तनी जाँचें या सटीक नाम के साथ पुनः पूछें।`;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* -------------------------------------------------------------
     PUBLIC: handleMemberQuery(userText)
     -------------------------------------------------------------
     Returns:
       null           → message is not a member-specific query at all
                         (caller should fall back to other handlers)
       string (HTML)  → ready-to-display reply (match, disambiguation,
                         no-match, or friendly error)
     ----------------------------------------------------------- */
  async function handleMemberQuery(userText) {
    if (!looksLikeMemberQuery(userText)) return null;

    const candidateName = extractCandidateName(userText);
    if (!candidateName) return null; // trigger word found but no name left — not confident enough

    if (typeof SheetParsers === 'undefined') {
      console.error('[MemberQueryHandler] SheetParsers module not found. Load sheet-parsers.js first.');
      return FRIENDLY_UNAVAILABLE;
    }

    try {
      const knowledge = await SheetParsers.buildFullKnowledge();
      if (!knowledge || !knowledge._status.membersOk) {
        return FRIENDLY_UNAVAILABLE;
      }

      const matches = findMatchingMembers(candidateName, knowledge.members);

      let resolvedMember = null;

      if (matches.length === 0) {
        return buildNoMatchReply(candidateName);
      }

      if (matches.length === 1) {
        resolvedMember = matches[0];
      } else {
        // More than one plausible match — but if the TOP match is an
        // exact name match, prefer it directly instead of asking.
        const target = normalizeName(candidateName);
        const exact = matches.find(m => normalizeName(m.memberName) === target);
        if (exact) {
          resolvedMember = exact;
        } else {
          return buildDisambiguationReply(matches);
        }
      }

      // We now have exactly one confirmed member — decide WHICH kind
      // of answer they want (month-specific / total-only / full history).
      const monthLabel = detectMonthInText(userText);
      const queryType   = detectQueryType(userText, !!monthLabel);

      if (queryType === 'month' && monthLabel) {
        return buildMonthSpecificReply(resolvedMember, monthLabel);
      }
      if (queryType === 'total') {
        return buildTotalOnlyReply(resolvedMember);
      }
      return buildSingleMemberReply(resolvedMember); // 'history' (default)

    } catch (err) {
      console.error('[MemberQueryHandler] Unexpected error:', err);
      return FRIENDLY_UNAVAILABLE;
    }
  }

  /* -------------------------------------------------------------
     PUBLIC API
     ----------------------------------------------------------- */
  return {
    handleMemberQuery,
    // exposed for testing/debugging only
    extractCandidateName,
    findMatchingMembers
  };

})();