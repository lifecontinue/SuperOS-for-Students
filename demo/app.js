// Main application file
// Note: state, utils, sections, router, auth modules are loaded from separate files
// Onboarding flows are merged into this file

// Render guide meta (depends on utils.js)
function renderGuideMeta(){
  const sections = ['identity','school','transcript','activities','testing','recommenders','essays','ferpa'];
  sections.forEach(key=>{
    const st = getSectionStatus(key);
    const badge = document.getElementById(`status-${key}`);
    if (badge) { badge.textContent = st.label; badge.className = `status-badge ${st.cls}`; }
    const sumEl = document.getElementById(`summary-${key}`);
    if (sumEl) { sumEl.innerHTML = `<li>${sectionSummary(key)}</li>`; }
  });
}

window.renderGuideMeta = renderGuideMeta;
if (typeof initAuth === 'function') {
  initAuth();
}

// Elements - will be initialized when DOM is ready
let tutorStream = null;
let tutorAgent = null;
let inputArea = null;
let progressFill = null;
let voiceSidebar = null;
let voiceSuggestions = null;
const componentRoutes = ['auth','onboarding','profile','advisor','roadmap'];
let toggleVoice = null;

// Initialize DOM elements when DOM is ready
function initDOMElements() {
  tutorStream = document.getElementById('tutorStream');
  tutorAgent = document.getElementById('tutorAgent');
  inputArea = document.getElementById('inputArea');
  progressFill = document.getElementById('progressFill');
  voiceSidebar = document.getElementById('voiceSidebar');
  voiceSuggestions = document.getElementById('voiceSuggestions');
  toggleVoice = document.getElementById('toggleVoice');
}

// Initialize elements when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDOMElements);
} else {
  initDOMElements();
}

// Persona data structure
state.persona = state.persona || {
  title: 'Persona 1: Biomedical Aesthetic Engineer',
  narrative: {
    core: 'A future engineer who views biology as a medium for art, elegance, and identity.',
    highlight: 'The Beauty of Optional Future',
    description: 'Ten years of dance experience is not just an extracurricular activity, but the primary way to explore human kinesiology, aesthetics, and potential.',
    question: 'How can we design biological solutions, from cell regeneration to advanced prosthetics, that are both practical, elegant, and expressive?'
  },
  highlights: [
    { icon: '💃', label: 'Position Change Connection', active: true },
    { icon: '⚙️', label: 'STEAM', active: false },
    { icon: '💡', label: 'Creative Plus', active: false }
  ],
  alignmentPoints: [
    { icon: '🧠', text: 'Seed Placement' },
    { icon: '🌳', text: 'Root Virtue Activities' },
    { icon: '☆', text: '', empty: true },
    { icon: '💡', text: '◎ Still Concentration' },
    { icon: '★', text: '★ Mutual Innovation' }
  ],
  developmentPlan: [
    { icon: '🧪', label: 'Foundation: Research', stage: 'research' },
    { icon: '⚙️', label: 'Middle: Development', stage: 'development' },
    { icon: '⬆️', label: 'Long-term: Industry', stage: 'industry' }
  ],
  traits: []
};

// Persona rendering - use persona.js module if available, otherwise fallback
function renderPersona(){
  // Use persona.js module if available (it has persona selector support)
  if (typeof window.renderPersona === 'function' && window.renderPersona !== renderPersona) {
    return window.renderPersona();
  }
  
  // Fallback implementation for backward compatibility
  const view = document.getElementById('view-persona');
  if (!view) return;

  // Ensure state.persona is set to current persona
  if (!state.persona && state.personas && state.personas.length > 0) {
    state.persona = state.personas[state.currentPersonaIndex || 0];
  }

  // Update title
  const titleEl = document.getElementById('personaTitle');
  if (titleEl && state.persona.title) {
    titleEl.textContent = state.persona.title;
  }

  // Update narrative
  const narrativeEl = document.getElementById('personaNarrative');
  if (narrativeEl && state.persona.narrative) {
    narrativeEl.innerHTML = `
      <p>${state.persona.narrative.core || ''}</p>
      ${state.persona.narrative.highlight ? `<p class="highlight-text">${state.persona.narrative.highlight}</p>` : ''}
      <p>${state.persona.narrative.description || ''}</p>
      ${state.persona.narrative.question ? `<p class="persona-question">${state.persona.narrative.question}</p>` : ''}
    `;
  }

  // Update highlights carousel
  const highlightsEl = document.getElementById('highlightsCarousel');
  if (highlightsEl && state.persona.highlights) {
    highlightsEl.innerHTML = state.persona.highlights.map(h => `
      <div class="highlight-item ${h.active ? 'highlight-active' : ''}">
        <div class="highlight-icon">${h.icon}</div>
        <div class="highlight-label">${h.label}</div>
      </div>
    `).join('');
  }

  // Update alignment badges
  const badgesEl = document.getElementById('alignmentBadges');
  if (badgesEl && state.persona.alignmentPoints) {
    badgesEl.innerHTML = state.persona.alignmentPoints.map(point => `
      <div class="alignment-badge ${point.empty ? 'badge-empty' : ''}">
        <span class="badge-icon">${point.icon}</span>
        ${point.text ? `<span class="badge-text">${point.text}</span>` : ''}
      </div>
    `).join('');
  }
  
  // Update development plan timeline
  const timelineEl = document.getElementById('developmentPlanTimeline');
  if (timelineEl && state.persona.developmentPlan) {
    timelineEl.innerHTML = state.persona.developmentPlan.map((plan, index) => {
      const isLast = index === state.persona.developmentPlan.length - 1;
      return `
        <div class="timeline-stage">
          <div class="timeline-icon">${plan.icon}</div>
          <div class="timeline-content">
            <div class="timeline-badge">${plan.label}</div>
          </div>
        </div>
        ${!isLast ? '<div class="timeline-line"></div>' : ''}
      `;
    }).join('');
  }
}

document.addEventListener('click', (e)=>{
  const t = e.target;
  if (!t) return;
  
  // Handle btnGoogle click - check both id and closest parent
  const btnGoogleClick = t.id === 'btnGoogle' ? t : t.closest('#btnGoogle');
  if (btnGoogleClick && btnGoogleClick.id === 'btnGoogle') {
    e.preventDefault();
    e.stopPropagation();
    console.log('Google button clicked (global delegation)');
    state.session = { provider: 'google', email: 'google_user@example.com' };
    state.profile.email = 'google_user@example.com';
    const authStatusEl = document.getElementById('authStatus');
    if (authStatusEl) authStatusEl.textContent = 'Signed in with Google';
    speak('Google sign-in successful. Starting onboarding.');
    revealPostAuthUI();
    setRoute('onboarding');
    // Ensure goStep is called after route is set
    setTimeout(() => {
      goStep(state.onboardingIndex || 0);
    }, 50);
    return;
  }
  
  // Handle Skip onboarding button - navigate to profile
  if (t.id === 'btnSkipOnboard' || t.closest('#btnSkipOnboard')) {
    e.preventDefault();
    e.stopPropagation();
    
    // End onboarding process
    state.onboardingComplete = true;
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    
    // Voice feedback
    if (typeof speak === 'function') {
      speak('Skipping onboarding. Welcome to your profile!');
    }
    
    // Navigate to profile page - ensure view-profile.html is loaded
    if (typeof navigateToRoute === 'function') {
      navigateToRoute('profile', {
        sectionId: 'view-profile',
        containerId: 'view-profile-container',
        scrollToTop: true,
        updateTab: true,
        skipIfSame: false
      }).then(() => {
        // Ensure DOM elements are properly shown/hidden
        requestAnimationFrame(() => {
          // Hide onboarding
          const routeOnboarding = document.getElementById('route-onboarding');
          if (routeOnboarding) {
            routeOnboarding.classList.add('hidden');
          }
          
          // Show route-app
          const routeApp = document.getElementById('route-app');
          if (routeApp) {
            routeApp.classList.remove('hidden');
          }
          
          // Show profile nav
          const profileNav = document.getElementById('profileNav');
          if (profileNav) {
            profileNav.classList.remove('hidden');
          }
          
          // Load and render profile content
          setTimeout(async () => {
            // Load profile section from sections/view-profile.html if not already loaded
            const profileContainer = document.getElementById('view-profile-container');
            const profileView = document.getElementById('view-profile');
            if (profileContainer && (!profileView || !profileView.innerHTML.trim())) {
              if (typeof loadSection === 'function') {
                await loadSection('view-profile', 'view-profile-container');
                // Update views after loading
                if (typeof updateViews === 'function') {
                  updateViews();
                }
              }
            }
            
            // Render profile components
            if (typeof renderProfileAndGap === 'function') {
              renderProfileAndGap();
            }
            if (typeof renderProfileSections === 'function') {
              renderProfileSections();
            }
            if (typeof renderGuideMeta === 'function') {
              renderGuideMeta();
            }
            if (typeof renderProfileSummary === 'function') {
              renderProfileSummary();
            }
            if (typeof observeSectionAutoExpand === 'function') {
              observeSectionAutoExpand();
            }
            
            // Scroll to top
            try {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (_) {}
          }, 100);
        });
      });
    } else if (typeof setRoute === 'function') {
      setRoute('profile', true);
      // Ensure DOM elements are properly shown/hidden
      requestAnimationFrame(() => {
        // Hide onboarding
        const routeOnboarding = document.getElementById('route-onboarding');
        if (routeOnboarding) {
          routeOnboarding.classList.add('hidden');
        }
        
        // Show route-app
        const routeApp = document.getElementById('route-app');
        if (routeApp) {
          routeApp.classList.remove('hidden');
        }
        
        // Show profile nav
        const profileNav = document.getElementById('profileNav');
        if (profileNav) {
          profileNav.classList.remove('hidden');
        }
        
        // Load and render profile content
        setTimeout(async () => {
          // Load profile section from sections/view-profile.html if not already loaded
          const profileContainer = document.getElementById('view-profile-container');
          const profileView = document.getElementById('view-profile');
          if (profileContainer && (!profileView || !profileView.innerHTML.trim())) {
            if (typeof loadSection === 'function') {
              await loadSection('view-profile', 'view-profile-container');
              // Update views after loading
              if (typeof updateViews === 'function') {
                updateViews();
              }
            }
          }
          
          // Render profile components
          if (typeof renderProfileAndGap === 'function') {
            renderProfileAndGap();
          }
          if (typeof renderProfileSections === 'function') {
            renderProfileSections();
          }
          if (typeof renderGuideMeta === 'function') {
            renderGuideMeta();
          }
          if (typeof renderProfileSummary === 'function') {
            renderProfileSummary();
          }
          if (typeof observeSectionAutoExpand === 'function') {
            observeSectionAutoExpand();
          }
          
          // Scroll to top
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (_) {}
        }, 100);
      });
    }
    
    return;
  }
  
  // Handle nextWelcome button - navigate to profile
  if (t.id === 'nextWelcome' || t.closest('#nextWelcome')) {
    e.preventDefault();
    e.stopPropagation();
    
    // Save name if provided (from input field if exists)
    const nameInput = document.getElementById('onName');
    if (nameInput && nameInput.value.trim()) {
      state.profile.name = nameInput.value.trim();
    }
    
    // End onboarding process
    state.onboardingComplete = true;
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    
    // Voice feedback
    if (typeof speak === 'function') {
      speak('Welcome! Let\'s continue to your profile.');
    }
    
    // Navigate to profile page - ensure view-profile.html is loaded
    if (typeof navigateToRoute === 'function') {
      navigateToRoute('profile', {
        sectionId: 'view-profile',
        containerId: 'view-profile-container',
        scrollToTop: true,
        updateTab: true,
        skipIfSame: false
      }).then(() => {
        // Ensure DOM elements are properly shown/hidden
        requestAnimationFrame(() => {
          // Hide onboarding
          const routeOnboarding = document.getElementById('route-onboarding');
          if (routeOnboarding) {
            routeOnboarding.classList.add('hidden');
          }
          
          // Show route-app
          const routeApp = document.getElementById('route-app');
          if (routeApp) {
            routeApp.classList.remove('hidden');
          }
          
          // Show profile nav
          const profileNav = document.getElementById('profileNav');
          if (profileNav) {
            profileNav.classList.remove('hidden');
          }
          
          // Load and render profile content
          setTimeout(async () => {
            // Load profile section from sections/view-profile.html if not already loaded
            const profileContainer = document.getElementById('view-profile-container');
            const profileView = document.getElementById('view-profile');
            if (profileContainer && (!profileView || !profileView.innerHTML.trim())) {
              if (typeof loadSection === 'function') {
                await loadSection('view-profile', 'view-profile-container');
                // Update views after loading
                if (typeof updateViews === 'function') {
                  updateViews();
                }
              }
            }
            
            // Render profile components
            if (typeof renderProfileAndGap === 'function') {
              renderProfileAndGap();
            }
            if (typeof renderProfileSections === 'function') {
              renderProfileSections();
            }
            if (typeof renderGuideMeta === 'function') {
              renderGuideMeta();
            }
            if (typeof renderProfileSummary === 'function') {
              renderProfileSummary();
            }
            if (typeof observeSectionAutoExpand === 'function') {
              observeSectionAutoExpand();
            }
            
            // Scroll to top
            try {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (_) {}
          }, 100);
        });
      });
    } else if (typeof setRoute === 'function') {
      setRoute('profile', true);
      // Ensure DOM elements are properly shown/hidden
      requestAnimationFrame(() => {
        // Hide onboarding
        const routeOnboarding = document.getElementById('route-onboarding');
        if (routeOnboarding) {
          routeOnboarding.classList.add('hidden');
        }
        
        // Show route-app
        const routeApp = document.getElementById('route-app');
        if (routeApp) {
          routeApp.classList.remove('hidden');
        }
        
        // Show profile nav
        const profileNav = document.getElementById('profileNav');
        if (profileNav) {
          profileNav.classList.remove('hidden');
        }
        
        // Load and render profile content
        setTimeout(async () => {
          // Load profile section from sections/view-profile.html if not already loaded
          const profileContainer = document.getElementById('view-profile-container');
          const profileView = document.getElementById('view-profile');
          if (profileContainer && (!profileView || !profileView.innerHTML.trim())) {
            if (typeof loadSection === 'function') {
              await loadSection('view-profile', 'view-profile-container');
              // Update views after loading
              if (typeof updateViews === 'function') {
                updateViews();
              }
            }
          }
          
          // Render profile components
          if (typeof renderProfileAndGap === 'function') {
            renderProfileAndGap();
          }
          if (typeof renderProfileSections === 'function') {
            renderProfileSections();
          }
          if (typeof renderGuideMeta === 'function') {
            renderGuideMeta();
          }
          if (typeof renderProfileSummary === 'function') {
            renderProfileSummary();
          }
          if (typeof observeSectionAutoExpand === 'function') {
            observeSectionAutoExpand();
          }
          
          // Scroll to top
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (_) {}
        }, 100);
      });
    }
    
    return;
  }
  
  if (t.id === 'btnGoGap') { e.preventDefault(); setRoute('gap'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {} if (!state.gap) { state.gap = generateGap(); } drawRadar(document.getElementById('gapChart'), state.gap); return; }
  if (t.id === 'btnBackProfileG') { e.preventDefault(); setRoute('profile'); return; }
  if (t.id === 'btnGoPersona') { e.preventDefault(); setRoute('persona'); renderPersona(); return; }
  if (t.id === 'btnBackProfileP') { e.preventDefault(); setRoute('profile'); return; }
  if (t.id === 'btnGeneratePersona') { 
    e.preventDefault(); 
    // Generate new persona data based on user profile
    state.persona = {
      title: 'Persona 1: Biomedical Aesthetic Engineer',
      narrative: {
        core: 'A future engineer who views biology as a medium for art, elegance, and identity.',
        highlight: 'The Beauty of Optional Future',
        description: 'Ten years of dance experience is not just an extracurricular activity, but the primary way to explore human kinesiology, aesthetics, and potential.',
        question: 'How can we design biological solutions, from cell regeneration to advanced prosthetics, that are both practical, elegant, and expressive?'
      },
      highlights: [
        { icon: '💃', label: 'Position Change Connection', active: true },
        { icon: '⚙️', label: 'STEAM', active: false },
        { icon: '💡', label: 'Creative Plus', active: false }
      ],
      alignmentPoints: [
        { icon: '🧠', text: 'Seed Placement' },
        { icon: '🌳', text: 'Root Virtue Activities' },
        { icon: '☆', text: '', empty: true },
        { icon: '💡', text: '◎ Still Concentration' },
        { icon: '★', text: '★ Mutual Innovation' }
      ],
      developmentPlan: [
        { icon: '🧪', label: 'Foundation: Research', stage: 'research' },
        { icon: '⚙️', label: 'Middle: Development', stage: 'development' },
        { icon: '⬆️', label: 'Long-term: Industry', stage: 'industry' }
      ],
      traits: ['Analytical', 'Curiosity-driven', 'Community-minded', 'Arts-integrated']
    };
    renderPersona(); 
    speak('Persona refreshed based on your latest progress.'); 
    return; 
  }
  if (t.id === 'btnOpenAdvisor') { e.preventDefault(); e.stopPropagation(); setRoute('advisor'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {} return; }
  if (t.id === 'btnOpenRoadmap') { e.preventDefault(); e.stopPropagation(); setRoute('roadmap'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {} return; }
  if (t.id === 'btnBackProfileA') { e.preventDefault(); e.stopPropagation(); setRoute('profile'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {} return; }
  if (t.id === 'btnBackProfileR') { e.preventDefault(); e.stopPropagation(); setRoute('profile'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {} return; }
});

// Also bind Hide button directly in case delegation is blocked
function bindToggleTutor() {
const toggleTutorBtn = document.getElementById('toggleTutor');
if (toggleTutorBtn) {
    // Remove existing listeners by cloning
    const newBtn = toggleTutorBtn.cloneNode(true);
    toggleTutorBtn.parentNode.replaceChild(newBtn, toggleTutorBtn);
    newBtn.addEventListener('click', (e)=>{
    e.preventDefault();
      e.stopPropagation();
    const stream = document.getElementById('tutorStream');
    if (!stream) return;
    const hidden = stream.classList.toggle('hidden');
      newBtn.textContent = hidden ? 'Show' : 'Hide';
  });
}
}
bindToggleTutor();

// setRoute function is now in js/router.js

// Tutor Agent - Enhanced Subtitle System
const subtitleStateRef = window.subtitleState || (window.subtitleState = {
  currentText: '',
  fullTranscript: [],
  isExpanded: false,
  isPaused: false,
  currentWordIndex: -1,
  wordHighlights: []
});

// Tutor Agent stream helpers - Updated for floating subtitle in onboarding
function speak(text) {
  subtitleStateRef.currentText = text;
  subtitleStateRef.fullTranscript.push({
    text: text,
    timestamp: Date.now()
  });
  
  // Update floating subtitle if in onboarding
  const onboardingView = document.getElementById('view-onboarding');
  if (onboardingView && onboardingView.classList.contains('active')) {
    if (typeof updateFloatingSubtitle === 'function') {
      updateFloatingSubtitle(text);
      if (typeof updateFloatingSubtitleState === 'function') {
        updateFloatingSubtitleState('speaking');
      }
    }
    // Also update tutor agent subtitle in onboarding
    updateSubtitle(text);
  } else {
    // Update tutor agent subtitle
    updateSubtitle(text);
  }
  
  if (!state.voiceEnabled) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    
    // Track word boundaries for highlighting
    utter.onboundary = (event) => {
      if (event.name === 'word') {
        const onboardingView = document.getElementById('view-onboarding');
        if (onboardingView && onboardingView.classList.contains('active')) {
          if (typeof highlightFloatingWord === 'function') {
            highlightFloatingWord(event.charIndex, event.charLength);
          }
        } else {
          highlightWord(event.charIndex, event.charLength);
        }
      }
    };
    
    utter.onstart = () => {
      const onboardingView = document.getElementById('view-onboarding');
      if (onboardingView && onboardingView.classList.contains('active')) {
        if (typeof updateFloatingSubtitleState === 'function') {
          updateFloatingSubtitleState('speaking');
        }
      } else {
        if (!tutorAgent) {
          tutorAgent = document.getElementById('tutorAgent');
        }
        if (tutorAgent) {
          tutorAgent.classList.add('speaking');
          tutorAgent.classList.remove('paused', 'idle');
        }
      }
    };
    
    utter.onend = () => {
      const onboardingView = document.getElementById('view-onboarding');
      if (onboardingView && onboardingView.classList.contains('active')) {
        if (typeof updateFloatingSubtitleState === 'function') {
          updateFloatingSubtitleState('ended');
        }
      } else {
        if (!tutorAgent) {
          tutorAgent = document.getElementById('tutorAgent');
        }
        if (tutorAgent) {
          tutorAgent.classList.remove('speaking');
          tutorAgent.classList.add('idle');
          setTimeout(() => {
            if (tutorAgent && !tutorAgent.classList.contains('speaking')) {
              tutorAgent.classList.add('idle');
            }
          }, 400);
        }
      }
    };
    
    utter.onpause = () => {
      const onboardingView = document.getElementById('view-onboarding');
      if (onboardingView && onboardingView.classList.contains('active')) {
        if (typeof updateFloatingSubtitleState === 'function') {
          updateFloatingSubtitleState('paused');
        }
      } else {
        if (!tutorAgent) {
          tutorAgent = document.getElementById('tutorAgent');
        }
        if (tutorAgent) {
          tutorAgent.classList.add('paused');
        }
      }
    };
    
    utter.onresume = () => {
      const onboardingView = document.getElementById('view-onboarding');
      if (onboardingView && onboardingView.classList.contains('active')) {
        if (typeof updateFloatingSubtitleState === 'function') {
          updateFloatingSubtitleState('speaking');
        }
      } else {
        if (!tutorAgent) {
          tutorAgent = document.getElementById('tutorAgent');
        }
        if (tutorAgent) {
          tutorAgent.classList.remove('paused');
        }
      }
    };
    
    speechSynthesis.speak(utter);
  } catch (_) {}
}

function updateSubtitle(text) {
  const subtitleText = document.getElementById('subtitleText');
  const subtitleEl = document.getElementById('tutorStream');
  const transcriptContent = document.getElementById('transcriptContent');
  
  if (!subtitleText || !subtitleEl) return;
  
  // Update subtitle text
  subtitleText.textContent = text;
  
  // Add to transcript
  if (transcriptContent) {
    const transcriptItem = document.createElement('div');
    transcriptItem.textContent = text;
    transcriptItem.style.marginBottom = '12px';
    transcriptContent.appendChild(transcriptItem);
    transcriptContent.scrollTop = transcriptContent.scrollHeight;
  }
  
  // Check for overflow
  const lineHeight = parseFloat(getComputedStyle(subtitleText).lineHeight);
  const maxHeight = lineHeight * 3;
  if (subtitleText.scrollHeight > maxHeight) {
    subtitleEl.classList.add('has-overflow');
  } else {
    subtitleEl.classList.remove('has-overflow');
  }
  
  // Tutor agent visibility is controlled by revealPostAuthUI() after authentication
  // Don't show here - only show after login/registration
}

function highlightWord(charIndex, charLength) {
  const highlightEl = document.getElementById('subtitleHighlight');
  const subtitleText = document.getElementById('subtitleText');
  
  if (!highlightEl || !subtitleText) return;
  
  // Create a temporary span to measure word position
  const text = subtitleText.textContent;
  const words = text.split(/\s+/);
  let currentIndex = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordStart = text.indexOf(word, currentIndex);
    
    if (wordStart <= charIndex && charIndex < wordStart + word.length) {
      // Position highlight
      const range = document.createRange();
      const textNode = subtitleText.firstChild;
      
      if (textNode) {
        range.setStart(textNode, wordStart);
        range.setEnd(textNode, wordStart + word.length);
        const rect = range.getBoundingClientRect();
        const subtitleRect = subtitleText.getBoundingClientRect();
        
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

function toggleTranscript() {
  const transcriptEl = document.getElementById('tutorTranscript');
  const subtitleEl = document.getElementById('tutorStream');
  
  if (!transcriptEl || !subtitleEl) return;
  
  subtitleStateRef.isExpanded = !subtitleStateRef.isExpanded;
  
  if (subtitleStateRef.isExpanded) {
    transcriptEl.classList.remove('hidden');
    subtitleEl.classList.add('expanded');
  } else {
    transcriptEl.classList.add('hidden');
    subtitleEl.classList.remove('expanded');
  }
}

function showActionSheet() {
  const actionSheet = document.getElementById('tutorActionSheet');
  if (actionSheet) {
    actionSheet.classList.remove('hidden');
  }
}

function hideActionSheet() {
  const actionSheet = document.getElementById('tutorActionSheet');
  if (actionSheet) {
    actionSheet.classList.add('hidden');
  }
}

// Legacy function for backward compatibility
function tutorAppend(text) {
  // Old implementation - now uses updateSubtitle
  updateSubtitle(text);
}

// Initialize tutor agent interactions
document.addEventListener('DOMContentLoaded', () => {
  const subtitleEl = document.getElementById('tutorStream');
  const transcriptEl = document.getElementById('tutorTranscript');
  const closeTranscript = document.getElementById('closeTranscript');
  const actionCopy = document.getElementById('actionCopy');
  const actionReplay = document.getElementById('actionReplay');
  const actionTranslate = document.getElementById('actionTranslate');
  const waveformEl = document.getElementById('tutorWaveform');
  
  // Click subtitle to toggle transcript
  if (subtitleEl) {
    let longPressTimer = null;
    
    subtitleEl.addEventListener('click', (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      toggleTranscript();
    });
    
    subtitleEl.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        showActionSheet();
        longPressTimer = null;
      }, 500);
    });
    
    subtitleEl.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    subtitleEl.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        longPressTimer = setTimeout(() => {
          showActionSheet();
          longPressTimer = null;
        }, 500);
      }
    });
    
    subtitleEl.addEventListener('mouseup', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    subtitleEl.addEventListener('mouseleave', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
  }
  
  // Close transcript
  if (closeTranscript) {
    closeTranscript.addEventListener('click', () => {
      toggleTranscript();
    });
  }
  
  // Action sheet handlers
  if (actionCopy) {
    actionCopy.addEventListener('click', () => {
      const text = subtitleStateRef.currentText || subtitleStateRef.fullTranscript.map(t => t.text).join('\n');
      navigator.clipboard?.writeText(text).then(() => {
        hideActionSheet();
        speak('Text copied to clipboard');
      });
    });
  }
  
  if (actionReplay) {
    actionReplay.addEventListener('click', () => {
      hideActionSheet();
      if (subtitleStateRef.currentText) {
        speak(subtitleStateRef.currentText);
      }
    });
  }
  
  if (actionTranslate) {
    actionTranslate.addEventListener('click', () => {
      hideActionSheet();
      speak('Translation feature coming soon');
    });
  }
  
  // Click waveform to pause/resume
  if (waveformEl) {
    waveformEl.addEventListener('click', () => {
      if (speechSynthesis.speaking) {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        } else {
          speechSynthesis.pause();
        }
      }
    });
  }
  
  // Click outside to close expanded views
  document.addEventListener('click', (e) => {
    if (subtitleStateRef.isExpanded && transcriptEl && !transcriptEl.contains(e.target) && !subtitleEl.contains(e.target)) {
      toggleTranscript();
    }
    
    const actionSheet = document.getElementById('tutorActionSheet');
    if (actionSheet && !actionSheet.classList.contains('hidden') && !actionSheet.contains(e.target) && !subtitleEl?.contains(e.target)) {
      hideActionSheet();
    }
  });
  
  // Swipe gestures (mobile)
  let touchStartY = 0;
  let touchEndY = 0;
  
  if (subtitleEl) {
    subtitleEl.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    });
    
    subtitleEl.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe up - expand
        if (!subtitleStateRef.isExpanded) {
          toggleTranscript();
        }
      } else {
        // Swipe down - collapse
        if (subtitleStateRef.isExpanded) {
          toggleTranscript();
        }
      }
    }
  }
});

