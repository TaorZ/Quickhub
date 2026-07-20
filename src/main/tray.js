const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;

function createTray(mainWindow, toggleMiniHub, toggleMainHub, app) {
  const basePath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', '..');
  const iconPath = path.join(basePath, 'resources', 'icon.png');
  
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

  tray = new Tray(icon.resize({ width: 16, height: 16 }));
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
