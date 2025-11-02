// Router Agent Module - Intelligent routing and navigation decision system
// Handles status reporting, state collection, routing decisions, and dashboard content

// Initialize router agent state
if (!state.routerAgent) {
  state.routerAgent = {
    lastCheckIn: null,
    lastCheckInDate: null,
    activityHistory: [], // Track user activities
    moduleAccessCounts: {}, // Track module access frequency
    gpaHistory: [], // Track GPA trends
    dailyRecommendations: [],
    location: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

// Activity types for tracking
const ActivityTypes = {
  LOGIN: 'login',
  MODULE_VIEW: 'module_view',
  PROFILE_UPDATE: 'profile_update',
  GPA_UPDATE: 'gpa_update',
  ROADMAP_VIEW: 'roadmap_view',
  COMPETITION_VIEW: 'competition_view',
  ESSAY_WORK: 'essay_work',
  APPLICATION_SUBMIT: 'application_submit'
};

/**
 * Collect current student state
 * @returns {Object} Student state snapshot
 */
function collectStudentState() {
  const now = new Date();
  const today = now.toDateString();
  
  return {
    // Authentication state
    isLoggedIn: !!state.session,
    lastLogin: state.session?.lastLogin || null,
    
    // Profile information
    profile: {
      name: state.profile.name || '',
      email: state.profile.email || '',
      hasTargetMajors: !!(state.profile.targetMajors && state.profile.targetMajors.length > 0),
      hasTargetSchools: !!(state.profile.targetSchools && state.profile.targetSchools.length > 0),
      gpa: parseFloat(state.profileSections?.find(s => s.key === 'School')?.params?.find(p => p[0] === 'GPA')?.[1]) || null
    },
    
    // Onboarding status
    onboardingComplete: state.onboardingComplete || false,
    onboardingIndex: state.onboardingIndex || 0,
    
    // Activity tracking
    lastActivity: state.routerAgent.activityHistory[state.routerAgent.activityHistory.length - 1] || null,
    lastActivityDate: state.lastActivityDate || today,
    consecutiveDays: state.consecutiveDays || 0,
    
    // Module access patterns
    moduleAccessCounts: { ...state.routerAgent.moduleAccessCounts },
    recentModuleViews: state.routerAgent.activityHistory
      .filter(a => a.type === ActivityTypes.MODULE_VIEW)
      .slice(-10)
      .map(a => a.module),
    
    // Time and location
    currentTime: now,
    currentDate: today,
    timezone: state.routerAgent.timezone,
    location: state.routerAgent.location,
    
    // Academic status
    gpaHistory: [...state.routerAgent.gpaHistory],
    hasDecliningGPA: detectGpaTrend(state.routerAgent.gpaHistory) === 'declining',
    
    // Quest progress
    questProgress: { ...state.questProgress },
    
    // Profile completeness
    profileCompleteness: calculateProfileCompleteness()
  };
}

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness() {
  const sections = state.profileSections || [];
  let completed = 0;
  let total = sections.length;
  
  sections.forEach(section => {
    const hasParams = section.params && section.params.length > 0;
    const hasValues = section.params?.some(p => p[1] && p[1] !== '—' && p[1] !== '');
    if (hasParams && hasValues) completed++;
  });
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Detect GPA trend from history
 * @param {Array} gpaHistory - Array of {date, gpa} objects
 * @returns {string} 'improving' | 'declining' | 'stable' | 'unknown'
 */
function detectGpaTrend(gpaHistory) {
  if (!gpaHistory || gpaHistory.length < 2) return 'unknown';
  
  const recent = gpaHistory.slice(-3); // Last 3 entries
  if (recent.length < 2) return 'unknown';
  
  const first = recent[0].gpa;
  const last = recent[recent.length - 1].gpa;
  const diff = last - first;
  
  if (diff > 0.1) return 'improving';
  if (diff < -0.1) return 'declining';
  return 'stable';
}

/**
 * Hard rules for routing decisions (highest priority)
 * @param {Object} studentState - Current student state
 * @returns {Object|null} Routing decision or null
 */
function applyHardRules(studentState) {
  // Rule 1: Incomplete onboarding -> redirect to onboarding
  if (!studentState.onboardingComplete) {
    const hasMinimalInfo = studentState.profile.name && 
                          (studentState.profile.hasTargetMajors || studentState.profile.hasTargetSchools);
    
    if (!hasMinimalInfo) {
      return {
        type: 'redirect',
        route: 'onboarding',
        priority: 'high',
        reason: 'onboarding_incomplete',
        message: 'Please complete your onboarding to continue.',
        skipStatusReport: true
      };
    }
  }
  
  // Rule 2: No profile info -> redirect to profile
  if (studentState.profileCompleteness < 20) {
    return {
      type: 'redirect',
      route: 'profile',
      priority: 'high',
      reason: 'profile_incomplete',
      message: 'Your profile needs completion. Let\'s fill it out!',
      skipStatusReport: true
    };
  }
  
  return null;
}

/**
 * Strategy scoring for module recommendations
 * @param {Object} studentState - Current student state
 * @returns {Array} Scored recommendations
 */
function calculateStrategyScores(studentState) {
  const recommendations = [];
  
  // Score 1: GPA Management (if GPA is declining)
  if (studentState.hasDecliningGPA) {
    recommendations.push({
      module: 'gap',
      score: 90,
      reason: 'gpa_declining',
      message: 'Your GPA has been declining recently. Let\'s review your GAP analysis.',
      action: 'navigate',
      route: 'gap'
    });
  }
  
  // Score 2: Profile completeness
  if (studentState.profileCompleteness < 70) {
    recommendations.push({
      module: 'profile',
      score: 85 - studentState.profileCompleteness,
      reason: 'profile_incomplete',
      message: `Your profile is ${studentState.profileCompleteness}% complete. Let's finish it!`,
      action: 'navigate',
      route: 'profile'
    });
  }
  
  // Score 3: Roadmap planning (if no goals set)
  if (!state.goals || state.goals.length === 0) {
    recommendations.push({
      module: 'roadmap',
      score: 80,
      reason: 'no_goals',
      message: 'You haven\'t set any goals yet. Let\'s plan your roadmap!',
      action: 'navigate',
      route: 'roadmap'
    });
  }
  
  // Score 4: Application deadlines approaching
  const applicationsSection = state.profileSections?.find(s => s.key === 'Applications');
  const nextDeadline = applicationsSection?.meta;
  if (nextDeadline && nextDeadline !== '—') {
    const daysUntilDeadline = calculateDaysUntilDeadline(nextDeadline);
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
      recommendations.push({
        module: 'profile',
        score: 75 + (30 - daysUntilDeadline),
        reason: 'upcoming_deadline',
        message: `Application deadline in ${daysUntilDeadline} days!`,
        action: 'navigate',
        route: 'profile',
        highlightSection: 'Applications'
      });
    }
  }
  
  // Score 5: Incomplete essays
  const essaysSection = state.profileSections?.find(s => s.key === 'Essays');
  if (essaysSection?.meta === 'draft') {
    recommendations.push({
      module: 'profile',
      score: 70,
      reason: 'essay_draft',
      message: 'You have essay drafts that need completion.',
      action: 'navigate',
      route: 'profile',
      highlightSection: 'Essays'
    });
  }
  
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Calculate days until deadline
 */
function calculateDaysUntilDeadline(deadlineStr) {
  try {
    // Parse MM/DD format
    const [month, day] = deadlineStr.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const deadline = new Date(currentYear, month - 1, day);
    
    // If deadline passed this year, use next year
    if (deadline < now) {
      deadline.setFullYear(currentYear + 1);
    }
    
    const diffTime = deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return -1;
  }
}

/**
 * Lightweight agent intent recognition
 * @param {Object} studentState - Current student state
 * @returns {Array} Intent-based recommendations
 */
function recognizeIntent(studentState) {
  const recommendations = [];
  
  // Intent 1: Frequent competition views -> recommend competition module
  const competitionViews = studentState.recentModuleViews.filter(m => 
    m === 'competition' || m === 'competitions' || m?.includes('competition')
  ).length;
  
  if (competitionViews >= 3) {
    recommendations.push({
      module: 'competitions',
      score: 65,
      reason: 'frequent_competition_interest',
      message: 'You\'ve been checking out competitions frequently. Here are some recommendations!',
      action: 'dashboard_content',
      contentType: 'competition_recommendations'
    });
  }
  
  // Intent 2: Frequent roadmap views -> suggest roadmap updates
  const roadmapViews = studentState.moduleAccessCounts.roadmap || 0;
  if (roadmapViews >= 5 && roadmapViews % 3 === 0) {
    recommendations.push({
      module: 'roadmap',
      score: 60,
      reason: 'frequent_roadmap_checks',
      message: 'You check your roadmap often. Want to update it?',
      action: 'navigate',
      route: 'roadmap'
    });
  }
  
  // Intent 3: Profile updates -> suggest advisor for major selection
  const profileUpdates = studentState.moduleAccessCounts.profile || 0;
  if (profileUpdates >= 3 && !studentState.profile.hasTargetMajors) {
    recommendations.push({
      module: 'advisor',
      score: 55,
      reason: 'needs_major_guidance',
      message: 'You\'ve been updating your profile. Let\'s explore majors!',
      action: 'navigate',
      route: 'advisor'
    });
  }
  
  return recommendations;
}

/**
 * Main routing decision function
 * @param {Object} options - Options for routing decision
 * @returns {Object} Routing decision
 */
function makeRoutingDecision(options = {}) {
  const { skipStatusReport = false, forceStatusReport = false } = options;
  
  // Collect current state
  const studentState = collectStudentState();
  
  // Check if new day started
  const isNewDay = studentState.currentDate !== studentState.lastActivityDate;
  const shouldShowStatusReport = forceStatusReport || 
                                 (isNewDay && !skipStatusReport) || 
                                 (!state.routerAgent.lastCheckIn);
  
  // Apply hard rules first (highest priority)
  const hardRuleDecision = applyHardRules(studentState);
  if (hardRuleDecision) {
    return {
      ...hardRuleDecision,
      shouldShowStatusReport: shouldShowStatusReport && !hardRuleDecision.skipStatusReport,
      studentState
    };
  }
  
  // Calculate strategy scores
  const strategyRecommendations = calculateStrategyScores(studentState);
  
  // Recognize user intent
  const intentRecommendations = recognizeIntent(studentState);
  
  // Combine all recommendations
  const allRecommendations = [
    ...strategyRecommendations,
    ...intentRecommendations
  ];
  
  // Get top recommendation
  const topRecommendation = allRecommendations.length > 0 ? allRecommendations[0] : null;
  
  // Generate dashboard content
  const dashboardContent = generateDashboardContent(studentState, allRecommendations);
  
  return {
    type: 'dashboard',
    route: 'profile', // Default to profile dashboard
    priority: 'normal',
    shouldShowStatusReport,
    studentState,
    recommendations: allRecommendations,
    topRecommendation,
    dashboardContent,
    isNewDay
  };
}

/**
 * Generate dashboard content items
 */
function generateDashboardContent(studentState, recommendations) {
  const content = [];
  
  // Daily check-in (if new day)
  if (studentState.currentDate !== studentState.lastActivityDate) {
    content.push({
      type: 'daily_checkin',
      priority: 'high',
      title: 'Daily Check-in',
      message: `Welcome back, ${studentState.profile.name || 'Student'}! How are you feeling today?`,
      actions: [
        { label: 'Great!', value: 'great' },
        { label: 'Okay', value: 'okay' },
        { label: 'Could be better', value: 'not_great' }
      ]
    });
  }
  
  // Latest news/updates
  content.push({
    type: 'news',
    priority: 'medium',
    title: 'Latest Updates',
    items: [
      'New competition opportunities available',
      'Application deadlines approaching',
      'Your roadmap has been updated'
    ]
  });
  
  // Todo tasks
  const todos = generateTodoTasks(studentState);
  if (todos.length > 0) {
    content.push({
      type: 'todos',
      priority: 'high',
      title: 'Your Tasks',
      items: todos
    });
  }
  
  // Student cases (if relevant)
  if (recommendations.some(r => r.reason === 'frequent_competition_interest')) {
    content.push({
      type: 'student_cases',
      priority: 'low',
      title: 'Success Stories',
      items: [
        { name: 'Alex', story: 'Won National Math Competition → Accepted to MIT' },
        { name: 'Sarah', story: 'Led Science Olympiad → Full Scholarship' }
      ]
    });
  }
  
  // Top recommendation as card
  if (recommendations.length > 0) {
    content.push({
      type: 'recommendation_card',
      priority: 'high',
      recommendation: recommendations[0]
    });
  }
  
  return content.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Generate todo tasks from student state
 */
function generateTodoTasks(studentState) {
  const tasks = [];
  
  // Profile completion
  if (studentState.profileCompleteness < 100) {
    tasks.push({
      id: 'complete_profile',
      text: `Complete your profile (${studentState.profileCompleteness}% done)`,
      route: 'profile',
      priority: 'high'
    });
  }
  
  // Essay drafts
  const essaysSection = state.profileSections?.find(s => s.key === 'Essays');
  if (essaysSection?.meta === 'draft') {
    tasks.push({
      id: 'complete_essays',
      text: 'Complete your essay drafts',
      route: 'profile',
      section: 'Essays',
      priority: 'high'
    });
  }
  
  // Recommenders
  const recommendersSection = state.profileSections?.find(s => s.key === 'Recommenders');
  const teacherCount = parseInt(recommendersSection?.params?.find(p => p[0] === 'Teachers')?.[1]) || 0;
  if (teacherCount < 2) {
    tasks.push({
      id: 'find_recommenders',
      text: `Find ${2 - teacherCount} more recommenders`,
      route: 'profile',
      section: 'Recommenders',
      priority: 'medium'
    });
  }
  
  // Application deadlines
  const applicationsSection = state.profileSections?.find(s => s.key === 'Applications');
  const nextDeadline = applicationsSection?.meta;
  if (nextDeadline && nextDeadline !== '—') {
    const daysUntil = calculateDaysUntilDeadline(nextDeadline);
    if (daysUntil > 0 && daysUntil <= 30) {
      tasks.push({
        id: 'upcoming_deadline',
        text: `Application deadline in ${daysUntil} days`,
        route: 'profile',
        section: 'Applications',
        priority: 'high',
        urgent: daysUntil <= 7
      });
    }
  }
  
  return tasks;
}

/**
 * Track user activity
 */
function trackActivity(type, data = {}) {
  if (!state.routerAgent.activityHistory) {
    state.routerAgent.activityHistory = [];
  }
  
  state.routerAgent.activityHistory.push({
    type,
    timestamp: new Date(),
    ...data
  });
  
  // Keep only last 100 activities
  if (state.routerAgent.activityHistory.length > 100) {
    state.routerAgent.activityHistory = state.routerAgent.activityHistory.slice(-100);
  }
  
  // Update module access counts
  if (type === ActivityTypes.MODULE_VIEW && data.module) {
    state.routerAgent.moduleAccessCounts[data.module] = 
      (state.routerAgent.moduleAccessCounts[data.module] || 0) + 1;
  }
  
  // Update GPA history
  if (type === ActivityTypes.GPA_UPDATE && data.gpa) {
    state.routerAgent.gpaHistory.push({
      date: new Date().toDateString(),
      gpa: data.gpa
    });
    
    // Keep only last 10 GPA entries
    if (state.routerAgent.gpaHistory.length > 10) {
      state.routerAgent.gpaHistory = state.routerAgent.gpaHistory.slice(-10);
    }
  }
  
  // Update last activity date
  const today = new Date().toDateString();
  if (state.lastActivityDate !== today) {
    if (state.lastActivityDate && new Date(state.lastActivityDate).getTime() === 
        new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000).getTime()) {
      state.consecutiveDays = (state.consecutiveDays || 0) + 1;
    } else {
      state.consecutiveDays = 1;
    }
    state.lastActivityDate = today;
  }
}

/**
 * Request geolocation (with user permission)
 */
function requestLocation() {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.routerAgent.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date()
        };
        resolve(state.routerAgent.location);
      },
      (error) => {
        console.warn('Location access denied or failed:', error);
        resolve(null);
      },
      { timeout: 5000, maximumAge: 600000 } // 5s timeout, 10min cache
    );
  });
}

