/**
 * DrawingTools.js
 * Módulo para herramientas de dibujo: lápiz, borrador, colores y grosores
 */

export class DrawingTools {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.currentLineWidth = 3;
        this.currentTool = 'pen'; // 'pen' o 'eraser'
        this.drawingHistory = [];
        this.currentPath = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Mouse events (para desktop)
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    }

    startDrawing(e) {
        if (!this.isEnabled) return;
        
        e.preventDefault();
        this.isDrawing = true;
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.currentPath = [{ x, y }];
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing || !this.isEnabled) return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.currentPath.push({ x, y });
        
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
        this.ctx.lineWidth = this.currentLineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDrawing && this.currentPath.length > 0) {
            this.drawingHistory.push({
                tool: this.currentTool,
                color: this.currentColor,
                lineWidth: this.currentLineWidth,
                path: [...this.currentPath]
            });
        }
        this.isDrawing = false;
        this.currentPath = [];
    }

    setColor(color) {
        this.currentColor = color;
        this.currentTool = 'pen';
    }

    setLineWidth(width) {
        this.currentLineWidth = width;
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    enable() {
        this.isEnabled = true;
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.zIndex = '15';
    }

    disable() {
        this.isEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '5';
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingHistory = [];
    }

    undo() {
        if (this.drawingHistory.length > 0) {
            this.drawingHistory.pop();
            this.redrawCanvas();
        }
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawingHistory.forEach(item => {
            this.ctx.strokeStyle = item.tool === 'eraser' ? '#FFFFFF' : item.color;
            this.ctx.lineWidth = item.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            if (item.tool === 'eraser') {
                this.ctx.globalCompositeOperation = 'destination-out';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(item.path[0].x, item.path[0].y);
            
            for (let i = 1; i < item.path.length; i++) {
                this.ctx.lineTo(item.path[i].x, item.path[i].y);
            }
            
            this.ctx.stroke();
        });
    }

    exportDrawing() {
        return this.canvas.toDataURL('image/png');
    }

    importDrawing(dataURL) {
        if (!dataURL) return;
        
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    }

    clear() {
        this.clearCanvas();
    }
}
