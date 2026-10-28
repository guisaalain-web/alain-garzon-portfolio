// ========================================
// FITBATTLE GYM - GESTIÓN DE BASE DE DATOS
// ========================================

/**
 * Clase para gestionar todas las operaciones de base de datos usando localStorage
 * Implementa el modelo 3FN con todas las entidades del sistema
 */

class Database {
    constructor() {
        // Claves para localStorage
        this.keys = {
            usuarios: 'fitbattle_usuarios',
            sesiones: 'fitbattle_sesiones',
            ejercicios: 'fitbattle_ejercicios',
            sesionEjercicios: 'fitbattle_sesion_ejercicios',
            niveles: 'fitbattle_niveles',
            logros: 'fitbattle_logros',
            usuarioLogros: 'fitbattle_usuario_logros'
        };

        // Inicializar datos por defecto
        this.init();
    }

    /**
     * Inicializa la base de datos con datos por defecto
     */
    init() {
        // Inicializar niveles si no existen
        if (!this.getNiveles() || this.getNiveles().length === 0) {
            this.initNiveles();
        }

        // Inicializar logros si no existen
        if (!this.getLogros() || this.getLogros().length === 0) {
            this.initLogros();
        }

        // Inicializar ejercicios por defecto si no existen
        if (!this.getEjercicios() || this.getEjercicios().length === 0) {
            this.initEjercicios();
        }

        // Inicializar datos de ejemplo si no hay usuarios
        if (!this.getUsuarios() || this.getUsuarios().length === 0) {
            this.initDatosEjemplo();
        }
    }

    /**
     * Inicializa datos de ejemplo para demostración
     */
    initDatosEjemplo() {
        // Crear usuarios de ejemplo
        const usuarios = [
            {
                nombreCompleto: 'María García López',
                email: 'maria.garcia@email.com',
                telefono: '+34 612 345 678',
                fechaNacimiento: '1995-03-15',
                bonoActivo: true,
                fotoPerfil: 'https://randomuser.me/api/portraits/women/44.jpg',
                puntosTotales: 1250
            },
            {
                nombreCompleto: 'Carlos Rodríguez Martín',
                email: 'carlos.rodriguez@email.com',
                telefono: '+34 623 456 789',
                fechaNacimiento: '1988-07-22',
                bonoActivo: true,
                fotoPerfil: 'https://randomuser.me/api/portraits/men/32.jpg',
                puntosTotales: 3500
            },
            {
                nombreCompleto: 'Ana Fernández Ruiz',
                email: 'ana.fernandez@email.com',
                telefono: '+34 634 567 890',
                fechaNacimiento: '2000-11-08',
                bonoActivo: false,
                fotoPerfil: 'https://randomuser.me/api/portraits/women/68.jpg',
                puntosTotales: 450
            }
        ];

        usuarios.forEach(userData => {
            const usuario = dataModels.createUsuario(userData);
            this.saveUsuario(usuario);

            // Crear sesiones de ejemplo para cada usuario
            this.crearSesionesEjemplo(usuario.idUsuario);
        });
    }