/**
 * Initialize Router Agent
 */
function initRouterAgent() {
  // Check if location is enabled in settings and request it
  // (For now, we'll check but not force)
  
  // Track login activity if session exists
  if (state.session) {
    trackActivity(ActivityTypes.LOGIN, {
      lastLogin: state.session.lastLogin || new Date()
    });
    
    // Check daily status after login
    setTimeout(() => {
      checkDailyStatus();
    }, 500);
  }
  
  // Also check on visibility change (when user returns to app)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.session) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        checkDailyStatus();
      }, 300);
    }
  });
  
  // Check at midnight for new day (approximate)
  const now = new Date();
  const msUntilMidnight = (24 * 60 * 60 * 1000) - (now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000);
  setTimeout(() => {
    // Check every hour after midnight
    setInterval(() => {
      if (state.session && !document.hidden) {
        checkDailyStatus();
      }
    }, 60 * 60 * 1000);
  }, msUntilMidnight);
}

/**
 * Check daily status and show status report if needed
 */
function checkDailyStatus() {
  // Don't show status report during onboarding or auth
  if (state.route === 'auth' || state.route === 'onboarding') {
    return;
  }
  
  // Don't check if user is not logged in
  if (!state.session) {
    return;
  }
  
  const decision = makeRoutingDecision();
  
  if (decision.shouldShowStatusReport && typeof showStatusReport === 'function') {
    showStatusReport(decision);
  } else if (decision.type === 'redirect') {
    // Apply redirect immediately (unless during onboarding)
    if (typeof setRoute === 'function' && state.route !== 'onboarding') {
      setRoute(decision.route);
    }
  } else if (decision.type === 'dashboard') {
    // Show dashboard with content (only if not in auth/onboarding)
    if (state.route !== 'auth' && state.route !== 'onboarding') {
      if (typeof setRoute === 'function') {
        setRoute(decision.route || 'profile');
      }
      
      // Render dashboard content
      if (typeof renderDashboardContent === 'function') {
        renderDashboardContent(decision.dashboardContent);
      }
    }
  }
}

