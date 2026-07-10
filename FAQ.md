# FAQ - Perguntas Frequentes

## Instalação e Início

### P: O app não inicia, o que fazer?
R: Verifique se:
1. Node.js está instalado (`node --version`)
2. npm está instalado (`npm --version`)
3. Execute `npm install` primeiro
4. Execute `npm start`

### P: Preciso instalar o Electron separadamente?
R: Não! O Electron já está incluído nas dependências do projeto. Basta executar `npm install`.

### P: O app funciona em Mac/Linux?
R: O app foi desenvolvido para Windows, mas pode ser adaptado para outros sistemas. Alguns recursos como atalhos de teclado podem precisar de ajustes.

---

## Uso Básico

### P: Como abrir o app?
R: O app inicia minimizado no system tray (bandeja do sistema). Para abrir:
- **Duplo clique** no ícone do tray
- Ou pressione `Ctrl+Espaço` para o mini hub

### P: Onde fica o ícone do tray?
R: Procure na bandeja do sistema (canto inferior direito, próximo ao relógio). Pode estar oculto - clique na seta para mostrar ícones ocultos.

### P: Como fechar o app completamente?
R: Clique com o botão direito no ícone do tray e selecione "Sair". Fechar a janela apenas minimiza para o tray.

---

## Configuração

### P: Onde ficam minhas configurações?
R: As configurações são salvas em:
```
%APPDATA%/quickhub/config/shortcuts.json
```

### P: Como adicionar um acesso rápido?
R: 
1. Abra o Hub (duplo clique no tray)
2. Clique em ⚙ (Configurações)
3. Clique em "+ Novo Acesso"
4. Preencha os campos e salve

### P: Posso editar o JSON manualmente?
R: Sim! Edite o arquivo `shortcuts.json`. A estrutura está documentada no `GUIA.md`.

### P: Como usar ícones personalizados?
R: Na tela de configuração do acesso:
1. Clique em "Escolher Ícone"
2. Selecione uma imagem (PNG, JPG, ICO, SVG)
3. O ícone será copiado automaticamente

---

## Mini Hub

### P: O que é o Mini Hub?
R: É uma versão compacta do hub que aparece rapidamente ao pressionar `Ctrl+Espaço`. Ideal para acessos rápidos sem abrir a janela principal.

### P: Como alterar a tecla de atalho?
R: 
1. Abra Configurações
2. Vá em "Configurações Gerais"
3. Clique em "Gravar"
4. Pressione a combinação desejada
5. Salve e reinicie o app

### P: O Mini Hub não aparece ao pressionar Ctrl+Espaço
R: Verifique se:
1. Outro app não está usando o mesmo atalho
2. Tente alterar a hotkey nas configurações
3. Reinicie o app após alterar

---

## Tipos de Acesso

### P: Qual a diferença entre os tipos?
R: 
- **URL**: Abre sites no navegador
- **Aplicativo**: Executa programas (.exe)
- **Pasta**: Abre no Explorador de Arquivos
- **Arquivo**: Abre com o aplicativo padrão

### P: Como adicionar um site?
R: 
1. Tipo: `URL`
2. Caminho: `https://www.site.com`

### P: Como adicionar um aplicativo?
R: 
1. Tipo: `Aplicativo`
2. Caminho: `C:\Program Files\App\app.exe`
3. Use o botão 📂 para navegar até o arquivo

### P: Posso adicionar pastas de rede?
R: Sim! Use o caminho UNC: `\\servidor\pasta`

---

## Problemas Comuns

### P: O ícone do app não aparece
R: 
1. Verifique se o arquivo existe no caminho indicado
2. Formatos suportados: PNG, JPG, ICO, SVG
3. Tamanho recomendado: 48x48 ou 64x64 pixels

### P: O acesso não abre
R: Verifique se:
1. O caminho está correto
2. O arquivo/programa existe
3. Você tem permissão para acessar

### P: O app está lento
R: 
1. Reduza a quantidade de acessos
2. Use ícones menores
3. Feche outros apps que consomem memória

### P: Perdi minhas configurações
R: As configurações ficam em `%APPDATA%/quickhub/config/`. Faça backup regularmente.

---

## Desenvolvimento

### P: Como contribuir com o projeto?
R: 
1. Fork o repositório
2. Crie uma branch para sua feature
3. Envie um Pull Request

### P: Como reportar bugs?
R: Abra uma issue no repositório com:
1. Descrição do problema
2. Passos para reproduzir
3. Versão do Node.js e OS

### P: Posso usar em ambiente comercial?
R: Sim! O projeto é open source sob licença MIT.

---

## Dicas

1. **Organize por categorias**: Use o campo "Categoria" para agrupar acessos
2. **Backup regular**: Exporte o `shortcuts.json` periodicamente
3. **Ícones consistentes**: Use ícones do mesmo estilo para melhor visual
4. **Atalhos frequentes**: Coloque os mais usados no mini hub
5. **Caminhos relativos**: Para portabilidade, use caminhos relativos quando possível

---

## Contato

Para mais dúvidas, consulte a documentação completa em `GUIA.md`.
