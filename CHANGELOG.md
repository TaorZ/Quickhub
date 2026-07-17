# Changelog

## [1.1.0] - 2026-07-13

### Added
- Ícone personalizado do QuickHub (QuickHub.png) no titlebar, bandeja do sistema e janelas
- Biblioteca de ícones com emojis para escolher ao configurar atalhos
- Ícones temáticos: suporte a ícones separados para tema claro e escuro
- Opção "Iniciar com o Windows" nas configurações
- Hub principal abre automaticamente na primeira execução (sem atalhos configurados)
- Sincronização em tempo real entre Hub Principal e Mini Hub (atalhos adicionados em um refletem no outro)

### Changed
- Ícones de editar, excluir e colapsar substituídos por PNGs personalizados (seta, lixo, edição)
- Ícones alternam automaticamente entre tema claro e escuro
- Botão "Escolher Ícone" agora abre biblioteca de emojis em vez de diálogo de arquivo
- Botão de remover ícone do atalho sem imagem de lixo

### Fixed
- Ícones de atalhos com emoji agora renderizam corretamente (sem símbolo de clipe)
- Caminho do ícone do programa corrigido no titlebar

### Technical
- Evento IPC `shortcuts-updated` para sincronização entre janelas
- Evento IPC `set-start-with-windows` usando `app.setLoginItemSettings()`
- CSS com classes `.icon-btn-light` e `.icon-btn-dark` para troca de tema
- Modal de biblioteca de ícones com pesquisa

## [1.0.0] - 2024-01-01

### Added
- System tray (ícones ocultos)
- Hub principal com interface moderna (dark theme)
- Mini hub com hotkey global (Ctrl+Espaço)
- Configuração de acessos rápidos
- Suporte a URLs, executáveis, pastas e arquivos
- Ícones personalizados
- Sistema de categorias
- Janela frameless com cantos arredondados
- Animações e efeitos visuais
- Menu de contexto no tray
- Configurações de hotkey
- Tema dark

### Features
- Início minimizado no tray
- Duplo clique no tray para abrir hub
- Mini hub fecha ao clicar fora ou ESC
- Preview de ícones
- Seleção de arquivos via diálogo
- Salvamento automático de configurações

### Technical
- Electron 28+
- IPC seguro com contextBridge
- Configuração em JSON
- Preload script para segurança
