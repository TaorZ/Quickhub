const pngToIco = require('png-to-ico');
const path = require('path');

async function convert() {
  try {
    const icoPath = path.join(__dirname, 'resources', 'icon.ico');
    await pngToIco([path.join(__dirname, 'resources', 'icon.png')], icoPath);
    console.log('ICO criado em:', icoPath);
  } catch (err) {
    console.error('Erro ao converter:', err);
  }
}

convert();
