document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const cameraFeed = document.getElementById('cameraFeed');
    const traceImage = document.getElementById('traceImage');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const ctx = drawingCanvas.getContext('2d');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const uploadInput = document.getElementById('upload');
    const lockButton = document.getElementById('lockButton');
    const resetButton = document.getElementById('resetButton');
    const iconUnlocked = document.getElementById('icon-unlocked');
    const iconLocked = document.getElementById('icon-locked');
    const lockText = document.getElementById('lockText');
    const imageInfo = document.getElementById('imageInfo');
    const imageSize = document.getElementById('imageSize');
    const imageScale = document.getElementById('imageScale');
    const imagePosition = document.getElementById('imagePosition');
    const imageRotation = document.getElementById('imageRotation');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    const rotateLeftBtn = document.getElementById('rotateLeft');
    const rotateRightBtn = document.getElementById('rotateRight');
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    
    // Elementos de filtros
    const filtersButton = document.getElementById('filtersButton');
    const filtersModal = document.getElementById('filtersModal');
    const closeFilters = document.getElementById('closeFilters');
    const filterPills = document.querySelectorAll('.filter-pill');
    const flipHorizontalBtn = document.getElementById('flipHorizontal');
    const flipVerticalBtn = document.getElementById('flipVertical');
    
    // Elementos de cuadrícula
    const gridButton = document.getElementById('gridButton');
    const gridModal = document.getElementById('gridModal');
    const closeGrid = document.getElementById('closeGrid');
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gridSizeInput = document.getElementById('gridSizeInput');
    const gridColorPicker = document.getElementById('gridColorPicker');
    const gridToggleSwitch = document.getElementById('gridToggleSwitch');

    // --- Estado ---
    let isLocked = false;
    let currentX = 0;
    let currentY = 0;
    let scale = 1;
    let rotation = 0; // Ángulo de rotación en grados
    let isDragging = false;
    let isPinching = false;
    let startTouchX = 0;
    let startTouchY = 0;
    let startX = 0;
    let startY = 0;
    let initialPinchDistance = 0;
    let initialScale = 1;
    
    // Estado de filtros y efectos
    let currentFilter = 'none';
    let flipHorizontal = 1; // 1 normal, -1 volteado
    let flipVertical = 1; // 1 normal, -1 volteado
    
    // Estado de cuadrícula
    let gridEnabled = false;
    let gridSize = 50;
    let gridColor = '#FFFFFF';
    let gridCanvas = null;
    let gridCtx = null;

    // Prevenir zoom y gestos del navegador (especialmente en iOS)
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    // Prevenir zoom con doble toque
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Prevenir zoom con Ctrl/Cmd + rueda
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // --- 1. Iniciar la Cámara ---
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showMessage("Error: Tu navegador no soporta la cámara.", "error");
            return;
        }

        try {
            // Configuración optimizada para iOS con cámara bloqueada
            const constraints = {
                video: { 
                    facingMode: { exact: 'environment' }, // exact en lugar de ideal para bloquear la cámara
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraFeed.srcObject = stream;
            
            // Bloquear el track de video para evitar cambios
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                console.log("Cámara bloqueada:", capabilities);
            }
            
            // Asegurar que el video se reproduzca en iOS
            cameraFeed.setAttribute('playsinline', 'true');
            cameraFeed.setAttribute('webkit-playsinline', 'true');
            
            // Prevenir interacciones táctiles sobre el video
            cameraFeed.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            cameraFeed.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            cameraFeed.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            
            cameraFeed.play().catch(err => {
                console.warn("Error al reproducir video:", err);
            });
            
            setupCanvas();
        } catch (err) {
            console.warn("Cámara trasera no disponible con 'exact', intentando con 'ideal':", err);
            try {
                // Fallback con ideal en lugar de exact
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
                cameraFeed.srcObject = stream;
                cameraFeed.setAttribute('playsinline', 'true');
                cameraFeed.setAttribute('webkit-playsinline', 'true');
                
                // Prevenir interacciones táctiles sobre el video
                cameraFeed.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
                cameraFeed.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
                cameraFeed.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
                
                cameraFeed.play().catch(err => {
                    console.warn("Error al reproducir video:", err);
                });
                setupCanvas();
                showMessage("Cámara trasera activada y bloqueada.", "info");
                setTimeout(() => {
                    messageBox.classList.add('hidden');
                }, 3000);
            } catch (err2) {
                console.error("Error al acceder a la cámara:", err2);
                let errorMsg = `No se pudo acceder a la cámara: ${err2.message}`;
                if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
                    errorMsg += " Nota: Necesitas HTTPS, localhost o 127.0.0.1 para usar la cámara.";
                }
                showMessage(errorMsg, "error");
            }
        }
    }

    // --- 2. Configurar Canvas ---
    function setupCanvas() {
        const isMobile = window.innerWidth <= 640;
        const viewportHeight = window.innerHeight;
        // Usar 60% o 55% del viewport para la cámara
        const cameraHeightPercent = isMobile ? 0.55 : 0.60;
        const cameraHeight = viewportHeight * cameraHeightPercent;
        
        drawingCanvas.width = window.innerWidth;
        drawingCanvas.height = cameraHeight;
        
        // Configurar canvas de cuadrícula
        if (!gridCanvas) {
            gridCanvas = document.createElement('canvas');
            gridCanvas.id = 'gridCanvas';
            gridCanvas.style.position = 'absolute';
            gridCanvas.style.top = '0';
            gridCanvas.style.left = '0';
            gridCanvas.style.pointerEvents = 'none';
            gridCanvas.style.zIndex = '15';
            gridCanvas.style.display = 'none';
            document.body.insertBefore(gridCanvas, drawingCanvas);
            gridCtx = gridCanvas.getContext('2d');
        }
        
        gridCanvas.width = window.innerWidth;
        gridCanvas.height = cameraHeight;
        
        if (gridEnabled) {
            drawGrid();
        }
    }

    // --- 3. Manejar Subida de Imagen ---
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                traceImage.src = e.target.result;
                traceImage.onload = () => {
                    traceImage.classList.remove('hidden');
                    resetTransform();
                    updateImageInfo();
                    imageInfo.classList.remove('hidden');
                    showMessage("Imagen cargada. Usa gestos para ajustar y rotar.", "info");
                    setTimeout(() => {
                        messageBox.classList.add('hidden');
                    }, 3000);
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. Controles ---
    opacitySlider.addEventListener('input', (event) => {
        const value = event.target.value;
        traceImage.style.opacity = value / 100;
        opacityValue.textContent = value + '%';
    });

    // Control de Rotación con Slider
    rotationSlider.addEventListener('input', (event) => {
        rotation = parseInt(event.target.value);
        rotationValue.textContent = rotation + '°';
        applyTransform();
        updateImageInfo();
    });

    // Botones de rotación rápida
    rotateLeftBtn.addEventListener('click', () => {
        rotation = (rotation - 15) % 360;
        if (rotation < 0) rotation += 360;
        rotationSlider.value = rotation;
        rotationValue.textContent = rotation + '°';
        applyTransform();
        updateImageInfo();
    });

    rotateRightBtn.addEventListener('click', () => {
        rotation = (rotation + 15) % 360;
        rotationSlider.value = rotation;
        rotationValue.textContent = rotation + '°';
        applyTransform();
        updateImageInfo();
    });

    lockButton.addEventListener('click', () => {
        isLocked = !isLocked;
        iconUnlocked.classList.toggle('hidden', isLocked);
        iconLocked.classList.toggle('hidden', !isLocked);
        lockText.textContent = isLocked ? 'Fijo' : 'Libre';
        
        if (isLocked) {
            lockButton.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            lockButton.classList.add('bg-red-600', 'hover:bg-red-700');
            traceImage.classList.add('locked');
        } else {
            lockButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            lockButton.classList.add('bg-gray-700', 'hover:bg-gray-600');
            traceImage.classList.remove('locked');
        }
    });

    resetButton.addEventListener('click', () => {
        if (traceImage.src) {
            resetTransform();
            showMessage("Imagen recentrada", "info");
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 2000);
        }
    });

    // --- 5. Gestos Táctiles ---
    traceImage.addEventListener('touchstart', handleTouchStart, { passive: false });
    traceImage.addEventListener('touchmove', handleTouchMove, { passive: false });
    traceImage.addEventListener('touchend', handleTouchEnd, { passive: false });

    function handleTouchStart(e) {
        if (isLocked) return;
        e.preventDefault();
        
        const touches = e.touches;
        
        if (touches.length === 1) {
            isDragging = true;
            isPinching = false;
            startTouchX = touches[0].clientX;
            startTouchY = touches[0].clientY;
            startX = currentX;
            startY = currentY;
        } else if (touches.length === 2) {
            isDragging = false;
            isPinching = true;
            initialPinchDistance = getDistance(touches[0], touches[1]);
            initialScale = scale;
        }
    }

    function handleTouchMove(e) {
        if (isLocked) return;
        e.preventDefault();
        
        const touches = e.touches;
        
        if (isDragging && touches.length === 1) {
            const deltaX = touches[0].clientX - startTouchX;
            const deltaY = touches[0].clientY - startTouchY;
            currentX = startX + deltaX;
            currentY = startY + deltaY;
            applyTransform();
            updateImageInfo();
        } else if (isPinching && touches.length === 2) {
            const currentDistance = getDistance(touches[0], touches[1]);
            const scaleChange = currentDistance / initialPinchDistance;
            scale = Math.max(0.1, Math.min(5, initialScale * scaleChange));
            applyTransform();
            updateImageInfo();
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length < 2) {
            isPinching = false;
            initialPinchDistance = 0;
        }
        if (e.touches.length < 1) {
            isDragging = false;
        }
    }

    // --- 6. Soporte para Mouse (escritorio) ---
    let isMouseDown = false;
    
    traceImage.addEventListener('mousedown', (e) => {
        if (isLocked) return;
        e.preventDefault();
        isMouseDown = true;
        startTouchX = e.clientX;
        startTouchY = e.clientY;
        startX = currentX;
        startY = currentY;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown || isLocked) return;
        const deltaX = e.clientX - startTouchX;
        const deltaY = e.clientY - startTouchY;
        currentX = startX + deltaX;
        currentY = startY + deltaY;
        applyTransform();
        updateImageInfo();
    });

    document.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    // Zoom con rueda del mouse
    traceImage.addEventListener('wheel', (e) => {
        if (isLocked) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.1, Math.min(5, scale * delta));
        applyTransform();
        updateImageInfo();
    }, { passive: false });

    // --- 7. Funciones Auxiliares ---
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function applyTransform() {
        const flipX = flipHorizontal === -1 ? 'scaleX(-1)' : '';
        const flipY = flipVertical === -1 ? 'scaleY(-1)' : '';
        traceImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale}) rotate(${rotation}deg) ${flipX} ${flipY}`;
    }

    function resetTransform() {
        const isMobile = window.innerWidth <= 640;
        const viewportHeight = window.innerHeight;
        const cameraHeightPercent = isMobile ? 0.55 : 0.60;
        const cameraHeight = viewportHeight * cameraHeightPercent;
        
        const imgRect = traceImage.getBoundingClientRect();
        currentX = (window.innerWidth - imgRect.width) / 2;
        currentY = (cameraHeight - imgRect.height) / 2;
        scale = 1;
        rotation = 0;
        
        traceImage.style.left = '0';
        traceImage.style.top = '0';
        rotationSlider.value = 0;
        rotationValue.textContent = '0°';
        applyTransform();
        updateImageInfo();
    }

    function updateImageInfo() {
        if (traceImage.src) {
            imageSize.textContent = `Tamaño: ${traceImage.naturalWidth}×${traceImage.naturalHeight}px`;
            imageScale.textContent = `Escala: ${Math.round(scale * 100)}%`;
            imagePosition.textContent = `Pos: (${Math.round(currentX)}, ${Math.round(currentY)})`;
            imageRotation.textContent = `Rotación: ${rotation}°`;
        }
    }

    function showMessage(msg, type = "error") {
        messageText.textContent = msg;
        messageBox.classList.remove('bg-red-600', 'bg-blue-600', 'bg-green-600');
        
        if (type === "error") {
            messageBox.classList.add('bg-red-600');
        } else if (type === "info") {
            messageBox.classList.add('bg-blue-600');
        } else if (type === "success") {
            messageBox.classList.add('bg-green-600');
        }
        
        messageBox.classList.remove('hidden');
    }

    closeMessage.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });
    
    // --- 9. Sistema de Filtros ---
    filtersButton.addEventListener('click', () => {
        filtersModal.classList.remove('hidden');
    });
    
    closeFilters.addEventListener('click', () => {
        filtersModal.classList.add('hidden');
    });
    
    filtersModal.addEventListener('click', (e) => {
        if (e.target === filtersModal) {
            filtersModal.classList.add('hidden');
        }
    });
    
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            applyFilter();
        });
    });
    
    function applyFilter() {
        traceImage.style.filter = getFilterCSS(currentFilter);
    }
    
    function getFilterCSS(filter) {
        switch(filter) {
            case 'none':
                return 'none';
            case 'grayscale':
                return 'grayscale(100%)';
            case 'invert':
                return 'invert(100%)';
            case 'contrast':
                return 'contrast(200%) brightness(120%)';
            case 'edge':
                return 'contrast(300%) grayscale(100%) brightness(150%)';
            case 'sepia':
                return 'sepia(100%)';
            default:
                return 'none';
        }
    }
    
    // Efectos de espejo
    flipHorizontalBtn.addEventListener('click', () => {
        flipHorizontal *= -1;
        flipHorizontalBtn.classList.toggle('active');
        applyTransform();
        showMessage(flipHorizontal === -1 ? "Espejo horizontal activado" : "Espejo horizontal desactivado", "info");
        setTimeout(() => messageBox.classList.add('hidden'), 2000);
    });
    
    flipVerticalBtn.addEventListener('click', () => {
        flipVertical *= -1;
        flipVerticalBtn.classList.toggle('active');
        applyTransform();
        showMessage(flipVertical === -1 ? "Espejo vertical activado" : "Espejo vertical desactivado", "info");
        setTimeout(() => messageBox.classList.add('hidden'), 2000);
    });
    
    // --- 10. Sistema de Cuadrícula ---
    gridButton.addEventListener('click', () => {
        gridModal.classList.remove('hidden');
    });
    
    closeGrid.addEventListener('click', () => {
        gridModal.classList.add('hidden');
    });
    
    gridModal.addEventListener('click', (e) => {
        if (e.target === gridModal) {
            gridModal.classList.add('hidden');
        }
    });
    
    // Crear switch de toggle para la cuadrícula
    function createToggleSwitch() {
        const switchEl = document.createElement('div');
        switchEl.className = 'toggle-switch';
        switchEl.innerHTML = `
            <input type="checkbox" id="gridToggle" ${gridEnabled ? 'checked' : ''}>
            <label for="gridToggle" class="toggle-label">
                <span class="toggle-slider"></span>
            </label>
        `;
        gridToggleSwitch.appendChild(switchEl);
        
        const checkbox = switchEl.querySelector('#gridToggle');
        checkbox.addEventListener('change', (e) => {
            gridEnabled = e.target.checked;
            if (gridEnabled) {
                gridCanvas.style.display = 'block';
                drawGrid();
                gridButton.classList.add('active');
                showMessage("Cuadrícula activada", "info");
            } else {
                gridCanvas.style.display = 'none';
                gridButton.classList.remove('active');
                showMessage("Cuadrícula desactivada", "info");
            }
            setTimeout(() => messageBox.classList.add('hidden'), 2000);
        });
    }
    
    gridSizeSlider.addEventListener('input', (e) => {
        gridSize = parseInt(e.target.value);
        gridSizeInput.value = gridSize;
        if (gridEnabled) {
            drawGrid();
        }
    });
    
    gridSizeInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (value < 20) value = 20;
        if (value > 200) value = 200;
        gridSize = value;
        gridSizeSlider.value = gridSize;
        if (gridEnabled) {
            drawGrid();
        }
    });
    
    gridColorPicker.addEventListener('input', (e) => {
        gridColor = e.target.value;
        if (gridEnabled) {
            drawGrid();
        }
    });
    
    function drawGrid() {
        if (!gridCtx) return;
        
        gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        gridCtx.strokeStyle = gridColor;
        gridCtx.lineWidth = 1;
        gridCtx.globalAlpha = 0.5;
        
        // Dibujar líneas verticales
        for (let x = 0; x <= gridCanvas.width; x += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, gridCanvas.height);
            gridCtx.stroke();
        }
        
        // Dibujar líneas horizontales
        for (let y = 0; y <= gridCanvas.height; y += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(gridCanvas.width, y);
            gridCtx.stroke();
        }
        
        gridCtx.globalAlpha = 1;
    }

    // --- 11. Ajustar canvas al redimensionar ---
    window.addEventListener('resize', () => {
        setupCanvas();
    });

    // --- Iniciar App ---
    startCamera();
    createToggleSwitch();
    
    // Mensaje de bienvenida
    showMessage("¡Bienvenido! Carga una imagen para empezar a calcar y rotarla.", "info");
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
});
