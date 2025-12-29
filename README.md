# PersonaBalance

PersonaBalance is a browser-based digital balance monitoring system.
It analyzes user interaction behaviors in a desktop-like interface
to determine the user's engagement state.

---

## Project Purpose

The purpose of this project is to increase user awareness of their
digital behavior by analyzing interaction patterns such as window usage
and activity frequency. Based on these patterns, the system visualizes
the user's current balance state.

---

## System Overview

PersonaBalance is implemented as a web-based desktop simulation using
HTML, CSS, and JavaScript. The system is designed to be platform
independent and runs entirely in the browser.

Planned core components:
- User Interface (Desktop-like UI)
- Activity Tracking Module
- Mode Calculation (Calm / Balanced / Aggressive)
- Balance Bar Visualization
- Local Data Storage (SQLite WASM – planned)

---

## Week 1 Status

During Week 1, the foundational user interface structure was designed
and implemented. A desktop-like layout was created, including a window
component representing the system status. User interface interaction
behaviors such as window positioning and visual structure were defined.
This stage focused on architectural planning rather than functional logic.

---

## Week 2 Status

During Week 2, the conceptual foundation of the balance evaluation logic
was prepared. Interaction intensity levels were defined and mapped to
user modes (Calm, Balanced, Aggressive). The user interface was updated
with placeholders to represent balance-related information, and the
planned data flow between activity tracking and mode calculation was
documented.

---

## Technology Stack

- HTML5 / CSS3 / JavaScript (Vanilla)
- SQLite WASM (@sqlite.org/sqlite-wasm) - Local data storage
- Vite - Development build tool
- AI API Support (OpenAI / HuggingFace) - Optional for advanced reports

---

## Notes

This project is developed as part of a team-based course assignment.
Each team member works on individual branches, and contributions are
merged via pull requests according to Scrum methodology.
## Development Progress

### Week 3
- Implemented user interaction tracking (mouse clicks, key presses, window focus)
- Added analysis cycle to calculate interaction intensity score
- Defined system modes (Calm, Balanced, Intense) based on interaction metrics
- Integrated developer console for real-time debug logging

### Week 4
- Implemented interaction history panel in the UI
- Integrated SQLite WASM for client-side data storage (memory-backed)
- Added data persistence logic within analysis cycles
- Prepared OPFS-based persistent storage architecture (disabled in development due to browser security constraints)

### Week 5 – UI Finalization & Interaction Persistence

In Week 5, I focused on finalizing the user interface and improving the overall usability of the PersonaBalance system. A desktop-style environment was implemented to simulate a Windows-like user experience, including a draggable application window, taskbar, and desktop icon interaction.

Key enhancements include enabling the application window to be closed and reopened via a desktop icon using a double-click mechanism, as well as persisting the window position using localStorage to maintain continuity across sessions. These features significantly improved user experience and realism of the interface.

Additionally, the interaction tracking, mode calculation, and history logging components were verified and stabilized to ensure the system is fully functional and ready for integration with higher-level analysis modules. The application is now in a finalized, demo-ready state with a polished UI and persistent behavior.

### Week 6 – Complete System Implementation

**All Features Completed:**

✅ **Balance Bar** - Visual indicator on the right side showing current balance state
- Real-time updates based on interaction intensity
- Color-coded fill (green for Calm, blue for Balanced, red for Aggressive)
- Vertical layout with mode label

✅ **Theme System** - Dynamic theme changes based on mode
- Calm Mode: Green/pastel gradient background
- Balanced Mode: Blue gradient background (default)
- Aggressive Mode: Red/orange gradient background
- Smooth transitions between themes

✅ **Window Management** - Complete desktop-like experience
- Multiple windows (System Status, Calculator, Google)
- Drag and drop functionality
- Window focus tracking
- Position persistence across sessions
- Active/inactive visual states

✅ **AI Report Generation** - Intelligent balance analysis
- Automatic report generation every 5 minutes
- Statistical analysis of interaction patterns
- Personalized recommendations
- Support for OpenAI and HuggingFace APIs (configurable)
- Simulated mode for demo/testing

✅ **Notification System** - Prolonged imbalance warnings
- Automatic alerts when user stays in Aggressive or Calm mode for extended periods
- Visual notifications with animations
- Context-aware messaging

✅ **Enhanced Interaction Tracking**
- Mouse click tracking (excluding UI controls)
- Keyboard input tracking (excluding modifier keys)
- Window focus change tracking
- Real-time counter updates

✅ **Data Persistence**
- SQLite WASM integration for local storage
- 30-second analysis cycles with automatic data recording
- History panel showing recent interactions
- Data reset functionality

## Features

### Core Features
- **Real-time Balance Monitoring**: Analyzes user interactions every 30 seconds
- **Three Balance Modes**: Calm, Balanced, and Aggressive based on interaction intensity
- **Visual Feedback**: Balance bar, theme changes, and mode indicators
- **Local Data Storage**: All data stored locally using SQLite WASM
- **AI-Powered Reports**: Intelligent analysis and recommendations
- **Smart Notifications**: Alerts for prolonged imbalance

### User Interface
- Desktop-like environment with multiple windows
- Draggable windows with position persistence
- Calculator and Google search windows (simulated)
- System status window with real-time metrics
- Developer console for debugging
- History panel for past interactions
- AI report display area

## Installation & Usage

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser to the URL shown in the terminal (usually http://localhost:5173)
   - Double-click the desktop icon to open the System Status window
   - Click "Analiz Başlat" to start monitoring
   - Interact with the interface (click, type, switch windows)
   - Watch the balance bar and theme change based on your activity

## AI API Configuration (Optional)

To use real AI APIs for report generation:

1. Create a `.env` file in the project root:
   ```
   VITE_OPENAI_API_KEY=your_openai_key_here
   # OR
   VITE_HUGGINGFACE_API_KEY=your_huggingface_key_here
   ```

2. Update `src/aiConfig.js`:
   ```javascript
   const AI_CONFIG = {
     mode: 'openai', // or 'huggingface'
     // ... rest of config
   };
   ```

By default, the system uses simulated AI reports which work without API keys.

## Project Structure

```
personabalance/
├── src/
│   ├── script.js          # Main application logic
│   ├── style.css          # Styling and themes
│   ├── sqliteClient.js    # SQLite WASM integration
│   └── aiConfig.js        # AI API configuration
├── index.html             # Main HTML structure
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## System Flow

1. User interacts with the desktop interface
2. System tracks mouse clicks, keyboard input, and window focus changes
3. Every 30 seconds, interaction intensity is calculated
4. Mode is determined (Calm/Balanced/Aggressive)
5. Theme and balance bar update accordingly
6. Data is saved to SQLite database
7. Every 5 minutes, AI generates a balance report
8. Notifications appear if imbalance persists

## Future Enhancements

- User rhythm graphs (weekly/daily balance visualization)
- Export functionality for reports
- Customizable thresholds for mode detection
- Additional window types and applications
- Sound notifications
- Browser extension version


