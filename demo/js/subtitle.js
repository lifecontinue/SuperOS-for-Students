// Floating Subtitle Component - Enhanced Interactive Features
// This module handles the floating subtitle component in the onboarding view

// Ensure shared subtitle state exists
window.subtitleState = window.subtitleState || {
  currentText: '',
  fullTranscript: [],
  isExpanded: false,
  isPaused: false,
  currentWordIndex: -1,
  inputMode: 'voice', // 'voice' or 'text'
  longPressTimer: null,
  touchStartY: 0,
  touchEndY: 0
};
const subtitleState = window.subtitleState;

// Initialize floating subtitle component
function initFloatingSubtitle() {
  const container = document.getElementById('inputArea');
  const subtitleBox = document.getElementById('subtitleBox');
  const subtitleTextDisplay = document.getElementById('subtitleTextDisplay');
  const subtitleWordHighlight = document.getElementById('subtitleWordHighlight');
  const waveform = document.getElementById('subtitleWaveform');
  const transcriptExpanded = document.getElementById('subtitleTranscriptExpanded');
  const actionSheet = document.getElementById('subtitleActionSheet');
  const inputControls = document.getElementById('subtitleInputControls');
  
  if (!container || !subtitleBox || !subtitleTextDisplay) return;
  
  container.classList.add('idle');
  
  // Tap on subtitle - toggle between voice/text mode or expand transcript
  subtitleBox.addEventListener('click', (e) => {
    if (subtitleState.longPressTimer) {
      clearTimeout(subtitleState.longPressTimer);
      subtitleState.longPressTimer = null;
      return;
    }
    
    // Toggle between voice and text mode
    if (subtitleState.inputMode === 'voice') {
      // Switch to text mode
      subtitleState.inputMode = 'text';
      if (inputControls) {
        inputControls.classList.remove('hidden');
      }
      expandTranscript();
    } else {
      // Switch back to voice mode
      subtitleState.inputMode = 'voice';
      if (inputControls) {
        inputControls.classList.add('hidden');
      }
      collapseTranscript();
    }
  });
  
  // Long press subtitle - show action sheet
  subtitleBox.addEventListener('touchstart', (e) => {
    subtitleState.touchStartY = e.changedTouches[0].screenY;
    subtitleState.longPressTimer = setTimeout(() => {
      showActionSheet();
      subtitleState.longPressTimer = null;
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  });
  
  subtitleBox.addEventListener('touchend', () => {
    if (subtitleState.longPressTimer) {
      clearTimeout(subtitleState.longPressTimer);
      subtitleState.longPressTimer = null;
    }
  });
  
  subtitleBox.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left mouse button
      subtitleState.longPressTimer = setTimeout(() => {
        showActionSheet();
        subtitleState.longPressTimer = null;
      }, 500);
    }
  });
  
  subtitleBox.addEventListener('mouseup', () => {
    if (subtitleState.longPressTimer) {
      clearTimeout(subtitleState.longPressTimer);
      subtitleState.longPressTimer = null;
    }
  });
  
  subtitleBox.addEventListener('mouseleave', () => {
    if (subtitleState.longPressTimer) {
      clearTimeout(subtitleState.longPressTimer);
      subtitleState.longPressTimer = null;
    }
  });
  
  // Swipe gestures
  subtitleBox.addEventListener('touchstart', (e) => {
    subtitleState.touchStartY = e.changedTouches[0].screenY;
  });
  
  subtitleBox.addEventListener('touchend', (e) => {
    subtitleState.touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = subtitleState.touchStartY - subtitleState.touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe up - expand transcript
        if (!subtitleState.isExpanded) {
          expandTranscript();
        }
      } else {
        // Swipe down - collapse transcript
        if (subtitleState.isExpanded) {
          collapseTranscript();
        }
      }
    }
  }
  
  // Tap waveform - pause/resume
  if (waveform) {
    waveform.addEventListener('click', () => {
      if (speechSynthesis.speaking) {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
          container.classList.remove('paused');
          container.classList.add('speaking');
        } else {
          speechSynthesis.pause();
          container.classList.add('paused');
          container.classList.remove('speaking');
        }
      }
    });
  }
  
  // Close transcript
  const closeTranscriptBtn = document.getElementById('closeSubtitleTranscript');
  if (closeTranscriptBtn) {
    closeTranscriptBtn.addEventListener('click', () => {
      collapseTranscript();
    });
  }
  
  // Action sheet handlers
  const actionCopyText = document.getElementById('actionCopyText');
  const actionReplaySegment = document.getElementById('actionReplaySegment');
  const actionTranslateText = document.getElementById('actionTranslateText');
  
  if (actionCopyText) {
    actionCopyText.addEventListener('click', () => {
      const text = subtitleState.currentText || subtitleState.fullTranscript.map(t => t.text).join('\n');
      navigator.clipboard?.writeText(text).then(() => {
        hideActionSheet();
        if (typeof speak === 'function') {
          speak('Text copied to clipboard');
        }
      }).catch(() => {
        if (typeof speak === 'function') {
          speak('Failed to copy text');
        }
      });
    });
  }
  
  if (actionReplaySegment) {
    actionReplaySegment.addEventListener('click', () => {
      hideActionSheet();
      if (subtitleState.currentText && typeof speak === 'function') {
        speak(subtitleState.currentText);
      }
    });
  }
  
  if (actionTranslateText) {
    actionTranslateText.addEventListener('click', () => {
      hideActionSheet();
      if (typeof speak === 'function') {
        speak('Translation feature coming soon');
      }
    });
  }
  
  // Click outside to close expanded views
  document.addEventListener('click', (e) => {
    if (subtitleState.isExpanded && transcriptExpanded && !transcriptExpanded.contains(e.target) && !subtitleBox.contains(e.target)) {
      collapseTranscript();
    }
    
    if (actionSheet && !actionSheet.classList.contains('hidden') && !actionSheet.contains(e.target) && !subtitleBox.contains(e.target)) {
      hideActionSheet();
    }
  });
}

