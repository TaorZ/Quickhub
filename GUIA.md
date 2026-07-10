# Guia de Uso - QuickHub

## Primeiros Passos

### 1. Instalação

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 2. Iniciar o App

```bash
npm start
```

Ou execute o arquivo `iniciar.bat` (Windows).

### 3. Primeira Configuração

1. O app inicia **minimizado** no system tray (ícones ocultos)
2. **Duplo clique** no ícone do tray para abrir o Hub
3. Clique em **"Adicionar primeiro acesso"**
4. Configure seu primeiro acesso

---

## Tipos de Acesso

### URL / Site
- **Tipo**: `url`
- **Exemplo**: `https://www.google.com`
- **Ação**: Abre no navegador padrão

### Aplicativo (.exe)
- **Tipo**: `exe`
- **Exemplo**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Ação**: Executa o programa

### Pasta
- **Tipo**: `folder`
- **Exemplo**: `C:\Users\SeuUsuario\Documentos`
- **Ação**: Abre no Explorador de Arquivos

### Arquivo
- **Tipo**: `file`
- **Exemplo**: `C:\Relatorios\relatorio.pdf`
- **Ação**: Abre com o aplicativo padrão

---

## Adicionando Acessos

### Método 1: Interface Gráfica

1. Abra o Hub (duplo clique no tray)
2. Clique no ícone ⚙ (Configurações)
3. Clique em "+ Novo Acesso"
4. Preencha os campos:
   - **Nome**: Nome amigável (ex: "Google Chrome")
   - **Tipo**: Selecione o tipo de acesso
   - **Caminho**: Cole o link ou caminho
   - **Ícone**: Opcional, escolha uma imagem
   - **Categoria**: Opcional, para organização
5. Clique em "Salvar"

### Método 2: Editando o JSON

Edite o arquivo de configuração manualmente:

```
%APPDATA%/quickhub/config/shortcuts.json
```

Exemplo de estrutura:

```json
{
  "shortcuts": [
    {
      "id": "meu_app",
      "name": "Meu App",
      "type": "exe",
      "path": "C:\\Caminho\\do\\app.exe",
      "icon": "assets/icons/meu_app.png",
      "category": "Ferramentas"
    }
  ],
  "settings": {
    "hotkey": "CommandOrControl+Space",
    "theme": "dark"
  }
}
```

---

## Mini Hub (Acesso Rápido)

### Como Usar

1. Pressione `Ctrl+Espaço` a qualquer momento
2. O mini hub aparece com todos os acessos
3. Clique no acesso desejado
4. O mini hub fecha automaticamente

### Fechar

- Pressione `ESC`
- Ou clique fora do mini hub

---

## Atalhos de Teclado

| Ação | Atalho |
|------|--------|
| Abrir/Fechar Mini Hub | `Ctrl+Espaço` |
| Fechar Mini Hub | `ESC` |

### Alterar Hotkey

1. Abra Configurações
2. Vá em "Configurações Gerais"
3. Clique em "Gravar"
4. Pressione a combinação desejada (ex: `Ctrl+Shift+H`)
5. Clique em "Salvar Configurações"
6. **Reinicie o app** para aplicar

---

## System Tray

### Menu do Tray (Botão Direito)

- **Abrir Hub**: Abre a janela principal
- **Mini Hub**: Abre o mini hub
- **Configurações**: Abre as configurações
- **Sair**: Fecha o app completamente

### Comportamento

- **Duplo clique**: Abre o Hub principal
- **Fechar janela**: Minimiza para o tray (não fecha o app)
- **Sair do menu**: Fecha completamente

---

## Ícones Personalizados

### Adicionando Ícones

1. Na tela de configuração do acesso
2. Clique em "Escolher Ícone"
3. Selecione uma imagem (PNG, JPG, ICO, SVG)
4. O ícone será copiado para a pasta `assets/icons/`

### Formatos Suportados

- PNG
- JPG/JPEG
- ICO
- SVG

### Tamanho Recomendado

- 48x48 pixels ou 64x64 pixels
- Formato quadrado

---

## Temas

### Dark (Padrão)
- Fundo escuro
- Texto claro
- Ícones coloridos

### Light (Em desenvolvimento)
- Fundo claro
- Texto escuro

---

## Configurações Avançadas

### Arquivo de Configuração

Localização:
```
%APPDATA%/quickhub/config/shortcuts.json
```

### Propriedades do Settings

```json
{
  "settings": {
    "hotkey": "CommandOrControl+Space",
    "miniHubWidth": 400,
    "miniHubHeight": 300,
    "theme": "dark"
  }
}
```

| Propriedade | Descrição | Padrão |
|-------------|-----------|--------|
| `hotkey` | Tecla de atalho global | `CommandOrControl+Space` |
| `miniHubWidth` | Largura do mini hub (px) | 400 |
| `miniHubHeight` | Altura do mini hub (px) | 300 |
| `theme` | Tema visual | `dark` |

---

## Solução de Problemas

### App não inicia

1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as dependências foram instaladas: `npm install`
3. Execute: `npm start`

### Hotkey não funciona

1. Verifique se outra aplicação usa o mesmo atalho
2. Tente alterar a hotkey nas configurações
3. Reinicie o app após alterar

### Ícone não aparece

1. Verifique se o arquivo existe no caminho indicado
2. Formatos suportados: PNG, JPG, ICO, SVG
3. Tente recarregar o ícone

### Acesso não abre

1. Verifique se o caminho está correto
2. Para executáveis, use o caminho completo
3. Para URLs, inclua `https://`

---

## Desenvolvimento

### Estrutura

```
quickhub/
├── src/
│   ├── main/           # Processo principal
│   └── renderer/       # Interface
├── config/             # Configurações
├── resources/          # Recursos
└── package.json
```

### Comandos

```bash
# Iniciar em modo desenvolvimento
npm start

# Gerar executável
npm run build

# Gerar executável portátil
npm run build:portable
```

### Tecnologias

- **Electron**: Framework desktop
- **HTML/CSS/JS**: Interface
- **IPC**: Comunicação entre processos

---

## Dicas

1. **Organize por categorias**: Use o campo "Categoria" para agrupar acessos
2. **Use ícones**: Facilita a identificação visual
3. **Atalhos frequentes**: Coloque os mais usados no mini hub
4. **Backup**: Exporte o `shortcuts.json` para backup

---

## Suporte

Para issues ou sugestões, entre em contato.

---

## Licença

MIT
