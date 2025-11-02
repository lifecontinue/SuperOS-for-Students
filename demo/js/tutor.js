(function () {
  const stateRef = window.state || (window.state = {});
  window.subtitleState = window.subtitleState || {
    currentText: '',
    fullTranscript: [],
    isExpanded: false,
    isPaused: false,
    currentWordIndex: -1,
    wordHighlights: []
  };
  const subtitleState = window.subtitleState;

  let tutorAgentEl;
  let tutorStreamEl;
  let tutorTranscriptEl;
  let subtitleTextEl;
  let subtitleHighlightEl;
  let actionSheetEl;
  let toggleTutorBtn;
  let toggleVoiceBtn;
  let toggleInputModeBtn;
  let tutorInputAreaEl;
  let tutorStatusTextEl;

  function cacheElements() {
    tutorAgentEl = document.getElementById('tutorAgent');
    tutorStreamEl = document.getElementById('tutorStream');
    tutorTranscriptEl = document.getElementById('tutorTranscript');
    subtitleTextEl = document.getElementById('subtitleText');
    subtitleHighlightEl = document.getElementById('subtitleHighlight');
    actionSheetEl = document.getElementById('tutorActionSheet');
    toggleTutorBtn = document.getElementById('toggleTutor');
    toggleVoiceBtn = document.getElementById('toggleVoice');
    toggleInputModeBtn = document.getElementById('toggleInputMode');
    tutorInputAreaEl = document.getElementById('tutorInputArea');
    tutorStatusTextEl = document.getElementById('tutorStatusText');
  }

  function setStatusText(text) {
    if (tutorStatusTextEl) {
      tutorStatusTextEl.textContent = text;
    }
  }

  function getIdleStatusText() {
    return stateRef.inputMode === 'voice' ? 'AI Tutor · Listening' : 'AI Tutor · Typing';
  }

  function updateSubtitle(text) {
    if (!subtitleTextEl || !tutorStreamEl) return;
    subtitleTextEl.textContent = text;
    const transcriptContent = document.getElementById('transcriptContent');
    if (transcriptContent) {
      const entry = document.createElement('div');
      entry.textContent = text;
      entry.style.marginBottom = '12px';
      transcriptContent.appendChild(entry);
      transcriptContent.scrollTop = transcriptContent.scrollHeight;
    }
    const lineHeight = parseFloat(getComputedStyle(subtitleTextEl).lineHeight || '0');
    if (!Number.isFinite(lineHeight)) return;
    const maxHeight = lineHeight * 3;
    if (subtitleTextEl.scrollHeight > maxHeight) {
      tutorStreamEl.classList.add('has-overflow');
    } else {
      tutorStreamEl.classList.remove('has-overflow');
    }
  }

  function highlightWord(charIndex, charLength) {
    if (!subtitleHighlightEl || !subtitleTextEl) return;
    const text = subtitleTextEl.textContent || '';
    const textNode = subtitleTextEl.firstChild;
    if (!textNode) return;
    const range = document.createRange();
    range.setStart(textNode, charIndex);
    range.setEnd(textNode, charIndex + charLength);
    const rect = range.getBoundingClientRect();
    const containerRect = subtitleTextEl.getBoundingClientRect();
    subtitleHighlightEl.style.left = `${rect.left - containerRect.left}px`;
    subtitleHighlightEl.style.top = `${rect.top - containerRect.top}px`;
    subtitleHighlightEl.style.width = `${rect.width}px`;
    subtitleHighlightEl.style.height = `${rect.height}px`;
    subtitleHighlightEl.classList.add('active');
    setTimeout(() => subtitleHighlightEl.classList.remove('active'), 200);
  }

  function toggleTranscript() {
    if (!tutorTranscriptEl || !tutorStreamEl) return;
    subtitleState.isExpanded = !subtitleState.isExpanded;
    tutorTranscriptEl.classList.toggle('hidden', !subtitleState.isExpanded);
    tutorStreamEl.classList.toggle('expanded', subtitleState.isExpanded);
    tutorStreamEl.setAttribute('aria-expanded', String(subtitleState.isExpanded));
  }

  function showActionSheet() {
    actionSheetEl?.classList.remove('hidden');
  }

  function hideActionSheet() {
    actionSheetEl?.classList.add('hidden');
  }

  function bindToggleTutor() {
    if (!toggleTutorBtn) return;
    const clone = toggleTutorBtn.cloneNode(true);
    toggleTutorBtn.parentNode.replaceChild(clone, toggleTutorBtn);
    toggleTutorBtn = clone;
    toggleTutorBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!tutorStreamEl) return;
      const hidden = tutorStreamEl.classList.toggle('hidden');
      toggleTutorBtn.textContent = hidden ? 'Show' : 'Hide';
    });
  }

  function bindSubtitleInteractions() {
    if (!tutorStreamEl) return;
    let longPressTimer = null;
    tutorStreamEl.addEventListener('click', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      toggleTranscript();
    });
    tutorStreamEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTranscript();
      }
    });
    tutorStreamEl.addEventListener('touchstart', () => {
      longPressTimer = setTimeout(() => {
        showActionSheet();
        longPressTimer = null;
      }, 500);
    });
    tutorStreamEl.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    tutorStreamEl.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      longPressTimer = setTimeout(() => {
        showActionSheet();
        longPressTimer = null;
      }, 500);
    });
    tutorStreamEl.addEventListener('mouseup', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    tutorStreamEl.addEventListener('mouseleave', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    tutorStreamEl.addEventListener('touchstart', (event) => {
      subtitleState.touchStartY = event.changedTouches[0].screenY;
    });
    tutorStreamEl.addEventListener('touchend', (event) => {
      const threshold = 50;
      const diff = subtitleState.touchStartY - event.changedTouches[0].screenY;
      if (Math.abs(diff) <= threshold) return;
      if (diff > 0 && !subtitleState.isExpanded) toggleTranscript();
      if (diff < 0 && subtitleState.isExpanded) toggleTranscript();
    });
  }

  function bindActionSheet() {
    document.addEventListener('click', (event) => {
      if (subtitleState.isExpanded && tutorTranscriptEl && tutorStreamEl && !tutorTranscriptEl.contains(event.target) && !tutorStreamEl.contains(event.target)) {
        toggleTranscript();
      }
      if (actionSheetEl && !actionSheetEl.classList.contains('hidden') && !actionSheetEl.contains(event.target) && !tutorStreamEl?.contains(event.target)) {
        hideActionSheet();
      }
    });
    document.getElementById('closeTranscript')?.addEventListener('click', (event) => {
      event.preventDefault();
      toggleTranscript();
    });
    document.getElementById('actionCopy')?.addEventListener('click', (event) => {
      event.preventDefault();
      const text = subtitleState.currentText || subtitleState.fullTranscript.map((entry) => entry.text).join('\n');
      navigator.clipboard?.writeText(text).then(() => {
        window.speak?.('Text copied to clipboard');
        hideActionSheet();
      }).catch(() => {
        window.speak?.('Failed to copy text');
      });
    });
    document.getElementById('actionReplay')?.addEventListener('click', (event) => {
      event.preventDefault();
      if (subtitleState.currentText) window.speak?.(subtitleState.currentText);
      hideActionSheet();
    });
    document.getElementById('actionTranslate')?.addEventListener('click', (event) => {
      event.preventDefault();
      window.speak?.('Translation feature coming soon');
      hideActionSheet();
    });
  }

  function updateInputMode() {
    const inputModeText = document.getElementById('inputModeText');
    const micBtn = document.getElementById('micBtn');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    if (!inputModeText || !tutorInputAreaEl) return;
    if (stateRef.inputMode === 'voice') {
      inputModeText.textContent = 'Voice Input';
      tutorInputAreaEl.classList.add('voice-mode');
      tutorInputAreaEl.classList.remove('text-mode');
      if (micBtn) micBtn.style.display = 'flex';
      if (sendBtn) sendBtn.style.display = 'none';
      if (userInput) {
        userInput.placeholder = 'Tap microphone to speak...';
        userInput.style.display = 'none';
      }
      window.stopSpeechRecognition?.();
    } else {
      inputModeText.textContent = 'Text Input';
      tutorInputAreaEl.classList.add('text-mode');
      tutorInputAreaEl.classList.remove('voice-mode');
      if (micBtn) micBtn.style.display = 'none';
      if (sendBtn) sendBtn.style.display = 'flex';
      if (userInput) {
        userInput.placeholder = 'Type your message...';
        userInput.style.display = 'block';
        userInput.focus();
      }
      window.stopSpeechRecognition?.();
    }

    if (!tutorAgentEl) return;
    if (!tutorAgentEl.classList.contains('speaking') && !tutorAgentEl.classList.contains('paused')) {
      tutorAgentEl.classList.add('idle');
      tutorAgentEl.classList.remove('speaking', 'paused');
      setStatusText(getIdleStatusText());
    }
  }

  function bindInputModeToggle() {
    document.addEventListener('click', (event) => {
      if (event.target.id === 'toggleInputMode' || event.target.closest('#toggleInputMode')) {
        event.preventDefault();
        stateRef.inputMode = stateRef.inputMode === 'voice' ? 'text' : 'voice';
        updateInputMode();
      }
    });
  }

  function tutorAppend(text) {
    updateSubtitle(text);
  }

  function speak(text) {
    subtitleState.currentText = text;
    subtitleState.fullTranscript.push({ text, timestamp: Date.now() });
    // Check if onboarding is active by checking route-onboarding shell
    const routeOnboarding = document.getElementById('route-onboarding');
    const onboardingActive = routeOnboarding && !routeOnboarding.classList.contains('hidden');
    
    if (onboardingActive && typeof window.updateFloatingSubtitle === 'function') {
      window.updateFloatingSubtitle(text);
      window.updateFloatingSubtitleState?.('speaking');
    } else {
      updateSubtitle(text);
    }
    if (!stateRef.voiceEnabled) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.onboundary = (event) => {
        if (event.name !== 'word') return;
        if (onboardingActive && typeof window.highlightFloatingWord === 'function') {
          window.highlightFloatingWord(event.charIndex, event.charLength);
        } else {
          highlightWord(event.charIndex, event.charLength);
        }
      };
      utter.onstart = () => {
        if (onboardingActive) {
          window.updateFloatingSubtitleState?.('speaking');
        } else if (tutorAgentEl) {
          tutorAgentEl.classList.add('speaking');
          tutorAgentEl.classList.remove('paused', 'idle');
          setStatusText('AI Tutor · Speaking');
        }
      };
      utter.onend = () => {
        if (onboardingActive) {
          window.updateFloatingSubtitleState?.('ended');
        } else if (tutorAgentEl) {
          tutorAgentEl.classList.remove('speaking');
          tutorAgentEl.classList.add('idle');
          setStatusText(getIdleStatusText());
        }
      };
      utter.onpause = () => {
        if (onboardingActive) {
          window.updateFloatingSubtitleState?.('paused');
        } else if (tutorAgentEl) {
          tutorAgentEl.classList.add('paused');
          tutorAgentEl.classList.remove('speaking');
          setStatusText('AI Tutor · Paused');
        }
      };
      utter.onresume = () => {
        if (onboardingActive) {
          window.updateFloatingSubtitleState?.('speaking');
        } else if (tutorAgentEl) {
          tutorAgentEl.classList.remove('paused');
          tutorAgentEl.classList.add('speaking');
          setStatusText('AI Tutor · Speaking');
        }
      };
      speechSynthesis.speak(utter);
    } catch (error) {
      console.error('Speech synthesis failed', error);
    }
  }

  function revealAgent() {
    if (!tutorAgentEl) return;
    tutorAgentEl.classList.remove('hidden');
    tutorAgentEl.style.display = 'block';
    tutorAgentEl.style.opacity = '1';
    tutorAgentEl.style.transform = 'translateY(0)';
    tutorAgentEl.style.pointerEvents = 'all';
    tutorAgentEl.classList.add('idle');
    tutorAgentEl.classList.remove('speaking', 'paused');
    setStatusText(getIdleStatusText());
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindToggleTutor();
    bindSubtitleInteractions();
    bindActionSheet();
    bindInputModeToggle();
    if (toggleVoiceBtn) {
      toggleVoiceBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        stateRef.voiceEnabled = !stateRef.voiceEnabled;
        toggleVoiceBtn.textContent = `Voice: ${stateRef.voiceEnabled ? 'On' : 'Off'}`;
      });
    }
    updateInputMode();
  });

  window.speak = speak;
  window.updateSubtitle = updateSubtitle;
  window.highlightWord = highlightWord;
  window.toggleTranscript = toggleTranscript;
  window.showActionSheet = showActionSheet;
  window.hideActionSheet = hideActionSheet;
  window.bindToggleTutor = bindToggleTutor;
  window.bindTutorAgentEvents = bindSubtitleInteractions;
  window.updateInputMode = updateInputMode;
  window.tutorAppend = tutorAppend;
  window.revealTutorAgent = revealAgent;
})();
