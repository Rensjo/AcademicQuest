const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { Worker: NodeWorker, isMainThread } = require('worker_threads');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const windowStateKeeper = require('electron-window-state');

// Performance / stability switches for production-like optimization
// Hardware acceleration kept enabled for smooth GPU rendering
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
// Additional performance flags
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-hardware-overlays');
// Flags to help with ES module loading in file protocol
app.commandLine.appendSwitch('allow-file-access-from-files');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

// Log GPU info once for debugging
app.whenReady().then(() => {
  const { app: electronApp } = require('electron');
  console.log('[gpu] Hardware acceleration enabled:', !electronApp.commandLine.hasSwitch('disable-gpu'));
});

// Initialize electron store for settings persistence
const store = new Store();

class AcademicQuestApp {
  constructor() {
    this.mainWindow = null;
    this.isDevelopment = !app.isPackaged;
  this.bgWorker = null; // node worker thread for heavy ops
  this.gpuFallbackApplied = false;
    this.setupApp();
  }

  setupApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupIPC();
  this.safeCheckForUpdates();
    });

    // Handle window management
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });
  }

  safeCheckForUpdates() {
    if (this.isDevelopment) return; // skip in dev
    try {
      const fs = require('fs');
      const updateConfigPath = path.join(process.resourcesPath, 'app-update.yml');
      if (!fs.existsSync(updateConfigPath)) {
        console.log('[updates] app-update.yml not found – likely portable build; skipping auto-update check.');
        return;
      }
      autoUpdater.on('error', (e) => {
        console.warn('[updates] autoUpdater error:', e?.message || e);
      });
      autoUpdater.checkForUpdatesAndNotify().catch(e => {
        console.warn('[updates] checkForUpdatesAndNotify failed:', e?.message || e);
      });
    } catch (err) {
      console.warn('[updates] safeCheckForUpdates exception:', err?.message || err);
    }
  }

  createMainWindow() {
    // Manage window state
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1400,
      defaultHeight: 900
    });

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 1024,
      minHeight: 768,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      titleBarOverlay: process.platform === 'win32' ? {
        color: '#1e1e1e',
        symbolColor: '#ffffff'
      } : false,
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false, // Temporarily disable for file loading issues
        allowRunningInsecureContent: true, // Allow local content
        // Additional flags for ES module support
        experimentalFeatures: true,
        enableBlinkFeatures: 'CSSBackdropFilter',
        // Performance optimizations
        backgroundThrottling: false, // Prevent background throttling
        offscreen: false,
        spellcheck: false, // Disable spellcheck for performance
        enableWebSQL: false // Disable WebSQL for security and performance
      },
      show: false // Show window when ready to prevent visual flash
    });

    // Let windowStateKeeper manage window
    mainWindowState.manage(this.mainWindow);

    // Load the application
    this.loadApplication();

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // Performance monitoring and optimization
      console.log('🖥️ Desktop app window ready');
      
      // Preload critical resources and initialize performance monitoring after window is shown
      this.mainWindow.webContents.executeJavaScript(`
        console.log('🚀 Desktop optimizations loading...');
        
        // Auto-detect performance mode based on device capabilities
        const initPerformanceMode = () => {
          const cores = navigator.hardwareConcurrency || 4;
          const memory = navigator.deviceMemory || 8;
          const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          let performanceMode = 'high';
          if (cores <= 4 || memory <= 4) performanceMode = 'medium';
          if (cores <= 2 && memory <= 4) performanceMode = 'low';
          if (prefersReduced) performanceMode = 'low';
          
          console.log('[perf] Auto-detected mode:', performanceMode, { cores, memory, prefersReduced });
          
          // Store in localStorage for app to use
          localStorage.setItem('aq:auto-performance-mode', performanceMode);
          
          // Trigger performance mode evaluation if settings store is available
          setTimeout(() => {
            if (window.useSettings?.getState?.()?.evaluateAutoPerformance) {
              window.useSettings.getState().evaluateAutoPerformance();
            }
          }, 1000);
        };
        
        // Preload critical assets in background
        const preloadAssets = [
          './sounds/hover-button-sound.mp3',
          './sounds/single-mouse-button-click-351381.mp3',
          './sounds/task-complete-sound.mp3'
        ];
        
        preloadAssets.forEach((src, index) => {
          setTimeout(() => {
            try {
              const audio = new Audio(src);
              audio.preload = 'auto';
              audio.volume = 0.01;
              audio.load();
            } catch (e) {
              console.warn('Failed to preload:', src);
            }
          }, index * 100);
        });
        
        initPerformanceMode();
      `).catch(err => {
        console.warn('Failed to execute preload script:', err);
      });
      
      // Focus window and bring to front (skip auto DevTools in production)
      if (this.isDevelopment) {
        // Optional DevTools in development
        // this.mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
      this.mainWindow.webContents.executeJavaScript('navigator.userAgent')
        .then(ua => console.log('[gpu] userAgent:', ua))
        .catch(()=>{});
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
  if (this.bgWorker) { try { this.bgWorker.terminate(); } catch(_){} this.bgWorker = null; }
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Log child-process exits (diagnostic only, no auto relaunch loop to avoid black screen flicker)
    app.on('child-process-gone', (_event, details) => {
      if (details?.type === 'GPU') {
        console.warn('[diag] GPU process gone:', details);
      }
    });
  }

  loadApplication() {
    if (this.isDevelopment) {
      // Development: Load from Vite dev server
      console.log('[boot] loading dev server: http://localhost:5173');
      this.mainWindow.loadURL('http://localhost:5173')
        .catch(err => {
          console.error('[boot] dev server failed:', err);
          // Fallback to built files in dev too
          this.loadProductionFiles();
        });
    } else {
      this.loadProductionFiles();
    }
  }

  loadProductionFiles() {
    const webPath = path.join(process.resourcesPath, 'web', 'index.html');
    console.log('[boot] loading bundled UI:', webPath);
    
    // Check if file exists first
    const fs = require('fs');
    if (!fs.existsSync(webPath)) {
      console.warn('[boot] bundled UI not found, trying relative path');
      // Fallback for development/portable builds
      const relativePath = path.join(__dirname, '..', '..', 'web', 'dist', 'index.html');
      console.log('[boot] trying relative path:', relativePath);
      this.mainWindow.loadFile(relativePath).catch(err => {
        console.error('[boot] relative path also failed:', err);
        // Last resort - show error page
        this.showErrorPage();
      });
    } else {
      console.log('[boot] file exists, attempting to load...');
      
      // Add debugging for web contents
      this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('[boot] did-fail-load:', errorCode, errorDescription, validatedURL);
      });
      
      this.mainWindow.webContents.on('did-finish-load', () => {
        console.log('[boot] did-finish-load - page loaded successfully');
      });
      
      this.mainWindow.webContents.on('dom-ready', () => {
        console.log('[boot] dom-ready - DOM is ready');
      });
      
      this.mainWindow.loadFile(webPath).catch(err => {
        console.error('[boot] load error:', err);
        this.showErrorPage();
      });
    }
  }

  showErrorPage() {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>AcademicQuest - Error</title></head>
      <body style="font-family: Arial; padding: 20px; text-align: center;">
        <h1>AcademicQuest</h1>
        <p>Unable to load the application. Please try restarting.</p>
        <p>If the problem persists, reinstall the application.</p>
      </body>
      </html>
    `;
    this.mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
  }

  getAppIcon() {
    const iconPath = path.join(__dirname, '..', 'build');
    
    if (process.platform === 'win32') {
      return path.join(iconPath, 'AcademicQuest-Icon.ico');
    } else if (process.platform === 'darwin') {
      // Fallback to PNG if .icns doesn't exist
      const icnsPath = path.join(iconPath, 'AcademicQuest-Icon.icns');
      const pngPath = path.join(iconPath, 'AcademicQuest-Icon.png');
      const fs = require('fs');
      return fs.existsSync(icnsPath) ? icnsPath : pngPath;
    } else {
      return path.join(iconPath, 'AcademicQuest-Icon.png');
    }
  }

  setupMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Task',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'new-task');
            }
          },
          {
            label: 'Export Data',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.exportUserData();
            }
          },
          { type: 'separator' },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'open-settings');
            }
          },
          { type: 'separator' },
          process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'navigate-dashboard');
            }
          },
          {
            label: 'Tasks',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'navigate-tasks');
            }
          },
          {
            label: 'Academic Planner',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'navigate-planner');
            }
          },
          {
            label: 'Schedule',
            accelerator: 'CmdOrCtrl+4',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'navigate-schedule');
            }
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Academic',
        submenu: [
          {
            label: 'Add Course',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'add-course');
            }
          },
          {
            label: 'Mark Attendance',
            accelerator: 'CmdOrCtrl+Shift+A',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'mark-attendance');
            }
          },
          {
            label: 'Start Study Session',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'start-study');
            }
          },
          { type: 'separator' },
          {
            label: 'Gamification Panel',
            accelerator: 'CmdOrCtrl+G',
            click: () => {
              this.mainWindow.webContents.send('menu-action', 'open-gamification');
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(process.platform === 'darwin' ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [
            { role: 'close' }
          ])
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About AcademicQuest',
            click: () => {
              this.showAboutDialog();
            }
          },
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://academicquest.app');
            }
          },
          { type: 'separator' },
          {
            label: 'Report Bug',
            click: () => {
              shell.openExternal('https://github.com/Rensjo/AcademicQuest/issues');
            }
          },
          {
            label: 'Feature Request',
            click: () => {
              shell.openExternal('https://github.com/Rensjo/AcademicQuest/discussions');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // Handle settings
    ipcMain.handle('get-setting', (event, key) => {
      return store.get(key);
    });

    ipcMain.handle('set-setting', (event, key, value) => {
      store.set(key, value);
      return true;
    });

    // Handle file operations
    ipcMain.handle('save-file', async (event, data) => {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        defaultPath: 'academicquest-data.json',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled) {
        const fs = require('fs').promises;
        try {
          await fs.writeFile(result.filePath, JSON.stringify(data, null, 2));
          return { success: true, path: result.filePath };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      return { success: false, canceled: true };
    });

    ipcMain.handle('load-file', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const fs = require('fs').promises;
        try {
          const data = await fs.readFile(result.filePaths[0], 'utf8');
          return { success: true, data: JSON.parse(data) };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      return { success: false, canceled: true };
    });

    // Handle app info
    ipcMain.handle('get-app-info', () => {
      return {
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        workerThread: !!this.bgWorker
      };
    });

    // Lazy init background worker when first heavy request arrives
    const ensureWorker = () => {
      if (this.bgWorker) return;
      try {
        const workerPath = path.join(__dirname, 'workers', 'bgWorker.js');
        this.bgWorker = new NodeWorker(workerPath);
        this.bgWorker.on('message', (msg) => {
          if (!msg || !this.mainWindow) return;
          // Forward to renderer with channel prefix
          this.mainWindow.webContents.send('bg-worker-message', msg);
        });
        this.bgWorker.on('error', (err) => {
          if (this.mainWindow) this.mainWindow.webContents.send('bg-worker-error', err.message || String(err));
        });
      } catch (err) {
        console.warn('[bgWorker] init failed', err);
      }
    };

    // IPC channel to request heavy aggregate
    ipcMain.handle('heavy-aggregate', async (_event, payload) => {
      ensureWorker();
      if (!this.bgWorker) return { success: false, error: 'worker_init_failed' };
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve({ success: false, error: 'timeout' }), 15000);
        const handler = (msg) => {
          if (msg?.type === 'heavyAggregateResult') {
            clearTimeout(timeout);
            this.bgWorker?.off('message', handler);
            resolve({ success: true, data: msg.payload });
          }
        };
        this.bgWorker.on('message', handler);
        try {
          this.bgWorker.postMessage({ type: 'heavyAggregate', payload });
        } catch (err) {
          this.bgWorker.off('message', handler);
          clearTimeout(timeout);
          resolve({ success: false, error: err.message || String(err) });
        }
      });
    });
  }

  async exportUserData() {
    // Send message to web app to prepare data for export
    this.mainWindow.webContents.send('menu-action', 'export-data');
  }

  showAboutDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'About AcademicQuest',
      message: 'AcademicQuest Desktop',
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}\n\nTransform your academic journey into an epic adventure with comprehensive task management, gamification, and progress tracking.`,
      buttons: ['OK']
    });
  }
}

// Create application instance
new AcademicQuestApp();

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('http://localhost')) {
    // Ignore certificate errors for localhost in development
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
