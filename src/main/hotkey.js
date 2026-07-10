const { globalShortcut } = require('electron');
const { loadConfig } = require('./config');

function registerHotkey(toggleMiniHub) {
  const config = loadConfig();
  const hotkey = config.settings?.hotkey || 'CommandOrControl+Space';

  try {
    globalShortcut.register(hotkey, () => {
      toggleMiniHub();
    });
    console.log(`Hotkey registrada: ${hotkey}`);
  } catch (error) {
    console.error(`Erro ao registrar hotkey ${hotkey}:`, error.message);
    
    // Tenta fallback
    try {
      globalShortcut.register('CommandOrControl+Shift+Space', () => {
        toggleMiniHub();
      });
      console.log('Hotkey fallback registrada: Ctrl+Shift+Space');
    } catch (e) {
      console.error('Erro ao registrar hotkey fallback:', e.message);
    }
  }
}

module.exports = { registerHotkey };