// Expose functions globally
window.RouterAgent = {
  collectStudentState,
  makeRoutingDecision,
  trackActivity,
  requestLocation,
  initRouterAgent,
  checkDailyStatus,
  ActivityTypes
};

/**
 * Show status report window
 */
function showStatusReport(decision) {
  const statusReportEl = document.getElementById('routerStatusReport');
  if (!statusReportEl) return;
  
  const studentState = decision.studentState || collectStudentState();
  
  // Update title
  const titleEl = document.getElementById('statusReportTitle');
  if (titleEl) {
    if (decision.isNewDay) {
      titleEl.textContent = `Good ${getTimeOfDay()}, ${studentState.profile.name || 'Student'}!`;
    } else {
      titleEl.textContent = 'Status Check';
    }
  }
  
  // Update current status
  const currentStatusEl = document.getElementById('statusReportCurrentStatus');
  if (currentStatusEl) {
    currentStatusEl.innerHTML = `
      <div class="info-item">
        <span class="info-label">Profile:</span>
        <span class="info-value">${studentState.profileCompleteness}% complete</span>
      </div>
      <div class="info-item">
        <span class="info-label">Consecutive Days:</span>
        <span class="info-value">${studentState.consecutiveDays}</span>
      </div>
      <div class="info-item">
        <span class="info-label">GPA:</span>
        <span class="info-value">${studentState.profile.gpa || 'Not set'}</span>
      </div>
    `;
  }
  
  // Update time
  const timeEl = document.getElementById('statusReportTime');
  if (timeEl) {
    timeEl.textContent = studentState.currentTime.toLocaleTimeString();
  }
  
  // Update location
  const locationEl = document.getElementById('statusReportLocation');
  if (locationEl) {
    if (studentState.location) {
      locationEl.textContent = 'Detected';
    } else {
      RouterAgent.requestLocation().then(loc => {
        if (loc) {
          locationEl.textContent = 'Detected';
        } else {
          locationEl.textContent = 'Not available';
        }
      });
    }
  }
  
  // Update last activity
  const lastActivityEl = document.getElementById('statusReportLastActivity');
  if (lastActivityEl) {
    if (studentState.lastActivity) {
      const activityDate = new Date(studentState.lastActivity.timestamp);
      const timeDiff = studentState.currentTime - activityDate;
      const minutesAgo = Math.floor(timeDiff / 60000);
      
      if (minutesAgo < 60) {
        lastActivityEl.textContent = `${minutesAgo} minutes ago`;
      } else {
        lastActivityEl.textContent = activityDate.toLocaleDateString();
      }
    } else {
      lastActivityEl.textContent = 'First time';
    }
  }
  
  // Bind event handlers
  bindStatusReportEvents(decision);
  
  // Show modal
  statusReportEl.classList.remove('hidden');
  
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate([10]);
}

