const { app, BrowserWindow, BrowserView, ipcMain, dialog, globalShortcut, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { createTray } = require('./tray');
const { loadConfig, saveConfig, getConfigPath } = require('./config');

// Fix para problemas de renderização em máquinas com GPU incompatível
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Otimizações de inicialização
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('no-first-run');

let mainWindow = null;
let miniHubWindow = null;
let configWindow = null;
let tray = null;
let browserView = null;
let browserParentWindow = null;

// Tamanho padrão do mini hub
const MINI_HUB_WIDTH = 400;
const MINI_HUB_HEIGHT = 300;
const MINI_HUB_EXPANDED_WIDTH = 800;
const MINI_HUB_EXPANDED_HEIGHT = 600;

// Altura dos headers (titlebar + navbar do browser)
const HEADER_HEIGHT_MAIN = 100;
const HEADER_HEIGHT_MINI = 96;

// Previne múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Configura o AppUserModelID para o Windows associar o ícone correto na barra de tarefas
if (process.platform === 'win32') {
  app.setAppUserModelId('com.quickhub.app');
}

// Função para obter o caminho correto do ícone (funciona tanto em dev quanto empacotado/asar)
function getAppIconPath() {
  const rootDir = app.getAppPath();
  const icoPath = path.join(rootDir, 'resources', 'icon.ico');
  if (fs.existsSync(icoPath)) {
    return icoPath;
  }
  const pngPath = path.join(rootDir, 'resources', 'icon.png');
  if (fs.existsSync(pngPath)) {
    return pngPath;
  }
  return path.join(__dirname, '..', '..', 'resources', 'icon.ico');
}

function getAppIcon() {
  const iconPath = getAppIconPath();
  const img = nativeImage.createFromPath(iconPath);
  if (img.isEmpty()) {
    console.error('Ícone não encontrado em:', iconPath);
  }
  return img;
}

const appIcon = getAppIcon();

// ===== HOTKEYS =====
function registerAllHotkeys() {
  globalShortcut.unregisterAll();
  
  const config = loadConfig();
  const hotkeyMini = config.settings?.hotkeyMini || 'CommandOrControl+Space';
  const hotkeyMain = config.settings?.hotkeyMain || 'CommandOrControl+Shift+Space';

  try {
    globalShortcut.register(hotkeyMini, () => toggleMiniHub());
    console.log(`Hotkey Mini Hub: ${hotkeyMini}`);
  } catch (error) {
    console.error(`Erro hotkey mini: ${error.message}`);
  }

  try {
    globalShortcut.register(hotkeyMain, () => toggleMainHub());
    console.log(`Hotkey Main Hub: ${hotkeyMain}`);
  } catch (error) {
    console.error(`Erro hotkey main: ${error.message}`);
  }
}

function toggleMainHub() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }

  if (mainWindow.isVisible()) {
    closeBrowser();
    mainWindow.hide();
  } else {
    closeBrowser();
    mainWindow.show();
    mainWindow.focus();
  }
}

function toggleMiniHub() {
  if (!miniHubWindow || miniHubWindow.isDestroyed()) {
    createMiniHubWindow();
  }

  if (miniHubWindow.isVisible()) {
    closeBrowser();
    miniHubWindow.hide();
  } else {
    const config = loadConfig();
    closeBrowser();
    miniHubWindow.webContents.send('load-shortcuts', config.shortcuts || []);
    miniHubWindow.webContents.send('browser-closed');
    miniHubWindow.setSize(MINI_HUB_WIDTH, MINI_HUB_HEIGHT);
    miniHubWindow.center();
    miniHubWindow.show();
    miniHubWindow.focus();
  }
}

// ===== WINDOWS =====
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 520,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    transparent: false,
    resizable: true,
    show: false,
    icon: appIcon,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      closeBrowser();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    if (browserView && browserParentWindow === mainWindow) {
      adjustBrowserBounds();
    }
  });

  return mainWindow;
}

function createMiniHubWindow() {
  miniHubWindow = new BrowserWindow({
    width: MINI_HUB_WIDTH,
    height: MINI_HUB_HEIGHT,
    frame: false,
    transparent: false,
    resizable: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: appIcon,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  miniHubWindow.loadFile(path.join(__dirname, '..', 'renderer', 'mini.html'));

  miniHubWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      closeBrowser();
      miniHubWindow.hide();
    }
  });

  miniHubWindow.on('closed', () => {
    miniHubWindow = null;
  });

  miniHubWindow.on('resize', () => {
    if (browserView && browserParentWindow === miniHubWindow) {
      adjustBrowserBounds();
    }
  });

  return miniHubWindow;
}

