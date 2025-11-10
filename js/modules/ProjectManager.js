/**
 * ProjectManager.js
 * Módulo para guardar y cargar proyectos
 */

export class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.projectKey = 'calcoAR_projects';
    }

    // Guardar proyecto actual
    saveProject(projectData) {
        try {
            const project = {
                id: projectData.id || `project-${Date.now()}`,
                name: projectData.name || `Proyecto ${new Date().toLocaleDateString()}`,
                timestamp: new Date().toISOString(),
                imageUrl: projectData.imageUrl || null,
                imageTransform: projectData.imageTransform || {},
                opacity: projectData.opacity || 50,
                filter: projectData.filter || '',
                flipState: projectData.flipState || { horizontal: false, vertical: false },
                drawingData: projectData.drawingData || null,
                rotation: projectData.rotation || 0
            };

            const projects = this.getAllProjects();
            const existingIndex = projects.findIndex(p => p.id === project.id);

            if (existingIndex !== -1) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            localStorage.setItem(this.projectKey, JSON.stringify(projects));
            this.currentProject = project;
            return project;

        } catch (error) {
            console.error('Error al guardar proyecto:', error);
            return null;
        }
    }

    // Cargar proyecto
    loadProject(projectId) {
        try {
            const projects = this.getAllProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                this.currentProject = project;
                return project;
            }
            
            return null;
        } catch (error) {
            console.error('Error al cargar proyecto:', error);
            return null;
        }
    }

    // Obtener todos los proyectos
    getAllProjects() {
        try {
            const stored = localStorage.getItem(this.projectKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error al obtener proyectos:', error);
            return [];
        }
    }

    // Eliminar proyecto
    deleteProject(projectId) {
        try {
            const projects = this.getAllProjects();
            const filtered = projects.filter(p => p.id !== projectId);
            localStorage.setItem(this.projectKey, JSON.stringify(filtered));
            
            if (this.currentProject && this.currentProject.id === projectId) {
                this.currentProject = null;
            }
            
            return true;
        } catch (error) {
            console.error('Error al eliminar proyecto:', error);
            return false;
        }
    }

    // Exportar proyecto como JSON
    exportProjectJSON(projectId) {
        const project = projectId ? this.loadProject(projectId) : this.currentProject;
        
        if (!project) return null;
        
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return project;
    }

    // Importar proyecto desde JSON
    async importProjectJSON(file) {
        try {
            const text = await file.text();
            const project = JSON.parse(text);
            
            // Validar estructura del proyecto
            if (!project.id || !project.timestamp) {
                throw new Error('Formato de proyecto inválido');
            }
            
            // Asignar nuevo ID para evitar conflictos
            project.id = `project-${Date.now()}`;
            project.name = `${project.name} (Importado)`;
            
            return this.saveProject(project);
            
        } catch (error) {
            console.error('Error al importar proyecto:', error);
            return null;
        }
    }

    // Obtener proyecto actual
    getCurrentProject() {
        return this.currentProject;
    }

    // Limpiar proyectos antiguos (más de 30 días)
    cleanOldProjects(days = 30) {
        try {
            const projects = this.getAllProjects();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const filtered = projects.filter(p => {
                const projectDate = new Date(p.timestamp);
                return projectDate >= cutoffDate;
            });
            
            localStorage.setItem(this.projectKey, JSON.stringify(filtered));
            return projects.length - filtered.length; // Cantidad eliminada
            
        } catch (error) {
            console.error('Error al limpiar proyectos:', error);
            return 0;
        }
    }

    // Obtener estadísticas
    getStats() {
        const projects = this.getAllProjects();
        return {
            totalProjects: projects.length,
            oldestProject: projects.length > 0 ? new Date(Math.min(...projects.map(p => new Date(p.timestamp)))) : null,
            newestProject: projects.length > 0 ? new Date(Math.max(...projects.map(p => new Date(p.timestamp)))) : null,
            storageUsed: this.getStorageSize()
        };
    }

    // Calcular tamaño de almacenamiento usado
    getStorageSize() {
        const stored = localStorage.getItem(this.projectKey) || '';
        return (new Blob([stored]).size / 1024).toFixed(2) + ' KB';
    }
}
