/**
 * ImageFilters.js
 * Módulo para aplicar filtros y efectos a las imágenes
 */

export class ImageFilters {
    constructor(imageElement) {
        this.image = imageElement;
        this.originalFilter = '';
        this.currentFilter = '';
        this.activeFilters = []; // Lista de filtros activos
        this.flipHorizontal = false;
        this.flipVertical = false;
    }

    // Modo blanco y negro
    applyGrayscale() {
        this.currentFilter = 'grayscale(100%)';
        this.activeFilters = ['grayscale'];
        this.updateFilters();
    }

    // Invertir colores
    applyInvert() {
        this.currentFilter = 'invert(100%)';
        this.activeFilters = ['invert'];
        this.updateFilters();
    }

    // Resaltar contornos
    applyEdgeDetection() {
        this.currentFilter = 'contrast(200%) brightness(110%) saturate(0%)';
        this.activeFilters = ['edge'];
        this.updateFilters();
    }

    // Aumentar contraste
    applyHighContrast() {
        this.currentFilter = 'contrast(150%) brightness(105%)';
        this.activeFilters = ['contrast'];
        this.updateFilters();
    }

    // Sepia (vintage)
    applySepia() {
        this.currentFilter = 'sepia(100%)';
        this.activeFilters = ['sepia'];
        this.updateFilters();
    }

    // Quitar todos los filtros
    removeFilters() {
        this.currentFilter = '';
        this.activeFilters = [];
        this.updateFilters();
    }

    // Alias para removeFilters
    resetFilters() {
        this.removeFilters();
    }

    // Flip horizontal (espejo)
    toggleFlipHorizontal() {
        this.flipHorizontal = !this.flipHorizontal;
        this.updateTransform();
    }

    // Flip vertical
    toggleFlipVertical() {
        this.flipVertical = !this.flipVertical;
        this.updateTransform();
    }

    // Restablecer flips
    resetFlips() {
        this.flipHorizontal = false;
        this.flipVertical = false;
        this.updateTransform();
    }

    // Actualizar filtros CSS
    updateFilters() {
        this.image.style.filter = this.currentFilter;
    }

    // Actualizar transformaciones (mantener las existentes)
    updateTransform() {
        const currentTransform = this.image.style.transform || '';
        const scaleX = this.flipHorizontal ? -1 : 1;
        const scaleY = this.flipVertical ? -1 : 1;
        
        // Extraer transformaciones existentes (translate, rotate, scale)
        const translateMatch = currentTransform.match(/translate\([^)]+\)/);
        const rotateMatch = currentTransform.match(/rotate\([^)]+\)/);
        const scaleMatch = currentTransform.match(/scale\([\d.]+\)/);
        
        const translate = translateMatch ? translateMatch[0] : 'translate(0px, 0px)';
        const rotate = rotateMatch ? rotateMatch[0] : 'rotate(0deg)';
        const baseScale = scaleMatch ? scaleMatch[0].match(/[\d.]+/)[0] : '1';
        
        this.image.style.transform = `${translate} scale(${parseFloat(baseScale) * scaleX}, ${parseFloat(baseScale) * scaleY}) ${rotate}`;
    }

    // Obtener estado actual
    getCurrentFilter() {
        return this.currentFilter;
    }

    getFlipState() {
        return {
            horizontal: this.flipHorizontal,
            vertical: this.flipVertical
        };
    }
}
