# QuickHub - Hub de Acessos Rápidos

Desktop app para Windows que centraliza acessos rápidos a aplicativos, sites, pastas e arquivos.

## Características

- **System Tray**: Inicia minimizado na bandeja do sistema
- **Mini Hub**: Acesso rápido via `Ctrl+Espaço`
- **Interface Moderna**: Design dark com cards interativos
- **Configurável**: Adicione, edite e remova acessos facilmente
- **Suporte a**: URLs, executáveis (.exe), pastas e arquivos
- **Ícones Personalizados**: Adicione logos para cada acesso

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passo a passo

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o app:**
   ```bash
   npm start
   ```

3. **Para gerar executável:**
   ```bash
   npm run build
   ```
   O executável será gerado na pasta `dist/`

## Como Usar

### Primeiro Uso

1. Ao iniciar, o QuickHub aparece no **system tray** (ícones ocultos)
2. **Duplo clique** no ícone do tray para abrir o Hub Principal
3. Clique em **"Adicionar primeiro acesso"** para configurar

### Adicionando Acessos

1. Abra as **Configurações** (ícone ⚙ no Hub)
2. Clique em **"+ Novo Acesso"**
3. Preencha:
   - **Nome**: Nome do app/site/pasta
   - **Tipo**: URL, Aplicativo, Pasta ou Arquivo
   - **Caminho**: Link ou caminho do arquivo
   - **Ícone**: Opcional, escolha uma imagem
4. Clique em **Salvar**

### Mini Hub (Acesso Rápido)

- Pressione `Ctrl+Espaço` a qualquer momento
- Clique no acesso desejado
- O mini hub fecha automaticamente

### Tipos de Acesso

| Tipo | Exemplo |
|------|---------|
| URL | `https://www.google.com` |
| Aplicativo | `C:\Program Files\Chrome\chrome.exe` |
| Pasta | `C:\Users\Documentos` |
| Arquivo | `C:\Relatorios\relatorio.pdf` |

## Atalhos

| Ação | Atalho |
|------|--------|
| Abrir Mini Hub | `Ctrl+Espaço` |
| Fechar Mini Hub | `ESC` |

## Estrutura de Dados

As configurações são salvas em:
```
%APPDATA%/quickhub/config/shortcuts.json
```

## Personalização

### Tema

O app usa tema dark por padrão. Para alterar:
1. Abra Configurações
2. Vá em "Configurações Gerais"
3. Selecione o tema desejado

### Hotkey

Para alterar a tecla de atalho:
1. Abra Configurações
2. Clique em "Gravar" ao lado do campo de atalho
3. Pressione a combinação desejada
4. Salve e reinicie o app

## Desenvolvimento

### Estrutura do Projeto

```
quickhub/
├── src/
│   ├── main/           # Processo principal (Electron)
│   │   ├── index.js    # Entry point
│   │   ├── tray.js     # System tray
│   │   ├── hotkey.js   # Atalhos globais
│   │   ├── config.js   # Gerenciador de config
│   │   └── preload.js  # Bridge IPC
│   └── renderer/       # Interface (HTML/CSS/JS)
│       ├── index.html  # Hub principal
│       ├── mini.html   # Mini hub
│       ├── config.html # Configurações
│       ├── css/        # Estilos
│       └── js/         # Lógica
├── config/             # Configurações padrão
└── resources/          # Recursos do app
```

### Tecnologias

- **Electron**: Framework desktop
- **HTML/CSS/JS**: Interface
- **IPC**: Comunicação entre processos

## Suporte

Para issues ou sugurências, entre em contato.

## Licença

MIT
