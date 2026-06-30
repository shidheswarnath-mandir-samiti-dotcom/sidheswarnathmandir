/* =====================================================================
   MAHADEV AI — GOOGLE SHEETS INTEGRATION LAYER
   =====================================================================
   Purpose : Fetch live temple financial data from the same published
             Google Sheet already used by accounts.html / index.html.
   Scope   : DATA ONLY. This file knows nothing about the chat UI.
             mahadev-ai.js / knowledge-base.js will consume these
             functions in a LATER task (not this one).
   No external AI API is used here — only fetch() + CSV parsing.
   ===================================================================== */

const SheetsIntegration = (function () {
  'use strict';

  /* -------------------------------------------------------------
     1. CONFIGURATION
     -------------------------------------------------------------
     Reuses the SAME published CSV links already defined in
     sheet-config.js (SHEET_URLS). This avoids duplicating the
     Sheet ID / gid values in two places.

     If sheet-config.js is not loaded for some reason, we fall
     back to empty strings so the module fails gracefully instead
     of throwing a hard error.
     ----------------------------------------------------------- */
  const ENDPOINTS = (typeof SHEET_URLS !== 'undefined') ? SHEET_URLS : {
    summary:    '',
    members:    '',
    market:     '',
    shubhKarya: '',
    expenses:   ''
  };

  // How often cached data should be refreshed automatically (ms)
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  /* -------------------------------------------------------------
     2. IN-MEMORY CACHE
     -------------------------------------------------------------
     Each key stores: { rows: [...], fetchedAt: timestamp, error: null|string }
     ----------------------------------------------------------- */
  const cache = {
    summary:    { rows: null, fetchedAt: null, error: null },
    members:    { rows: null, fetchedAt: null, error: null },
    market:     { rows: null, fetchedAt: null, error: null },
    shubhKarya: { rows: null, fetchedAt: null, error: null },
    expenses:   { rows: null, fetchedAt: null, error: null }
  };

  /* -------------------------------------------------------------
     3. ROBUST CSV PARSER
     -------------------------------------------------------------
     Handles quoted fields (commas inside quotes) and skips
     blank lines caused by merged cells in Google Sheets exports.
     Same logic already proven in accounts.html.
     ----------------------------------------------------------- */
  function parseCSV(text) {
    const rows = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue; // skip empty lines

      const cells = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      cells.push(current.trim());
      rows.push(cells);
    }

    return rows;
  }

  /* -------------------------------------------------------------
     4. GENERIC FETCH + CACHE HELPER
     -------------------------------------------------------------
     sheetKey  : one of 'summary' | 'members' | 'market' | 'shubhKarya' | 'expenses'
     forceFresh: if true, ignores cache and re-fetches immediately
     Returns   : { rows, error } — rows is null if fetch failed
     ----------------------------------------------------------- */
  async function fetchSheet(sheetKey, forceFresh) {
    const url = ENDPOINTS[sheetKey];
    const entry = cache[sheetKey];

    const isCacheValid =
      !forceFresh &&
      entry.rows !== null &&
      entry.fetchedAt !== null &&
      (Date.now() - entry.fetchedAt) < REFRESH_INTERVAL_MS;

    if (isCacheValid) {
      return { rows: entry.rows, error: null };
    }

    if (!url) {
      entry.error = 'Sheet URL not configured.';
      return { rows: null, error: entry.error };
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not OK (status ' + response.status + ')');
      }
      const csvText = await response.text();
      const rows = parseCSV(csvText);

      // Update cache
      entry.rows = rows;
      entry.fetchedAt = Date.now();
      entry.error = null;

      return { rows, error: null };

    } catch (err) {
      entry.error = 'Could not reach Google Sheets right now.';
      console.error('[SheetsIntegration] Fetch failed for "' + sheetKey + '":', err);

      // If we have OLD cached data, still return it (better than nothing)
      if (entry.rows !== null) {
        return { rows: entry.rows, error: entry.error };
      }
      return { rows: null, error: entry.error };
    }
  }

  /* -------------------------------------------------------------
     5. FRIENDLY FALLBACK MESSAGE
     -------------------------------------------------------------
     Used by consuming code (chatbot, dashboards) so the user
     never sees a raw JS error.
     ----------------------------------------------------------- */
  const FRIENDLY_ERROR_MESSAGE =
    'क्षमा करें, अभी मंदिर का डेटा लोड नहीं हो पा रहा है। कृपया कुछ देर बाद पुनः प्रयास करें। 🙏';

  /* -------------------------------------------------------------
     6. PUBLIC DATA FUNCTIONS
     -------------------------------------------------------------
     Each function returns a Promise resolving to:
       { success: boolean, data: <parsed structure or null>, message: string|null }

     These are intentionally simple "raw row" returns for now —
     higher-level summarization (totals, search, etc.) will be
     built in a LATER task when the chatbot actually uses this data.
     ----------------------------------------------------------- */

  /**
   * getSummary()
   * Returns raw rows from the Summary sheet
   * (contains Member Income, Market Income, Shubh Karya Income,
   *  Total Income, Total Expense, Remaining Balance).
   */
  async function getSummary(forceFresh = false) {
    const { rows, error } = await fetchSheet('summary', forceFresh);
    if (!rows) {
      return { success: false, data: null, message: error || FRIENDLY_ERROR_MESSAGE };
    }
    return { success: true, data: rows, message: null };
  }

  /**
   * getMemberContribution()
   * Returns raw rows from the Member Contribution sheet
   * (Sr No, Member Name, Feb..Jan months, Total).
   */
  async function getMemberContribution(forceFresh = false) {
    const { rows, error } = await fetchSheet('members', forceFresh);
    if (!rows) {
      return { success: false, data: null, message: error || FRIENDLY_ERROR_MESSAGE };
    }
    return { success: true, data: rows, message: null };
  }

  /**
   * getMarketIncome()
   * Returns raw rows from the Market Collection sheet
   * (month blocks with Date, Day, Shops, Amount, Total, Remarks, Payment Mode).
   */
  async function getMarketIncome(forceFresh = false) {
    const { rows, error } = await fetchSheet('market', forceFresh);
    if (!rows) {
      return { success: false, data: null, message: error || FRIENDLY_ERROR_MESSAGE };
    }
    return { success: true, data: rows, message: null };
  }

  /**
   * getShubhKaryIncome()
   * Returns raw rows from the Shubh Karya sheet
   * (Sr No, Name, Work Type, Date, Amount, Remarks).
   */
  async function getShubhKaryIncome(forceFresh = false) {
    const { rows, error } = await fetchSheet('shubhKarya', forceFresh);
    if (!rows) {
      return { success: false, data: null, message: error || FRIENDLY_ERROR_MESSAGE };
    }
    return { success: true, data: rows, message: null };
  }

  /**
   * getExpenses()
   * Returns raw rows from the Expense sheet
   * (Sr No, Date, Amount, Expense Details, Remarks).
   */
  async function getExpenses(forceFresh = false) {
    const { rows, error } = await fetchSheet('expenses', forceFresh);
    if (!rows) {
      return { success: false, data: null, message: error || FRIENDLY_ERROR_MESSAGE };
    }
    return { success: true, data: rows, message: null };
  }

  /* -------------------------------------------------------------
     7. PRELOAD + AUTO-REFRESH
     -------------------------------------------------------------
     Quietly warms the cache on page load and keeps it refreshed
     every REFRESH_INTERVAL_MS, so that whenever the chatbot
     eventually asks for data (future task), it is usually
     already cached and instant.
     ----------------------------------------------------------- */
  function preloadAll() {
    getSummary(true);
    getMemberContribution(true);
    getMarketIncome(true);
    getShubhKaryIncome(true);
    getExpenses(true);
  }

  function startAutoRefresh() {
    preloadAll(); // initial load
    setInterval(preloadAll, REFRESH_INTERVAL_MS);
  }

  // Kick off preloading once the script loads (does not touch any UI)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoRefresh);
  } else {
    startAutoRefresh();
  }

  /* -------------------------------------------------------------
     8. PUBLIC API
     -------------------------------------------------------------
     Exposed as a single global object "SheetsIntegration" so that
     future chatbot logic can call:
       SheetsIntegration.getSummary()
       SheetsIntegration.getMemberContribution()
       SheetsIntegration.getMarketIncome()
       SheetsIntegration.getShubhKaryIncome()
       SheetsIntegration.getExpenses()
     ----------------------------------------------------------- */
  return {
    getSummary,
    getMemberContribution,
    getMarketIncome,
    getShubhKaryIncome,
    getExpenses,
    FRIENDLY_ERROR_MESSAGE
  };

})();