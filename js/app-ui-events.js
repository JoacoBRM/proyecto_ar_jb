/**
 * app-ui-events.js
 * Extensión del archivo app.js para manejar los eventos de UI de las nuevas funcionalidades
 * Este archivo debe importarse después de app.js
 */

import { UIHelpers } from './utils/UIHelpers.js';

export function setupUIEvents(app) {
    // ==================== DRAWING TOOLBAR ====================
    const drawingToolbar = document.getElementById('drawingToolbar');
    const colorPicker = document.getElementById('colorPicker');
    const toolButtons = {
        move: document.getElementById('toolMove'),
        pen: document.getElementById('toolPen'),
        eraser: document.getElementById('toolEraser'),
        ruler: document.getElementById('toolRuler'),
        undo: document.getElementById('toolUndo'),
        clear: document.getElementById('toolClear')
    };

    // Mostrar/ocultar herramientas cuando hay imagen cargada
    app.traceImage.addEventListener('load', () => {
        drawingToolbar.classList.remove('hidden');
        colorPicker.classList.remove('hidden');
    });

    // Selector de herramientas
    if (toolButtons.move) {
        toolButtons.move.addEventListener('click', () => {
            setActiveTool('move', toolButtons);
            app.drawingTools.disable();
            app.measurementTools.disableRuler();
            app.state.currentTool = 'move';
        });
    }

    if (toolButtons.pen) {
        toolButtons.pen.addEventListener('click', () => {
            setActiveTool('pen', toolButtons);
            app.drawingTools.enable();
            app.drawingTools.setTool('pen');
            app.measurementTools.disableRuler();
            app.state.currentTool = 'draw';
        });
    }

    if (toolButtons.eraser) {
        toolButtons.eraser.addEventListener('click', () => {
            setActiveTool('eraser', toolButtons);
            app.drawingTools.enable();
            app.drawingTools.setTool('eraser');
            app.measurementTools.disableRuler();
            app.state.currentTool = 'erase';
        });
    }

    if (toolButtons.ruler) {
        toolButtons.ruler.addEventListener('click', () => {
            setActiveTool('ruler', toolButtons);
            app.drawingTools.disable();
            app.measurementTools.enableRuler();
            app.state.currentTool = 'ruler';
        });
    }

    if (toolButtons.undo) {
        toolButtons.undo.addEventListener('click', () => {
            app.drawingTools.undo();
            UIHelpers.showToast("Deshacer último trazo", "info");
        });
    }

    if (toolButtons.clear) {
        toolButtons.clear.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                "¿Limpiar todos los trazos?",
                "Esta acción no se puede deshacer."
            );
            if (confirmed) {
                app.drawingTools.clear();
                UIHelpers.showToast("Trazos eliminados", "success");
            }
        });
    }

    function setActiveTool(toolName, buttons) {
        Object.values(buttons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (buttons[toolName]) {
            buttons[toolName].classList.add('active');
        }
    }

    // ==================== COLOR PICKER ====================
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const brushSize = document.getElementById('brushSize');
    const brushCircle = document.getElementById('brushCircle');

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorSwatches.forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            const color = swatch.dataset.color;
            app.drawingTools.setColor(color);
        });
    });

    if (brushSize) {
        brushSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            app.drawingTools.setLineWidth(size);
            
            // Actualizar preview visual
            if (brushCircle) {
                const displaySize = size * 2;
                brushCircle.style.width = displaySize + 'px';
                brushCircle.style.height = displaySize + 'px';
            }
        });
    }

    // ==================== FILTERS BUTTON ====================
    const filtersButton = document.getElementById('filtersButton');
    const filtersModal = document.getElementById('filtersModal');
    const closeFilters = document.getElementById('closeFilters');
    const flipHorizontal = document.getElementById('flipHorizontal');
    const flipVertical = document.getElementById('flipVertical');

    if (filtersButton) {
        filtersButton.addEventListener('click', () => {
            filtersModal.classList.remove('hidden');
        });
    }

    if (closeFilters) {
        closeFilters.addEventListener('click', () => {
            filtersModal.classList.add('hidden');
        });
    }

    if (filtersModal) {
        filtersModal.addEventListener('click', (e) => {
            if (e.target === filtersModal) {
                filtersModal.classList.add('hidden');
            }
        });
    }

    // Filtros
    const filterButtons = document.querySelectorAll('#filtersModal .filter-pill');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            
            switch(filter) {
                case 'none':
                    app.imageFilters.resetFilters();
                    break;
                case 'grayscale':
                    app.imageFilters.applyGrayscale();
                    break;
                case 'invert':
                    app.imageFilters.applyInvert();
                    break;
                case 'contrast':
                    app.imageFilters.applyHighContrast();
                    break;
                case 'edge':
                    app.imageFilters.applyEdgeDetection();
                    break;
                case 'sepia':
                    app.imageFilters.applySepia();
                    break;
            }
            
            UIHelpers.showToast(`Filtro aplicado: ${btn.textContent}`, "info");
        });
    });

    // Efectos de espejo
    if (flipHorizontal) {
        flipHorizontal.addEventListener('click', () => {
            app.imageFilters.toggleFlipHorizontal();
            flipHorizontal.classList.toggle('active');
            UIHelpers.showToast("Voltear horizontal", "info");
        });
    }

    if (flipVertical) {
        flipVertical.addEventListener('click', () => {
            app.imageFilters.toggleFlipVertical();
            flipVertical.classList.toggle('active');
            UIHelpers.showToast("Voltear vertical", "info");
        });
    }

    // ==================== GRID BUTTON ====================
    const gridButton = document.getElementById('gridButton');
    const gridModal = document.getElementById('gridModal');
    const closeGrid = document.getElementById('closeGrid');
    const gridToggleSwitch = document.getElementById('gridToggleSwitch');
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gridSizeInput = document.getElementById('gridSizeInput');
    const gridColorPicker = document.getElementById('gridColorPicker');

    if (gridButton) {
        gridButton.addEventListener('click', () => {
            gridModal.classList.remove('hidden');
        });
    }

    if (closeGrid) {
        closeGrid.addEventListener('click', () => {
            gridModal.classList.add('hidden');
        });
    }

    if (gridModal) {
        gridModal.addEventListener('click', (e) => {
            if (e.target === gridModal) {
                gridModal.classList.add('hidden');
            }
        });
    }

    // Toggle de cuadrícula
    if (gridToggleSwitch) {
        const toggle = UIHelpers.createToggle('gridToggle', false, (enabled) => {
            if (enabled) {
                app.measurementTools.toggleGrid(true);
                UIHelpers.showToast("Cuadrícula activada", "info");
            } else {
                app.measurementTools.toggleGrid(false);
                UIHelpers.showToast("Cuadrícula desactivada", "info");
            }
        });
        gridToggleSwitch.appendChild(toggle);
    }

    // Tamaño de cuadrícula
    if (gridSizeSlider && gridSizeInput) {
        gridSizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            gridSizeInput.value = size;
            app.measurementTools.setGridSize(size);
        });

        gridSizeInput.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            if (size >= 20 && size <= 200) {
                gridSizeSlider.value = size;
                app.measurementTools.setGridSize(size);
            }
        });
    }

    // Color de cuadrícula
    if (gridColorPicker) {
        gridColorPicker.addEventListener('input', (e) => {
            app.measurementTools.setGridColor(e.target.value);
        });
    }
}
