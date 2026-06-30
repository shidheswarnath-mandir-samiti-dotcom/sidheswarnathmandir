/* =====================================================================
   MAHADEV AI — FINANCIAL QUERY HANDLER
   =====================================================================
   Purpose : Answer money-related chat questions using ONLY the already
             parsed Google Sheets data (SheetParsers.buildFullKnowledge()).

   Depends on : sheet-parsers.js (must be loaded BEFORE this file)
                which itself depends on sheets-integration.js

   Hard rule : This file NEVER calls fetch() or talks to Google Sheets
               directly. It only reads from the parser layer's output.

   Scope   : Detect financial intent in user text → build a clean,
             formatted HTML reply. No AI API. No UI redesign.
   ===================================================================== */

const FinancialQueryHandler = (function () {
  'use strict';

  const FRIENDLY_UNAVAILABLE =
    'क्षमा करें, अभी मंदिर का वित्तीय डेटा लोड नहीं हो पा रहा है। कृपया कुछ देर बाद पुनः प्रयास करें। 🙏';

  /* -------------------------------------------------------------
     CURRENCY FORMATTER
     ----------------------------------------------------------- */
  function formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  /* -------------------------------------------------------------
     INTENT DETECTION
     -------------------------------------------------------------
     Returns one of the known intent keys, or null if the message
     does not look like a financial question at all (so the caller
     can fall back to the regular knowledge base).
     ----------------------------------------------------------- */
  const INTENT_PATTERNS = [
    { intent: 'balance',        keywords: ['balance', 'shesh rashi', 'शेष राशि', 'baki paisa', 'current balance', 'today balance', 'aaj ka balance'] },
    { intent: 'totalIncome',    keywords: ['total income', 'kul aay', 'कुल आय', 'total aay', 'kitni aay'] },
    { intent: 'totalExpense',   keywords: ['total expense', 'kul vyay', 'कुल व्यय', 'total kharch', 'kitna kharch'] },
    { intent: 'marketIncome',   keywords: ['market income', 'bazar income', 'बाजार आय', 'market collection'] },
    { intent: 'shubhKaryIncome',keywords: ['shubh kary income', 'shubh karya income', 'शुभ कार्य आय', 'shubh kary'] },
    { intent: 'memberCount',    keywords: ['kitne member', 'how many member', 'total members', 'sadasya sankhya', 'सदस्य संख्या'] },
    { intent: 'allMembers',     keywords: ['all member', 'sabhi sadasya', 'member contribution', 'सभी सदस्य', 'member list', 'sadasya yogdan'] },
    { intent: 'marketList',     keywords: ['show market', 'market income list', 'बाजार आय दिखाओ', 'market details'] },
    { intent: 'expenseList',    keywords: ['show expense', 'expense list', 'व्यय दिखाओ', 'kharch ki list', 'expense details'] }
  ];

  function detectIntent(text) {
    const query = (text || '').toLowerCase().trim();
    if (!query) return null;

    let bestIntent = null;
    let bestScore = 0;

    INTENT_PATTERNS.forEach(pattern => {
      pattern.keywords.forEach(keyword => {
        if (query.includes(keyword.toLowerCase()) && keyword.length > bestScore) {
          bestScore = keyword.length;
          bestIntent = pattern.intent;
        }
      });
    });

    return bestIntent;
  }

  /* -------------------------------------------------------------
     RESPONSE BUILDERS (one per intent)
     -------------------------------------------------------------
     Each takes the already-built `knowledge` object
     (from SheetParsers.buildFullKnowledge()) and returns an
     HTML string ready to insert into the chat bubble.
     ----------------------------------------------------------- */

  function buildBalanceReply(knowledge) {
    if (!knowledge._status.summaryOk) return FRIENDLY_UNAVAILABLE;
    return `🏦 <strong>वर्तमान शेष राशि (Current Balance)</strong><br><br>
      ${formatINR(knowledge.summary.currentBalance)}`;
  }

  function buildTotalIncomeReply(knowledge) {
    if (!knowledge._status.summaryOk) return FRIENDLY_UNAVAILABLE;
    return `💰 <strong>कुल आय (Total Income)</strong><br><br>
      ${formatINR(knowledge.summary.totalIncome)}`;
  }

  function buildTotalExpenseReply(knowledge) {
    if (!knowledge._status.summaryOk) return FRIENDLY_UNAVAILABLE;
    return `📤 <strong>कुल व्यय (Total Expense)</strong><br><br>
      ${formatINR(knowledge.summary.totalExpense)}`;
  }

  function buildMarketIncomeReply(knowledge) {
    if (!knowledge._status.summaryOk) return FRIENDLY_UNAVAILABLE;
    return `🏪 <strong>बाजार आय (Market Income)</strong><br><br>
      ${formatINR(knowledge.summary.marketIncome)}`;
  }

  function buildShubhKaryIncomeReply(knowledge) {
    if (!knowledge._status.summaryOk) return FRIENDLY_UNAVAILABLE;
    return `🎉 <strong>शुभ कार्य आय (Shubh Karya Income)</strong><br><br>
      ${formatINR(knowledge.summary.shubhKaryIncome)}`;
  }

  function buildMemberCountReply(knowledge) {
    if (!knowledge._status.membersOk) return FRIENDLY_UNAVAILABLE;
    return `👥 <strong>कुल सदस्य संख्या (Total Members)</strong><br><br>
      ${knowledge.summary.totalMembers} सदस्य`;
  }

  /** Builds a compact HTML table for a list of {label, amount} style rows, capped to maxRows. */
  function buildTable(headers, rows, maxRows) {
    const limitedRows = rows.slice(0, maxRows);
    const headerHtml = headers.map(h => `<th style="padding:5px 8px;text-align:left;border-bottom:1px solid #eee;">${h}</th>`).join('');
    const bodyHtml = limitedRows.map(r =>
      `<tr>${r.map(c => `<td style="padding:5px 8px;border-bottom:1px solid #f5f5f5;">${c}</td>`).join('')}</tr>`
    ).join('');

    const moreNote = rows.length > maxRows
      ? `<div style="font-size:11px;color:#999;margin-top:6px;">...और ${rows.length - maxRows} पंक्तियाँ। पूर्ण विवरण के लिए Accounts Portal देखें।</div>`
      : '';

    return `<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:12px;width:100%;">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table></div>${moreNote}`;
  }

  function buildAllMembersReply(knowledge) {
    if (!knowledge._status.membersOk) return FRIENDLY_UNAVAILABLE;
    if (!knowledge.members.length) return 'अभी सदस्य योगदान का डेटा उपलब्ध नहीं है। 🙏';

    const rows = knowledge.members.map(m => [m.memberName, formatINR(m.totalContribution)]);
    const table = buildTable(['सदस्य का नाम', 'कुल योगदान'], rows, 10);

    return `👥 <strong>सदस्य योगदान सूची</strong> (कुल ${knowledge.members.length} सदस्य)<br><br>${table}`;
  }

  function buildMarketListReply(knowledge) {
    if (!knowledge._status.marketOk) return FRIENDLY_UNAVAILABLE;
    if (!knowledge.market.length) return 'अभी बाजार आय का डेटा उपलब्ध नहीं है। 🙏';

    const rows = knowledge.market.map(m => [m.date, m.source, formatINR(m.amount)]);
    const table = buildTable(['दिनांक', 'स्रोत', 'राशि'], rows, 10);
    const total = knowledge.market.reduce((sum, m) => sum + m.amount, 0);

    return `🏪 <strong>बाजार आय विवरण</strong><br><br>${table}<br>
      <strong>कुल: ${formatINR(total)}</strong>`;
  }

  function buildExpenseListReply(knowledge) {
    if (!knowledge._status.expensesOk) return FRIENDLY_UNAVAILABLE;
    if (!knowledge.expenses.length) return 'अभी व्यय का डेटा उपलब्ध नहीं है। 🙏';

    const rows = knowledge.expenses.map(e => [e.date, e.expenseName, formatINR(e.amount)]);
    const table = buildTable(['दिनांक', 'विवरण', 'राशि'], rows, 10);
    const total = knowledge.expenses.reduce((sum, e) => sum + e.amount, 0);

    return `📋 <strong>व्यय विवरण</strong><br><br>${table}<br>
      <strong>कुल: ${formatINR(total)}</strong>`;
  }

  /* -------------------------------------------------------------
     INTENT → BUILDER MAP
     ----------------------------------------------------------- */
  const REPLY_BUILDERS = {
    balance:         buildBalanceReply,
    totalIncome:     buildTotalIncomeReply,
    totalExpense:    buildTotalExpenseReply,
    marketIncome:    buildMarketIncomeReply,
    shubhKaryIncome: buildShubhKaryIncomeReply,
    memberCount:     buildMemberCountReply,
    allMembers:      buildAllMembersReply,
    marketList:      buildMarketListReply,
    expenseList:     buildExpenseListReply
  };

  /* -------------------------------------------------------------
     PUBLIC: handleFinancialQuery(userText)
     -------------------------------------------------------------
     Returns:
       null                → message was not a financial question at all
                              (caller should fall back to knowledge-base.js)
       string (HTML)        → a ready-to-display answer (success OR friendly error)
     ----------------------------------------------------------- */
  async function handleFinancialQuery(userText) {
    const intent = detectIntent(userText);
    if (!intent) return null; // not a financial question — let caller fall back

    if (typeof SheetParsers === 'undefined') {
      console.error('[FinancialQueryHandler] SheetParsers module not found. Load sheet-parsers.js first.');
      return FRIENDLY_UNAVAILABLE;
    }

    try {
      const knowledge = await SheetParsers.buildFullKnowledge();
      if (!knowledge) return FRIENDLY_UNAVAILABLE;

      const builder = REPLY_BUILDERS[intent];
      return builder ? builder(knowledge) : FRIENDLY_UNAVAILABLE;

    } catch (err) {
      console.error('[FinancialQueryHandler] Unexpected error:', err);
      return FRIENDLY_UNAVAILABLE;
    }
  }

  /* -------------------------------------------------------------
     PUBLIC API
     ----------------------------------------------------------- */
  return {
    handleFinancialQuery,
    detectIntent // exposed for testing/debugging only
  };

})();