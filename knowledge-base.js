/* =====================================================
   MAHADEV AI — KNOWLEDGE BASE
   Offline, modular temple information store
   No AI API. No backend. Pure JS data + simple matcher.
   ===================================================== */

const MAHADEV_KNOWLEDGE = {

  /* ===================== TEMPLE INFORMATION ===================== */
  templeInfo: {
    keywords: ['मंदिर', 'temple', 'naam', 'name', 'kaunsa', 'sidheswar', 'siddheshwar', 'shiv mandir', 'parichay', 'introduction'],
    response: `🛕 <strong>श्री सिद्धेश्वर नाथ मंदिर</strong><br><br>
यह बिशौल टटुआर, दरभंगा, बिहार में स्थित मिथिला का एक प्राचीन सिद्धपीठ है। यह मंदिर भगवान शिव, माता पार्वती और भगवान गणेश को समर्पित है।<br><br>
स्थापना: शाके 1763, पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा।`
  },

  /* ===================== TEMPLE HISTORY ===================== */
  templeHistory: {
    keywords: ['itihas', 'history', 'sthapna', 'kab bana', 'kisne banaya', 'founder', 'sthapit', 'puratan', 'prachin', 'kahani'],
    response: `📜 <strong>मंदिर का इतिहास</strong><br><br>
बाबा सिद्धेश्वर नाथ मंदिर की स्थापना शाके 1763 में पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा की गई थी। समय के साथ मंदिर जीर्ण हो गया था, लेकिन श्री विद्यानंद झा के नेतृत्व में 1990-92 में इसका पुनरुद्धार हुआ। 1992 से महाशिवरात्रि महोत्सव भव्य रूप से मनाया जा रहा है।<br><br>
पूरा इतिहास पढ़ने के लिए "About" पेज पर जाएं।`
  },

  /* ===================== DAILY AARTI TIMINGS ===================== */
  aartiTimings: {
    keywords: ['aarti', 'puja time', 'samay', 'timing', 'kab khulta', 'kab band', 'darshan time', 'pooja ka samay', 'shayan'],
    response: `🪔 <strong>पूजा एवं आरती का समय</strong><br><br>
🌅 प्रातः पूजा — सुबह 6:00 बजे<br>
☀️ मध्याह्न पूजा — दोपहर 12:00 बजे<br>
🌇 संध्या आरती — शाम 7:00 बजे<br>
🌙 शयन आरती — रात 9:00 बजे<br><br>
🎉 महाशिवरात्रि पर विशेष रात्रिभर आयोजन होता है।`
  },

  /* ===================== TEMPLE ADDRESS ===================== */
  templeAddress: {
    keywords: ['address', 'pata', 'location', 'kaha hai', 'kaise pahuche', 'kaise jaye', 'direction', 'gaon', 'village', 'darbhanga'],
    response: `📍 <strong>मंदिर का पता</strong><br><br>
श्री सिद्धेश्वर नाथ मंदिर<br>
बिशौल टटुआर (Bishoul Tatuar)<br>
दरभंगा, बिहार<br><br>
🚂 निकटतम रेलवे स्टेशन: दरभंगा जंक्शन (~35-40 किमी)<br>
🛣️ दरभंगा शहर से ऑटो/टैक्सी आसानी से उपलब्ध है।<br><br>
Map देखने के लिए "Contact" पेज पर जाएं।`
  },

  /* ===================== CONTACT INFORMATION ===================== */
  contactInfo: {
    keywords: ['contact', 'sampark', 'phone', 'number', 'whatsapp', 'email', 'call', 'baat karni hai'],
    response: `📞 <strong>संपर्क जानकारी</strong><br><br>
📱 फोन/WhatsApp: +91 92968 60221<br>
📧 ईमेल: mandir@gmail.com<br>
⏰ उपलब्धता: सुबह 6 बजे से रात 9 बजे तक<br><br>
तुरंत सहायता के लिए WhatsApp बटन का उपयोग करें (नीचे दाईं ओर)।`
  },

  /* ===================== DONATION INFORMATION ===================== */
  donationInfo: {
    keywords: ['donation', 'daan', 'chanda', 'paisa kaise de', 'upi', 'qr', 'bank', 'donate', 'contribution kaise kare'],
    response: `🙏 <strong>दान कैसे करें</strong><br><br>
आप निम्न तरीकों से दान कर सकते हैं:<br>
📱 UPI / QR कोड स्कैन करके<br>
🏦 बैंक ट्रांसफर (NEFT/IMPS)<br><br>
दान के बाद कृपया WhatsApp पर स्क्रीनशॉट भेजें ताकि हम पुष्टि कर सकें।<br><br>
पूरी जानकारी के लिए "Donation" पेज पर जाएं।`
  },

  /* ===================== ACCOUNTS / TRANSPARENCY ===================== */
  accountsInfo: {
    keywords: ['accounts', 'hisab', 'income', 'expense', 'kharch', 'aay', 'vyay', 'transparency', 'paisa kaha gaya', 'balance', 'shesh rashi'],
    response: `📊 <strong>आय-व्यय पारदर्शिता</strong><br><br>
मंदिर की सम्पूर्ण वित्तीय जानकारी (आय, व्यय, शेष राशि) पारदर्शिता हेतु सार्वजनिक रूप से उपलब्ध है।<br><br>
विस्तृत विवरण देखने के लिए "Accounts Portal" में लॉगिन करें (Donation मेन्यू में मिलेगा)। यह पूरी तरह नि:शुल्क और खुला है — कोई भी देख सकता है।`
  },

  /* ===================== DIGITAL LIBRARY ===================== */
  digitalLibrary: {
    keywords: ['library', 'pustakalay', 'chalisa', 'aarti path', 'mantra', 'stotra', 'bhajan', 'shiv chalisa', 'hanuman chalisa'],
    response: `📚 <strong>धार्मिक पुस्तकालय (Library)</strong><br><br>
हमारी वेबसाइट पर एक डिजिटल लाइब्रेरी है जिसमें मिलेगा:<br>
📖 चालीसा (Chalisa)<br>
🪔 आरती (Aarti)<br>
🕉️ मंत्र (Mantra)<br>
📜 स्तोत्र (Stotra)<br>
🎶 भजन (Bhajan)<br><br>
यह हिंदी और मैथिली दोनों भाषाओं में उपलब्ध है। "Library" मेन्यू में जाएं।`
  },

  /* ===================== MAHASHIVRATRI 2026 ARCHIVE ===================== */
  mahashivratriArchive: {
    keywords: ['mahashivratri', 'shivratri 2026', 'festival report', 'mahotsav', 'page wise', 'donation record pdf', 'expense pdf'],
    response: `🕉️ <strong>महाशिवरात्रि 2026 रिपोर्ट</strong><br><br>
महाशिवरात्रि 2026 का सम्पूर्ण वित्तीय विवरण, पृष्ठवार सत्यापन तथा PDF अभिलेख पारदर्शिता हेतु उपलब्ध हैं।<br><br>
देखने के लिए होम पेज पर "🕉️ Mahashivratri 2026 Report" कार्ड पर क्लिक करें।`
  },

  /* ===================== FAQs ===================== */
  faqs: {
    keywords: ['faq', 'sawal', 'puja booking', 'special puja', 'rudrabhishek', 'jalabhishek booking', 'volunteer', 'seva'],
    response: `❓ <strong>अक्सर पूछे जाने वाले प्रश्न</strong><br><br>
🛕 विशेष पूजा/अभिषेक बुक करने हेतु WhatsApp पर संपर्क करें।<br>
🚗 आने-जाने की जानकारी "Contact" पेज पर FAQ सेक्शन में उपलब्ध है।<br><br>
अधिक प्रश्नों के लिए सीधे WhatsApp करें: +91 92968 60221`
  }

};

/* =====================================================
   SIMPLE KEYWORD MATCHER
   Matches user input against all knowledge sections.
   No AI, no API — pure string matching.
   ===================================================== */
function searchKnowledgeBase(userText) {
  if (!userText) return null;

  const query = userText.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const key in MAHADEV_KNOWLEDGE) {
    const section = MAHADEV_KNOWLEDGE[key];
    let score = 0;

    section.keywords.forEach(keyword => {
      if (query.includes(keyword.toLowerCase())) {
        score += keyword.length; // longer/more specific keyword = higher weight
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = section.response;
    }
  }

  return bestMatch; // null if nothing matched
}