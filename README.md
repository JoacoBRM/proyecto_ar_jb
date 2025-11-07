# 📱 Visor de Calco AR - Aplicación para iPhone

Aplicación web para calcar dibujos usando la cámara de tu iPhone.

## 🚀 Cómo usar en iPhone desde Laragon

### Opción 1: Acceso desde la misma red WiFi (Recomendado)

1. **Asegúrate que Laragon esté corriendo**
   - Inicia Laragon
   - Verifica que Apache esté activo (luz verde)

2. **Encuentra tu IP local**
   - Abre CMD o PowerShell
   - Ejecuta: `ipconfig`
   - Busca "IPv4 Address" en tu adaptador WiFi (ejemplo: `192.168.1.100`)

3. **Accede desde tu iPhone**
   - Conecta tu iPhone a la **misma red WiFi** que tu PC
   - Abre Safari en tu iPhone
   - Navega a: `http://TU_IP_LOCAL/proyecto_ar_jb/index.html`
   - Ejemplo: `http://192.168.1.100/proyecto_ar_jb/index.html`

4. **Permitir acceso a la cámara**
   - Safari te pedirá permiso para usar la cámara
   - Toca "Permitir"
   - ¡Listo! 🎉

### Opción 2: Usando ngrok (para HTTPS)

Si necesitas HTTPS para funciones avanzadas:

1. **Descarga ngrok**
   - Ve a: https://ngrok.com/download
   - Crea una cuenta gratuita
   - Descarga e instala ngrok

2. **Ejecuta ngrok**
   ```bash
   ngrok http 80
   ```

3. **Copia la URL HTTPS**
   - ngrok te dará una URL como: `https://abc123.ngrok.io`
   - Agrégale la ruta: `https://abc123.ngrok.io/proyecto_ar_jb/index.html`

4. **Accede desde Safari en iPhone**
   - Abre esa URL en Safari
   - Acepta los permisos de cámara
   - ¡Funciona! 🚀

## 📲 Agregar a pantalla de inicio (iPhone)

Para usarla como una app nativa:

1. Abre la página en Safari
2. Toca el botón "Compartir" (cuadro con flecha hacia arriba)
3. Desplázate y toca "Agregar a pantalla de inicio"
4. Dale un nombre (ej: "Calco AR")
5. ¡Ahora tienes un ícono en tu pantalla! 📱

## 🎮 Controles

- **Un dedo**: Arrastra la imagen
- **Dos dedos**: Pellizca para hacer zoom
- **Slider**: Ajusta la opacidad
- **Candado**: Fija la imagen (evita movimientos accidentales)
- **Reset**: Recentra la imagen

## ⚠️ Solución de Problemas

### La cámara no funciona
- ✅ Verifica que estés en Safari (no Chrome)
- ✅ Asegúrate de haber dado permisos de cámara
- ✅ Si usas IP local, verifica que estés en la misma WiFi
- ✅ Intenta recargar la página (F5 o pull-down)

### No puedo acceder a la página
- ✅ Verifica que Laragon esté corriendo
- ✅ Confirma que tu IP sea correcta (ipconfig)
- ✅ Asegúrate de estar en la misma red WiFi
- ✅ Desactiva temporalmente el firewall de Windows

### La imagen no se mueve
- ✅ Verifica que el candado esté "Libre" (no "Fijo")
- ✅ Asegúrate de haber cargado una imagen primero

## 🔧 Características iOS

La aplicación está optimizada para iOS con:
- ✅ Meta tags específicos para iPhone
- ✅ Soporte para agregar a pantalla de inicio
- ✅ Reproducción automática de video
- ✅ Gestos táctiles optimizados
- ✅ Sin zoom accidental
- ✅ Pantalla completa

## 📝 Notas

- Safari en iOS funciona mejor que Chrome para esta app
- La cámara trasera se usa por defecto (ideal para calcar)
- La app funciona completamente offline después de cargarla
- No se guardan datos, todo es local en tu dispositivo

---

¿Problemas? Revisa que:
1. Laragon esté corriendo
2. Estés en la misma WiFi
3. La IP sea correcta
4. Safari tenga permisos de cámara
