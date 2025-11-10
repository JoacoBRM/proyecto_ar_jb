/**
 * MeasurementTools.js
 * Módulo para herramientas de medición: regla, cuadrícula, ángulos
 */

export class MeasurementTools {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridEnabled = false;
        this.gridSize = 50; // píxeles
        this.gridColor = '#FFFFFF'; // Color por defecto
        this.rulerPoints = [];
        this.isDrawingRuler = false;
        this.rulerEnabled = false;
    }

    // Activar/desactivar cuadrícula
    toggleGrid(enabled) {
        if (enabled !== undefined) {
            this.gridEnabled = enabled;
        } else {
            this.gridEnabled = !this.gridEnabled;
        }
        
        if (this.gridEnabled) {
            this.drawGrid();
        } else {
            this.clearGrid();
        }
        return this.gridEnabled;
    }

    // Dibujar cuadrícula
    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.save();
        this.ctx.strokeStyle = this.gridColor || 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    // Limpiar cuadrícula
    clearGrid() {
        // La cuadrícula se redibuja en cada frame, solo cambiar el flag
    }

    // Establecer tamaño de cuadrícula
    setGridSize(size) {
        this.gridSize = size;
        if (this.gridEnabled) {
            this.drawGrid();
        }
    }

    // Iniciar dibujo de regla
    startRuler(x, y) {
        this.isDrawingRuler = true;
        this.rulerPoints = [{ x, y }];
    }

    // Actualizar regla mientras se dibuja
    updateRuler(x, y) {
        if (!this.isDrawingRuler) return;
        
        if (this.rulerPoints.length === 1) {
            this.rulerPoints.push({ x, y });
        } else {
            this.rulerPoints[1] = { x, y };
        }
        
        this.drawRuler();
    }

    // Finalizar regla
    finishRuler() {
        this.isDrawingRuler = false;
        if (this.rulerPoints.length === 2) {
            return this.calculateDistance();
        }
        return null;
    }

    // Dibujar regla
    drawRuler() {
        if (this.rulerPoints.length < 2) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.rulerPoints[0].x, this.rulerPoints[0].y);
        this.ctx.lineTo(this.rulerPoints[1].x, this.rulerPoints[1].y);
        this.ctx.stroke();
        
        // Dibujar puntos
        this.ctx.fillStyle = '#FFD700';
        this.ctx.setLineDash([]);
        
        this.rulerPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Mostrar distancia
        const distance = this.calculateDistance();
        const midX = (this.rulerPoints[0].x + this.rulerPoints[1].x) / 2;
        const midY = (this.rulerPoints[0].y + this.rulerPoints[1].y) / 2;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`${distance.toFixed(0)}px`, midX + 10, midY - 10);
        
        this.ctx.restore();
    }

    // Calcular distancia entre dos puntos
    calculateDistance() {
        if (this.rulerPoints.length < 2) return 0;
        
        const dx = this.rulerPoints[1].x - this.rulerPoints[0].x;
        const dy = this.rulerPoints[1].y - this.rulerPoints[0].y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calcular ángulo entre dos puntos
    calculateAngle() {
        if (this.rulerPoints.length < 2) return 0;
        
        const dx = this.rulerPoints[1].x - this.rulerPoints[0].x;
        const dy = this.rulerPoints[1].y - this.rulerPoints[0].y;
        
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Limpiar reglas
    clearRulers() {
        this.rulerPoints = [];
        this.isDrawingRuler = false;
    }

    // Renderizar todo (llamar en cada frame)
    render() {
        if (this.gridEnabled) {
            this.drawGrid();
        }
        
        if (this.rulerPoints.length > 0) {
            this.drawRuler();
        }
    }

    // Habilitar herramienta de regla
    enableRuler() {
        this.rulerEnabled = true;
    }

    // Deshabilitar herramienta de regla
    disableRuler() {
        this.rulerEnabled = false;
        this.clearRulers();
    }

    // Establecer color de cuadrícula
    setGridColor(color) {
        this.gridColor = color;
        if (this.gridEnabled) {
            this.drawGrid();
        }
    }
}
