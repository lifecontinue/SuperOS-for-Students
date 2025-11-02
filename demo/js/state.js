// Global state (mock)
const state = {
  route: 'auth', // 'auth' | 'onboarding' | 'profile' | 'advisor' | 'roadmap'
  session: null,
  profile: { name: '', email: '', background: '', interests: [], targetMajors: [], targetSchools: [], learningStyle: '' },
  personaEnabled: false,
  gap: null,
  majors: [
    { id: 'cs', name: 'Computer Science', highlights: ['AI/ML', 'Systems', 'High demand'], load: 'Theory + Practice', fit: 'Strong logic & coding interest' },
    { id: 'econ', name: 'Economics', highlights: ['Micro/Macro', 'Data analysis'], load: 'Good math foundation', fit: 'Macro view with data' },
    { id: 'bio', name: 'Biology', highlights: ['Bio systems', 'Lab work'], load: 'Lab intensive', fit: 'Love life sciences' },
  ],
  goals: [],
  roadmap: { near: [], mid: [], far: [] },
  voiceEnabled: false,
  voicePrimed: false,
  preferredLanguage: 'en', // 'en' for English, 'zh' for Chinese
  profileSections: [
    { key: 'Identity', badge: 'I', params: [ ['Name',''], ['DOB',''], ['Country',''] ] },
    { key: 'School', badge: 'S', params: [ ['High School',''], ['GPA','3.8'] ], meta: 'sent' },
    { key: 'Intended Major', badge: 'I', params: [ ['Majors','CS, Data Science'] ] },
    { key: 'Activities', badge: 'A', params: [ ['Top','Debate Club'], ['Count','3'] ] },
    { key: 'Essays', badge: 'E', params: [ ['Personal Essay','1 draft'] ], meta: 'draft' },
    { key: 'Recommenders', badge: 'R', params: [ ['Counselor','sent'], ['Teachers','2'] ] },
    { key: 'Applications', badge: 'A', params: [ ['Applied','3/20'], ['Next','11/01'] ], meta: '11/01' },
  ],
  onboardingIndex: 0,
  suggestions: [],
  persona: { traits: [] },
  selectedMajors: [],
  unlockedTabs: [],
  inputMode: 'voice',
  voiceRecognitionStarted: false,
  updatedAt: {},
  consecutiveDays: 0,
  lastActivityDate: new Date().toDateString(),
  achievements: [],
  plants: [],
  plantStages: ['sprout', 'seedling', 'flowering', 'fruiting'],
  questProgress: {
    tests: 0,
    recommenders: 0,
    essays: 0,
    portfolio: 0,
    applications: 0
  },
  spriteCelebrated: false,
  onboardingComplete: false,
  routerAgent: {
    lastCheckIn: null,
    lastCheckInDate: null,
    activityHistory: [],
    moduleAccessCounts: {},
    gpaHistory: [],
    dailyRecommendations: [],
    location: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
};

// Initialize personas array and current persona index
state.personas = state.personas || [
  {
    id: 'persona1',
    title: 'Persona 1: Biomedical Aesthetic Engineer',
    narrative: {
      core: 'A future engineer who views biology as a medium for art, elegance, and identity.',
      highlight: 'The Beauty of Optional Future',
      description: 'Ten years of dance experience is not just an extracurricular activity, but the primary way to explore human kinesiology, aesthetics, and potential.',
      question: 'How can we design biological solutions, from cell regeneration to advanced prosthetics, that are both practical, elegant, and expressive?'
    },
    highlights: [
      { icon: '💃', label: 'Position Change Connection', active: true, description: 'Integrating diverse perspectives through movement and transition' },
      { icon: '⚙️', label: 'STEAM', active: false, description: 'Science, Technology, Engineering, Arts, and Mathematics synergy' },
      { icon: '💡', label: 'Creative Plus', active: false, description: 'Innovative thinking combined with practical execution' }
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
  },
  {
    id: 'persona2',
    title: 'Persona 2: Data-Driven Social Innovator',
    narrative: {
      core: 'A student who combines analytical thinking with social impact, using data to solve real-world problems.',
      highlight: 'Numbers That Tell Human Stories',
      description: 'Passion for economics and social justice drives a unique approach to understanding communities through quantitative analysis.',
      question: 'How can we leverage data science to create meaningful change in education, healthcare, and social equity?'
    },
    highlights: [
      { icon: '📊', label: 'Data Storytelling', active: true, description: 'Transform numbers into compelling narratives that drive action' },
      { icon: '🌍', label: 'Social Impact', active: false, description: 'Use analytics to address real-world challenges and inequalities' },
      { icon: '🤝', label: 'Community Building', active: false, description: 'Foster collaboration and collective problem-solving' }
    ],
    alignmentPoints: [
      { icon: '📈', text: 'Analytical Foundation' },
      { icon: '💬', text: 'Communication Skills' },
      { icon: '🎯', text: 'Goal-Oriented' },
      { icon: '🌟', text: 'Leadership Potential' },
      { icon: '💡', text: 'Innovation Mindset' }
    ],
    developmentPlan: [
      { icon: '📚', label: 'Foundation: Education', stage: 'education' },
      { icon: '🏢', label: 'Middle: Experience', stage: 'experience' },
      { icon: '🚀', label: 'Long-term: Impact', stage: 'impact' }
    ],
    traits: []
  },
  {
    id: 'persona3',
    title: 'Persona 3: Creative Technologist',
    narrative: {
      core: 'An artist who sees technology as a canvas for creative expression and innovation.',
      highlight: 'Code As Art, Art As Code',
      description: 'Combining programming skills with artistic vision to create interactive experiences that bridge digital and physical worlds.',
      question: 'How can we use emerging technologies to create art that is both technically impressive and emotionally resonant?'
    },
    highlights: [
      { icon: '🎨', label: 'Creative Vision', active: true, description: 'Blend artistic sensibility with technical innovation' },
      { icon: '💻', label: 'Technical Skills', active: false, description: 'Master cutting-edge tools and programming languages' },
      { icon: '🔮', label: 'Future Thinking', active: false, description: 'Anticipate trends and shape tomorrow\'s digital landscape' }
    ],
    alignmentPoints: [
      { icon: '🎭', text: 'Artistic Expression' },
      { icon: '⚡', text: 'Tech Innovation' },
      { icon: '🌈', text: 'Multidisciplinary' },
      { icon: '🚀', text: 'Experimental' },
      { icon: '✨', text: 'Visionary' }
    ],
    developmentPlan: [
      { icon: '🎓', label: 'Foundation: Learning', stage: 'learning' },
      { icon: '🔨', label: 'Middle: Building', stage: 'building' },
      { icon: '🌐', label: 'Long-term: Influence', stage: 'influence' }
    ],
    traits: []
  }
];

// Current persona index (default to first persona)
state.currentPersonaIndex = state.currentPersonaIndex !== undefined ? state.currentPersonaIndex : 0;

// Backward compatibility: set state.persona to current persona
state.persona = state.personas[state.currentPersonaIndex];

// Extend majors with inspirations examples
state.majors = state.majors.map(m=> ({
  ...m,
  inspirations: [
    { name: 'Rachel', path: 'HS → CS club → Research → CS@Top10' },
    { name: 'Leo', path: 'Math team → Hackathon → Startup intern' },
  ]
}));