/**
 * Get time of day greeting
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

/**
 * Bind status report event handlers
 */
function bindStatusReportEvents(decision) {
  // Close button
  const closeBtn = document.getElementById('statusReportClose');
  if (closeBtn) {
    closeBtn.onclick = () => hideStatusReport(decision);
  }
  
  // Overlay click
  const overlay = document.querySelector('.status-report-overlay');
  if (overlay) {
    overlay.onclick = () => hideStatusReport(decision);
  }
  
  // Status option buttons
  const statusOptions = document.querySelectorAll('.status-option-btn');
  statusOptions.forEach(btn => {
    btn.onclick = () => {
      const status = btn.getAttribute('data-status');
      handleStatusSelection(status, decision);
    };
  });
  
  // Submit button
  const submitBtn = document.getElementById('statusReportSubmit');
  if (submitBtn) {
    submitBtn.onclick = () => {
      const textInput = document.getElementById('statusReportTextInput');
      const status = textInput?.value.trim() || 'submitted';
      handleStatusSelection(status, decision);
    };
  }
  
  // Skip button
  const skipBtn = document.getElementById('statusReportSkip');
  if (skipBtn) {
    skipBtn.onclick = () => hideStatusReport(decision);
  }
  
  // Voice input button
  const voiceBtn = document.getElementById('statusReportVoiceBtn');
  if (voiceBtn && typeof startVoiceInput === 'function') {
    voiceBtn.onclick = () => {
      const textInput = document.getElementById('statusReportTextInput');
      startVoiceInput((text) => {
        if (textInput) textInput.value = text;
      });
    };
  }
}