// Input mode state - default to voice input
state.inputMode = state.inputMode || 'voice'; // 'voice' or 'text'
state.voiceRecognitionStarted = false; // Track if recognition has been started

// Initialize tutor agent - only show after authentication
// Tutor agent will be shown via revealPostAuthUI() after login/registration
document.addEventListener('DOMContentLoaded', () => {
  // Don't auto-start voice recognition - wait for user interaction
  // This prevents repeated permission requests
  // Tutor agent will be initialized when user logs in/registers
  
  // Initialize toggleVoice handler
  if (!toggleVoice) {
    toggleVoice = document.getElementById('toggleVoice');
}
  if (toggleVoice) {
toggleVoice.addEventListener('click', () => {
  state.voiceEnabled = !state.voiceEnabled;
  toggleVoice.textContent = 'Voice: ' + (state.voiceEnabled ? 'On' : 'Off');
    });
  }
});

function revealPostAuthUI() {
  if (typeof window.revealTutorAgent === 'function') {
    window.revealTutorAgent();
  }
  state.voiceEnabled = true;
  if (toggleVoice || (toggleVoice = document.getElementById('toggleVoice'))) {
  toggleVoice.textContent = 'Voice: On';
  }
  state.inputMode = state.inputMode || 'voice';
  if (typeof window.updateInputMode === 'function') {
    window.updateInputMode();
  }
  setTimeout(() => {
    if (typeof window.bindToggleTutor === 'function') window.bindToggleTutor();
    if (typeof window.bindTutorAgentEvents === 'function') window.bindTutorAgentEvents();
  }, 100);
}

// Bind all tutor agent event handlers
function bindTutorAgentEvents() {
  // Get elements dynamically (they may not exist when script first loads)
const micBtn = document.getElementById('micBtn');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
  const subtitleEl = document.getElementById('tutorStream');
  const transcriptEl = document.getElementById('tutorTranscript');
  const closeTranscript = document.getElementById('closeTranscript');
  const actionCopy = document.getElementById('actionCopy');
  const actionReplay = document.getElementById('actionReplay');
  const actionTranslate = document.getElementById('actionTranslate');
  const toggleInputModeBtn = document.getElementById('toggleInputMode');
  
  // Mic button click handler
  if (micBtn) {
    // Remove existing listeners by cloning
    const newMicBtn = micBtn.cloneNode(true);
    micBtn.parentNode.replaceChild(newMicBtn, micBtn);
    newMicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.inputMode === 'voice') {
        tryStartSpeechRecognition();
      }
    });
  }
  
  // Send button click handler
  if (sendBtn) {
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    newSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    handleUserMessage();
    });
  }
  
  // User input Enter key handler
  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserMessage();
      }
    });
  }
  
  // Toggle input mode handler
  if (toggleInputModeBtn) {
    const newToggleBtn = toggleInputModeBtn.cloneNode(true);
    toggleInputModeBtn.parentNode.replaceChild(newToggleBtn, toggleInputModeBtn);
    newToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.inputMode = state.inputMode === 'voice' ? 'text' : 'voice';
      if (typeof updateInputMode === 'function') {
        updateInputMode();
      }
    });
  }
  
  // Toggle voice handler
  if (toggleVoice) {
    const newToggleVoice = toggleVoice.cloneNode(true);
    toggleVoice.parentNode.replaceChild(newToggleVoice, toggleVoice);
    toggleVoice = newToggleVoice; // Update reference
    newToggleVoice.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.voiceEnabled = !state.voiceEnabled;
      newToggleVoice.textContent = 'Voice: ' + (state.voiceEnabled ? 'On' : 'Off');
    });
  }
  
  // Subtitle click handler (toggle transcript)
  if (subtitleEl) {
    let longPressTimer = null;
    
    subtitleEl.addEventListener('click', (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      toggleTranscript();
    });
    
    // Long press handler (show action sheet)
    subtitleEl.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        showActionSheet();
        longPressTimer = null;
      }, 500);
});

    subtitleEl.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    subtitleEl.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        longPressTimer = setTimeout(() => {
          showActionSheet();
          longPressTimer = null;
        }, 500);
  }
});

    subtitleEl.addEventListener('mouseup', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    subtitleEl.addEventListener('mouseleave', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    // Swipe gestures (mobile)
    let touchStartY = 0;
    let touchEndY = 0;
    
    subtitleEl.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
});

    subtitleEl.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe up - expand
          if (!subtitleStateRef.isExpanded) {
            toggleTranscript();
          }
  } else {
          // Swipe down - collapse
          if (subtitleStateRef.isExpanded) {
            toggleTranscript();
          }
        }
      }
    }
  }
  
  // Close transcript handler
  if (closeTranscript) {
    closeTranscript.addEventListener('click', (e) => {
    e.preventDefault();
      e.stopPropagation();
      toggleTranscript();
    });
  }
  
  // Action sheet handlers
  if (actionCopy) {
    actionCopy.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const subtitleText = document.getElementById('subtitleText');
      if (subtitleText && subtitleText.textContent) {
        navigator.clipboard.writeText(subtitleText.textContent).then(() => {
          speak('Text copied to clipboard');
          hideActionSheet();
        }).catch(() => {
          speak('Failed to copy text');
        });
      }
    });
  }
  
  if (actionReplay) {
    actionReplay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const subtitleText = document.getElementById('subtitleText');
      if (subtitleText && subtitleText.textContent) {
        speak(subtitleText.textContent);
      }
      hideActionSheet();
    });
  }
  
  if (actionTranslate) {
    actionTranslate.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      speak('Translation feature coming soon');
      hideActionSheet();
    });
  }
  
  // Click outside to close action sheet
  document.addEventListener('click', (e) => {
    const actionSheet = document.getElementById('tutorActionSheet');
    const subtitleEl = document.getElementById('tutorStream');
    if (actionSheet && !actionSheet.classList.contains('hidden') && !actionSheet.contains(e.target) && !subtitleEl?.contains(e.target)) {
      hideActionSheet();
    }
  });
}

function updateInputMode() {
  const inputModeText = document.getElementById('inputModeText');
  const tutorInputArea = document.getElementById('tutorInputArea');
  const micBtn = document.getElementById('micBtn');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  
  if (!inputModeText || !tutorInputArea) return;
  
  if (state.inputMode === 'voice') {
    inputModeText.textContent = 'Voice Input';
    tutorInputArea.classList.add('voice-mode');
    tutorInputArea.classList.remove('text-mode');
    if (micBtn) micBtn.style.display = 'flex';
    if (sendBtn) sendBtn.style.display = 'none';
    if (userInput) {
      userInput.placeholder = 'Tap microphone to speak...';
      userInput.style.display = 'none';
    }
    
    // Don't auto-start voice recognition - wait for user to click mic button
    // This prevents repeated permission requests
    stopSpeechRecognition();
  } else {
    inputModeText.textContent = 'Text Input';
    tutorInputArea.classList.add('text-mode');
    tutorInputArea.classList.remove('voice-mode');
    if (micBtn) micBtn.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'flex';
    if (userInput) {
      userInput.placeholder = 'Type your message...';
      userInput.style.display = 'block';
      userInput.focus();
    }
    
    // Stop voice recognition when switching to text mode
    stopSpeechRecognition();
  }
}

// Toggle input mode handler
// Voice interactions are now managed by demo/js/voice.js

// Input area
const micBtn = document.getElementById('micBtn');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let speechRecognitionInstance = null;

function tryStartSpeechRecognition(){
  // Only start recognition on explicit user interaction (clicking mic button)
  // This prevents repeated permission requests
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { 
    speak('Speech recognition not supported in this browser.');
    return; 
  }
  
  // Stop existing recognition if any
  stopSpeechRecognition();
  
  speechRecognitionInstance = new SR();
  speechRecognitionInstance.lang = 'en-US';
  speechRecognitionInstance.continuous = false; // Changed to false - only recognize once per click
  speechRecognitionInstance.interimResults = true;
  
  speechRecognitionInstance.onresult = (e) => {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      const text = finalTranscript.trim();
      if (userInput) {
        userInput.value = text;
      }
      handleUserMessage();
      // Stop recognition after getting final result
      stopSpeechRecognition();
    } else if (interimTranscript && userInput) {
      userInput.value = interimTranscript;
    }
  };
  
  speechRecognitionInstance.onerror = (e) => {
    if (e.error === 'not-allowed') {
      speak('Microphone permission denied. Please allow microphone access in your browser settings.');
    } else if (e.error !== 'no-speech') {
      console.error('Speech recognition error:', e.error);
    }
    stopSpeechRecognition();
  };
  
  speechRecognitionInstance.onend = () => {
    // Don't auto-restart - wait for user to click mic button again
    speechRecognitionInstance = null;
    state.voiceRecognitionStarted = false;
  };
  
  try { 
    speechRecognitionInstance.start();
    window.speechRecognitionInstance = speechRecognitionInstance;
    state.voiceRecognitionStarted = true;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    stopSpeechRecognition();
    if (err.name === 'NotAllowedError') {
      speak('Microphone permission denied. Please allow microphone access.');
    } else {
      speak('Please click the microphone button to start voice input.');
    }
    }
  }

function stopSpeechRecognition() {
  if (speechRecognitionInstance) {
    try {
      speechRecognitionInstance.stop();
      speechRecognitionInstance = null;
      state.voiceRecognitionStarted = false;
    } catch (_) {}
  }
  if (window.speechRecognitionInstance) {
    try {
      window.speechRecognitionInstance.stop();
      window.speechRecognitionInstance = null;
    } catch (_) {}
  }
}

// Event handlers are now bound in bindTutorAgentEvents() which is called after authentication
// This ensures elements exist before binding events

function handleUserMessage(){
  const userInput = document.getElementById('userInput');
  if (!userInput) return;
  
  const text = userInput.value.trim();
  if (!text) return;
  tutorAppend('You: ' + text);
  userInput.value = '';
  
  // Process voice input for profile information when on profile route
  if (state.route === 'profile') {
    if (typeof handleProfileVoiceText === 'function') {
      handleProfileVoiceText(text);
    }
  }
  
  // Route navigation based on keywords
  if (/onboard|onboarding|register|guide/i.test(text)) {
    if (typeof setRoute === 'function') setRoute('onboarding');
  } else if (/profile|persona/i.test(text)) {
    if (typeof setRoute === 'function') setRoute('profile');
  } else if (/advisor|major|compare/i.test(text)) {
    if (typeof setRoute === 'function') setRoute('advisor');
  } else if (/roadmap|plan/i.test(text)) {
    if (typeof setRoute === 'function') setRoute('roadmap');
  } else if (/gap|analysis/i.test(text)) {
    if (typeof setRoute === 'function') setRoute('gap');
  } else {
    // General response
    tutorAppend('AI: I heard "' + text + '". How can I help you with your college application?');
  }
}

// Event handlers are now bound in bindTutorAgentEvents() which is called after authentication

// ONBOARDING flows - merged from js/onboarding.js
const onboardStep = document.getElementById('onboardStep');
const inputRounds = { background: 0, interests: 0, targets: 0, learningStyle: 0 };
let onboardingVoiceRecognition = null;
let activeVoiceInputField = null;

const voiceGuidance = {
  welcome: { en: "Welcome to SuperOS! I'm your AI Tutor, and I'll guide you through setting up your profile. Let's start with the basics. What's your name?", zh: "欢迎来到 SuperOS！我是您的 AI 导师，将引导您完成个人资料设置。让我们从基本信息开始。请问您的姓名是什么？" },
  background: { en: "Tell me about your academic background. You can share your grade level, courses, achievements, or competitions.", zh: "请告诉我您的学术背景。您可以分享您的年级、课程、成就或竞赛经历。" },
  interests: { en: "What subjects and topics interest you? You can type multiple interests separated by commas.", zh: "您对哪些学科和主题感兴趣？您可以输入多个兴趣，用逗号分隔。" },
  targets: { en: "Now let's set your goals using interactive forms! Please click on the buttons below to select your target majors and universities. You can also speak your choices.", zh: "现在让我们使用交互式表单来设定您的目标！请点击下面的按钮选择您的目标专业和大学。您也可以说出您的选择。" },
  learningStyle: { en: "How do you learn best? Understanding your learning style helps me tailor recommendations and resources for you.", zh: "您如何学习效果最好？了解您的学习风格有助于我为您定制推荐和资源。" }
};

function getVoiceGuidance(key) {
  const language = state.preferredLanguage || 'en';
  return voiceGuidance[key]?.[language] || voiceGuidance[key]?.en || '';
}

function startVoiceInputForField(inputField, button) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (typeof speak === 'function') speak('Speech recognition is not supported in this browser.');
    return;
  }
  stopVoiceInput();
  activeVoiceInputField = inputField;
  if (button) button.classList.add('listening');
  onboardingVoiceRecognition = new SpeechRecognition();
  onboardingVoiceRecognition.lang = state.preferredLanguage === 'zh' ? 'zh-CN' : 'en-US';
  onboardingVoiceRecognition.continuous = false;
  onboardingVoiceRecognition.interimResults = true;
  onboardingVoiceRecognition.onresult = (event) => {
    let finalTranscript = '', interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      else interimTranscript += transcript;
    }
    if (finalTranscript && inputField) {
      const text = finalTranscript.trim();
      if (inputField.tagName === 'TEXTAREA') {
        inputField.value = inputField.value ? inputField.value + ' ' + text : text;
      } else {
        inputField.value = inputField.value ? inputField.value + ', ' + text : text;
      }
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
      stopVoiceInput();
      if (typeof speak === 'function') speak('Voice input received.');
    } else if (interimTranscript && inputField) {
      const currentValue = inputField.value.trim();
      if (inputField.tagName === 'TEXTAREA') {
        inputField.value = currentValue ? currentValue + ' ' + interimTranscript : interimTranscript;
      } else {
        inputField.value = currentValue ? currentValue + ', ' + interimTranscript : interimTranscript;
      }
    }
  };
  onboardingVoiceRecognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      if (typeof speak === 'function') speak('Microphone permission denied. Please allow microphone access in your browser settings.');
    } else if (event.error !== 'no-speech') {
      console.error('Voice recognition error:', event.error);
      if (typeof speak === 'function') speak('Voice recognition error occurred. Please try again.');
    }
    stopVoiceInput();
  };
  onboardingVoiceRecognition.onend = () => stopVoiceInput();
  try {
    onboardingVoiceRecognition.start();
    if (typeof speak === 'function') speak('Listening... Please speak now.');
  } catch (error) {
    console.error('Failed to start voice recognition:', error);
    stopVoiceInput();
  }
}

function stopVoiceInput() {
  if (onboardingVoiceRecognition) {
    try { onboardingVoiceRecognition.stop(); } catch (e) {}
    onboardingVoiceRecognition = null;
  }
  if (activeVoiceInputField) activeVoiceInputField = null;
  document.querySelectorAll('.voice-input-btn').forEach(btn => btn.classList.remove('listening'));
}

