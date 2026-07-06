/* =====================================================
   MAHADEV AI — KNOWLEDGE BASE (Multilingual — Task K-010)
   Offline, modular temple information store
   No AI API. No backend. Pure JS data + simple matcher.
   ===================================================== */

const MAHADEV_KNOWLEDGE = {

  /* ===================== TEMPLE INFORMATION ===================== */
  templeInfo: {
    keywords: ['मंदिर', 'temple', 'naam', 'name', 'kaunsa', 'sidheswar', 'siddheshwar', 'shiv mandir', 'parichay', 'introduction', 'about temple', 'which temple'],
    response: {
      hindi: `🛕 <strong>श्री सिद्धेश्वर नाथ मंदिर</strong><br><br>
यह बिशौल टटुआर, दरभंगा, बिहार में स्थित मिथिला का एक प्राचीन सिद्धपीठ है। यह मंदिर भगवान शिव, माता पार्वती और भगवान गणेश को समर्पित है।<br><br>
स्थापना: शाके 1763, पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा।`,
      english: `🛕 <strong>Shri Sidheswar Nath Mandir</strong><br><br>
This is an ancient Siddha Peeth of Mithila, located in Bishoul Tatuar, Darbhanga, Bihar. The temple is dedicated to Lord Shiva, Goddess Parvati and Lord Ganesha.<br><br>
Established: Shaka 1763, by Pandit Shri Sidheswar Nath Mishra.`,
      maithili: `🛕 <strong>श्री सिद्धेश्वर नाथ मंदिर</strong><br><br>
ई मिथिलाक बिशौल टटुआर, दरभंगा, बिहारमे अवस्थित एकटा प्राचीन सिद्धपीठ थिक। ई मंदिर भगवान शिव, माता पार्वती आ भगवान गणेशकेँ समर्पित अछि।<br><br>
स्थापना: शाके 1763, पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा।`
    }
  },

  /* ===================== TEMPLE HISTORY ===================== */
  templeHistory: {
    keywords: ['itihas', 'history', 'sthapna', 'kab bana', 'kisne banaya', 'founder', 'sthapit', 'puratan', 'prachin', 'kahani', 'story', 'when built', 'who built'],
    response: {
      hindi: `📜 <strong>मंदिर का इतिहास</strong><br><br>
बाबा सिद्धेश्वर नाथ मंदिर की स्थापना शाके 1763 में पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा की गई थी। समय के साथ मंदिर जीर्ण हो गया था, लेकिन श्री विद्यानंद झा के नेतृत्व में 1990-92 में इसका पुनरुद्धार हुआ। 1992 से महाशिवरात्रि महोत्सव भव्य रूप से मनाया जा रहा है।<br><br>
पूरा इतिहास पढ़ने के लिए "About" पेज पर जाएं।`,
      english: `📜 <strong>Temple History</strong><br><br>
Baba Sidheswar Nath Mandir was established in Shaka 1763 by Pandit Shri Sidheswar Nath Mishra. Over time the temple fell into disrepair, but it was restored between 1990-92 under the leadership of Shri Vidyanand Jha. Since 1992, Mahashivratri has been celebrated grandly every year.<br><br>
Visit the "About" page for the full history.`,
      maithili: `📜 <strong>मंदिरक इतिहास</strong><br><br>
बाबा सिद्धेश्वर नाथ मंदिरक स्थापना शाके 1763 मे पंडित श्री सिद्धेश्वर नाथ मिश्र द्वारा कएल गेल छल। समयक संग मंदिर जर्जर भ' गेल छल, मुदा श्री विद्यानंद झाक नेतृत्वमे 1990-92 मे एकर जीर्णोद्धार भेल। 1992 सँ महाशिवरात्रि महोत्सव भव्य रूपसँ मनाओल जाइत अछि।<br><br>
पूरा इतिहास पढ़बाक लेल "About" पेज पर जाउ।`
    }
  },

  /* ===================== DAILY AARTI TIMINGS ===================== */
  aartiTimings: {
    keywords: ['aarti', 'puja time', 'samay', 'timing', 'kab khulta', 'kab band', 'darshan time', 'pooja ka samay', 'shayan', 'opening time', 'closing time'],
    response: {
      hindi: `🪔 <strong>पूजा एवं आरती का समय</strong><br><br>
🌅 प्रातः पूजा — सुबह 6:00 बजे<br>
☀️ मध्याह्न पूजा — दोपहर 12:00 बजे<br>
🌇 संध्या आरती — शाम 7:00 बजे<br>
🌙 शयन आरती — रात 9:00 बजे<br><br>
🎉 महाशिवरात्रि पर विशेष रात्रिभर आयोजन होता है।`,
      english: `🪔 <strong>Puja &amp; Aarti Timings</strong><br><br>
🌅 Morning Puja — 6:00 AM<br>
☀️ Midday Puja — 12:00 PM<br>
🌇 Evening Aarti — 7:00 PM<br>
🌙 Night Aarti — 9:00 PM<br><br>
🎉 A special all-night celebration is held on Mahashivratri.`,
      maithili: `🪔 <strong>पूजा आ आरतीक समय</strong><br><br>
🌅 प्रातः पूजा — भोर 6:00 बजे<br>
☀️ मध्याह्न पूजा — दुपहरिया 12:00 बजे<br>
🌇 संध्या आरती — साँझ 7:00 बजे<br>
🌙 शयन आरती — राति 9:00 बजे<br><br>
🎉 महाशिवरात्रि पर विशेष रातिभर आयोजन होइत अछि।`
    }
  },

  /* ===================== TEMPLE ADDRESS ===================== */
  templeAddress: {
    keywords: ['address', 'pata', 'location', 'kaha hai', 'kaise pahuche', 'kaise jaye', 'direction', 'gaon', 'village', 'darbhanga', 'where is', 'how to reach'],
    response: {
      hindi: `📍 <strong>मंदिर का पता</strong><br><br>
श्री सिद्धेश्वर नाथ मंदिर<br>
बिशौल टटुआर (Bishoul Tatuar)<br>
दरभंगा, बिहार<br><br>
🚂 निकटतम रेलवे स्टेशन: दरभंगा जंक्शन (~35-40 किमी)<br>
🛣️ दरभंगा शहर से ऑटो/टैक्सी आसानी से उपलब्ध है।<br><br>
Map देखने के लिए "Contact" पेज पर जाएं।`,
      english: `📍 <strong>Temple Address</strong><br><br>
Shri Sidheswar Nath Mandir<br>
Bishoul Tatuar<br>
Darbhanga, Bihar<br><br>
🚂 Nearest Railway Station: Darbhanga Junction (~35-40 km)<br>
🛣️ Auto/taxi easily available from Darbhanga city.<br><br>
Visit the "Contact" page to see the map.`,
      maithili: `📍 <strong>मंदिरक पता</strong><br><br>
श्री सिद्धेश्वर नाथ मंदिर<br>
बिशौल टटुआर<br>
दरभंगा, बिहार<br><br>
🚂 सबसँ नजदीकी रेलवे स्टेशन: दरभंगा जंक्शन (~35-40 किमी)<br>
🛣️ दरभंगा शहरसँ ऑटो/टैक्सी सहजतासँ भेटैत अछि।<br><br>
Map देखबाक लेल "Contact" पेज पर जाउ।`
    }
  },

  /* ===================== CONTACT INFORMATION ===================== */
  contactInfo: {
    keywords: ['contact', 'sampark', 'phone', 'number', 'whatsapp', 'email', 'call', 'baat karni hai', 'reach you'],
    response: {
      hindi: `📞 <strong>संपर्क जानकारी</strong><br><br>
📱 फोन/WhatsApp: +91 92968 60221<br>
📧 ईमेल: mandir@gmail.com<br>
⏰ उपलब्धता: सुबह 6 बजे से रात 9 बजे तक<br><br>
तुरंत सहायता के लिए WhatsApp बटन का उपयोग करें (नीचे दाईं ओर)।`,
      english: `📞 <strong>Contact Information</strong><br><br>
📱 Phone/WhatsApp: +91 92968 60221<br>
📧 Email: mandir@gmail.com<br>
⏰ Available: 6:00 AM to 9:00 PM daily<br><br>
For instant help, use the WhatsApp button (bottom right).`,
      maithili: `📞 <strong>संपर्क जानकारी</strong><br><br>
📱 फोन/WhatsApp: +91 92968 60221<br>
📧 ईमेल: mandir@gmail.com<br>
⏰ उपलब्धता: भोर 6 बजेसँ राति 9 बजे धरि<br><br>
तुरंत मदति लेल WhatsApp बटनक उपयोग करू (नीचाँ दहिना कात)।`
    }
  },

  /* ===================== DONATION INFORMATION ===================== */
  donationInfo: {
    keywords: ['donation', 'daan', 'chanda', 'paisa kaise de', 'upi', 'qr', 'bank', 'donate', 'contribution kaise kare', 'how to donate'],
    response: {
      hindi: `🙏 <strong>दान कैसे करें</strong><br><br>
आप निम्न तरीकों से दान कर सकते हैं:<br>
📱 UPI / QR कोड स्कैन करके<br>
🏦 बैंक ट्रांसफर (NEFT/IMPS)<br><br>
दान के बाद कृपया WhatsApp पर स्क्रीनशॉट भेजें ताकि हम पुष्टि कर सकें।<br><br>
पूरी जानकारी के लिए "Donation" पेज पर जाएं।`,
      english: `🙏 <strong>How to Donate</strong><br><br>
You can donate in the following ways:<br>
📱 UPI / by scanning the QR code<br>
🏦 Bank Transfer (NEFT/IMPS)<br><br>
After donating, please send the screenshot on WhatsApp so we can confirm it.<br><br>
Visit the "Donation" page for full details.`,
      maithili: `🙏 <strong>दान केना करू</strong><br><br>
अहाँ ई तरीकासँ दान क' सकैत छी:<br>
📱 UPI / QR कोड स्कैन क'क'<br>
🏦 बैंक ट्रांसफर (NEFT/IMPS)<br><br>
दानक बाद कृपया WhatsApp पर स्क्रीनशॉट पठाउ ताकि हम पुष्टि क' सकी।<br><br>
पूरा जानकारीक लेल "Donation" पेज पर जाउ।`
    }
  },

  /* ===================== ACCOUNTS / TRANSPARENCY ===================== */
  accountsInfo: {
    keywords: ['accounts', 'hisab', 'income', 'expense', 'kharch', 'aay', 'vyay', 'transparency', 'paisa kaha gaya', 'balance', 'shesh rashi'],
    response: {
      hindi: `📊 <strong>आय-व्यय पारदर्शिता</strong><br><br>
मंदिर की सम्पूर्ण वित्तीय जानकारी (आय, व्यय, शेष राशि) पारदर्शिता हेतु सार्वजनिक रूप से उपलब्ध है।<br><br>
विस्तृत विवरण देखने के लिए "Accounts Portal" में लॉगिन करें (Donation मेन्यू में मिलेगा)। यह पूरी तरह नि:शुल्क और खुला है — कोई भी देख सकता है।`,
      english: `📊 <strong>Income-Expense Transparency</strong><br><br>
The temple's complete financial details (income, expense, balance) are publicly available for transparency.<br><br>
To see the full breakdown, log in to the "Accounts Portal" (found in the Donation menu). It's completely free and open — anyone can view it.`,
      maithili: `📊 <strong>आय-व्यय पारदर्शिता</strong><br><br>
मंदिरक पूरा वित्तीय विवरण (आय, व्यय, शेष राशि) पारदर्शिताक लेल सार्वजनिक रूपसँ उपलब्ध अछि।<br><br>
विस्तृत विवरण देखबाक लेल "Accounts Portal" मे लॉगिन करू (Donation मेन्यूमे भेटत)। ई पूरी तरहेँ नि:शुल्क आ खुला अछि — केओ सेहो देखि सकैत अछि।`
    }
  },

  /* ===================== DIGITAL LIBRARY ===================== */
  digitalLibrary: {
    keywords: ['library', 'pustakalay', 'chalisa', 'aarti path', 'mantra', 'stotra', 'bhajan', 'shiv chalisa', 'hanuman chalisa'],
    response: {
      hindi: `📚 <strong>धार्मिक पुस्तकालय (Library)</strong><br><br>
हमारी वेबसाइट पर एक डिजिटल लाइब्रेरी है जिसमें मिलेगा:<br>
📖 चालीसा (Chalisa)<br>
🪔 आरती (Aarti)<br>
🕉️ मंत्र (Mantra)<br>
📜 स्तोत्र (Stotra)<br>
🎶 भजन (Bhajan)<br><br>
यह हिंदी और मैथिली दोनों भाषाओं में उपलब्ध है। "Library" मेन्यू में जाएं।`,
      english: `📚 <strong>Digital Library</strong><br><br>
Our website has a digital library where you'll find:<br>
📖 Chalisa<br>
🪔 Aarti<br>
🕉️ Mantra<br>
📜 Stotra<br>
🎶 Bhajan<br><br>
Available in both Hindi and Maithili. Go to the "Library" menu.`,
      maithili: `📚 <strong>धार्मिक पुस्तकालय (Library)</strong><br><br>
हमर वेबसाइट पर एकटा डिजिटल लाइब्रेरी अछि जाहिमे भेटत:<br>
📖 चालीसा<br>
🪔 आरती<br>
🕉️ मंत्र<br>
📜 स्तोत्र<br>
🎶 भजन<br><br>
ई हिंदी आ मैथिली दुनू भाषामे उपलब्ध अछि। "Library" मेन्यूमे जाउ।`
    }
  },

  /* ===================== MAHASHIVRATRI 2026 ARCHIVE ===================== */
  mahashivratriArchive: {
    keywords: ['mahashivratri', 'shivratri 2026', 'festival report', 'mahotsav', 'page wise', 'donation record pdf', 'expense pdf'],
    response: {
      hindi: `🕉️ <strong>महाशिवरात्रि 2026 रिपोर्ट</strong><br><br>
महाशिवरात्रि 2026 का सम्पूर्ण वित्तीय विवरण, पृष्ठवार सत्यापन तथा PDF अभिलेख पारदर्शिता हेतु उपलब्ध हैं।<br><br>
देखने के लिए होम पेज पर "🕉️ Mahashivratri 2026 Report" कार्ड पर क्लिक करें।`,
      english: `🕉️ <strong>Mahashivratri 2026 Report</strong><br><br>
The complete financial details, page-wise verification, and archived PDFs for Mahashivratri 2026 are available for transparency.<br><br>
Click the "🕉️ Mahashivratri 2026 Report" card on the home page to view it.`,
      maithili: `🕉️ <strong>महाशिवरात्रि 2026 रिपोर्ट</strong><br><br>
महाशिवरात्रि 2026 क पूरा वित्तीय विवरण, पृष्ठवार सत्यापन तथा PDF अभिलेख पारदर्शिताक लेल उपलब्ध अछि।<br><br>
देखबाक लेल होम पेज पर "🕉️ Mahashivratri 2026 Report" कार्ड पर क्लिक करू।`
    }
  },

  /* ===================== FAQs ===================== */
  faqs: {
    keywords: ['faq', 'sawal', 'puja booking', 'special puja', 'rudrabhishek', 'jalabhishek booking', 'volunteer', 'seva'],
    response: {
      hindi: `❓ <strong>अक्सर पूछे जाने वाले प्रश्न</strong><br><br>
🛕 विशेष पूजा/अभिषेक बुक करने हेतु WhatsApp पर संपर्क करें।<br>
🚗 आने-जाने की जानकारी "Contact" पेज पर FAQ सेक्शन में उपलब्ध है।<br><br>
अधिक प्रश्नों के लिए सीधे WhatsApp करें: +91 92968 60221`,
      english: `❓ <strong>Frequently Asked Questions</strong><br><br>
🛕 To book a special puja/abhishek, please contact us on WhatsApp.<br>
🚗 Travel/directions information is available in the FAQ section on the "Contact" page.<br><br>
For more questions, WhatsApp us directly: +91 92968 60221`,
      maithili: `❓ <strong>अक्सर पूछल जाइबला प्रश्न</strong><br><br>
🛕 विशेष पूजा/अभिषेक बुक करबाक लेल WhatsApp पर संपर्क करू।<br>
🚗 आब-जाबक जानकारी "Contact" पेज पर FAQ सेक्शनमे उपलब्ध अछि।<br><br>
आर प्रश्नक लेल सीधा WhatsApp करू: +91 92968 60221`
    }
  }

};

/* =====================================================
   MULTILINGUAL KEYWORD MATCHER
   -------------------------------------------------------
   Matches user input against all knowledge sections
   (keywords stay language-agnostic — Hindi/English/Hinglish
   mixed together, since people type however they like).

   `lang` param decides WHICH language version of the winning
   section's response gets returned. Falls back to Hindi, then
   English, if the requested language isn't available.

   No AI, no API — pure string matching, same as before.
   ===================================================== */
function searchKnowledgeBase(userText, lang) {
  if (!userText) return null;

  const targetLang = lang || 'hindi';
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

  if (!bestMatch) return null; // nothing matched

  // Return in requested language, fallback to Hindi, then English
  return bestMatch[targetLang] || bestMatch.hindi || bestMatch.english || null;
}