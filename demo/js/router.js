// Router module - handles route navigation and actions

// Route section mapping for dynamic loading
const routeSectionMap = {
  gap: { sectionId: 'view-gap', containerId: 'view-gap-container' },
  persona: { sectionId: 'view-persona', containerId: 'view-persona-container' },
  advisor: { sectionId: 'view-advisor', containerId: 'view-advisor-container' },
  roadmap: { sectionId: 'view-roadmap', containerId: 'view-roadmap-container' }
};

// Set route and update view visibility
function setRoute(route, force = false) {
  // Prevent unnecessary route changes, unless forced
  if (!force && state.route === route) return;
  
  state.route = route;
  const routeAuth = document.getElementById('route-auth');
  const routeOnboarding = document.getElementById('route-onboarding');
  const routeApp = document.getElementById('route-app');
  let profileNav = document.getElementById('profileNav');

  // Create route-app if it doesn't exist
  if (!routeApp && (route === 'profile' || route === 'persona' || route === 'gap' || route === 'advisor' || route === 'roadmap' || route === 'editor')) {
    const main = document.querySelector('main');
    if (main) {
      const newRouteApp = document.createElement('section');
      newRouteApp.id = 'route-app';
      newRouteApp.className = 'route-shell';
      main.appendChild(newRouteApp);
      routeApp = newRouteApp;
    }
  }

  // Hide all route shells first for smooth transition
  if (routeAuth) routeAuth.classList.add('hidden');
  if (routeOnboarding) routeOnboarding.classList.add('hidden');
  if (routeApp) routeApp.classList.add('hidden');

  // Show the appropriate route shell
  if (route === 'auth') {
    if (routeAuth) routeAuth.classList.remove('hidden');
  } else if (route === 'onboarding') {
    if (routeOnboarding) routeOnboarding.classList.remove('hidden');
  } else {
    // App routes: profile, persona, gap, advisor, roadmap, editor
    const isAppRoute = ['profile', 'persona', 'gap', 'advisor', 'roadmap', 'editor'].includes(route);
    if (isAppRoute && routeApp) {
      routeApp.classList.remove('hidden');
      
      // Ensure profileNav exists in route-app
      if (!profileNav && routeApp) {
        profileNav = document.createElement('div');
        profileNav.id = 'profileNav';
        profileNav.className = 'profile-nav hidden';
        
        const topTabs = document.createElement('div');
        topTabs.className = 'tabs top';
        topTabs.id = 'topTabs';
        
        const tabs = [
          { route: 'profile', label: 'Profile' },
          { route: 'persona', label: 'Persona' },
          { route: 'gap', label: 'GAP' },
          { route: 'advisor', label: 'Major Advisor' },
          { route: 'roadmap', label: 'Roadmap' }
        ];
        
        tabs.forEach((tab, index) => {
          const tabBtn = document.createElement('button');
          tabBtn.type = 'button';
          tabBtn.className = `tab small ${index === 0 ? 'active' : ''}`;
          tabBtn.setAttribute('data-tab-route', tab.route);
          tabBtn.textContent = tab.label;
          if (index === 0) {
            tabBtn.setAttribute('aria-selected', 'true');
          }
          topTabs.appendChild(tabBtn);
        });
        
        profileNav.appendChild(topTabs);
        routeApp.insertBefore(profileNav, routeApp.firstChild);
      }
    }
  }
  
  // Profile nav only shows after onboarding is complete
  const profileRoutes = ['profile', 'persona', 'gap', 'advisor', 'roadmap'];
  const shouldShowProfileNav = profileRoutes.includes(route) && 
    (state.onboardingComplete || 
     (state.profile.targetMajors && state.profile.targetMajors.length > 0) || 
     (state.profile.targetSchools && state.profile.targetSchools.length > 0));
  if (profileNav) {
    if (shouldShowProfileNav) {
      profileNav.classList.remove('hidden');
    } else {
      profileNav.classList.add('hidden');
    }
  }

  // Manage floating subtitle (onboarding route only)
  const inputArea = document.getElementById('inputArea');
  if (inputArea) {
    // Show inputArea only for onboarding route
    if (route === 'onboarding') {
      inputArea.classList.remove('hidden');
      inputArea.style.display = 'flex';
      if (typeof updateFloatingSubtitleState === 'function') {
        updateFloatingSubtitleState('idle');
      }
    } else {
      // Hide inputArea for all other routes
      inputArea.classList.add('hidden');
      inputArea.style.display = 'none';
    }
  }

  // Manage tutor footer (onboarding and app routes only, hidden in auth)
  const tutorAgent = document.getElementById('tutorAgent');
  if (tutorAgent) {
    const isAppRoute = ['profile', 'persona', 'gap', 'advisor', 'roadmap', 'editor'].includes(route);
    const shouldShowTutor = route === 'onboarding' || isAppRoute;
    if (shouldShowTutor) {
      tutorAgent.classList.remove('hidden');
    } else {
      tutorAgent.classList.add('hidden');
    }
  }

  // Ensure views object is updated before toggling active state
  if (typeof updateViews === 'function') {
    updateViews();
  }
  
  // Safely toggle active class for all views
  // Get fresh references to ensure we have the latest elements
  const allViews = {
    auth: document.getElementById('view-auth'),
    onboarding: document.getElementById('view-onboarding'),
    profile: document.getElementById('view-profile'),
    gap: document.getElementById('view-gap'),
    persona: document.getElementById('view-persona'),
    advisor: document.getElementById('view-advisor'),
    roadmap: document.getElementById('view-roadmap'),
    editor: document.getElementById('view-editor')
  };
  
  Object.entries(allViews).forEach(([key, el]) => {
    if (el) {
      el.classList.toggle('active', key === route);
    }
  });
  
  // Update tab active state
  const topTabs = document.getElementById('topTabs');
  if (topTabs) {
    const profileRoutes = ['profile', 'persona', 'gap', 'advisor', 'roadmap'];
    if (profileRoutes.includes(route)) {
      const allTabs = topTabs.querySelectorAll('.tab.small[data-tab-route]');
      allTabs.forEach((tab) => {
        const tabRoute = tab.getAttribute('data-tab-route');
        const isActive = tabRoute === route;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }
  
  // Ensure onboarding view is properly initialized when switching to it
  if (route === 'onboarding' && views.onboarding) {
    // Enable voice during onboarding
    if (typeof state !== 'undefined') {
      state.voiceEnabled = true;
    }
    
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      if (views.onboarding && views.onboarding.classList.contains('active')) {
        if (typeof goStep === 'function') {
        goStep(state.onboardingIndex || 0);
      }
        // Show floating subtitle when onboarding is active
        const inputArea = document.getElementById('inputArea');
        if (inputArea) {
          inputArea.classList.remove('hidden');
          inputArea.style.display = 'flex';
          if (typeof updateFloatingSubtitleState === 'function') {
            updateFloatingSubtitleState('idle');
          }
        }
      }
    });
  }
  
  // Execute route-specific actions
  executeRouteActions(route);
}

// Execute actions when route changes
function executeRouteActions(route) {
  // Track route change activity
  if (typeof RouterAgent !== 'undefined' && RouterAgent.trackActivity) {
    RouterAgent.trackActivity(RouterAgent.ActivityTypes.MODULE_VIEW, {
      module: route,
      previousRoute: state.route
    });
  }
  
  // Use requestAnimationFrame for smoother rendering
  requestAnimationFrame(() => {
    // Wait for DOM to be ready
  setTimeout(() => {
      if (route === 'gap') { 
        if (!state.gap && typeof generateGap === 'function') {
          state.gap = generateGap(); 
        }
      const gapCanvas = document.getElementById('gapChart');
        if (gapCanvas && typeof drawRadar === 'function') {
          drawRadar(gapCanvas, state.gap);
        }
        // Render profile summary in gap view
      const profileSummaryEl = document.getElementById('profileSummary');
      if (profileSummaryEl && typeof renderProfileSummary === 'function') {
        renderProfileSummary(profileSummaryEl);
      }
    }
      
      if (route === 'persona' && typeof renderPersona === 'function') { 
      renderPersona(); 
    }
      
      if (route === 'profile') {
        // Load profile section if not already loaded
        const profileContainer = document.getElementById('view-profile-container');
        const profileView = document.getElementById('view-profile');
        if (profileContainer && (!profileView || !profileView.innerHTML.trim())) {
          if (typeof loadSection === 'function') {
            loadSection('view-profile', 'view-profile-container').then(() => {
              // Ensure profile is rendered after loading
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
            });
          }
        } else {
          // Ensure profile is rendered when switching back
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
        }
      }
      
      if (route === 'advisor') {
        // Ensure majors are rendered
      const majorListEl = document.getElementById('majorList');
      if (majorListEl && typeof renderMajors === 'function') {
        renderMajors(majorListEl);
        }
        if (typeof updateSelectedLabels === 'function') {
          updateSelectedLabels();
          }
      }
      
      if (route === 'roadmap') {
        // Ensure roadmap is rendered
        if (typeof renderGoals === 'function') {
        renderGoals();
      }
      // Check if timeline elements exist before calling regenRoadmap
      const timelineNearEl = document.getElementById('timelineNear');
      const timelineMidEl = document.getElementById('timelineMid');
      const timelineFarEl = document.getElementById('timelineFar');
      if (timelineNearEl && timelineMidEl && timelineFarEl && typeof regenRoadmap === 'function') {
        regenRoadmap();
      }
      // Initialize roadmap enhancements
      if (typeof initRoadmapEnhancements === 'function') {
          initRoadmapEnhancements();
        }
      }
      
      if (route === 'editor') {
        // Editor view is already in DOM, just ensure it's rendered
        const editorBody = document.getElementById('editorBody');
        if (editorBody && typeof openEditor === 'function') {
          // Editor content will be set by openEditor when called
      }
    }
  }, 50); // Small delay to ensure view is rendered
  });
}

// Helper function to navigate to a route with section loading
async function navigateToRoute(route, options = {}) {
  const { 
    sectionId = null, 
    containerId = null, 
    scrollToTop = true,
    updateTab = true,
    skipIfSame = true
  } = options;

  // Skip if already on this route
  if (skipIfSame && state.route === route) return;

  // Update tab state if needed (after route is set to ensure views are updated)
  // This will be called after setRoute() to ensure proper state
  function updateTabState() {
    if (!updateTab) return;
    
    const topTabs = document.getElementById('topTabs');
    if (!topTabs) return;
    
    // Update active state for all tabs
    const allTabs = topTabs.querySelectorAll('.tab.small[data-tab-route]');
    allTabs.forEach((tab) => {
      const tabRoute = tab.getAttribute('data-tab-route');
      const isActive = tabRoute === route;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  // Load section if needed
  if (sectionId && containerId) {
    const container = document.getElementById(containerId);
    const viewElement = document.getElementById(sectionId);
    
    if (!viewElement || (container && !container.innerHTML.trim())) {
      try {
        const result = await loadSection(sectionId, containerId);
        if (!result?.success) {
          console.error(`Failed to load section ${sectionId}`);
        }
        // Update views object after loading section
        if (typeof updateViews === 'function') {
          updateViews();
        }
      } catch (error) {
        console.error(`Error loading section ${sectionId}:`, error);
      }
    } else {
      // Section already loaded, just update views
      if (typeof updateViews === 'function') {
        updateViews();
      }
    }
  }

  // Set route (this will trigger executeRouteActions)
  setRoute(route);
  
  // Update tab state after route is set
  updateTabState();

  // Scroll to top if needed
  if (scrollToTop) {
    requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_) {}
    });
  }
}

// Expose routeSectionMap globally
window.routeSectionMap = routeSectionMap;
window.navigateToRoute = navigateToRoute;
window.setRoute = setRoute;
