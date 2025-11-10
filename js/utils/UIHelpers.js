/**
 * UIHelpers.js
 * Funciones auxiliares para la interfaz de usuario
 */

export class UIHelpers {
    // Mostrar mensaje temporal
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            info: 'bg-blue-600',
            success: 'bg-green-600',
            warning: 'bg-yellow-600',
            error: 'bg-red-600'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        
        toast.classList.add(colors[type] || colors.info);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    // Confirmar acción
    static async confirm(message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease-out;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: #1F2937;
                padding: 24px;
                border-radius: 12px;
                max-width: 90%;
                width: 320px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            `;
            
            dialog.innerHTML = `
                <p style="color: white; margin-bottom: 20px; font-size: 16px;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancelBtn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #4B5563;
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                    ">${cancelText}</button>
                    <button id="confirmBtn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #3B82F6;
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                    ">${confirmText}</button>
                </div>
            `;
            
            modal.appendChild(dialog);
            document.body.appendChild(modal);
            
            const confirmBtn = dialog.querySelector('#confirmBtn');
            const cancelBtn = dialog.querySelector('#cancelBtn');
            
            confirmBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            
            cancelBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            };
        });
    }

    // Crear toggle switch
    static createToggle(id, label, onChange) {
        const container = document.createElement('div');
        container.className = 'toggle-container';
        container.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.id = id;
        toggle.className = 'toggle-input';
        toggle.style.display = 'none';
        
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = id;
        toggleLabel.className = 'toggle-label';
        toggleLabel.style.cssText = `
            position: relative;
            display: inline-block;
            width: 48px;
            height: 24px;
            background: #4B5563;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.3s;
        `;
        
        const toggleSlider = document.createElement('span');
        toggleSlider.style.cssText = `
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
        `;
        
        toggleLabel.appendChild(toggleSlider);
        
        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                toggleLabel.style.background = '#3B82F6';
                toggleSlider.style.transform = 'translateX(24px)';
            } else {
                toggleLabel.style.background = '#4B5563';
                toggleSlider.style.transform = 'translateX(0)';
            }
            onChange(e.target.checked);
        });
        
        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.color = 'white';
        labelText.style.fontSize = '14px';
        
        container.appendChild(toggle);
        container.appendChild(toggleLabel);
        container.appendChild(labelText);
        
        return container;
    }

    // Formatear fecha
    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Vibrar dispositivo (si está disponible)
    static vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}