/**
 * Handle status selection
 */
function handleStatusSelection(status, decision) {
  // Save status
  state.routerAgent.lastCheckIn = {
    status,
    timestamp: new Date(),
    date: new Date().toDateString()
  };
  state.routerAgent.lastCheckInDate = new Date().toDateString();
  
  // Track activity
  trackActivity(ActivityTypes.LOGIN, { status });
  
  // Hide status report
  hideStatusReport(decision);
  
  // Apply routing decision
  applyRoutingDecision(decision);
}

/**
 * Hide status report
 */
function hideStatusReport(decision) {
  const statusReportEl = document.getElementById('routerStatusReport');
  if (statusReportEl) {
    statusReportEl.classList.add('hidden');
  }
  
  // Apply routing decision if not already applied
  if (decision) {
    applyRoutingDecision(decision);
  }
}

/**
 * Apply routing decision
 */
function applyRoutingDecision(decision) {
  if (!decision) return;
  
  if (decision.type === 'redirect') {
    // Hard rule redirect
    if (typeof setRoute === 'function') {
      setRoute(decision.route);
    }
  } else if (decision.type === 'dashboard') {
    // Show dashboard with content
    if (typeof setRoute === 'function') {
      setRoute(decision.route || 'profile');
    }
    
    // Render dashboard content
    renderDashboardContent(decision.dashboardContent);
  }
}

