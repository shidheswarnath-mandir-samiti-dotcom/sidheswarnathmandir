/* =====================================================================
   MAHADEV AI — MEMBER-SPECIFIC QUERY HANDLER
   =====================================================================
   Task K-012.5 Bug Fix applied — see handleMemberQuery() + new
   hasStrongNameSignal() helper. Everything else is UNCHANGED.
   ===================================================================== */

const MemberQueryHandler = (function () {
  'use strict';

  const FRIENDLY_UNAVAILABLE =
    'क्षमा करें, अभी सदस्य डेटा लोड नहीं हो पा रहा है। कृपया कुछ देर बाद पुनः प्रयास करें। 🙏';

  function formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  const TRIGGER_PHRASES = [
    'contribution', 'contributed', 'donation', 'donated', 'yogdan', 'योगदान',
    'chanda', 'चंदा', 'kitna diya', 'kitna diya hai', 'kitna contribute',
    'total donation', 'ka total', 'ki total', 'record dikhao', 'रिकॉर्ड दिखाइए'
  ];

  function looksLikeMemberQuery(text) {
    const query = (text || '').toLowerCase();
    return TRIGGER_PHRASES.some(phrase => query.includes(phrase));
  }

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

    cleaned = cleaned.replace(/[?？]+$/g, '').trim();

    const monthLabel = detectMonthInText(cleaned);
    if (monthLabel) {
      const allAliasesForMonth = MONTH_ALIASES[monthLabel.toLowerCase()] || [];
      allAliasesForMonth.forEach(alias => {
        const pattern = new RegExp(escapeRegex(alias), 'gi');
        cleaned = cleaned.replace(pattern, ' ');
      });
    }

    const sortedStopwords = [...STOPWORDS].sort((a, b) => b.length - a.length);

    sortedStopwords.forEach(word => {
      const pattern = new RegExp(escapeRegex(word), 'gi');
      cleaned = cleaned.replace(pattern, ' ');
    });

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function findMatchingMembers(candidateName, members) {
    const target = normalizeName(candidateName);
    if (!target) return [];

    const scored = members.map(member => {
      const memberNameNorm = normalizeName(member.memberName);

      let score = 0;

      if (memberNameNorm === target) {
        score = 1000;
      } else if (memberNameNorm.includes(target) || target.includes(memberNameNorm)) {
        score = 500;
      } else {
        const distance = levenshteinDistance(memberNameNorm, target);
        const maxAllowed = Math.max(2, Math.floor(memberNameNorm.length * 0.3));
        if (distance <= maxAllowed) {
          score = 300 - distance;
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
     NEW (K-012.5 FIX) — confident name-match check.
     -------------------------------------------------------------
     Used ONLY when looksLikeMemberQuery() found no trigger phrase
     (e.g. Devanagari "कितना दिए" which the phrase list doesn't cover).
     Requires an EXACT or SUBSTRING match (not weak fuzzy-typo match)
     against a real member name, so unrelated queries (address,
     library, etc.) can't get accidentally hijacked by this handler.
     Does not touch findMatchingMembers() or its scoring at all.
     ----------------------------------------------------------- */
  function hasStrongNameSignal(candidateName, matches) {
    const target = normalizeName(candidateName);
    if (!target) return false;
    return matches.some(m => {
      const n = normalizeName(m.memberName);
      return n === target || n.includes(target) || target.includes(n);
    });
  }

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

  function detectMonthInText(text) {
    const query = (text || '').toLowerCase();

    for (const [sheetLabel, aliases] of Object.entries(MONTH_ALIASES)) {
      const sorted = [...aliases].sort((a, b) => b.length - a.length);
      for (const alias of sorted) {
        if (query.includes(alias.toLowerCase())) {
          return sheetLabel
            .split(' ')
            .map((part, i) => i === 0 ? part[0].toUpperCase() + part.slice(1) : part)
            .join(' ');
        }
      }
    }
    return null;
  }

  const TOTAL_ONLY_PHRASES = [
    'total contribution', 'total donation', 'kul kitna', 'कुल कितना',
    'ne kul kitna', 'total kitna', 'kitna total'
  ];

  const HISTORY_PHRASES = [
    'complete contribution', 'poora record', 'पूरा योगदान', 'पूरा रिकॉर्ड',
    'full history', 'contribution history', 'history dikhao', 'history dikhaiye',
    'sara record', 'सारा रिकॉर्ड'
  ];

  const INTENT_TO_QUERY_TYPE = {
    'MEMBER_MONTH':   'month',
    'MEMBER_TOTAL':   'total',
    'MEMBER_HISTORY': 'history'
  };

  function detectQueryType(text, hasMonth, resolvedIntent) {
    // K-012.6: prefer the already-resolved intent when available
    if (resolvedIntent && INTENT_TO_QUERY_TYPE[resolvedIntent]) {
      return INTENT_TO_QUERY_TYPE[resolvedIntent];
    }

    const query = (text || '').toLowerCase();

    if (hasMonth) return 'month';

    if (HISTORY_PHRASES.some(p => query.includes(p))) return 'history';
    if (TOTAL_ONLY_PHRASES.some(p => query.includes(p))) return 'total';

    return 'history';
  }

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

  function buildTotalOnlyReply(member) {
    return `👤 <strong>${member.memberName}</strong><br><br>
      कुल योगदान: <strong>${formatINR(member.totalContribution)}</strong>`;
  }

  function buildMonthSpecificReply(member, monthLabel) {
    const amount = member.monthlyContributions[monthLabel];

    if (amount === undefined) {
      return `🙏 <strong>${member.memberName}</strong> के लिए <strong>${monthLabel}</strong> का कोई रिकॉर्ड उपलब्ध नहीं है।`;
    }

    if (amount === 0) {
      return `👤 <strong>${member.memberName}</strong><br><br>
        <strong>${monthLabel}</strong> में कोई योगदान दर्ज नहीं है।<br>
        <em>No contribution is recorded for ${monthLabel}.</em>`;
    }

    return `👤 <strong>${member.memberName}</strong><br><br>
      <strong>${monthLabel}</strong> में योगदान: <strong>${formatINR(amount)}</strong>`;
  }

  function buildDisambiguationReply(matches) {
    const list = matches
      .slice(0, 5)
      .map(m => `• ${m.memberName}`)
      .join('<br>');

    return `🤔 क्या आपका मतलब इनमें से किसी से है?<br><br>${list}<br><br>
      कृपया पूरा नाम लिखकर दोबारा पूछें।`;
  }

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
     handleMemberQuery() — MODIFIED (K-012.5 FIX)
     -------------------------------------------------------------
     looksLikeMemberQuery() is still called and still works exactly
     as before (requirement 1). The difference: if it returns false,
     we no longer immediately return null. Instead we still try to
     extract a candidate name and check for a CONFIDENT (exact/
     substring) match against real member data. Only if that also
     fails do we stay silent (return null), so unrelated queries are
     not hijacked. This lets queries like "पवन झा जनवरी में कितना दिए?"
     (which QueryEngine/IntentDetector may already classify as
     MEMBER_MONTH, but which looksLikeMemberQuery() doesn't recognise
     due to missing Devanagari trigger phrases) still get answered.
     ----------------------------------------------------------- */
  async function handleMemberQuery(userText, resolvedIntent) {
    const triggeredByKeyword = looksLikeMemberQuery(userText);

    const candidateName = extractCandidateName(userText);
    if (!candidateName) return null;

    if (typeof SheetParsers === 'undefined') {
      console.error('[MemberQueryHandler] SheetParsers module not found. Load sheet-parsers.js first.');
      return triggeredByKeyword ? FRIENDLY_UNAVAILABLE : null;
    }

    try {
      const knowledge = await SheetParsers.buildFullKnowledge();
      if (!knowledge || !knowledge._status.membersOk) {
        return triggeredByKeyword ? FRIENDLY_UNAVAILABLE : null;
      }

      const matches = findMatchingMembers(candidateName, knowledge.members);

      // Gate: keyword trigger OR a confident (exact/substring) name match.
      if (!triggeredByKeyword && !hasStrongNameSignal(candidateName, matches)) {
        return null;
      }

      let resolvedMember = null;

      if (matches.length === 0) {
        return triggeredByKeyword ? buildNoMatchReply(candidateName) : null;
      }

      if (matches.length === 1) {
        resolvedMember = matches[0];
      } else {
        const target = normalizeName(candidateName);
        const exact = matches.find(m => normalizeName(m.memberName) === target);
        if (exact) {
          resolvedMember = exact;
        } else if (triggeredByKeyword) {
          return buildDisambiguationReply(matches);
        } else {
          resolvedMember = matches[0];
        }
      }

      const monthLabel = detectMonthInText(userText);
      const queryType   = detectQueryType(userText, !!monthLabel, resolvedIntent);

      if (queryType === 'month' && monthLabel) {
        return buildMonthSpecificReply(resolvedMember, monthLabel);
      }
      if (queryType === 'total') {
        return buildTotalOnlyReply(resolvedMember);
      }
      return buildSingleMemberReply(resolvedMember);

    } catch (err) {
      console.error('[MemberQueryHandler] Unexpected error:', err);
      return triggeredByKeyword ? FRIENDLY_UNAVAILABLE : null;
    }
  }

  return {
    handleMemberQuery,
    extractCandidateName,
    findMatchingMembers
  };

})();