function createConfigWindow() {
  if (configWindow && !configWindow.isDestroyed()) {
    configWindow.focus();
    return configWindow;
  }

  configWindow = new BrowserWindow({
    width: 700,
    height: 600,
    frame: false,
    transparent: false,
    resizable: true,
    show: false,
    icon: appIcon,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  configWindow.loadFile(path.join(__dirname, '..', 'renderer', 'config.html'));

  configWindow.on('closed', () => {
    configWindow = null;
  });

  return configWindow;
}

// ===== BROWSER =====
function adjustBrowserBounds() {
  if (!browserView || !browserParentWindow) return;
  const [width, height] = browserParentWindow.getContentSize();
  const headerHeight = browserParentWindow === miniHubWindow ? HEADER_HEIGHT_MINI : HEADER_HEIGHT_MAIN;
  
  browserView.setBounds({ 
    x: 0, 
    y: headerHeight, 
    width: width, 
    height: Math.max(0, height - headerHeight) 
  });
}

function openInBrowser(url) {
  closeBrowser();

  // Determina qual janela está ativa
  if (miniHubWindow && !miniHubWindow.isDestroyed() && miniHubWindow.isVisible()) {
    browserParentWindow = miniHubWindow;
  } else if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
    browserParentWindow = mainWindow;
  } else {
    if (!miniHubWindow || miniHubWindow.isDestroyed()) {
      createMiniHubWindow();
    }
    browserParentWindow = miniHubWindow;
    browserParentWindow.show();
  }

  // Expande mini hub se necessário
  if (browserParentWindow === miniHubWindow) {
    miniHubWindow.setSize(MINI_HUB_EXPANDED_WIDTH, MINI_HUB_EXPANDED_HEIGHT);
    miniHubWindow.center();
  }

  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    }
  });

  // User agent do Chrome para evitar bloqueio/detecção do Electron
  browserView.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  browserParentWindow.setBrowserView(browserView);
  adjustBrowserBounds();
  browserView.webContents.loadURL(url);

  // Notifica o renderer
  browserParentWindow.webContents.send('browser-opened', url);

  // Intercepta novas janelas
  browserView.webContents.setWindowOpenHandler(({ url }) => {
    browserView.webContents.loadURL(url);
    if (browserParentWindow && !browserParentWindow.isDestroyed()) {
      browserParentWindow.webContents.send('browser-url-changed', url);
    }
    return { action: 'deny' };
  });

  // Atualiza URL na barra
  const updateUrl = (event, url) => {
    if (browserParentWindow && !browserParentWindow.isDestroyed()) {
      browserParentWindow.webContents.send('browser-url-changed', url);
    }
  };

  browserView.webContents.on('did-navigate', updateUrl);
  browserView.webContents.on('did-navigate-in-page', updateUrl);
}

function closeBrowser() {
  if (browserView) {
    try {
      if (browserParentWindow && !browserParentWindow.isDestroyed()) {
        browserParentWindow.removeBrowserView(browserView);
        browserParentWindow.webContents.send('browser-closed');
        
        // Restaura tamanho do mini hub
        if (browserParentWindow === miniHubWindow) {
          miniHubWindow.setSize(MINI_HUB_WIDTH, MINI_HUB_HEIGHT);
          miniHubWindow.center();
        }
      }
      browserView.webContents.destroy();
    } catch (e) {}
    browserView = null;
    browserParentWindow = null;
  }
}

// ===== IPC HANDLERS =====

ipcMain.handle('get-shortcuts', () => {
  const config = loadConfig();
  return config.shortcuts || [];
});

ipcMain.handle('save-shortcuts', (event, shortcuts) => {
  const config = loadConfig();
  config.shortcuts = shortcuts;
  saveConfig(config);

  // Broadcast shortcuts change to all windows
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('shortcuts-updated', shortcuts);
  }
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.webContents.send('shortcuts-updated', shortcuts);
  }

  return true;
});

ipcMain.handle('get-settings', () => {
  const config = loadConfig();
  return config.settings || {};
});

ipcMain.handle('save-settings', (event, settings) => {
  const config = loadConfig();
  config.settings = { ...config.settings, ...settings };
  saveConfig(config);
  registerAllHotkeys();
  
  // Broadcast theme change to all windows
  const theme = settings.theme || 'dark';
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('theme-changed', theme);
  }
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.webContents.send('theme-changed', theme);
  }
  
  return true;
});

function getStartupExePath() {
  if (process.env.PORTABLE_EXECUTABLE_FILE) {
    return process.env.PORTABLE_EXECUTABLE_FILE;
  }
  return app.getPath('exe');
}

function setStartupConfig(enable) {
  try {
    const exePath = getStartupExePath();
    const appName = 'QuickHub';
    
    // Configura via API do Electron
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: exePath
    });
    
    // Garante no Registro do Windows com aspas corretas no caminho
    if (process.platform === 'win32') {
      const { execSync } = require('child_process');
      const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
      
      if (enable) {
        execSync(`reg add "${regKey}" /v "${appName}" /t REG_SZ /d "\\"${exePath}\\"" /f`, { encoding: 'utf8' });
      } else {
        try {
          execSync(`reg delete "${regKey}" /v "${appName}" /f`, { encoding: 'utf8' });
        } catch (e) {}
      }
    }
    
    console.log(`Startup ${enable ? 'ativado' : 'desativado'} para: ${exePath}`);
    return true;
  } catch (error) {
    console.error('Erro ao configurar startup:', error.message);
    return false;
  }
}

