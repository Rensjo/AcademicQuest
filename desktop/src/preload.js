const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),

  // File operations
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  loadFile: () => ipcRenderer.invoke('load-file'),

  // App information
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  // Heavy aggregation (worker_thread)
  heavyAggregate: (payload) => ipcRenderer.invoke('heavy-aggregate', payload),

  // Menu actions listener
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },

  // Remove menu action listener
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  },

  // System information
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Desktop-specific features
contextBridge.exposeInMainWorld('desktopFeatures', {
  // Notification support (native OS notifications)
  showNotification: (title, body, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, { body, ...options });
    }
    return null;
  },

  // Request notification permission
  requestNotificationPermission: () => {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  },

  // Desktop-specific localStorage enhancement
  storage: {
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },
    getItem: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  }
});
