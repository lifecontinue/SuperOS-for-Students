// Views - will be updated after sections are loaded
let views = {
  auth: document.getElementById('view-auth'),
  onboarding: document.getElementById('view-onboarding'), // Now inlined in index.html
  profile: document.getElementById('view-profile'),
  advisor: null, // Will be set after loading
  roadmap: null, // Will be set after loading
  editor: document.getElementById('view-editor'),
  gap: null, // Will be set after loading
  persona: null, // Will be set after loading
};

// Update views after sections are loaded
function updateViews() {
  views.auth = document.getElementById('view-auth');
  views.onboarding = document.getElementById('view-onboarding'); // Now inlined in index.html
  views.profile = document.getElementById('view-profile');
  views.gap = document.getElementById('view-gap');
  views.persona = document.getElementById('view-persona');
  views.advisor = document.getElementById('view-advisor');
  views.roadmap = document.getElementById('view-roadmap');
  
  // Also try to get timeline elements after roadmap is loaded
  if (views.roadmap && typeof getTimelineElements === 'function') {
    getTimelineElements();
  }
}

// Section HTML templates - inlined to avoid network requests
const sectionTemplates = {
  'view-auth': `<!-- Auth View -->
<section id="view-auth" class="view">
  <div class="card">
    <h2>Sign In / Sign Up</h2>
    <div class="tabs small" role="tablist">
      <button class="tab small active" data-auth="emailCode" data-auth-mode="signup">Sign Up · Email + Code</button>
      <button class="tab small" data-auth="emailPass" data-auth-mode="login">Sign In · Email + Password</button>
    </div>
    <div id="auth-emailCode" class="auth-pane active">
      <div class="form">
        <input id="emailCodeEmail" placeholder="Email" inputmode="email" />
        <div class="form inline">
          <input id="emailCodeInput" placeholder="Verification code (e.g. 123456)" />
          <button id="btnSendCode">Send code</button>
        </div>
        <button id="btnVerifyCode">Verify & Continue</button>
      </div>
    </div>
    <div id="auth-emailPass" class="auth-pane">
      <div class="form">
        <input id="emailPassEmail" placeholder="Email" inputmode="email" />
        <input id="emailPassPwd" placeholder="Password" type="password" />
        <button id="btnLoginPass">Sign In</button>
      </div>
    </div>
    <div class="divider">or</div>
    <div class="center-row">
      <button id="btnGoogle" class="btn-google" type="button">Continue with Google</button>
    </div>
    <div id="authStatus" class="muted"></div>
  </div>
</section>`,

  'view-gap': `<!-- GAP Analysis (separate view) -->
<section id="view-gap" class="view">
  <div class="card">
    <div class="row space">
      <h2>GAP Analysis</h2>
      <button id="btnBackProfileG">Back to Profile</button>
    </div>
    <canvas id="gapChart" width="340" height="260"></canvas>
    <div id="gapMeta" class="muted"></div>
    <h3>Summary</h3>
    <ul id="profileSummary" class="compact"></ul>
  </div>
</section>`,

  'view-persona': `<!-- Persona (separate view) -->
<section id="view-persona" class="view persona-view">
  <div class="persona-header">
    <h1 class="persona-title" id="personaTitle">Persona 1: Biomedical Aesthetic Engineer</h1>
    <button type="button" id="btnBackProfileP" class="persona-back-btn">Back to Profile</button>
  </div>

  <!-- Core Narrative Card -->
  <div class="persona-card persona-card-narrative">
    <h2 class="persona-card-title">Core Narrative</h2>
    <div class="persona-narrative-content" id="personaNarrative">
      <p>A future engineer who views biology as a medium for art, elegance, and identity.</p>
      <p class="highlight-text">The Beauty of Optional Future</p>
      <p>Ten years of dance experience is not just an extracurricular activity, but the primary way to explore human kinesiology, aesthetics, and potential.</p>
      <p class="persona-question">How can we design biological solutions, from cell regeneration to advanced prosthetics, that are both practical, elegant, and expressive?</p>
    </div>
  </div>

  <!-- Highlights Section -->
  <div class="persona-card persona-card-highlights">
    <h2 class="persona-card-title">Highlights</h2>
    <div class="highlights-carousel" id="highlightsCarousel">
      <div class="highlight-item highlight-active">
        <div class="highlight-icon">💃</div>
        <div class="highlight-label">Position Change Connection</div>
      </div>
      <div class="highlight-item">
        <div class="highlight-icon">⚙️</div>
        <div class="highlight-label">STEAM</div>
      </div>
      <div class="highlight-item">
        <div class="highlight-icon">💡</div>
        <div class="highlight-label">Creative Plus</div>
      </div>
    </div>
  </div>

  <!-- Alignment Points Section -->
  <div class="persona-card persona-card-alignment">
    <h2 class="persona-card-title">Anchor Points</h2>
    <div class="alignment-badges" id="alignmentBadges">
      <div class="alignment-badge">
        <span class="badge-icon">🧠</span>
        <span class="badge-text">Seed Placement</span>
      </div>
      <div class="alignment-badge">
        <span class="badge-icon">🌳</span>
        <span class="badge-text">Root Virtue Activities</span>
      </div>
      <div class="alignment-badge badge-empty">
        <span class="badge-icon">☆</span>
      </div>
      <div class="alignment-badge">
        <span class="badge-icon">💡</span>
        <span class="badge-text">◎ Still Concentration</span>
      </div>
      <div class="alignment-badge">
        <span class="badge-icon">★</span>
        <span class="badge-text">★ Mutual Innovation</span>
      </div>
    </div>
  </div>

  <!-- Development Plan Section -->
  <div class="persona-card persona-card-plan">
    <h2 class="persona-card-title">Sustainable Development Plan</h2>
    <div class="development-plan">
      <div class="plan-timeline">
        <div class="timeline-stage">
          <div class="timeline-icon">🧪</div>
          <div class="timeline-content">
            <div class="timeline-badge">Foundation: Research</div>
          </div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-stage">
          <div class="timeline-icon">⚙️</div>
          <div class="timeline-content">
            <div class="timeline-badge">Middle: Development</div>
          </div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-stage">
          <div class="timeline-icon">⬆️</div>
          <div class="timeline-content">
            <div class="timeline-badge">Long-term: Industry</div>
          </div>
        </div>
      </div>
      <div class="plan-actions">
        <button type="button" class="plan-action-btn plan-add-btn" id="btnAddPlan">
          <span class="action-icon">+</span>
        </button>
        <button type="button" class="plan-action-btn plan-share-btn" id="btnSharePlan">
          <span class="action-text">Share</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Generate Button -->
  <div class="persona-actions">
    <button type="button" id="btnGeneratePersona" class="persona-generate-btn">Generate/Refresh Persona</button>
  </div>
</section>`,

  'view-advisor': `<!-- Major Advisor & Compare -->
<section id="view-advisor" class="view">
  <div class="card">
    <div class="row space">
      <h2>Major Advisor</h2>
      <button type="button" id="btnBackProfileA">Back to Profile</button>
    </div>
    <p class="muted" style="margin-top: 8px; margin-bottom: 16px;">Select up to 2 majors to compare. Click on a major card to select it.</p>
    <div id="majorList" class="major-carousel"></div>
  </div>
  <div class="card">
    <h3>Compare Majors</h3>
    <div class="form">
      <div class="row" style="align-items:center; gap: 12px; flex-wrap: wrap;">
        <span class="badge-pill major-badge" id="selMajorA">—</span>
        <span style="color: var(--text-muted);">vs</span>
        <span class="badge-pill major-badge" id="selMajorB">—</span>
        <button id="btnCompare" class="chip">Compare</button>
      </div>
    </div>
    <div id="compareView" class="kv"></div>
    <table id="compareTable" class="table"></table>
    <div id="compareSummary" class="muted" style="margin-top:12px;"></div>
  </div>
</section>`,

  'view-roadmap': `<!-- Goals & Roadmap -->
<section id="view-roadmap" class="view">
  <!-- Achievement Panel (Top) -->
  <div class="card" id="achievementPanel">
    <h3>Achievements</h3>
    <div class="achievement-carousel" id="achievementCarousel">
      <!-- Achievements will be rendered here -->
    </div>
  </div>

  <!-- Roadmap Stages -->
  <div class="card" id="roadmapStages">
    <h3>Your Journey Stages</h3>
    <div class="stages-container" id="stagesContainer">
      <!-- Stages will be rendered here -->
    </div>
  </div>

  <!-- Goals Input -->
  <div class="card">
    <div class="row space">
      <h2>Goals & Roadmap</h2>
      <button type="button" id="btnBackProfileR">Back to Profile</button>
    </div>
    <ul id="goalList" class="list"></ul>
  </div>

  <!-- Achievement Garden -->
  <div class="card">
    <h3>Your Application Garden</h3>
    <div class="garden-container">
      <div class="garden-carousel" id="gardenCarousel">
        <!-- Plants will be rendered here -->
      </div>
    </div>
    <div class="garden-info" id="gardenInfo"></div>
  </div>

  <!-- Roadmap Neo -->
  <div class="card">
    <h3>Roadmap – Neo</h3>
    <div class="roadmap-neo">
      <section class="garden" aria-label="Achievement Garden">
        <div class="hex-grid">
          <div class="hex plant" data-name="MIT"></div>
          <div class="hex plant" data-name="Stanford"></div>
          <div class="hex plant" data-name="Harvard"></div>
          <div class="hex plant" data-name="CMU"></div>
          <div class="hex plant" data-name="Berkeley"></div>
          <div class="hex plant" data-name="Caltech"></div>
        </div>
      </section>

      <!-- Risk Dashboard (Enhanced) -->
      <button id="riskFab" class="risk-fab" aria-label="Risk radar">
        <span class="risk-indicator" id="riskIndicator">●</span>
      </button>
      <div id="riskPanel" class="risk-panel hidden">
        <div class="radar">
          <div class="dot near"></div>
          <div class="dot mid"></div>
          <div class="dot far"></div>
        </div>
        <div class="risk-content">
          <div class="microcopy" id="riskMessage">2 SAT seats left nearby</div>
          <ul class="risk-factors" id="riskFactors"></ul>
        </div>
      </div>

      <!-- Adventure Map -->
      <section class="quest-map" aria-label="Quest Map">
        <div class="scroll">
          <div class="landmark castle" data-category="tests">Tests</div>
          <div class="landmark mountain" data-category="recommenders">Rec-letter</div>
          <div class="landmark volcano" data-category="essays">Essays</div>
          <div class="landmark library" data-category="portfolio">Portfolio</div>
          <div class="landmark gate" data-category="applications">Applications</div>
          <div class="path glow" id="questPath"></div>
          <div class="avatar fox" title="Buddy Fox" id="questAvatar"></div>
        </div>
      </section>

      <!-- AI Assistant (Deer) -->
      <section class="buddy" aria-label="AI Buddy">
        <div class="deer" id="aiDeer">
          <div class="ear left"></div>
          <div class="ear right"></div>
          <div class="face"></div>
        </div>
        <div class="bubble hidden" id="deerBubble">
          <span id="deerMessage">Add AP Chem to impress MIT?</span>
          <button type="button" id="ctaDoIt" class="chip">Do it</button>
        </div>
      </section>

      <!-- Bottom Navigation -->
      <nav class="bottom-pill" aria-label="Bottom Navigation">
        <button class="nav-btn active" data-nav="garden">🏠</button>
        <button class="nav-btn" data-nav="map">🗺️</button>
        <button class="nav-btn" data-nav="achievements">📚</button>
        <button class="nav-btn" data-nav="profile">👤</button>
        <div class="swipe-hint"></div>
      </nav>
    </div>
  </div>

  <!-- Confetti Container -->
  <div id="confettiContainer" class="confetti-container hidden"></div>

  <!-- Break Modal -->
  <div id="breakModal" class="break-modal hidden">
    <div class="break-content">
      <h3>Time for a quick break!</h3>
      <p>You've been working for 30 minutes. Let's take a moment to relax.</p>
      <div class="bubble-wrap" id="bubbleWrap">
        <!-- Bubbles will be generated here -->
      </div>
      <button type="button" id="closeBreakModal" class="chip">Continue</button>
    </div>
  </div>

  <!-- Achievement Modal -->
  <div id="achievementModal" class="achievement-modal hidden">
    <div class="achievement-modal-content">
      <div class="achievement-icon-large" id="modalAchievementIcon"></div>
      <h3 id="modalAchievementTitle"></h3>
      <p id="modalAchievementDesc"></p>
      <button type="button" id="closeAchievementModal" class="chip">Got it!</button>
    </div>
  </div>
</section>`
};

