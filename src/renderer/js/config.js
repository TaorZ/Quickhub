// Config Manager
class ConfigManager {
  constructor() {
    this.shortcuts = [];
    this.settings = {};
    this.editingId = null;
    this.recordingTarget = null;
    
    this.init();
  }

  async init() {
    this.shortcuts = await window.electronAPI.getShortcuts();
    this.settings = await window.electronAPI.getSettings();
    
    // Aplica tema salvo
    document.documentElement.setAttribute('data-theme', this.settings.theme || 'dark');
    
    this.setupTabs();
    this.setupModal();
    this.setupButtons();
    this.setupHotkeys();
    this.setupPathDetect();
    this.setupThemeListener();
    this.renderShortcuts();
    this.loadSettings();
  }

  // Tabs
  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
      });
    });
  }

  // Hotkey Recording
  setupHotkeys() {
    const recordMini = document.getElementById('btn-record-mini');
    const recordMain = document.getElementById('btn-record-main');
    const clearMini = document.getElementById('btn-clear-mini');
    const clearMain = document.getElementById('btn-clear-main');

    recordMini.addEventListener('click', () => this.startRecording('mini'));
    recordMain.addEventListener('click', () => this.startRecording('main'));
    clearMini.addEventListener('click', () => this.clearHotkey('mini'));
    clearMain.addEventListener('click', () => this.clearHotkey('main'));

    // Global key listener for recording
    document.addEventListener('keydown', (e) => {
      if (!this.recordingTarget) return;
      e.preventDefault();
      e.stopPropagation();

      // Monta o atalho
      const parts = [];
      if (e.ctrlKey) parts.push('CommandOrControl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Super');

      // Teclas especiais
      const specialKeys = {
        ' ': 'Space',
        'Escape': 'Escape',
        'Enter': 'Return',
        'Backspace': 'Backspace',
        'Delete': 'Delete',
        'Tab': 'Tab',
        'CapsLock': 'Capslock',
        'ArrowUp': 'Up',
        'ArrowDown': 'Down',
        'ArrowLeft': 'Left',
        'ArrowRight': 'Right',
        'Home': 'Home',
        'End': 'End',
        'PageUp': 'PageUp',
        'PageDown': 'PageDown',
        'Insert': 'Insert',
        'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4',
        'F5': 'F5', 'F6': 'F6', 'F7': 'F7', 'F8': 'F8',
        'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12'
      };

      // Ignora apenas modificadores sozinhos
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const key = specialKeys[e.key] || e.key.toUpperCase();
      parts.push(key);

      const hotkey = parts.join('+');
      
      if (this.recordingTarget === 'mini') {
        document.getElementById('hotkey-mini').value = hotkey;
      } else {
        document.getElementById('hotkey-main').value = hotkey;
      }

      this.recordingTarget = null;
      this.updateRecordButtons();
    });

    document.addEventListener('keyup', (e) => {
      // Se soltou tudo sem ter uma tecla não-modificadora, mantém gravando
      if (this.recordingTarget && ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        // Ainda gravando
      }
    });
  }

  startRecording(target) {
    this.recordingTarget = target;
    
    if (target === 'mini') {
      document.getElementById('hotkey-mini').value = 'Pressione uma tecla...';
    } else {
      document.getElementById('hotkey-main').value = 'Pressione uma tecla...';
    }
    
    this.updateRecordButtons();
  }

  updateRecordButtons() {
    const btnMini = document.getElementById('btn-record-mini');
    const btnMain = document.getElementById('btn-record-main');

    if (this.recordingTarget === 'mini') {
      btnMini.textContent = 'Gravando...';
      btnMini.disabled = true;
      btnMain.textContent = 'Gravar';
      btnMain.disabled = false;
    } else if (this.recordingTarget === 'main') {
      btnMain.textContent = 'Gravando...';
      btnMain.disabled = true;
      btnMini.textContent = 'Gravar';
      btnMini.disabled = false;
    } else {
      btnMini.textContent = 'Gravar';
      btnMini.disabled = false;
      btnMain.textContent = 'Gravar';
      btnMain.disabled = false;
    }
  }

  clearHotkey(target) {
    if (target === 'mini') {
      document.getElementById('hotkey-mini').value = '';
    } else {
      document.getElementById('hotkey-main').value = '';
    }
  }

  // Auto-detect folder paths
  setupPathDetect() {
    const pathInput = document.getElementById('shortcut-path');
    const typeSelect = document.getElementById('shortcut-type');

    pathInput.addEventListener('input', () => {
      const val = pathInput.value.trim();
      
      // Detecta caminhos de pasta (C:\... ou \\servidor\...)
      if (val.match(/^[A-Z]:\\/) || val.match(/^\\\\/)) {
        // Verifica se parece uma pasta (sem extensão de arquivo no final)
        const hasExtension = val.match(/\.\w{1,5}$/);
        const isFolder = !hasExtension || val.endsWith('\\');
        
        if (isFolder) {
          typeSelect.value = 'folder';
        } else if (val.endsWith('.exe') || val.endsWith('.bat') || val.endsWith('.cmd')) {
          typeSelect.value = 'exe';
        } else {
          typeSelect.value = 'file';
        }
      } else if (val.match(/^https?:\/\//i)) {
        typeSelect.value = 'url';
      }
    });
  }

  // Theme listener
  setupThemeListener() {
    window.electronAPI.onThemeChanged((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('quickhub-theme', theme);
      document.getElementById('theme').value = theme;
    });
  }

  // Modal
  setupModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('btn-cancel');
    const saveBtn = document.getElementById('btn-save');
    const pickPathBtn = document.getElementById('btn-pick-path');
    const pickIconBtn = document.getElementById('btn-pick-icon');
    const autoIconBtn = document.getElementById('btn-auto-icon');
    const removeIconBtn = document.getElementById('btn-remove-icon');

    closeBtn.addEventListener('click', () => this.closeModal());
    cancelBtn.addEventListener('click', () => this.closeModal());
    saveBtn.addEventListener('click', () => this.saveShortcut());
    
    pickPathBtn.addEventListener('click', () => this.pickPath());
    pickIconBtn.addEventListener('click', () => this.pickIcon());
    autoIconBtn.addEventListener('click', () => this.autoFetchIcon());
    removeIconBtn.addEventListener('click', () => this.removeIcon());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Category select sync
    document.getElementById('shortcut-category-select').addEventListener('change', (e) => {
      document.getElementById('shortcut-category').value = e.target.value;
    });
  }

  // Buttons
  setupButtons() {
    document.getElementById('btn-add-shortcut').addEventListener('click', () => this.openModal());
    document.getElementById('btn-save-settings').addEventListener('click', () => this.saveSettings());
    document.getElementById('btn-close').addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });
  }

  // Shortcuts List
  renderShortcuts() {
    const list = document.getElementById('shortcuts-list');
    
    if (this.shortcuts.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Nenhum acesso configurado</p>';
      return;
    }

    // Agrupa por categoria
    const groups = this.groupByCategory(this.shortcuts);
    list.innerHTML = '';

    for (const [category, items] of Object.entries(groups)) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'config-category-group';
      
      const header = document.createElement('div');
      header.className = 'config-category-header';
      header.innerHTML = `
        <span>${category}</span>
        <span class="category-count">${items.length}</span>
      `;
      groupDiv.appendChild(header);

      items.forEach(shortcut => {
        groupDiv.appendChild(this.createListItem(shortcut));
      });

      list.appendChild(groupDiv);
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

  createListItem(shortcut) {
    const icon = this.getIcon(shortcut);
    const div = document.createElement('div');
    div.className = 'shortcut-item';
    div.innerHTML = `
      <div class="shortcut-item-icon">${icon}</div>
      <div class="shortcut-item-info">
        <div class="shortcut-item-name">${shortcut.name}</div>
        <div class="shortcut-item-path">${shortcut.path}</div>
      </div>
      <div class="shortcut-item-actions">
        <button class="btn-edit" data-id="${shortcut.id}">Editar</button>
        <button class="btn-delete" data-id="${shortcut.id}">Excluir</button>
      </div>
    `;

    div.querySelector('.btn-edit').addEventListener('click', () => this.openModal(shortcut.id));
    div.querySelector('.btn-delete').addEventListener('click', () => this.deleteShortcut(shortcut.id));

    return div;
  }

  getIcon(shortcut) {
    if (shortcut.icon) {
      return `<img src="${shortcut.icon}" alt="${shortcut.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.innerHTML='🔗'">`;
    }
    const icons = { url: '🌐', exe: '💻', folder: '📁', file: '📄' };
    return icons[shortcut.type] || '🔗';
  }

  getCategories() {
    const cats = new Set();
    this.shortcuts.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return [...cats].sort();
  }

  populateCategorySelect(currentValue) {
    const select = document.getElementById('shortcut-category-select');
    const categories = this.getCategories();
    select.innerHTML = '<option value="">Selecione ou crie...</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === currentValue) opt.selected = true;
      select.appendChild(opt);
    });
  }

  // Modal Operations
  openModal(editId = null) {
    this.editingId = editId;
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    
    if (editId) {
      title.textContent = 'Editar Acesso';
      const shortcut = this.shortcuts.find(s => s.id === editId);
      if (shortcut) {
        document.getElementById('shortcut-name').value = shortcut.name;
        document.getElementById('shortcut-type').value = shortcut.type;
        document.getElementById('shortcut-path').value = shortcut.path;
        document.getElementById('shortcut-category').value = shortcut.category || '';
        
        const preview = document.getElementById('icon-preview');
        if (shortcut.icon) {
          preview.innerHTML = `<img src="${shortcut.icon}" alt="icon" onerror="this.parentElement.innerHTML='<span>📁</span>'">`;
        } else {
          preview.innerHTML = '<span>📁</span>';
        }
        preview.dataset.icon = shortcut.icon || '';
      }
    } else {
      title.textContent = 'Novo Acesso';
      document.getElementById('shortcut-name').value = '';
      document.getElementById('shortcut-type').value = 'url';
      document.getElementById('shortcut-path').value = '';
      document.getElementById('shortcut-category').value = '';
      document.getElementById('icon-preview').innerHTML = '<span>📁</span>';
      document.getElementById('icon-preview').dataset.icon = '';
    }

    this.populateCategorySelect(document.getElementById('shortcut-category').value);
    overlay.classList.add('active');
    document.getElementById('shortcut-name').focus();
  }

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    this.editingId = null;
  }

  async pickPath() {
    const type = document.getElementById('shortcut-type').value;
    const path = await window.electronAPI.pickFile(type);
    if (path) {
      document.getElementById('shortcut-path').value = path;
    }
  }

  async pickIcon() {
    const iconPath = await window.electronAPI.pickIcon();
    if (iconPath) {
      const preview = document.getElementById('icon-preview');
      preview.innerHTML = `<img src="${iconPath}" alt="icon">`;
      preview.dataset.icon = iconPath;
    }
  }

  async autoFetchIcon() {
    const url = document.getElementById('shortcut-path').value.trim();
    if (!url) {
      alert('Informe um link primeiro');
      return;
    }

    const btn = document.getElementById('btn-auto-icon');
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const hostname = new URL(url.includes('://') ? url : 'https://' + url).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
      
      const exists = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = faviconUrl;
        setTimeout(() => resolve(false), 5000);
      });

      if (exists) {
        const preview = document.getElementById('icon-preview');
        preview.innerHTML = `<img src="${faviconUrl}" alt="icon">`;
        preview.dataset.icon = faviconUrl;
      } else {
        alert('Não foi possível encontrar o ícone');
      }
    } catch {
      alert('Erro ao buscar ícone');
    } finally {
      btn.textContent = 'Auto';
      btn.disabled = false;
    }
  }

  removeIcon() {
    const preview = document.getElementById('icon-preview');
    preview.innerHTML = '<span>📁</span>';
    preview.dataset.icon = '';
  }

  async saveShortcut() {
    const name = document.getElementById('shortcut-name').value.trim();
    const type = document.getElementById('shortcut-type').value;
    const path = document.getElementById('shortcut-path').value.trim();
    const categoryInput = document.getElementById('shortcut-category').value.trim();
    const categorySelect = document.getElementById('shortcut-category-select').value;
    const category = categoryInput || categorySelect || '';
    const icon = document.getElementById('icon-preview').dataset.icon || null;

    if (!name || !path) {
      alert('Nome e Caminho são obrigatórios!');
      return;
    }

    if (this.editingId) {
      const index = this.shortcuts.findIndex(s => s.id === this.editingId);
      if (index !== -1) {
        this.shortcuts[index] = { ...this.shortcuts[index], name, type, path, category, icon };
      }
    } else {
      this.shortcuts.push({
        id: this.generateId(),
        name,
        type,
        path,
        category,
        icon
      });
    }

    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.renderShortcuts();
    this.closeModal();
  }

  async deleteShortcut(id) {
    if (!confirm('Tem certeza que deseja excluir este acesso?')) return;
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.renderShortcuts();
  }

  // Settings
  loadSettings() {
    document.getElementById('hotkey-mini').value = this.settings.hotkeyMini || 'CommandOrControl+Space';
    document.getElementById('hotkey-main').value = this.settings.hotkeyMain || 'CommandOrControl+Shift+Space';
    document.getElementById('theme').value = this.settings.theme || 'dark';
    
    // Aplica tema
    const theme = this.settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quickhub-theme', theme);
  }

  async saveSettings() {
    const hotkeyMini = document.getElementById('hotkey-mini').value.trim();
    const hotkeyMain = document.getElementById('hotkey-main').value.trim();
    const theme = document.getElementById('theme').value;

    this.settings = {
      ...this.settings,
      hotkeyMini: hotkeyMini || 'CommandOrControl+Space',
      hotkeyMain: hotkeyMain || 'CommandOrControl+Shift+Space',
      theme: theme
    };

    await window.electronAPI.saveSettings(this.settings);
    
    // Aplica o tema e salva no localStorage
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quickhub-theme', theme);
    
    alert('Configurações salvas!');
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ConfigManager();
});
