// ========================================
// FITBATTLE GYM - APLICACIÓN PRINCIPAL
// ========================================

/**
 * Aplicación principal que gestiona toda la interfaz de usuario
 * y conecta con la base de datos y el sistema de gamificación
 */

class FitBattleApp {
    constructor() {
        this.currentSesionEjercicios = [];
        this.editandoUsuarioId = null;
        this.editandoEjercicioId = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.loadInitialData();
        this.setupEventListeners();
        this.updateStats();

        // Establecer fecha por defecto en el formulario de sesión
        const fechaInput = document.getElementById('fecha-sesion');
        if (fechaInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            fechaInput.value = now.toISOString().slice(0, 16);
        }
    }

    // ========================================
    // SISTEMA DE NOTIFICACIONES TOAST
    // ========================================

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '<svg class="ic"><use href="#i-check"/></svg>',
            error: '<svg class="ic"><use href="#i-alert"/></svg>',
            info: '<svg class="ic"><use href="#i-alert"/></svg>',
            warning: '<svg class="ic"><use href="#i-alert"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Cerrar" onclick="this.parentElement.remove()"><svg class="ic"><use href="#i-close"/></svg></button>
        `;

        container.appendChild(toast);

        // Eliminar automáticamente después de 3 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showInfo(message) {
        this.showToast(message, 'info');
    }

    // ========================================
    // NAVEGACIÓN
    // ========================================

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.showSection(sectionId);

                // Actualizar clase activa
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Cerrar menú móvil
                const navMenu = document.getElementById('nav-menu');
                navMenu.classList.remove('active');
            });
        });

        // Botones que llevan a una sección (portada, logo, botón de la barra)
        document.querySelectorAll('[data-goto]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const link = document.querySelector(`.nav-link[data-section="${btn.dataset.goto}"]`);
                if (link) link.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Toggle móvil
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const navMenu = document.getElementById('nav-menu');
                navMenu.classList.toggle('active');
            });
        }
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');

            // Cargar datos específicos según la sección
            switch (sectionId) {
                case 'usuarios':
                    this.renderUsuarios();
                    break;
                case 'ejercicios':
                    this.renderEjercicios();
                    break;
                case 'progreso':
                    this.loadProgreso();
                    break;
            }
        }
    }

    // ========================================
    // MODALES
    // ========================================

    setupModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }

            // Cerrar con Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') modal.classList.remove('active');
            });

            // Cerrar al hacer click fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ========================================
    // CARGA INICIAL DE DATOS
    // ========================================

    loadInitialData() {
        this.renderUsuarios();
        this.renderEjercicios();
        this.updateUsuariosSelect();
        this.updateStats();
        this.updateEjerciciosSelect();
    }

    updateStats() {
        const usuarios = database.getUsuarios();
        const sesiones = database.getSesiones();
        const ejercicios = database.getEjercicios();

        const totalUsuarios = document.getElementById('total-usuarios');
        const totalSesiones = document.getElementById('total-sesiones');
        const totalEjercicios = document.getElementById('total-ejercicios');

        if (totalUsuarios) totalUsuarios.textContent = usuarios.length;
        if (totalSesiones) totalSesiones.textContent = sesiones.length;
        if (totalEjercicios) totalEjercicios.textContent = ejercicios.length;
    }

    // ========================================
    // USUARIOS
    // ========================================

    renderUsuarios() {
        const usuarios = database.getUsuarios();
        const grid = document.getElementById('usuarios-grid');
        if (!grid) return;

        if (usuarios.length === 0) {
            grid.innerHTML = '<div class="empty"><b>Aún no hay socios</b><span>Da de alta al primero con «Nuevo socio».</span></div>';
            return;
        }

        grid.innerHTML = usuarios.map(usuario => {
            const nivel = gamification.obtenerNivelUsuario(usuario);
            const edad = dataModels.calcularEdad(usuario.fechaNacimiento);

            return `
                <div class="usuario-card">
                    <div class="usuario-header">
                        <img src="${usuario.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombreCompleto)}&background=0b2a6f&color=fff&bold=true`}" 
                             alt="${usuario.nombreCompleto}" 
                             class="usuario-foto"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombreCompleto)}&background=0b2a6f&color=fff&bold=true'">
                        <div class="usuario-info">
                            <h3>${usuario.nombreCompleto}</h3>
                            <p>${usuario.email}</p>
                            <p>${edad} años</p>
                        </div>
                    </div>
                    <div class="usuario-badges">
                        <span class="badge badge-nivel">${nivel.nombreNivel}</span>
                        ${usuario.bonoActivo ? '<span class="badge badge-bono">Bono Activo</span>' : ''}
                        <span class="badge badge-puntos">${usuario.puntosTotales} pts</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="app.editarUsuario('${usuario.idUsuario}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="app.eliminarUsuario('${usuario.idUsuario}')">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    nuevoUsuario() {
        this.editandoUsuarioId = null;
        document.getElementById('modal-usuario-titulo').textContent = 'Nuevo socio';
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        this.openModal('modal-usuario');
    }

    editarUsuario(idUsuario) {
        const usuario = database.getUsuario(idUsuario);
        if (!usuario) return;

        this.editandoUsuarioId = idUsuario;
        document.getElementById('modal-usuario-titulo').textContent = 'Editar socio';
        document.getElementById('usuario-id').value = usuario.idUsuario;
        document.getElementById('nombre-completo').value = usuario.nombreCompleto;
        document.getElementById('email').value = usuario.email;
        document.getElementById('telefono').value = usuario.telefono;
        document.getElementById('fecha-nacimiento').value = usuario.fechaNacimiento.split('T')[0];
        document.getElementById('foto-perfil').value = usuario.fotoPerfil || '';
        document.getElementById('bono-activo').checked = usuario.bonoActivo;
        this.openModal('modal-usuario');
    }

    guardarUsuario(e) {
        e.preventDefault();

        const usuarioData = {
            nombreCompleto: document.getElementById('nombre-completo').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            fechaNacimiento: document.getElementById('fecha-nacimiento').value,
            fotoPerfil: document.getElementById('foto-perfil').value,
            bonoActivo: document.getElementById('bono-activo').checked
        };

        const errors = dataModels.validateUsuario(usuarioData);
        if (errors.length > 0) {
            this.showError('Por favor corrige los errores: ' + errors.join(', '));
            return;
        }

        if (this.editandoUsuarioId) {
            const usuario = database.getUsuario(this.editandoUsuarioId);
            usuario.nombreCompleto = usuarioData.nombreCompleto;
            usuario.email = usuarioData.email;
            usuario.telefono = usuarioData.telefono;
            usuario.fechaNacimiento = usuarioData.fechaNacimiento;
            usuario.fotoPerfil = usuarioData.fotoPerfil;
            usuario.bonoActivo = usuarioData.bonoActivo;
            database.saveUsuario(usuario);
        } else {
            const nuevoUsuario = dataModels.createUsuario(usuarioData);
            database.saveUsuario(nuevoUsuario);
        }

        this.closeModal('modal-usuario');
        this.renderUsuarios();
        this.updateUsuariosSelect();
        this.updateStats();
        this.showSuccess(this.editandoUsuarioId ? 'Socio actualizado' : 'Socio dado de alta');
    }

    eliminarUsuario(idUsuario) {
        if (confirm('¿Dar de baja a este socio? También se borrarán todas sus sesiones.')) {
            database.deleteUsuario(idUsuario);
            this.renderUsuarios();
            this.updateUsuariosSelect();
            this.updateStats();
            this.showSuccess('Socio dado de baja');
        }
    }

    updateUsuariosSelect() {
        const usuarios = database.getUsuarios();
        const selects = [
            document.getElementById('select-usuario'),
            document.getElementById('select-usuario-progreso')
        ];

        selects.forEach(select => {
            if (!select) return;
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecciona un socio</option>' +
                usuarios.map(u => `<option value="${u.idUsuario}">${u.nombreCompleto}</option>`).join('');
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    // ========================================
    // EJERCICIOS
    // ========================================

    renderEjercicios() {
        const ejercicios = database.getEjercicios();
        const grid = document.getElementById('ejercicios-grid');
        if (!grid) return;

        if (ejercicios.length === 0) {
            grid.innerHTML = '<div class="empty"><b>El catálogo está vacío</b><span>Añade el primer ejercicio con «Nuevo ejercicio».</span></div>';
            return;
        }

        grid.innerHTML = ejercicios.map(ejercicio => {
            return `
                <div class="ejercicio-card">
                    <div class="ejercicio-header">
                        <h3>${ejercicio.nombreEjercicio}</h3>
                    </div>
                    <div class="ejercicio-meta">
                        <span class="tipo tipo-${(ejercicio.tipo || '').toLowerCase()}">${ejercicio.tipo}</span>
                        <span>${ejercicio.musculoPrincipal}</span>
                    </div>
                    ${ejercicio.videoTutorial ? `
                        <a href="${ejercicio.videoTutorial}" target="_blank" rel="noopener" class="link-video">
                            <svg class="ic"><use href="#i-play"/></svg> Ver tutorial
                        </a>
                    ` : ''}
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="app.editarEjercicio('${ejercicio.idEjercicio}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="app.eliminarEjercicio('${ejercicio.idEjercicio}')">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    nuevoEjercicio() {
        this.editandoEjercicioId = null;
        document.getElementById('modal-ejercicio-titulo').textContent = 'Nuevo ejercicio';
        document.getElementById('form-ejercicio').reset();
        document.getElementById('ejercicio-id').value = '';
        this.openModal('modal-ejercicio');
    }

    editarEjercicio(idEjercicio) {
        const ejercicio = database.getEjercicio(idEjercicio);
        if (!ejercicio) return;

        this.editandoEjercicioId = idEjercicio;
        document.getElementById('modal-ejercicio-titulo').textContent = 'Editar ejercicio';
        document.getElementById('ejercicio-id').value = ejercicio.idEjercicio;
        document.getElementById('nombre-ejercicio').value = ejercicio.nombreEjercicio;
        document.getElementById('tipo-ejercicio').value = ejercicio.tipo;
        document.getElementById('musculo-principal').value = ejercicio.musculoPrincipal;
        document.getElementById('video-tutorial').value = ejercicio.videoTutorial || '';
        this.openModal('modal-ejercicio');
    }

    guardarEjercicio(e) {
        e.preventDefault();

        const ejercicioData = {
            nombreEjercicio: document.getElementById('nombre-ejercicio').value,
            tipo: document.getElementById('tipo-ejercicio').value,
            musculoPrincipal: document.getElementById('musculo-principal').value,
            videoTutorial: document.getElementById('video-tutorial').value
        };

        const errors = dataModels.validateEjercicio(ejercicioData);
        if (errors.length > 0) {
            alert('Errores:\n' + errors.join('\n'));
            return;
        }

        if (this.editandoEjercicioId) {
            const ejercicio = database.getEjercicio(this.editandoEjercicioId);
            ejercicio.nombreEjercicio = ejercicioData.nombreEjercicio;
            ejercicio.tipo = ejercicioData.tipo;
            ejercicio.musculoPrincipal = ejercicioData.musculoPrincipal;
            ejercicio.videoTutorial = ejercicioData.videoTutorial;
            database.saveEjercicio(ejercicio);
        } else {
            const nuevoEjercicio = dataModels.createEjercicio(ejercicioData);
            database.saveEjercicio(nuevoEjercicio);
        }

        this.closeModal('modal-ejercicio');
        this.renderEjercicios();
        this.updateEjerciciosSelect();
    }

    eliminarEjercicio(idEjercicio) {
        if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
            database.deleteEjercicio(idEjercicio);
            this.renderEjercicios();
            this.updateEjerciciosSelect();
        }
    }

    updateEjerciciosSelect() {
        const ejercicios = database.getEjercicios();
        const select = document.getElementById('select-ejercicio-sesion');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona un ejercicio</option>' +
            ejercicios.map(e => `<option value="${e.idEjercicio}">${e.nombreEjercicio} (${e.tipo})</option>`).join('');
    }

    // ========================================
    // SESIONES DE ENTRENAMIENTO
    // ========================================

    agregarEjercicioASesion() {
        this.openModal('modal-ejercicio-sesion');
    }

    guardarEjercicioSesion(e) {
        e.preventDefault();

        const idEjercicio = document.getElementById('select-ejercicio-sesion').value;
        const repeticiones = parseInt(document.getElementById('repeticiones').value) || 0;
        const pesoKg = parseFloat(document.getElementById('peso-kg').value) || 0;
        const minutos = parseInt(document.getElementById('minutos').value) || 0;

        if (!idEjercicio) {
            this.showError('Selecciona un ejercicio');
            return;
        }

        const ejercicio = database.getEjercicio(idEjercicio);
        const sesionEjercicio = {
            idEjercicio: idEjercicio,
            nombreEjercicio: ejercicio.nombreEjercicio,
            tipo: ejercicio.tipo,
            repeticiones: repeticiones,
            pesoKg: pesoKg,
            minutos: minutos
        };

        this.currentSesionEjercicios.push(sesionEjercicio);
        this.renderSesionEjercicios();
        this.closeModal('modal-ejercicio-sesion');
        document.getElementById('form-ejercicio-sesion').reset();
    }

    eliminarEjercicioSesion(index) {
        this.currentSesionEjercicios.splice(index, 1);
        this.renderSesionEjercicios();
    }

    renderSesionEjercicios() {
        const container = document.getElementById('ejercicios-sesion');
        if (!container) return;

        if (this.currentSesionEjercicios.length === 0) {
            container.innerHTML = '<p class="muted">Todavía no has añadido ejercicios a esta sesión.</p>';
            return;
        }

        container.innerHTML = this.currentSesionEjercicios.map((ej, index) => {
            let detalles = [];
            if (ej.repeticiones > 0) detalles.push(`${ej.repeticiones} repeticiones`);
            if (ej.pesoKg > 0) detalles.push(`${ej.pesoKg} kg`);
            if (ej.minutos > 0) detalles.push(`${ej.minutos} minutos`);

            return `
                <div class="ejercicio-item">
                    <div class="ejercicio-item-info">
                        <h4>${ej.nombreEjercicio}</h4>
                        <p>${ej.tipo} - ${detalles.join(', ')}</p>
                    </div>
                    <div class="ejercicio-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="app.eliminarEjercicioSesion(${index})">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    guardarSesion() {
        const idUsuario = document.getElementById('select-usuario').value;
        const fechaSesion = document.getElementById('fecha-sesion').value;
        const duracionMin = parseInt(document.getElementById('duracion-sesion').value);
        const calorias = parseInt(document.getElementById('calorias-sesion').value);

        if (!idUsuario) {
            this.showError('Selecciona un socio');
            return;
        }

        if (this.currentSesionEjercicios.length === 0) {
            this.showError('Añade al menos un ejercicio a la sesión');
            return;
        }

        // Crear sesión
        const sesion = dataModels.createSesionEntrenamiento({
            idUsuario: idUsuario,
            fechaSesion: fechaSesion,
            duracionMin: duracionMin,
            calorias: calorias
        });

        database.saveSesion(sesion);

        // Guardar ejercicios de la sesión
        this.currentSesionEjercicios.forEach(ej => {
            const sesionEjercicio = dataModels.createSesionEjercicio({
                idSesion: sesion.idSesion,
                idEjercicio: ej.idEjercicio,
                repeticiones: ej.repeticiones,
                pesoKg: ej.pesoKg,
                minutos: ej.minutos
            });
            database.saveSesionEjercicio(sesionEjercicio);
        });

        // Calcular y asignar puntos
        const sesionEjercicios = database.getSesionEjerciciosBySesion(sesion.idSesion);
        const puntos = gamification.calcularPuntosSesion(sesion, sesionEjercicios);
        gamification.actualizarPuntosUsuario(idUsuario, puntos);

        // Limpiar formulario
        document.getElementById('duracion-sesion').value = '';
        document.getElementById('calorias-sesion').value = '';
        this.currentSesionEjercicios = [];
        this.renderSesionEjercicios();

        alert(`Sesión guardada exitosamente. Puntos obtenidos: ${puntos}`);
        this.updateStats();
        this.updateUsuariosSelect();
    }

    // ========================================
    // PROGRESO Y GAMIFICACIÓN
    // ========================================

    loadProgreso() {
        const select = document.getElementById('select-usuario-progreso');
        if (select) {
            select.addEventListener('change', () => {
                const idUsuario = select.value;
                if (idUsuario) {
                    this.mostrarProgreso(idUsuario);
                } else {
                    document.getElementById('progreso-detalle').classList.remove('active');
                }
            });
        }
    }

    mostrarProgreso(idUsuario) {
        const usuario = database.getUsuario(idUsuario);
        if (!usuario) return;

        const nivel = gamification.obtenerNivelUsuario(usuario);
        const progreso = gamification.obtenerProgresoNivel(usuario);
        const logros = gamification.obtenerLogrosUsuario(idUsuario);
        const sesiones = database.getSesionesByUsuario(idUsuario).sort((a, b) =>
            new Date(b.fechaSesion) - new Date(a.fechaSesion)
        );

        const container = document.getElementById('progreso-detalle');
        container.innerHTML = `
            <div class="progreso-header">
                <div class="progreso-usuario-info">
                    <img src="${usuario.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombreCompleto)}&background=0b2a6f&color=fff&bold=true`}" 
                         alt="${usuario.nombreCompleto}" 
                         class="progreso-foto"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombreCompleto)}&background=0b2a6f&color=fff&bold=true'">
                    <h3>${usuario.nombreCompleto}</h3>
                    <p>${usuario.email}</p>
                </div>
                <div>
                    <div class="nivel-badge">${nivel.nombreNivel}</div>
                    <div class="puntos-totales">${usuario.puntosTotales} pts</div>
                </div>
            </div>

            <div class="progreso-bars">
                <div class="bar-container">
                    <div class="bar-label">
                        <span>Progreso al siguiente nivel</span>
                        <span>${progreso.porcentaje}%</span>
                    </div>
                    <div class="bar">
                        <div class="bar-fill" style="width: ${progreso.porcentaje}%">
                            ${progreso.siguienteNivel ? `${progreso.puntosActuales}/${progreso.siguienteNivel.puntosMinimos}` : 'Máximo nivel'}
                        </div>
                    </div>
                    ${progreso.siguienteNivel ? `
                        <p class="muted bar-hint">
                            Te faltan ${progreso.puntosNecesarios} puntos para alcanzar: ${progreso.siguienteNivel.nombreNivel}
                        </p>
                    ` : ''}
                </div>
            </div>

            <h3 class="block-title">Logros</h3>
            <div class="logros-grid">
                ${logros.map(logro => `
                    <div class="logro-card ${logro.desbloqueado ? 'desbloqueado' : 'bloqueado'}">
                        <div class="logro-icon">${logro.desbloqueado ? '<svg class="ic"><use href="#i-medal"/></svg>' : '<svg class="ic"><use href="#i-lock"/></svg>'}</div>
                        <h4>${logro.nombreLogro}</h4>
                        <p>${logro.descripcion}</p>
                        ${logro.desbloqueado && logro.fechaObtencion ? `
                            <small class="logro-fecha">
                                Obtenido: ${dataModels.formatearFecha(logro.fechaObtencion)}
                            </small>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            <h3 class="block-title">Historial de sesiones</h3>
            <div class="sesiones-list">
                ${sesiones.length === 0 ? '<p class="muted">Este socio aún no ha registrado sesiones.</p>' :
                sesiones.map(sesion => {
                    const ejercicios = database.getSesionEjerciciosBySesion(sesion.idSesion);
                    const puntos = gamification.calcularPuntosSesion(sesion, ejercicios);

                    return `
                            <div class="sesion-item">
                                <div class="sesion-header">
                                    <div class="sesion-fecha">${dataModels.formatearFechaHora(sesion.fechaSesion)}</div>
                                    <div class="sesion-meta">
                                        <span><svg class="ic"><use href="#i-clock"/></svg> ${sesion.duracionMin} min</span>
                                        <span><svg class="ic"><use href="#i-flame"/></svg> ${sesion.calorias} kcal</span>
                                        <span class="pts"><svg class="ic"><use href="#i-star"/></svg> ${puntos} pts</span>
                                    </div>
                                </div>
                                <div class="sesion-ejercicios">
                                    <strong>Ejercicios (${ejercicios.length})</strong>
                                    ${ejercicios.map(se => {
                        const ejercicio = database.getEjercicio(se.idEjercicio);
                        let detalle = [];
                        if (se.repeticiones > 0) detalle.push(`${se.repeticiones} reps`);
                        if (se.pesoKg > 0) detalle.push(`${se.pesoKg} kg`);
                        if (se.minutos > 0) detalle.push(`${se.minutos} min`);
                        return `<span class="chip">${ejercicio.nombreEjercicio} <em>${detalle.join(' · ')}</em></span>`;
                    }).join('')}
                                </div>
                            </div>
                        `;
                }).join('')
            }
            </div>
        `;

        container.classList.add('active');
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Botones de usuarios
        const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
        if (btnNuevoUsuario) {
            btnNuevoUsuario.addEventListener('click', () => this.nuevoUsuario());
        }

        const formUsuario = document.getElementById('form-usuario');
        if (formUsuario) {
            formUsuario.addEventListener('submit', (e) => this.guardarUsuario(e));
        }

        const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario');
        if (btnCancelarUsuario) {
            btnCancelarUsuario.addEventListener('click', () => this.closeModal('modal-usuario'));
        }

        // Botones de ejercicios
        const btnNuevoEjercicio = document.getElementById('btn-nuevo-ejercicio');
        if (btnNuevoEjercicio) {
            btnNuevoEjercicio.addEventListener('click', () => this.nuevoEjercicio());
        }

        const formEjercicio = document.getElementById('form-ejercicio');
        if (formEjercicio) {
            formEjercicio.addEventListener('submit', (e) => this.guardarEjercicio(e));
        }

        const btnCancelarEjercicio = document.getElementById('btn-cancelar-ejercicio');
        if (btnCancelarEjercicio) {
            btnCancelarEjercicio.addEventListener('click', () => this.closeModal('modal-ejercicio'));
        }

        // Botones de sesión
        const btnAgregarEjercicio = document.getElementById('btn-agregar-ejercicio');
        if (btnAgregarEjercicio) {
            btnAgregarEjercicio.addEventListener('click', () => this.agregarEjercicioASesion());
        }

        const formEjercicioSesion = document.getElementById('form-ejercicio-sesion');
        if (formEjercicioSesion) {
            formEjercicioSesion.addEventListener('submit', (e) => this.guardarEjercicioSesion(e));
        }

        const btnCancelarEjercicioSesion = document.getElementById('btn-cancelar-ejercicio-sesion');
        if (btnCancelarEjercicioSesion) {
            btnCancelarEjercicioSesion.addEventListener('click', () => {
                this.closeModal('modal-ejercicio-sesion');
                document.getElementById('form-ejercicio-sesion').reset();
            });
        }

        const btnGuardarSesion = document.getElementById('btn-guardar-sesion');
        if (btnGuardarSesion) {
            btnGuardarSesion.addEventListener('click', () => this.guardarSesion());
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FitBattleApp();
    window.app = app; // Hacer disponible globalmente para onclick
});

