// Script para extraer la imagen PNG embebida en el SVG del ícono
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '..', 'assets', 'icon_app.svg')
const svgContent = fs.readFileSync(svgPath, 'utf-8')

// Extraer el base64 del PNG embebido en el SVG
const match = svgContent.match(/data:image\/png;base64,([A-Za-z0-9+/=\s]+)/)
if (!match) {
  console.error('No se encontró imagen PNG embebida en el SVG')
  process.exit(1)
}

const base64Data = match[1].replace(/\s/g, '')
const buffer = Buffer.from(base64Data, 'base64')

const outputDir = path.join(__dirname, '..', 'assets', 'images')

// Guardar como icon.png (reemplaza el actual)
fs.writeFileSync(path.join(outputDir, 'icon.png'), buffer)
console.log('✅ icon.png generado (1024x1024)')

// Guardar como splash-icon.png
fs.writeFileSync(path.join(outputDir, 'splash-icon.png'), buffer)
console.log('✅ splash-icon.png generado')

// Guardar como favicon.png (se usará tal cual, Expo lo redimensiona)
fs.writeFileSync(path.join(outputDir, 'favicon.png'), buffer)
console.log('✅ favicon.png generado')

// Guardar como android foreground
fs.writeFileSync(path.join(outputDir, 'android-icon-foreground.png'), buffer)
console.log('✅ android-icon-foreground.png generado')

console.log('\n🎉 Todos los íconos actualizados con icon_app.svg')
