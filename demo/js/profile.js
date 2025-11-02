(function () {
  let profileCompletenessEl;
  let gapCanvasEl;
  let gapMetaEl;
  let profileSectionsEl;
  let progressFillEl;
  let btnEnablePersonaEl;
  let profileSummaryEl;
  let guideCardEl;
  let btnGoAdvisorEl;
  let btnGoRoadmapEl;
  let btnShowGuideEl;

  function getProfileView() {
    if (typeof views !== 'undefined' && views && views.profile) {
      return views.profile;
    }
    return document.getElementById('view-profile');
  }

  function cacheElements() {
    profileCompletenessEl = document.getElementById('profileCompleteness');
    gapCanvasEl = document.getElementById('gapChart');
    gapMetaEl = document.getElementById('gapMeta');
    profileSectionsEl = document.getElementById('profileSections') || document.createElement('div');
    progressFillEl = document.getElementById('progressFill');
    btnEnablePersonaEl = document.getElementById('btnEnablePersona');
    profileSummaryEl = document.getElementById('profileSummary');
    guideCardEl = document.getElementById('guideCard');
    btnGoAdvisorEl = document.getElementById('btnGoAdvisor');
    btnGoRoadmapEl = document.getElementById('btnGoRoadmap');
    btnShowGuideEl = document.getElementById('btnShowGuide');
  }

  function renderProfileAndGap() {
    const filled = [state.profile.name, state.profile.email, state.profile.background].filter(Boolean).length;
    const completeness = Math.round((filled / 3) * 100);

    if (profileCompletenessEl) {
      profileCompletenessEl.textContent = `Profile completeness: ${completeness}%`;
    }
    if (progressFillEl) {
      progressFillEl.style.width = `${Math.max(10, completeness)}%`;
    }
    if (state.gap && gapCanvasEl && typeof drawRadar === 'function') {
      drawRadar(gapCanvasEl, state.gap);
    }
  }

  function tokenHTML(sectionIndex, paramIndex, key, value) {
    return `<span class="token" data-sidx="${sectionIndex}" data-pidx="${paramIndex}">
      <span class="k">${key}</span>
      <span class="v" contenteditable="true">${escapeHtml(value)}</span>
      <span class="x">×</span>
    </span>`;
  }

  function bindTokenEditorEvents() {
    if (!profileSectionsEl) return;
    profileSectionsEl.querySelectorAll('.section-item').forEach((item) => {
      const sectionIndex = parseInt(item.dataset.index, 10);
      item.querySelector('.section-head')?.addEventListener('click', () => {
        item.classList.toggle('expanded');
      });
      item.querySelectorAll('.token .v').forEach((node) => {
        node.addEventListener('input', (event) => {
          const token = event.target.closest('.token');
          const sIdx = parseInt(token.dataset.sidx, 10);
          const pIdx = parseInt(token.dataset.pidx, 10);
          state.profileSections[sIdx].params[pIdx][1] = event.target.textContent;
        });
      });
      item.querySelectorAll('.token .x').forEach((button) => {
        button.addEventListener('click', (event) => {
          const token = event.target.closest('.token');
          const sIdx = parseInt(token.dataset.sidx, 10);
          const pIdx = parseInt(token.dataset.pidx, 10);
          state.profileSections[sIdx].params.splice(pIdx, 1);
          renderProfileSections();
        });
      });
      item.querySelector('.add')?.addEventListener('click', () => {
        const keyInput = item.querySelector('[data-add-key]');
        const valueInput = item.querySelector('[data-add-val]');
        if (!keyInput || !valueInput) return;
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();
        if (!key || !value) return;
        state.profileSections[sectionIndex].params.push([key, value]);
        renderProfileSections();
      });
    });
  }

  function renderProfileSections() {
    if (!profileSectionsEl) return;
    profileSectionsEl.innerHTML = state.profileSections.map((section, sectionIndex) => {
      const meta = section.meta ? `<span class="meta">${section.meta}</span>` : '';
      return `
        <li class="section-item" data-index="${sectionIndex}">
          <div class="section-head">
            <div class="badge">${section.badge}</div>
            <div>${section.key} ${meta}</div>
            <div class="chev">›</div>
          </div>
          <div class="section-body">
            <div class="param-editor">
              ${section.params.map((param, paramIndex) => tokenHTML(sectionIndex, paramIndex, param[0], param[1])).join('')}
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

  function observeSectionAutoExpand() {
    if (!profileSectionsEl) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('expanded');
      });
    }, { root: null, threshold: 0.25 });
    profileSectionsEl.querySelectorAll('.section-item').forEach((element) => observer.observe(element));
  }

  function renderProfileSummary(targetElement) {
    const summaryElement = targetElement || profileSummaryEl;
    if (!summaryElement) {
      console.warn('profileSummary element not found');
      return;
    }
    const school = getSection('School');
    const identity = getSection('Identity');
    const majors = getSection('Intended Major');
    const activities = getSection('Activities');
    const essays = getSection('Essays');
    const recommenders = getSection('Recommenders');
    const applications = getSection('Applications');
    const getParam = (section, key) => (section && section.params ? (section.params.find((item) => item[0] === key) || [])[1] || '' : '');
    const line = (label, valueHtml) => `<li><span>${label}</span><span class="badges">${valueHtml}</span></li>`;
    summaryElement.innerHTML = [
      line(`Identity: ${getParam(identity, 'Name') || '—'} · ${getParam(identity, 'DOB') || '—'} · ${getParam(identity, 'Country') || '—'}`, ''),
      line(`School: ${getParam(school, 'High School') || '—'}`, `<span class='badge-pill'>GPA ${getParam(school, 'GPA') || '—'}</span>`),
      line('Intended Major', `<span class='badge-pill'>${getParam(majors, 'Majors') || '—'}</span>`),
      line('Activities', `<span class='badge-pill'>${getParam(activities, 'Count') || '0'} items</span><span class='badge-pill'>Top ${getParam(activities, 'Top') || '—'}</span>`),
      line('Essays', `<span class='badge-pill'>${getParam(essays, 'Personal Essay') || '—'}</span>`),
      line('Recommenders', `<span class='badge-pill'>Counselor ${getParam(recommenders, 'Counselor') || '—'}</span><span class='badge-pill'>Teachers ${getParam(recommenders, 'Teachers') || '0'}</span>`),
      line('Applications', `<span class='badge-pill'>${getParam(applications, 'Applied') || '0/0'}</span><span class='badge-pill'>Next ${getParam(applications, 'Next') || '—'}</span>`)
    ].join('');
  }

  function seedProfileDefaults() {
    const identity = getSection('Identity');
    const school = getSection('School');
    const major = getSection('Intended Major');
    const activities = getSection('Activities');
    const essays = getSection('Essays');
    const recommenders = getSection('Recommenders');
    const applications = getSection('Applications');
    const upsert = (section, key, value) => {
      const row = section.params.find((param) => param[0] === key);
      if (row) {
        if (!row[1]) row[1] = value;
      } else {
        section.params.push([key, value]);
      }
    };
    upsert(identity, 'Name', state.profile.name || 'New Student');
    upsert(identity, 'DOB', '—');
    upsert(identity, 'Country', '—');
    upsert(school, 'High School', school.params.find((param) => param[0] === 'High School')?.[1] || '—');
    upsert(school, 'GPA', school.params.find((param) => param[0] === 'GPA')?.[1] || '3.8');
    upsert(major, 'Majors', major.params.find((param) => param[0] === 'Majors')?.[1] || 'Undecided');
    upsert(activities, 'Count', activities.params.find((param) => param[0] === 'Count')?.[1] || '0');
    upsert(activities, 'Top', activities.params.find((param) => param[0] === 'Top')?.[1] || '—');
    upsert(essays, 'Personal Essay', essays.params.find((param) => param[0] === 'Personal Essay')?.[1] || 'draft');
    upsert(recommenders, 'Counselor', recommenders.params.find((param) => param[0] === 'Counselor')?.[1] || 'needed');
    upsert(recommenders, 'Teachers', recommenders.params.find((param) => param[0] === 'Teachers')?.[1] || '0');
    upsert(applications, 'Applied', applications.params.find((param) => param[0] === 'Applied')?.[1] || '0/0');
    upsert(applications, 'Next', applications.params.find((param) => param[0] === 'Next')?.[1] || '—');
  }

  const profileRouteObserver = new MutationObserver(() => {
    const profileView = getProfileView();
    if (!profileView) return;
    const active = profileView.classList.contains('active');
    if (!active) return;

    const isOnboardingComplete = (state.profile.targetMajors && state.profile.targetMajors.length > 0)
      || (state.profile.targetSchools && state.profile.targetSchools.length > 0)
      || state.onboardingIndex === (window.steps ? steps.length - 1 : state.onboardingIndex);
    const topTabs = document.getElementById('topTabs');
    if (topTabs && isOnboardingComplete) {
      topTabs.classList.remove('hidden');
    }

    seedProfileDefaults();
    if (!state.gap) {
      state.gap = generateGap();
      if (gapMetaEl) gapMetaEl.textContent = 'Initial GAP analysis generated from your background and goals.';
    }
    renderProfileSummary();
    renderProfileAndGap();
    renderGuideMeta?.();
    renderProfileSections();
    if (state.returnToProfileExpand) {
      profileSectionsEl.querySelectorAll('.section-item').forEach((element) => element.classList.add('expanded'));
      state.returnToProfileExpand = false;
    }
    if (state.suggestions && state.suggestions.length) {
      showVoiceSidebar?.();
    } else {
      const voiceSidebar = document.getElementById('voiceSidebar');
      const voiceSuggestions = document.getElementById('voiceSuggestions');
      if (voiceSidebar) voiceSidebar.classList.add('hidden');
      if (voiceSuggestions) {
        voiceSuggestions.innerHTML = `<li class="suggestion"><div class="muted">Speak: \"My GPA is 3.9\", \"Ridgefield High School\", \"Computer Science\"...</div></li>`;
      }
    }
  });

  function bindPersonaButton() {
    if (!btnEnablePersonaEl) return;
    btnEnablePersonaEl.addEventListener('click', () => {
      state.personaEnabled = true;
      if (typeof speak === 'function') {
        speak('Persona enabled. I will perform a GAP analysis based on similar success cases.');
      }
      state.gap = generateGap();
      if (gapCanvasEl && typeof drawRadar === 'function') drawRadar(gapCanvasEl, state.gap);
      if (gapMetaEl) gapMetaEl.textContent = 'Initial GAP analysis generated from your background and goals.';
    });
  }

  function bindGuideEvents() {
    guideCardEl?.addEventListener('click', (event) => {
      const card = event.target.closest('.guide-card');
      if (!card) return;
      const section = card.getAttribute('data-section');
      if (!section) return;
      if (event.target.closest('button') || event.target.closest('a')) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof openEditor === 'function') openEditor(section);
    });

    btnGoAdvisorEl?.addEventListener('click', () => {
      setRoute?.('advisor');
      state.returnToProfileExpand = true;
    });
    btnGoRoadmapEl?.addEventListener('click', () => {
      setRoute?.('roadmap');
      state.returnToProfileExpand = true;
    });
    btnShowGuideEl?.addEventListener('click', () => {
      guideCardEl?.classList.toggle('hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindPersonaButton();
    bindGuideEvents();
    const profileView = getProfileView();
    if (profileView) {
      profileRouteObserver.observe(profileView, { attributes: true, attributeFilter: ['class'] });
    }
  });

  window.renderProfileAndGap = renderProfileAndGap;
  window.renderProfileSections = renderProfileSections;
  window.observeSectionAutoExpand = observeSectionAutoExpand;
  window.renderProfileSummary = renderProfileSummary;
  window.seedProfileDefaults = seedProfileDefaults;
})();