// Optional external HTML sources (preferred when available)
const sectionSources = {
  'view-auth': 'sections/view-auth.html',
  'view-profile': 'sections/view-profile.html',
  'view-gap': 'sections/view-gap.html',
  'view-persona': 'sections/view-persona.html',
  'view-advisor': 'sections/view-advisor.html',
  'view-roadmap': 'sections/view-roadmap.html'
};

async function getSectionTemplate(sectionId) {
  const sourcePath = sectionSources[sectionId];

  // Skip fetch for file:// protocol to avoid CORS errors
  // Always use inline templates when using file:// protocol
  if (window.location.protocol === 'file:') {
    return sectionTemplates[sectionId] || null;
  }

  // Try to load from external file (works for http/https protocols)
  if (sourcePath && typeof fetch === 'function') {
    try {
      const response = await fetch(sourcePath, { cache: 'no-store' });
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 0) {
          // For view-profile.html, extract the section content from the full HTML file
          if (sectionId === 'view-profile') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const section = doc.getElementById('view-profile');
            if (section) {
              return section.outerHTML;
            }
            // Fallback: try to extract section content manually
            const sectionMatch = html.match(/<section\s+id="view-profile"[^>]*>[\s\S]*?<\/section>/i);
            if (sectionMatch) {
              return sectionMatch[0];
            }
          }
          return html;
        }
      } else {
        console.warn(`Section fetch failed for ${sectionId}: ${response.status}`);
      }
    } catch (error) {
      // Only warn if not a CORS/network error (file:// protocol)
      if (window.location.protocol !== 'file:' || !error.message.includes('fetch')) {
        console.warn(`Section fetch error for ${sectionId}:`, error);
      }
    }
  }

  // Fallback to inline template
  return sectionTemplates[sectionId] || null;
}