ipcMain.handle('set-start-with-windows', (event, enable) => {
  return setStartupConfig(enable);
});

ipcMain.handle('is-start-with-windows', () => {
  try {
    const exePath = getStartupExePath();
    const loginSettings = app.getLoginItemSettings({ path: exePath });
    if (loginSettings.openAtLogin) return true;

    if (process.platform === 'win32') {
      const { execSync } = require('child_process');
      const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
      const result = execSync(`reg query "${regKey}" /v "QuickHub"`, { encoding: 'utf8' });
      return result.includes('QuickHub');
    }
    return false;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('open-shortcut', async (event, shortcut) => {
  try {
    switch (shortcut.type) {
      case 'url':
        openInBrowser(shortcut.path);
        return { success: true };
      case 'exe':
      case 'folder':
      case 'file':
        await shell.openPath(shortcut.path);
        // Fecha o mini hub quando abre pasta/arquivo/exe
        if (miniHubWindow && !miniHubWindow.isDestroyed() && miniHubWindow.isVisible()) {
          miniHubWindow.hide();
        }
        return { success: true };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Browser controls
ipcMain.handle('browser-go-back', () => {
  if (browserView && browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
  }
});

ipcMain.handle('browser-go-forward', () => {
  if (browserView && browserView.webContents.canGoForward()) {
    browserView.webContents.goForward();
  }
});

ipcMain.handle('browser-reload', () => {
  if (browserView) {
    browserView.webContents.reload();
  }
});

ipcMain.handle('browser-go-url', (event, url) => {
  if (browserView) {
    let finalUrl = url;
    if (!url.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + url;
    }
    browserView.webContents.loadURL(finalUrl);
  }
});

ipcMain.handle('browser-close', () => {
  closeBrowser();
});

// Mini hub resize
ipcMain.handle('expand-mini-hub', () => {
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.setSize(MINI_HUB_EXPANDED_WIDTH, MINI_HUB_EXPANDED_HEIGHT);
    miniHubWindow.center();
    if (browserView) adjustBrowserBounds();
  }
});

ipcMain.handle('restore-mini-hub', () => {
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.setSize(MINI_HUB_WIDTH, MINI_HUB_HEIGHT);
    miniHubWindow.center();
    if (browserView) adjustBrowserBounds();
  }
});

// Open main hub
ipcMain.handle('open-main-hub', () => {
  closeBrowser();
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }
  mainWindow.show();
  mainWindow.focus();
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.hide();
  }
});

// Close all - fecha tudo
ipcMain.handle('close-all', () => {
  closeBrowser();
  if (miniHubWindow && !miniHubWindow.isDestroyed()) {
    miniHubWindow.hide();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});

// File dialogs
ipcMain.handle('pick-file', async (event, type) => {
  const filters = {
    exe: [{ name: 'Executáveis', extensions: ['exe', 'bat', 'cmd'] }],
    file: [{ name: 'Todos os arquivos', extensions: ['*'] }],
    folder: []
  };

  const properties = type === 'folder' ? ['openDirectory'] : ['openFile'];

  const result = await dialog.showOpenDialog({
    properties,
    filters: filters[type] || []
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('pick-icon', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'ico', 'svg'] }
    ]
  });

  if (result.canceled) return null;

  const iconPath = result.filePaths[0];
  const iconsDir = path.join(__dirname, '..', 'renderer', 'assets', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const ext = path.extname(iconPath);
  const newName = `icon_${Date.now()}${ext}`;
  const destPath = path.join(iconsDir, newName);

  fs.copyFileSync(iconPath, destPath);
  return `assets/icons/${newName}`;
});

// Window controls
ipcMain.handle('close-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    closeBrowser();
    win.hide();
  }
});

// Close browser only (go back to hub home, keep window visible)
ipcMain.handle('close-browser-only', () => {
  closeBrowser();
});

ipcMain.handle('minimize-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.handle('open-config-window', () => {
  createConfigWindow();
  configWindow.show();
});

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();
  createMiniHubWindow();
  tray = createTray(mainWindow, toggleMiniHub, toggleMainHub, app);
  registerAllHotkeys();

  // Sincroniza configuração de inicialização com o registro se estiver ativada
  const config = loadConfig();
  if (config.settings && config.settings.startWithWindows) {
    setStartupConfig(true);
  }

  // Check if first run (no shortcuts configured)
  if (!config.shortcuts || config.shortcuts.length === 0) {
    // First run - show main hub for configuration
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  globalShortcut.unregisterAll();
});
