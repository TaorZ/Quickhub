const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const CONFIG_FILE = 'shortcuts.json';

function getConfigPath() {
  const configDir = path.join(app.getPath('userData'), 'config');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return path.join(configDir, CONFIG_FILE);
}

function loadConfig() {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      shortcuts: [],
      settings: {
        hotkey: 'CommandOrControl+Space',
        miniHubWidth: 400,
        miniHubHeight: 300,
        theme: 'dark'
      }
    };
    saveConfig(defaultConfig);
    return defaultConfig;
  }

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar config:', error);
    return { shortcuts: [], settings: {} };
  }
}

function saveConfig(config) {
  const configPath = getConfigPath();

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar config:', error);
    return false;
  }
}

module.exports = { loadConfig, saveConfig, getConfigPath };