// Section loading cache to prevent duplicate loads
const sectionCache = new Map();

// Load section - now uses inlined templates instead of network requests
async function loadSection(sectionId, containerId, options = {}) {
  const { forceReload = false } = options;
  
  // Check cache first (unless force reload)
  if (!forceReload && sectionCache.has(sectionId)) {
    const cachedHtml = sectionCache.get(sectionId);
    const container = document.getElementById(containerId);
    if (container && cachedHtml) {
      container.innerHTML = cachedHtml;
      updateViews();
      return { success: true, cached: true };
    }
  }
  
  try {
    // Wait for container to exist (with timeout)
    const container = await waitForElement(containerId, 1000);
    if (!container) {
      throw new Error(`Container ${containerId} not found after timeout`);
    }
    
    // Get HTML from external source or fallback template
    const html = await getSectionTemplate(sectionId);
    if (!html) {
      throw new Error(`No template available for ${sectionId}`);
    }
    
    if (!html || html.trim().length === 0) {
      throw new Error('Empty HTML template');
    }
    
    // Update DOM
    container.innerHTML = html;
    
    // Verify the content was inserted
    if (!container.innerHTML.trim()) {
      throw new Error('Failed to insert HTML into container');
    }
    
    const viewElement = document.getElementById(sectionId);
    if (viewElement) {
      const currentRoute = (window.state && window.state.route) || 'auth';
      const routeName = sectionId.startsWith('view-') ? sectionId.slice(5) : sectionId;
      if (routeName === currentRoute) {
        viewElement.classList.add('active');
        viewElement.style.display = '';
      }
      if (sectionId === 'view-auth' && typeof window.bindAuthUI === 'function') {
        window.bindAuthUI();
      }
    }
    
    // Cache the HTML
    sectionCache.set(sectionId, html);
    
    // Update views after DOM is updated
    setTimeout(() => {
      updateViews();
      if (sectionId === 'view-auth' && typeof window.bindAuthUI === 'function') {
        window.bindAuthUI();
      }
    }, 0);
    
    // Log success (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`✓ Successfully loaded section: ${sectionId}`);
    }
    
    return { success: true, cached: false };
    
  } catch (error) {
    console.error(`Failed to load section ${sectionId}:`, error);
    return { success: false, error };
  }
}

