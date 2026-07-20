const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;

function getTrayIconPath(app) {
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

function createTray(mainWindow, toggleMiniHub, toggleMainHub, app) {
  const iconPath = getTrayIconPath(app);
  console.log('Tray icon path:', iconPath);
  
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      console.error('Tray icon is empty');
      icon = nativeImage.createEmpty();
    }
  } catch (e) {
    console.error('Error loading tray icon:', e);
    icon = nativeImage.createEmpty();
  }

  const trayImage = (iconPath.endsWith('.ico') && !icon.isEmpty()) ? icon : icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayImage);
  tray.setToolTip('QuickHub - Hub de Acessos Rápidos');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Hub Principal',
      click: () => toggleMainHub()
    },
    {
      label: 'Mini Hub (Acesso Rápido)',
      click: () => toggleMiniHub()
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    toggleMainHub();
  });

  return tray;
}

module.exports = { createTray };
