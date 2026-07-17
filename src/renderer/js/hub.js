// Hub Principal
class Hub {
  constructor() {
    this.shortcuts = [];
    this.container = document.getElementById('shortcuts-container');
    this.editingId = null;
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
    this.setupModals();
    this.setupTitlebar();
    this.setupBrowser();
  }

  setupTitlebar() {
    document.getElementById('btn-close').addEventListener('click', () => {
      window.electronAPI.closeAll();
    });

    document.getElementById('btn-minimize').addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      window.electronAPI.openConfigWindow();
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
      window.electronAPI.closeBrowserOnly();
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

    // Browser events
    window.electronAPI.onBrowserOpened((url) => {
      this.showBrowser(url);
    });

    window.electronAPI.onBrowserClosed(() => {
      this.hideBrowser();
    });

    window.electronAPI.onBrowserUrlChanged((url) => {
      document.getElementById('browser-url').value = url;
    });

    // Theme change listener
    window.electronAPI.onThemeChanged((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('quickhub-theme', theme);
    });

    // Shortcuts sync listener
    window.electronAPI.onShortcutsUpdated((shortcuts) => {
      this.shortcuts = shortcuts;
      this.render();
    });
  }

  showBrowser(url) {
    this.browserOpen = true;
    document.getElementById('browser-navbar').style.display = 'flex';
    document.getElementById('browser-url').value = url;
    document.getElementById('hub-content').style.display = 'none';
    document.getElementById('hub-footer').style.display = 'none';
  }

  hideBrowser() {
    this.browserOpen = false;
    document.getElementById('browser-navbar').style.display = 'none';
    document.getElementById('hub-content').style.display = 'flex';
    document.getElementById('hub-footer').style.display = 'block';
  }

