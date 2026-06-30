/* =====================================================================
   MAHADEV AI — SHEET PARSING / MAPPING LAYER
   =====================================================================
   Purpose : Convert RAW CSV rows (provided by sheets-integration.js)
             into clean, predictable JavaScript objects.

   Depends on : sheets-integration.js  (must be loaded BEFORE this file)

   Scope   : DATA MAPPING ONLY.
             - No UI code here.
             - No AI / chatbot logic here.
             - Each worksheet gets its own dedicated parser function.

   Known sheet layouts (confirmed earlier in this project):
     • Summary       → label/value pairs in column B / column C
     • Member        → Sr No | Name | Feb..Jan (12 months) | Total
     • Market        → month-block rows: Date | Day | Shops | Amount | Total | Remarks | Mode
     • Shubh Karya   → Sr No | Name | Work Type | Date | Amount | Remarks
     • Expenses      → Sr No | Date | Amount | Details | Remarks
   ===================================================================== */

const SheetParsers = (function () {
  'use strict';

  /* -------------------------------------------------------------
     SHARED HELPERS
     ----------------------------------------------------------- */

  /** Remove wrapping quotes + trim whitespace. Never throws on undefined. */
  function clean(value) {
    return (value || '').toString().replace(/"/g, '').trim();
  }

  /** Convert a messy string like "₹1,234" or " 500 " into a safe number (0 if invalid). */
  function toNumber(value) {
    const cleaned = clean(value).replace(/[₹,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /** True if a row is entirely empty (every cell blank after cleaning). */
  function isEmptyRow(row) {
    if (!row || row.length === 0) return true;
    return row.every(cell => clean(cell) === '');
  }

  /** True if a string looks like a DD/MM/YYYY date (matches existing sheet format). */
  function looksLikeDate(value) {
    return /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(clean(value));
  }

  /* =================================================================
     1. SUMMARY SHEET PARSER
     =================================================================
     Layout reminder:
       Column B = label text (e.g. "कुल आय", "सदस्य आय")
       Column C = the number for that label
     Returns a flat object with the exact fields requested.
     ================================================================= */
  function parseSummary(rawRows) {
    const result = {
      totalIncome:     0,
      totalExpense:    0,
      currentBalance:  0,
      totalMembers:    0,
      marketIncome:    0,
      shubhKaryIncome: 0
    };

    if (!Array.isArray(rawRows)) return result;

    /** Find first row whose Column B contains `keyword`, return Column C as number. */
    function findAmount(keyword) {
      for (const row of rawRows) {
        if (isEmptyRow(row)) continue;
        const label = clean(row[1]);
        if (label.includes(keyword)) {
          return toNumber(row[2]);
        }
      }
      return 0;
    }

    result.totalIncome     = findAmount('कुल आय');
    result.totalExpense    = findAmount('कुल व्यय');
    result.currentBalance  = findAmount('शेष राशि');
    result.marketIncome    = findAmount('बाजार आय');
    result.shubhKaryIncome = findAmount('शुभ कार्य आय');

    // totalMembers is not directly present in the Summary sheet —
    // it is derived later by counting Member Contribution rows
    // (see buildFullKnowledge() below). Left as 0 here by design.

    return result;
  }

  /* =================================================================
     2. MEMBER CONTRIBUTION SHEET PARSER
     =================================================================
     Layout reminder:
       Col A = Sr No | Col B = Member Name | Col C..N = 12 months | Col O = Total
     Returns an array of clean member objects.
     ================================================================= */
  function parseMemberContribution(rawRows) {
    const monthLabels = [
      'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026',
      'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026',
      'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027'
    ];

    const members = [];
    if (!Array.isArray(rawRows)) return members;

    for (const row of rawRows) {
      if (isEmptyRow(row)) continue;

      const name = clean(row[1]);
      // Skip header rows / title rows: a valid member row always has
      // a non-numeric name in column B.
      if (!name || !isNaN(name)) continue;
      if (name.toLowerCase().includes('member name')) continue;

      const monthlyContributions = {};
      monthLabels.forEach((label, i) => {
        monthlyContributions[label] = toNumber(row[2 + i]);
      });

      members.push({
        memberName: name,
        monthlyContributions: monthlyContributions,
        totalContribution: toNumber(row[14])
      });
    }

    return members;
  }

  /* =================================================================
     3. MARKET INCOME SHEET PARSER
     =================================================================
     Layout reminder:
       Col A = month label (sometimes) | Col B = Date | Col C = Day
       Col D = Shops | Col E = Amount  | Col F = Total
       Col G = Remarks | Col H = Payment Mode
       Special row: "Name- XYZ" one-time payments (name in Col A, date in Col B)

     Requirement asks for: Source, Amount, Date
     "Source" = Shops count (normal rows) OR the special payer's name.
     ================================================================= */
  function parseMarketIncome(rawRows) {
    const entries = [];
    if (!Array.isArray(rawRows)) return entries;

    for (const row of rawRows) {
      if (isEmptyRow(row)) continue;

      const colA = clean(row[0]);
      const colB = clean(row[1]); // Date
      const colD = clean(row[3]); // Shops
      const colF = clean(row[5]); // Total
      const colE = clean(row[4]); // Amount (fallback)

      // Special one-time payment row: "Name- Gopi Rai"
      if (colA.toLowerCase().startsWith('name-') && looksLikeDate(colB)) {
        entries.push({
          source: colA.replace(/name-/i, '').trim(),
          amount: toNumber(colF) || toNumber(colE),
          date:   colB
        });
        continue;
      }

      // Skip month-label rows (e.g. "FEBRUARY 2026") — they have no date
      const isMonthLabel = colA && /[A-Za-z]/.test(colA) && /\d{4}/.test(colA);
      if (isMonthLabel) continue;

      // Normal weekly collection row
      if (looksLikeDate(colB)) {
        entries.push({
          source: colD ? (colD + ' shops') : 'Market Collection',
          amount: toNumber(colF),
          date:   colB
        });
      }
    }

    return entries;
  }

  /* =================================================================
     4. SHUBH KARYA INCOME SHEET PARSER
     =================================================================
     Layout reminder:
       Col A = Sr No | Col B = Name | Col C = Work Type (Occasion)
       Col D = Date  | Col E = Amount | Col F = Remarks
     ================================================================= */
  function parseShubhKaryIncome(rawRows) {
    const entries = [];
    if (!Array.isArray(rawRows)) return entries;

    for (const row of rawRows) {
      if (isEmptyRow(row)) continue;

      const name = clean(row[1]);
      const date = clean(row[3]);

      if (!name || name.toLowerCase().includes('name')) continue; // skip header
      if (!looksLikeDate(date)) continue; // skip rows without a real date

      entries.push({
        name:     name,
        occasion: clean(row[2]),
        amount:   toNumber(row[4]),
        date:     date
      });
    }

    return entries;
  }

  /* =================================================================
     5. EXPENSES SHEET PARSER
     =================================================================
     Layout reminder:
       Col A = Sr No | Col B = Date | Col C = Amount
       Col D = Expense Details | Col E = Remarks
     "Category" is not a separate column in the current sheet, so we
     reuse the Remarks column as the closest available category label
     (falls back to "General" if empty) — keeps the field present and
     safe for future use without breaking if the sheet changes.
     ================================================================= */
  function parseExpenses(rawRows) {
    const entries = [];
    if (!Array.isArray(rawRows)) return entries;

    for (const row of rawRows) {
      if (isEmptyRow(row)) continue;

      const date    = clean(row[1]);
      const amount  = clean(row[2]);
      const details = clean(row[3]);

      if (!looksLikeDate(date) || !amount) continue; // skip header/blank rows

      entries.push({
        expenseName: details || 'Expense',
        category:    clean(row[4]) || 'General',
        amount:      toNumber(amount),
        date:        date
      });
    }

    return entries;
  }

  /* =================================================================
     6. MASTER BUILDER
     =================================================================
     Pulls raw data from SheetsIntegration (already cached / auto-
     refreshing every 5 minutes from Task K-005), runs every parser,
     and returns ONE clean combined object.
     ================================================================= */
  async function buildFullKnowledge(forceFresh = false) {

    if (typeof SheetsIntegration === 'undefined') {
      console.error('[SheetParsers] SheetsIntegration module not found. Load sheets-integration.js first.');
      return null;
    }

    const [summaryRes, memberRes, marketRes, shubhRes, expenseRes] = await Promise.all([
      SheetsIntegration.getSummary(forceFresh),
      SheetsIntegration.getMemberContribution(forceFresh),
      SheetsIntegration.getMarketIncome(forceFresh),
      SheetsIntegration.getShubhKaryIncome(forceFresh),
      SheetsIntegration.getExpenses(forceFresh)
    ]);

    const summary    = summaryRes.success ? parseSummary(summaryRes.data) : parseSummary(null);
    const members     = memberRes.success  ? parseMemberContribution(memberRes.data) : [];
    const market       = marketRes.success  ? parseMarketIncome(marketRes.data)       : [];
    const shubhKarya    = shubhRes.success   ? parseShubhKaryIncome(shubhRes.data)      : [];
    const expenses        = expenseRes.success ? parseExpenses(expenseRes.data)            : [];

    // Derive total members count from the Member sheet itself
    summary.totalMembers = members.length;

    return {
      summary:    summary,
      members:    members,
      market:     market,
      shubhKarya: shubhKarya,
      expenses:   expenses,

      // Flags so consuming code (future chatbot) can show friendly
      // messages per-section if one particular sheet failed to load.
      _status: {
        summaryOk:    summaryRes.success,
        membersOk:    memberRes.success,
        marketOk:     marketRes.success,
        shubhKaryaOk: shubhRes.success,
        expensesOk:   expenseRes.success
      }
    };
  }

  /* -------------------------------------------------------------
     PUBLIC API
     ----------------------------------------------------------- */
  return {
    parseSummary,
    parseMemberContribution,
    parseMarketIncome,
    parseShubhKaryIncome,
    parseExpenses,
    buildFullKnowledge
  };

})();