function bindOnboardingButtons() {
  const btnOnboardBack = document.getElementById('btnOnboardBack');
  const btnSkipOnboard = document.getElementById('btnSkipOnboard');
  if (btnOnboardBack) {
    const newBackBtn = btnOnboardBack.cloneNode(true);
    btnOnboardBack.parentNode.replaceChild(newBackBtn, btnOnboardBack);
    newBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.onboardingIndex > 0) {
        if (navigator.vibrate) navigator.vibrate(10);
        goStep(state.onboardingIndex - 1);
      }
    });
    if (state.onboardingIndex === 0) {
      newBackBtn.classList.add('disabled');
      newBackBtn.setAttribute('aria-disabled', 'true');
      newBackBtn.disabled = true;
    } else {
      newBackBtn.classList.remove('disabled');
      newBackBtn.removeAttribute('aria-disabled');
      newBackBtn.disabled = false;
    }
  }
  if (btnSkipOnboard) {
    const newSkipBtn = btnSkipOnboard.cloneNode(true);
    btnSkipOnboard.parentNode.replaceChild(newSkipBtn, btnSkipOnboard);
    newSkipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // End onboarding process
      state.onboardingComplete = true;
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
      
      // Voice feedback
      if (typeof speak === 'function') {
        speak('Skipping onboarding. Welcome to your profile!');
      }
      
      // Navigate to profile page - use setRoute with force flag
      if (typeof setRoute === 'function') {
        setRoute('profile', true);
      }
      
      // Ensure DOM elements are properly shown/hidden
      requestAnimationFrame(() => {
        // Hide onboarding
        const routeOnboarding = document.getElementById('route-onboarding');
        if (routeOnboarding) {
          routeOnboarding.classList.add('hidden');
        }
        
        // Show route-app
        const routeApp = document.getElementById('route-app');
        if (routeApp) {
          routeApp.classList.remove('hidden');
        }
        
        // Show profile nav
        const profileNav = document.getElementById('profileNav');
        if (profileNav) {
          profileNav.classList.remove('hidden');
        }
        
        // Activate view-profile
        const viewProfile = document.getElementById('view-profile');
        if (viewProfile) {
          viewProfile.classList.add('active');
          // Hide other views
          document.querySelectorAll('.view').forEach(view => {
            if (view !== viewProfile && view.id !== 'view-profile') {
              view.classList.remove('active');
            }
          });
        }
        
        // Render profile content after route change
        setTimeout(() => {
          // Render profile components
          if (typeof renderProfileAndGap === 'function') {
            renderProfileAndGap();
          }
          if (typeof renderProfileSections === 'function') {
            renderProfileSections();
          }
          if (typeof renderGuideMeta === 'function') {
            renderGuideMeta();
          }
          if (typeof observeSectionAutoExpand === 'function') {
            observeSectionAutoExpand();
          }
          
          // Scroll to top
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (_) {}
        }, 100);
      });
    });
  }
}

function isInputSufficient(text, minLength = 20) {
  return text && text.trim().length >= minLength;
}

function generateFollowUpQuestion(stepId, input) {
  const lowerInput = input.toLowerCase();
  if (stepId === 'background') {
    if (!lowerInput.includes('grade') && !lowerInput.includes('year')) return 'What grade level are you currently in?';
    if (!lowerInput.includes('course') && !lowerInput.includes('class') && !lowerInput.includes('ap')) return 'What courses or classes are you taking?';
    if (!lowerInput.includes('achievement') && !lowerInput.includes('competition') && !lowerInput.includes('award')) return 'Do you have any achievements or awards you\'d like to share?';
  } else if (stepId === 'interests') {
    if (lowerInput.split(',').length < 3) return 'Great! Can you tell me a few more interests or hobbies?';
  }
  return null;
}

const steps = [
  {
    id: 'welcome',
    render: () => `
      <div class="onboarding-step-content">
        <div class="onboarding-step-header">
          <div class="tutor-message">
            <span class="tutor-label">AI Tutor</span>
            <p class="tutor-text">Welcome to SuperOS! I'm your AI Tutor, and I'll guide you through setting up your profile. Let's start with the basics.</p>
          </div>
        </div>
        <div class="onboarding-step-body">
          <div class="input-group">
            <label for="onName" class="input-label">What's your name?</label>
            <div class="input-with-voice">
              <input type="text" id="onName" class="onboarding-input" placeholder="Enter your full name or click mic to speak" autocomplete="name" required />
              <button type="button" class="voice-input-btn" id="voiceBtnName" aria-label="Voice input for name" title="Click to speak your name">🎤</button>
            </div>
            <span class="input-hint">This helps us personalize your experience</span>
          </div>
          <div class="step-info-box">
            <div class="info-icon">📝</div>
            <div class="info-content">
              <div class="info-title">Information Required</div>
              <div class="info-text">Please provide your full name to continue. You can type or click the microphone button to speak your name.</div>
            </div>
          </div>
        </div>
        <div class="onboarding-step-footer">
          <button id="nextWelcome" class="btn-onboarding-primary">Continue</button>
        </div>
      </div>
    `,
    bind: () => {
      if (typeof speak === 'function') speak(getVoiceGuidance('welcome'));
      const nameInput = document.getElementById('onName');
      const voiceBtn = document.getElementById('voiceBtnName');
      const nextBtn = document.getElementById('nextWelcome');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
        nameInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (nextBtn) nextBtn.click(); }
        });
      }
      if (voiceBtn && nameInput) {
        voiceBtn.addEventListener('click', () => startVoiceInputForField(nameInput, voiceBtn));
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          // Save name if provided
          if (nameInput && nameInput.value.trim()) {
            state.profile.name = nameInput.value.trim();
          }
          
          // Force end onboarding and navigate to profile
          state.onboardingComplete = true;
          
          // Haptic feedback
          if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
          
          // Voice feedback
          if (typeof speak === 'function') {
            speak('Welcome! Let\'s continue to your profile.');
          }
          
          // Navigate to profile page - use setRoute with force flag
          if (typeof setRoute === 'function') {
            setRoute('profile', true);
          }
          
          // Ensure DOM elements are properly shown/hidden
          requestAnimationFrame(() => {
            // Hide onboarding
            const routeOnboarding = document.getElementById('route-onboarding');
            if (routeOnboarding) {
              routeOnboarding.classList.add('hidden');
            }
            
            // Show route-app
            const routeApp = document.getElementById('route-app');
            if (routeApp) {
              routeApp.classList.remove('hidden');
            }
            
            // Show profile nav
            const profileNav = document.getElementById('profileNav');
            if (profileNav) {
              profileNav.classList.remove('hidden');
            }
            
            // Activate view-profile
            const viewProfile = document.getElementById('view-profile');
            if (viewProfile) {
              viewProfile.classList.add('active');
              // Hide other views
              document.querySelectorAll('.view').forEach(view => {
                if (view !== viewProfile && view.id !== 'view-profile') {
                  view.classList.remove('active');
                }
              });
            }
            
            // Render profile content after route change
            setTimeout(() => {
              // Render profile components
              if (typeof renderProfileAndGap === 'function') {
                renderProfileAndGap();
              }
              if (typeof renderProfileSections === 'function') {
                renderProfileSections();
              }
              if (typeof renderGuideMeta === 'function') {
                renderGuideMeta();
              }
              if (typeof observeSectionAutoExpand === 'function') {
                observeSectionAutoExpand();
              }
              
              // Scroll to top
              try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (_) {}
            }, 100);
          });
        };
      }
    }
  },
  {
    id: 'background',
    render: () => {
      const isFollowUp = inputRounds.background > 0;
      const currentBg = state.profile.background || '';
      return `
        <div class="onboarding-step-content">
          <div class="onboarding-step-header">
            <div class="tutor-message ${isFollowUp ? 'follow-up' : ''}">
              <span class="tutor-label">AI Tutor</span>
              <p class="tutor-text">${isFollowUp ? generateFollowUpQuestion('background', currentBg) || 'Can you tell me more about your academic background?' : 'Tell me about your academic background. This helps us understand where you\'re starting from. You can share your grade level, courses, achievements, or competitions.'}</p>
            </div>
          </div>
          <div class="onboarding-step-body">
            <div class="input-group">
              <label for="onBg" class="input-label">Academic Background</label>
              <div class="input-with-voice">
                <textarea id="onBg" class="onboarding-input onboarding-textarea" placeholder="E.g., Grade 11 student, AP Calculus, National Math Competition winner, Science Olympiad participant... Or click mic to speak" rows="4" required>${currentBg}</textarea>
                <button type="button" class="voice-input-btn" id="voiceBtnBg" aria-label="Voice input for academic background" title="Click to speak your academic background">🎤</button>
              </div>
              <span class="input-hint">Include your grade level, courses, achievements, competitions, etc.</span>
            </div>
            <div class="step-info-box">
              <div class="info-icon">📚</div>
              <div class="info-content">
                <div class="info-title">Information Required</div>
                <div class="info-text">Please share your academic background including grade level, courses, achievements, or competitions. You can type or use voice input via the microphone button below.</div>
              </div>
            </div>
          </div>
          <div class="onboarding-step-footer">
            <button id="nextBg" class="btn-onboarding-primary">${isFollowUp ? 'Continue' : 'Next'}</button>
            ${isFollowUp ? '<button id="skipBg" class="btn-onboarding-secondary" style="margin-left: 12px;">That\'s enough</button>' : ''}
          </div>
        </div>
      `;
    },
    bind: () => {
      const isFollowUp = inputRounds.background > 0;
      const currentBg = state.profile.background || '';
      const followUpQ = generateFollowUpQuestion('background', currentBg);
      if (typeof speak === 'function') {
        if (isFollowUp && followUpQ) speak(followUpQ);
        else speak(getVoiceGuidance('background'));
      }
      const bgInput = document.getElementById('onBg');
      const voiceBtn = document.getElementById('voiceBtnBg');
      const nextBtn = document.getElementById('nextBg');
      const skipBtn = document.getElementById('skipBg');
      if (bgInput) setTimeout(() => bgInput.focus(), 100);
      if (voiceBtn && bgInput) {
        voiceBtn.addEventListener('click', () => startVoiceInputForField(bgInput, voiceBtn));
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (!bgInput) return;
          const bg = bgInput.value.trim();
          if (!bg) {
            bgInput.classList.add('input-error');
            bgInput.setAttribute('aria-invalid', 'true');
            if (typeof speak === 'function') speak('Please share some information about your academic background.');
            return;
          }
          bgInput.classList.remove('input-error');
          const isSufficient = isInputSufficient(bg, 30);
          const followUpQ = generateFollowUpQuestion('background', bg);
          if (!isSufficient && followUpQ && inputRounds.background === 0) {
            state.profile.background = bg;
            inputRounds.background = 1;
            if (typeof speak === 'function') speak(followUpQ);
            setTimeout(() => { if (typeof goStep === 'function') goStep(1); }, 1500);
          } else {
            state.profile.background = bg;
            inputRounds.interests = 0;
            if (typeof speak === 'function') speak('Great! Now let\'s talk about your interests.');
            setTimeout(() => { if (typeof goStep === 'function') goStep(2); }, 1500);
          }
        };
      }
      if (skipBtn) {
        skipBtn.onclick = () => {
          inputRounds.interests = 0;
          if (typeof speak === 'function') speak('That\'s fine. Let\'s move on to your interests.');
          setTimeout(() => { if (typeof goStep === 'function') goStep(2); }, 1000);
        };
      }
    }
  },
  {
    id: 'interests',
    render: () => {
      const isFollowUp = inputRounds.interests > 0;
      const currentInterests = state.profile.interests || [];
      return `
        <div class="onboarding-step-content">
          <div class="onboarding-step-header">
            <div class="tutor-message ${isFollowUp ? 'follow-up' : ''}">
              <span class="tutor-label">AI Tutor</span>
              <p class="tutor-text">${isFollowUp ? 'Can you tell me a few more interests or topics you\'re curious about?' : 'What subjects and topics interest you? This helps us recommend relevant majors and programs. You can type multiple interests separated by commas.'}</p>
            </div>
          </div>
          <div class="onboarding-step-body">
            <div class="input-group">
              <label for="onInterests" class="input-label">Your Interests</label>
              <div class="input-with-voice">
                <input type="text" id="onInterests" class="onboarding-input" placeholder="AI, Economics, Biology, Psychology, Engineering... Or click mic to speak" autocomplete="off" value="${currentInterests.join(', ')}" required />
                <button type="button" class="voice-input-btn" id="voiceBtnInterests" aria-label="Voice input for interests" title="Click to speak your interests">🎤</button>
              </div>
              <span class="input-hint">Separate multiple interests with commas</span>
            </div>
            <div class="step-info-box">
              <div class="info-icon">🎯</div>
              <div class="info-content">
                <div class="info-title">Information Required</div>
                <div class="info-text">Please tell us about your interests and subjects you're curious about. You can type multiple interests separated by commas, or use voice input via the microphone button below.</div>
              </div>
            </div>
          </div>
          <div class="onboarding-step-footer">
            <button id="nextInterests" class="btn-onboarding-primary">${isFollowUp ? 'Continue' : 'Next'}</button>
            ${isFollowUp ? '<button id="skipInterests" class="btn-onboarding-secondary" style="margin-left: 12px;">That\'s enough</button>' : ''}
          </div>
        </div>
      `;
    },
    bind: () => {
      const isFollowUp = inputRounds.interests > 0;
      if (typeof speak === 'function') {
        if (isFollowUp) speak('Can you tell me a few more interests or topics you\'re curious about?');
        else speak(getVoiceGuidance('interests'));
      }
      const interestsInput = document.getElementById('onInterests');
      const voiceBtn = document.getElementById('voiceBtnInterests');
      const nextBtn = document.getElementById('nextInterests');
      const skipBtn = document.getElementById('skipInterests');
      if (interestsInput) {
        setTimeout(() => interestsInput.focus(), 100);
        interestsInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (nextBtn) nextBtn.click(); }
        });
      }
      if (voiceBtn && interestsInput) {
        voiceBtn.addEventListener('click', () => startVoiceInputForField(interestsInput, voiceBtn));
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (!interestsInput) return;
          const raw = interestsInput.value.trim();
          if (!raw) {
            interestsInput.classList.add('input-error');
            interestsInput.setAttribute('aria-invalid', 'true');
            if (typeof speak === 'function') speak('Please share at least one interest.');
            return;
          }
          interestsInput.classList.remove('input-error');
          const interests = raw.split(',').map(s => s.trim()).filter(Boolean);
          const isSufficient = interests.length >= 3;
          if (!isSufficient && inputRounds.interests === 0) {
            state.profile.interests = interests;
            inputRounds.interests = 1;
            if (typeof speak === 'function') speak('Great! Can you tell me a few more interests or topics you\'re curious about?');
            setTimeout(() => { if (typeof goStep === 'function') goStep(2); }, 1500);
          } else {
            state.profile.interests = interests;
            inputRounds.targets = 0;
            if (typeof speak === 'function') speak('Perfect! Now I\'ll guide you through a more structured form to capture your goals. Please use the interactive buttons and inputs to provide your information.');
            setTimeout(() => { if (typeof goStep === 'function') goStep(3); }, 1500);
          }
        };
      }
      if (skipBtn) {
        skipBtn.onclick = () => {
          inputRounds.targets = 0;
          if (typeof speak === 'function') speak('That\'s fine. Let\'s move on to setting your goals.');
          setTimeout(() => { if (typeof goStep === 'function') goStep(3); }, 1000);
        };
      }
    }
  },
  {
    id: 'targets',
    render: () => {
      const selectedMajors = state.profile.targetMajors || [];
      const selectedSchools = state.profile.targetSchools || [];
      const popularMajors = ['Computer Science', 'Engineering', 'Business', 'Economics', 'Biology', 'Psychology', 'Medicine', 'Law', 'Arts', 'Education'];
      const popularSchools = ['MIT', 'Stanford', 'Harvard', 'Yale', 'Princeton', 'UC Berkeley', 'UCLA', 'Columbia', 'Cornell', 'UChicago'];
      return `
        <div class="onboarding-step-content">
          <div class="onboarding-step-header">
            <div class="tutor-message">
              <span class="tutor-label">AI Tutor</span>
              <p class="tutor-text">Now let's set your goals using interactive forms! Please click on the buttons below to select your target majors and universities. You can select multiple options by clicking on them. This helps me understand your preferences better.</p>
            </div>
          </div>
          <div class="onboarding-step-body">
            <div class="input-group">
              <label for="onMajors" class="input-label">Target Majors</label>
              <div class="chip-selector" id="majorSelector">
                ${popularMajors.map(major => `<button type="button" class="chip-option ${selectedMajors.includes(major) ? 'selected' : ''}" data-value="${major}" data-type="major">${major}</button>`).join('')}
              </div>
              <div class="input-with-voice" style="margin-top: 12px;">
                <input type="text" id="onMajorsCustom" class="onboarding-input" placeholder="Or type custom majors (comma-separated) or click mic to speak" autocomplete="off" />
                <button type="button" class="voice-input-btn" id="voiceBtnMajors" aria-label="Voice input for majors" title="Click to speak your target majors">🎤</button>
              </div>
              <span class="input-hint">Click to select or type custom majors</span>
            </div>
            <div class="input-group" data-optional="true">
              <label for="onSchools" class="input-label">Target Universities</label>
              <div class="chip-selector" id="schoolSelector">
                ${popularSchools.map(school => `<button type="button" class="chip-option ${selectedSchools.includes(school) ? 'selected' : ''}" data-value="${school}" data-type="school">${school}</button>`).join('')}
              </div>
              <div class="input-with-voice" style="margin-top: 12px;">
                <input type="text" id="onSchoolsCustom" class="onboarding-input" placeholder="Or type custom universities (comma-separated) or click mic to speak" autocomplete="off" />
                <button type="button" class="voice-input-btn" id="voiceBtnSchools" aria-label="Voice input for schools" title="Click to speak your target universities">🎤</button>
              </div>
              <span class="input-hint">Click to select or type custom universities</span>
            </div>
            <div class="step-info-box">
              <div class="info-icon">🎓</div>
              <div class="info-content">
                <div class="info-title">Information Required</div>
                <div class="info-text">Please select at least one target major by clicking on the buttons above. You can also type custom majors or universities. Voice input is available via the microphone button below.</div>
              </div>
            </div>
          </div>
          <div class="onboarding-step-footer">
            <button id="nextTargets" class="btn-onboarding-primary">Continue</button>
          </div>
        </div>
      `;
    },
    bind: () => {
      if (typeof speak === 'function') speak(getVoiceGuidance('targets'));
      const majorSelector = document.getElementById('majorSelector');
      const schoolSelector = document.getElementById('schoolSelector');
      const majorsCustom = document.getElementById('onMajorsCustom');
      const schoolsCustom = document.getElementById('onSchoolsCustom');
      const voiceBtnMajors = document.getElementById('voiceBtnMajors');
      const voiceBtnSchools = document.getElementById('voiceBtnSchools');
      const nextBtn = document.getElementById('nextTargets');
      if (voiceBtnMajors && majorsCustom) {
        voiceBtnMajors.addEventListener('click', () => startVoiceInputForField(majorsCustom, voiceBtnMajors));
      }
      if (voiceBtnSchools && schoolsCustom) {
        voiceBtnSchools.addEventListener('click', () => startVoiceInputForField(schoolsCustom, voiceBtnSchools));
      }
      if (!state.profile.targetMajors) state.profile.targetMajors = [];
      if (!state.profile.targetSchools) state.profile.targetSchools = [];
      const handleChipClick = (e) => {
        const chip = e.target.closest('.chip-option');
        if (!chip) return;
        e.preventDefault();
        const value = chip.dataset.value;
        const type = chip.dataset.type;
        if (type === 'major') {
          const index = state.profile.targetMajors.indexOf(value);
          if (index > -1) {
            state.profile.targetMajors.splice(index, 1);
            chip.classList.remove('selected');
            chip.setAttribute('aria-pressed', 'false');
          } else {
            state.profile.targetMajors.push(value);
            chip.classList.add('selected');
            chip.setAttribute('aria-pressed', 'true');
          }
        } else if (type === 'school') {
          const index = state.profile.targetSchools.indexOf(value);
          if (index > -1) {
            state.profile.targetSchools.splice(index, 1);
            chip.classList.remove('selected');
            chip.setAttribute('aria-pressed', 'false');
          } else {
            state.profile.targetSchools.push(value);
            chip.classList.add('selected');
            chip.setAttribute('aria-pressed', 'true');
          }
        }
        chip.style.transform = 'scale(0.95)';
        setTimeout(() => { chip.style.transform = ''; }, 150);
        if (typeof speak === 'function') {
          const isSelected = chip.classList.contains('selected');
          speak(`${value} ${isSelected ? 'selected' : 'deselected'}.`);
        }
      };
      if (majorSelector) majorSelector.addEventListener('click', handleChipClick);
      if (schoolSelector) schoolSelector.addEventListener('click', handleChipClick);
      if (majorsCustom) {
        majorsCustom.addEventListener('blur', () => {
          const custom = majorsCustom.value.split(',').map(s => s.trim()).filter(Boolean);
          if (custom.length > 0) {
            state.profile.targetMajors = [...new Set([...state.profile.targetMajors, ...custom])];
            majorsCustom.value = '';
            setTimeout(() => { if (typeof goStep === 'function') goStep(3); }, 100);
          }
        });
        majorsCustom.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); majorsCustom.blur(); }
        });
      }
      if (schoolsCustom) {
        schoolsCustom.addEventListener('blur', () => {
          const custom = schoolsCustom.value.split(',').map(s => s.trim()).filter(Boolean);
          if (custom.length > 0) {
            state.profile.targetSchools = [...new Set([...state.profile.targetSchools, ...custom])];
            schoolsCustom.value = '';
            setTimeout(() => { if (typeof goStep === 'function') goStep(3); }, 100);
          }
        });
        schoolsCustom.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); schoolsCustom.blur(); }
        });
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          const majors = state.profile.targetMajors || [];
          if (majors.length === 0) {
            if (typeof speak === 'function') speak('Please select at least one target major to continue.');
            return;
          }
          if (typeof speak === 'function') speak('Great! Now let\'s learn about your learning style. This helps me personalize your experience.');
          setTimeout(() => { if (typeof goStep === 'function') goStep(4); }, 1500);
        };
      }
    }
  },
  {
    id: 'learningStyle',
    render: () => {
      const selectedStyle = state.profile.learningStyle || '';
      const learningStyles = [
        { value: 'visual', label: 'Visual Learner', icon: '👁️', description: 'Learn best through images, diagrams, and visual aids' },
        { value: 'auditory', label: 'Auditory Learner', icon: '👂', description: 'Learn best through listening and verbal explanations' },
        { value: 'kinesthetic', label: 'Kinesthetic Learner', icon: '✋', description: 'Learn best through hands-on activities and practice' },
        { value: 'reading', label: 'Reading/Writing Learner', icon: '📖', description: 'Learn best through reading and writing' },
        { value: 'mixed', label: 'Mixed Learning Style', icon: '🔄', description: 'Combination of multiple learning styles' }
      ];
      return `
        <div class="onboarding-step-content">
          <div class="onboarding-step-header">
            <div class="tutor-message">
              <span class="tutor-label">AI Tutor</span>
              <p class="tutor-text">How do you learn best? Understanding your learning style helps me tailor recommendations and resources for you. Please select the option that best describes you.</p>
            </div>
          </div>
          <div class="onboarding-step-body">
            <div class="input-group">
              <label class="input-label">Learning Style</label>
              <div class="learning-style-selector" id="learningStyleSelector">
                ${learningStyles.map(style => `<button type="button" class="learning-style-option ${selectedStyle === style.value ? 'selected' : ''}" data-value="${style.value}" aria-pressed="${selectedStyle === style.value}">
                  <span class="style-icon">${style.icon}</span>
                  <div class="style-content">
                    <div class="style-label">${style.label}</div>
                    <div class="style-description">${style.description}</div>
                  </div>
                </button>`).join('')}
              </div>
              <span class="input-hint">Select the learning style that best matches how you learn</span>
            </div>
            <div class="step-info-box">
              <div class="info-icon">🧠</div>
              <div class="info-content">
                <div class="info-title">Information Required</div>
                <div class="info-text">Please select your learning style by clicking on one of the options above. This helps us personalize your learning experience. Voice guidance is available via the microphone button below.</div>
              </div>
            </div>
          </div>
          <div class="onboarding-step-footer">
            <button id="nextLearningStyle" class="btn-onboarding-primary">Continue</button>
          </div>
        </div>
      `;
    },
    bind: () => {
      if (typeof speak === 'function') speak(getVoiceGuidance('learningStyle'));
      const styleSelector = document.getElementById('learningStyleSelector');
      const nextBtn = document.getElementById('nextLearningStyle');
      if (!state.profile.learningStyle) state.profile.learningStyle = '';
      if (styleSelector) {
        styleSelector.addEventListener('click', (e) => {
          const option = e.target.closest('.learning-style-option');
          if (!option) return;
          e.preventDefault();
          const value = option.dataset.value;
          state.profile.learningStyle = value;
          styleSelector.querySelectorAll('.learning-style-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-pressed', 'false');
          });
          option.classList.add('selected');
          option.setAttribute('aria-pressed', 'true');
          option.style.transform = 'scale(0.98)';
          setTimeout(() => { option.style.transform = ''; }, 150);
          const styleLabels = { visual: 'Visual Learner', auditory: 'Auditory Learner', kinesthetic: 'Kinesthetic Learner', reading: 'Reading and Writing Learner', mixed: 'Mixed Learning Style' };
          if (typeof speak === 'function') speak(`You selected ${styleLabels[value]}.`);
        });
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (!state.profile.learningStyle) {
            if (typeof speak === 'function') speak('Please select your learning style to continue.');
            return;
          }
          if (typeof speak === 'function') speak('Excellent! Now let\'s review all the information you\'ve provided.');
          setTimeout(() => { if (typeof goStep === 'function') goStep(5); }, 1500);
        };
      }
    }
  },
  {
    id: 'confirm',
    render: () => `
      <div class="onboarding-step-content">
        <div class="onboarding-step-header">
          <div class="tutor-message">
            <span class="tutor-label">AI Tutor</span>
            <p class="tutor-text">Let's review the information you've provided. You can edit any section before we continue.</p>
          </div>
        </div>
        <div class="onboarding-step-body">
          <div class="confirm-review">
            <div class="review-section">
              <div class="review-header"><h4>Name</h4><button class="btn-edit" data-edit="name">Edit</button></div>
              <div class="review-content" id="reviewName">${state.profile.name || 'Not provided'}</div>
            </div>
            <div class="review-section">
              <div class="review-header"><h4>Academic Background</h4><button class="btn-edit" data-edit="background">Edit</button></div>
              <div class="review-content" id="reviewBackground">${state.profile.background || 'Not provided'}</div>
            </div>
            <div class="review-section">
              <div class="review-header"><h4>Interests</h4><button class="btn-edit" data-edit="interests">Edit</button></div>
              <div class="review-content" id="reviewInterests">${(state.profile.interests || []).join(', ') || 'Not provided'}</div>
            </div>
            <div class="review-section">
              <div class="review-header"><h4>Target Majors</h4><button class="btn-edit" data-edit="majors">Edit</button></div>
              <div class="review-content" id="reviewMajors">${(state.profile.targetMajors || []).join(', ') || 'Not provided'}</div>
            </div>
            <div class="review-section">
              <div class="review-header"><h4>Target Universities</h4><button class="btn-edit" data-edit="schools">Edit</button></div>
              <div class="review-content" id="reviewSchools">${(state.profile.targetSchools || []).join(', ') || 'Not provided'}</div>
            </div>
            <div class="review-section">
              <div class="review-header"><h4>Learning Style</h4><button class="btn-edit" data-edit="learningStyle">Edit</button></div>
              <div class="review-content" id="reviewLearningStyle">${state.profile.learningStyle ? (state.profile.learningStyle.charAt(0).toUpperCase() + state.profile.learningStyle.slice(1).replace(/([A-Z])/g, ' $1')) : 'Not provided'}</div>
            </div>
          </div>
        </div>
        <div class="onboarding-step-footer">
          <button id="finishOnboard" class="btn-onboarding-primary btn-onboarding-finish">✓ Complete Setup</button>
        </div>
      </div>
    `,
    bind: () => {
      if (typeof speak === 'function') speak('Let\'s review the information you\'ve provided. You can edit any section before we continue.');
      const finishBtn = document.getElementById('finishOnboard');
      const editButtons = document.querySelectorAll('.btn-edit');
      editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const editType = btn.dataset.edit;
          let stepIndex = 0;
          switch(editType) {
            case 'name': stepIndex = 0; break;
            case 'background': stepIndex = 1; break;
            case 'interests': stepIndex = 2; break;
            case 'majors': case 'schools': stepIndex = 3; break;
            case 'learningStyle': stepIndex = 4; break;
          }
          if (typeof speak === 'function') speak(`Let's edit your ${editType}.`);
          setTimeout(() => { if (typeof goStep === 'function') goStep(stepIndex); }, 1000);
        });
      });
      if (finishBtn) {
        finishBtn.onclick = () => {
          state.onboardingComplete = true;
          if (typeof speak === 'function') speak('Onboarding complete! I will build your Persona and initial analysis.');
          requestAnimationFrame(() => {
            if (typeof setRoute === 'function') setRoute('profile');
            setTimeout(() => {
              if (typeof renderProfileAndGap === 'function') renderProfileAndGap();
              if (typeof renderProfileSections === 'function') renderProfileSections();
              if (typeof observeSectionAutoExpand === 'function') observeSectionAutoExpand();
            }, 100);
          });
        };
      }
    }
  }
];

