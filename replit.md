# Qdelícia Frutas - Promoter Alert System

## Overview
This is a Portuguese web application for Qdelícia Frutas, serving as a daily alert and task management system for fruit promoters. The application provides:
- Secure login system with time restrictions (06:00 - 15:20)
- Daily task alerts with multi-platform notifications (browser pop-ups, sound, voice synthesis, and in-app modals)
- Visual countdown timers for upcoming tasks
- Session management with automatic midnight expiration
- Task tracking with "ignore/check" functionality

## Project Architecture

### Technology Stack
- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript
- **Server**: Python 3.11 with built-in HTTP server
- **No Build System**: Static files served directly
- **No Backend Database**: Uses browser localStorage for session management

### File Structure
```
├── index.html          # Main dashboard page
├── login.html          # Login page
├── login.js            # Login logic and user database
├── script.js           # Main page functionality and countdown timers
├── alert.js            # Alert scheduling and notification system
├── style.css           # All application styles
├── server.py           # Simple HTTP server for serving static files
├── camera.html         # Camera functionality page
├── camera.js           # Camera page logic
├── relatorio.html      # Report/Quality page
├── relatorio.js        # Report page logic
├── estoque.html        # Stock page
├── caixas.html         # Boxes page
├── avarias.html        # Damages page
├── vendas.html         # Sales page
├── js/                 # Shared JavaScript modules
│   ├── data.js         # Centralized data (promoters, networks, stores)
│   └── shared.js       # Shared functions (session, menu, logout)
├── images/             # Logo and carousel images
└── sounds/             # Alert sound (alert.mp3)
```

### Modular Architecture
The application uses a modular JavaScript architecture for code reuse:

**js/data.js** - Centralized data module exposing `QdeliciaData`:
- `PROMOTORES_DATA`: All promoter data organized by state
- `PHOTO_TYPES`: Photo type options for camera page
- `RELATORIO_DATA`: Report options (motivos, produtos)
- `getAppData()`: Returns promoter-rede-loja mapping
- `getPromotorRedes(nome)`: Get redes for a specific promoter
- `getAllPromotores()`: Get all promoters as array

**js/shared.js** - Shared functions exposing `QdeliciaShared`:
- `checkSession()`: Validates login session, redirects if invalid
- `initMenu(activePage)`: Initializes hamburger menu with correct active state
- `initBackToTop()`: Initializes back-to-top button functionality
- `logout()`: Handles user logout and session cleanup

**Script Loading Order** (IMPORTANT):
For pages using centralized data, scripts must load in this order:
1. `js/data.js` - Must be first (defines QdeliciaData)
2. `js/shared.js` - Depends on QdeliciaData
3. Page-specific scripts (camera.js, relatorio.js, etc.)

### Key Features
1. **Time-Restricted Login**: Only allows login between 06:00 - 15:20
2. **Session Expiration**: Automatically logs out users at midnight
3. **Multi-Platform Alerts**: 
   - Native browser notifications
   - Sound alerts (MP3)
   - Voice synthesis (Portuguese)
   - In-app modal pop-ups
4. **Task Management**: Daily tasks defined in `DAILY_TASKS` array in alert.js
5. **Responsive Design**: Mobile-first approach with hamburger menu

## Configuration

### Adding/Removing Promoters
Edit the `APP_DATA_FULL` constant in `login.js`:
```javascript
const APP_DATA_FULL = {
    "Rio Grande do Norte": {
        "Miqueias": { id: "RN1001", redes: { ... } },
        // Add more promoters here
    },
    "Paraíba": {
        "João": { id: "PB2001", redes: { ... } }
    }
};
```

### Managing Daily Tasks
Edit the `DAILY_TASKS` array in `alert.js`:
```javascript
const DAILY_TASKS = [
    { 
        time: "HH:MM", 
        message: "Alert message", 
        tag: "unique_id", 
        label: "Display label" 
    }
];
```

## Development Setup

### Running Locally
The application runs on port 5000 using a Python HTTP server:
```bash
python3 server.py
```

### Cache Control
The server is configured with `Cache-Control: no-cache` headers to ensure updates are visible immediately in the Replit preview iframe.

## Deployment
Configured as a static site deployment:
- No build process required
- Serves files directly from root directory
- Uses Python HTTP server in production

## Recent Changes
- **2025-11-26**: Modular Architecture Refactoring
  - Created js/data.js with centralized promoter/network/store data
  - Created js/shared.js with common functions (checkSession, initMenu, initBackToTop, logout)
  - Refactored camera.js and relatorio.js to use QdeliciaData directly (removed duplicate helper functions)
  - Fixed script loading order in all HTML pages (data.js before shared.js)
  - Updated all 7 HTML pages to use shared modules
  - Eliminated code duplication across pages for menu handling, session management, and data access
  
- **2025-11-26**: Initial Replit environment setup
  - Added Python 3.11 HTTP server for serving static files
  - Configured workflow to run on port 5000 with webview output
  - Added cache control headers for proper preview functionality
  - Created .gitignore for Python artifacts
  - Set up deployment configuration for static site

## User Preferences
None documented yet.

## Notes
- The application is entirely in Portuguese (pt-BR)
- Uses localStorage for session and task tracking
- Requires notification permissions for browser alerts
- Alert times in `alert.js` are currently set to test times (22:31-22:34) - should be updated for production use
