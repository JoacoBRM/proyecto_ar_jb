/**
 * app.js
 * Archivo principal de la aplicación con arquitectura modular
 */

import { DrawingTools } from './modules/DrawingTools.js';
import { ImageFilters } from './modules/ImageFilters.js';
import { MeasurementTools } from './modules/MeasurementTools.js';
import { CaptureTools } from './modules/CaptureTools.js';
import { TemplateLibrary } from './modules/TemplateLibrary.js';
import { ProjectManager } from './modules/ProjectManager.js';
import { UIHelpers } from './utils/UIHelpers.js';

class CalcoARApp {
    constructor() {
        this.initializeElements();
        this.initializeModules();
        this.initializeState();
        this.setupEventListeners();
        this.startCamera();
    }

    initializeElements() {
        // Elementos DOM principales
        this.cameraFeed = document.getElementById('cameraFeed');
        this.traceImage = document.getElementById('traceImage');
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.ctx = this.drawingCanvas.getContext('2d');
        
        // Controles básicos
        this.opacitySlider = document.getElementById('opacitySlider');
        this.opacityValue = document.getElementById('opacityValue');
        this.uploadInput = document.getElementById('upload');
        this.lockButton = document.getElementById('lockButton');
        this.resetButton = document.getElementById('resetButton');
        this.rotateLeftBtn = document.getElementById('rotateLeft');
        this.rotateRightBtn = document.getElementById('rotateRight');
        this.rotationSlider = document.getElementById('rotationSlider');
        this.rotationValue = document.getElementById('rotationValue');
        
        // Información de imagen
        this.imageInfo = document.getElementById('imageInfo');
        this.imageSize = document.getElementById('imageSize');
        this.imageScale = document.getElementById('imageScale');
        this.imagePosition = document.getElementById('imagePosition');
        this.imageRotation = document.getElementById('imageRotation');
        
        // Íconos
        this.iconUnlocked = document.getElementById('icon-unlocked');
        this.iconLocked = document.getElementById('icon-locked');
        this.lockText = document.getElementById('lockText');
        
        // Mensajes
        this.messageBox = document.getElementById('messageBox');
        this.messageText = document.getElementById('messageText');
        this.closeMessage = document.getElementById('closeMessage');
    }

    initializeModules() {
        // Instanciar módulos
        this.drawingTools = new DrawingTools(this.drawingCanvas, this.ctx);
        this.imageFilters = new ImageFilters(this.traceImage);
        this.measurementTools = new MeasurementTools(this.drawingCanvas, this.ctx);
        this.captureTools = new CaptureTools(this.cameraFeed, this.traceImage, this.drawingCanvas);
        this.templateLibrary = new TemplateLibrary();
        this.projectManager = new ProjectManager();
        
        // Deshabilitar dibujo por defecto
        this.drawingTools.disable();
    }

    initializeState() {
        // Estado de la aplicación
        this.state = {
            isLocked: false,
            currentX: 0,
            currentY: 0,
            scale: 1,
            rotation: 0,
            isDragging: false,
            isPinching: false,
            startTouchX: 0,
            startTouchY: 0,
            startX: 0,
            startY: 0,
            initialPinchDistance: 0,
            initialScale: 1,
            currentTool: 'move', // 'move', 'draw', 'erase', 'ruler'
            drawingEnabled: false
        };

        // Prevenir gestos del navegador
        this.preventBrowserGestures();
    }

    preventBrowserGestures() {
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupEventListeners() {
        // Subida de imagen
        this.uploadInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Controles de opacidad
        this.opacitySlider.addEventListener('input', (e) => this.handleOpacityChange(e));
        
        // Controles de rotación
        this.rotationSlider.addEventListener('input', (e) => this.handleRotationChange(e));
        this.rotateLeftBtn.addEventListener('click', () => this.rotateImage(-15));
        this.rotateRightBtn.addEventListener('click', () => this.rotateImage(15));
        
        // Controles de bloqueo y reset
        this.lockButton.addEventListener('click', () => this.toggleLock());
        this.resetButton.addEventListener('click', () => this.resetTransform());
        
        // Gestos táctiles en la imagen
        this.traceImage.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.traceImage.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.traceImage.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Soporte para mouse
        this.traceImage.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        this.traceImage.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Cierre de mensajes
        this.closeMessage.addEventListener('click', () => this.hideMessage());
        
        // Redimensionamiento
        window.addEventListener('resize', () => this.setupCanvas());
    }

    async startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showMessage("Error: Tu navegador no soporta la cámara.", "error");
            return;
        }

