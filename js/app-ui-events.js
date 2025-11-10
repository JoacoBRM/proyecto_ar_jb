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

    // ==================== TEMPLATES BUTTON ====================
    const templatesButton = document.getElementById('templatesButton');
    const templatesModal = document.getElementById('templatesModal');
    const closeTemplates = document.getElementById('closeTemplates');
    const templatesGrid = document.getElementById('templatesGrid');
    const uploadTemplate = document.getElementById('uploadTemplate');

    if (templatesButton) {
        templatesButton.addEventListener('click', () => {
            templatesModal.classList.remove('hidden');
            loadTemplates('all');
        });
    }

    if (closeTemplates) {
        closeTemplates.addEventListener('click', () => {
            templatesModal.classList.add('hidden');
        });
    }

    // Cerrar modal al hacer clic fuera
    if (templatesModal) {
        templatesModal.addEventListener('click', (e) => {
            if (e.target === templatesModal) {
                templatesModal.classList.add('hidden');
            }
        });
    }

    // Filtros de categoría
    const categoryButtons = document.querySelectorAll('#templatesModal .filter-pill');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            loadTemplates(category);
        });
    });

    function loadTemplates(category) {
        if (!templatesGrid) return;
        
        const templates = category === 'all' 
            ? app.templateLibrary.getAllTemplates()
            : app.templateLibrary.getTemplatesByCategory(category);
        
        templatesGrid.innerHTML = '';
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-preview">
                    <img src="${template.thumbnailUrl || template.imageUrl}" alt="${template.name}">
                </div>
                <div class="template-info">
                    <h3 class="template-name">${template.name}</h3>
                    <span class="template-category">${template.category}</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                app.traceImage.src = template.imageUrl;
                templatesModal.classList.add('hidden');
                UIHelpers.showToast(`Plantilla "${template.name}" cargada`, "success");
            });
            
            templatesGrid.appendChild(card);
        });
    }

    // Subir plantilla personalizada
    if (uploadTemplate) {
        uploadTemplate.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const name = file.name.replace(/\.[^/.]+$/, "");
                    await app.templateLibrary.saveCustomTemplate(file, name);
                    UIHelpers.showToast("Plantilla guardada", "success");
                    loadTemplates('custom');
                } catch (err) {
                    UIHelpers.showToast("Error al guardar plantilla", "error");
                }
            }
        });
    }

    // ==================== PROJECTS BUTTON ====================
    const projectsButton = document.getElementById('projectsButton');
    const projectsModal = document.getElementById('projectsModal');
    const closeProjects = document.getElementById('closeProjects');
    const saveCurrentProject = document.getElementById('saveCurrentProject');
    const projectsList = document.getElementById('projectsList');
    const exportProject = document.getElementById('exportProject');
    const importProject = document.getElementById('importProject');

    if (projectsButton) {
        projectsButton.addEventListener('click', () => {
            projectsModal.classList.remove('hidden');
            loadProjects();
        });
    }

    if (closeProjects) {
        closeProjects.addEventListener('click', () => {
            projectsModal.classList.add('hidden');
        });
    }

    if (projectsModal) {
        projectsModal.addEventListener('click', (e) => {
            if (e.target === projectsModal) {
                projectsModal.classList.add('hidden');
            }
        });
    }

    if (saveCurrentProject) {
        saveCurrentProject.addEventListener('click', async () => {
            const projectName = await promptProjectName();
            if (projectName) {
                const projectData = {
                    imageData: app.traceImage.src,
                    drawingData: app.drawingTools.exportDrawing(),
                    transform: {
                        x: app.state.currentX,
                        y: app.state.currentY,
                        scale: app.state.scale,
                        rotation: app.state.rotation
                    },
                    opacity: app.opacitySlider.value,
                    filters: app.imageFilters.activeFilters
                };
                
                app.projectManager.saveProject(projectName, projectData);
                UIHelpers.showToast(`Proyecto "${projectName}" guardado`, "success");
                loadProjects();
            }
        });
    }

    async function promptProjectName() {
        return new Promise((resolve) => {
            const name = prompt("Nombre del proyecto:");
            resolve(name);
        });
    }

    function loadProjects() {
        if (!projectsList) return;
        
        const projects = app.projectManager.listProjects();
        projectsList.innerHTML = '';
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<p class="text-gray-400 text-center py-8">No hay proyectos guardados</p>';
            return;
        }
        
        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.innerHTML = `
                <div class="project-item-info">
                    <h3 class="project-item-name">${project.name}</h3>
                    <p class="project-item-date">${UIHelpers.formatDate(project.timestamp)}</p>
                </div>
                <div class="project-item-actions">
                    <button class="project-action-btn load-btn" data-id="${project.id}">Cargar</button>
                    <button class="project-action-btn delete-btn" data-id="${project.id}">Eliminar</button>
                </div>
            `;
            
            // Botón de cargar
            const loadBtn = item.querySelector('.load-btn');
            loadBtn.addEventListener('click', async () => {
                const projectData = await app.projectManager.loadProject(project.id);
                if (projectData) {
                    // Cargar imagen
                    app.traceImage.src = projectData.imageData;
                    
                    // Restaurar transformaciones
                    app.state.currentX = projectData.transform.x;
                    app.state.currentY = projectData.transform.y;
                    app.state.scale = projectData.transform.scale;
                    app.state.rotation = projectData.transform.rotation;
                    app.updateTransform();
                    
                    // Restaurar opacidad
                    app.opacitySlider.value = projectData.opacity;
                    app.traceImage.style.opacity = projectData.opacity / 100;
                    app.opacityValue.textContent = projectData.opacity + '%';
                    
                    // Restaurar dibujos
                    if (projectData.drawingData) {
                        app.drawingTools.importDrawing(projectData.drawingData);
                    }
                    
                    projectsModal.classList.add('hidden');
                    UIHelpers.showToast(`Proyecto "${project.name}" cargado`, "success");
                }
            });
            
            // Botón de eliminar
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                const confirmed = await UIHelpers.confirm(
                    `¿Eliminar "${project.name}"?`,
                    "Esta acción no se puede deshacer."
                );
                if (confirmed) {
                    app.projectManager.deleteProject(project.id);
                    UIHelpers.showToast("Proyecto eliminado", "success");
                    loadProjects();
                }
            });
            
            projectsList.appendChild(item);
        });
    }

    // Exportar proyecto
    if (exportProject) {
        exportProject.addEventListener('click', () => {
            const projects = app.projectManager.listProjects();
            if (projects.length === 0) {
                UIHelpers.showToast("No hay proyectos para exportar", "warning");
                return;
            }
            
            const json = app.projectManager.exportProjectJSON(projects[0].id);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proyecto-calcoar-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UIHelpers.showToast("Proyecto exportado", "success");
        });
    }

    // Importar proyecto
    if (importProject) {
        importProject.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        app.projectManager.importProjectJSON(event.target.result);
                        UIHelpers.showToast("Proyecto importado", "success");
                        loadProjects();
                    } catch (err) {
                        UIHelpers.showToast("Error al importar proyecto", "error");
                    }
                };
                reader.readAsText(file);
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

    // ==================== CAPTURE BUTTON ====================
    const captureButton = document.getElementById('captureButton');
    const captureMenu = document.getElementById('captureMenu');
    const capturePhoto = document.getElementById('capturePhoto');
    const startRecording = document.getElementById('startRecording');
    const shareCapture = document.getElementById('shareCapture');

    let captureMenuVisible = false;
    let longPressTimer;

    if (captureButton) {
        // Click normal - capturar foto
        captureButton.addEventListener('click', () => {
            if (!captureMenuVisible) {
                handleCapturePhoto();
            }
        });

        // Long press - mostrar menú
        captureButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            longPressTimer = setTimeout(() => {
                captureMenu.classList.remove('hidden');
                captureMenuVisible = true;
                UIHelpers.vibrate(50);
            }, 500);
        });

        captureButton.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        captureButton.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (captureMenuVisible && !captureMenu.contains(e.target) && e.target !== captureButton) {
            captureMenu.classList.add('hidden');
            captureMenuVisible = false;
        }
    });

    async function handleCapturePhoto() {
        try {
            const blob = await app.captureTools.captureComposition();
            await app.captureTools.downloadCapture(blob, 'captura-calcoar');
            UIHelpers.showToast("Foto capturada", "success");
        } catch (err) {
            UIHelpers.showToast("Error al capturar", "error");
        }
    }

    if (capturePhoto) {
        capturePhoto.addEventListener('click', async () => {
            captureMenu.classList.add('hidden');
            captureMenuVisible = false;
            await handleCapturePhoto();
        });
    }

    if (startRecording) {
        let isRecording = false;
        startRecording.addEventListener('click', async () => {
            if (!isRecording) {
                try {
                    await app.captureTools.startRecording();
                    isRecording = true;
                    startRecording.textContent = '⏹️ Detener Video';
                    startRecording.classList.add('recording');
                    UIHelpers.showToast("Grabación iniciada", "success");
                } catch (err) {
                    UIHelpers.showToast("Error al grabar", "error");
                }
            } else {
                const blob = await app.captureTools.stopRecording();
                await app.captureTools.downloadCapture(blob, 'video-calcoar');
                isRecording = false;
                startRecording.textContent = '🎥 Iniciar Video';
                startRecording.classList.remove('recording');
                UIHelpers.showToast("Video guardado", "success");
            }
            captureMenu.classList.add('hidden');
            captureMenuVisible = false;
        });
    }

    if (shareCapture) {
        shareCapture.addEventListener('click', async () => {
            captureMenu.classList.add('hidden');
            captureMenuVisible = false;
            
            try {
                const blob = await app.captureTools.captureComposition();
                await app.captureTools.shareCapture(blob, 'Captura de Calco AR');
                UIHelpers.showToast("Compartiendo...", "info");
            } catch (err) {
                UIHelpers.showToast("Error al compartir", "error");
            }
        });
    }
}
