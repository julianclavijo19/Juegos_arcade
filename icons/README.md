# Iconos PWA

Para que la PWA funcione correctamente, necesitas generar iconos en los siguientes tamaños:

## Tamaños requeridos:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Cómo generar los iconos:

1. **Opción 1:** Usar un generador online como https://realfavicongenerator.net/
2. **Opción 2:** Crear un diseño en tu editor de imágenes favorito (Photoshop, GIMP, Figma, etc.)
3. **Opción 3:** Usar esta herramienta de línea de comandos:
   ```bash
   npm install -g pwa-asset-generator
   pwa-asset-generator icon-source.png ./icons
   ```

## Sugerencia de diseño:

El icono debería representar el tema arcade retro:
- Fondo oscuro (#1a1a2e)
- Un símbolo de joystick, gamepad o texto "ARCADE"
- Colores neón (#ff006e, #3a86ff, #06ffa5)
- Estilo pixelado/retro

Por ahora, puedes crear un ícono simple o usar emojis como placeholder hasta que tengas los diseños finales.

