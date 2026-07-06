/* =====================================================================
   MAHADEV AI — LANGUAGE NORMALIZATION LAYER (Project Kailash — Task K-011)
   =====================================================================
   Purpose : Clean + standardize user text BEFORE Intent Detection runs,
             so that spelling mistakes and different synonyms/phrasings
             all collapse into one predictable form.

   Supports: English, Hindi, Maithili (script-agnostic — works on
             whatever the user typed, Devanagari or Latin).

   Hard rules followed:
     - No UI changes, no CSS changes.
     - No external AI / API calls — pure JS + dictionaries.
     - Dictionary-based mapping (plain objects), NOT long if/else chains.
     - Modular — exposed as one global "LanguageNormalizer" object,
       does not touch any other file's internals.

   Pipeline (in order):
     1. Lowercase conversion
     2. Punctuation cleanup       (। ? ! , . ; : " ' ` removed)
     3. Extra space removal       (collapse + trim)
     4. Spelling correction       (dictionary: common misspelling → correct word)
     5. Synonym mapping           (dictionary: variant word → canonical word)

   NOTE ON SCOPE:
     This module only NORMALIZES text for intent detection / matching.
     It does NOT change what gets sent to MemberQueryHandler or
     FinancialQueryHandler (they keep receiving the original raw text,
     exactly as before) — this keeps all existing functionality intact.
   ===================================================================== */

const LanguageNormalizer = (function () {
  'use strict';

  /* -------------------------------------------------------------
     1. SPELLING CORRECTION DICTIONARY
     -------------------------------------------------------------
     Common minor misspellings/typos → correct word.
     Dictionary-based (object lookup), not if/else chains.
     Add more entries here anytime — no code logic changes needed.
     ----------------------------------------------------------- */
  const SPELLING_CORRECTIONS = {
    // English
    'templ':        'temple',
    'templee':       'temple',
    'donaton':       'donation',
    'donatoin':      'donation',
    'adress':        'address',
    'addres':        'address',
    'contct':        'contact',
    'contac':        'contact',
    'timming':       'timing',
    'tming':         'timing',
    'libary':        'library',
    'libraray':      'library',
    'balace':        'balance',
    'ballance':      'balance',
    'wich':          'which',
    'wat':           'what',
    'wher':          'where',
    'hw':            'how',

    // Hinglish / Romanized Hindi
    'mandhir':       'mandir',
    'mandirr':       'mandir',
    'mandr':         'mandir',
    'sampak':        'sampark',
    'samprak':       'sampark',
    'kitn':          'kitna',
    'kitne':         'kitna',
    'kaisa':         'kaise',
    'kese':          'kaise',
    'kb':            'kab',
    'kaha':          'kahan',
    'kaham':         'kahan',
    'daan':          'daan',
    'dhan':          'daan',
    'chnda':         'chanda',
    'chandaa':       'chanda',
    'pta':           'pata',
    'paisaa':        'paisa'
  };

  /* -------------------------------------------------------------
     2. SYNONYM MAPPING DICTIONARY
     -------------------------------------------------------------
     Variant words/phrases (across English, Hindi, Maithili,
     Hinglish) → one CANONICAL word. This lets Intent Detection
     match a single canonical term instead of needing every variant
     hardcoded in every handler's keyword list.

     Dictionary-based (object lookup) — adding a new synonym is a
     one-line addition, no new logic/branches required.
     ----------------------------------------------------------- */
  const SYNONYM_MAP = {
    // ===== "temple / mandir" =====
    'temple':        'mandir',
    'mandir':        'mandir',
    'devalaya':      'mandir',
    'devsthan':      'mandir',

    // ===== "donation / chanda / daan" =====
    'donation':      'daan',
    'donate':        'daan',
    'chanda':        'daan',
    'contribution':  'daan',
    'contribute':    'daan',
    'daan':          'daan',

    // ===== "timing / samay" =====
    'timing':        'samay',
    'time':          'samay',
    'samay':         'samay',
    'schedule':      'samay',

    // ===== "aarti / puja" =====
    'aarti':         'puja',
    'arti':          'puja',
    'pooja':         'puja',
    'puja':          'puja',
    'worship':       'puja',

    // ===== "address / location / pata" =====
    'address':       'pata',
    'location':      'pata',
    'pata':          'pata',
    'direction':     'pata',
    'directions':    'pata',

    // ===== "contact / sampark" =====
    'contact':       'sampark',
    'sampark':       'sampark',
    'phone':         'sampark',
    'whatsapp':      'sampark',

    // ===== "history / itihas" =====
    'history':       'itihas',
    'itihas':        'itihas',
    'story':         'itihas',
    'kahani':        'itihas',

    // ===== "balance / shesh rashi" =====
    'balance':       'balance',
    'shesh':         'balance',
    'remaining':     'balance',

    // ===== "income / aay" =====
    'income':        'aay',
    'aay':           'aay',
    'earning':       'aay',

    // ===== "expense / vyay / kharch" =====
    'expense':       'vyay',
    'expenses':      'vyay',
    'kharch':        'vyay',
    'vyay':          'vyay',

    // ===== "member / sadasya" =====
    'member':        'sadasya',
    'members':       'sadasya',
    'sadasya':       'sadasya',

    // ===== "library / pustakalay" =====
    'library':       'pustakalay',
    'pustakalay':    'pustakalay',
    'books':         'pustakalay',

    // ===== Maithili-specific → canonical bridge =====
    'ठाम':           'pata',      // maithili "place/location"
    'सँ':            'se',        // maithili "from"
    'अछि':           'hai',       // maithili "is"
    'केर':           'ka'         // maithili "of"
  };

  /* -------------------------------------------------------------
     HELPER: apply a dictionary map to a single word (exact match)
     ----------------------------------------------------------- */
  function applyDictionary(word, dictionary) {
    return dictionary.hasOwnProperty(word) ? dictionary[word] : word;
  }

  /* -------------------------------------------------------------
     MAIN NORMALIZE FUNCTION
     -------------------------------------------------------------
     normalize(rawText) → cleaned, canonicalized string ready for
     Intent Detection.
     ----------------------------------------------------------- */
  function normalize(rawText) {
    if (!rawText) return '';

    let text = rawText.toString();

    // Unicode normalization — keeps Hindi/Maithili conjuncts consistent
    if (typeof text.normalize === 'function') {
      text = text.normalize('NFC');
    }

    // Step 1: lowercase conversion
    text = text.toLowerCase();

    // Step 2: punctuation cleanup
    text = text.replace(/[।?!,.;:"'`]/g, ' ');

    // Step 3: extra space removal
    text = text.replace(/\s+/g, ' ').trim();

    if (!text) return '';

    // Step 4 + 5: word-by-word spelling correction, then synonym mapping
    const words = text.split(' ').map(word => {
      const corrected = applyDictionary(word, SPELLING_CORRECTIONS);
      const canonical  = applyDictionary(corrected, SYNONYM_MAP);
      return canonical;
    });

    return words.join(' ').replace(/\s+/g, ' ').trim();
  }

  /* -------------------------------------------------------------
     PUBLIC API
     ----------------------------------------------------------- */
  return {
    normalize,
    // exposed for testing/debugging + future dictionary extension
    SPELLING_CORRECTIONS,
    SYNONYM_MAP
  };

})();