function goStep(i) {
  stopVoiceInput();
  state.onboardingIndex = Math.max(0, Math.min(i, steps.length - 1));
  const total = steps.length;
  const current = state.onboardingIndex + 1;
  const percent = Math.round((current / total) * 100);
  const currentStepEl = document.getElementById('currentStep');
  const totalStepsEl = document.getElementById('totalSteps');
  if (currentStepEl) currentStepEl.textContent = current;
  if (totalStepsEl) totalStepsEl.textContent = total;
  const progressFill = document.getElementById('onboardProgressFill');
  const progressPercent = document.getElementById('onboardProgressPercent');
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
  const backBtn = document.getElementById('btnOnboardBack');
  if (backBtn) {
    if (state.onboardingIndex === 0) {
      backBtn.classList.add('disabled');
      backBtn.setAttribute('aria-disabled', 'true');
      backBtn.disabled = true;
    } else {
      backBtn.classList.remove('disabled');
      backBtn.removeAttribute('aria-disabled');
      backBtn.disabled = false;
    }
  }
  bindOnboardingButtons();
  if (typeof state !== 'undefined') state.voiceEnabled = true;
  if (onboardStep) {
    onboardStep.style.opacity = '0';
    onboardStep.style.transform = 'translateY(10px)';
    setTimeout(() => {
      onboardStep.innerHTML = steps[state.onboardingIndex]?.render() || '';
      steps[state.onboardingIndex]?.bind();
      requestAnimationFrame(() => {
        onboardStep.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        onboardStep.style.opacity = '1';
        onboardStep.style.transform = 'translateY(0)';
      });
    }, 150);
  }
}

function initializeOnboardingView() {
  const onboardingView = document.getElementById('view-onboarding');
  const inputArea = document.getElementById('inputArea');
  const routeOnboarding = document.getElementById('route-onboarding');
  if (typeof state !== 'undefined') state.voiceEnabled = true;
  const isOnboardingActive = routeOnboarding && !routeOnboarding.classList.contains('hidden');
  if (isOnboardingActive && onboardingView && typeof goStep === 'function') {
    goStep(state.onboardingIndex || 0);
  }
  if (isOnboardingActive && inputArea) {
    inputArea.classList.remove('hidden');
    inputArea.style.display = 'flex';
    if (typeof updateFloatingSubtitleState === 'function') updateFloatingSubtitleState('idle');
  }
}

window.initializeOnboardingView = initializeOnboardingView;
window.goStep = goStep;

document.addEventListener('DOMContentLoaded', () => {
  bindOnboardingButtons();
  const onboardingView = document.getElementById('view-onboarding');
  const inputArea = document.getElementById('inputArea');
  const routeOnboarding = document.getElementById('route-onboarding');
  if (typeof state !== 'undefined') state.voiceEnabled = true;
  const ensureFloatingSubtitleVisible = () => {
    const isOnboardingActive = routeOnboarding && !routeOnboarding.classList.contains('hidden');
    if (isOnboardingActive && inputArea) {
      inputArea.classList.remove('hidden');
      inputArea.style.display = 'flex';
      if (typeof updateFloatingSubtitleState === 'function') updateFloatingSubtitleState('idle');
    }
  };
  if (routeOnboarding) {
    const routeObserver = new MutationObserver(() => {
      const isActive = !routeOnboarding.classList.contains('hidden');
      if (isActive) {
        ensureFloatingSubtitleVisible();
        bindOnboardingButtons();
        if (onboardingView && typeof goStep === 'function') goStep(state.onboardingIndex || 0);
      }
    });
    routeObserver.observe(routeOnboarding, { attributes: true, attributeFilter: ['class'] });
  }
  if (onboardingView) {
    const onboardingObserver = new MutationObserver(() => {
      if (onboardingView.classList.contains('active')) {
        ensureFloatingSubtitleVisible();
        bindOnboardingButtons();
        if (typeof goStep === 'function') goStep(state.onboardingIndex || 0);
      }
    });
    onboardingObserver.observe(onboardingView, { attributes: true, attributeFilter: ['class'] });
    ensureFloatingSubtitleVisible();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopVoiceInput();
});
window.addEventListener('beforeunload', () => stopVoiceInput());

// PROFILE, PERSONA, GAP
const profileCompleteness = document.getElementById('profileCompleteness');
const btnEnablePersona = document.getElementById('btnEnablePersona');
const gapCanvas = document.getElementById('gapChart');
const gapMeta = document.getElementById('gapMeta');
const profileSectionsEl = document.getElementById('profileSections') || document.createElement('div');

if (btnEnablePersona) {
  btnEnablePersona.addEventListener('click', () => {
    state.personaEnabled = true;
    speak('Persona enabled. I will perform a GAP analysis based on similar success cases.');
    state.gap = generateGap();
    if (gapCanvas) drawRadar(gapCanvas, state.gap);
    if (gapMeta) gapMeta.textContent = 'Initial GAP analysis generated from your background and goals.';
  });
}

function renderProfileAndGap() {
  const filled = [state.profile.name, state.profile.email, state.profile.background].filter(Boolean).length;
  const completeness = Math.round((filled / 3) * 100);
  if (profileCompleteness) {
  profileCompleteness.textContent = `Profile completeness: ${completeness}%`;
  }
  if (progressFill) {
  progressFill.style.width = `${Math.max(10, completeness)}%`;
  }
  if (state.gap && gapCanvas) {
    drawRadar(gapCanvas, state.gap);
  }
}

function generateGap() {
  const dims = ['Academics','Activities','Projects','Leadership','Standardized'];
  return dims.map(name => ({ name, current: rand(40,75), target: rand(70,95) }));
}

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function drawRadar(canvas, data){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height; 
  ctx.clearRect(0,0,w,h);
  const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 30;
  const n = data.length;
  ctx.strokeStyle = '#2a3450';
  ctx.lineWidth = 1;
  for (let level=1; level<=4; level++){
    const rr = (r * level)/4;
    ctx.beginPath();
    for (let i=0;i<n;i++){
      const ang = (Math.PI*2*i)/n - Math.PI/2;
      const x = cx + rr*Math.cos(ang);
      const y = cy + rr*Math.sin(ang);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle = '#9aa4b2';
  ctx.font = '12px system-ui';
  for (let i=0;i<n;i++){
    const ang = (Math.PI*2*i)/n - Math.PI/2;
    const x = cx + (r+10)*Math.cos(ang);
    const y = cy + (r+10)*Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx + r*Math.cos(ang), cy + r*Math.sin(ang));
    ctx.stroke();
    ctx.fillText(data[i].name, x-12, y+4);
  }
  function poly(color, key){
    ctx.beginPath();
    for (let i=0;i<n;i++){
      const val = data[i][key];
      const rr = r * (val/100);
      const ang = (Math.PI*2*i)/n - Math.PI/2;
      const x = cx + rr*Math.cos(ang);
      const y = cy + rr*Math.sin(ang);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.25; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.stroke();
  }
  poly('#6ea8fe','current');
  poly('#7ee787','target');
}

// Profile sections rendering and editing
function renderProfileSections(){
  if (!profileSectionsEl) return; // Safety check
  profileSectionsEl.innerHTML = state.profileSections.map((s, idx)=>{
    const meta = s.meta ? `<span class="meta">${s.meta}</span>` : '';
    return `
      <li class="section-item" data-index="${idx}">
        <div class="section-head">
          <div class="badge">${s.badge}</div>
          <div>${s.key} ${meta}</div>
          <div class="chev">›</div>
        </div>
        <div class="section-body">
          <div class="param-editor">
            ${s.params.map((p,i)=>tokenHTML(idx,i,p[0],p[1])).join('')}
            <div class="token-add">
              <input placeholder="Key" data-add-key />
              <input placeholder="Value" data-add-val />
              <button class="add">Add</button>
            </div>
          </div>
        </div>
      </li>`;
  }).join('');
  bindTokenEditorEvents();
}

function tokenHTML(sIdx,pIdx,key,val){
  return `<span class="token" data-sidx="${sIdx}" data-pidx="${pIdx}">
    <span class="k">${key}</span>
    <span class="v" contenteditable="true">${escapeHtml(val)}</span>
    <span class="x">×</span>
  </span>`;
}

function bindTokenEditorEvents(){
  profileSectionsEl.querySelectorAll('.section-item').forEach(item=>{
    const idx = parseInt(item.dataset.index,10);
    item.querySelector('.section-head').addEventListener('click',()=>{
      item.classList.toggle('expanded');
    });
    item.querySelectorAll('.token .v').forEach(node=>{
      node.addEventListener('input',(e)=>{
        const token = e.target.closest('.token');
        const sIdx = parseInt(token.dataset.sidx,10);
        const pIdx = parseInt(token.dataset.pidx,10);
        state.profileSections[sIdx].params[pIdx][1] = e.target.textContent;
      });
    });
    item.querySelectorAll('.token .x').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const token = e.target.closest('.token');
        const sIdx = parseInt(token.dataset.sidx,10);
        const pIdx = parseInt(token.dataset.pidx,10);
        state.profileSections[sIdx].params.splice(pIdx,1);
        renderProfileSections();
      });
    });
    item.querySelector('.add').addEventListener('click',()=>{
      const k = item.querySelector('[data-add-key]').value.trim();
      const v = item.querySelector('[data-add-val]').value.trim();
      if(!k||!v) return;
      state.profileSections[idx].params.push([k,v]);
      renderProfileSections();
    });
  });
}

function observeSectionAutoExpand(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) entry.target.classList.add('expanded');
    });
  },{ root: null, threshold: 0.25 });
  profileSectionsEl.querySelectorAll('.section-item').forEach(el=> io.observe(el));
}

function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Voice parsing for profile suggestions
let profileSR = null;
function startProfileListening(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  stopProfileListening();
  profileSR = new SR();
  profileSR.lang = 'en-US';
  profileSR.continuous = true;
  profileSR.interimResults = false;
  profileSR.onresult = (e)=>{
    const text = e.results[e.results.length-1][0].transcript;
    handleProfileVoiceText(text);
  };
  try { profileSR.start(); } catch(_) {}
}
function stopProfileListening(){
  try { profileSR && profileSR.abort(); } catch(_) {}
  profileSR = null;
}

