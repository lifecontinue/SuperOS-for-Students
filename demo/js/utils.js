// Utility functions

function markUpdated(sectionKey){
  state.updatedAt[sectionKey] = new Date().toISOString().slice(0,10);
}

function getSectionStatus(sectionKey){
  const sec = getSection(titleMap(sectionKey));
  const updated = state.updatedAt[sectionKey];
  const empty = !sec || !sec.params || sec.params.every(p=>!p[1] || p[1]==='—');
  if (empty) return { label: 'empty', cls: 'status-empty' };
  // naive risk: GPA < 3.0 or missing counselor, etc.
  if (sectionKey==='transcript') {
    const gpa = (sec.params.find(p=>p[0]==='GPA')||['',''])[1];
    const num = parseFloat(gpa);
    if (!isNaN(num) && num < 3.0) return { label: 'risk', cls: 'status-risk' };
  }
  return { label: updated? `updated ${updated}` : 'pending', cls: updated? 'status-updated' : 'status-pending' };
}

function titleMap(sectionKey){
  return {
    identity:'Identity', school:'School', transcript:'School', activities:'Activities', testing:'Applications', recommenders:'Recommenders', essays:'Essays', ferpa:'Permissions / FERPA'
  }[sectionKey] || sectionKey;
}

function sectionSummary(sectionKey){
  const secKey = titleMap(sectionKey);
  const sec = getSection(secKey);
  if (!sec) return 'No data yet.';
  const pick = (k)=> (sec.params.find(p=>p[0]===k)||['',''])[1] || '—';
  switch(sectionKey){
    case 'identity': return `Name: ${pick('Name')} · DOB: ${pick('DOB')} · Email: ${state.profile.email||'—'}`;
    case 'school': return `School: ${pick('High School')} · GPA: ${pick('GPA')}`;
    case 'transcript': return `GPA: ${pick('GPA')} · Courses: (via OCR later)`;
    case 'activities': return `Top: ${pick('Top')} · Count: ${pick('Count')}`;
    case 'testing': return `Next: ${getSection('Applications')?.params.find(p=>p[0]==='Next')?.[1] || '—'}`;
    case 'recommenders': return `Counselor: ${pick('Counselor')} · Teachers: ${pick('Teachers')}`;
    case 'essays': return `Personal Essay: ${getSection('Essays')?.params.find(p=>p[0]==='Personal Essay')?.[1] || '—'}`;
    case 'ferpa': return `FERPA: ${state.ferpaSigned? 'signed' : 'not signed'}`;
    default: return '—';
  }
}

function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function titleCase(s){ return s.replace(/\b\w/g, c=>c.toUpperCase()); }

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
  markUpdated(sectionKey);
}

