// ========================================
// FITBATTLE GYM - SISTEMA DE GAMIFICACIÓN
// ========================================

/**
 * Clase para gestionar el sistema de gamificación:
 * - Cálculo de puntos
 * - Niveles
 * - Logros
 */

class Gamification {
    constructor() {
        this.puntosPorRepeticion = 1;
        this.puntosPorKg = 2;
        this.puntosPorMinuto = 3;
        this.puntosPorCaloria = 0.1;
        this.puntosBaseSesion = 10;
    }

    /**
     * Calcula los puntos de una sesión de entrenamiento
     */
    calcularPuntosSesion(sesion, sesionEjercicios) {
        let puntos = this.puntosBaseSesion;
        
        // Puntos por calorías
        puntos += Math.floor(sesion.calorias * this.puntosPorCaloria);
        
        // Puntos por ejercicios
        sesionEjercicios.forEach(se => {
            const ejercicio = database.getEjercicio(se.idEjercicio);
            if (ejercicio) {
                if (ejercicio.tipo === 'Cardio' || ejercicio.tipo === 'Resistencia') {
                    puntos += se.minutos * this.puntosPorMinuto;
                } else {
                    puntos += se.repeticiones * this.puntosPorRepeticion;
                    puntos += se.pesoKg * this.puntosPorKg;
                }
            }
        });
        
        return Math.floor(puntos);
    }

    /**
     * Actualiza los puntos de un usuario
     */
    actualizarPuntosUsuario(idUsuario, puntosSesion) {
        const usuario = database.getUsuario(idUsuario);
        if (!usuario) return null;
        
        usuario.puntosTotales += puntosSesion;
        database.saveUsuario(usuario);
        
        // Verificar si subió de nivel
        this.verificarNivel(usuario);
        
        // Verificar logros
        this.verificarLogros(idUsuario);
        
        return usuario;
    }

    /**
     * Obtiene el nivel actual de un usuario según sus puntos
     */
    obtenerNivelUsuario(usuario) {
        return database.getNivelPorPuntos(usuario.puntosTotales);
    }

    /**
     * Verifica si el usuario subió de nivel
     */
    verificarNivel(usuario) {
        const nivelActual = this.obtenerNivelUsuario(usuario);
        return nivelActual;
    }

    /**
     * Verifica y desbloquea logros
     */
    verificarLogros(idUsuario) {
        const usuario = database.getUsuario(idUsuario);
        if (!usuario) return;
        
        const sesiones = database.getSesionesByUsuario(idUsuario);
        const sesionEjercicios = [];
        
        sesiones.forEach(sesion => {
            const ejercicios = database.getSesionEjerciciosBySesion(sesion.idSesion);
            sesionEjercicios.push(...ejercicios);
        });
        
        // Calcular métricas
        const totalSesiones = sesiones.length;
        const totalCalorias = sesiones.reduce((sum, s) => sum + (s.calorias || 0), 0);
        const totalPeso = sesionEjercicios.reduce((sum, se) => sum + (se.pesoKg || 0), 0);
        const totalMinutos = sesionEjercicios.reduce((sum, se) => sum + (se.minutos || 0), 0);
        
        // Verificar logros
        const logros = database.getLogros();
        
        logros.forEach(logro => {
            if (database.tieneLogro(idUsuario, logro.idLogro)) {
                return; // Ya tiene el logro
            }
            
            let desbloqueado = false;
            
            // Lógica de desbloqueo según el logro
            switch (logro.nombreLogro) {
                case 'Primeros Pasos':
                    desbloqueado = totalSesiones >= 1;
                    break;
                case 'Aprendiz':
                    desbloqueado = totalSesiones >= 5;
                    break;
                case 'Fuerza Bruta':
                    desbloqueado = totalPeso >= 100;
                    break;
                case 'Resistencia':
                    desbloqueado = totalMinutos >= 60;
                    break;
                case 'Quemador':
                    desbloqueado = totalCalorias >= 5000;
                    break;
                case 'Campeón':
                    const nivel = this.obtenerNivelUsuario(usuario);
                    desbloqueado = nivel.nombreNivel === 'Experto';
                    break;
                case 'Leyenda Viva':
                    desbloqueado = usuario.puntosTotales >= 10000;
                    break;
            }
            
            if (desbloqueado) {
                const usuarioLogro = dataModels.createUsuarioLogro({
                    idUsuario: idUsuario,
                    idLogro: logro.idLogro
                });
                database.saveUsuarioLogro(usuarioLogro);
            }
        });
    }

    /**
     * Obtiene el progreso hacia el siguiente nivel
     */
    obtenerProgresoNivel(usuario) {
        const niveles = database.getNiveles().sort((a, b) => a.puntosMinimos - b.puntosMinimos);
        const nivelActual = this.obtenerNivelUsuario(usuario);
        const indexActual = niveles.findIndex(n => n.idNivel === nivelActual.idNivel);
        
        if (indexActual >= niveles.length - 1) {
            return {
                nivelActual: nivelActual,
                siguienteNivel: null,
                puntosActuales: usuario.puntosTotales,
                puntosNecesarios: 0,
                porcentaje: 100
            };
        }
        
        const siguienteNivel = niveles[indexActual + 1];
        const puntosNecesarios = siguienteNivel.puntosMinimos - usuario.puntosTotales;
        const rangoNivel = siguienteNivel.puntosMinimos - nivelActual.puntosMinimos;
        const progreso = usuario.puntosTotales - nivelActual.puntosMinimos;
        const porcentaje = Math.min(100, Math.max(0, (progreso / rangoNivel) * 100));
        
        return {
            nivelActual: nivelActual,
            siguienteNivel: siguienteNivel,
            puntosActuales: usuario.puntosTotales,
            puntosNecesarios: puntosNecesarios,
            porcentaje: Math.floor(porcentaje)
        };
    }

    /**
     * Obtiene los logros de un usuario
     */
    obtenerLogrosUsuario(idUsuario) {
        const todosLogros = database.getLogros();
        const usuarioLogros = database.getUsuarioLogrosByUsuario(idUsuario);
        const logrosIdsDesbloqueados = usuarioLogros.map(ul => ul.idLogro);
        
        return todosLogros.map(logro => ({
            ...logro,
            desbloqueado: logrosIdsDesbloqueados.includes(logro.idLogro),
            fechaObtencion: usuarioLogros.find(ul => ul.idLogro === logro.idLogro)?.fechaObtencion || null
        }));
    }
}

// Crear instancia global
const gamification = new Gamification();