function handleProfileVoiceText(text){
  const lower = text.toLowerCase();
  const sugg = [];
  
  // Enhanced name detection
  const namePatterns = [
    /(?:my name is|i am|i'm|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:name|我叫|我是)\s*[:：]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  namePatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 50) {
        sugg.push({ type:'Name', key:'Name', value: name, section: 'Identity', rawText: text });
      }
    }
  });
  
  // Enhanced GPA detection
  const gpaPatterns = [
    /gpa\s*(?:is|of|:)?\s*(\d(?:\.\d{1,2})?)/i,
    /grade point average\s*(?:is|of|:)?\s*(\d(?:\.\d{1,2})?)/i,
    /(\d\.\d{1,2})\s*(?:gpa|grade point average)/i
  ];
  gpaPatterns.forEach(pattern => {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const gpa = parseFloat(match[1]);
      if (gpa >= 0 && gpa <= 5.0) {
        sugg.push({ type:'GPA', key:'GPA', value: match[1], section: 'School', rawText: text });
      }
    }
  });
  
  // Enhanced school detection
  const schoolPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(high school|high|hs|school)\b/i,
    /(?:attend|go to|study at|school is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:high school|high|hs|school)?/i,
    /(?:from|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:high school|high|hs)/i
  ];
  schoolPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const schoolName = match[1].trim();
      if (schoolName.length > 3 && schoolName.length < 100) {
        sugg.push({ type:'High School', key:'High School', value: schoolName, section: 'School', rawText: text });
      }
    }
  });
  
  // Enhanced email detection
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    sugg.push({ type:'Email', key:'Email', value: emailMatch[1], section: 'Identity', rawText: text });
  }
  
  // Enhanced phone detection
  const phonePatterns = [
    /(?:phone|mobile|cell|contact)\s*(?:number|is|:)?\s*([(]?\d{3}[)]?\s*-?\d{3}\s*-?\d{4})/i,
    /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
  ];
  phonePatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[1]) {
      sugg.push({ type:'Phone', key:'Phone', value: match[1], section: 'Identity', rawText: text });
    }
  });
  
  // Enhanced major detection
  const majors = [
    'computer science', 'cs', 'data science', 'economics', 'biology', 'engineering', 
    'mathematics', 'math', 'physics', 'chemistry', 'psychology', 'business', 'finance', 
    'artificial intelligence', 'ai', 'mechanical engineering', 'electrical engineering',
    'chemical engineering', 'biomedical engineering', 'software engineering', 'accounting',
    'marketing', 'management', 'finance', 'statistics', 'stat', 'architecture', 'design',
    'art', 'music', 'history', 'literature', 'philosophy', 'political science', 'poli sci'
  ];
  majors.forEach(m => {
    if (lower.includes(m)) {
      let majorName = m;
      if (m === 'cs') majorName = 'Computer Science';
      else if (m === 'ai') majorName = 'Artificial Intelligence';
      else if (m === 'stat') majorName = 'Statistics';
      else if (m === 'poli sci') majorName = 'Political Science';
      else majorName = titleCase(m);
      
      sugg.push({ type:'Major', key:'Majors', value: majorName, section: 'Intended Major', rawText: text });
    }
  });
  
  // Enhanced activity detection
  const activityPatterns = [
    /(?:activity|activities|extracurricular|extracurriculars|involvement)\s*(?:is|are|include|includes)?\s*[:]?\s*([a-z][a-z\s,]+?)(?:\.|$|and|,)/i,
    /(?:participate|participated|involved|involvement)\s+in\s+([a-z][a-z\s,]+?)(?:\.|$|and|,)/i,
    /(?:leader|lead|led|president|president of)\s+(?:of|the)?\s*([a-z][a-z\s,]+?)(?:club|organization|team|group|committee)?/i
  ];
  activityPatterns.forEach(pattern => {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const activity = titleCase(match[1].trim());
      if (activity.length > 3 && activity.length < 100) {
        sugg.push({ type:'Activity', key:'Activity', value: activity, section: 'Activities', rawText: text });
      }
    }
  });
  
  // Enhanced testing detection
  const satPatterns = [
    /sat\s+(?:score|is|was|of)?\s*(?:is|:)?\s*(\d{3,4})/i,
    /sat\s+(\d{3,4})\s*(?:points?|score)?/i
  ];
  satPatterns.forEach(pattern => {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const score = parseInt(match[1]);
      if (score >= 400 && score <= 1600) {
        sugg.push({ type:'SAT Score', key:'SAT', value: match[1], section: 'Testing', rawText: text });
      }
    }
  });
  
  const actPatterns = [
    /act\s+(?:score|is|was|of)?\s*(?:is|:)?\s*(\d{1,2})/i,
    /act\s+(\d{1,2})\s*(?:points?|score)?/i
  ];
  actPatterns.forEach(pattern => {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const score = parseInt(match[1]);
      if (score >= 1 && score <= 36) {
        sugg.push({ type:'ACT Score', key:'ACT', value: match[1], section: 'Testing', rawText: text });
      }
    }
  });
  
  // AP courses detection
  const apPattern = /ap\s+([a-z\s]+?)(?:\.|$|,|and)/i;
  const apMatch = lower.match(apPattern);
  if (apMatch) {
    const apCourse = titleCase(apMatch[1].trim());
    sugg.push({ type:'AP Course', key:'AP', value: apCourse, section: 'Transcript', rawText: text });
  }
  
  // Grade level detection
  const gradePatterns = [
    /(?:i am|i'm|in|grade|year)\s+(?:a\s+)?(freshman|sophomore|junior|senior|grade\s+\d+|year\s+\d+)/i,
    /(?:grade|year)\s+(\d{1,2})/i
  ];
  gradePatterns.forEach(pattern => {
    const match = lower.match(pattern);
    if (match) {
      let grade = match[1] || match[0];
      if (grade.includes('freshman')) grade = '9';
      else if (grade.includes('sophomore')) grade = '10';
      else if (grade.includes('junior')) grade = '11';
      else if (grade.includes('senior')) grade = '12';
      else grade = grade.replace(/\D/g, '');
      
      if (grade && parseInt(grade) >= 9 && parseInt(grade) <= 12) {
        sugg.push({ type:'Grade Level', key:'Grade', value: `Grade ${grade}`, section: 'School', rawText: text });
      }
    }
  });
  
  // If suggestions found, add them and show sidebar
  if (sugg.length > 0) {
    // Avoid duplicates
    sugg.forEach(newSugg => {
      const exists = state.suggestions.some(s => 
        s.type === newSugg.type && 
        s.key === newSugg.key && 
        s.value === newSugg.value
      );
      if (!exists) {
        state.suggestions.push(newSugg);
      }
    });
    
    if (state.suggestions.length > 0) {
    renderSuggestions();
      showVoiceSidebar();
      // Speak confirmation
      const count = sugg.length;
      speak(`I detected ${count} item${count > 1 ? 's' : ''} from your voice. Please review and confirm in the sidebar.`);
    }
  }
}

function titleCase(s){ return s.replace(/\b\w/g, c=>c.toUpperCase()); }

function renderSuggestions(){
  if (!voiceSuggestions) return; // Safety check
  if (!state.suggestions || !Array.isArray(state.suggestions) || state.suggestions.length === 0) {
    voiceSuggestions.innerHTML = '<div class="suggestion-empty"><div class="muted">No suggestions yet. Try saying: "My GPA is 3.9", "Ridgefield High School", "Computer Science"...</div></div>';
    return;
  }
  
  voiceSuggestions.innerHTML = state.suggestions.map((s, i)=>`
    <div class="suggestion-item" data-index="${i}">
      <div class="suggestion-header">
        <div class="suggestion-type-badge">${s.type}</div>
        <div class="suggestion-section">${s.section || 'Profile'}</div>
      </div>
      <div class="suggestion-content">
        <div class="suggestion-label">${s.key || 'Value'}</div>
        <div class="suggestion-value">${escapeHtml(s.value)}</div>
        ${s.rawText ? `<div class="suggestion-raw muted">From: "${escapeHtml(s.rawText.substring(0, 50))}${s.rawText.length > 50 ? '...' : ''}"</div>` : ''}
      </div>
      <div class="suggestion-actions">
        <button class="suggestion-btn confirm-btn" aria-label="Confirm">✓ Confirm</button>
        <button class="suggestion-btn dismiss-btn" aria-label="Dismiss">× Dismiss</button>
      </div>
    </div>
  `).join('');
  
  bindSuggestionEvents();
}

// Voice sidebar toast management
let voiceSidebarTimeout = null;

function showVoiceSidebar() {
  if (!voiceSidebar) return;
  voiceSidebar.classList.remove('hidden', 'hiding');
  // Clear existing timeout
  if (voiceSidebarTimeout) {
    clearTimeout(voiceSidebarTimeout);
  }
  // Don't auto-hide if there are suggestions - let user interact
  // Auto-hide after 30 seconds if user doesn't interact
  voiceSidebarTimeout = setTimeout(() => {
    hideVoiceSidebar();
  }, 30000);
}

function hideVoiceSidebar() {
  if (!voiceSidebar) return;
  if (voiceSidebarTimeout) {
    clearTimeout(voiceSidebarTimeout);
    voiceSidebarTimeout = null;
  }
  voiceSidebar.classList.add('hiding');
  setTimeout(() => {
    voiceSidebar.classList.add('hidden');
    voiceSidebar.classList.remove('hiding');
  }, 300);
}

function bindSuggestionEvents(){
  if (!voiceSuggestions) return;
  
  voiceSuggestions.querySelectorAll('.suggestion-item').forEach(el=>{
    const idx = parseInt(el.dataset.index,10);
    
    // Confirm button
    const confirmBtn = el.querySelector('.confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const suggestion = state.suggestions[idx];
        if (suggestion) {
          applySuggestion(suggestion);
      state.suggestions.splice(idx,1);
      renderSuggestions();
          renderProfileSections();
          renderProfileAndGap();
          
          // Speak confirmation
          speak(`${suggestion.type} ${suggestion.value} has been added to your profile.`);
          
          if (!state.suggestions.length) {
            if (voiceSidebarTimeout) {
              clearTimeout(voiceSidebarTimeout);
              voiceSidebarTimeout = null;
            }
            voiceSidebar.classList.add('hiding');
            setTimeout(() => {
              voiceSidebar.classList.add('hidden');
              voiceSidebar.classList.remove('hiding');
            }, 300);
          } else {
            showVoiceSidebar(); // Reset timer if suggestions remain
          }
        }
      });
    }
    
    // Dismiss button
    const dismissBtn = el.querySelector('.dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
      state.suggestions.splice(idx,1);
        renderSuggestions();
        
        if (!state.suggestions.length) {
          if (voiceSidebarTimeout) {
            clearTimeout(voiceSidebarTimeout);
            voiceSidebarTimeout = null;
          }
          voiceSidebar.classList.add('hiding');
          setTimeout(() => {
            voiceSidebar.classList.add('hidden');
            voiceSidebar.classList.remove('hiding');
          }, 300);
        } else {
          showVoiceSidebar(); // Reset timer if suggestions remain
        }
      });
    }
  });
  
// Confirm All and Dismiss All buttons
document.addEventListener('DOMContentLoaded', () => {
  const confirmAllBtn = document.getElementById('confirmAllBtn');
  const dismissAllBtn = document.getElementById('dismissAllBtn');
  const closeVoiceSidebar = document.getElementById('closeVoiceSidebar');
  
  if (confirmAllBtn) {
    confirmAllBtn.addEventListener('click', () => {
      if (!state.suggestions || state.suggestions.length === 0) return;
      
      // Confirm all suggestions
      const toConfirm = [...state.suggestions];
      toConfirm.forEach(suggestion => {
        if (!suggestion.confirmed && !suggestion.dismissed) {
          applySuggestion(suggestion);
        }
      });
      
      // Clear suggestions
      state.suggestions = [];
      renderSuggestions();
      renderProfileSections();
      renderProfileAndGap();
      
      // Hide sidebar
      hideVoiceSidebar();
      
      // Speak confirmation
      speak('All suggestions have been confirmed and added to your profile.');
    });
  }
  
  if (dismissAllBtn) {
    dismissAllBtn.addEventListener('click', () => {
      if (!state.suggestions || state.suggestions.length === 0) return;
      
      // Clear all suggestions
      state.suggestions = [];
      renderSuggestions();
      
      // Hide sidebar
      hideVoiceSidebar();
      
      // Speak confirmation
      speak('All suggestions have been dismissed.');
    });
  }
  
  if (closeVoiceSidebar) {
    closeVoiceSidebar.addEventListener('click', () => {
      hideVoiceSidebar();
    });
  }
  });

function applySuggestion(s){
  if (!s || !s.type) return;
  
  // Map sections properly
  const sectionMap = {
    'Identity': 'identity',
    'School': 'school',
    'Transcript': 'transcript',
    'Activities': 'activities',
    'Testing': 'testing',
    'Intended Major': 'activities' // Majors are part of activities section
  };
  
  const sectionKey = sectionMap[s.section] || s.section?.toLowerCase() || 'identity';
  
  if (s.type === 'GPA') {
    setSectionParam('School', 'GPA', s.value, true);
  } else if (s.type === 'High School') {
    setSectionParam('School', 'High School', s.value, true);
  } else if (s.type === 'Name') {
    setSectionParam('Identity', 'Name', s.value, true);
    state.profile.name = s.value;
  } else if (s.type === 'Email') {
    setSectionParam('Identity', 'Email', s.value, true);
    state.profile.email = s.value;
  } else if (s.type === 'Phone') {
    setSectionParam('Identity', 'Phone', s.value, true);
  } else if (s.type === 'Grade Level' || s.type === 'Grade') {
    setSectionParam('School', 'Grade', s.value, true);
  } else if (s.type === 'Major') {
    // append to majors list
    const sec = getSection('Intended Major');
    if (sec) {
    const entry = sec.params.find(p=>p[0]==='Majors');
    if (entry) {
      const items = entry[1] ? entry[1].split(',').map(t=>t.trim()).filter(Boolean) : [];
      if (!items.includes(s.value)) items.push(s.value);
      entry[1] = items.join(', ');
    } else {
      sec.params.push(['Majors', s.value]);
      }
    }
    // Also update profile targetMajors
    if (!state.profile.targetMajors) state.profile.targetMajors = [];
    if (!state.profile.targetMajors.includes(s.value)) {
      state.profile.targetMajors.push(s.value);
    }
  } else if (s.type === 'Activity') {
    const sec = getSection('Activities');
    if (sec) {
      const entry = sec.params.find(p=>p[0]==='Top');
      if (entry) {
        const items = entry[1] ? entry[1].split(',').map(t=>t.trim()).filter(Boolean) : [];
        if (!items.includes(s.value)) items.push(s.value);
        entry[1] = items.join(', ');
      } else {
        sec.params.push(['Top', s.value]);
      }
    }
  } else if (s.type === 'SAT Score' || s.type === 'SAT') {
    setSectionParam('Testing', 'SAT', s.value, true);
  } else if (s.type === 'ACT Score' || s.type === 'ACT') {
    setSectionParam('Testing', 'ACT', s.value, true);
  } else if (s.type === 'AP Course' || s.type === 'AP') {
    const sec = getSection('Transcript');
    if (sec) {
      const entry = sec.params.find(p=>p[0]==='AP Courses');
      if (entry) {
        const items = entry[1] ? entry[1].split(',').map(t=>t.trim()).filter(Boolean) : [];
        if (!items.includes(s.value)) items.push(s.value);
        entry[1] = items.join(', ');
      } else {
        sec.params.push(['AP Courses', s.value]);
      }
    }
  } else if (s.type === 'Date of Birth' || s.type === 'DOB') {
    setSectionParam('Identity', 'Date of Birth', s.value, true);
  } else if (s.type === 'Country') {
    setSectionParam('Identity', 'Country', s.value, true);
  }
}

function getSection(key){
  if (!state.profileSections || !Array.isArray(state.profileSections)) return null;
  return state.profileSections.find(s=>s.key===key) || null;
}

function setSectionParam(sectionKey, key, value, replace){
  const sec = getSection(sectionKey);
  if (!sec || !sec.params || !Array.isArray(sec.params)) return;
  const row = sec.params.find(p=>p[0]===key);
  if (row && replace) row[1] = value; 
  else if (row) row[1] += `, ${value}`; 
  else sec.params.push([key,value]);
}

// Start/stop profile SR based on route
const profileObserver = new MutationObserver(()=>{
  const active = views.profile.classList.contains('active');
  if (active && state.voiceEnabled) startProfileListening(); else stopProfileListening();
});
profileObserver.observe(views.profile, { attributes: true, attributeFilter: ['class'] });

// ADVISOR + COMPARE
const majorList = document.getElementById('majorList');
const compareA = document.getElementById('compareA');
const compareB = document.getElementById('compareB');
const btnCompare = document.getElementById('btnCompare');
const compareView = document.getElementById('compareView');
const compareTable = document.getElementById('compareTable');
const compareSummary = document.getElementById('compareSummary');

// Tutor show/hide - handled by bindToggleTutor() and global delegation

// Extend majors with inspirations examples
state.majors = state.majors.map(m=> ({
  ...m,
  inspirations: [
    { name: 'Rachel', path: 'HS → CS club → Research → CS@Top10' },
    { name: 'Leo', path: 'Math team → Hackathon → Startup intern' },
  ]
}));

function updateSelectedLabels(){
  const ids = (state.selectedMajors||[]).slice(0,2);
  const [a,b] = ids.map(id=> state.majors.find(m=>m.id===id));
  const selMajorA = document.getElementById('selMajorA');
  const selMajorB = document.getElementById('selMajorB');
  
  if (selMajorA) selMajorA.textContent = a? a.name : '—';
  if (selMajorB) selMajorB.textContent = b? b.name : '—';
  
  // Auto-update comparison when labels change
  if (ids.length === 2 && a && b) {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      performComparison();
    }, 50);
  } else if (ids.length < 2) {
    // Show prompt for selecting more majors
    const compareSummary = document.getElementById('compareSummary');
    const compareTable = document.getElementById('compareTable');
    const compareView = document.getElementById('compareView');
    
    if (compareTable) compareTable.innerHTML = '';
    if (compareView) compareView.innerHTML = '';
    if (compareSummary) {
      const remaining = 2 - ids.length;
      compareSummary.textContent = remaining === 1 
        ? 'Select 1 more major to compare.' 
        : 'Select 2 majors above to compare.';
    }
  }
}

