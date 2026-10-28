// Datos precargados
let appData = null;
let currentSimulation = null;

// Cargar datos JSON
async function loadData() {
    try {
        appData = window.F1_DATA;
        if (!appData) throw new Error('sin datos');
        populateSelects();
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Datos de respaldo si falla la carga
        appData = {
            circuits: [],
            drivers: [],
            tyres: {},
            pitStopTime: 22.0
        };
    }
}

// Poblar selects con datos
function populateSelects() {
    const circuitSelect = document.getElementById('circuit');
    const driverSelect = document.getElementById('driver');

    // Limpiar opciones existentes (excepto la primera)
    circuitSelect.innerHTML = '<option value="">Selecciona un circuito</option>';
    driverSelect.innerHTML = '<option value="">Selecciona un piloto</option>';

    // Poblar circuitos
    appData.circuits.forEach(circuit => {
        const option = document.createElement('option');
        option.value = circuit.id;
        option.textContent = `${circuit.name} (${circuit.type})`;
        circuitSelect.appendChild(option);
    });

    // Poblar pilotos
    appData.drivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = `${driver.name} - ${driver.team}`;
        driverSelect.appendChild(option);
    });
}

// Manejo de pestañas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        if (tabName === 'history') {
            loadHistory();
        }
    });
});

// Añadir paradas adicionales
let activeStints = 1;
const addStintBtn = document.getElementById('add-stint-btn');
addStintBtn.addEventListener('click', () => {
    if (activeStints < 3) {
        const nextStint = document.querySelector(`.stint[data-stint="${activeStints}"]`);
        if (nextStint) {
            nextStint.style.display = 'block';
            activeStints++;
            if (activeStints === 3) {
                addStintBtn.style.display = 'none';
            }
        }
    }
});

// Actualizar vueltas del primer stint cuando cambia el total
document.getElementById('laps').addEventListener('input', (e) => {
    if (activeStints === 1) {
        const firstStintLaps = document.querySelector('.stint[data-stint="0"] .stint-laps');
        if (firstStintLaps && !firstStintLaps.value) {
            firstStintLaps.value = e.target.value;
        }
    }
});

// Simular estrategia
document.getElementById('strategy-form').addEventListener('submit', (e) => {
    e.preventDefault();
    simulateStrategy();
});

function simulateStrategy() {
    const circuitId = document.getElementById('circuit').value;
    const driverId = document.getElementById('driver').value;
    const weather = document.getElementById('weather').value;
    const totalLaps = parseInt(document.getElementById('laps').value);

    if (!circuitId || !driverId) {
        alert('Por favor selecciona un circuito y un piloto');
        return;
    }

    const circuit = appData.circuits.find(c => c.id === circuitId);
    const driver = appData.drivers.find(d => d.id === driverId);

    // Recopilar stints
    const stints = [];
    for (let i = 0; i < activeStints; i++) {
        const stintElement = document.querySelector(`.stint[data-stint="${i}"]`);
        if (stintElement && stintElement.style.display !== 'none') {
            const tyreType = stintElement.querySelector('.tyre-type').value;
            const laps = parseInt(stintElement.querySelector('.stint-laps').value);
            stints.push({ tyreType, laps });
        }
    }

    // Validar que las vueltas sumen correctamente
    const totalStintLaps = stints.reduce((sum, stint) => sum + stint.laps, 0);
    if (totalStintLaps !== totalLaps) {
        alert(`La suma de vueltas de los stints (${totalStintLaps}) debe ser igual al total de vueltas (${totalLaps})`);
        return;
    }

    // Calcular tiempo de carrera
    const result = calculateRaceTime(circuit, driver, weather, stints, totalLaps);

    // Mostrar resultado
    displayResult(result, circuit, driver, weather, stints);
    currentSimulation = { result, circuit, driver, weather, stints, totalLaps, timestamp: new Date() };
}

function calculateRaceTime(circuit, driver, weather, stints, totalLaps) {
    let totalTime = 0;
    let pitStops = stints.length - 1; // Número de paradas (stints - 1)
    const pitStopTime = appData.pitStopTime;
    
    const results = {
        stints: [],
        totalTime: 0,
        pitStops: pitStops,
        totalPitTime: pitStops * pitStopTime
    };

    stints.forEach((stint, index) => {
        const tyre = appData.tyres[stint.tyreType];
        if (!tyre) return;

        // Tiempo base por vuelta
        let baseLapTime = circuit.baseLapTime;

        // Ajuste por piloto (skill)
        baseLapTime *= driver.skillMultiplier;

        // Ajuste por neumático
        baseLapTime += tyre.baseTime;

        // Ajuste por clima
        if (weather === 'lluvia') {
            if (stint.tyreType === 'wet' || stint.tyreType === 'intermediate') {
                baseLapTime += tyre.rainPenalty; // Penalty negativo = bonus
            } else {
                baseLapTime += 5.0; // Penalización por neumático incorrecto
            }
        } else if (weather === 'variable') {
            if (stint.tyreType === 'wet' || stint.tyreType === 'intermediate') {
                baseLapTime += 1.0; // Pequeña penalización
            }
        } else { // soleado
            if (stint.tyreType === 'wet' || stint.tyreType === 'intermediate') {
                baseLapTime += 8.0; // Gran penalización
            }
        }

        // Calcular tiempo del stint con degradación
        let stintTime = 0;
        const wearMultiplier = circuit.wearMultiplier * tyre.wearRate;
        
        for (let lap = 0; lap < stint.laps; lap++) {
            // Degradación progresiva (más lenta al principio, más rápida al final)
            const degradation = 1 + (lap / stint.laps) * 0.15 * wearMultiplier;
            const lapTime = baseLapTime * degradation;
            stintTime += lapTime;
        }

        // Variabilidad del piloto (consistency)
        const consistencyFactor = 1 + (Math.random() - 0.5) * (1 - driver.consistency) * 0.1;
        stintTime *= consistencyFactor;

        results.stints.push({
            stintNumber: index + 1,
            tyreType: tyre.name,
            laps: stint.laps,
            time: stintTime,
            averageLapTime: stintTime / stint.laps
        });

        totalTime += stintTime;
    });

    // Añadir tiempo de paradas
    totalTime += results.totalPitTime;
    results.totalTime = totalTime;

    return results;
}

