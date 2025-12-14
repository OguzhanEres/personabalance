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

- HTML5
- CSS3
- JavaScript (Vanilla)

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