// Helper: Wait for element to exist in DOM
function waitForElement(elementId, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.getElementById(elementId);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Load all sections on page load
async function loadAllSections() {
  const prioritySections = [
    { id: 'view-auth', container: 'view-auth-container' }
  ];

  let prioritySuccess = 0;
  for (const section of prioritySections) {
    try {
      const result = await loadSection(section.id, section.container);
      if (result?.success) prioritySuccess += 1;
    } catch (error) {
      console.error(`Failed to load ${section.id}:`, error);
    }
  }

  const secondarySections = [
    { id: 'view-gap', container: 'view-gap-container' },
    { id: 'view-persona', container: 'view-persona-container' },
    { id: 'view-advisor', container: 'view-advisor-container' },
    { id: 'view-roadmap', container: 'view-roadmap-container' }
  ];

  const loadPromises = secondarySections.map(section =>
    loadSection(section.id, section.container).catch(err => {
      console.error(`Failed to load ${section.id}:`, err);
      return { success: false, error: err };
    })
  );

  const results = await Promise.allSettled(loadPromises);
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
  const totalLoaded = prioritySuccess + successCount;
  const totalSections = prioritySections.length + secondarySections.length;
  console.log(`Loaded ${totalLoaded}/${totalSections} sections successfully`);
}

// Initialize sections when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllSections);
} else {
  // DOM already loaded
  loadAllSections();
}

