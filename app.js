document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const cameraFeed = document.getElementById('cameraFeed');
    const traceImage = document.getElementById('traceImage');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const ctx = drawingCanvas.getContext('2d');
    const gridCanvas = document.getElementById('gridCanvas');
    const gridCtx = gridCanvas.getContext('2d');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    const uploadInput = document.getElementById('upload');
    const lockButton = document.getElementById('lockButton');
    const resetButton = document.getElementById('resetButton');
    const filtersButton = document.getElementById('filtersButton');
    const filtersPanel = document.getElementById('filtersPanel');
    const closeFilters = document.getElementById('closeFilters');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gridToggle = document.getElementById('gridToggle');
    const gridText = document.getElementById('gridText');
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

    // --- Estado ---
    let isLocked = false;
    let currentX = 0;
    let currentY = 0;
    let scale = 1;
    let rotation = 0; // Nueva variable para la rotación
    let currentFilter = 'none'; // Filtro actual aplicado
    let isGridVisible = false; // Estado de la cuadrícula
    let isDragging = false;
    let isPinching = false;
    let startTouchX = 0;
    let startTouchY = 0;
    let startX = 0;
    let startY = 0;
    let initialPinchDistance = 0;
    let initialScale = 1;

    // --- 1. Iniciar la Cámara ---
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showMessage("Error: Tu navegador no soporta la cámara.", "error");
            return;
        }

        try {
            // Configuración optimizada para iOS
            const constraints = {
                video: { 
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraFeed.srcObject = stream;
            
            // Asegurar que el video se reproduzca en iOS
            cameraFeed.setAttribute('playsinline', 'true');
            cameraFeed.setAttribute('webkit-playsinline', 'true');
            cameraFeed.play().catch(err => {
                console.warn("Error al reproducir video:", err);
            });
            
            setupCanvas();
        } catch (err) {
            console.warn("Cámara trasera no disponible, intentando frontal:", err);
            try {
                // Fallback a cualquier cámara
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
                cameraFeed.srcObject = stream;
                cameraFeed.setAttribute('playsinline', 'true');
                cameraFeed.setAttribute('webkit-playsinline', 'true');
                cameraFeed.play().catch(err => {
                    console.warn("Error al reproducir video:", err);
                });
                setupCanvas();
                showMessage("Usando cámara frontal. La trasera no está disponible.", "info");
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
        
        gridCanvas.width = window.innerWidth;
        gridCanvas.height = cameraHeight;
        
        // Redibujar cuadrícula si está visible
        if (isGridVisible) {
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
                    showMessage("Imagen cargada. Usa gestos para ajustar.", "info");
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

    // Nuevo control de rotación
    rotationSlider.addEventListener('input', (event) => {
        const value = event.target.value;
        rotation = parseInt(value);
        rotationValue.textContent = value + '°';
        applyTransform();
        updateImageInfo();
    });

    // --- Control de Filtros ---
    filtersButton.addEventListener('click', () => {
        filtersPanel.classList.toggle('hidden');
        if (!filtersPanel.classList.contains('hidden')) {
            filtersButton.classList.add('bg-purple-800');
        } else {
            filtersButton.classList.remove('bg-purple-800');
        }
    });

    closeFilters.addEventListener('click', () => {
        filtersPanel.classList.add('hidden');
        filtersButton.classList.remove('bg-purple-800');
    });

    // Aplicar filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;
            
            // Remover clase activa de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase activa al botón seleccionado
            button.classList.add('active');
            
            // Aplicar filtro
            if (filter === 'none') {
                traceImage.style.filter = 'none';
            } else {
                traceImage.style.filter = filter;
            }
            
            showMessage(`Filtro aplicado: ${button.textContent}`, "success");
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 2000);
        });
    });

    // Toggle de cuadrícula
    gridToggle.addEventListener('click', () => {
        isGridVisible = !isGridVisible;
        
        if (isGridVisible) {
            gridCanvas.classList.remove('hidden');
            drawGrid();
            gridText.textContent = 'Ocultar';
            gridToggle.classList.add('bg-green-600');
            gridToggle.classList.remove('bg-gray-600');
        } else {
            gridCanvas.classList.add('hidden');
            gridText.textContent = 'Mostrar';
            gridToggle.classList.remove('bg-green-600');
            gridToggle.classList.add('bg-gray-600');
        }
    });

    // Función para dibujar la cuadrícula
    function drawGrid() {
        const width = gridCanvas.width;
        const height = gridCanvas.height;
        const gridSize = 50; // Tamaño de cada celda de la cuadrícula
        
        gridCtx.clearRect(0, 0, width, height);
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        gridCtx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= width; x += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, height);
            gridCtx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= height; y += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(width, y);
            gridCtx.stroke();
        }
    }

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
            // Resetear filtros
            currentFilter = 'none';
            traceImage.style.filter = 'none';
            filterButtons.forEach(btn => btn.classList.remove('active'));
            filterButtons[0].classList.add('active'); // Activar "Normal"
            showMessage("Imagen recentrada y filtros reseteados", "info");
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
        traceImage.style.cursor = 'grabbing';
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
        if (isMouseDown) {
            isMouseDown = false;
            traceImage.style.cursor = 'grab';
        }
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
        // Aplicar transformación con rotación incluida
        traceImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale}) rotate(${rotation}deg)`;
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
        rotation = 0; // Resetear rotación
        
        // Resetear slider de rotación
        rotationSlider.value = 0;
        rotationValue.textContent = '0°';
        
        traceImage.style.left = '0';
        traceImage.style.top = '0';
        applyTransform();
        updateImageInfo();
    }

    function updateImageInfo() {
        if (traceImage.src) {
            imageSize.textContent = `Tamaño: ${traceImage.naturalWidth}×${traceImage.naturalHeight}px`;
            imageScale.textContent = `Escala: ${Math.round(scale * 100)}%`;
            imagePosition.textContent = `Pos: (${Math.round(currentX)}, ${Math.round(currentY)})`;
            imageRotation.textContent = `Rot: ${rotation}°`;
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

    // --- 8. Ajustar canvas al redimensionar ---
    window.addEventListener('resize', () => {
        setupCanvas();
    });

    // --- Iniciar App ---
    startCamera();
    
    // Mensaje de bienvenida
    showMessage("¡Bienvenido! Carga una imagen para empezar a calcar.", "info");
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
});
