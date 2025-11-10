# � Visor de Calco AR

**Aplicación web para calcar dibujos usando la cámara de tu dispositivo en tiempo real**

Una herramienta simple y poderosa que superpone imágenes sobre la cámara de tu smartphone o tablet, permitiéndote calcar dibujos, diseños o cualquier imagen de referencia sobre papel, lienzo o cualquier superficie.

---

## ✨ ¿Qué puedes hacer con esta aplicación?

### 🎨 **Calco Digital Intuitivo**
Carga cualquier imagen desde tu dispositivo y superpónela sobre lo que estás viendo a través de la cámara. Perfecto para:
- Calcar dibujos y bocetos
- Reproducir diseños en superficies físicas
- Transferir patrones y plantillas
- Practicar técnicas de dibujo
- Copiar proporciones y detalles con precisión

### 📱 **Totalmente Móvil**
Diseñada específicamente para smartphones (especialmente iPhone) y tablets. Usa tu dispositivo móvil como una mesa de luz digital portátil. Llévala contigo a cualquier lugar.

---

## 🎮 Funcionalidades y Controles

### 📂 **Carga de Imágenes**
- **Botón "Subir"**: Carga cualquier imagen desde tu galería o archivos
- Soporta formatos: JPG, PNG, GIF y más
- Vista previa instantánea sobre la cámara

### 🔄 **Transformación Completa de la Imagen**

#### **Movimiento (Posición)**
- **Táctil**: Arrastra con un dedo para mover la imagen en cualquier dirección
- **Mouse**: Click y arrastra para reposicionar
- Movimiento fluido y preciso en tiempo real
- Información de posición mostrada en pantalla

#### **Escala (Zoom)**
- **Táctil**: Pellizca con dos dedos para acercar o alejar
- **Mouse**: Usa la rueda del mouse para zoom
- Rango de escala: 10% - 500%
- Zoom suave y progresivo

#### **Rotación**
- **Slider de rotación**: Control fino de 0° a 359°
- **Botón rotar izquierda (⟲)**: Gira -15° cada click
- **Botón rotar derecha (⟳)**: Gira +15° cada click
- Rotación en tiempo real con indicador de ángulo
- Perfecto para ajustar la orientación de tu referencia

### 🎨 **Control de Opacidad**
- Slider interactivo para ajustar transparencia (0% - 100%)
- Valor predeterminado: 50%
- Permite ver tanto la imagen como lo que dibujas debajo
- Ajuste en tiempo real sin interrupciones

### 🔒 **Sistema de Bloqueo**
- **Botón "Libre/Fijo"**: Congela la posición de la imagen
- Evita movimientos accidentales mientras calcas
- Indicador visual del estado (gris = libre, rojo = bloqueado)
- Toca nuevamente para desbloquear

### 🔄 **Reset Inteligente**
- **Botón "Reset"**: Recentra y restaura la imagen
- Vuelve a escala 100%, rotación 0° y posición central
- Útil para empezar de nuevo rápidamente

### 📊 **Panel de Información**
Muestra en tiempo real:
- **Tamaño**: Dimensiones originales de la imagen (ancho × alto)
- **Escala**: Porcentaje de zoom actual
- **Posición**: Coordenadas X, Y en la pantalla
- **Rotación**: Ángulo actual en grados

### 📹 **Visor de Cámara**
- Acceso automático a la cámara trasera (ideal para calcar)
- Fallback a cámara frontal si no está disponible
- Vista en tiempo real sin lag
- Optimizado para rendimiento en móviles

---

## 💡 Casos de Uso

### 🎨 **Para Artistas**
- Calcar bocetos y referencias fotográficas
- Transferir dibujos a lienzos o superficies grandes
- Practicar proporciones y anatomía
- Recrear obras de arte con precisión

### 📐 **Para Diseñadores**
- Reproducir logos y diseños en físico
- Transferir patrones de diseño gráfico
- Crear murales y arte urbano
- Prototipar diseños sobre maquetas

### 🎓 **Para Estudiantes**
- Aprender técnicas de dibujo
- Practicar caligrafía y lettering
- Estudiar proporciones y perspectiva
- Reproducir ejercicios y tareas

### 🏠 **Para DIY y Manualidades**
- Decoración de paredes y muebles
- Stencils y plantillas personalizadas
- Proyectos de craft y scrapbooking
- Personalización de objetos

---

## 🌟 Características Técnicas

### ✅ **Diseño Responsive**
- Interfaz adaptada a móviles, tablets y desktop
- Controles táctiles optimizados (mínimo 56px para botones)
- Uso de viewport dinámico (dvh) para máxima compatibilidad
- Respeta las áreas seguras de iOS (notch y barra inferior)

### ✅ **Optimizado para iOS**
- Meta tags específicos para iPhone y iPad
- Compatible con modo "Agregar a pantalla de inicio"
- Gestos nativos optimizados
- Sin zoom accidental de página
- Soporte para cámaras de alta resolución (hasta 1920×1080)

### ✅ **Gestos Intuitivos**
- Control con un dedo: mover
- Control con dos dedos: escalar
- Control con slider: rotar y opacidad
- Soporte completo para mouse en desktop

### ✅ **Sin Instalación**
- Aplicación web progresiva (PWA)
- No requiere descarga desde App Store
- Funciona directamente desde el navegador
- Sin ocupar espacio en el dispositivo

### ✅ **Privacidad Total**
- Procesamiento local en el dispositivo
- No se envían datos a servidores externos
- Las imágenes nunca salen de tu teléfono
- Sin registro ni cuenta requerida

---

## � Compatibilidad

- **Navegadores**: Safari (iOS), Chrome, Firefox, Edge
- **Dispositivos**: iPhone, iPad, Android, tablets, desktop
- **Sistema**: iOS 11+, Android 5+, Windows, macOS, Linux
- **Recomendado**: Safari en iPhone para mejor experiencia

---

## 📱 Uso Rápido

1. **Abre la aplicación** en tu navegador móvil
2. **Permite el acceso a la cámara** cuando se solicite
3. **Toca "Subir"** para cargar tu imagen de referencia
4. **Ajusta** posición, escala, rotación y opacidad
5. **Bloquea** la imagen cuando esté lista
6. **¡Empieza a calcar!** 🎨

---

## 🎯 Interfaz Simplificada

```
┌─────────────────────────────┐
│                             │
│    📹 VISOR DE CÁMARA       │ ← 55-60% de la pantalla
│      + Imagen Superpuesta   │
│                             │
├─────────────────────────────┤
│ 📊 Info: Tamaño │ Escala │  │
│         Posición │ Rotación │
├─────────────────────────────┤
│ 🔄 Rotación        0°       │
│   [⟲] ━━━━━━━ [⟳]          │
├─────────────────────────────┤
│ 🎨 Opacidad        50%      │
│       ━━━━━━━━━             │
├─────────────────────────────┤
│ [📤 Subir] [🔄 Reset] [🔓]  │
└─────────────────────────────┘
    ↑ Panel de controles (40-45%)
```

---

## 💻 Tecnologías

- **HTML5 + CSS3**: Diseño responsive moderno
- **JavaScript Vanilla**: Sin dependencias externas
- **MediaDevices API**: Acceso nativo a la cámara
- **Touch Events API**: Gestos táctiles optimizados
- **CSS Transforms**: Manipulación de imagen en tiempo real
- **TailwindCSS**: Framework de utilidades CSS

---

**🎨 Calca. Crea. Comparte.**

*Una herramienta simple pero poderosa para llevar tus ideas del mundo digital al físico.*