// Render majors (override) keeps selection and updates labels
function renderMajors(targetElement = null){
  // Get the majorList element dynamically if not provided
  // This ensures it works even when the advisor view is loaded dynamically
  const majorListEl = targetElement || document.getElementById('majorList');
  if (!majorListEl) {
    console.warn('majorList element not found');
    return; // Safety check
  }
  
  if (!state.majors || !Array.isArray(state.majors) || state.majors.length === 0) {
    majorListEl.innerHTML = '<div class="empty-state">No majors available. Please add majors to your profile.</div>';
    return;
  }
  
  const selected = new Set(state.selectedMajors || []);
  majorListEl.innerHTML = state.majors.map(m => `
    <div class="major-card ${selected.has(m.id)?'selected':''}" data-id="${m.id}">
      <div class="major-card-header">
        <div class="major-card-title">${m.name || 'Unknown Major'}</div>
        ${selected.has(m.id) ? '<div class="selected-badge">✓ Selected</div>' : ''}
      </div>
      <div class="major-card-content">
        <div class="major-card-meta">
          <div class="meta-item">
            <span class="meta-label">Fit:</span>
            <span class="meta-value">${m.fit || '—'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Load:</span>
            <span class="meta-value">${m.load || '—'}</span>
          </div>
        </div>
        ${m.highlights && m.highlights.length > 0 ? `
          <div class="major-highlights">
            ${m.highlights.map(h=>`<span class="highlight-tag">${h}</span>`).join('')}
          </div>
        ` : ''}
        ${m.inspirations && m.inspirations.length > 0 ? `
          <div class="major-inspirations">
            <div class="insp-title">Real-world inspirations:</div>
            <ul class="insp-list">
              ${m.inspirations.map(i=>`<li><span class="insp-name">${i.name}</span><span class="insp-path">${i.path}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  majorListEl.querySelectorAll('.major-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const id = card.dataset.id;
      if (!state.selectedMajors) state.selectedMajors = [];
      if (state.selectedMajors.includes(id)) {
        state.selectedMajors = state.selectedMajors.filter(x=>x!==id);
      } else {
        if (state.selectedMajors.length >= 2) state.selectedMajors.shift();
        state.selectedMajors.push(id);
      }
      renderMajors(majorListEl);
      updateSelectedLabels(); // This will automatically call performComparison() when 2 majors are selected
    });
  });
  updateSelectedLabels();
}

// Perform comparison and update compare table
function performComparison() {
  const ids = (state.selectedMajors || []).slice(0, 2);
  const a = state.majors.find(m => m.id === ids[0]);
  const b = state.majors.find(m => m.id === ids[1]);
  
  // Get elements dynamically (they may be in dynamically loaded view)
  const compareTable = document.getElementById('compareTable');
  const compareView = document.getElementById('compareView');
  const compareSummary = document.getElementById('compareSummary');
  
  if (!a || !b) {
    if (compareSummary) compareSummary.textContent = 'Select two majors above to compare.';
    if (compareTable) compareTable.innerHTML = '';
    if (compareView) compareView.innerHTML = '';
    return;
  }
  
  const extra = compareExtras(a, b);
  
  if (compareTable) {
  compareTable.innerHTML = `
      <thead>
        <tr>
          <th>Dimension</th>
          <th>${a.name}</th>
          <th>${b.name}</th>
        </tr>
      </thead>
    <tbody>
        <tr>
          <td><strong>Fit</strong></td>
          <td>${a.fit || '—'}</td>
          <td>${b.fit || '—'}</td>
        </tr>
        <tr>
          <td><strong>Load</strong></td>
          <td>${a.load || '—'}</td>
          <td>${b.load || '—'}</td>
        </tr>
        <tr>
          <td><strong>Highlights</strong></td>
          <td>${(a.highlights && a.highlights.length > 0) ? a.highlights.join(', ') : '—'}</td>
          <td>${(b.highlights && b.highlights.length > 0) ? b.highlights.join(', ') : '—'}</td>
        </tr>
        <tr>
          <td><strong>Curriculum</strong></td>
          <td>${extra.curriculumA.join(', ')}</td>
          <td>${extra.curriculumB.join(', ')}</td>
        </tr>
        <tr>
          <td><strong>Difficulty</strong></td>
          <td>${extra.difficultyA}</td>
          <td>${extra.difficultyB}</td>
        </tr>
        <tr>
          <td><strong>Career Roles</strong></td>
          <td>${extra.jobsA.join(', ')}</td>
          <td>${extra.jobsB.join(', ')}</td>
        </tr>
        <tr>
          <td><strong>Inspiration Path</strong></td>
          <td>${(a.inspirations && a.inspirations.length > 0) ? a.inspirations[0].path : '—'}</td>
          <td>${(b.inspirations && b.inspirations.length > 0) ? b.inspirations[0].path : '—'}</td>
        </tr>
    </tbody>`;
  }
  
  if (compareView) compareView.innerHTML = '';
  
  if (compareSummary) {
  compareSummary.textContent = `${a.name} leans to ${extra.curriculumA[0]} with ${extra.difficultyA.toLowerCase()}; ${b.name} emphasizes ${extra.curriculumB[0]} and ${extra.difficultyB.toLowerCase()}.`;
  }
}

// Compare now uses selected majors if present
// Use global click delegation to handle dynamically loaded elements
document.addEventListener('click', (e) => {
  if (e.target.id === 'btnCompare' || e.target.closest('#btnCompare')) {
    e.preventDefault();
    e.stopPropagation();
    performComparison();
  }
});

// Extend compare with curriculum overlap, difficulty, jobs
function compareExtras(a,b){
  const curriculumA = ['DSA','Systems','AI'];
  const curriculumB = b.id==='econ'? ['Micro','Macro','Econometrics'] : ['Biochem','Lab','Genetics'];
  const difficultyA = 'Rigorous math & coding';
  const difficultyB = b.id==='econ'? 'Math-heavy models' : 'Lab-intensive practice';
  const jobsA = ['Software Engineer','ML Engineer'];
  const jobsB = b.id==='econ'? ['Analyst','Consultant'] : ['Research Assistant','BioTech'];
  return { curriculumA, curriculumB, difficultyA, difficultyB, jobsA, jobsB };
}

// ROADMAP
const goalForm = document.getElementById('goalForm');
const goalList = document.getElementById('goalList');

// Only bind goalForm if it exists (may be in external HTML file)
if (goalForm) {
goalForm.addEventListener('submit', (e)=>{
  e.preventDefault();
    const fd = new FormData(goalForm); 
    const goal = (fd.get('goal')||'').toString().trim();
  if(!goal) return; 
  state.goals.unshift({ id: Date.now().toString(), title: goal });
  goalForm.reset();
  renderGoals();
  regenRoadmap();
});
}

function renderGoals(){
  if (!goalList) return; // Safety check
  goalList.innerHTML = state.goals.map(g=>`<li><span>${g.title}</span></li>`).join('');
}

// Gamified timeline rendering - elements may be in external HTML or may not exist
// Declare variables first
let timelineNear = null;
let timelineMid = null;
let timelineFar = null;

// Function to get timeline elements (will be called after sections are loaded)
function getTimelineElements() {
  timelineNear = document.getElementById('timelineNear');
  timelineMid = document.getElementById('timelineMid');
  timelineFar = document.getElementById('timelineFar');
  return timelineNear && timelineMid && timelineFar;
}

function renderTimeline(){
  // Try to get timeline elements if not already set
  if (!timelineNear || !timelineMid || !timelineFar) {
    if (!getTimelineElements()) {
      // Timeline elements don't exist, skip rendering
      return;
    }
  }
  
  function nodes(list){
    // Safety check: ensure list is an array
    if (!list || !Array.isArray(list)) return '';
    return list.map(item=>`<div class=\"node ${item.done?'done':''}\" data-id=\"${item.id}\">
      <div><strong>${item.title || 'Untitled'}</strong></div>
      <div class=\"meta\">Type: ${item.type || 'Task'} · Tags: ${(item.tags && Array.isArray(item.tags)) ? item.tags.map(t=>`#${t}`).join(' ') : ''}</div>
      ${item.done?`<div class=\"tags\"><span class='badge-achv'>Achievement: ${item.achievement || 'Completed'}</span></div>`:''}
    </div>`).join('');
  }
  // Check if elements exist before accessing them
  if (!timelineNear || !timelineMid || !timelineFar) return;
  
  // Safety check: ensure roadmap data exists
  if (!state.roadmap) {
    state.roadmap = { near: [], mid: [], far: [] };
  }
  
  timelineNear.innerHTML = nodes(state.roadmap.near || []);
  timelineMid.innerHTML = nodes(state.roadmap.mid || []);
  timelineFar.innerHTML = nodes(state.roadmap.far || []);
  // Bind click events for nodes
  [timelineNear, timelineMid, timelineFar].forEach(tl=>{
    if (!tl) return;
    tl.querySelectorAll('.node').forEach(node=>{
      node.addEventListener('click', ()=>{
        const id = node.dataset.id;
        const item = (state.roadmap.near || []).concat(state.roadmap.mid || [], state.roadmap.far || []).find(x=>x.id===id);
        if (item) {
          if (!item.done) {
            item.done = true;
            // Update quest progress based on tags and category
            if (item.category) {
              completeTask(id, item.category);
            } else if (item.tags) {
              if (item.tags.includes('standardized')) completeTask(id, 'tests');
              if (item.tags.includes('meeting') || item.tags.includes('recommender')) completeTask(id, 'recommenders');
              if (item.tags.includes('essay')) completeTask(id, 'essays');
              if (item.tags.includes('application')) completeTask(id, 'applications');
              if (item.tags.includes('project') || item.tags.includes('portfolio')) completeTask(id, 'portfolio');
            }
            renderTimeline();
            updateQuestPath();
          }
          openSheet(item);
        }
      });
    });
  });
}

// Extend roadmap items with type and achievements
function regenRoadmap(){
  state.roadmap.near = [
    { id:'n1', title:'Polish academic resume', type:'Document', tags:['resume','docs'], done:true, achievement:'Resume v1 ready', category: 'portfolio' },
    { id:'n2', title:'Advisor meeting for planning', type:'Meeting', tags:['meeting','tutor'], done:false, category: 'recommenders' },
    { id:'n3', title:'Submit one competition entry', type:'Competition', tags:['competition'], done:false, category: 'portfolio' },
  ];
  state.roadmap.mid = [
    { id:'m1', title:'Complete a mini research project', type:'Project', tags:['project'], done:false, category: 'portfolio' },
    { id:'m2', title:'Improve standardized scores', type:'Testing', tags:['standardized'], done:false, category: 'tests' },
  ];
  state.roadmap.far = [
    { id:'f1', title:'Consolidate and refine application materials', type:'Application', tags:['application'], done:false, category: 'applications' },
  ];
  renderTimeline();
}

// Global delegated handler for any [data-edit] trigger (buttons or headings)
document.addEventListener('click', (e)=>{
  const trigger = e.target.closest('[data-edit]');
  if (!trigger) return;
  const key = trigger.getAttribute('data-edit');
  if (!key) return;
  if (['identity','school','transcript','activities','testing','recommenders','essays','ferpa'].includes(key)) {
    e.preventDefault();
    openEditor(key);
  }
});

// Bottom sheet for timeline node details
const sheet = document.getElementById('sheet');
const sheetTitle = document.getElementById('sheetTitle');
const sheetContent = document.getElementById('sheetContent');
const sheetClose = document.getElementById('sheetClose');
const sheetDone = document.getElementById('sheetDone');
let sheetItemRef = null;

function openSheet(item){
  if (!sheet || !sheetTitle || !sheetContent) return;
  if (!item) return;
  
  sheetItemRef = item;
  sheetTitle.textContent = item.title || 'Task Details';
  
  const tagsText = (item.tags && Array.isArray(item.tags)) 
    ? item.tags.map(t=>'#'+t).join(' ') 
    : '';
  const tagsHtml = tagsText ? `Type: ${item.type || 'Task'} · Tags: ${tagsText}<br/>` : `Type: ${item.type || 'Task'}<br/>`;
  const achievementHtml = item.done ? `<span class='badge-achv'>${item.achievement || 'Completed'}</span>` : '';
  
  sheetContent.innerHTML = tagsHtml + achievementHtml;
  sheet.classList.remove('hidden');
}
function closeSheet(){ 
  if (!sheet) return;
  sheet.classList.add('hidden'); 
  sheetItemRef=null; 
}
if (sheetClose) {
sheetClose.addEventListener('click', closeSheet);
}
if (sheet) {
sheet.addEventListener('click', (e)=>{ if(e.target===sheet) closeSheet(); });
}
if (sheetDone) {
sheetDone.addEventListener('click', ()=>{
  if (!sheetItemRef) return;
  sheetItemRef.done = true;
  sheetItemRef.achievement = sheetItemRef.achievement || 'Milestone completed';
  renderTimeline();
  closeSheet();
});
}

function renderProfileSummary(targetElement = null){
  const profileSummaryEl = targetElement || document.getElementById('profileSummary');
  if (!profileSummaryEl) {
    console.warn('profileSummary element not found');
    return;
  }
  
  const school = getSection('School');
  const identity = getSection('Identity');
  const majors = getSection('Intended Major');
  const activities = getSection('Activities');
  const essays = getSection('Essays');
  const recs = getSection('Recommenders');
  const apps = getSection('Applications');
  const get = (sec,key)=> (sec && sec.params ? (sec.params.find(p=>p[0]===key)||[])[1] || '' : '');
  const line = (label, rightHTML)=>`<li><span>${label}</span><span class="badges">${rightHTML}</span></li>`;
  profileSummaryEl.innerHTML = [
    line(`Identity: ${get(identity,'Name') || '—'} · ${get(identity,'DOB') || '—'} · ${get(identity,'Country') || '—'}`, ``),
    line(`School: ${get(school,'High School') || '—'}`, `<span class='badge-pill'>GPA ${get(school,'GPA')||'—'}</span>`),
    line(`Intended Major`, `<span class='badge-pill'>${get(majors,'Majors')||'—'}</span>`),
    line(`Activities`, `<span class='badge-pill'>${get(activities,'Count')||'0'} items</span><span class='badge-pill'>Top ${get(activities,'Top')||'—'}</span>`),
    line(`Essays`, `<span class='badge-pill'>${get(essays,'Personal Essay')||'—'}</span>`),
    line(`Recommenders`, `<span class='badge-pill'>Counselor ${get(recs,'Counselor')||'—'}</span><span class='badge-pill'>Teachers ${get(recs,'Teachers')||'0'}</span>`),
    line(`Applications`, `<span class='badge-pill'>${get(apps,'Applied')||'0/0'}</span><span class='badge-pill'>Next ${get(apps,'Next')||'—'}</span>`),
  ].join('');
}

// Summary card rendering
const btnGoAdvisor = document.getElementById('btnGoAdvisor');
const btnGoRoadmap = document.getElementById('btnGoRoadmap');
const btnShowGuide = document.getElementById('btnShowGuide');
const guideCard = document.getElementById('guideCard');

btnGoAdvisor?.addEventListener('click', ()=>{ setRoute('advisor'); state.returnToProfileExpand = true; });
btnGoRoadmap?.addEventListener('click', ()=>{ setRoute('roadmap'); state.returnToProfileExpand = true; });
btnShowGuide?.addEventListener('click', ()=>{ guideCard?.classList.toggle('hidden'); });

// Seed default profile data to show non-empty Summary
function seedProfileDefaults(){
  const ident = getSection('Identity');
  const school = getSection('School');
  const major = getSection('Intended Major');
  const activities = getSection('Activities');
  const essays = getSection('Essays');
  const recs = getSection('Recommenders');
  const apps = getSection('Applications');
  function upsert(sec, key, val){
    const row = sec.params.find(p=>p[0]===key);
    if (row) { if (!row[1]) row[1] = val; } else { sec.params.push([key,val]); }
  }
  upsert(ident, 'Name', state.profile.name || 'New Student');
  upsert(ident, 'DOB', '—');
  upsert(ident, 'Country', '—');
  upsert(school, 'High School', school.params.find(p=>p[0]==='High School')?.[1] || '—');
  upsert(school, 'GPA', school.params.find(p=>p[0]==='GPA')?.[1] || '3.8');
  upsert(major, 'Majors', major.params.find(p=>p[0]==='Majors')?.[1] || 'Undecided');
  upsert(activities, 'Count', activities.params.find(p=>p[0]==='Count')?.[1] || '0');
  upsert(activities, 'Top', activities.params.find(p=>p[0]==='Top')?.[1] || '—');
  upsert(essays, 'Personal Essay', essays.params.find(p=>p[0]==='Personal Essay')?.[1] || 'draft');
  upsert(recs, 'Counselor', recs.params.find(p=>p[0]==='Counselor')?.[1] || 'needed');
  upsert(recs, 'Teachers', recs.params.find(p=>p[0]==='Teachers')?.[1] || '0');
  upsert(apps, 'Applied', apps.params.find(p=>p[0]==='Applied')?.[1] || '0/0');
  upsert(apps, 'Next', apps.params.find(p=>p[0]==='Next')?.[1] || '—');
}

// Profile route observer: auto-expand sections and show voice sidebar
const profileRouteObserver = new MutationObserver(()=>{
  const active = views.profile.classList.contains('active');
  if (active) {
    // Show top tabs if onboarding is complete (targetMajors or targetSchools are set, or user skipped onboarding)
    const isOnboardingComplete = (state.profile.targetMajors && state.profile.targetMajors.length > 0) || 
                                  (state.profile.targetSchools && state.profile.targetSchools.length > 0) ||
                                  state.onboardingIndex === steps.length - 1;
    const topTabs = document.getElementById('topTabs');
    if (topTabs && isOnboardingComplete) {
      topTabs.classList.remove('hidden');
    }
    // Ensure defaults for Summary
    seedProfileDefaults();
    // Ensure GAP exists
    if (!state.gap) {
      state.gap = generateGap();
      if (gapMeta) gapMeta.textContent = 'Initial GAP analysis generated.';
    }
    renderProfileSummary();
    renderProfileAndGap();
    renderGuideMeta();
    window.renderProfileSections?.();
    if (state.returnToProfileExpand) {
      profileSectionsEl.querySelectorAll('.section-item').forEach(el=> el.classList.add('expanded'));
      state.returnToProfileExpand = false;
    }
    // Don't auto-show sidebar on profile view unless there are suggestions
    if (state.suggestions && state.suggestions.length) {
      showVoiceSidebar();
    } else {
      if (voiceSidebar) voiceSidebar.classList.add('hidden');
      if (voiceSuggestions) {
      voiceSuggestions.innerHTML = `<li class="suggestion"><div class="muted">Speak: \"My GPA is 3.9\", \"Ridgefield High School\", \"Computer Science\"...</div></li>`;
      }
    }
  }
});
profileRouteObserver.observe(views.profile, { attributes: true, attributeFilter: ['class'] });

// Guide -> Editor routing
const guideCardEl = document.getElementById('guideCard');
const viewEditor = document.getElementById('view-editor');
const editorTitle = document.getElementById('editorTitle');
const editorBody = document.getElementById('editorBody');
const btnBackProfileE = document.getElementById('btnBackProfileE');

// Guide -> Editor routing - make entire guide-card clickable
guideCardEl?.addEventListener('click', (e)=>{
  // Check if clicked on a guide-card or inside it
  const guideCard = e.target.closest('.guide-card');
  if (!guideCard) return;
  
  // Get the section from data-section attribute
  const key = guideCard.getAttribute('data-section');
  if (!key) return;
  
  // Prevent if clicking on nested interactive elements
  if (e.target.closest('button') || e.target.closest('a')) return;
  
  e.preventDefault();
  e.stopPropagation();
  openEditor(key);
});

btnBackProfileE?.addEventListener('click', ()=>{ setRoute('profile'); state.returnToProfileExpand = true; });

function openEditor(key){
  setRoute('editor');
  // ensure top
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_) {}
  renderEditor(key);
  if (!editorBody.innerHTML) {
    editorTitle.textContent = 'Editor';
    editorBody.textContent = 'Coming soon';
  }
}

// Helper to open simple activity edit in bottom sheet
function openActivityEdit(activity, onSave){
  openSheet(activity);
  sheetContent.innerHTML = `
    <div class="form">
      <label>Title<input id="actTitle" value="${escapeHtml(activity.title||'')}" /></label>
      <label>Role<input id="actRole" value="${escapeHtml(activity.role||'')}" /></label>
      <label>Hours/week<input id="actHours" value="${escapeHtml(activity.hours||'')}" inputmode="decimal" /></label>
      <label>Grades (e.g., 9-12)<input id="actGrades" value="${escapeHtml(activity.grades||'')}" /></label>
      <button id="actSave">Save</button>
    </div>`;
  sheetDone.classList.add('hidden');
  document.getElementById('actSave').onclick = ()=>{
    activity.title = document.getElementById('actTitle').value.trim();
    activity.role = document.getElementById('actRole').value.trim();
    activity.hours = document.getElementById('actHours').value.trim();
    activity.grades = document.getElementById('actGrades').value.trim();
    closeSheet(); sheetDone.classList.remove('hidden');
    onSave && onSave(activity);
  };
}

// Activities editor renderer (reference UI)
function renderActivitiesEditor(){
  editorTitle.textContent = 'Activities';
  // seed example items
  if (!state.activities) {
    state.activities = [
      { id:'a1', title:'Debate Club', role:'President', hours:'10 hrs/week', grades:'Grade 9-12' },
      { id:'a2', title:'Math Team', role:'Captain', hours:'5 hrs/week', grades:'Grade 10-12' },
      { id:'a3', title:'Coding Club', role:'Founder', hours:'8 hrs/week', grades:'Grade 11-12' },
    ];
  }
  editorBody.innerHTML = `
    <div class="editor-summary">Quick summary</div>
    <div class="card-list" id="actList"></div>
    <div class="divider-line"></div>
    <div class="add-bar" id="actAdd">
      <span>＋</span>
      <span>Add Activity</span>
    </div>`;
  const list = document.getElementById('actList');
  if (!list) return;
  if (!state.activities || !Array.isArray(state.activities)) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = state.activities.map(a=>`
    <div class="card-item" data-id="${a.id || ''}">
      <div>
        <div class="title">${a.title || 'Activity'}</div>
        <div class="subtitle">${a.role || ''} · ${a.hours || ''} · ${a.grades || ''}</div>
      </div>
      <button class="action">Edit</button>
    </div>`).join('');
  list.querySelectorAll('.card-item .action').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const cardItem = e.target.closest('.card-item');
      if (!cardItem) return;
      const id = cardItem.dataset.id;
      if (!id) return;
      const item = state.activities.find(x=>x.id===id);
      if (item) {
      openActivityEdit({ ...item }, (updated)=>{
        Object.assign(item, updated);
        renderActivitiesEditor();
      });
      }
    });
  });
  const actAdd = document.getElementById('actAdd');
  if (actAdd) {
    actAdd.addEventListener('click', ()=>{
    openActivityEdit({ id: 'a'+Date.now(), title:'', role:'', hours:'', grades:'' }, (created)=>{
        if (!state.activities) state.activities = [];
      state.activities.unshift(created);
      setSectionParam('Activities','Count', String(state.activities.length), true);
      setSectionParam('Activities','Top', state.activities[0]?.title || '', true);
      renderActivitiesEditor();
    });
  });
  }
}

// integrate into renderEditor switch
function renderEditor(key){
  const renderers = {
    identity: undefined,
    school: undefined,
    transcript: undefined,
    activities: renderActivitiesEditor,
    testing: undefined,
    recommenders: undefined,
    essays: undefined,
    ferpa: undefined,
  };
  if (renderers[key]) return renderers[key]();
  // fall back to previous implementation if exist
  if (key === 'identity') return (function(){
    editorTitle.textContent = 'Identity & Contact';
    const sec = getSection('Identity');
    const name = (sec.params.find(p=>p[0]==='Name')||['',''])[1];
    const dob = (sec.params.find(p=>p[0]==='DOB')||['',''])[1];
    const email = state.profile.email || '';
    editorBody.innerHTML = `
      <div class="form">
        <label>Name<input id="edName" value="${escapeHtml(name)}" /></label>
        <label>Date of birth<input id="edDOB" value="${escapeHtml(dob)}" /></label>
        <label>Email<input id="edEmail" value="${escapeHtml(email)}" inputmode="email" /></label>
        <button id="edSaveIdentity">Save</button>
      </div>`;
    document.getElementById('edSaveIdentity').onclick = ()=>{
      setSectionParam('Identity','Name', document.getElementById('edName').value, true);
      setSectionParam('Identity','DOB', document.getElementById('edDOB').value, true);
      state.profile.email = document.getElementById('edEmail').value;
      setRoute('profile'); renderProfileSummary();
    };
  })();
  if (key === 'school') return (function(){
    editorTitle.textContent = 'School & CEEB';
    const sec = getSection('School');
    const hs = (sec.params.find(p=>p[0]==='High School')||['',''])[1];
    const gpa = (sec.params.find(p=>p[0]==='GPA')||['',''])[1];
    editorBody.innerHTML = `
      <div class="form">
        <label>High School<input id="edHS" value="${escapeHtml(hs)}" /></label>
        <label>CEEB<input id="edCEEB" placeholder="123456" /></label>
        <label>GPA<input id="edGPA" value="${escapeHtml(gpa)}" inputmode="decimal" /></label>
        <button id="edSaveSchool">Save</button>
      </div>`;
    document.getElementById('edSaveSchool').onclick = ()=>{
      setSectionParam('School','High School', document.getElementById('edHS').value, true);
      setSectionParam('School','GPA', document.getElementById('edGPA').value, true);
      setRoute('profile'); renderProfileSummary();
    };
  })();
  if (key === 'transcript') return (function(){
    editorTitle.textContent = 'Transcript / GPA';
    editorBody.innerHTML = `
      <div class="form">
        <label>Upload transcript (OCR)
          <input type="file" id="edTranscript" accept="application/pdf,image/*" />
        </label>
        <div class="muted">Demo: OCR not implemented; pretend GPA parsed.</div>
        <button id="edParse">Parse & Fill</button>
      </div>`;
    document.getElementById('edParse').onclick = ()=>{
      setSectionParam('School','GPA', '3.9', true);
      setRoute('profile'); renderProfileSummary();
    };
  })();
  if (key === 'testing') return (function(){
    editorTitle.textContent = 'Testing';
    editorBody.innerHTML = `
      <div class="form">
        <label>SAT (optional)<input id="edSAT" placeholder="1500" inputmode="numeric" /></label>
        <label>Self-report<input type="checkbox" id="edSelf" /></label>
        <button id="edSaveTesting">Save</button>
      </div>`;
    document.getElementById('edSaveTesting').onclick = ()=>{
      setSectionParam('Applications','Next', 'SAT submit planned', true);
      setRoute('profile'); renderProfileSummary();
    };
  })();
  if (key === 'recommenders') return (function(){
    editorTitle.textContent = 'Recommenders';
    editorBody.innerHTML = `
      <div class="form">
        <div class="form inline"><input id="recName" placeholder="Name" /><input id="recEmail" placeholder="Email" inputmode="email" /><button id="recInvite">Invite</button></div>
        <ul id="recList" class="list"></ul>
      </div>`;
    const recList = document.getElementById('recList');
    document.getElementById('recInvite').onclick = ()=>{
      const name = document.getElementById('recName').value.trim();
      const email = document.getElementById('recEmail').value.trim();
      if (!name || !email) return;
      const li = document.createElement('li'); li.textContent = `${name} · ${email} · invited`;
      recList.appendChild(li);
      setSectionParam('Recommenders','Teachers', '1', true);
    };
  })();
  if (key === 'essays') return (function(){
    editorTitle.textContent = 'Essays';
    editorBody.innerHTML = `
      <div class="form">
        <textarea id="essayText" rows="8" style="width:100%;" placeholder="Paste your draft..."></textarea>
        <div class="row" style="gap:8px;"><button id="essayAnalyze">AI analyze</button><span id="essayCount" class="muted"></span></div>
      </div>`;
    const ta = document.getElementById('essayText');
    const count = document.getElementById('essayCount');
    ta.addEventListener('input', ()=>{ count.textContent = `${ta.value.trim().split(/\s+/).filter(Boolean).length} words`; });
    document.getElementById('essayAnalyze').onclick = ()=>{ speak('Your theme is coherent. Consider adding a concrete anecdote.'); };
  })();
  if (key === 'ferpa') return (function(){
    editorTitle.textContent = 'Permissions / FERPA';
    editorBody.innerHTML = `
      <div class="form">
        <div class="muted">I waive my right to review recommendations.</div>
        <label><input type="checkbox" id="ferpaAgree" /> I agree</label>
        <button id="ferpaSign">Sign</button>
      </div>`;
    document.getElementById('ferpaSign').onclick = ()=>{ speak('FERPA signed and archived.'); setRoute('profile'); };
  })();
  editorTitle.textContent = 'Editor';
  editorBody.textContent = 'Coming soon';
}

