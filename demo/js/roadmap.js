(function () {
  const stateRef = window.state || (window.state = {});
  stateRef.roadmap = stateRef.roadmap || { near: [], mid: [], far: [] };
  stateRef.questProgress = stateRef.questProgress || {
    tests: 0,
    recommenders: 0,
    essays: 0,
    portfolio: 0,
    applications: 0
  };
  stateRef.achievements = stateRef.achievements || [
    { id: 'first_goal', title: 'Goal Setter', description: 'Set your first goal', unlocked: false, icon_locked: '🔒', icon_unlocked: '🎯' },
    { id: 'three_days', title: 'Consistent', description: 'Complete tasks for 3 consecutive days', unlocked: false, icon_locked: '🔒', icon_unlocked: '🔥' },
    { id: 'first_essay', title: 'Writer', description: 'Complete your first essay draft', unlocked: false, icon_locked: '🔒', icon_unlocked: '✍️' },
    { id: 'recommenders', title: 'Networker', description: 'Secure 3 recommenders', unlocked: false, icon_locked: '🔒', icon_unlocked: '🤝' },
    { id: 'applications', title: 'Applicant', description: 'Submit 5 applications', unlocked: false, icon_locked: '🔒', icon_unlocked: '📝' }
  ];
  stateRef.consecutiveDays = stateRef.consecutiveDays || 0;
  stateRef.lastActivityDate = stateRef.lastActivityDate || new Date().toDateString();
  stateRef.plants = stateRef.plants || [];
  stateRef.plantStages = stateRef.plantStages || ['sprout', 'seedling', 'flowering', 'fruiting'];
  stateRef.spriteCelebrated = stateRef.spriteCelebrated || false;

  let goalFormEl;
  let goalListEl;
  let timelineNearEl;
  let timelineMidEl;
  let timelineFarEl;
  let sheetEl;
  let sheetTitleEl;
  let sheetContentEl;
  let sheetCloseEl;
  let sheetDoneEl;
  let sheetItemRef = null;
  let achievementCarouselEl;
  let gardenCarouselEl;
  let gardenInfoEl;
  let riskFabEl;
  let riskIndicatorEl;
  let riskPanelEl;
  let riskMessageEl;
  let riskFactorsEl;
  let questPathEl;
  let questAvatarEl;
  let achievementPanelEl;
  let confettiContainerEl;
  let bubbleWrapEl;
  let breakModalEl;
  let closeBreakModalEl;
  let achievementModalEl;
  let modalAchievementIconEl;
  let modalAchievementTitleEl;
  let modalAchievementDescEl;
  let closeAchievementModalEl;
  let ctaDoItEl;
  let aiDeerEl;
  let deerBubbleEl;
  let deerMessageEl;

  let sessionStartTime = Date.now();
  let breakModalShown = false;
  let roadmapInterval;
  let riskInterval;

  function cacheElements() {
    goalFormEl = document.getElementById('goalForm');
    goalListEl = document.getElementById('goalList');
    timelineNearEl = document.getElementById('timelineNear');
    timelineMidEl = document.getElementById('timelineMid');
    timelineFarEl = document.getElementById('timelineFar');
    sheetEl = document.getElementById('sheet');
    sheetTitleEl = document.getElementById('sheetTitle');
    sheetContentEl = document.getElementById('sheetContent');
    sheetCloseEl = document.getElementById('sheetClose');
    sheetDoneEl = document.getElementById('sheetDone');
    achievementCarouselEl = document.getElementById('achievementCarousel');
    gardenCarouselEl = document.getElementById('gardenCarousel');
    gardenInfoEl = document.getElementById('gardenInfo');
    riskFabEl = document.getElementById('riskFab');
    riskIndicatorEl = document.getElementById('riskIndicator');
    riskPanelEl = document.getElementById('riskPanel');
    riskMessageEl = document.getElementById('riskMessage');
    riskFactorsEl = document.getElementById('riskFactors');
    questPathEl = document.getElementById('questPath');
    questAvatarEl = document.getElementById('questAvatar');
    achievementPanelEl = document.getElementById('achievementPanel');
    confettiContainerEl = document.getElementById('confettiContainer');
    bubbleWrapEl = document.getElementById('bubbleWrap');
    breakModalEl = document.getElementById('breakModal');
    closeBreakModalEl = document.getElementById('closeBreakModal');
    achievementModalEl = document.getElementById('achievementModal');
    modalAchievementIconEl = document.getElementById('modalAchievementIcon');
    modalAchievementTitleEl = document.getElementById('modalAchievementTitle');
    modalAchievementDescEl = document.getElementById('modalAchievementDesc');
    closeAchievementModalEl = document.getElementById('closeAchievementModal');
    ctaDoItEl = document.getElementById('ctaDoIt');
    aiDeerEl = document.getElementById('aiDeer');
    deerBubbleEl = document.getElementById('deerBubble');
    deerMessageEl = document.getElementById('deerMessage');
  }

  function renderGoals() {
    if (!goalListEl) return;
    goalListEl.innerHTML = (stateRef.goals || []).map((goal) => `<li><span>${goal.title}</span></li>`).join('');
  }

  function nodes(list) {
    if (!list || !Array.isArray(list)) return '';
    return list.map((item) => `
      <div class="node ${item.done ? 'done' : ''}" data-id="${item.id}">
        <div><strong>${item.title || 'Untitled'}</strong></div>
        <div class="meta">Type: ${item.type || 'Task'} · Tags: ${(item.tags || []).map((t) => `#${t}`).join(' ')}</div>
        ${item.done ? `<div class="tags"><span class='badge-achv'>Achievement: ${item.achievement || 'Completed'}</span></div>` : ''}
      </div>`).join('');
  }

  function renderTimeline() {
    if (!timelineNearEl || !timelineMidEl || !timelineFarEl) return;
    timelineNearEl.innerHTML = nodes(stateRef.roadmap.near);
    timelineMidEl.innerHTML = nodes(stateRef.roadmap.mid);
    timelineFarEl.innerHTML = nodes(stateRef.roadmap.far);
    [timelineNearEl, timelineMidEl, timelineFarEl].forEach((column) => {
      column?.querySelectorAll('.node').forEach((node) => {
        node.addEventListener('click', () => {
          const { id } = node.dataset;
          const item = (stateRef.roadmap.near || [])
            .concat(stateRef.roadmap.mid || [], stateRef.roadmap.far || [])
            .find((entry) => entry.id === id);
          if (!item) return;
          if (!item.done) {
            item.done = true;
            const tags = item.tags || [];
            if (item.category) {
              completeTask(id, item.category);
            } else {
              if (tags.includes('standardized')) completeTask(id, 'tests');
              if (tags.includes('meeting') || tags.includes('recommender')) completeTask(id, 'recommenders');
              if (tags.includes('essay')) completeTask(id, 'essays');
              if (tags.includes('application')) completeTask(id, 'applications');
              if (tags.includes('project') || tags.includes('portfolio')) completeTask(id, 'portfolio');
            }
            renderTimeline();
          }
          openSheet(item);
        });
      });
    });
  }

  function regenRoadmap() {
    stateRef.roadmap.near = [
      { id: 'n1', title: 'Polish academic resume', type: 'Document', tags: ['resume', 'docs'], done: true, achievement: 'Resume v1 ready', category: 'portfolio' },
      { id: 'n2', title: 'Advisor meeting for planning', type: 'Meeting', tags: ['meeting', 'tutor'], done: false, category: 'recommenders' },
      { id: 'n3', title: 'Submit one competition entry', type: 'Competition', tags: ['competition'], done: false, category: 'portfolio' }
    ];
    stateRef.roadmap.mid = [
      { id: 'm1', title: 'Complete a mini research project', type: 'Project', tags: ['project'], done: false, category: 'portfolio' },
      { id: 'm2', title: 'Improve standardized scores', type: 'Testing', tags: ['standardized'], done: false, category: 'tests' }
    ];
    stateRef.roadmap.far = [
      { id: 'f1', title: 'Consolidate and refine application materials', type: 'Application', tags: ['application'], done: false, category: 'applications' }
    ];
    renderRoadmapStages();
    renderTimeline();
    renderGoals();
  }

  function openSheet(item) {
    if (!sheetEl || !sheetTitleEl || !sheetContentEl) return;
    sheetItemRef = item;
    sheetTitleEl.textContent = item.title || 'Task Details';
    const tags = (item.tags || []).map((tag) => `#${tag}`).join(' ');
    const tagsHtml = `Type: ${item.type || 'Task'}${tags ? ` · Tags: ${tags}` : ''}<br/>`;
    const achievementHtml = item.done ? `<span class='badge-achv'>${item.achievement || 'Completed'}</span>` : '';
    sheetContentEl.innerHTML = `${tagsHtml}${achievementHtml}`;
    sheetEl.classList.remove('hidden');
  }

  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.classList.add('hidden');
    sheetItemRef = null;
  }

  function renderAchievements() {
    if (!achievementCarouselEl) return;
    const achievements = stateRef.achievements || [];
    achievementCarouselEl.innerHTML = achievements.map((achievement) => `
      <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}" data-id="${achievement.id || ''}">
        <div class="achievement-icon">${achievement.unlocked ? (achievement.icon_unlocked || '🎯') : (achievement.icon_locked || '🔒')}</div>
        <div class="achievement-title">${achievement.title || 'Achievement'}</div>
        ${achievement.unlocked ? '' : `<div class="achievement-desc">${achievement.description || ''}</div>`}
      </div>`).join('');
    achievementCarouselEl.querySelectorAll('.achievement-badge').forEach((badge) => {
      badge.addEventListener('click', () => {
        const { id } = badge.dataset;
        const achievement = (stateRef.achievements || []).find((entry) => entry.id === id);
        if (achievement) showAchievementModal(achievement);
      });
    });
  }

  function showAchievementModal(achievement) {
    if (!achievementModalEl || !modalAchievementDescEl || !modalAchievementIconEl || !modalAchievementTitleEl) return;
    modalAchievementIconEl.textContent = achievement.unlocked ? achievement.icon_unlocked : achievement.icon_locked;
    modalAchievementTitleEl.textContent = achievement.title;
    modalAchievementDescEl.textContent = achievement.unlocked ? `Unlocked! ${achievement.description}` : `To unlock: ${achievement.description}`;
    achievementModalEl.classList.remove('hidden');
  }

  function unlockAchievement(id) {
    const achievement = (stateRef.achievements || []).find((entry) => entry.id === id);
    if (!achievement || achievement.unlocked) return;
    achievement.unlocked = true;
    renderAchievements();
    triggerConfetti();
    playDingSound();
    updateDeerState('celebrate');
  }

  function triggerConfetti() {
    if (!confettiContainerEl) return;
    confettiContainerEl.classList.remove('hidden');
    for (let i = 0; i < 50; i += 1) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 1.5}s`;
      confetti.style.background = ['#6ea8fe', '#7ee787', '#ff9aa9', '#ffd700'][Math.floor(Math.random() * 4)];
      confettiContainerEl.appendChild(confetti);
    }
    setTimeout(() => {
      confettiContainerEl.classList.add('hidden');
      confettiContainerEl.innerHTML = '';
    }, 2000);
  }

  function playDingSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Unable to play ding sound', error);
    }
  }

  function calculateRisk(userData) {
    let riskScore = 0;
    const factors = [];
    const upcomingDeadlines = userData.roadmap?.near?.filter((task) => {
      if (task.done) return false;
      const deadline = task.deadline ? new Date(task.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return deadline.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000;
    }).length || 0;
    if (upcomingDeadlines > 0) {
      riskScore += upcomingDeadlines * 20;
      factors.push(`${upcomingDeadlines} tasks nearing deadline`);
    }
    const blockers = userData.roadmap?.near?.filter((task) => !task.done && task.blocked).length || 0;
    if (blockers > 0) {
      riskScore += blockers * 30;
      factors.push(`${blockers} tasks blocked`);
    }
    const recommenders = getSection?.('Recommenders');
    const counselorStatus = recommenders?.params.find((param) => param[0] === 'Counselor')?.[1] || 'needed';
    if (counselorStatus === 'needed') {
      riskScore += 25;
      factors.push('Recommenders not yet confirmed');
    }
    if (riskScore < 30) return { level: 'low', factors, score: riskScore };
    if (riskScore < 60) return { level: 'medium', factors, score: riskScore };
    return { level: 'high', factors, score: riskScore };
  }

  function updateRiskDashboard() {
    const metrics = calculateRisk(stateRef);
    if (!riskFabEl || !riskIndicatorEl) return;
    riskFabEl.className = `risk-fab risk-${metrics.level}`;
    riskIndicatorEl.textContent = metrics.level === 'high' ? '⚠' : metrics.level === 'medium' ? '⚡' : '●';
    const factors = metrics.factors || [];
    if (riskMessageEl) riskMessageEl.textContent = factors[0] || 'All clear!';
    if (riskFactorsEl) riskFactorsEl.innerHTML = factors.map((item) => `<li>${item}</li>`).join('');
    if (metrics.level === 'high' && navigator.vibrate) navigator.vibrate(200);
    updateDeerState(metrics.level === 'medium' || metrics.level === 'high' ? 'alert' : 'normal');
  }

  function initPlants() {
    if (!stateRef.plants.length && stateRef.profile?.targetSchools) {
      stateRef.plants = stateRef.profile.targetSchools.map((school) => ({
        id: school.toLowerCase().replace(/\s+/g, '_'),
        name: school,
        stage: 0,
        progress: 0,
        lastWatered: new Date().toISOString(),
        milestones: []
      }));
    }
  }

  function renderPlants() {
    if (!gardenCarouselEl) return;
    initPlants();
    const plants = stateRef.plants || [];
    gardenCarouselEl.innerHTML = plants.map((plant) => `
      <div class="plant-pot" data-id="${plant.id}">
        <div class="plant-visual plant-stage-${plant.stage || 0}">
          <div class="pot">🌱</div>
          <div class="plant-name">${plant.name || 'Plant'}</div>
          <div class="plant-progress">${Math.round(plant.progress || 0)}%</div>
        </div>
      </div>`).join('');
    const now = new Date();
    plants.forEach((plant) => {
      if (!plant.lastWatered) return;
      const daysSince = (now - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
      if (daysSince > 3) {
        const pot = gardenCarouselEl.querySelector(`[data-id="${plant.id}"]`);
        pot?.classList.add('wilted');
        if (gardenInfoEl) gardenInfoEl.innerHTML = `<div class="warning">⚠️ Your ${plant.name || 'plan'} plan needs watering! (${Math.floor(daysSince)} days inactive)</div>`;
      }
    });
    gardenCarouselEl.querySelectorAll('.plant-pot').forEach((pot) => {
      let timer;
      pot.addEventListener('mousedown', () => {
        timer = setTimeout(() => {
          const plant = (stateRef.plants || []).find((entry) => entry.id === pot.dataset.id);
          if (plant) showPlantTimeline(plant);
        }, 500);
      });
      ['mouseup', 'mouseleave'].forEach((event) => pot.addEventListener(event, () => clearTimeout(timer)));
    });
  }

  function showPlantTimeline(plant) {
    if (!plant || !plant.milestones || !plant.milestones.length) {
      alert(`${plant?.name || 'Plant'} Timeline:\nNo milestones yet`);
      return;
    }
    const lines = plant.milestones.map((milestone) => {
      const date = milestone.date ? new Date(milestone.date).toLocaleDateString() : 'Date unknown';
      return `- ${milestone.title || 'Milestone'} (${date})`;
    }).join('\n');
    alert(`${plant.name || 'Plant'} Timeline:\n${lines}`);
  }

  function updatePlantProgress(schoolName, milestone) {
    const plant = (stateRef.plants || []).find((entry) => entry.name === schoolName);
    if (!plant) return;
    plant.milestones = plant.milestones || [];
    plant.milestones.push({ title: milestone || 'Milestone', date: new Date().toISOString() });
    plant.progress = Math.min(100, (plant.progress || 0) + 20);
    const stages = stateRef.plantStages || ['sprout', 'seedling', 'flowering', 'fruiting'];
    if (plant.progress >= 100) {
      const index = stages.indexOf(plant.stage);
      if (index >= 0 && index < stages.length - 1) plant.stage = stages[index + 1];
      plant.progress = 0;
    }
    plant.lastWatered = new Date().toISOString();
    renderPlants();
    triggerParticleEffect();
  }

  function showCategoryTasks(category) {
    const names = {
      tests: 'Standardized Tests',
      recommenders: 'Recommendation Letters',
      essays: 'Essays',
      portfolio: 'Portfolio',
      applications: 'Applications'
    };
    const tasks = (stateRef.roadmap.near || [])
      .concat(stateRef.roadmap.mid || [], stateRef.roadmap.far || [])
      .filter((task) => task.category === category || (category === 'tests' && task.tags?.includes('standardized')));
    const message = tasks.length
      ? `${names[category]}: ${tasks.filter((task) => task.done).length}/${tasks.length} completed`
      : `No tasks for ${names[category]} yet`;
    window.speak?.(message);
    updateDeerState('normal');
    if (deerBubbleEl && deerMessageEl) {
      deerBubbleEl.classList.remove('hidden');
      deerMessageEl.textContent = message;
      setTimeout(() => deerBubbleEl.classList.add('hidden'), 3000);
    }
  }

  function updateQuestPath() {
    if (!questPathEl || !questAvatarEl) return;
    const total = Object.values(stateRef.questProgress || {}).reduce((sum, value) => sum + value, 0);
    const max = 500;
    const percent = Math.min(100, (total / max) * 100);
    const pathWidth = 72 * (percent / 100);
    questPathEl.style.width = `${pathWidth}%`;
    questAvatarEl.style.left = `${8 + pathWidth * 0.92}%`;
    document.querySelectorAll('.landmark').forEach((landmark) => {
      const category = landmark.dataset.category;
      if (category && (stateRef.questProgress?.[category] || 0) >= 20) {
        landmark.classList.add('completed');
      } else {
        landmark.classList.remove('completed');
      }
    });
  }

  function completeTask(taskId, category) {
    if (!category) return;
    if (stateRef.questProgress?.[category] !== undefined) {
      stateRef.questProgress[category] = Math.min(100, stateRef.questProgress[category] + 20);
    }
    updateQuestPath();
    triggerParticleEffect();
    checkConsecutiveDays();
    (stateRef.profile?.targetSchools || []).forEach((school) => updatePlantProgress(school, `Completed ${category} task`));
    if (category === 'essays' && stateRef.questProgress.essays >= 20) unlockAchievement('first_essay');
    if (category === 'recommenders' && stateRef.questProgress.recommenders >= 60) unlockAchievement('recommenders');
    if (category === 'applications' && stateRef.questProgress.applications >= 100) unlockAchievement('applications');
  }

  function triggerParticleEffect() {
    const particles = 20;
    for (let i = 0; i < particles; i += 1) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const angle = (Math.PI * 2 * i) / particles;
      const distance = 100 + Math.random() * 50;
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      particle.style.background = ['#ffd700', '#6ea8fe', '#7ee787'][Math.floor(Math.random() * 3)];
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
    window.speak?.("Great job! You're one step closer to your dream school!");
  }

  function checkConsecutiveDays() {
    const today = new Date().toDateString();
    if (stateRef.lastActivityDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (stateRef.lastActivityDate === yesterday.toDateString()) {
      stateRef.consecutiveDays += 1;
    } else {
      stateRef.consecutiveDays = 1;
    }
    stateRef.lastActivityDate = today;
    if (stateRef.consecutiveDays >= 3 && !stateRef.spriteCelebrated) {
      stateRef.spriteCelebrated = true;
      triggerSpriteCelebration();
    }
  }

  function triggerSpriteCelebration() {
    const questMap = document.querySelector('.quest-map');
    if (!questMap) return;
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
    playDingSound();
    setTimeout(() => sprite.remove(), 2000);
    window.speak?.('Amazing! You\'ve been consistent for 3 days! Keep up the great work!');
    updateDeerState('celebrate');
  }

  function showMilestoneDetails(milestone) {
    if (!milestone) return;
    const message = milestone.description;
    window.speak?.(message);
    updateDeerState('normal');
    if (deerBubbleEl && deerMessageEl) {
      deerBubbleEl.classList.remove('hidden');
      deerMessageEl.textContent = message;
      setTimeout(() => deerBubbleEl.classList.add('hidden'), 3000);
    }
  }

  function renderRoadmapStages() {
    const container = document.getElementById('stagesContainer');
    if (!container || !roadmapData?.stages) return;
    container.innerHTML = roadmapData.stages.map((stage) => {
      const progress = stage.progress || 0;
      const statusClass = stage.status === 'locked' ? 'locked' : stage.status === 'unlocked' ? 'unlocked' : '';
      const milestones = stage.key_milestones || [];
      const completed = milestones.filter((milestone) => milestone.status === 'completed').length;
      const total = milestones.length;
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
              <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
              <span class="progress-text">${progress}%</span>
            </div>
          </div>
          <div class="stage-milestones">
            <div class="milestones-header">
              <span>Milestones: ${completed}/${total} completed</span>
              ${stage.status === 'locked' ? '<span class="locked-badge">🔒 Locked</span>' : ''}
            </div>
            <ul class="milestones-list">
              ${milestones.map((milestone) => {
        const status = milestone.status || 'pending';
        const deadline = milestone.deadline ? ` (Due: ${new Date(milestone.deadline).toLocaleDateString()})` : '';
        const questCategory = roadmapData.quest_categories?.[milestone.quest_category];
        const icon = questCategory?.icon ? `${questCategory.icon} ` : '';
        const name = questCategory?.name || milestone.quest_category || '';
        return `
                  <li class="milestone-item ${status} ${milestone.deadline_sensitive ? 'deadline-sensitive' : ''} ${milestone.dependency_sensitive ? 'dependency-sensitive' : ''}" data-milestone-id="${milestone.milestone_id}">
                    <div class="milestone-status">${status === 'completed' ? '✓' : status === 'in_progress' ? '⟳' : '○'}</div>
                    <div class="milestone-content">
                      <div class="milestone-name">${milestone.name}${deadline}</div>
                      <div class="milestone-description">${milestone.description}</div>
                      <div class="milestone-meta">
                        <span class="milestone-category">${milestone.category}</span>
                        ${questCategory ? `<span class="quest-category" data-category="${milestone.quest_category || ''}">${icon}${name}</span>` : ''}
                      </div>
                    </div>
                  </li>`;
      }).join('')}
            </ul>
          </div>
        </div>`;
    }).join('');
    container.querySelectorAll('.milestone-item').forEach((item) => {
      item.addEventListener('click', () => {
        const { milestoneId } = item.dataset;
        const stage = roadmapData.stages.find((entry) => entry.key_milestones?.some((milestone) => milestone.milestone_id === milestoneId));
        const milestone = stage?.key_milestones?.find((entry) => entry.milestone_id === milestoneId);
        if (milestone) showMilestoneDetails(milestone);
      });
    });
  }

  function udpateBreakStatus() {
    const elapsed = (Date.now() - sessionStartTime) / (1000 * 60);
    if (elapsed > 30 && !breakModalShown) {
      showBreakModal();
      breakModalShown = true;
    }
  }

  function showBreakModal() {
    if (!breakModalEl || !bubbleWrapEl) return;
    bubbleWrapEl.innerHTML = '';
    for (let i = 0; i < 30; i += 1) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble-pop';
      bubble.style.left = `${Math.random() * 90}%`;
      bubble.style.top = `${Math.random() * 90}%`;
      bubble.style.width = bubble.style.height = `${Math.random() * 30 + 20}px`;
      bubble.addEventListener('click', () => {
        playPopSound();
        bubble.remove();
      });
      bubbleWrapEl.appendChild(bubble);
    }
    breakModalEl.classList.remove('hidden');
  }

  function playPopSound() {
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
    } catch (error) {
      console.error('Unable to play pop sound', error);
    }
  }

  function updateDeerState(state) {
    if (!aiDeerEl) return;
    aiDeerEl.className = `deer deer-${state}`;
    if (state === 'alert') {
      if (deerBubbleEl) deerBubbleEl.classList.remove('hidden');
      if (deerMessageEl) deerMessageEl.textContent = '⚠️ Some tasks need attention!';
    } else if (state === 'celebrate') {
      if (deerBubbleEl) deerBubbleEl.classList.remove('hidden');
      if (deerMessageEl) deerMessageEl.textContent = '🎉 Achievement unlocked! Great job!';
      setTimeout(() => updateDeerState('normal'), 3000);
    } else if (deerBubbleEl) {
      deerBubbleEl.classList.add('hidden');
    }
  }

  const roadmapData = window.roadmapData || {
    stages: [],
    achievements: [],
    quest_categories: {},
    plant_stages: {}
  };

  function initRoadmapEnhancements() {
    renderAchievements();
    renderPlants();
    updateRiskDashboard();
    checkConsecutiveDays();
    updateQuestPath();
    if (roadmapData?.achievements?.length) {
      roadmapData.achievements.forEach((achievement) => {
        const existing = stateRef.achievements.find((entry) => entry.id === achievement.achievement_id);
        if (!existing) {
          stateRef.achievements.push({
            id: achievement.achievement_id,
            title: achievement.name,
            description: achievement.description,
            unlocked: achievement.unlocked || false,
            icon_locked: achievement.icon_locked || '🔒',
            icon_unlocked: achievement.icon_unlocked || '🎯'
          });
        }
      });
      renderAchievements();
    }
    if (!roadmapInterval) roadmapInterval = setInterval(udpateBreakStatus, 60 * 1000);
    if (!riskInterval) riskInterval = setInterval(updateRiskDashboard, 30 * 1000);
    if (stateRef.consecutiveDays >= 3 && !stateRef.spriteCelebrated) triggerSpriteCelebration();
  }

  function bindEventHandlers() {
    if (goalFormEl) {
      goalFormEl.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(goalFormEl);
        const goal = (formData.get('goal') || '').toString().trim();
        if (!goal) return;
        stateRef.goals.unshift({ id: Date.now().toString(), title: goal });
        goalFormEl.reset();
        renderGoals();
        regenRoadmap();
        unlockAchievement('first_goal');
      });
    }
    sheetCloseEl?.addEventListener('click', closeSheet);
    sheetEl?.addEventListener('click', (event) => { if (event.target === sheetEl) closeSheet(); });
    sheetDoneEl?.addEventListener('click', () => {
      if (!sheetItemRef) return;
      sheetItemRef.done = true;
      sheetItemRef.achievement = sheetItemRef.achievement || 'Milestone completed';
      renderTimeline();
      closeSheet();
    });
    riskFabEl?.addEventListener('click', () => riskPanelEl?.classList.toggle('hidden'));
    ctaDoItEl?.addEventListener('click', () => window.speak?.('Added AP Chem to your plan.'));
    closeAchievementModalEl?.addEventListener('click', () => achievementModalEl?.classList.add('hidden'));
    closeBreakModalEl?.addEventListener('click', () => {
      if (breakModalEl) breakModalEl.classList.add('hidden');
      sessionStartTime = Date.now();
      breakModalShown = false;
    });
    document.addEventListener('click', (event) => {
      const navBtn = event.target.closest('.nav-btn[data-nav]');
      if (!navBtn) return;
      document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.remove('active'));
      navBtn.classList.add('active');
      const nav = navBtn.dataset.nav;
      if (nav === 'garden') {
        document.getElementById('gardenCarousel')?.closest('.card')?.scrollIntoView({ behavior: 'smooth' });
      } else if (nav === 'map') {
        document.querySelector('.quest-map')?.scrollIntoView({ behavior: 'smooth' });
      } else if (nav === 'achievements') {
        achievementPanelEl?.scrollIntoView({ behavior: 'smooth' });
      } else if (nav === 'profile') {
        window.setRoute?.('profile');
      }
    });
    document.addEventListener('click', (event) => {
      const landmark = event.target.closest('.landmark');
      if (landmark?.dataset.category) showCategoryTasks(landmark.dataset.category);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindEventHandlers();
    if (document.getElementById('view-roadmap')) {
      regenRoadmap();
      initRoadmapEnhancements();
    }
  });

  window.renderGoals = renderGoals;
  window.renderTimeline = renderTimeline;
  window.regenRoadmap = regenRoadmap;
  window.initRoadmapEnhancements = initRoadmapEnhancements;
  window.renderAchievements = renderAchievements;
  window.renderPlants = renderPlants;
  window.updateQuestPath = updateQuestPath;
  window.completeTask = completeTask;
  window.updateRiskDashboard = updateRiskDashboard;
  window.unlockAchievement = unlockAchievement;
})();
