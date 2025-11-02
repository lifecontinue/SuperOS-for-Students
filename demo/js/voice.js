(function () {
  let micButton;
  let userInputEl;
  let sendButton;
  let voiceSidebarEl;
  let voiceSuggestionsEl;
  let confirmAllButton;
  let dismissAllButton;
  let closeSidebarButton;
  let speechRecognitionInstance = null;
  let profileRecognitionInstance = null;
  let sidebarTimeout = null;

  state.suggestions = state.suggestions || [];

  function cacheElements() {
    micButton = document.getElementById('micBtn');
    userInputEl = document.getElementById('userInput');
    sendButton = document.getElementById('sendBtn');
    voiceSidebarEl = document.getElementById('voiceSidebar');
    voiceSuggestionsEl = document.getElementById('voiceSuggestions');
    confirmAllButton = document.getElementById('confirmAllBtn');
    dismissAllButton = document.getElementById('dismissAllBtn');
    closeSidebarButton = document.getElementById('closeVoiceSidebar');
  }

  function tryStartSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak?.('Speech recognition not supported in this browser.');
      return;
    }

    stopSpeechRecognition();

    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.lang = 'en-US';
    speechRecognitionInstance.continuous = false;
    speechRecognitionInstance.interimResults = true;

    speechRecognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        const text = finalTranscript.trim();
        if (userInputEl) userInputEl.value = text;
        handleUserMessage();
        stopSpeechRecognition();
      } else if (interimTranscript && userInputEl) {
        userInputEl.value = interimTranscript;
      }
    };

    speechRecognitionInstance.onerror = (event) => {
      if (event.error === 'not-allowed') {
        speak?.('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
      }
      stopSpeechRecognition();
    };

    speechRecognitionInstance.onend = () => {
      speechRecognitionInstance = null;
      state.voiceRecognitionStarted = false;
    };

    try {
      speechRecognitionInstance.start();
      window.speechRecognitionInstance = speechRecognitionInstance;
      state.voiceRecognitionStarted = true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      stopSpeechRecognition();
      if (error.name === 'NotAllowedError') {
        speak?.('Microphone permission denied. Please allow microphone access.');
      } else {
        speak?.('Please click the microphone button to start voice input.');
      }
    }
  }

  function stopSpeechRecognition() {
    try { speechRecognitionInstance?.stop(); } catch (_) {}
    speechRecognitionInstance = null;
    state.voiceRecognitionStarted = false;
    try { window.speechRecognitionInstance?.stop(); } catch (_) {}
    window.speechRecognitionInstance = null;
  }

  function startProfileListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    stopProfileListening();
    profileRecognitionInstance = new SpeechRecognition();
    profileRecognitionInstance.lang = 'en-US';
    profileRecognitionInstance.continuous = true;
    profileRecognitionInstance.interimResults = false;
    profileRecognitionInstance.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      handleProfileVoiceText(text);
    };
    try { profileRecognitionInstance.start(); } catch (_) {}
  }

  function stopProfileListening() {
    try { profileRecognitionInstance?.abort(); } catch (_) {}
    profileRecognitionInstance = null;
  }

  function handleUserMessage() {
    if (!userInputEl) return;
    const text = userInputEl.value.trim();
    if (!text) return;
    tutorAppend?.(`You: ${text}`);
    userInputEl.value = '';

    if (state.route === 'profile' && typeof handleProfileVoiceText === 'function') {
      handleProfileVoiceText(text);
    }

    if (/onboard|onboarding|register|guide/i.test(text)) {
      setRoute?.('onboarding');
    } else if (/profile|persona/i.test(text)) {
      setRoute?.('profile');
    } else if (/advisor|major|compare/i.test(text)) {
      setRoute?.('advisor');
    } else if (/roadmap|plan/i.test(text)) {
      setRoute?.('roadmap');
    } else if (/gap|analysis/i.test(text)) {
      setRoute?.('gap');
    } else {
      tutorAppend?.(`AI: I heard "${text}". How can I help you with your college application?`);
    }
  }

  function renderSuggestions() {
    if (!voiceSuggestionsEl) return;
    if (!state.suggestions || !Array.isArray(state.suggestions) || state.suggestions.length === 0) {
      voiceSuggestionsEl.innerHTML = "<div class='suggestion-empty'><div class='muted'>No suggestions yet. Try saying: \"My GPA is 3.9\", \"Ridgefield High School\", \"Computer Science\"...</div></div>";
      return;
    }

    voiceSuggestionsEl.innerHTML = state.suggestions.map((suggestion, index) => `
      <div class="suggestion-item" data-index="${index}">
        <div class="suggestion-header">
          <div class="suggestion-type-badge">${suggestion.type}</div>
          <div class="suggestion-section">${suggestion.section || 'Profile'}</div>
        </div>
        <div class="suggestion-content">
          <div class="suggestion-label">${suggestion.key || 'Value'}</div>
          <div class="suggestion-value">${escapeHtml(suggestion.value)}</div>
          ${suggestion.rawText ? `<div class="suggestion-raw muted">From: "${escapeHtml(suggestion.rawText.substring(0, 50))}${suggestion.rawText.length > 50 ? '...' : ''}"</div>` : ''}
        </div>
        <div class="suggestion-actions">
          <button class="suggestion-btn confirm-btn" aria-label="Confirm">✓ Confirm</button>
          <button class="suggestion-btn dismiss-btn" aria-label="Dismiss">× Dismiss</button>
        </div>
      </div>`).join('');

    bindSuggestionEvents();
  }

  function showVoiceSidebar() {
    if (!voiceSidebarEl) return;
    voiceSidebarEl.classList.remove('hidden', 'hiding');
    clearTimeout(sidebarTimeout);
    sidebarTimeout = setTimeout(() => hideVoiceSidebar(), 30000);
  }

  function hideVoiceSidebar() {
    if (!voiceSidebarEl) return;
    clearTimeout(sidebarTimeout);
    sidebarTimeout = null;
    voiceSidebarEl.classList.add('hiding');
    setTimeout(() => {
      voiceSidebarEl.classList.add('hidden');
      voiceSidebarEl.classList.remove('hiding');
    }, 300);
  }

  function applySuggestion(suggestion) {
    if (!suggestion || !suggestion.type) return;

    const sectionMap = {
      Identity: 'Identity',
      School: 'School',
      Transcript: 'Transcript',
      Activities: 'Activities',
      Testing: 'Testing',
      'Intended Major': 'Intended Major'
    };

    const sectionKey = sectionMap[suggestion.section] || suggestion.section || 'Identity';

    if (suggestion.type === 'GPA') {
      setSectionParam('School', 'GPA', suggestion.value, true);
    } else if (suggestion.type === 'High School') {
      setSectionParam('School', 'High School', suggestion.value, true);
    } else if (suggestion.type === 'Name') {
      setSectionParam('Identity', 'Name', suggestion.value, true);
      state.profile.name = suggestion.value;
    } else if (suggestion.type === 'Email') {
      setSectionParam('Identity', 'Email', suggestion.value, true);
      state.profile.email = suggestion.value;
    } else if (suggestion.type === 'Phone') {
      setSectionParam('Identity', 'Phone', suggestion.value, true);
    } else if (suggestion.type === 'Grade Level' || suggestion.type === 'Grade') {
      setSectionParam('School', 'Grade', suggestion.value, true);
    } else if (suggestion.type === 'Major') {
      const section = getSection('Intended Major');
      if (section) {
        const entry = section.params.find((param) => param[0] === 'Majors');
        if (entry) {
          const items = entry[1] ? entry[1].split(',').map((value) => value.trim()).filter(Boolean) : [];
          if (!items.includes(suggestion.value)) items.push(suggestion.value);
          entry[1] = items.join(', ');
        } else {
          section.params.push(['Majors', suggestion.value]);
        }
      }
      if (!state.profile.targetMajors) state.profile.targetMajors = [];
      if (!state.profile.targetMajors.includes(suggestion.value)) {
        state.profile.targetMajors.push(suggestion.value);
      }
    } else if (suggestion.type === 'Activity') {
      const section = getSection('Activities');
      if (section) {
        const entry = section.params.find((param) => param[0] === 'Top');
        if (entry) {
          const items = entry[1] ? entry[1].split(',').map((value) => value.trim()).filter(Boolean) : [];
          if (!items.includes(suggestion.value)) items.push(suggestion.value);
          entry[1] = items.join(', ');
        } else {
          section.params.push(['Top', suggestion.value]);
        }
      }
    } else if (suggestion.type === 'SAT Score' || suggestion.type === 'SAT') {
      setSectionParam('Testing', 'SAT', suggestion.value, true);
    } else if (suggestion.type === 'ACT Score' || suggestion.type === 'ACT') {
      setSectionParam('Testing', 'ACT', suggestion.value, true);
    } else if (suggestion.type === 'AP Course' || suggestion.type === 'AP') {
      const section = getSection('Transcript');
      if (section) {
        const entry = section.params.find((param) => param[0] === 'AP Courses');
        if (entry) {
          const items = entry[1] ? entry[1].split(',').map((value) => value.trim()).filter(Boolean) : [];
          if (!items.includes(suggestion.value)) items.push(suggestion.value);
          entry[1] = items.join(', ');
        } else {
          section.params.push(['AP Courses', suggestion.value]);
        }
      }
    } else if (suggestion.type === 'Date of Birth' || suggestion.type === 'DOB') {
      setSectionParam('Identity', 'DOB', suggestion.value, true);
    } else if (suggestion.type === 'Country') {
      setSectionParam('Identity', 'Country', suggestion.value, true);
    } else {
      setSectionParam(sectionKey, suggestion.key || suggestion.type, suggestion.value, true);
    }
  }

  function bindSuggestionEvents() {
    if (!voiceSuggestionsEl) return;
    voiceSuggestionsEl.querySelectorAll('.suggestion-item').forEach((item) => {
      const index = parseInt(item.dataset.index, 10);
      const suggestion = state.suggestions[index];
      item.querySelector('.confirm-btn')?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!suggestion) return;
        applySuggestion(suggestion);
        state.suggestions.splice(index, 1);
        renderSuggestions();
        renderProfileSections?.();
        renderProfileAndGap?.();
        speak?.(`${suggestion.type} ${suggestion.value} has been added to your profile.`);
        if (!state.suggestions.length) {
          hideVoiceSidebar();
        } else {
          showVoiceSidebar();
        }
      });
      item.querySelector('.dismiss-btn')?.addEventListener('click', (event) => {
        event.stopPropagation();
        state.suggestions.splice(index, 1);
        renderSuggestions();
        if (!state.suggestions.length) {
          hideVoiceSidebar();
        } else {
          showVoiceSidebar();
        }
      });
    });
  }

  function bindSidebarControls() {
    confirmAllButton?.addEventListener('click', () => {
      if (!state.suggestions || state.suggestions.length === 0) return;
      [...state.suggestions].forEach((suggestion) => applySuggestion(suggestion));
      state.suggestions = [];
      renderSuggestions();
      renderProfileSections?.();
      renderProfileAndGap?.();
      hideVoiceSidebar();
      speak?.('All suggestions have been confirmed and added to your profile.');
    });

    dismissAllButton?.addEventListener('click', () => {
      if (!state.suggestions || state.suggestions.length === 0) return;
      state.suggestions = [];
      renderSuggestions();
      hideVoiceSidebar();
      speak?.('All suggestions have been dismissed.');
    });

    closeSidebarButton?.addEventListener('click', () => hideVoiceSidebar());
  }

  function handleProfileVoiceText(text) {
    const lower = text.toLowerCase();
    const newSuggestions = [];

    const namePatterns = [
      /(?:my name is|i am|i'm|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:name|我叫|我是)\s*[:：]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    namePatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 50) newSuggestions.push({ type: 'Name', key: 'Name', value: name, section: 'Identity', rawText: text });
      }
    });

    const gpaPatterns = [
      /gpa\s*(?:is|of|:)?\s*(\d(?:\.\d{1,2})?)/i,
      /grade point average\s*(?:is|of|:)?\s*(\d(?:\.\d{1,2})?)/i,
      /(\d\.\d{1,2})\s*(?:gpa|grade point average)/i
    ];
    gpaPatterns.forEach((pattern) => {
      const match = lower.match(pattern);
      if (match && match[1]) {
        const gpa = parseFloat(match[1]);
        if (!Number.isNaN(gpa) && gpa >= 0 && gpa <= 5) newSuggestions.push({ type: 'GPA', key: 'GPA', value: match[1], section: 'School', rawText: text });
      }
    });

    const schoolPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(high school|high|hs|school)\b/i,
      /(?:attend|go to|study at|school is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:high school|high|hs|school)?/i,
      /(?:from|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:high school|high|hs)/i
    ];
    schoolPatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const schoolName = match[1].trim();
        if (schoolName.length > 3 && schoolName.length < 100) newSuggestions.push({ type: 'High School', key: 'High School', value: schoolName, section: 'School', rawText: text });
      }
    });

    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) newSuggestions.push({ type: 'Email', key: 'Email', value: emailMatch[1], section: 'Identity', rawText: text });

    const phonePatterns = [
      /(?:phone|mobile|cell|contact)\s*(?:number|is|:)?\s*([(]?\d{3}[)]?\s*-?\d{3}\s*-?\d{4})/i,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
    ];
    phonePatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match[1]) newSuggestions.push({ type: 'Phone', key: 'Phone', value: match[1], section: 'Identity', rawText: text });
    });

    const majors = ['computer science', 'cs', 'data science', 'economics', 'biology', 'engineering', 'mathematics', 'math', 'physics', 'chemistry', 'psychology', 'business', 'finance', 'artificial intelligence', 'ai', 'mechanical engineering', 'electrical engineering', 'chemical engineering', 'biomedical engineering', 'software engineering', 'accounting', 'marketing', 'management', 'statistics', 'stat', 'architecture', 'design', 'art', 'music', 'history', 'literature', 'philosophy', 'political science', 'poli sci'];
    majors.forEach((major) => {
      if (lower.includes(major)) {
        let majorName = major;
        if (major === 'cs') majorName = 'Computer Science';
        else if (major === 'ai') majorName = 'Artificial Intelligence';
        else if (major === 'stat') majorName = 'Statistics';
        else if (major === 'poli sci') majorName = 'Political Science';
        else majorName = titleCase(major);
        newSuggestions.push({ type: 'Major', key: 'Majors', value: majorName, section: 'Intended Major', rawText: text });
      }
    });

    const activityPatterns = [
      /(?:activity|activities|extracurricular|extracurriculars|involvement)\s*(?:is|are|include|includes)?\s*[:]?\s([a-z][a-z\s,]+?)(?:\.|$|and|,)/i,
      /(?:participate|participated|involved|involvement)\s+in\s+([a-z][a-z\s,]+?)(?:\.|$|and|,)/i,
      /(?:leader|lead|led|president|president of)\s+(?:of|the)?\s*([a-z][a-z\s,]+?)(?:club|organization|team|group|committee)?/i
    ];
    activityPatterns.forEach((pattern) => {
      const match = lower.match(pattern);
      if (match && match[1]) {
        const activity = titleCase(match[1].trim());
        if (activity.length > 3 && activity.length < 100) newSuggestions.push({ type: 'Activity', key: 'Activity', value: activity, section: 'Activities', rawText: text });
      }
    });

    const satPatterns = [
      /sat\s+(?:score|is|was|of)?\s*(?:is|:)?\s*(\d{3,4})/i,
      /sat\s+(\d{3,4})\s*(?:points?|score)?/i
    ];
    satPatterns.forEach((pattern) => {
      const match = lower.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1], 10);
        if (score >= 400 && score <= 1600) newSuggestions.push({ type: 'SAT Score', key: 'SAT', value: match[1], section: 'Testing', rawText: text });
      }
    });

    const actPatterns = [
      /act\s+(?:score|is|was|of)?\s*(?:is|:)?\s*(\d{1,2})/i,
      /act\s+(\d{1,2})\s*(?:points?|score)?/i
    ];
    actPatterns.forEach((pattern) => {
      const match = lower.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1], 10);
        if (score >= 1 && score <= 36) newSuggestions.push({ type: 'ACT Score', key: 'ACT', value: match[1], section: 'Testing', rawText: text });
      }
    });

    const apPattern = /ap\s+([a-z\s]+?)(?:\.|$|,|and)/i;
    const apMatch = lower.match(apPattern);
    if (apMatch) {
      const apCourse = titleCase(apMatch[1].trim());
      newSuggestions.push({ type: 'AP Course', key: 'AP', value: apCourse, section: 'Transcript', rawText: text });
    }

    const gradePatterns = [
      /(?:i am|i'm|in|grade|year)\s+(?:a\s+)?(freshman|sophomore|junior|senior|grade\s+\d+|year\s+\d+)/i,
      /(?:grade|year)\s+(\d{1,2})/i
    ];
    gradePatterns.forEach((pattern) => {
      const match = lower.match(pattern);
      if (match) {
        let grade = match[1] || match[0];
        if (grade.includes('freshman')) grade = '9';
        else if (grade.includes('sophomore')) grade = '10';
        else if (grade.includes('junior')) grade = '11';
        else if (grade.includes('senior')) grade = '12';
        else grade = grade.replace(/\D/g, '');
        if (grade && parseInt(grade, 10) >= 9 && parseInt(grade, 10) <= 12) {
          newSuggestions.push({ type: 'Grade Level', key: 'Grade', value: `Grade ${grade}`, section: 'School', rawText: text });
        }
      }
    });

    if (newSuggestions.length > 0) {
      newSuggestions.forEach((suggestion) => {
        const exists = state.suggestions.some((existing) => existing.type === suggestion.type && existing.key === suggestion.key && existing.value === suggestion.value);
        if (!exists) state.suggestions.push(suggestion);
      });
      renderSuggestions();
      showVoiceSidebar();
      speak?.(`I detected ${newSuggestions.length} item${newSuggestions.length > 1 ? 's' : ''} from your voice. Please review and confirm in the sidebar.`);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindSidebarControls();
    renderSuggestions();

    micButton?.addEventListener('click', () => {
      if (state.inputMode === 'voice') tryStartSpeechRecognition();
    });

    sendButton?.addEventListener('click', () => handleUserMessage());
    userInputEl?.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleUserMessage();
      }
    });
  });

  window.tryStartSpeechRecognition = tryStartSpeechRecognition;
  window.stopSpeechRecognition = stopSpeechRecognition;
  window.startProfileListening = startProfileListening;
  window.stopProfileListening = stopProfileListening;
  window.handleUserMessage = handleUserMessage;
  window.renderSuggestions = renderSuggestions;
  window.showVoiceSidebar = showVoiceSidebar;
  window.hideVoiceSidebar = hideVoiceSidebar;
  window.applySuggestion = applySuggestion;
  window.handleProfileVoiceText = handleProfileVoiceText;
})();