// Boot function moved to end of file

// Global click delegation for toggleTutor (ensures binding even if re-rendered)
document.addEventListener('click', (e)=>{
  const t = e.target;
  if (t && t.id === 'toggleTutor') {
    e.preventDefault();
    e.stopPropagation();
    const stream = document.getElementById('tutorStream');
    if (!stream) return;
    const hidden = stream.classList.toggle('hidden');
    t.textContent = hidden ? 'Show' : 'Hide';
  }
});

// Global navigation buttons (work regardless of placement)
document.addEventListener('click', async (e)=>{
  const t = e.target;
  if (!t) return;
  
  if (t.id === 'btnGoAdvisor') {
    e.preventDefault();
    // Default select first two majors if none selected yet
    if (!state.selectedMajors || state.selectedMajors.length === 0) {
      state.selectedMajors = state.majors.slice(0,2).map(m=>m.id);
      // Render will happen when advisor view is loaded
      try { 
        const majorListEl = document.getElementById('majorList');
        if (majorListEl && typeof renderMajors === 'function') {
          renderMajors(majorListEl);
        }
        if (typeof updateSelectedLabels === 'function') {
          updateSelectedLabels();
        }
      } catch(_) {}
    }
    await navigateToRoute('advisor', {
      sectionId: 'view-advisor',
      containerId: 'view-advisor-container',
      updateTab: true,
      scrollToTop: true
    });
  }
  
  if (t.id === 'btnGoRoadmap') {
    e.preventDefault();
    await navigateToRoute('roadmap', {
      sectionId: 'view-roadmap',
      containerId: 'view-roadmap-container',
      updateTab: true,
      scrollToTop: true
    });
  }
});

// Top tabs navigation (within profile) - optimized to use navigateToRoute
document.addEventListener('click', async (e)=>{
  // Check if click is on a tab button or its child elements
  const tab = e.target.closest('#topTabs [data-tab-route]');
  if (!tab) return;

  e.preventDefault();
  e.stopPropagation();

  const route = tab.getAttribute('data-tab-route');
  if (!route) {
    console.warn('Tab clicked but no route attribute found');
    return;
  }

  // Check if tab is locked/disabled
  if (tab.hasAttribute('data-locked') || tab.hasAttribute('aria-disabled')) {
    const routeForModal = route;
    if (typeof showUnlockModal === 'function') {
      showUnlockModal(routeForModal);
    }
    return;
  }

  // Provide visual feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // Use unified navigation function
  const sectionInfo = routeSectionMap[route];
  if (sectionInfo) {
    try {
      await navigateToRoute(route, {
        sectionId: sectionInfo.sectionId,
        containerId: sectionInfo.containerId,
        updateTab: true,
        scrollToTop: true
      });
    } catch (error) {
      console.error(`Failed to navigate to ${route}:`, error);
    }
  } else if (route === 'profile') {
    // Profile is already in DOM
    try {
      await navigateToRoute(route, {
        updateTab: true,
        scrollToTop: true
      });
    } catch (error) {
      console.error(`Failed to navigate to profile:`, error);
    }
  } else {
    console.warn(`Unknown route: ${route}`);
  }
});

// Unlock modal functions
function showUnlockModal(route) {
  const modal = document.getElementById('unlockModal');
  const title = document.getElementById('unlockModalTitle');
  const message = document.getElementById('unlockModalMessage');
  
  if (!modal || !title || !message) {
    console.warn('Unlock modal elements not found');
    return;
  }
  
  const routeMessages = {
    persona: {
      title: 'Unlock Persona',
      message: 'Discover your unique academic persona! Complete the onboarding basics to access Persona insights.'
    },
    gap: {
      title: 'Unlock GAP Analysis',
      message: 'Compare your profile against top applicants. Finish the starter profile to unlock GAP analysis.'
    },
    advisor: {
      title: 'Unlock Major Advisor',
      message: 'Get personalised major recommendations. Share a few interests first to unlock the advisor.'
    },
    roadmap: {
      title: 'Unlock Roadmap',
      message: 'Visualise your entire application journey. Complete the onboarding prompts to activate Roadmap.'
    }
  };
  
  const routeInfo = routeMessages[route] || {
    title: 'Unlock Feature',
    message: 'Complete the previous steps to unlock this feature.'
  };
  
  title.textContent = routeInfo.title;
  message.textContent = routeInfo.message;
  
  modal.setAttribute('data-unlock-route', route);
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  
  if (typeof window.speak === 'function') {
    window.speak(routeInfo.message);
  }
}

function hideUnlockModal() {
  const modal = document.getElementById('unlockModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.style.display = 'none';
  modal.removeAttribute('data-unlock-route');
}

function unlockTab(route, navigate = true) {
  const topTabs = document.getElementById('topTabs');
  if (!topTabs) return;
  
  const tab = topTabs.querySelector(`[data-tab-route="${route}"]`);
  if (!tab) return;
  
  tab.classList.remove('locked');
  tab.removeAttribute('data-locked');
  tab.removeAttribute('aria-disabled');
  
  const lockIcon = tab.querySelector('.lock-icon');
  if (lockIcon) {
    lockIcon.remove();
  }
  
  if (!state.unlockedTabs) state.unlockedTabs = [];
  if (!state.unlockedTabs.includes(route)) {
    state.unlockedTabs.push(route);
  }
  
  hideUnlockModal();
  
  if (navigate && typeof setRoute === 'function') {
  setRoute(route);
  }
}

function bindUnlockModalEvents() {
  const unlockConfirmBtn = document.getElementById('unlockConfirmBtn');
  const unlockCancelBtn = document.getElementById('unlockCancelBtn');
  const unlockModal = document.getElementById('unlockModal');
  
  if (unlockConfirmBtn) {
    unlockConfirmBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const route = unlockModal?.getAttribute('data-unlock-route');
      if (route) {
        unlockTab(route, true);
      }
    });
  }
  
  if (unlockCancelBtn) {
    unlockCancelBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideUnlockModal();
    });
  }
  
  unlockModal?.addEventListener('click', (event) => {
    if (event.target === unlockModal) hideUnlockModal();
  });
  
  if (state.unlockedTabs && Array.isArray(state.unlockedTabs)) {
    state.unlockedTabs.forEach((route) => unlockTab(route, false));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindUnlockModalEvents();
});

// executeRouteActions is now handled in router.js

// Risk fab toggle
const riskFab = document.getElementById('riskFab');
const riskPanel = document.getElementById('riskPanel');
riskFab?.addEventListener('click', ()=>{ riskPanel?.classList.toggle('hidden'); });

// CTA do it
const ctaDoIt = document.getElementById('ctaDoIt');
ctaDoIt?.addEventListener('click', ()=>{ speak('Added AP Chem to your plan.'); });

// Demo: spawn golden particles on garden plants when tasks done
function spawnParticlesOn(selector){
  document.querySelectorAll(selector).forEach(cell=>{
    const spark = document.createElement('div');
    spark.style.position='absolute'; spark.style.left='50%'; spark.style.top='50%'; spark.style.width='4px'; spark.style.height='4px'; spark.style.borderRadius='50%';
    spark.style.background='radial-gradient(circle,#ffd46a,#ffba24)'; spark.style.boxShadow='0 0 12px rgba(255,199,80,.9)';
    spark.style.transform='translate(-50%,-50%)'; spark.style.animation='rise 1.2s ease-out forwards';
    cell.appendChild(spark);
    setTimeout(()=> spark.remove(), 1200);
  });
}
const styleAnim = document.createElement('style'); styleAnim.textContent = `@keyframes rise{0%{opacity:.9; transform: translate(-50%,-10%) scale(.6)}100%{opacity:0; transform: translate(-50%,-120%) scale(1.2)}}`; document.head.appendChild(styleAnim);

// ========== ROADMAP ENHANCEMENTS ==========

// Achievement System
state.achievements = state.achievements || [
  { id: 'first_goal', title: 'Goal Setter', description: 'Set your first goal', unlocked: false, icon_locked: '🔒', icon_unlocked: '🎯' },
  { id: 'three_days', title: 'Consistent', description: 'Complete tasks for 3 consecutive days', unlocked: false, icon_locked: '🔒', icon_unlocked: '🔥' },
  { id: 'first_essay', title: 'Writer', description: 'Complete your first essay draft', unlocked: false, icon_locked: '🔒', icon_unlocked: '✍️' },
  { id: 'recommenders', title: 'Networker', description: 'Secure 3 recommenders', unlocked: false, icon_locked: '🔒', icon_unlocked: '🤝' },
  { id: 'applications', title: 'Applicant', description: 'Submit 5 applications', unlocked: false, icon_locked: '🔒', icon_unlocked: '📝' },
];

state.consecutiveDays = state.consecutiveDays || 0;
state.lastActivityDate = state.lastActivityDate || new Date().toDateString();

// Render achievements
function renderAchievements(){
  const carousel = document.getElementById('achievementCarousel');
  if (!carousel) return;
  if (!state.achievements || !Array.isArray(state.achievements)) {
    carousel.innerHTML = '';
    return;
  }
  carousel.innerHTML = state.achievements.map(a => `
    <div class="achievement-badge ${a.unlocked ? 'unlocked' : 'locked'}" data-id="${a.id || ''}">
      <div class="achievement-icon">${a.unlocked ? (a.icon_unlocked || '🎯') : (a.icon_locked || '🔒')}</div>
      <div class="achievement-title">${a.title || a.name || 'Achievement'}</div>
      ${!a.unlocked ? `<div class="achievement-desc">${a.description || ''}</div>` : ''}
    </div>
  `).join('');
  carousel.querySelectorAll('.achievement-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const id = badge.dataset.id;
      if (id) showAchievementModal(id);
    });
  });
}

// Show achievement modal
function showAchievementModal(achievementId){
  const achievement = state.achievements.find(a => a.id === achievementId);
  if (!achievement) return;
  const modal = document.getElementById('achievementModal');
  const icon = document.getElementById('modalAchievementIcon');
  const title = document.getElementById('modalAchievementTitle');
  const desc = document.getElementById('modalAchievementDesc');
  if (!modal || !icon || !title || !desc) return;
  icon.textContent = achievement.unlocked ? achievement.icon_unlocked : achievement.icon_locked;
  title.textContent = achievement.title;
  desc.textContent = achievement.unlocked ? `Unlocked! ${achievement.description}` : `To unlock: ${achievement.description}`;
  modal.classList.remove('hidden');
}

// Unlock achievement with animation
function unlockAchievement(achievementId){
  const achievement = state.achievements.find(a => a.id === achievementId);
  if (!achievement || achievement.unlocked) return;
  achievement.unlocked = true;
  renderAchievements();
  triggerConfetti();
  playDingSound();
  // Update deer animation
  updateDeerState('celebrate');
}

// Confetti animation
function triggerConfetti(){
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.classList.remove('hidden');
  for(let i = 0; i < 50; i++){
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confetti.style.background = ['#6ea8fe', '#7ee787', '#ff9aa9', '#ffd700'][Math.floor(Math.random() * 4)];
    container.appendChild(confetti);
  }
  setTimeout(() => {
    container.classList.add('hidden');
    container.innerHTML = '';
  }, 2000);
}

// Play ding sound (using Web Audio API)
function playDingSound(){
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch(e) {}
}

// Risk Calculation System
function calculateRisk(userData){
  let riskScore = 0;
  const factors = [];
  
  // Check deadlines
  const upcomingDeadlines = state.roadmap?.near?.filter(t => !t.done && new Date(t.deadline || Date.now() + 7*24*60*60*1000) < Date.now() + 7*24*60*60*1000).length || 0;
  if (upcomingDeadlines > 0) {
    riskScore += upcomingDeadlines * 20;
    factors.push(`${upcomingDeadlines} tasks nearing deadline`);
  }
  
  // Check blockers
  const blockers = state.roadmap?.near?.filter(t => !t.done && t.blocked).length || 0;
  if (blockers > 0) {
    riskScore += blockers * 30;
    factors.push(`${blockers} tasks blocked`);
  }
  
  // Check recommenders
  const recommenders = getSection('Recommenders');
  const recStatus = recommenders?.params.find(p => p[0] === 'Counselor')?.[1] || 'needed';
  if (recStatus === 'needed') {
    riskScore += 25;
    factors.push('Recommenders not yet confirmed');
  }
  
  if (riskScore < 30) return { level: 'low', factors, score: riskScore };
  if (riskScore < 60) return { level: 'medium', factors, score: riskScore };
  return { level: 'high', factors, score: riskScore };
}

// Update risk dashboard
function updateRiskDashboard(){
  const risk = calculateRisk(state);
  const riskFab = document.getElementById('riskFab');
  const riskIndicator = document.getElementById('riskIndicator');
  const riskPanel = document.getElementById('riskPanel');
  const riskMessage = document.getElementById('riskMessage');
  const riskFactors = document.getElementById('riskFactors');
  
  if (!riskFab || !riskIndicator) return;
  
  riskFab.className = `risk-fab risk-${risk.level}`;
  riskIndicator.textContent = risk.level === 'high' ? '⚠' : risk.level === 'medium' ? '⚡' : '●';
  
  // Safety check: ensure risk.factors exists and is an array
  const factors = risk.factors && Array.isArray(risk.factors) ? risk.factors : [];
  if (riskMessage) riskMessage.textContent = factors.length > 0 ? factors[0] : 'All clear!';
  if (riskFactors) {
    riskFactors.innerHTML = factors.map(f => `<li>${f || ''}</li>`).join('');
  }
  
  // Haptic feedback for high risk
  if (risk.level === 'high' && navigator.vibrate) {
    navigator.vibrate(200);
  }
  
  // Update deer state based on risk
  if (risk.level === 'medium' || risk.level === 'high') {
    updateDeerState('alert');
  } else {
    updateDeerState('normal');
  }
}

// Plant Growth System
state.plants = state.plants || [];
state.plantStages = ['sprout', 'seedling', 'flowering', 'fruiting'];

// Initialize plants from target schools
function initPlants(){
  if (!state.plants.length && state.profile.targetSchools) {
    state.plants = state.profile.targetSchools.map(school => ({
      id: school.toLowerCase().replace(/\s+/g, '_'),
      name: school,
      stage: 0,
      progress: 0,
      lastWatered: new Date().toISOString(),
      milestones: []
    }));
  }
}

// Render plants
function renderPlants(){
  const carousel = document.getElementById('gardenCarousel');
  const info = document.getElementById('gardenInfo');
  if (!carousel) return;
  
  initPlants();
  
  // Safety check: ensure plants array exists
  if (!state.plants || !Array.isArray(state.plants)) {
    state.plants = [];
    carousel.innerHTML = '';
    return;
  }
  
  carousel.innerHTML = state.plants.map(plant => `
    <div class="plant-pot" data-id="${plant.id || ''}">
      <div class="plant-visual plant-stage-${plant.stage || 'seed'}">
        <div class="pot">🌱</div>
        <div class="plant-name">${plant.name || 'Plant'}</div>
        <div class="plant-progress">${Math.round(plant.progress || 0)}%</div>
      </div>
    </div>
  `).join('');
  
  // Check for wilted plants
  const now = new Date();
  state.plants.forEach(plant => {
    if (!plant.lastWatered) return;
    try {
      const lastWatered = new Date(plant.lastWatered);
      const daysSince = (now - lastWatered) / (1000 * 60 * 60 * 24);
      if (daysSince > 3) {
        const pot = carousel.querySelector(`[data-id="${plant.id}"]`);
        if (pot) pot.classList.add('wilted');
        if (info) info.innerHTML = `<div class="warning">⚠️ Your ${plant.name || 'plan'} plan needs watering! (${Math.floor(daysSince)} days inactive)</div>`;
      }
    } catch (e) {
      console.warn('Error processing plant:', e);
    }
  });
  
  // Long press to show timeline
  carousel.querySelectorAll('.plant-pot').forEach(pot => {
    let pressTimer;
    pot.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        const plantId = pot.dataset.id;
        const plant = state.plants.find(p => p.id === plantId);
        if (plant) showPlantTimeline(plant);
      }, 500);
    });
    pot.addEventListener('mouseup', () => clearTimeout(pressTimer));
    pot.addEventListener('mouseleave', () => clearTimeout(pressTimer));
  });
}

function showPlantTimeline(plant){
  if (!plant) return;
  if (!plant.milestones || !Array.isArray(plant.milestones)) {
    alert(`${plant.name || 'Plant'} Timeline:\nNo milestones yet`);
    return;
  }
  try {
    const milestones = plant.milestones.map(m => {
      try {
        return `- ${m.title || 'Milestone'} (${m.date ? new Date(m.date).toLocaleDateString() : 'Date unknown'})`;
      } catch (e) {
        return `- ${m.title || 'Milestone'}`;
      }
    }).join('\n');
    alert(`${plant.name || 'Plant'} Timeline:\n${milestones || 'No milestones yet'}`);
  } catch (e) {
    console.error('Error showing plant timeline:', e);
    alert(`${plant.name || 'Plant'} Timeline:\nNo milestones yet`);
  }
}

// Update plant progress
function updatePlantProgress(schoolName, milestone){
  if (!state.plants || !Array.isArray(state.plants)) return;
  const plant = state.plants.find(p => p.name === schoolName);
  if (!plant) return;
  
  if (!plant.milestones) plant.milestones = [];
  plant.milestones.push({ title: milestone || 'Milestone', date: new Date().toISOString() });
  plant.progress = Math.min(100, (plant.progress || 0) + 20);
  
  // Advance stage
  if (!state.plantStages) state.plantStages = ['sprout', 'seedling', 'flowering', 'fruiting'];
  if (plant.progress >= 100 && plant.stage && state.plantStages.includes(plant.stage)) {
    const currentIndex = state.plantStages.indexOf(plant.stage);
    if (currentIndex >= 0 && currentIndex < state.plantStages.length - 1) {
      plant.stage = state.plantStages[currentIndex + 1];
      plant.progress = 0;
    }
  }
  
  plant.lastWatered = new Date().toISOString();
  renderPlants();
  triggerParticleEffect();
}

// Deer AI Assistant States
function updateDeerState(state){
  const deer = document.getElementById('aiDeer');
  const bubble = document.getElementById('deerBubble');
  const message = document.getElementById('deerMessage');
  
  if (!deer) return;
  
  deer.className = `deer deer-${state}`;
  
  if (state === 'alert') {
    if (bubble) bubble.classList.remove('hidden');
    if (message) message.textContent = '⚠️ Some tasks need attention!';
  } else if (state === 'celebrate') {
    if (bubble) bubble.classList.remove('hidden');
    if (message) message.textContent = '🎉 Achievement unlocked! Great job!';
    setTimeout(() => updateDeerState('normal'), 3000);
  } else {
    if (bubble) bubble.classList.add('hidden');
  }
}