  // ===== RENDER =====
  render() {
    if (this.shortcuts.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <p>Nenhum acesso configurado</p>
          <p class="modal-hint">Clique em "+ Novo Acesso" abaixo para começar</p>
        </div>
      `;
      return;
    }

    const groups = this.groupByCategory(this.shortcuts);
    this.container.innerHTML = '';

    for (const [category, items] of Object.entries(groups)) {
      const groupEl = this.createCategoryGroup(category, items);
      this.container.appendChild(groupEl);
    }

    this.setupCards();
  }

  groupByCategory(shortcuts) {
    const groups = {};
    
    shortcuts.forEach(s => {
      const cat = s.category || 'Sem Categoria';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    const sorted = {};
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === 'Sem Categoria') return 1;
      if (b === 'Sem Categoria') return -1;
      return a.localeCompare(b);
    });

    keys.forEach(k => sorted[k] = groups[k]);
    return sorted;
  }

  createCategoryGroup(category, items) {
    const div = document.createElement('div');
    div.className = 'category-group';
    
    const groupId = 'group-' + category.replace(/\s+/g, '-').toLowerCase();
    
    div.innerHTML = `
      <div class="category-header">
        <div class="category-title">
          <span class="category-name">${category}</span>
          <span class="category-count">${items.length}</span>
        </div>
        <div class="category-actions">
          <button class="category-rename" data-category="${category}" title="Renomear"><img src="assets/icons/edit.png" alt="Renomear" class="icon-btn icon-btn-light"><img src="assets/icons/edit-escuro.png" alt="Renomear" class="icon-btn icon-btn-dark"></button>
          <button class="category-delete" data-category="${category}" title="Excluir"><img src="assets/icons/delete.png" alt="Excluir" class="icon-btn icon-btn-light"><img src="assets/icons/delete.png" alt="Excluir" class="icon-btn icon-btn-dark"></button>
          <button class="category-collapse" data-target="${groupId}"><img src="assets/icons/arrow-down.png" alt="Expandir" class="icon-btn collapse-icon icon-btn-light"><img src="assets/icons/arrow-escuro.png" alt="Expandir" class="icon-btn collapse-icon icon-btn-dark"></button>
        </div>
      </div>
      <div class="category-shortcuts" id="${groupId}">
        ${items.map(s => this.createCard(s)).join('')}
      </div>
    `;

    const collapseBtn = div.querySelector('.category-collapse');
    collapseBtn.addEventListener('click', () => {
      const grid = div.querySelector('.category-shortcuts');
      grid.classList.toggle('collapsed');
      collapseBtn.classList.toggle('collapsed', grid.classList.contains('collapsed'));
    });

    const renameBtn = div.querySelector('.category-rename');
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openRenameCategoryModal(category);
    });

    const deleteBtn = div.querySelector('.category-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCategory(category);
    });

    return div;
  }

  createCard(shortcut) {
    const icon = this.getIconHTML(shortcut);
    return `
      <div class="shortcut-card" data-id="${shortcut.id}" data-type="${shortcut.type}" title="${shortcut.name}">
        <button class="edit-overlay" data-id="${shortcut.id}" title="Editar"><img src="assets/icons/edit.png" alt="Editar" class="icon-btn icon-btn-light"><img src="assets/icons/edit-escuro.png" alt="Editar" class="icon-btn icon-btn-dark"></button>
        <div class="shortcut-icon">${icon}</div>
        <div class="shortcut-name">${shortcut.name}</div>
      </div>
    `;
  }

  getIconHTML(shortcut) {
    if (shortcut.icon) {
      // Check if it's an emoji (not a file path)
      if (!shortcut.icon.includes('/') && !shortcut.icon.includes('\\') && !shortcut.icon.includes('.')) {
        return `<span style="font-size:24px;">${shortcut.icon}</span>`;
      }
      return `<img src="${shortcut.icon}" alt="${shortcut.name}" onerror="this.parentElement.innerHTML='🌐'">`;
    }
    const icons = { url: '🌐', exe: '💻', folder: '📁', file: '📄' };
    return icons[shortcut.type] || '🔗';
  }

  setupCards() {
    this.container.querySelectorAll('.shortcut-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-overlay')) return;
        const id = card.dataset.id;
        const shortcut = this.shortcuts.find(s => s.id === id);
        if (shortcut) {
          await window.electronAPI.openShortcut(shortcut);
        }
      });
    });

    this.container.querySelectorAll('.edit-overlay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal(btn.dataset.id);
      });
    });
  }

  // ===== MODALS =====
  setupModals() {
    document.getElementById('btn-add').addEventListener('click', () => {
      this.openAddModal();
    });

    document.getElementById('modal-add-close').addEventListener('click', () => this.closeAddModal());
    document.getElementById('modal-add-cancel').addEventListener('click', () => this.closeAddModal());
    document.getElementById('modal-add-save').addEventListener('click', () => this.quickAdd());
    document.getElementById('new-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.quickAdd();
    });

    document.getElementById('modal-edit-close').addEventListener('click', () => this.closeEditModal());
    document.getElementById('modal-edit-cancel').addEventListener('click', () => this.closeEditModal());
    document.getElementById('modal-edit-save').addEventListener('click', () => this.saveEdit());
    document.getElementById('modal-edit-delete').addEventListener('click', () => this.deleteCurrent());
    document.getElementById('btn-pick-path').addEventListener('click', () => this.pickPath());
    document.getElementById('btn-pick-icon').addEventListener('click', () => this.pickIcon());
    document.getElementById('btn-auto-icon').addEventListener('click', () => this.autoFetchIcon());
    document.getElementById('btn-remove-icon').addEventListener('click', () => this.removeIcon());

    document.getElementById('modal-add').addEventListener('click', (e) => {
      if (e.target.id === 'modal-add') this.closeAddModal();
    });
    document.getElementById('modal-edit').addEventListener('click', (e) => {
      if (e.target.id === 'modal-edit') this.closeEditModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.browserOpen) {
          window.electronAPI.closeBrowserOnly();
        } else {
          this.closeAddModal();
          this.closeEditModal();
        }
      }
    });

    document.getElementById('new-category-select').addEventListener('change', (e) => {
      document.getElementById('new-category').value = e.target.value;
    });

    document.getElementById('edit-category-select').addEventListener('change', (e) => {
      document.getElementById('edit-category').value = e.target.value;
    });

    document.getElementById('modal-rename-close').addEventListener('click', () => this.closeRenameCategoryModal());
    document.getElementById('modal-rename-cancel').addEventListener('click', () => this.closeRenameCategoryModal());
    document.getElementById('modal-rename-save').addEventListener('click', () => this.saveRenameCategory());
    document.getElementById('modal-rename-category').addEventListener('click', (e) => {
      if (e.target.id === 'modal-rename-category') this.closeRenameCategoryModal();
    });
  }

  // ===== CATEGORIES =====
  getCategories() {
    const cats = new Set();
    this.shortcuts.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return [...cats].sort();
  }

  populateCategorySelect(selectId, currentValue) {
    const select = document.getElementById(selectId);
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

  // ===== RENAME CATEGORY =====
  openRenameCategoryModal(oldName) {
    this.renamingCategory = oldName;
    document.getElementById('rename-category-name').value = oldName;
    document.getElementById('modal-rename-category').classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('rename-category-name');
      input.focus();
      input.select();
    }, 100);
  }

  closeRenameCategoryModal() {
    document.getElementById('modal-rename-category').classList.remove('active');
    this.renamingCategory = null;
  }

  async saveRenameCategory() {
    if (!this.renamingCategory) return;
    
    const newName = document.getElementById('rename-category-name').value.trim();
    if (!newName || newName === this.renamingCategory) {
      this.closeRenameCategoryModal();
      return;
    }

    this.shortcuts.forEach(s => {
      if (s.category === this.renamingCategory) {
        s.category = newName;
      }
    });

    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.render();
    this.closeRenameCategoryModal();
  }

  // ===== DELETE CATEGORY =====
  async deleteCategory(category) {
    const count = this.shortcuts.filter(s => (s.category || 'Sem Categoria') === category).length;
    
    const confirmMsg = category === 'Sem Categoria' 
      ? `Tem certeza que deseja excluir os ${count} acessos sem categoria?`
      : `Tem certeza que deseja excluir a categoria "${category}" e seus ${count} acessos?`;
    
    if (!confirm(confirmMsg)) return;

    this.shortcuts = this.shortcuts.filter(s => (s.category || 'Sem Categoria') !== category);
    
    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.render();
  }

  // ===== ICON LIBRARY =====
  openIconLibrary(callback) {
    this.iconCallback = callback;
    this.selectedIcon = null;
    
    const icons = [
      '🌐', '💻', '📁', '📄', '🔗', '📧', '📊', '📈', '📉',
      '📋', '📝', '📌', '📍', '🔑', '🔒', '🔓', '🛡️', '⚙️',
      '🔧', '🔨', '⛏️', '🪛', '🔩', '💡', '🔌', '🔋', '💾',
      '💿', '📀', '🖥️', '💻', '📱', '⌚', '📷', '📹', '🎥',
      '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️',
      '⌛', '⏳', '📡', '🔭', '🔬', '⚖️', '🔗', '📎', '🖇️',
      '📐', '📏', '🧮', '🗑️', '🗃️', '🗄️', '📦', '🏷️', '🔖',
      '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⛏️', '🪛', '🔩',
      '⚙️', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '🗑️', '🗃️',
      '🗄️', '📦', '🏷️', '🔖', '💰', '💳', '💎', '⚖️', '🔧',
      '🎮', '🎯', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧',
      '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲',
      '♟️', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊',
      '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷',
      '🥌', '🎯', '🥏', '🎱', '🔮', '🧿', '🎮', '🕹️', '🎰'
    ];

    const grid = document.getElementById('icons-grid');
    grid.innerHTML = icons.map(icon => 
      `<div class="icon-item" data-icon="${icon}">${icon}</div>`
    ).join('');

    // Setup search
    const search = document.getElementById('icon-search');
    search.value = '';
    search.addEventListener('input', () => {
      const filter = search.value.toLowerCase();
      grid.querySelectorAll('.icon-item').forEach(item => {
        const icon = item.dataset.icon;
        item.style.display = icon.includes(filter) ? 'flex' : 'none';
      });
    });

    // Setup selection
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.icon-item');
      if (!item) return;
      
      grid.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      this.selectedIcon = item.dataset.icon;
      document.getElementById('modal-icons-select').disabled = false;
    });

    // Setup buttons
    document.getElementById('modal-icons-close').onclick = () => this.closeIconLibrary();
    document.getElementById('modal-icons-cancel').onclick = () => this.closeIconLibrary();
    document.getElementById('modal-icons-select').onclick = () => {
      if (this.selectedIcon && this.iconCallback) {
        this.iconCallback(this.selectedIcon);
      }
      this.closeIconLibrary();
    };

    document.getElementById('modal-icons').classList.add('active');
  }

  closeIconLibrary() {
    document.getElementById('modal-icons').classList.remove('active');
    this.selectedIcon = null;
    this.iconCallback = null;
  }

  // ===== QUICK ADD =====
  openAddModal() {
    document.getElementById('new-url').value = '';
    document.getElementById('new-category').value = '';
    this.populateCategorySelect('new-category-select', '');
    document.getElementById('modal-add').classList.add('active');
    setTimeout(() => document.getElementById('new-url').focus(), 100);
  }

  closeAddModal() {
    document.getElementById('modal-add').classList.remove('active');
  }

  async quickAdd() {
    const input = document.getElementById('new-url');
    let value = input.value.trim();
    
    if (!value) return;

    // Detecta o tipo automaticamente
    let type = 'url';
    let path = value;
    let name = null;
    let icon = null;

    if (value.match(/^[A-Z]:\\/) || value.match(/^\\\\/)) {
      // Caminho local ou de rede
      const hasExtension = value.match(/\.\w{1,5}$/);
      const isFolder = !hasExtension || value.endsWith('\\');
      
      if (isFolder) {
        type = 'folder';
        // Extrai nome da pasta
        const parts = value.replace(/\\$/, '').split('\\');
        name = parts[parts.length - 1];
      } else if (value.endsWith('.exe') || value.endsWith('.bat') || value.endsWith('.cmd')) {
        type = 'exe';
        const parts = value.split('\\');
        name = parts[parts.length - 1].replace(/\.\w+$/, '');
      } else {
        type = 'file';
        const parts = value.split('\\');
        name = parts[parts.length - 1].replace(/\.\w+$/, '');
      }
    } else {
      // URL
      if (!value.match(/^https?:\/\//i)) {
        value = 'https://' + value;
        path = value;
      }
      type = 'url';
    }

    const categoryInput = document.getElementById('new-category').value.trim();
    const categorySelect = document.getElementById('new-category-select').value;
    const category = categoryInput || categorySelect || '';

    const saveBtn = document.getElementById('modal-add-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Buscando...';

    // Para URLs, busca favicon e nome do site
    if (type === 'url') {
      try {
        const info = await this.fetchSiteInfo(path);
        name = info.name || this.extractNameFromUrl(path);
        icon = info.icon || null;
      } catch {
        name = this.extractNameFromUrl(path);
      }
    }

    const shortcut = {
      id: this.generateId(),
      name: name || 'Novo Acesso',
      type: type,
      path: path,
      icon: icon,
      category: category
    };

    this.shortcuts.push(shortcut);
    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.render();
    this.closeAddModal();

    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Adicionar';
  }

  extractNameFromUrl(url) {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
      return 'Novo Acesso';
    }
  }

  async fetchSiteInfo(url) {
    try {
      const hostname = new URL(url).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
      const exists = await this.checkImageExists(faviconUrl);
      
      return {
        name: hostname.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + 
              hostname.replace('www.', '').split('.')[0].slice(1),
        icon: exists ? faviconUrl : null
      };
    } catch {
      return { name: null, icon: null };
    }
  }

  checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 5000);
    });
  }

  // ===== EDIT MODAL =====
  openEditModal(id) {
    this.editingId = id;
    const shortcut = this.shortcuts.find(s => s.id === id);
    if (!shortcut) return;

    document.getElementById('edit-name').value = shortcut.name || '';
    document.getElementById('edit-path').value = shortcut.path || '';
    document.getElementById('edit-type').value = shortcut.type || 'url';
    document.getElementById('edit-category').value = shortcut.category || '';

    this.populateCategorySelect('edit-category-select', shortcut.category || '');

    const preview = document.getElementById('edit-icon-preview');
    if (shortcut.icon) {
      preview.innerHTML = `<img src="${shortcut.icon}" alt="icon" onerror="this.parentElement.innerHTML='<span>🌐</span>'">`;
    } else {
      const icons = { url: '🌐', exe: '💻', folder: '📁', file: '📄' };
      preview.innerHTML = `<span>${icons[shortcut.type] || '🔗'}</span>`;
    }
    preview.dataset.icon = shortcut.icon || '';

    document.getElementById('modal-edit').classList.add('active');
  }

  closeEditModal() {
    document.getElementById('modal-edit').classList.remove('active');
    this.editingId = null;
  }

  async saveEdit() {
    if (!this.editingId) return;

    const index = this.shortcuts.findIndex(s => s.id === this.editingId);
    if (index === -1) return;

    const categoryInput = document.getElementById('edit-category').value.trim();
    const categorySelect = document.getElementById('edit-category-select').value;
    const category = categoryInput || categorySelect || '';

    this.shortcuts[index] = {
      ...this.shortcuts[index],
      name: document.getElementById('edit-name').value.trim() || this.shortcuts[index].name,
      type: document.getElementById('edit-type').value,
      path: document.getElementById('edit-path').value.trim() || this.shortcuts[index].path,
      category: category,
      icon: document.getElementById('edit-icon-preview').dataset.icon || null
    };

    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.render();
    this.closeEditModal();
  }

  async deleteCurrent() {
    if (!this.editingId) return;
    if (!confirm('Tem certeza que deseja excluir este acesso?')) return;

    this.shortcuts = this.shortcuts.filter(s => s.id !== this.editingId);
    await window.electronAPI.saveShortcuts(this.shortcuts);
    this.render();
    this.closeEditModal();
  }

  async pickPath() {
    const type = document.getElementById('edit-type').value;
    const path = await window.electronAPI.pickFile(type);
    if (path) {
      document.getElementById('edit-path').value = path;
    }
  }

  async pickIcon() {
    this.openIconLibrary((icon) => {
      const preview = document.getElementById('edit-icon-preview');
      preview.innerHTML = `<span>${icon}</span>`;
      preview.dataset.icon = icon;
    });
  }

  async autoFetchIcon() {
    const url = document.getElementById('edit-path').value.trim();
    if (!url) {
      alert('Informe um link primeiro');
      return;
    }

    const btn = document.getElementById('btn-auto-icon');
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const info = await this.fetchSiteInfo(url);
      const preview = document.getElementById('edit-icon-preview');
      if (info.icon) {
        preview.innerHTML = `<img src="${info.icon}" alt="icon">`;
        preview.dataset.icon = info.icon;
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
    const preview = document.getElementById('edit-icon-preview');
    preview.innerHTML = '<span>🌐</span>';
    preview.dataset.icon = '';
  }

  // ===== HELPERS =====
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new Hub();
});