/**
 * Render dashboard content
 */
function renderDashboardContent(contentArray) {
  if (!contentArray || contentArray.length === 0) return;
  
  const dashboardEl = document.getElementById('dashboardContent');
  if (!dashboardEl) return;
  
  // Show dashboard container
  dashboardEl.classList.remove('hidden');
  
  // Render each content item
  contentArray.forEach((content, index) => {
    switch (content.type) {
      case 'daily_checkin':
        renderDailyCheckin(content);
        break;
      case 'news':
        renderNews(content);
        break;
      case 'todos':
        renderTodos(content);
        break;
      case 'student_cases':
        renderStudentCases(content);
        break;
      case 'recommendation_card':
        renderRecommendation(content);
        break;
    }
  });
  
  // Insert dashboard content at the top of route-app
  const routeApp = document.getElementById('route-app');
  if (routeApp && dashboardEl.parentNode !== routeApp) {
    routeApp.insertBefore(dashboardEl, routeApp.firstChild);
  }
}

/**
 * Render daily check-in card
 */
function renderDailyCheckin(content) {
  const card = document.getElementById('dashboardDailyCheckin');
  if (!card) return;
  
  const messageEl = document.getElementById('dailyCheckinMessage');
  if (messageEl) {
    messageEl.textContent = content.message || 'How are you feeling today?';
  }
  
  // Bind check-in buttons
  const actionBtns = card.querySelectorAll('.dashboard-action-btn');
  actionBtns.forEach(btn => {
    btn.onclick = () => {
      const status = btn.getAttribute('data-checkin');
      state.routerAgent.lastCheckIn = {
        status,
        timestamp: new Date(),
        date: new Date().toDateString()
      };
      card.classList.add('hidden');
      trackActivity(ActivityTypes.LOGIN, { status });
    };
  });
  
  // Close button
  const closeBtn = card.querySelector('.dashboard-card-close');
  if (closeBtn) {
    closeBtn.onclick = () => card.classList.add('hidden');
  }
  
  card.classList.remove('hidden');
}

