const fs = require('fs');
const path = require('path');

// Script para gerar ícone PNG a partir do SVG
// Nota: Para gerar o PNG real, use uma ferramenta como sharp ou canvas

console.log('=== Gerador de Ícone QuickHub ===');
console.log('');
console.log('Para gerar o ícone PNG, você pode:');
console.log('');
console.log('1. Usar um conversor online:');
console.log('   - Acesse: https://convertio.co/svg-png/');
console.log('   - Envie o arquivo: resources/icon.svg');
console.log('   - Baixe como: resources/icon.png');
console.log('');
console.log('2. Usar ImageMagick (se instalado):');
console.log('   magick resources/icon.svg -resize 256x256 resources/icon.png');
console.log('');
console.log('3. Usar Inkscape (se instalado):');
console.log('   inkscape resources/icon.svg --export-png=resources/icon.png -w 256 -h 256');
console.log('');
console.log('O ícone SVG está pronto em: resources/icon.svg');
