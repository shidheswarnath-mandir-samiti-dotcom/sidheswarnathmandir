/* =====================================================
   MAHADEV AI — Chat Interface (UI Only)
   No AI logic. No API. No backend.
   ===================================================== */

(function () {
  'use strict';

  /* ── DOM INJECT ── */
  function injectHTML() {
    const html = `
    <!-- MAHADEV AI FAB -->
    <button class="mahadev-fab" id="mFab" aria-label="Open Mahadev AI">
      <span class="mahadev-fab-emoji">🕉️</span>
    </button>
    <div class="mahadev-fab-tooltip" id="mTooltip">महादेव AI से पूछें</div>

    <!-- OVERLAY -->
    <div class="mahadev-overlay" id="mOverlay" onclick="MahadevAI.close()"></div>

    <!-- CHAT WINDOW -->
    <div class="mahadev-chat" id="mChat" role="dialog" aria-label="Mahadev AI Chat">

      <!-- HEADER -->
      <div class="mahadev-header">
        <div class="mahadev-avatar">🕉️</div>
        <div class="mahadev-header-info">
          <div class="mahadev-header-name">महादेव AI</div>
          <div class="mahadev-header-sub">
            <span class="mahadev-status-dot"></span>
            Online · मंदिर सहायक
          </div>
        </div>
        <button class="mahadev-close" id="mClose" aria-label="Close chat">✕</button>
      </div>

      <!-- MESSAGES -->
      <div class="mahadev-messages" id="mMessages">
        <!-- Welcome message injected by JS -->
      </div>

      <!-- QUICK SUGGESTIONS -->
      <div class="mahadev-suggestions" id="mSuggestions">
        <button class="suggestion-chip" onclick="MahadevAI.suggest(this)">🛕 मंदिर का इतिहास</button>
        <button class="suggestion-chip" onclick="MahadevAI.suggest(this)">⏰ पूजा का समय</button>
        <button class="suggestion-chip" onclick="MahadevAI.suggest(this)">💰 दान कैसे करें</button>
        <button class="suggestion-chip" onclick="MahadevAI.suggest(this)">📍 मंदिर का पता</button>
        <button class="suggestion-chip" onclick="MahadevAI.suggest(this)">🔱 शिव चालीसा</button>
      </div>

      <!-- INPUT AREA -->
      <div class="mahadev-input-area">
        <div class="mahadev-input-wrap">
          <textarea
            class="mahadev-input"
            id="mInput"
            placeholder="अपना प्रश्न यहाँ लिखें..."
            rows="1"
            aria-label="Type your message"
          ></textarea>
          <button class="mahadev-mic" id="mMic" title="Voice input (coming soon)" aria-label="Voice input">
            🎤
          </button>
        </div>
        <button class="mahadev-send" id="mSend" aria-label="Send message">
          ➤
        </button>
      </div>

      <!-- POWERED BY -->
      <div class="mahadev-footer">
        🕉️ Powered by Mahadev AI · श्री सिद्धेश्वर नाथ मंदिर
      </div>

    </div>`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
  }

  /* ── WELCOME MESSAGE ── */
  function addWelcomeMessage() {
    const messages = document.getElementById('mMessages');
    if (!messages) return;

    const now = getCurrentTime();

    const welcomeHTML = `
      <div class="mahadev-msg ai">
        <div class="mahadev-msg-avatar">🕉️</div>
        <div>
          <div class="mahadev-bubble">
            <div class="welcome-title">नमः शिवाय 🙏</div>
            <div class="welcome-text">
              मैं <strong>महादेव AI</strong> हूँ।<br>
              आप मंदिर से संबंधित कोई भी प्रश्न पूछ सकते हैं।
            </div>
          </div>
        </div>
        <div class="mahadev-msg-time">${now}</div>
      </div>`;

    messages.innerHTML = welcomeHTML;
  }

  /* ── HELPERS ── */
  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function scrollToBottom() {
    const messages = document.getElementById('mMessages');
    if (messages) {
      setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
      }, 50);
    }
  }

  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }

  /* ── ADD MESSAGE TO CHAT ── */
  function addMessage(text, sender) {
    const messages = document.getElementById('mMessages');
    if (!messages) return;

    const now = getCurrentTime();
    const isUser = sender === 'user';
    const content = isUser ? escapeHTML(text) : text; // AI replies may contain safe inline HTML from knowledge-base.js

    const msgHTML = `
      <div class="mahadev-msg ${isUser ? 'user' : 'ai'}">
        ${!isUser ? '<div class="mahadev-msg-avatar">🕉️</div>' : ''}
        <div class="mahadev-bubble">${content}</div>
        ${isUser ? '<div class="mahadev-msg-avatar user-av">👤</div>' : ''}
        <div class="mahadev-msg-time">${now}</div>
      </div>`;

    messages.insertAdjacentHTML('beforeend', msgHTML);
    scrollToBottom();
  }

  /* ── TYPING INDICATOR ── */
  function showTyping() {
    const messages = document.getElementById('mMessages');
    if (!messages) return;

    const typingHTML = `
      <div class="mahadev-typing" id="mTyping">
        <div class="mahadev-msg-avatar">🕉️</div>
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;

    messages.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom();
  }

  function hideTyping() {
    const typing = document.getElementById('mTyping');
    if (typing) typing.remove();
  }

  /* ── RESPONSE: MEMBER QUERY → FINANCIAL DATA → STATIC KNOWLEDGE BASE ── */
  async function placeholderResponse(userText) {
    showTyping();

    let reply = null;

    // 1. Try a specific member's contribution first (most specific intent)
    if (typeof MemberQueryHandler !== 'undefined') {
      try {
        reply = await MemberQueryHandler.handleMemberQuery(userText);
      } catch (err) {
        console.error('[MahadevAI] Member query failed:', err);
      }
    }

    // 2. Try general live financial data (totals, lists)
    if (!reply && typeof FinancialQueryHandler !== 'undefined') {
      try {
        reply = await FinancialQueryHandler.handleFinancialQuery(userText);
      } catch (err) {
        console.error('[MahadevAI] Financial query failed:', err);
      }
    }

    // 3. Fall back to static knowledge base
    if (!reply && typeof searchKnowledgeBase === 'function') {
      reply = searchKnowledgeBase(userText);
    }

    hideTyping();

    if (reply) {
      addMessage(reply, 'ai');
    } else {
      addMessage(
        'क्षमा करें, मुझे इसका उत्तर अभी नहीं पता। 🙏<br>कृपया हमें WhatsApp पर संपर्क करें: <strong>+91 92968 60221</strong>',
        'ai'
      );
    }
  }

  /* ── SEND MESSAGE ── */
  function sendMessage() {
    const input = document.getElementById('mInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';

    placeholderResponse(text);
  }

  /* ── ESCAPE HTML ── */
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  /* ── PUBLIC API ── */
  window.MahadevAI = {

    open: function () {
      document.getElementById('mChat').classList.add('open');
      document.getElementById('mOverlay').classList.add('open');
      document.getElementById('mFab').style.display = 'none';
      document.getElementById('mTooltip').style.display = 'none';
      document.getElementById('mInput').focus();
      scrollToBottom();
    },

    close: function () {
      document.getElementById('mChat').classList.remove('open');
      document.getElementById('mOverlay').classList.remove('open');
      document.getElementById('mFab').style.display = 'flex';
      document.getElementById('mTooltip').style.display = '';
    },

    suggest: function (btn) {
      const text = btn.textContent.trim();
      const input = document.getElementById('mInput');
      if (input) {
        input.value = text;
        input.focus();
      }
    }
  };

  /* ── INIT ── */
  function init() {
    injectHTML();
    addWelcomeMessage();

    /* FAB click */
    document.getElementById('mFab').addEventListener('click', MahadevAI.open);

    /* Close button */
    document.getElementById('mClose').addEventListener('click', MahadevAI.close);

    /* Send button */
    document.getElementById('mSend').addEventListener('click', sendMessage);

    /* Enter key (Shift+Enter = new line) */
    document.getElementById('mInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    /* Auto-resize textarea */
    document.getElementById('mInput').addEventListener('input', function () {
      autoResizeTextarea(this);
    });

    /* Mic button — no functionality yet */
    document.getElementById('mMic').addEventListener('click', function () {
      this.style.color = '#ff6600';
      setTimeout(() => { this.style.color = ''; }, 600);
    });

    /* Escape key closes chat */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.getElementById('mChat').classList.contains('open')) {
          MahadevAI.close();
        }
      }
    });
  }

  /* Run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();