/**
 * Render news card
 */
function renderNews(content) {
  const card = document.getElementById('dashboardNews');
  if (!card) return;
  
  const listEl = document.getElementById('dashboardNewsList');
  if (listEl && content.items) {
    listEl.innerHTML = content.items.map(item => 
      `<li class="dashboard-list-item">${item}</li>`
    ).join('');
  }
  
  card.classList.remove('hidden');
}

/**
 * Render todos card
 */
function renderTodos(content) {
  const card = document.getElementById('dashboardTodos');
  if (!card) return;
  
  const listEl = document.getElementById('dashboardTodosList');
  if (listEl && content.items) {
    listEl.innerHTML = content.items.map(task => {
      const urgent = task.urgent ? ' dashboard-task-urgent' : '';
      const clickHandler = task.route ? `onclick="navigateToRoute('${task.route}')"` : '';
      return `
        <li class="dashboard-list-item dashboard-task${urgent}" ${clickHandler}>
          <span class="dashboard-task-text">${task.text}</span>
          ${task.priority === 'high' ? '<span class="dashboard-task-badge">High</span>' : ''}
        </li>
      `;
    }).join('');
  }
  
  card.classList.remove('hidden');
}

/**
 * Render student cases card
 */
function renderStudentCases(content) {
  const card = document.getElementById('dashboardStudentCases');
  if (!card) return;
  
  const listEl = document.getElementById('dashboardCasesList');
  if (listEl && content.items) {
    listEl.innerHTML = content.items.map(caseItem => 
      `<li class="dashboard-list-item">
        <strong>${caseItem.name}:</strong> ${caseItem.story}
      </li>`
    ).join('');
  }
  
  card.classList.remove('hidden');
}

/**
 * Render recommendation card
 */
function renderRecommendation(content) {
  const card = document.getElementById('dashboardRecommendation');
  if (!card) return;
  
  const rec = content.recommendation;
  if (!rec) return;
  
  const messageEl = document.getElementById('dashboardRecommendationMessage');
  if (messageEl) {
    messageEl.textContent = rec.message || 'We have a recommendation for you.';
  }
  
  const actionBtn = document.getElementById('dashboardRecommendationAction');
  if (actionBtn) {
    actionBtn.textContent = rec.action === 'navigate' ? `Go to ${rec.module}` : 'View Details';
    actionBtn.onclick = () => {
      if (rec.action === 'navigate' && typeof setRoute === 'function') {
        setRoute(rec.route);
      }
    };
  }
  
  card.classList.remove('hidden');
}

// Expose UI functions globally
window.showStatusReport = showStatusReport;
window.renderDashboardContent = renderDashboardContent;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouterAgent);
} else {
  initRouterAgent();
}