    /**
     * Crea sesiones de ejemplo para un usuario
     */
    crearSesionesEjemplo(idUsuario) {
        const ejercicios = this.getEjercicios();
        if (ejercicios.length === 0) return;

        // Crear 2-3 sesiones por usuario
        const numSesiones = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < numSesiones; i++) {
            const fechaSesion = new Date();
            fechaSesion.setDate(fechaSesion.getDate() - (i * 3 + Math.floor(Math.random() * 3)));

            const sesion = dataModels.createSesionEntrenamiento({
                idUsuario: idUsuario,
                fechaSesion: fechaSesion.toISOString(),
                duracionMin: Math.floor(Math.random() * 60) + 30,
                calorias: Math.floor(Math.random() * 400) + 200
            });

            this.saveSesion(sesion);

            // Añadir 2-4 ejercicios por sesión
            const numEjercicios = Math.floor(Math.random() * 3) + 2;
            const ejerciciosUsados = [];

            for (let j = 0; j < numEjercicios; j++) {
                let ejercicioRandom;
                do {
                    ejercicioRandom = ejercicios[Math.floor(Math.random() * ejercicios.length)];
                } while (ejerciciosUsados.includes(ejercicioRandom.idEjercicio));

                ejerciciosUsados.push(ejercicioRandom.idEjercicio);

                const sesionEjercicio = dataModels.createSesionEjercicio({
                    idSesion: sesion.idSesion,
                    idEjercicio: ejercicioRandom.idEjercicio,
                    repeticiones: ejercicioRandom.tipo === 'Cardio' ? 0 : Math.floor(Math.random() * 12) + 8,
                    pesoKg: ejercicioRandom.tipo === 'Cardio' ? 0 : Math.floor(Math.random() * 40) + 10,
                    minutos: ejercicioRandom.tipo === 'Cardio' ? Math.floor(Math.random() * 20) + 10 : 0
                });

                this.saveSesionEjercicio(sesionEjercicio);
            }
        }
    }

    /**
     * Inicializa los niveles del sistema
     */
    initNiveles() {
        const niveles = [
            { nombreNivel: 'Principiante', puntosMinimos: 0 },
            { nombreNivel: 'Novato', puntosMinimos: 100 },
            { nombreNivel: 'Intermedio', puntosMinimos: 500 },
            { nombreNivel: 'Avanzado', puntosMinimos: 1000 },
            { nombreNivel: 'Experto', puntosMinimos: 2500 },
            { nombreNivel: 'Maestro', puntosMinimos: 5000 },
            { nombreNivel: 'Leyenda', puntosMinimos: 10000 }
        ];

        niveles.forEach(nivel => {
            const nuevoNivel = dataModels.createNivel(nivel);
            this.saveNivel(nuevoNivel);
        });
    }

    /**
     * Inicializa los logros del sistema
     */
    initLogros() {
        const logros = [
            {
                nombreLogro: 'Primeros Pasos',
                descripcion: 'Completa tu primera sesión',
                icono: '🎯'
            },
            {
                nombreLogro: 'Aprendiz',
                descripcion: 'Completa 5 sesiones',
                icono: '🌟'
            },
            {
                nombreLogro: 'Fuerza Bruta',
                descripcion: 'Levanta más de 100kg en total',
                icono: '💪'
            },
            {
                nombreLogro: 'Resistencia',
                descripcion: 'Corre más de 60 minutos en total',
                icono: '🏃'
            },
            {
                nombreLogro: 'Persistente',
                descripcion: 'Entrena 10 días seguidos',
                icono: '🔥'
            },
            {
                nombreLogro: 'Quemador',
                descripcion: 'Quema más de 5000 calorías',
                icono: '⚡'
            },
            {
                nombreLogro: 'Campeón',
                descripcion: 'Alcanza el nivel Experto',
                icono: '👑'
            },
            {
                nombreLogro: 'Leyenda Viva',
                descripcion: 'Alcanza 10000 puntos',
                icono: '🏆'
            }
        ];

        logros.forEach(logro => {
            const nuevoLogro = dataModels.createLogro(logro);
            this.saveLogro(nuevoLogro);
        });
    }

    /**
     * Inicializa ejercicios por defecto
     */
    initEjercicios() {
        const ejercicios = [
            {
                nombreEjercicio: 'Press de Banca',
                tipo: 'Fuerza',
                musculoPrincipal: 'Pectorales',
                videoTutorial: 'https://www.youtube.com/watch?v=rT7DgCr-3pg'
            },
            {
                nombreEjercicio: 'Sentadillas',
                tipo: 'Fuerza',
                musculoPrincipal: 'Cuádriceps',
                videoTutorial: 'https://www.youtube.com/watch?v=YaXPRqUwItQ'
            },
            {
                nombreEjercicio: 'Peso Muerto',
                tipo: 'Fuerza',
                musculoPrincipal: 'Espalda',
                videoTutorial: 'https://www.youtube.com/watch?v=op9kVnSso6Q'
            },
            {
                nombreEjercicio: 'Carrera',
                tipo: 'Cardio',
                musculoPrincipal: 'Piernas',
                videoTutorial: 'https://www.youtube.com/watch?v=5X7u9ytq0TY'
            },
            {
                nombreEjercicio: 'Press Militar',
                tipo: 'Fuerza',
                musculoPrincipal: 'Hombros',
                videoTutorial: 'https://www.youtube.com/watch?v=2yjwXTZQDDI'
            },
            {
                nombreEjercicio: 'Curl de Bíceps',
                tipo: 'Fuerza',
                musculoPrincipal: 'Bíceps',
                videoTutorial: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
            }
        ];

        ejercicios.forEach(ejercicio => {
            const nuevoEjercicio = dataModels.createEjercicio(ejercicio);
            this.saveEjercicio(nuevoEjercicio);
        });
    }

    // ========================================
    // OPERACIONES CRUD - USUARIOS
    // ========================================

    getUsuarios() {
        const data = localStorage.getItem(this.keys.usuarios);
        return data ? JSON.parse(data) : [];
    }

    saveUsuario(usuario) {
        const usuarios = this.getUsuarios();
        const index = usuarios.findIndex(u => u.idUsuario === usuario.idUsuario);

        if (index >= 0) {
            usuarios[index] = usuario;
        } else {
            usuarios.push(usuario);
        }

        localStorage.setItem(this.keys.usuarios, JSON.stringify(usuarios));
        return usuario;
    }

    deleteUsuario(idUsuario) {
        const usuarios = this.getUsuarios();
        const filtered = usuarios.filter(u => u.idUsuario !== idUsuario);
        localStorage.setItem(this.keys.usuarios, JSON.stringify(filtered));

        // También eliminar sesiones relacionadas
        const sesiones = this.getSesiones().filter(s => s.idUsuario === idUsuario);
        sesiones.forEach(s => this.deleteSesion(s.idSesion));

        return true;
    }

    getUsuario(idUsuario) {
        const usuarios = this.getUsuarios();
        return usuarios.find(u => u.idUsuario === idUsuario) || null;
    }

    // ========================================
    // OPERACIONES CRUD - SESIONES
    // ========================================

    getSesiones() {
        const data = localStorage.getItem(this.keys.sesiones);
        return data ? JSON.parse(data) : [];
    }

    getSesionesByUsuario(idUsuario) {
        return this.getSesiones().filter(s => s.idUsuario === idUsuario);
    }

    saveSesion(sesion) {
        const sesiones = this.getSesiones();
        const index = sesiones.findIndex(s => s.idSesion === sesion.idSesion);

        if (index >= 0) {
            sesiones[index] = sesion;
        } else {
            sesiones.push(sesion);
        }

        localStorage.setItem(this.keys.sesiones, JSON.stringify(sesiones));
        return sesion;
    }

    deleteSesion(idSesion) {
        const sesiones = this.getSesiones();
        const filtered = sesiones.filter(s => s.idSesion !== idSesion);
        localStorage.setItem(this.keys.sesiones, JSON.stringify(filtered));

        // También eliminar ejercicios de la sesión
        const sesionEjercicios = this.getSesionEjercicios().filter(se => se.idSesion === idSesion);
        sesionEjercicios.forEach(se => this.deleteSesionEjercicio(se.idSesionEjercicio));

        return true;
    }

    // ========================================
    // OPERACIONES CRUD - EJERCICIOS
    // ========================================

    getEjercicios() {
        const data = localStorage.getItem(this.keys.ejercicios);
        return data ? JSON.parse(data) : [];
    }

    getEjercicio(idEjercicio) {
        const ejercicios = this.getEjercicios();
        return ejercicios.find(e => e.idEjercicio === idEjercicio) || null;
    }

    saveEjercicio(ejercicio) {
        const ejercicios = this.getEjercicios();
        const index = ejercicios.findIndex(e => e.idEjercicio === ejercicio.idEjercicio);

        if (index >= 0) {
            ejercicios[index] = ejercicio;
        } else {
            ejercicios.push(ejercicio);
        }

        localStorage.setItem(this.keys.ejercicios, JSON.stringify(ejercicios));
        return ejercicio;
    }

    deleteEjercicio(idEjercicio) {
        const ejercicios = this.getEjercicios();
        const filtered = ejercicios.filter(e => e.idEjercicio !== idEjercicio);
        localStorage.setItem(this.keys.ejercicios, JSON.stringify(filtered));
        return true;
    }

    // ========================================
    // OPERACIONES CRUD - SESION EJERCICIOS
    // ========================================

    getSesionEjercicios() {
        const data = localStorage.getItem(this.keys.sesionEjercicios);
        return data ? JSON.parse(data) : [];
    }

    getSesionEjerciciosBySesion(idSesion) {
        return this.getSesionEjercicios().filter(se => se.idSesion === idSesion);
    }

    saveSesionEjercicio(sesionEjercicio) {
        const sesionEjercicios = this.getSesionEjercicios();
        const index = sesionEjercicios.findIndex(se => se.idSesionEjercicio === sesionEjercicio.idSesionEjercicio);

        if (index >= 0) {
            sesionEjercicios[index] = sesionEjercicio;
        } else {
            sesionEjercicios.push(sesionEjercicio);
        }

        localStorage.setItem(this.keys.sesionEjercicios, JSON.stringify(sesionEjercicios));
        return sesionEjercicio;
    }

    deleteSesionEjercicio(idSesionEjercicio) {
        const sesionEjercicios = this.getSesionEjercicios();
        const filtered = sesionEjercicios.filter(se => se.idSesionEjercicio !== idSesionEjercicio);
        localStorage.setItem(this.keys.sesionEjercicios, JSON.stringify(filtered));
        return true;
    }

    // ========================================
    // OPERACIONES CRUD - NIVELES
    // ========================================

    getNiveles() {
        const data = localStorage.getItem(this.keys.niveles);
        return data ? JSON.parse(data) : [];
    }

    getNivel(idNivel) {
        const niveles = this.getNiveles();
        return niveles.find(n => n.idNivel === idNivel) || null;
    }

    saveNivel(nivel) {
        const niveles = this.getNiveles();
        const index = niveles.findIndex(n => n.idNivel === nivel.idNivel);

        if (index >= 0) {
            niveles[index] = nivel;
        } else {
            niveles.push(nivel);
        }

        localStorage.setItem(this.keys.niveles, JSON.stringify(niveles));
        return nivel;
    }

    getNivelPorPuntos(puntos) {
        const niveles = this.getNiveles().sort((a, b) => b.puntosMinimos - a.puntosMinimos);
        return niveles.find(n => puntos >= n.puntosMinimos) || niveles[niveles.length - 1];
    }

    // ========================================
    // OPERACIONES CRUD - LOGROS
    // ========================================

    getLogros() {
        const data = localStorage.getItem(this.keys.logros);
        return data ? JSON.parse(data) : [];
    }

    getLogro(idLogro) {
        const logros = this.getLogros();
        return logros.find(l => l.idLogro === idLogro) || null;
    }

    saveLogro(logro) {
        const logros = this.getLogros();
        const index = logros.findIndex(l => l.idLogro === logro.idLogro);

        if (index >= 0) {
            logros[index] = logro;
        } else {
            logros.push(logro);
        }

        localStorage.setItem(this.keys.logros, JSON.stringify(logros));
        return logro;
    }

    // ========================================
    // OPERACIONES CRUD - USUARIO LOGROS
    // ========================================

    getUsuarioLogros() {
        const data = localStorage.getItem(this.keys.usuarioLogros);
        return data ? JSON.parse(data) : [];
    }

    getUsuarioLogrosByUsuario(idUsuario) {
        return this.getUsuarioLogros().filter(ul => ul.idUsuario === idUsuario);
    }

    saveUsuarioLogro(usuarioLogro) {
        const usuarioLogros = this.getUsuarioLogros();
        const index = usuarioLogros.findIndex(ul =>
            ul.idUsuario === usuarioLogro.idUsuario && ul.idLogro === usuarioLogro.idLogro
        );

        if (index >= 0) {
            usuarioLogros[index] = usuarioLogro;
        } else {
            usuarioLogros.push(usuarioLogro);
        }

        localStorage.setItem(this.keys.usuarioLogros, JSON.stringify(usuarioLogros));
        return usuarioLogro;
    }

    tieneLogro(idUsuario, idLogro) {
        const usuarioLogros = this.getUsuarioLogrosByUsuario(idUsuario);
        return usuarioLogros.some(ul => ul.idLogro === idLogro);
    }
}

// Crear instancia global
const database = new Database();

