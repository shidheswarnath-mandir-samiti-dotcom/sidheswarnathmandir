/* =====================================================================
   MAHADEV AI — GEMINI CONFIG (Project Kailash — Task K-012)
   =====================================================================
   API key is NOT hardcoded here. It is read at runtime from
   window.GEMINI_API_KEY, which YOU must set in a separate,
   git-ignored file (e.g. secrets.js) loaded BEFORE this file:

     // secrets.js  (add this file to .gitignore — never commit it)
     window.GEMINI_API_KEY = "YOUR_REAL_KEY_HERE";

   If no key is found, GEMINI_CONFIG.API_KEY stays empty and
   gemini-service.js will automatically fail closed (returns null),
   so the app falls back to the existing Query Engine untouched.
   ===================================================================== */

const GEMINI_CONFIG = {
  API_KEY:  (typeof window !== 'undefined' && window.GEMINI_API_KEY) ? window.GEMINI_API_KEY : '',
  MODEL:    'gemini-2.0-flash',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models'
};