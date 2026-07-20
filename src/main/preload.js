const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Shortcuts
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  saveShortcuts: (shortcuts) => ipcRenderer.invoke('save-shortcuts', shortcuts),
  openShortcut: (shortcut) => ipcRenderer.invoke('open-shortcut', shortcut),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  setStartWithWindows: (enable) => ipcRenderer.invoke('set-start-with-windows', enable),
  isStartWithWindows: () => ipcRenderer.invoke('is-start-with-windows'),
  
  // Browser controls
  browserGoBack: () => ipcRenderer.invoke('browser-go-back'),
  browserGoForward: () => ipcRenderer.invoke('browser-go-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),
  browserGoUrl: (url) => ipcRenderer.invoke('browser-go-url', url),
  browserClose: () => ipcRenderer.invoke('browser-close'),
  
  // Mini hub resize
  expandMiniHub: () => ipcRenderer.invoke('expand-mini-hub'),
  restoreMiniHub: () => ipcRenderer.invoke('restore-mini-hub'),
  
  // Open main hub
  openMainHub: () => ipcRenderer.invoke('open-main-hub'),
  
  // File dialogs
  pickFile: (type) => ipcRenderer.invoke('pick-file', type),
  pickIcon: () => ipcRenderer.invoke('pick-icon'),
  
  // Window controls
  closeWindow: () => ipcRenderer.invoke('close-window'),
  closeAll: () => ipcRenderer.invoke('close-all'),
  closeBrowserOnly: () => ipcRenderer.invoke('close-browser-only'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  openConfigWindow: () => ipcRenderer.invoke('open-config-window'),
  
  // Events
  onLoadShortcuts: (callback) => {
    ipcRenderer.on('load-shortcuts', (event, shortcuts) => callback(shortcuts));
  },
  onBrowserOpened: (callback) => {
    ipcRenderer.on('browser-opened', (event, url) => callback(url));
  },
  onBrowserClosed: (callback) => {
    ipcRenderer.on('browser-closed', () => callback());
  },
  onBrowserUrlChanged: (callback) => {
    ipcRenderer.on('browser-url-changed', (event, url) => callback(url));
  },
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
  },
  onOpenConfig: (callback) => {
    ipcRenderer.on('open-config', () => callback());
  },
  onShortcutsUpdated: (callback) => {
    ipcRenderer.on('shortcuts-updated', (event, shortcuts) => callback(shortcuts));
  }
});
