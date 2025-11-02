# SuperOS for Students

A web-based prototype for SuperOS for Students, featuring AI-powered academic planning, personalized roadmap generation, and interactive student guidance tools.

## Project Overview

This is a mobile-first web application prototype that helps students plan their academic journey with AI assistance. The application includes features for profile management, major selection, gap analysis, personalized roadmap generation, and an interactive AI tutor.

## Directory Structure

```
V1.0/
  demo/                     # Main application code
    component/              # Reusable UI components
      capstone.html         # Capstone project component
      component.html        # Base component template
      conversation_component.html  # Chat/conversation UI
      taskslist.html        # Tasks list component
    js/                     # JavaScript modules
      state.js              # Global state management
      utils.js              # Utility functions
      sections.js           # Section templates and loading
      router.js             # Routing logic
      auth.js               # Authentication module
      profile.js            # Profile management
      gap.js                # Gap analysis
      persona.js            # Persona rendering
      advisor.js            # Major advisor module
      roadmap.js            # Roadmap generation
      tutor.js              # AI tutor interactions
      voice.js              # Voice recognition
      editor.js             # Content editor
      subtitle.js           # Subtitle display
      router-agent.js       # Router agent logic
    router/                 # Route definitions
      router.html           # Main router configuration
    sections/               # View sections
      view-advisor.html     # Advisor view
      view-auth.html        # Authentication view
      view-gap.html         # Gap analysis view
      view-persona.html     # Persona view
      view-profile.html     # Profile view
      view-roadmap.html     # Roadmap view
    index.html              # Main entry point
    app.js                  # Main application logic
    styles.css              # Application styles
    roadmap_content.json    # Roadmap content data
    CODE_SPLIT_GUIDE.md     # Code organization guide
  README.md                 # This file
```

## Technology Stack

- **Frontend**: Pure HTML/CSS/JavaScript (vanilla JS, no framework)
- **Architecture**: Modular JavaScript with separation of concerns
- **Styling**: Custom CSS with mobile-first responsive design
- **State Management**: Global state object pattern
- **Routing**: Custom router implementation

## Key Features

### Core Modules

1. **Authentication** (`js/auth.js`)
   - Google Sign-In integration
   - Email verification code login
   - Email/password authentication

2. **Onboarding Flow** (`app.js`)
   - Multi-step guided setup
   - Voice input support
   - Profile initialization

3. **Profile Management** (`js/profile.js`)
   - Student profile editing
   - Section-based data organization
   - Token-based content editing

4. **Gap Analysis** (`js/gap.js`)
   - Visual radar charts
   - Skill assessment
   - Gap identification

5. **Persona System** (`js/persona.js`)
   - Student persona generation
   - Alignment point tracking
   - Development plan visualization

6. **Major Advisor** (`js/advisor.js`)
   - Major comparison tool
   - Fit analysis
   - Selection recommendations

7. **Roadmap Generator** (`js/roadmap.js`)
   - Personalized academic roadmaps
   - Timeline visualization
   - Achievement system
   - Gamification elements (plants, quests)

8. **AI Tutor** (`js/tutor.js`)
   - Interactive conversations
   - Voice synthesis
   - Real-time subtitles
   - Action suggestions

9. **Voice Recognition** (`js/voice.js`)
   - Speech-to-text input
   - Voice commands
   - Profile editing via voice

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Running the Application

1. **Using a local server** (recommended):
   ```bash
   # Using Python 3
   cd demo
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server demo -p 8000
   
   # Or using PHP
   php -S localhost:8000 -t demo
   ```

2. **Open in browser**:
   Navigate to `http://localhost:8000` in your web browser

3. **Direct file access**:
   Open `demo/index.html` directly in your browser (some features may not work due to CORS restrictions)

## Code Organization

The application follows a modular architecture with clear separation of concerns:

- **State Management**: Global `state` object managed in `js/state.js`
- **Utilities**: Shared helper functions in `js/utils.js`
- **Routing**: Route definitions and navigation in `js/router.js`
- **Views**: HTML templates loaded dynamically via `js/sections.js`
- **Modules**: Feature-specific logic in dedicated JS files

For detailed information about code structure and module organization, see `demo/CODE_SPLIT_GUIDE.md`.

## Module Loading Order

Scripts must be loaded in the following order (defined in `index.html`):

1. `js/state.js` - State management (loads first)
2. `js/utils.js` - Utility functions
3. `js/sections.js` - Section templates
4. `js/router.js` - Routing logic
5. `js/auth.js` - Authentication module
6. `app.js` - Main application logic

## Development Notes

- All modules share the global `state` object
- All modules share the global `views` object (defined in `sections.js`)
- Function dependencies are handled through global scope
- Ensure correct module loading order to avoid dependency errors

## Future Roadmap

This prototype can serve as a foundation for:
- Mobile app development (React Native, Flutter, or Web RNW)
- Backend service integration
- Real AI/LLM integration
- Database persistence
- User authentication backend
- Payment and notification systems

## License

[Specify license if applicable]
