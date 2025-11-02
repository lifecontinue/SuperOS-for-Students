(function () {
  const stateRef = window.state || (window.state = {});
  let viewEditorEl;
  let editorTitleEl;
  let editorBodyEl;
  let btnBackProfileEl;

  function cacheElements() {
    viewEditorEl = document.getElementById('view-editor');
    editorTitleEl = document.getElementById('editorTitle');
    editorBodyEl = document.getElementById('editorBody');
    btnBackProfileEl = document.getElementById('btnBackProfileE');
  }

  function openActivityEdit(activity, onSave) {
    const sheet = document.getElementById('sheet');
    const sheetTitle = document.getElementById('sheetTitle');
    const sheetContent = document.getElementById('sheetContent');
    const sheetDone = document.getElementById('sheetDone');
    if (!sheet || !sheetTitle || !sheetContent) return;
    sheetTitle.textContent = activity.title || 'Task Details';
    sheetContent.innerHTML = `
      <div class="form">
        <label>Title<input id="actTitle" value="${escapeHtml(activity.title || '')}" /></label>
        <label>Role<input id="actRole" value="${escapeHtml(activity.role || '')}" /></label>
        <label>Hours/week<input id="actHours" value="${escapeHtml(activity.hours || '')}" inputmode="decimal" /></label>
        <label>Grades (e.g., 9-12)<input id="actGrades" value="${escapeHtml(activity.grades || '')}" /></label>
        <button id="actSave">Save</button>
      </div>`;
    sheetDone?.classList.add('hidden');
    document.getElementById('actSave')?.addEventListener('click', () => {
      activity.title = document.getElementById('actTitle')?.value.trim() || '';
      activity.role = document.getElementById('actRole')?.value.trim() || '';
      activity.hours = document.getElementById('actHours')?.value.trim() || '';
      activity.grades = document.getElementById('actGrades')?.value.trim() || '';
      sheet.classList.add('hidden');
      sheetDone?.classList.remove('hidden');
      onSave?.(activity);
    });
    sheet.classList.remove('hidden');
  }

  function renderActivitiesEditor() {
    if (!editorTitleEl || !editorBodyEl) return;
    editorTitleEl.textContent = 'Activities';
    stateRef.activities = stateRef.activities || [
      { id: 'a1', title: 'Debate Club', role: 'President', hours: '10 hrs/week', grades: 'Grade 9-12' },
      { id: 'a2', title: 'Math Team', role: 'Captain', hours: '5 hrs/week', grades: 'Grade 10-12' },
      { id: 'a3', title: 'Coding Club', role: 'Founder', hours: '8 hrs/week', grades: 'Grade 11-12' }
    ];
    editorBodyEl.innerHTML = `
      <div class="editor-summary">Quick summary</div>
      <div class="card-list" id="actList"></div>
      <div class="divider-line"></div>
      <div class="add-bar" id="actAdd">
        <span>＋</span>
        <span>Add Activity</span>
      </div>`;
    const list = document.getElementById('actList');
    if (!list) return;
    if (!stateRef.activities?.length) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = stateRef.activities.map((activity) => `
      <div class="card-item" data-id="${activity.id || ''}">
        <div>
          <div class="title">${activity.title || 'Activity'}</div>
          <div class="subtitle">${activity.role || ''} · ${activity.hours || ''} · ${activity.grades || ''}</div>
        </div>
        <button class="action">Edit</button>
      </div>`).join('');
    list.querySelectorAll('.card-item .action').forEach((button) => {
      button.addEventListener('click', (event) => {
        const card = event.currentTarget.closest('.card-item');
        const id = card?.dataset.id;
        if (!id) return;
        const item = stateRef.activities.find((entry) => entry.id === id);
        if (!item) return;
        openActivityEdit({ ...item }, (updated) => {
          Object.assign(item, updated);
          renderActivitiesEditor();
        });
      });
    });
    const addButton = document.getElementById('actAdd');
    addButton?.addEventListener('click', () => {
      openActivityEdit({ id: `a${Date.now()}`, title: '', role: '', hours: '', grades: '' }, (created) => {
        stateRef.activities = stateRef.activities || [];
        stateRef.activities.unshift(created);
        setSectionParam?.('Activities', 'Count', String(stateRef.activities.length), true);
        setSectionParam?.('Activities', 'Top', stateRef.activities[0]?.title || '', true);
        renderActivitiesEditor();
      });
    });
  }

  function renderEditor(key) {
    if (!editorTitleEl || !editorBodyEl) return;
    const renderers = {
      activities: renderActivitiesEditor
    };
    if (renderers[key]) {
      renderers[key]();
      return;
    }
    if (key === 'identity') {
      editorTitleEl.textContent = 'Identity & Contact';
      const section = getSection?.('Identity');
      const name = section?.params.find((param) => param[0] === 'Name')?.[1] || '';
      const dob = section?.params.find((param) => param[0] === 'DOB')?.[1] || '';
      const email = stateRef.profile?.email || '';
      editorBodyEl.innerHTML = `
        <div class="form">
          <label>Name<input id="edName" value="${escapeHtml(name)}" /></label>
          <label>Date of birth<input id="edDOB" value="${escapeHtml(dob)}" /></label>
          <label>Email<input id="edEmail" value="${escapeHtml(email)}" inputmode="email" /></label>
          <button id="edSaveIdentity">Save</button>
        </div>`;
      document.getElementById('edSaveIdentity')?.addEventListener('click', () => {
        setSectionParam?.('Identity', 'Name', document.getElementById('edName')?.value || '', true);
        setSectionParam?.('Identity', 'DOB', document.getElementById('edDOB')?.value || '', true);
        stateRef.profile.email = document.getElementById('edEmail')?.value || '';
        window.setRoute?.('profile');
        window.renderProfileSummary?.();
      });
      return;
    }
    if (key === 'school') {
      editorTitleEl.textContent = 'School & CEEB';
      const section = getSection?.('School');
      const school = section?.params.find((param) => param[0] === 'High School')?.[1] || '';
      const gpa = section?.params.find((param) => param[0] === 'GPA')?.[1] || '';
      editorBodyEl.innerHTML = `
        <div class="form">
          <label>High School<input id="edHS" value="${escapeHtml(school)}" /></label>
          <label>CEEB<input id="edCEEB" placeholder="123456" /></label>
          <label>GPA<input id="edGPA" value="${escapeHtml(gpa)}" inputmode="decimal" /></label>
          <button id="edSaveSchool">Save</button>
        </div>`;
      document.getElementById('edSaveSchool')?.addEventListener('click', () => {
        setSectionParam?.('School', 'High School', document.getElementById('edHS')?.value || '', true);
        setSectionParam?.('School', 'GPA', document.getElementById('edGPA')?.value || '', true);
        window.setRoute?.('profile');
        window.renderProfileSummary?.();
      });
      return;
    }
    if (key === 'transcript') {
      editorTitleEl.textContent = 'Transcript / GPA';
      editorBodyEl.innerHTML = `
        <div class="form">
          <label>Upload transcript (OCR)
            <input type="file" id="edTranscript" accept="application/pdf,image/*" />
          </label>
          <div class="muted">Demo: OCR not implemented; pretend GPA parsed.</div>
          <button id="edParse">Parse & Fill</button>
        </div>`;
      document.getElementById('edParse')?.addEventListener('click', () => {
        setSectionParam?.('School', 'GPA', '3.9', true);
        window.setRoute?.('profile');
        window.renderProfileSummary?.();
      });
      return;
    }
    if (key === 'testing') {
      editorTitleEl.textContent = 'Testing';
      editorBodyEl.innerHTML = `
        <div class="form">
          <label>SAT (optional)<input id="edSAT" placeholder="1500" inputmode="numeric" /></label>
          <label>Self-report<input type="checkbox" id="edSelf" /></label>
          <button id="edSaveTesting">Save</button>
        </div>`;
      document.getElementById('edSaveTesting')?.addEventListener('click', () => {
        setSectionParam?.('Applications', 'Next', 'SAT submit planned', true);
        window.setRoute?.('profile');
        window.renderProfileSummary?.();
      });
      return;
    }
    if (key === 'recommenders') {
      editorTitleEl.textContent = 'Recommenders';
      editorBodyEl.innerHTML = `
        <div class="form">
          <div class="form inline">
            <input id="recName" placeholder="Name" />
            <input id="recEmail" placeholder="Email" inputmode="email" />
            <button id="recInvite">Invite</button>
          </div>
          <ul id="recList" class="list"></ul>
        </div>`;
      const list = document.getElementById('recList');
      document.getElementById('recInvite')?.addEventListener('click', () => {
        const name = document.getElementById('recName')?.value.trim();
        const email = document.getElementById('recEmail')?.value.trim();
        if (!name || !email) return;
        const item = document.createElement('li');
        item.textContent = `${name} · ${email} · invited`;
        list?.appendChild(item);
        setSectionParam?.('Recommenders', 'Teachers', '1', true);
      });
      return;
    }
    if (key === 'essays') {
      editorTitleEl.textContent = 'Essays';
      editorBodyEl.innerHTML = `
        <div class="form">
          <textarea id="essayText" rows="8" style="width:100%;" placeholder="Paste your draft..."></textarea>
          <div class="row" style="gap:8px;"><button id="essayAnalyze">AI analyze</button><span id="essayCount" class="muted"></span></div>
        </div>`;
      const textarea = document.getElementById('essayText');
      const counter = document.getElementById('essayCount');
      textarea?.addEventListener('input', () => {
        const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        if (counter) counter.textContent = `${words} words`;
      });
      document.getElementById('essayAnalyze')?.addEventListener('click', () => {
        window.speak?.('Your theme is coherent. Consider adding a concrete anecdote.');
      });
      return;
    }
    if (key === 'ferpa') {
      editorTitleEl.textContent = 'Permissions / FERPA';
      editorBodyEl.innerHTML = `
        <div class="form">
          <div class="muted">I waive my right to review recommendations.</div>
          <label><input type="checkbox" id="ferpaAgree" /> I agree</label>
          <button id="ferpaSign">Sign</button>
        </div>`;
      document.getElementById('ferpaSign')?.addEventListener('click', () => {
        window.speak?.('FERPA signed and archived.');
        window.setRoute?.('profile');
      });
      return;
    }
    editorTitleEl.textContent = 'Editor';
    editorBodyEl.textContent = 'Coming soon';
  }

  function openEditor(key) {
    window.setRoute?.('editor');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
    renderEditor(key);
    if (!editorBodyEl?.innerHTML) {
      editorTitleEl.textContent = 'Editor';
      editorBodyEl.textContent = 'Coming soon';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    btnBackProfileEl?.addEventListener('click', () => {
      window.setRoute?.('profile');
      stateRef.returnToProfileExpand = true;
    });
  });

  window.openEditor = openEditor;
  window.renderEditor = renderEditor;
})();
