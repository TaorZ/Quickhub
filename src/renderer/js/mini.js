// Mini Hub
class MiniHub {
  constructor() {
    this.shortcuts = [];
    this.container = document.getElementById('mini-shortcuts');
    this.browserOpen = false;
    
    this.init();
  }

  async init() {
    this.shortcuts = await window.electronAPI.getShortcuts();
    const settings = await window.electronAPI.getSettings();
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quickhub-theme', theme);
    
    this.render();
    this.setupEvents();
    this.setupBrowser();
  }

  setupEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.electronAPI.closeAll();
      }
    });

    // Botão fechar
    document.getElementById('btn-close').addEventListener('click', () => {
      window.electronAPI.closeAll();
    });

    document.getElementById('btn-expand').addEventListener('click', () => {
      window.electronAPI.closeAll();
      window.electronAPI.openMainHub();
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      window.electronAPI.closeAll();
      window.electronAPI.openConfigWindow();
    });

    window.electronAPI.onLoadShortcuts((shortcuts) => {
      this.shortcuts = shortcuts;
      this.render();
    });

    window.electronAPI.onBrowserOpened((url) => {
      this.showBrowser(url);
    });

    window.electronAPI.onThemeChanged((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('quickhub-theme', theme);
    });

    window.electronAPI.onBrowserClosed(() => {
      this.hideBrowser();
    });

    window.electronAPI.onBrowserUrlChanged((url) => {
      document.getElementById('browser-url').value = url;
    });
  }

  // ===== BROWSER =====
  setupBrowser() {
    document.getElementById('browser-back').addEventListener('click', () => {
      window.electronAPI.browserGoBack();
    });

    document.getElementById('browser-forward').addEventListener('click', () => {
      window.electronAPI.browserGoForward();
    });

    document.getElementById('browser-reload').addEventListener('click', () => {
      window.electronAPI.browserReload();
    });

    document.getElementById('browser-external').addEventListener('click', () => {
      const url = document.getElementById('browser-url').value;
      if (url) window.electronAPI.openExternal(url);
    });

    document.getElementById('browser-close-btn').addEventListener('click', () => {
      window.electronAPI.closeAll();
    });

    document.getElementById('browser-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let url = e.target.value.trim();
        if (url) {
          if (!url.match(/^https?:\/\//i)) url = 'https://' + url;
          window.electronAPI.browserGoUrl(url);
        }
      }
    });
  }

  showBrowser(url) {
    this.browserOpen = true;
    document.getElementById('browser-navbar').style.display = 'flex';
    document.getElementById('browser-url').value = url;
    document.getElementById('mini-shortcuts').style.display = 'none';
  }

  hideBrowser() {
    this.browserOpen = false;
    document.getElementById('browser-navbar').style.display = 'none';
    document.getElementById('mini-shortcuts').style.display = 'block';
  }

  // ===== RENDER =====
  render() {
    if (this.shortcuts.length === 0) {
      this.container.innerHTML = '<div class="mini-empty"><p>Nenhum acesso configurado</p></div>';
      return;
    }

    const groups = this.groupByCategory(this.shortcuts);
    this.container.innerHTML = '';

    for (const [category, items] of Object.entries(groups)) {
      if (category !== 'Sem Categoria') {
        const header = document.createElement('div');
        header.className = 'mini-category-header';
        header.textContent = category;
        this.container.appendChild(header);
      }

      items.forEach(shortcut => {
        const el = this.createItem(shortcut);
        this.container.appendChild(el);
      });
    }
  }

  groupByCategory(shortcuts) {
    const groups = {};
    shortcuts.forEach(s => {
      const cat = s.category || 'Sem Categoria';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    
    const sorted = {};
    Object.keys(groups).sort((a, b) => {
      if (a === 'Sem Categoria') return 1;
      if (b === 'Sem Categoria') return -1;
      return a.localeCompare(b);
    }).forEach(k => sorted[k] = groups[k]);
    
    return sorted;
  }

  createItem(shortcut) {
    const icon = this.getIcon(shortcut);
    const div = document.createElement('div');
    div.className = 'mini-shortcut-item';
    div.dataset.id = shortcut.id;
    div.innerHTML = `
      <div class="mini-shortcut-icon">${icon}</div>
      <div class="mini-shortcut-name">${shortcut.name}</div>
    `;
    
    div.addEventListener('click', async () => {
      await window.electronAPI.openShortcut(shortcut);
    });
    
    return div;
  }

  getIcon(shortcut) {
    if (shortcut.icon) {
      return `<img src="${shortcut.icon}" alt="${shortcut.name}" style="width:24px;height:24px;" onerror="this.parentElement.innerHTML='🌐'">`;
    }
    const icons = { url: '🌐', exe: '💻', folder: '📁', file: '📄' };
    return icons[shortcut.type] || '🔗';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MiniHub();
});
