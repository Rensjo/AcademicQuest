import { useState, useEffect, useCallback } from 'react';

// Type definitions for Electron API
interface ElectronAPI {
  getSetting: (key: string) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<boolean>;
  saveFile: (data: unknown) => Promise<{ success: boolean; path?: string; error?: string; canceled?: boolean }>;
  loadFile: () => Promise<{ success: boolean; data?: unknown; error?: string; canceled?: boolean }>;
  getAppInfo: () => Promise<{
    version: string;
    platform: string;
    arch: string;
    electronVersion: string;
    nodeVersion: string;
  }>;
  onMenuAction: (callback: (action: string) => void) => void;
  removeMenuActionListener: () => void;
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

interface DesktopFeatures {
  showNotification: (title: string, body: string, options?: NotificationOptions) => Notification | null;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  storage: {
    setItem: (key: string, value: unknown) => boolean;
    getItem: (key: string) => unknown;
    removeItem: (key: string) => boolean;
  };
}

// Extend window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    desktopFeatures?: DesktopFeatures;
  }
}

export interface DesktopIntegration {
  isDesktop: boolean;
  platform: string | null;
  versions: { node?: string; chrome?: string; electron?: string } | null;
  
  // Settings management
  getSetting: (key: string) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<boolean>;
  
  // File operations
  exportData: (data: unknown) => Promise<{ success: boolean; path?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  
  // Native notifications
  showNativeNotification: (title: string, body: string) => void;
  
  // Menu integration
  onMenuAction: (callback: (action: string) => void) => void;
  
  // App information
  getAppInfo: () => Promise<unknown>;
}

export const useDesktopIntegration = (): DesktopIntegration => {
  const [isDesktop] = useState(() => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
  });

  const [platform] = useState(() => {
    return isDesktop ? window.electronAPI?.platform || null : null;
  });

  const [versions] = useState(() => {
    return isDesktop ? window.electronAPI?.versions || null : null;
  });

  // Settings management
  const getSetting = useCallback(async (key: string) => {
    if (!isDesktop || !window.electronAPI) {
      // Fallback to localStorage for web
      try {
        const item = localStorage.getItem(`aq_setting_${key}`);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }
    
    return window.electronAPI.getSetting(key);
  }, [isDesktop]);

  const setSetting = useCallback(async (key: string, value: unknown) => {
    if (!isDesktop || !window.electronAPI) {
      // Fallback to localStorage for web
      try {
        localStorage.setItem(`aq_setting_${key}`, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    
    return window.electronAPI.setSetting(key, value);
  }, [isDesktop]);

  // File operations
  const exportData = useCallback(async (data: unknown) => {
    if (!isDesktop || !window.electronAPI) {
      // Fallback: download as JSON file
      try {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `academicquest-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
    
    return window.electronAPI.saveFile(data);
  }, [isDesktop]);

  const importData = useCallback(async (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    if (!isDesktop || !window.electronAPI) {
      // Fallback: file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string);
                resolve({ success: true, data });
              } catch (error) {
                resolve({ success: false, error: (error as Error).message });
              }
            };
            reader.readAsText(file);
          } else {
            resolve({ success: false, error: 'No file selected' });
          }
        };
        input.click();
      });
    }
    
    return window.electronAPI.loadFile();
  }, [isDesktop]);

  // Native notifications
  const showNativeNotification = useCallback((title: string, body: string) => {
    if (isDesktop && window.desktopFeatures) {
      window.desktopFeatures.showNotification(title, body);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, [isDesktop]);

  // Menu integration
  const onMenuAction = useCallback((callback: (action: string) => void) => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.onMenuAction(callback);
    }
  }, [isDesktop]);

  // App information
  const getAppInfo = useCallback(async () => {
    if (!isDesktop || !window.electronAPI) {
      return {
        version: '1.0.0-web',
        platform: navigator.platform,
        userAgent: navigator.userAgent
      };
    }
    
    return window.electronAPI.getAppInfo();
  }, [isDesktop]);

  // Request notification permission on desktop
  useEffect(() => {
    if (isDesktop && window.desktopFeatures) {
      window.desktopFeatures.requestNotificationPermission();
    }
  }, [isDesktop]);

  return {
    isDesktop,
    platform,
    versions,
    getSetting,
    setSetting,
    exportData,
    importData,
    showNativeNotification,
    onMenuAction,
    getAppInfo
  };
};
