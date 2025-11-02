// Persona module - handles Persona view rendering

// Initialize persona selector tabs with enhanced interactions
function initPersonaSelector() {
  const selectorTabs = document.getElementById('personaSelectorTabs');
  if (!selectorTabs || !state.personas) return;
  
  selectorTabs.innerHTML = state.personas.map((persona, index) => `
    <button type="button" 
            class="persona-tab ${index === state.currentPersonaIndex ? 'active' : ''}" 
            data-persona-index="${index}"
            aria-label="Switch to ${persona.title}"
            tabindex="${index === state.currentPersonaIndex ? '0' : '-1'}">
      <span class="persona-tab-content">
        <span class="persona-tab-number">${index + 1}</span>
        <span class="persona-tab-text">${persona.title}</span>
      </span>
      <span class="persona-tab-indicator"></span>
    </button>
  `).join('');
  
  // Bind click events with animation
  selectorTabs.querySelectorAll('.persona-tab').forEach((tab, index) => {
    // Click handler
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(tab.dataset.personaIndex);
      if (idx !== state.currentPersonaIndex) {
        // Add click animation
        tab.classList.add('clicking');
        setTimeout(() => tab.classList.remove('clicking'), 300);
        
        // Switch persona with smooth transition
        switchPersonaWithAnimation(idx);
      }
    });
    
    // Mouse enter handler
    tab.addEventListener('mouseenter', () => {
      if (parseInt(tab.dataset.personaIndex) !== state.currentPersonaIndex) {
        tab.classList.add('hover');
      }
    });
    
    // Mouse leave handler
    tab.addEventListener('mouseleave', () => {
      tab.classList.remove('hover');
    });
    
    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      const tabs = Array.from(selectorTabs.querySelectorAll('.persona-tab'));
      const currentIndex = tabs.indexOf(tab);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        switchPersonaWithAnimation(parseInt(tabs[nextIndex].dataset.personaIndex));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        switchPersonaWithAnimation(parseInt(tabs[prevIndex].dataset.personaIndex));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = parseInt(tab.dataset.personaIndex);
        if (idx !== state.currentPersonaIndex) {
          switchPersonaWithAnimation(idx);
        }
      }
    });
  });
}

// Switch persona with smooth animation
function switchPersonaWithAnimation(index) {
  if (!state.personas || index < 0 || index >= state.personas.length) return;
  
  const view = document.getElementById('view-persona');
  if (view) {
    view.classList.add('switching');
  }
  
  // Update active tab with animation
  const tabs = document.querySelectorAll('.persona-tab');
  tabs.forEach((tab, i) => {
    if (i === index) {
      tab.classList.add('active');
      tab.classList.remove('hover');
      tab.setAttribute('tabindex', '0');
      tab.focus();
    } else {
      tab.classList.remove('active');
      tab.setAttribute('tabindex', '-1');
    }
  });
  
  // Small delay for visual feedback
  setTimeout(() => {
    state.currentPersonaIndex = index;
    state.persona = state.personas[index];
    
    // Re-render persona content
    renderPersona();
    
    // Remove switching class after render
    setTimeout(() => {
      if (view) {
        view.classList.remove('switching');
      }
    }, 100);
  }, 150);
}

// Switch to a different persona (backward compatibility)
function switchPersona(index) {
  switchPersonaWithAnimation(index);
}

function renderPersona(){
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
        ${h.description ? `<div class="highlight-desc">${h.description}</div>` : ''}
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
    const descriptions = [
      'Build core knowledge and explore interdisciplinary connections',
      'Apply learning through projects and real-world experiences',
      'Create meaningful impact and drive innovation in your field'
    ];
    
    timelineEl.innerHTML = state.persona.developmentPlan.map((plan, index) => {
      const isLast = index === state.persona.developmentPlan.length - 1;
      const desc = plan.description || descriptions[index] || '';
      return `
        <div class="timeline-stage">
          <div class="timeline-icon">${plan.icon}</div>
          <div class="timeline-content">
            <div class="timeline-badge">${plan.label}</div>
            ${desc ? `<div class="timeline-desc">${desc}</div>` : ''}
          </div>
        </div>
        ${!isLast ? '<div class="timeline-line"></div>' : ''}
      `;
    }).join('');
  }
  
  // Initialize selector if not already done
  if (state.personas && state.personas.length > 1) {
    initPersonaSelector();
  }
}

// Expose functions to global scope
window.renderPersona = renderPersona;
window.switchPersona = switchPersona;
window.initPersonaSelector = initPersonaSelector;
