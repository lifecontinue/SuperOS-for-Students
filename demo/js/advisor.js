(function () {
  state.majors = (state.majors || []).map((major) => ({
    ...major,
    inspirations: major.inspirations && major.inspirations.length ? major.inspirations : [
      { name: 'Rachel', path: 'HS → CS club → Research → CS@Top10' },
      { name: 'Leo', path: 'Math team → Hackathon → Startup intern' }
    ]
  }));

  let majorListEl;
  let compareTableEl;
  let compareSummaryEl;
  let compareViewEl;

  function cacheElements() {
    majorListEl = document.getElementById('majorList');
    compareTableEl = document.getElementById('compareTable');
    compareSummaryEl = document.getElementById('compareSummary');
    compareViewEl = document.getElementById('compareView');
  }

  function renderMajors(targetElement) {
    const listEl = targetElement || majorListEl;
    if (!listEl) {
      console.warn('majorList element not found');
      return;
    }

    if (!state.majors || !Array.isArray(state.majors) || state.majors.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No majors available. Please add majors to your profile.</div>';
      return;
    }

    const selected = new Set(state.selectedMajors || []);
    listEl.innerHTML = state.majors.map((major) => `
      <div class="major-card ${selected.has(major.id) ? 'selected' : ''}" data-id="${major.id}">
        <div class="major-card-header">
          <div class="major-card-title">${major.name || 'Unknown Major'}</div>
          ${selected.has(major.id) ? '<div class="selected-badge">✓ Selected</div>' : ''}
        </div>
        <div class="major-card-content">
          <div class="major-card-meta">
            <div class="meta-item">
              <span class="meta-label">Fit:</span>
              <span class="meta-value">${major.fit || '—'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Load:</span>
              <span class="meta-value">${major.load || '—'}</span>
            </div>
          </div>
          ${major.highlights && major.highlights.length ? `
            <div class="major-highlights">
              ${major.highlights.map((highlight) => `<span class="highlight-tag">${highlight}</span>`).join('')}
            </div>` : ''}
          ${major.inspirations && major.inspirations.length ? `
            <div class="major-inspirations">
              <div class="insp-title">Real-world inspirations:</div>
              <ul class="insp-list">
                ${major.inspirations.map((insp) => `<li><span class="insp-name">${insp.name}</span><span class="insp-path">${insp.path}</span></li>`).join('')}
              </ul>
            </div>` : ''}
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.major-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (!state.selectedMajors) state.selectedMajors = [];
        if (state.selectedMajors.includes(id)) {
          state.selectedMajors = state.selectedMajors.filter((existing) => existing !== id);
        } else {
          if (state.selectedMajors.length >= 2) state.selectedMajors.shift();
          state.selectedMajors.push(id);
        }
        renderMajors(listEl);
        updateSelectedLabels();
      });
    });
  }

  function updateSelectedLabels() {
    const ids = (state.selectedMajors || []).slice(0, 2);
    const [majorA, majorB] = ids.map((id) => state.majors.find((major) => major.id === id));

    const labelA = document.getElementById('selMajorA');
    const labelB = document.getElementById('selMajorB');

    if (labelA) labelA.textContent = majorA ? majorA.name : '—';
    if (labelB) labelB.textContent = majorB ? majorB.name : '—';

    if (ids.length === 2 && majorA && majorB) {
      setTimeout(() => performComparison(), 50);
    } else if (compareSummaryEl) {
      const remaining = 2 - ids.length;
      compareSummaryEl.textContent = remaining === 1
        ? 'Select 1 more major to compare.'
        : 'Select 2 majors above to compare.';
      if (compareTableEl) compareTableEl.innerHTML = '';
      if (compareViewEl) compareViewEl.innerHTML = '';
    }
  }

  function performComparison() {
    const ids = (state.selectedMajors || []).slice(0, 2);
    const majorA = state.majors.find((major) => major.id === ids[0]);
    const majorB = state.majors.find((major) => major.id === ids[1]);

    if (!majorA || !majorB) {
      if (compareSummaryEl) compareSummaryEl.textContent = 'Select two majors above to compare.';
      if (compareTableEl) compareTableEl.innerHTML = '';
      if (compareViewEl) compareViewEl.innerHTML = '';
      return;
    }

    const extras = compareExtras(majorA, majorB);

    if (compareTableEl) {
      compareTableEl.innerHTML = `
        <thead>
          <tr>
            <th>Dimension</th>
            <th>${majorA.name}</th>
            <th>${majorB.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Fit</strong></td>
            <td>${majorA.fit || '—'}</td>
            <td>${majorB.fit || '—'}</td>
          </tr>
          <tr>
            <td><strong>Load</strong></td>
            <td>${majorA.load || '—'}</td>
            <td>${majorB.load || '—'}</td>
          </tr>
          <tr>
            <td><strong>Highlights</strong></td>
            <td>${majorA.highlights && majorA.highlights.length ? majorA.highlights.join(', ') : '—'}</td>
            <td>${majorB.highlights && majorB.highlights.length ? majorB.highlights.join(', ') : '—'}</td>
          </tr>
          <tr>
            <td><strong>Curriculum</strong></td>
            <td>${extras.curriculumA.join(', ')}</td>
            <td>${extras.curriculumB.join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Difficulty</strong></td>
            <td>${extras.difficultyA}</td>
            <td>${extras.difficultyB}</td>
          </tr>
          <tr>
            <td><strong>Career Roles</strong></td>
            <td>${extras.jobsA.join(', ')}</td>
            <td>${extras.jobsB.join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Inspiration Path</strong></td>
            <td>${majorA.inspirations && majorA.inspirations.length ? majorA.inspirations[0].path : '—'}</td>
            <td>${majorB.inspirations && majorB.inspirations.length ? majorB.inspirations[0].path : '—'}</td>
          </tr>
        </tbody>
      `;
    }

    if (compareViewEl) compareViewEl.innerHTML = '';

    if (compareSummaryEl) {
      compareSummaryEl.textContent = `${majorA.name} leans to ${extras.curriculumA[0]} with ${extras.difficultyA.toLowerCase()}; ${majorB.name} emphasizes ${extras.curriculumB[0]} and ${extras.difficultyB.toLowerCase()}.`;
    }
  }

  function compareExtras(a, b) {
    const curriculumA = ['DSA', 'Systems', 'AI'];
    const curriculumB = b.id === 'econ'
      ? ['Micro', 'Macro', 'Econometrics']
      : ['Biochem', 'Lab', 'Genetics'];
    const difficultyA = 'Rigorous math & coding';
    const difficultyB = b.id === 'econ' ? 'Math-heavy models' : 'Lab-intensive practice';
    const jobsA = ['Software Engineer', 'ML Engineer'];
    const jobsB = b.id === 'econ' ? ['Analyst', 'Consultant'] : ['Research Assistant', 'BioTech'];
    return { curriculumA, curriculumB, difficultyA, difficultyB, jobsA, jobsB };
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    if (!state.selectedMajors) state.selectedMajors = [];
    if (majorListEl) renderMajors(majorListEl);
    updateSelectedLabels();
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#btnCompare');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    performComparison();
  });

  document.addEventListener('click', (event) => {
    const goAdvisor = event.target.closest('#btnGoAdvisor');
    if (!goAdvisor) return;
    if (!state.selectedMajors || state.selectedMajors.length === 0) {
      state.selectedMajors = state.majors.slice(0, 2).map((major) => major.id);
      if (majorListEl) renderMajors(majorListEl);
      updateSelectedLabels();
    }
  }, true);

  window.renderMajors = renderMajors;
  window.updateSelectedLabels = updateSelectedLabels;
  window.performComparison = performComparison;
  window.compareExtras = compareExtras;
})();
