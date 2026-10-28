// ========================================
// FITBATTLE GYM - MODELOS DE DATOS
// ========================================

/**
 * Clase para gestionar los modelos de datos según el esquema 3FN
 * Todas las entidades están definidas según las especificaciones del proyecto
 */

class DataModels {
    constructor() {
        // Estructura de las entidades según el modelo 3FN
        this.entities = {
            USUARIO: {
                idUsuario: null,
                nombreCompleto: '',
                email: '',
                telefono: '',
                fechaNacimiento: null,
                bonoActivo: false,
                fotoPerfil: '',
                puntosTotales: 0
            },
            SESION_ENTRENAMIENTO: {
                idSesion: null,
                idUsuario: null,
                fechaSesion: null,
                duracionMin: 0,
                calorias: 0
            },
            EJERCICIO: {
                idEjercicio: null,
                nombreEjercicio: '',
                tipo: '',
                musculoPrincipal: '',
                videoTutorial: ''
            },
            SESION_EJERCICIO: {
                idSesionEjercicio: null,
                idSesion: null,
                idEjercicio: null,
                repeticiones: 0,
                pesoKg: 0,
                minutos: 0
            },
            NIVEL: {
                idNivel: null,
                nombreNivel: '',
                puntosMinimos: 0
            },
            LOGRO: {
                idLogro: null,
                nombreLogro: '',
                descripcion: '',
                icono: ''
            },
            USUARIO_LOGRO: {
                idUsuarioLogro: null,
                idUsuario: null,
                idLogro: null,
                fechaObtencion: null
            }
        };
    }

    /**
     * Crea un nuevo registro de usuario
     */
    createUsuario(data) {
        return {
            ...this.entities.USUARIO,
            ...data,
            idUsuario: this.generateId(),
            puntosTotales: data.puntosTotales || 0
        };
    }

    /**
     * Crea una nueva sesión de entrenamiento
     */
    createSesionEntrenamiento(data) {
        return {
            ...this.entities.SESION_ENTRENAMIENTO,
            ...data,
            idSesion: this.generateId(),
            fechaSesion: data.fechaSesion || new Date().toISOString()
        };
    }

    /**
     * Crea un nuevo ejercicio
     */
    createEjercicio(data) {
        return {
            ...this.entities.EJERCICIO,
            ...data,
            idEjercicio: this.generateId()
        };
    }

    /**
     * Crea un ejercicio de sesión (tabla intermedia)
     */
    createSesionEjercicio(data) {
        return {
            ...this.entities.SESION_EJERCICIO,
            ...data,
            idSesionEjercicio: this.generateId()
        };
    }

    /**
     * Crea un nivel
     */
    createNivel(data) {
        return {
            ...this.entities.NIVEL,
            ...data,
            idNivel: this.generateId()
        };
    }

    /**
     * Crea un logro
     */
    createLogro(data) {
        return {
            ...this.entities.LOGRO,
            ...data,
            idLogro: this.generateId()
        };
    }

    /**
     * Crea un logro de usuario
     */
    createUsuarioLogro(data) {
        return {
            ...this.entities.USUARIO_LOGRO,
            ...data,
            idUsuarioLogro: this.generateId(),
            fechaObtencion: data.fechaObtencion || new Date().toISOString()
        };
    }

    /**
     * Genera un ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Valida los datos de un usuario
     */
    validateUsuario(usuario) {
        const errors = [];
        if (!usuario.nombreCompleto || usuario.nombreCompleto.trim() === '') {
            errors.push('El nombre completo es requerido');
        }
        if (!usuario.email || !this.isValidEmail(usuario.email)) {
            errors.push('El email es inválido');
        }
        if (!usuario.telefono || usuario.telefono.trim() === '') {
            errors.push('El teléfono es requerido');
        }
        if (!usuario.fechaNacimiento) {
            errors.push('La fecha de nacimiento es requerida');
        }
        return errors;
    }

    /**
     * Valida los datos de un ejercicio
     */
    validateEjercicio(ejercicio) {
        const errors = [];
        if (!ejercicio.nombreEjercicio || ejercicio.nombreEjercicio.trim() === '') {
            errors.push('El nombre del ejercicio es requerido');
        }
        if (!ejercicio.tipo || ejercicio.tipo.trim() === '') {
            errors.push('El tipo de ejercicio es requerido');
        }
        if (!ejercicio.musculoPrincipal || ejercicio.musculoPrincipal.trim() === '') {
            errors.push('El músculo principal es requerido');
        }
        return errors;
    }

    /**
     * Valida un email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     */
    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    /**
     * Formatea una fecha para mostrar
     */
    formatearFecha(fecha) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formatea una fecha con hora
     */
    formatearFechaHora(fecha) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Exportar instancia global
const dataModels = new DataModels();

