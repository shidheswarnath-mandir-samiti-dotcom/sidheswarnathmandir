/* =====================================================
   LANGUAGE SWITCHER
   Supports: English (en) | Hindi (hi)
   Storage: localStorage ('mahadev_lang')
   ===================================================== 

const LangSwitch = (function () {

  const STORAGE_KEY = 'mahadev_lang';
  const DEFAULT_LANG = 'en';

  // ── Translation Map ──────────────────────────────────
  const translations = {

    // NAVBAR
    'nav.home':     { en: 'Home',     hi: 'होम' },
    'nav.about':    { en: 'About',    hi: 'परिचय' },
    'nav.gallery':  { en: 'Gallery',  hi: 'गैलरी' },
    'nav.library':  { en: '📚 Library', hi: '📚 पुस्तकालय' },
    'nav.donation': { en: 'Donation', hi: 'दान' },
    'nav.contact':  { en: 'Contact',  hi: 'संपर्क' },
    'nav.donate_now':      { en: '💰 Donate Now',      hi: '💰 अभी दान करें' },
    'nav.accounts_portal': { en: '📊 Accounts Portal', hi: '📊 लेखा पोर्टल' },

    // HERO (index)
    'hero.badge':    { en: '॥ Har Har Mahadev ॥', hi: '॥ हर हर महादेव ॥' },
    'hero.subtitle': { en: 'Bishaul Tatuar, Darbhanga, Bihar — Ancient Siddha Peeth of Mithila', hi: 'बिशौल टटुआर, दरभंगा, बिहार — मिथिला का प्राचीन सिद्धपीठ' },
    'hero.btn.about':  { en: 'Know About Temple', hi: 'मंदिर के बारे में जानें' },
    'hero.btn.donate': { en: 'Donate 🙏',          hi: 'दान करें 🙏' },

    // LIVE COUNTER
    'lc.title':    { en: 'Transparent Financial Report', hi: 'पारदर्शी वित्तीय विवरण' },
    'lc.subtitle': { en: 'Shivratri Puja Samiti, Bishoul Tatuar — Annual Income & Expense 2026-27', hi: 'शिवरात्रि पूजा समिति, बिशौल टटुआर — वार्षिक आय-व्यय 2026-27' },
    'lc.income':   { en: 'Total Income',    hi: 'कुल आय' },
    'lc.expense':  { en: 'Total Expense',   hi: 'कुल व्यय' },
    'lc.balance':  { en: 'Current Balance', hi: 'शेष राशि' },
    'lc.btn':      { en: '📊 View Detailed Accounts', hi: '📊 विस्तृत लेखा देखें' },

    // STATS
    'stats.history':   { en: 'Years of History',          hi: 'वर्षों का इतिहास' },
    'stats.mahashiv':  { en: 'Mahashivratri Celebrations', hi: 'महाशिवरात्रि समारोह' },
    'stats.devotees':  { en: 'Devotees Every Year',        hi: 'प्रतिवर्ष श्रद्धालु' },
    'stats.idols':     { en: 'Sacred Divine Idols',        hi: 'पवित्र दिव्य मूर्तियाँ' },

    // SECTIONS
    'section.highlights': { en: 'Temple Highlights', hi: 'मंदिर की विशेषताएँ' },
    'section.gallery':    { en: 'Temple Gallery',    hi: 'मंदिर गैलरी' },
    'section.gallery.btn':{ en: 'View Full Gallery →', hi: 'पूरी गैलरी देखें →' },
    'section.donate.title': { en: 'Your donation is the strength of the temple 🙏', hi: 'आपका दान मंदिर की शक्ति है 🙏' },
    'section.donate.sub':   { en: 'Support temple development, Mahashivratri festival & daily puja expenses', hi: 'मंदिर विकास, महाशिवरात्रि महोत्सव और दैनिक पूजा व्यय में सहयोग करें' },
    'section.donate.btn':   { en: 'Donate Now',   hi: 'अभी दान करें' },
    'section.donate.wa':    { en: '📲 WhatsApp Us', hi: '📲 WhatsApp करें' },

    // FOOTER
    'footer.links':   { en: 'Quick Links',   hi: 'त्वरित लिंक' },
    'footer.contact': { en: 'Contact',       hi: 'संपर्क' },
    'footer.timings': { en: 'Puja Timings',  hi: 'पूजा समय' },
    'footer.morning': { en: '🌅 Morning Puja — 6:00 AM',  hi: '🌅 प्रातः पूजा — 6:00 AM' },
    'footer.evening': { en: '🌇 Evening Aarti — 7:00 PM', hi: '🌇 संध्या आरती — 7:00 PM' },
    'footer.night':   { en: '🌙 Shayan Aarti — 9:00 PM',  hi: '🌙 शयन आरती — 9:00 PM' },
    'footer.copy':    { en: '© 2025 Shree Sidheswar Nath Mandir, Bishoul Tatuar, Darbhanga, Bihar. All rights reserved.',
                        hi: '© 2025 श्री सिद्धेश्वर नाथ मंदिर, बिशौल टटुआर, दरभंगा, बिहार। सर्वाधिकार सुरक्षित।' },
  };

  // ── Getters ─────────────────────────────────────────
  function getLang()          { return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; }
  function setLang(lang)      { localStorage.setItem(STORAGE_KEY, lang); }
  function t(key)             { const e = translations[key]; return e ? (e[getLang()] || e.en) : key; }

  // ── Apply translations to DOM ────────────────────────
  function applyAll() {
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      const attr = el.getAttribute('data-lang-attr');
      const val = t(key);
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });

    // Update switcher button states
    const lang = getLang();
    document.querySelectorAll('.lang-sw-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Set html lang attribute
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }

  // ── Switch ───────────────────────────────────────────
  function switchTo(lang) {
    setLang(lang);
    applyAll();
  }

  // ── Inject switcher widget into navbar ───────────────
  function injectSwitcher() {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) return;

    const li = document.createElement('li');
    li.className = 'nav-item ms-2 d-flex align-items-center';
    li.innerHTML = `
      <div class="lang-switcher-widget">
        <button class="lang-sw-option" data-lang="en" onclick="LangSwitch.switchTo('en')">EN</button>
        <span class="lang-sw-sep">|</span>
        <button class="lang-sw-option" data-lang="hi" onclick="LangSwitch.switchTo('hi')">हि</button>
      </div>`;
    nav.appendChild(li);
  }

  // ── Init ─────────────────────────────────────────────
  function init() {
    injectSwitcher();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { switchTo, t, getLang };

})();

*/