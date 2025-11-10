/**
 * TemplateLibrary.js
 * Módulo para gestionar plantillas predefinidas
 */

export class TemplateLibrary {
    constructor() {
        this.templates = this.getDefaultTemplates();
        this.loadCustomTemplates();
    }

    // Plantillas predefinidas por categoría
    getDefaultTemplates() {
        return {
            anatomia: [
                {
                    id: 'head-front',
                    name: 'Cabeza (Frontal)',
                    category: 'anatomia',
                    url: 'assets/templates/head-front.svg',
                    description: 'Vista frontal de cabeza humana'
                },
                {
                    id: 'hand-open',
                    name: 'Mano Abierta',
                    category: 'anatomia',
                    url: 'assets/templates/hand-open.svg',
                    description: 'Mano extendida con dedos separados'
                },
                {
                    id: 'body-proportions',
                    name: 'Proporciones Corporales',
                    category: 'anatomia',
                    url: 'assets/templates/body-proportions.svg',
                    description: 'Figura humana con proporciones básicas'
                }
            ],
            animales: [
                {
                    id: 'cat-sitting',
                    name: 'Gato Sentado',
                    category: 'animales',
                    url: 'assets/templates/cat-sitting.svg',
                    description: 'Gato en posición sentada'
                },
                {
                    id: 'dog-profile',
                    name: 'Perro (Perfil)',
                    category: 'animales',
                    url: 'assets/templates/dog-profile.svg',
                    description: 'Perro visto de perfil'
                },
                {
                    id: 'bird-flying',
                    name: 'Pájaro Volando',
                    category: 'animales',
                    url: 'assets/templates/bird-flying.svg',
                    description: 'Pájaro con alas extendidas'
                }
            ],
            geometria: [
                {
                    id: 'cube-perspective',
                    name: 'Cubo en Perspectiva',
                    category: 'geometria',
                    url: 'assets/templates/cube-perspective.svg',
                    description: 'Cubo en perspectiva de dos puntos'
                },
                {
                    id: 'cylinder',
                    name: 'Cilindro',
                    category: 'geometria',
                    url: 'assets/templates/cylinder.svg',
                    description: 'Cilindro básico'
                },
                {
                    id: 'sphere-shading',
                    name: 'Esfera con Sombreado',
                    category: 'geometria',
                    url: 'assets/templates/sphere-shading.svg',
                    description: 'Esfera con guías de sombreado'
                }
            ],
            lettering: [
                {
                    id: 'alphabet-upper',
                    name: 'Alfabeto Mayúsculas',
                    category: 'lettering',
                    url: 'assets/templates/alphabet-upper.svg',
                    description: 'Letras mayúsculas estilo caligráfico'
                },
                {
                    id: 'alphabet-lower',
                    name: 'Alfabeto Minúsculas',
                    category: 'lettering',
                    url: 'assets/templates/alphabet-lower.svg',
                    description: 'Letras minúsculas estilo script'
                },
                {
                    id: 'numbers',
                    name: 'Números Decorativos',
                    category: 'lettering',
                    url: 'assets/templates/numbers.svg',
                    description: 'Números del 0 al 9 decorados'
                }
            ]
        };
    }

    // Cargar plantillas personalizadas desde localStorage
    loadCustomTemplates() {
        try {
            const stored = localStorage.getItem('customTemplates');
            if (stored) {
                const custom = JSON.parse(stored);
                this.templates.custom = custom;
            } else {
                this.templates.custom = [];
            }
        } catch (error) {
            console.error('Error al cargar plantillas personalizadas:', error);
            this.templates.custom = [];
        }
    }

    // Guardar plantilla personalizada
    saveCustomTemplate(name, imageData, category = 'custom') {
        const template = {
            id: `custom-${Date.now()}`,
            name: name,
            category: category,
            url: imageData, // Base64 data URL
            description: 'Plantilla personalizada',
            custom: true,
            createdAt: new Date().toISOString()
        };

        this.templates.custom.push(template);
        this.saveToLocalStorage();
        return template;
    }

    // Eliminar plantilla personalizada
    deleteCustomTemplate(id) {
        const index = this.templates.custom.findIndex(t => t.id === id);
        if (index !== -1) {
            this.templates.custom.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Guardar en localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('customTemplates', JSON.stringify(this.templates.custom));
        } catch (error) {
            console.error('Error al guardar plantillas:', error);
        }
    }

    // Obtener todas las plantillas
    getAllTemplates() {
        return this.templates;
    }

    // Obtener plantillas por categoría
    getTemplatesByCategory(category) {
        return this.templates[category] || [];
    }

    // Obtener plantilla por ID
    getTemplateById(id) {
        for (const category in this.templates) {
            const template = this.templates[category].find(t => t.id === id);
            if (template) return template;
        }
        return null;
    }

    // Obtener categorías disponibles
    getCategories() {
        return [
            { id: 'anatomia', name: 'Anatomía', icon: '👤' },
            { id: 'animales', name: 'Animales', icon: '🐾' },
            { id: 'geometria', name: 'Geometría', icon: '📐' },
            { id: 'lettering', name: 'Lettering', icon: '✍️' },
            { id: 'custom', name: 'Mis Plantillas', icon: '⭐' }
        ];
    }
}
