/* =====================================================================
   MAHADEV AI — LANGUAGE DETECTOR
   =====================================================================
   Task K-010 · Part 1

   Purpose : Detect whether a user's message is written in
             Hindi, English, or Maithili — so the chatbot can reply
             in the same language.

   Hard rule : No AI API, no external library. Pure script/keyword
               heuristics only (same spirit as knowledge-base.js).

   Why this is tricky:
     Hindi और Maithili दोनों Devanagari script में लिखी जाती हैं,
     इसलिए सिर्फ script देखकर इन दोनों में फर्क नहीं किया जा सकता।
     इसलिए हम Maithili के कुछ बहुत ही specific/unique शब्दों
     (जो Hindi में इस्तेमाल नहीं होते — जैसे "अछि", "छी", "केर", "सँ")
     की मौजूदगी चेक करते हैं। अगर एक भी मिल जाए, तो टेक्स्ट को
     Maithili मान लिया जाता है, वरना Devanagari script = Hindi.

     English/Hinglish के लिए भी वही approach — pure Latin script
     अगर romanized Hindi/Maithili के common words (kya, hai, kaise,
     aachi, chhi...) से match नहीं करता तो English माना जाता है।

   Returns one of: 'hindi' | 'english' | 'maithili'
   ===================================================================== */

const LangDetector = (function () {
  'use strict';

  /* -------------------------------------------------------------
     CHARACTER RANGES
     ----------------------------------------------------------- */
  const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;
  const LATIN_REGEX      = /[a-zA-Z]/g;

  /* -------------------------------------------------------------
     MAITHILI-ONLY MARKERS (Devanagari script)
     -------------------------------------------------------------
     ये शब्द/रूप मुख्यतः मैथिली में ही इस्तेमाल होते हैं, मानक हिंदी
     में नहीं (या बहुत कम)। एक भी मिलने पर टेक्स्ट को Maithili
     classify किया जाता है।
     ----------------------------------------------------------- */
  const MAITHILI_MARKERS_DEV = [
    'अछि', 'छी', 'छथि', 'छल', 'छलाह', 'केर', 'सँ', 'ठाम',
    'बला', 'अहाँ', 'हम सभ', 'किए', 'कोन', 'कतय', 'सभ',
    'जकां', 'ओकर', 'हुनका', 'हुनकर', 'तखन', 'जाहि', 'ताहि',
    'रहथि', 'करैत', 'देल', 'गेल', 'अछि।'
  ];

  /* -------------------------------------------------------------
     ROMANIZED (Hinglish) HINDI MARKERS
     -------------------------------------------------------------
     Latin script में लिखे common Hindi words — अगर ये मिलें तो
     टेक्स्ट को "hindi" माना जाता है (pure English नहीं)।
     ----------------------------------------------------------- */
  const HINGLISH_MARKERS = [
    'kya', 'hai', 'kaise', 'kab', 'kitna', 'kitne', 'kahan', 'mandir',
    'puja', 'pooja', 'aarti', 'daan', 'sampark', 'dhanyawad', 'namaste',
    'aap', 'tum', 'mujhe', 'chahiye', 'karo', 'kare', 'karna', 'hoga',
    'hoti', 'nahi', 'haan', 'kripya', 'batao', 'bataye', 'samay', 'yah',
    'iska', 'uska', 'humko', 'hume'
  ];

  /* -------------------------------------------------------------
     ROMANIZED MAITHILI MARKERS
     -------------------------------------------------------------
     रोमन लिपि में मैथिली — comparatively rare in chat, लेकिन जो
     शब्द दिखें वो काफी distinctive हैं।
     ----------------------------------------------------------- */
  const MAITHILI_MARKERS_ROMAN = [
    'chhi', 'aachi', 'chhal', 'kotay', 'sabh', 'chhathi', 'ohi',
    'tahi', 'kian', 'hunka', 'hunkar', 'karait', 'jakan'
  ];

  /* -------------------------------------------------------------
     HELPER: count how many marker words appear in the text
     ----------------------------------------------------------- */
  function countMatches(text, wordList) {
    let count = 0;
    const lower = text.toLowerCase();
    for (const word of wordList) {
      if (lower.includes(word.toLowerCase())) count++;
    }
    return count;
  }

  /* -------------------------------------------------------------
     MAIN DETECTION FUNCTION
     -------------------------------------------------------------
     detect(rawText) → 'hindi' | 'english' | 'maithili'
     ----------------------------------------------------------- */
  function detect(rawText) {
    const text = (rawText || '').toString().trim();
    if (!text) return 'hindi'; // safe default — most visitors are Hindi speakers

    const devMatches = text.match(DEVANAGARI_REGEX) || [];
    const latMatches  = text.match(LATIN_REGEX) || [];

    const devCount = devMatches.length;
    const latCount = latMatches.length;

    /* === CASE 1: Devanagari-dominant text === */
    if (devCount > 0 && devCount >= latCount) {
      const maithiliScore = countMatches(text, MAITHILI_MARKERS_DEV);
      if (maithiliScore >= 1) return 'maithili';
      return 'hindi';
    }

    /* === CASE 2: Latin-dominant text (English or Hinglish) === */
    if (latCount > 0) {
      const maithiliRomanScore = countMatches(text, MAITHILI_MARKERS_ROMAN);
      if (maithiliRomanScore >= 1) return 'maithili';

      const hinglishScore = countMatches(text, HINGLISH_MARKERS);
      if (hinglishScore >= 1) return 'hindi';

      return 'english';
    }

    /* === CASE 3: No letters at all (emoji/numbers only) === */
    return 'hindi';
  }

  /* -------------------------------------------------------------
     PUBLIC API
     ----------------------------------------------------------- */
  return {
    detect,
    // exposed for testing/debugging only
    countMatches
  };

})();