        try {
            const constraints = {
                video: { 
                    facingMode: { exact: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraFeed.srcObject = stream;
            
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                console.log("Cámara bloqueada:", videoTrack.getCapabilities());
            }
            
            this.cameraFeed.setAttribute('playsinline', 'true');
            this.cameraFeed.setAttribute('webkit-playsinline', 'true');
            
            this.cameraFeed.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            this.cameraFeed.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            this.cameraFeed.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            
            await this.cameraFeed.play();
            this.setupCanvas();
            
        } catch (err) {
            console.warn("Cámara trasera no disponible con 'exact', intentando con 'ideal':", err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
                
                this.cameraFeed.srcObject = stream;
                this.cameraFeed.setAttribute('playsinline', 'true');
                this.cameraFeed.setAttribute('webkit-playsinline', 'true');
                
                this.cameraFeed.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
                this.cameraFeed.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
                this.cameraFeed.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
                
                await this.cameraFeed.play();
                this.setupCanvas();
                
                UIHelpers.showToast("Cámara trasera activada y bloqueada.", "success");
                
            } catch (err2) {
                console.error("Error al acceder a la cámara:", err2);
                let errorMsg = `No se pudo acceder a la cámara: ${err2.message}`;
                this.showMessage(errorMsg, "error");
            }
        }
    }

    setupCanvas() {
        const isMobile = window.innerWidth <= 640;
        const viewportHeight = window.innerHeight;
        const cameraHeightPercent = isMobile ? 0.55 : 0.60;
        const cameraHeight = viewportHeight * cameraHeightPercent;
        
        this.drawingCanvas.width = window.innerWidth;
        this.drawingCanvas.height = cameraHeight;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.traceImage.src = e.target.result;
                this.traceImage.onload = () => {
                    this.traceImage.classList.remove('hidden');
                    this.resetTransform();
                    this.updateImageInfo();
                    this.imageInfo.classList.remove('hidden');
                    UIHelpers.showToast("Imagen cargada. Usa gestos para ajustar y rotar.", "success");
                };
            };
            reader.readAsDataURL(file);
        }
    }

    handleOpacityChange(event) {
        const value = event.target.value;
        this.traceImage.style.opacity = value / 100;
        this.opacityValue.textContent = value + '%';
    }

    handleRotationChange(event) {
        this.state.rotation = parseInt(event.target.value);
        this.rotationValue.textContent = this.state.rotation + '°';
        this.applyTransform();
        this.updateImageInfo();
    }

    rotateImage(degrees) {
        this.state.rotation = (this.state.rotation + degrees) % 360;
        if (this.state.rotation < 0) this.state.rotation += 360;
        this.rotationSlider.value = this.state.rotation;
        this.rotationValue.textContent = this.state.rotation + '°';
        this.applyTransform();
        this.updateImageInfo();
    }

    toggleLock() {
        this.state.isLocked = !this.state.isLocked;
        this.iconUnlocked.classList.toggle('hidden', this.state.isLocked);
        this.iconLocked.classList.toggle('hidden', !this.state.isLocked);
        this.lockText.textContent = this.state.isLocked ? 'Fijo' : 'Libre';
        
        if (this.state.isLocked) {
            this.lockButton.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            this.lockButton.classList.add('bg-red-600', 'hover:bg-red-700');
            this.traceImage.classList.add('locked');
        } else {
            this.lockButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            this.lockButton.classList.add('bg-gray-700', 'hover:bg-gray-600');
            this.traceImage.classList.remove('locked');
        }
    }

    resetTransform() {
        if (!this.traceImage.src) return;
        
        const isMobile = window.innerWidth <= 640;
        const viewportHeight = window.innerHeight;
        const cameraHeightPercent = isMobile ? 0.55 : 0.60;
        const cameraHeight = viewportHeight * cameraHeightPercent;
        
        const imgRect = this.traceImage.getBoundingClientRect();
        this.state.currentX = (window.innerWidth - imgRect.width) / 2;
        this.state.currentY = (cameraHeight - imgRect.height) / 2;
        this.state.scale = 1;
        this.state.rotation = 0;
        
        this.traceImage.style.left = '0';
        this.traceImage.style.top = '0';
        this.rotationSlider.value = 0;
        this.rotationValue.textContent = '0°';
        this.applyTransform();
        this.updateImageInfo();
        
        UIHelpers.showToast("Imagen recentrada", "info", 2000);
    }

    applyTransform() {
        this.traceImage.style.transform = `translate(${this.state.currentX}px, ${this.state.currentY}px) scale(${this.state.scale}) rotate(${this.state.rotation}deg)`;
    }

    updateImageInfo() {
        if (this.traceImage.src) {
            this.imageSize.textContent = `Tamaño: ${this.traceImage.naturalWidth}×${this.traceImage.naturalHeight}px`;
            this.imageScale.textContent = `Escala: ${Math.round(this.state.scale * 100)}%`;
            this.imagePosition.textContent = `Pos: (${Math.round(this.state.currentX)}, ${Math.round(this.state.currentY)})`;
            this.imageRotation.textContent = `Rotación: ${this.state.rotation}°`;
        }
    }

    // Gestos táctiles
    handleTouchStart(e) {
        if (this.state.isLocked || this.state.currentTool !== 'move') return;
        e.preventDefault();
        
        const touches = e.touches;
        
        if (touches.length === 1) {
            this.state.isDragging = true;
            this.state.isPinching = false;
            this.state.startTouchX = touches[0].clientX;
            this.state.startTouchY = touches[0].clientY;
            this.state.startX = this.state.currentX;
            this.state.startY = this.state.currentY;
        } else if (touches.length === 2) {
            this.state.isDragging = false;
            this.state.isPinching = true;
            this.state.initialPinchDistance = this.getDistance(touches[0], touches[1]);
            this.state.initialScale = this.state.scale;
        }
    }

    handleTouchMove(e) {
        if (this.state.isLocked || this.state.currentTool !== 'move') return;
        e.preventDefault();
        
        const touches = e.touches;
        
        if (this.state.isDragging && touches.length === 1) {
            const deltaX = touches[0].clientX - this.state.startTouchX;
            const deltaY = touches[0].clientY - this.state.startTouchY;
            this.state.currentX = this.state.startX + deltaX;
            this.state.currentY = this.state.startY + deltaY;
            this.applyTransform();
            this.updateImageInfo();
        } else if (this.state.isPinching && touches.length === 2) {
            const currentDistance = this.getDistance(touches[0], touches[1]);
            const scaleChange = currentDistance / this.state.initialPinchDistance;
            this.state.scale = Math.max(0.1, Math.min(5, this.state.initialScale * scaleChange));
            this.applyTransform();
            this.updateImageInfo();
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length < 2) {
            this.state.isPinching = false;
            this.state.initialPinchDistance = 0;
        }
        if (e.touches.length < 1) {
            this.state.isDragging = false;
        }
    }

    // Soporte para mouse
    handleMouseDown(e) {
        if (this.state.isLocked || this.state.currentTool !== 'move') return;
        e.preventDefault();
        this.state.isDragging = true;
        this.state.startTouchX = e.clientX;
        this.state.startTouchY = e.clientY;
        this.state.startX = this.state.currentX;
        this.state.startY = this.state.currentY;
    }

    handleMouseMove(e) {
        if (!this.state.isDragging || this.state.isLocked || this.state.currentTool !== 'move') return;
        const deltaX = e.clientX - this.state.startTouchX;
        const deltaY = e.clientY - this.state.startTouchY;
        this.state.currentX = this.state.startX + deltaX;
        this.state.currentY = this.state.startY + deltaY;
        this.applyTransform();
        this.updateImageInfo();
    }

    handleMouseUp() {
        this.state.isDragging = false;
    }

    handleWheel(e) {
        if (this.state.isLocked) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.state.scale = Math.max(0.1, Math.min(5, this.state.scale * delta));
        this.applyTransform();
        this.updateImageInfo();
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    showMessage(msg, type = "error") {
        this.messageText.textContent = msg;
        this.messageBox.classList.remove('bg-red-600', 'bg-blue-600', 'bg-green-600');
        
        if (type === "error") {
            this.messageBox.classList.add('bg-red-600');
        } else if (type === "info") {
            this.messageBox.classList.add('bg-blue-600');
        } else if (type === "success") {
            this.messageBox.classList.add('bg-green-600');
        }
        
        this.messageBox.classList.remove('hidden');
    }

    hideMessage() {
        this.messageBox.classList.add('hidden');
    }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    window.calcoApp = new CalcoARApp();
    
    // Importar y configurar eventos de UI
    const { setupUIEvents } = await import('./app-ui-events.js');
    setupUIEvents(window.calcoApp);
    
    UIHelpers.showToast("¡Bienvenido! Carga una imagen para empezar a calcar y rotarla.", "info", 4000);
});

