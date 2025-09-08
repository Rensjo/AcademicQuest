# AcademicQuest Desktop

Transform your academic journey into an epic adventure with the desktop version of AcademicQuest.

## Features

- **Native Desktop Experience**: Full-featured desktop application built with Electron
- **Enhanced Performance**: Optimized for desktop with better resource management
- **Native Notifications**: OS-level notifications for achievements and reminders
- **Offline Capability**: Works without internet connection
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts
- **Menu Integration**: Native application menus for all platforms
- **Auto Updates**: Automatic updates for the latest features
- **Data Persistence**: Secure local data storage with backup/export options

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Development mode (requires web dev server running)
npm run dev

# Build web assets first
npm run build:web

# Build desktop application
npm run build
```

### Development Workflow

1. **Start the web development server** (in ../web folder):
   ```bash
   cd ../web
   npm run dev
   ```

2. **Start the desktop application** (in this folder):
   ```bash
   npm run dev
   ```

The desktop app will connect to the web dev server in development mode.

## Building for Production

### Build All Platforms
```bash
npm run dist
```

### Platform-Specific Builds
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Application Structure

```
desktop/
├── src/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for security
├── build/
│   ├── icon.ico         # Windows icon
│   ├── icon.icns        # macOS icon
│   └── icon.png         # Linux icon
├── dist/                # Built applications
└── package.json         # Desktop app configuration
```

## Key Features

### Native Integration
- **System Tray**: Minimize to system tray
- **Native Menus**: Platform-appropriate menu bars
- **File Associations**: Open AcademicQuest files directly
- **Deep Linking**: Handle academicquest:// URLs

### Enhanced Security
- **Context Isolation**: Secure communication between processes
- **No Node Integration**: Renderer process runs in sandbox
- **Preload Scripts**: Safe API exposure to web content

### Desktop-Specific Features
- **Window State Management**: Remember window position and size
- **Keyboard Shortcuts**: Global and application shortcuts
- **Native File Dialogs**: System file picker integration
- **Auto Updates**: Seamless application updates

## Menu Shortcuts

### File
- `Ctrl/Cmd + N` - New Task
- `Ctrl/Cmd + E` - Export Data
- `Ctrl/Cmd + ,` - Settings

### View
- `Ctrl/Cmd + 1` - Dashboard
- `Ctrl/Cmd + 2` - Tasks
- `Ctrl/Cmd + 3` - Academic Planner
- `Ctrl/Cmd + 4` - Schedule

### Academic
- `Ctrl/Cmd + Shift + C` - Add Course
- `Ctrl/Cmd + Shift + A` - Mark Attendance
- `Ctrl/Cmd + Shift + S` - Start Study Session
- `Ctrl/Cmd + G` - Gamification Panel

## Distribution

The desktop application supports:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG installer (.dmg)
- **Linux**: AppImage (.AppImage)

Built applications include:
- Auto-updater integration
- Code signing (for production)
- Proper platform conventions
- Native installer experience

## Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure preload script communication
- Web security enabled
- External links open in default browser

## Performance

- Efficient resource usage
- Background process management  
- Memory optimization
- Fast startup times
- Smooth animations and transitions