function displayResult(result, circuit, driver, weather, stints) {
    const resultContainer = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    
    resultContainer.style.display = 'block';
    
    let html = `
        <div class="result-item">
            <strong>Circuito:</strong> ${circuit.name}<br>
            <strong>Piloto:</strong> ${driver.name} (${driver.team})<br>
            <strong>Clima:</strong> ${weather.charAt(0).toUpperCase() + weather.slice(1)}
        </div>
    `;

    result.stints.forEach((stint, index) => {
        html += `
            <div class="result-item">
                <strong>Stint ${stint.stintNumber}:</strong> ${stint.tyreType}<br>
                <strong>Vueltas:</strong> ${stint.laps}<br>
                <strong>Tiempo:</strong> ${formatTime(stint.time)}<br>
                <strong>Promedio por vuelta:</strong> ${formatLapTime(stint.averageLapTime)}
            </div>
        `;
    });

    html += `
        <div class="result-item" style="border-left-color: var(--success);">
            <strong>Paradas en boxes:</strong> ${result.pitStops}<br>
            <strong>Tiempo total en boxes:</strong> ${formatTime(result.totalPitTime)}
        </div>
        <div class="result-item" style="border-left-color: var(--success); margin-top: 15px;">
            <strong style="font-size: 18px;">Tiempo total de carrera:</strong><br>
            <span style="font-size: 24px; color: var(--success);">${formatTime(result.totalTime)}</span>
        </div>
    `;

    resultContent.innerHTML = html;
    
    // Scroll al resultado
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}.${ms.toString().padStart(3, '0')}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}.${ms.toString().padStart(3, '0')}s`;
    } else {
        return `${secs}.${ms.toString().padStart(3, '0')}s`;
    }
}

function formatLapTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${minutes}:${secs}`;
}

// Guardar resultado en historial
document.getElementById('save-result-btn').addEventListener('click', () => {
    if (!currentSimulation) return;
    
    const history = getHistory();
    history.push({
        id: Date.now(),
        ...currentSimulation
    });
    
    localStorage.setItem('f1_simulations', JSON.stringify(history));
    alert('Simulación guardada en el historial');
    loadHistory();
});

function getHistory() {
    const stored = localStorage.getItem('f1_simulations');
    return stored ? JSON.parse(stored) : [];
}

function loadHistory() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    const clearBtn = document.getElementById('clear-history-btn');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No hay simulaciones guardadas</p>';
        clearBtn.style.display = 'none';
        return;
    }
    
    clearBtn.style.display = 'block';
    
    // Ordenar por fecha (más reciente primero)
    history.sort((a, b) => b.id - a.id);
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        return `
            <div class="history-item" onclick="viewSimulation(${item.id})">
                <h4>${item.circuit.name} - ${item.driver.name}</h4>
                <p><strong>Clima:</strong> ${item.weather.charAt(0).toUpperCase() + item.weather.slice(1)}</p>
                <p><strong>Paradas:</strong> ${item.result.pitStops}</p>
                <p><strong>Vueltas:</strong> ${item.totalLaps}</p>
                <p class="time">${formatTime(item.result.totalTime)}</p>
                <p style="font-size: 12px; margin-top: 10px; opacity: 0.7;">
                    ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                </p>
            </div>
        `;
    }).join('');
}

// Hacer viewSimulation accesible globalmente
window.viewSimulation = function(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    
    if (!item) return;
    
    // Cambiar a pestaña de simulador
    document.querySelector('.tab-btn[data-tab="simulator"]').click();
    
    // Restaurar valores del formulario
    document.getElementById('circuit').value = item.circuit.id;
    document.getElementById('driver').value = item.driver.id;
    document.getElementById('weather').value = item.weather;
    document.getElementById('laps').value = item.totalLaps;
    
    // Restaurar stints
    activeStints = item.stints.length;
    item.stints.forEach((stint, index) => {
        if (index > 0) {
            const stintElement = document.querySelector(`.stint[data-stint="${index}"]`);
            if (stintElement) {
                stintElement.style.display = 'block';
            }
        }
        const stintElement = document.querySelector(`.stint[data-stint="${index}"]`);
        if (stintElement) {
            stintElement.querySelector('.tyre-type').value = stint.tyreType;
            stintElement.querySelector('.stint-laps').value = stint.laps;
        }
    });
    
    if (activeStints === 3) {
        addStintBtn.style.display = 'none';
    } else {
        addStintBtn.style.display = 'block';
    }
    
    // Mostrar resultado
    displayResult(item.result, item.circuit, item.driver, item.weather, item.stints);
    currentSimulation = item;
}

// Limpiar historial
document.getElementById('clear-history-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
        localStorage.removeItem('f1_simulations');
        loadHistory();
    }
});

// Inicializar aplicación
loadData();

