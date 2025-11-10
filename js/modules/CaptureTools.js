/**
 * CaptureTools.js
 * Módulo para captura de pantalla y exportación
 */

export class CaptureTools {
    constructor(cameraFeed, traceImage, drawingCanvas) {
        this.cameraFeed = cameraFeed;
        this.traceImage = traceImage;
        this.drawingCanvas = drawingCanvas;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }

    // Capturar composición completa como imagen
    async captureComposition() {
        try {
            // Crear un canvas temporal para la composición
            const tempCanvas = document.createElement('canvas');
            const isMobile = window.innerWidth <= 640;
            const viewportHeight = window.innerHeight;
            const cameraHeightPercent = isMobile ? 0.55 : 0.60;
            const cameraHeight = viewportHeight * cameraHeightPercent;
            
            tempCanvas.width = window.innerWidth;
            tempCanvas.height = cameraHeight;
            const ctx = tempCanvas.getContext('2d');
            
            // 1. Dibujar frame de la cámara
            ctx.drawImage(this.cameraFeed, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // 2. Dibujar imagen superpuesta si existe
            if (this.traceImage && !this.traceImage.classList.contains('hidden')) {
                const imgRect = this.traceImage.getBoundingClientRect();
                const transform = this.parseTransform(this.traceImage.style.transform);
                
                ctx.save();
                ctx.globalAlpha = parseFloat(this.traceImage.style.opacity) || 0.5;
                
                // Aplicar transformaciones
                ctx.translate(transform.translateX + imgRect.width / 2, transform.translateY + imgRect.height / 2);
                ctx.scale(transform.scale, transform.scale);
                ctx.rotate(transform.rotate * Math.PI / 180);
                
                ctx.drawImage(
                    this.traceImage,
                    -imgRect.width / 2,
                    -imgRect.height / 2,
                    imgRect.width,
                    imgRect.height
                );
                ctx.restore();
            }
            
            // 3. Dibujar canvas de dibujo
            if (this.drawingCanvas) {
                ctx.drawImage(this.drawingCanvas, 0, 0);
            }
            
            // Convertir a blob
            return new Promise((resolve) => {
                tempCanvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            });
            
        } catch (error) {
            console.error('Error al capturar composición:', error);
            throw error;
        }
    }

    // Descargar imagen capturada
    async downloadCapture() {
        try {
            const blob = await this.captureComposition();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calco-ar-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error al descargar:', error);
            return false;
        }
    }

    // Compartir imagen (Web Share API)
    async shareCapture() {
        try {
            const blob = await this.captureComposition();
            const file = new File([blob], `calco-ar-${Date.now()}.png`, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Calco AR',
                    text: 'Mi composición de Calco AR'
                });
                return true;
            } else {
                // Fallback: descargar
                return await this.downloadCapture();
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            return false;
        }
    }

    // Iniciar grabación de video
    async startRecording() {
        try {
            // Combinar streams
            const stream = this.cameraFeed.srcObject;
            
            if (!stream) {
                throw new Error('No hay stream de cámara disponible');
            }
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            return true;
            
        } catch (error) {
            console.error('Error al iniciar grabación:', error);
            return false;
        }
    }

    // Detener grabación
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            return true;
        }
        return false;
    }

    // Guardar grabación
    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calco-ar-video-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Parsear transform CSS
    parseTransform(transformString) {
        const result = {
            translateX: 0,
            translateY: 0,
            scale: 1,
            rotate: 0
        };
        
        if (!transformString) return result;
        
        const translateMatch = transformString.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (translateMatch) {
            result.translateX = parseFloat(translateMatch[1]);
            result.translateY = parseFloat(translateMatch[2]);
        }
        
        const scaleMatch = transformString.match(/scale\(([\d.]+)\)/);
        if (scaleMatch) {
            result.scale = parseFloat(scaleMatch[1]);
        }
        
        const rotateMatch = transformString.match(/rotate\(([\d.-]+)deg\)/);
        if (rotateMatch) {
            result.rotate = parseFloat(rotateMatch[1]);
        }
        
        return result;
    }
}
