const rcedit = require('rcedit');
const path = require('path');

module.exports = async function(context) {
  if (context.electronPlatformName === 'win32') {
    const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
    const iconPath = path.join(context.packager.projectDir, 'resources', 'icon.ico');
    console.log(`[afterPack] Injetando ícone customizado em ${exePath}...`);
    try {
      await rcedit(exePath, {
        icon: iconPath
      });
      console.log(`[afterPack] Ícone injetado com sucesso em ${exePath}!`);
    } catch (err) {
      console.error(`[afterPack] Erro ao injetar ícone:`, err);
    }
  }
};