// Update subtitle text
function updateFloatingSubtitle(text) {
  const container = document.getElementById('inputArea');
  const subtitleTextDisplay = document.getElementById('subtitleTextDisplay');
  const subtitleBox = document.getElementById('subtitleBox');
  const transcriptContent = document.getElementById('subtitleTranscriptContent');
  
  if (!subtitleTextDisplay || !subtitleBox || !container) return;
  
  subtitleState.currentText = text;
  subtitleState.fullTranscript.push({
    text: text,
    timestamp: Date.now()
  });
  
  // Update subtitle text with typewriter effect
  subtitleTextDisplay.textContent = '';
  subtitleTextDisplay.classList.add('typing');
  
  let index = 0;
  const typewriterInterval = setInterval(() => {
    if (index < text.length) {
      subtitleTextDisplay.textContent += text[index];
      index++;
    } else {
      clearInterval(typewriterInterval);
      subtitleTextDisplay.classList.remove('typing');
    }
  }, 30); // 30ms per character
  
  // Add to transcript
  if (transcriptContent) {
    const transcriptItem = document.createElement('div');
    transcriptItem.textContent = text;
    transcriptItem.style.marginBottom = '12px';
    transcriptContent.appendChild(transcriptItem);
    transcriptContent.scrollTop = transcriptContent.scrollHeight;
  }
  
  // Check for overflow
  const lineHeight = parseFloat(getComputedStyle(subtitleTextDisplay).lineHeight);
  const maxHeight = lineHeight * 3;
  if (subtitleTextDisplay.scrollHeight > maxHeight) {
    subtitleBox.classList.add('has-overflow');
  } else {
    subtitleBox.classList.remove('has-overflow');
  }
  
  // Show container with speaking state
  container.classList.remove('hidden', 'idle', 'ended');
  container.classList.add('speaking');
}

// Highlight word
function highlightFloatingWord(charIndex, charLength) {
  const highlightEl = document.getElementById('subtitleWordHighlight');
  const subtitleTextDisplay = document.getElementById('subtitleTextDisplay');
  
  if (!highlightEl || !subtitleTextDisplay) return;
  
  const text = subtitleTextDisplay.textContent;
  const words = text.split(/\s+/);
  let currentIndex = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordStart = text.indexOf(word, currentIndex);
    
    if (wordStart <= charIndex && charIndex < wordStart + word.length) {
      // Position highlight
      const range = document.createRange();
      const textNode = subtitleTextDisplay.firstChild;
      
      if (textNode) {
        range.setStart(textNode, wordStart);
        range.setEnd(textNode, wordStart + word.length);
        const rect = range.getBoundingClientRect();
        const subtitleRect = subtitleTextDisplay.getBoundingClientRect();
        
        highlightEl.style.left = (rect.left - subtitleRect.left) + 'px';
        highlightEl.style.top = (rect.top - subtitleRect.top) + 'px';
        highlightEl.style.width = rect.width + 'px';
        highlightEl.style.height = rect.height + 'px';
        highlightEl.classList.add('active');
        
        setTimeout(() => {
          highlightEl.classList.remove('active');
        }, 200);
      }
      break;
    }
    
    currentIndex = wordStart + word.length + 1;
  }
}

// Expand transcript
function expandTranscript() {
  const transcriptExpanded = document.getElementById('subtitleTranscriptExpanded');
  const subtitleBox = document.getElementById('subtitleBox');
  
  if (transcriptExpanded && subtitleBox) {
    subtitleState.isExpanded = true;
    transcriptExpanded.classList.remove('hidden');
    subtitleBox.classList.add('expanded');
  }
}

// Collapse transcript
function collapseTranscript() {
  const transcriptExpanded = document.getElementById('subtitleTranscriptExpanded');
  const subtitleBox = document.getElementById('subtitleBox');
  
  if (transcriptExpanded && subtitleBox) {
    subtitleState.isExpanded = false;
    transcriptExpanded.classList.add('hidden');
    subtitleBox.classList.remove('expanded');
  }
}

// Show action sheet
function showActionSheet() {
  const actionSheet = document.getElementById('subtitleActionSheet');
  if (actionSheet) {
    actionSheet.classList.remove('hidden');
  }
}

// Hide action sheet
function hideActionSheet() {
  const actionSheet = document.getElementById('subtitleActionSheet');
  if (actionSheet) {
    actionSheet.classList.add('hidden');
  }
}

// Update subtitle state
function updateFloatingSubtitleState(state) {
  const container = document.getElementById('inputArea');
  if (!container) return;
  
  container.classList.remove('hidden');
  container.style.display = '';
  container.classList.remove('idle', 'speaking', 'paused', 'ended');
  
  switch (state) {
    case 'idle':
      container.classList.add('idle');
      break;
    case 'speaking':
      container.classList.add('speaking');
      break;
    case 'paused':
      container.classList.add('paused');
      break;
    case 'ended':
      container.classList.add('ended');
      setTimeout(() => {
        container.classList.remove('ended');
        container.classList.add('idle');
      }, 400);
      break;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initFloatingSubtitle();
});