// Particle effect on task completion
function triggerParticleEffect(){
  const particles = 20;
  for(let i = 0; i < particles; i++){
    const particle = document.createElement('div');
    particle.className = 'particle';
    const angle = (Math.PI * 2 * i) / particles;
    const distance = 100 + Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.background = ['#ffd700', '#6ea8fe', '#7ee787'][Math.floor(Math.random() * 3)];
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
  speak('Great job! You\'re one step closer to your dream school!');
}

// Session timer for break reminder
let sessionStartTime = Date.now();
let breakModalShown = false;

function checkSessionTime(){
  const elapsed = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
  if (elapsed > 30 && !breakModalShown) {
    showBreakModal();
    breakModalShown = true;
  }
}

function showBreakModal(){
  const modal = document.getElementById('breakModal');
  const wrap = document.getElementById('bubbleWrap');
  if (!modal || !wrap) return;
  
  // Generate bubbles
  wrap.innerHTML = '';
  for(let i = 0; i < 30; i++){
    const bubble = document.createElement('div');
    bubble.className = 'bubble-pop';
    bubble.style.left = Math.random() * 90 + '%';
    bubble.style.top = Math.random() * 90 + '%';
    bubble.style.size = (Math.random() * 30 + 20) + 'px';
    wrap.appendChild(bubble);
    
    bubble.addEventListener('click', () => {
      playPopSound();
      bubble.remove();
    });
  }
  
  modal.classList.remove('hidden');
}

function playPopSound(){
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch(e) {}
}

// Check consecutive days
function checkConsecutiveDays(){
  const today = new Date().toDateString();
  if (state.lastActivityDate === today) return;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (state.lastActivityDate === yesterdayStr) {
    state.consecutiveDays++;
  } else {
    state.consecutiveDays = 1;
  }
  
  state.lastActivityDate = today;
  
  if (state.consecutiveDays >= 3) {
    unlockAchievement('three_days');
  }
}

// Adventure Map Enhancements
state.questProgress = state.questProgress || {
  tests: 0,
  recommenders: 0,
  essays: 0,
  portfolio: 0,
  applications: 0
};

// Update quest path based on progress
function updateQuestPath(){
  const path = document.getElementById('questPath');
  const avatar = document.getElementById('questAvatar');
  if (!path || !avatar) return;
  
  // Calculate overall progress
  const total = Object.values(state.questProgress).reduce((a, b) => a + b, 0);
  const maxProgress = 500; // 5 categories * 100
  const progressPercent = Math.min(100, (total / maxProgress) * 100);
  
  // Update path glow width (8% to 80% of container width = 72% max)
  const pathWidth = 72 * (progressPercent / 100);
  path.style.width = `${pathWidth}%`;
  
  // Move avatar along path (8% to 80% of container width)
  const avatarPosition = 8 + (pathWidth * 0.92); // 8% base + 92% of path width
  avatar.style.left = `${avatarPosition}%`;
  
  // Mark completed landmarks
  document.querySelectorAll('.landmark').forEach(landmark => {
    const category = landmark.dataset.category;
    if (category && state.questProgress[category] >= 20) {
      landmark.classList.add('completed');
    } else {
      landmark.classList.remove('completed');
    }
  });
}

// Handle landmark clicks
document.addEventListener('click', (e)=>{
  const landmark = e.target.closest('.landmark');
  if (landmark) {
    const category = landmark.dataset.category;
    if (category) {
      // Show task list for this category
      showCategoryTasks(category);
    }
  }
});

function showCategoryTasks(category){
  const categoryNames = {
    tests: 'Standardized Tests',
    recommenders: 'Recommendation Letters',
    essays: 'Essays',
    portfolio: 'Portfolio',
    applications: 'Applications'
  };
  
  const tasks = state.roadmap?.near?.concat(state.roadmap?.mid || [], state.roadmap?.far || [])
    .filter(t => t.category === category || (category === 'tests' && t.tags?.includes('standardized'))) || [];
  
  const message = tasks.length > 0 
    ? `${categoryNames[category]}: ${tasks.filter(t => t.done).length}/${tasks.length} completed`
    : `No tasks for ${categoryNames[category]} yet`;
  
  speak(message);
  updateDeerState('normal');
  const bubble = document.getElementById('deerBubble');
  const msg = document.getElementById('deerMessage');
  if (bubble && msg) {
    bubble.classList.remove('hidden');
    msg.textContent = message;
    setTimeout(() => bubble.classList.add('hidden'), 3000);
  }
}

// Bottom navigation handler
document.addEventListener('click', (e)=>{
  const navBtn = e.target.closest('.nav-btn[data-nav]');
  if (!navBtn) return;
  
  const nav = navBtn.dataset.nav;
  if (!nav) return;
  
  // Update active state
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  navBtn.classList.add('active');
  
  // Handle navigation
  if (nav === 'garden') {
    // Scroll to garden section
    const gardenCard = document.querySelector('#gardenCarousel')?.closest('.card');
    if (gardenCard) gardenCard.scrollIntoView({ behavior: 'smooth' });
  } else if (nav === 'map') {
    // Scroll to quest map
    const questMap = document.querySelector('.quest-map');
    if (questMap) questMap.scrollIntoView({ behavior: 'smooth' });
  } else if (nav === 'achievements') {
    // Scroll to achievements
    const achievementPanel = document.getElementById('achievementPanel');
    if (achievementPanel) achievementPanel.scrollIntoView({ behavior: 'smooth' });
  } else if (nav === 'profile') {
    setRoute('profile');
  }
});

// Task completion handler - update quest progress
function completeTask(taskId, category){
  if (!category) return;
  
  // Update progress
  if (state.questProgress[category] !== undefined) {
    state.questProgress[category] = Math.min(100, state.questProgress[category] + 20);
  }
  
  // Update path
  updateQuestPath();
  
  // Trigger particle effect
  triggerParticleEffect();
  
  // Check for consecutive days
  checkConsecutiveDays();
  
  // Update plant progress if applicable
  if (state.profile.targetSchools && state.profile.targetSchools.length > 0) {
    state.profile.targetSchools.forEach(school => {
      updatePlantProgress(school, `Completed ${category} task`);
    });
  }
  
  // Check achievements
  if (category === 'essays' && state.questProgress.essays >= 20) {
    unlockAchievement('first_essay');
  }
  if (category === 'recommenders' && state.questProgress.recommenders >= 60) {
    unlockAchievement('recommenders');
  }
  if (category === 'applications' && state.questProgress.applications >= 100) {
    unlockAchievement('applications');
  }
}

// Roadmap content data - inlined to avoid network requests
const roadmapData = {
  stages: [
    {
      stage_id: "stage_grade_9",
      name: "Grade 9: Foundation & Exploration",
      theme: "Laying the Cornerstone",
      status: "unlocked",
      progress: 30,
      associated_plant_stage: "Seed",
      icon: "🌱",
      description: "Establish academic foundations and explore interests",
      key_milestones: [
        {
          milestone_id: "ms_0901",
          name: "Academic Foundation Plan",
          description: "Establish a strong academic plan and select foundational courses for your high school journey.",
          category: "Academic",
          status: "completed",
          deadline: null,
          triggers_achievement: "ach_foundation_pioneer",
          quest_category: "portfolio"
        },
        {
          milestone_id: "ms_0902",
          name: "Initial Extracurricular Mapping",
          description: "Explore and engage in initial extracurricular activities to discover your passions.",
          category: "Personal Growth",
          status: "in_progress",
          deadline: null,
          quest_category: "portfolio"
        },
        {
          milestone_id: "ms_0903",
          name: "Build Academic Relationships",
          description: "Connect with teachers and mentors who can support your journey.",
          category: "Personal Growth",
          status: "pending",
          deadline: null,
          quest_category: "recommenders"
        }
      ]
    },
    {
      stage_id: "stage_grade_10",
      name: "Grade 10: Deepening & Growth",
      theme: "Branching Out",
      status: "unlocked",
      progress: 15,
      associated_plant_stage: "Sprout",
      icon: "🌿",
      description: "Deepen commitments and build leadership",
      key_milestones: [
        {
          milestone_id: "ms_1001",
          name: "Comprehensive GAP Analysis",
          description: "Conduct a detailed analysis of your academic and extracurricular profile to identify strengths and areas for development.",
          category: "Strategic Planning",
          status: "pending",
          deadline: null,
          triggers_achievement: "ach_strategic_thinker",
          quest_category: "portfolio"
        },
        {
          milestone_id: "ms_1002",
          name: "Leadership Roles",
          description: "Take on leadership positions in clubs or activities.",
          category: "Personal Growth",
          status: "pending",
          deadline: null,
          quest_category: "portfolio"
        },
        {
          milestone_id: "ms_1003",
          name: "PSAT Preparation",
          description: "Prepare for and take the PSAT to establish baseline scores.",
          category: "Academic",
          status: "pending",
          deadline: "2024-10-15",
          deadline_sensitive: true,
          quest_category: "tests"
        }
      ]
    },
    {
      stage_id: "stage_grade_11",
      name: "Grade 11: Intensity & Achievement",
      theme: "Reaching for the Sun",
      status: "locked",
      progress: 0,
      associated_plant_stage: "Flowering",
      icon: "🌺",
      description: "Demonstrate excellence and commitment",
      key_milestones: [
        {
          milestone_id: "ms_1101",
          name: "Standardized Testing Mastery",
          description: "Prepare for and achieve target scores on standardized tests like the SAT or ACT.",
          category: "Academic",
          status: "pending",
          deadline: "2025-06-01",
          deadline_sensitive: true,
          quest_category: "tests"
        },
        {
          milestone_id: "ms_1102",
          name: "Capstone Project Completion",
          description: "Complete a significant, long-term project that showcases your passion and skills in a chosen area.",
          category: "Personal Growth",
          status: "pending",
          deadline: null,
          triggers_achievement: "ach_capstone_champion",
          quest_category: "portfolio"
        },
        {
          milestone_id: "ms_1103",
          name: "Teacher Recommendations",
          description: "Secure strong recommendation letters from teachers and counselors.",
          category: "Strategic Planning",
          status: "pending",
          deadline: null,
          quest_category: "recommenders"
        },
        {
          milestone_id: "ms_1104",
          name: "College Research & Visits",
          description: "Research and visit colleges to refine your list.",
          category: "Strategic Planning",
          status: "pending",
          deadline: null,
          quest_category: "applications"
        }
      ]
    },
    {
      stage_id: "stage_grade_12",
      name: "Grade 12: Application & Submission",
      theme: "Harvesting Success",
      status: "locked",
      progress: 0,
      associated_plant_stage: "Fruit",
      icon: "🍎",
      description: "Complete applications and submit to colleges",
      key_milestones: [
        {
          milestone_id: "ms_1201",
          name: "Finalized College List & Strategy",
          description: "Curate and finalize a balanced list of target, reach, and safety schools.",
          category: "Strategic Planning",
          status: "pending",
          deadline: "2025-08-01",
          quest_category: "applications"
        },
        {
          milestone_id: "ms_1202",
          name: "Personal Statement & Essays",
          description: "Write compelling personal statements and supplemental essays.",
          category: "Execution",
          status: "pending",
          deadline: "2025-10-15",
          deadline_sensitive: true,
          triggers_achievement: "ach_essay_master",
          quest_category: "essays"
        },
        {
          milestone_id: "ms_1203",
          name: "Application Submission",
          description: "Successfully prepare and submit all components of your college applications.",
          category: "Execution",
          status: "pending",
          deadline: "2025-12-31",
          dependency_sensitive: true,
          triggers_achievement: "ach_application_voyager",
          quest_category: "applications"
        },
        {
          milestone_id: "ms_1204",
          name: "Financial Aid Applications",
          description: "Complete FAFSA and CSS Profile applications.",
          category: "Execution",
          status: "pending",
          deadline: "2025-12-31",
          deadline_sensitive: true,
          quest_category: "applications"
        }
      ]
    }
  ],
  achievements: [
    {
      achievement_id: "ach_foundation_pioneer",
      name: "Foundation Pioneer",
      description: "Successfully established your 4-year academic and activity plan.",
      category: "Planning",
      icon_locked: "🔒",
      icon_unlocked: "🎯",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_strategic_thinker",
      name: "Strategic Thinker",
      description: "Completed a comprehensive GAP analysis of your profile.",
      category: "Analysis",
      icon_locked: "🔒",
      icon_unlocked: "🧠",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_test_master",
      name: "Test Master",
      description: "Achieved your target score on standardized tests.",
      category: "Academic",
      icon_locked: "🔒",
      icon_unlocked: "📊",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_capstone_champion",
      name: "Capstone Champion",
      description: "Successfully completed a major capstone project.",
      category: "Excellence",
      icon_locked: "🔒",
      icon_unlocked: "🏆",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_essay_master",
      name: "Essay Master",
      description: "Completed all application essays with excellence.",
      category: "Writing",
      icon_locked: "🔒",
      icon_unlocked: "✍️",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_application_voyager",
      name: "Application Voyager",
      description: "Submitted your first complete college application.",
      category: "Milestone",
      icon_locked: "🔒",
      icon_unlocked: "🚀",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    },
    {
      achievement_id: "ach_perfect_application",
      name: "Perfect Application",
      description: "Submitted applications to all target schools.",
      category: "Milestone",
      icon_locked: "🔒",
      icon_unlocked: "⭐",
      unlocked: false,
      unlock_animation: "confetti_fall",
      unlock_sound: "ding.mp3"
    }
  ],
  risk_modes: {
    low: {
      level: "Low Risk",
      color_code: "#3498db",
      animation: "pulse",
      threshold: { min: 0, max: 29 },
      message: "You're on track! Keep up the great work.",
      icon: "✓"
    },
    medium: {
      level: "Medium Risk",
      color_code: "#f1c40f",
      animation: "breathing_light",
      threshold: { min: 30, max: 59 },
      message: "Some areas need attention. Review your timeline.",
      icon: "⚠"
    },
    high: {
      level: "High Risk",
      color_code: "#e74c3c",
      animation: "vibration_alert",
      threshold: { min: 60, max: 100 },
      message: "Urgent action needed. Focus on critical deadlines.",
      icon: "🚨"
    }
  },
  quest_categories: {
    tests: {
      name: "Standardized Tests",
      icon: "📝",
      description: "SAT, ACT, AP exams and test preparation"
    },
    recommenders: {
      name: "Recommendations",
      icon: "🤝",
      description: "Teacher and counselor recommendations"
    },
    essays: {
      name: "Essays",
      icon: "✍️",
      description: "Personal statements and supplemental essays"
    },
    portfolio: {
      name: "Portfolio",
      icon: "📚",
      description: "Activities, projects, and achievements"
    },
    applications: {
      name: "Applications",
      icon: "📋",
      description: "College applications and submissions"
    }
  },
  plant_stages: {
    Seed: {
      icon: "🌱",
      description: "Newly planted - just starting your journey",
      progress_threshold: 0
    },
    Sprout: {
      icon: "🌿",
      description: "Growing strong - making progress",
      progress_threshold: 25
    },
    Flowering: {
      icon: "🌺",
      description: "Blooming - showing your potential",
      progress_threshold: 50
    },
    Fruit: {
      icon: "🍎",
      description: "Fruiting - ready for harvest",
      progress_threshold: 75
    },
    Harvest: {
      icon: "🌟",
      description: "Harvested - applications submitted!",
      progress_threshold: 100
    }
  }
};

// Load roadmap data - now returns inlined data instead of fetching
function loadRoadmapData() {
  // Data is already available as roadmapData constant
  // Return a resolved promise for compatibility with existing code
  return Promise.resolve(roadmapData);
}

// Render roadmap stages from JSON
function renderRoadmapStages() {
  const container = document.getElementById('stagesContainer');
  if (!container || !roadmapData || !roadmapData.stages || !Array.isArray(roadmapData.stages)) return;
  
  container.innerHTML = roadmapData.stages.map(stage => {
    const progress = stage.progress || 0;
    const statusClass = stage.status === 'locked' ? 'locked' : stage.status === 'unlocked' ? 'unlocked' : '';
    const milestones = stage.key_milestones || [];
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const totalCount = milestones.length;
    
    return `
      <div class="stage-card ${statusClass}" data-stage-id="${stage.stage_id}">
        <div class="stage-header">
          <div class="stage-icon">${stage.icon || '📋'}</div>
          <div class="stage-info">
            <h4>${stage.name}</h4>
            <p class="stage-theme">${stage.theme}</p>
            <p class="stage-description">${stage.description}</p>
          </div>
          <div class="stage-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}%</span>
          </div>
        </div>
        <div class="stage-milestones">
          <div class="milestones-header">
            <span>Milestones: ${completedCount}/${totalCount} completed</span>
            ${stage.status === 'locked' ? '<span class="locked-badge">🔒 Locked</span>' : ''}
          </div>
          <ul class="milestones-list">
            ${milestones.map(milestone => {
              const milestoneStatus = milestone.status || 'pending';
              const deadlineStr = milestone.deadline ? ` (Due: ${new Date(milestone.deadline).toLocaleDateString()})` : '';
              const deadlineClass = milestone.deadline_sensitive ? 'deadline-sensitive' : '';
              const dependencyClass = milestone.dependency_sensitive ? 'dependency-sensitive' : '';
              const questCategory = roadmapData.quest_categories && roadmapData.quest_categories[milestone.quest_category];
              
              return `
                <li class="milestone-item ${milestoneStatus} ${deadlineClass} ${dependencyClass}" data-milestone-id="${milestone.milestone_id}">
                  <div class="milestone-status">
                    ${milestoneStatus === 'completed' ? '✓' : milestoneStatus === 'in_progress' ? '⟳' : '○'}
                  </div>
                  <div class="milestone-content">
                    <div class="milestone-name">${milestone.name}${deadlineStr}</div>
                    <div class="milestone-description">${milestone.description}</div>
                    <div class="milestone-meta">
                      <span class="milestone-category">${milestone.category}</span>
                      ${questCategory ? `<span class="quest-category" data-category="${milestone.quest_category}">${questCategory.icon || ''} ${questCategory.name || milestone.quest_category}</span>` : ''}
                    </div>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers for milestones
  container.querySelectorAll('.milestone-item').forEach(item => {
    item.addEventListener('click', () => {
      const milestoneId = item.dataset.milestoneId;
      if (roadmapData && roadmapData.stages && Array.isArray(roadmapData.stages)) {
        const stage = roadmapData.stages.find(s => s.key_milestones && Array.isArray(s.key_milestones) && s.key_milestones.some(m => m.milestone_id === milestoneId));
        const milestone = stage?.key_milestones.find(m => m.milestone_id === milestoneId);
        if (milestone) {
          showMilestoneDetails(milestone);
        }
      }
    });
  });
}

function showMilestoneDetails(milestone) {
  const message = milestone.description;
  speak(message);
  updateDeerState('normal');
  const bubble = document.getElementById('deerBubble');
  const msg = document.getElementById('deerMessage');
  if (bubble && msg) {
    bubble.classList.remove('hidden');
    msg.textContent = message;
    setTimeout(() => bubble.classList.add('hidden'), 3000);
  }
}

// Application Sprite Easter Egg - trigger after 3 consecutive days
state.spriteCelebrated = state.spriteCelebrated || false;

function checkApplicationSpriteEasterEgg(){
  if (state.consecutiveDays >= 3 && !state.spriteCelebrated) {
    state.spriteCelebrated = true;
    triggerSpriteCelebration();
  }
}

function triggerSpriteCelebration(){
  const questMap = document.querySelector('.quest-map');
  if (!questMap) return;
  
  // Create sprite animation
  const sprite = document.createElement('div');
  sprite.className = 'application-sprite';
  sprite.textContent = '🎓';
  sprite.style.position = 'absolute';
  sprite.style.left = '50%';
  sprite.style.top = '50%';
  sprite.style.fontSize = '48px';
  sprite.style.zIndex = '1000';
  sprite.style.pointerEvents = 'none';
  sprite.style.animation = 'spriteCelebration 2s ease-out forwards';
  questMap.appendChild(sprite);
  
  // Play celebration sound
  playDingSound();
  
  // Remove after animation
  setTimeout(() => sprite.remove(), 2000);
  
  // Show message
  speak('Amazing! You\'ve been consistent for 3 days! Keep up the great work!');
  updateDeerState('celebrate');
}

// Modal handlers
document.getElementById('closeAchievementModal')?.addEventListener('click', () => {
  document.getElementById('achievementModal')?.classList.add('hidden');
});

document.getElementById('closeBreakModal')?.addEventListener('click', () => {
  document.getElementById('breakModal')?.classList.add('hidden');
  sessionStartTime = Date.now();
  breakModalShown = false;
});

// Initialize roadmap enhancements
function initRoadmapEnhancements(){
  renderAchievements();
  renderPlants();
  updateRiskDashboard();
  checkConsecutiveDays();
  updateQuestPath();
  
  // Render roadmap data (now using inlined data)
  if (roadmapData) {
    renderRoadmapStages();
    // Merge JSON achievements with state achievements
    if (roadmapData.achievements) {
      roadmapData.achievements.forEach(jsonAchievement => {
        const existing = state.achievements.find(a => a.id === jsonAchievement.achievement_id);
        if (!existing) {
          state.achievements.push({
            id: jsonAchievement.achievement_id,
            title: jsonAchievement.name,
            description: jsonAchievement.description,
            unlocked: jsonAchievement.unlocked || false,
            icon_locked: jsonAchievement.icon_locked || '🔒',
            icon_unlocked: jsonAchievement.icon_unlocked || '🎯'
          });
        }
      });
      renderAchievements();
    }
  }
  
  // Check session time every minute
  if (!window.roadmapInterval) {
    window.roadmapInterval = setInterval(checkSessionTime, 60000);
    window.riskInterval = setInterval(updateRiskDashboard, 30000);
  }
  
  // Add application sprite easter egg check
  checkApplicationSpriteEasterEgg();
}

// Override renderGoals to add achievement unlock
if (typeof renderGoals === 'function') {
  const originalRenderGoals = renderGoals;
  renderGoals = function(){
    originalRenderGoals();
    if (state.goals && state.goals.length === 1) {
      unlockAchievement('first_goal');
    }
  };
}

function boot(){
  setRoute('auth');
  renderGoals();
  regenRoadmap();
  speak('I am your AI Tutor. Please sign in to begin.');
}

async function bootAsync() {
  try {
    await loadSection('view-auth', 'view-auth-container');
  } catch (error) {
    console.error('Failed to preload auth section', error);
  }
  boot();
}

bootAsync();
