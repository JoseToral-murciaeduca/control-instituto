// Variables globales para almacenar los datos una vez cargados
let datosAsignaturas = [];
let datosTests = [];

// Cargar los datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    // Cargar asignaturas
    fetch('data/asignaturas.json')
        .then(response => response.json())
        .then(data => {
            datosAsignaturas = data;
            cargarVista('inicio');
        })
        .catch(error => console.error("Error cargando asignaturas:", error));

    // Cargar batería de tests
    fetch('data/tests.json')
        .then(response => response.json())
        .then(data => {
            datosTests = data;
        })
        .catch(error => console.error("Error cargando tests:", error));
});

// Calcular qué clase toca ahora mismo
function obtenerEstadoClases() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date();
    const hoy = dias[fecha.getDay()];
    const minutosActuales = fecha.getHours() * 60 + fecha.getMinutes();

    let claseActual = null;
    let proximaClase = null;
    let clasesDeHoy = [];

    datosAsignaturas.forEach(asig => {
        if (asig.horario) {
            asig.horario.forEach(h => {
                if (h.dia === hoy) {
                    const partes = h.hora.split('-');
                    if (partes.length === 2) {
                        const [horaInicioStr, minInicioStr] = partes[0].trim().split(':');
                        const [horaFinStr, minFinStr] = partes[1].trim().split(':');

                        const minInicio = parseInt(horaInicioStr) * 60 + parseInt(minInicioStr);
                        const minFin = parseInt(horaFinStr) * 60 + parseInt(minFinStr);

                        clasesDeHoy.push({
                            nombre: asig.nombre,
                            profesor: asig.profesor,
                            meet: asig.meet,
                            inicio: minInicio,
                            fin: minFin,
                            horaTexto: h.hora
                        });
                    }
                }
            });
        }
    });

    clasesDeHoy.sort((a, b) => a.inicio - b.inicio);

    for (let clase of clasesDeHoy) {
        if (minutosActuales >= clase.inicio && minutosActuales <= clase.fin) {
            claseActual = clase;
        } else if (minutosActuales < clase.inicio && !proximaClase) {
            proximaClase = clase;
        }
    }

    return { hoy, claseActual, proximaClase };
}

function cargarVista(vista) {
    const contenedor = document.getElementById("content");

    if (vista === 'inicio') {
        const estado = obtenerEstadoClases();

        let htmlEstado = `<div class="card" style="margin-top: 20px;">
                            <h2>📅 Hoy es ${estado.hoy}</h2>`;

        if (estado.hoy === 'Sábado' || estado.hoy === 'Domingo') {
            htmlEstado += `<p>¡Es fin de semana! Toca descansar o repasar la Zona de Test.</p>`;
        } else if (estado.claseActual) {
            htmlEstado += `
                <div style="background-color: rgba(79, 70, 229, 0.2); border: 1px solid var(--accent); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <h3 style="color: var(--accent); margin-top: 0;">🔴 Clase en curso</h3>
                    <p><strong>${estado.claseActual.nombre}</strong> (${estado.claseActual.horaTexto})</p>
                    <p>Profesor: ${estado.claseActual.profesor}</p>
                    <a href="${estado.claseActual.meet}" target="_blank" class="btn-meet">Entrar a Meet ahora</a>
                </div>
            `;
        } else if (estado.proximaClase) {
            htmlEstado += `
                <p>No tienes clase en este momento.</p>
                <div style="background-color: var(--bg-dark); border-left: 4px solid var(--text-muted); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <h3 style="margin-top: 0; color: var(--text-muted);">⏳ Próxima clase</h3>
                    <p><strong>${estado.proximaClase.nombre}</strong> (${estado.proximaClase.horaTexto})</p>
                </div>
            `;
        } else {
            htmlEstado += `<p>Has terminado todas tus clases por hoy. ¡Buen trabajo!</p>`;
        }

        htmlEstado += `</div>`;

        contenedor.innerHTML = `
            <h1>Bienvenido a tu Panel de Control</h1>
            <p>Resumen de tu jornada:</p>
            ${htmlEstado}
        `;
    }

    else if (vista === 'asignaturas') {
        let htmlCards = '';
        datosAsignaturas.forEach(asig => {
            htmlCards += `
                <div class="card">
                    <h3>${asig.nombre}</h3>
                    <p><strong>Profesor:</strong> ${asig.profesor}</p>
                    <a href="${asig.meet}" target="_blank" class="btn-meet">Unirse a Meet</a>
                </div>
            `;
        });

        contenedor.innerHTML = `
            <h1>Mis Asignaturas</h1>
            <div class="grid-asignaturas">${htmlCards}</div>
        `;
    }

    else if (vista === 'horario') {
        let htmlHorario = '<div class="grid-horario">';
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        diasSemana.forEach(dia => {
            let clasesDelDia = [];

            datosAsignaturas.forEach(asig => {
                if (asig.horario) {
                    asig.horario.forEach(h => {
                        if (h.dia === dia) {
                            clasesDelDia.push({ hora: h.hora, nombre: asig.nombre, meet: asig.meet });
                        }
                    });
                }
            });

            if (clasesDelDia.length > 0) {
                clasesDelDia.sort((a, b) => a.hora.localeCompare(b.hora));

                htmlHorario += `<div class="dia-columna"><h3>${dia}</h3>`;

                clasesDelDia.forEach(clase => {
                    htmlHorario += `
                        <div class="clase-card">
                            <div class="hora-badge">🕒 ${clase.hora}</div>
                            <p><strong>${clase.nombre}</strong></p>
                            <a href="${clase.meet}" target="_blank" class="btn-meet" style="display: block; text-align: center; margin-top: 12px; padding: 6px; font-size: 0.85rem;">🎥 Ir a Meet</a>
                        </div>
                    `;
                });

                htmlHorario += `</div>`;
            }
        });

        htmlHorario += '</div>';

        contenedor.innerHTML = `
            <h1>Horario de Clases</h1>
            <p>Tus clases semanales ordenadas automáticamente.</p>
            ${htmlHorario}
        `;
    }

    else if (vista === 'tests') {
        let htmlOpciones = '<option value="">Selecciona un test...</option>';
        datosTests.forEach((test, index) => {
            htmlOpciones += `<option value="${index}">${test.asignatura} - ${test.tema}</option>`;
        });

        contenedor.innerHTML = `
            <h1>Zona de Prácticas</h1>
            <div class="card" style="margin-bottom: 20px;">
                <label for="selectorTest"><strong>Elige un temario a repasar:</strong></label>
                <select id="selectorTest" style="padding: 8px; margin-left: 10px; background: #1e1e24; color: #f3f4f6; border: 1px solid #3f3f46; border-radius: 4px;">
                    ${htmlOpciones}
                </select>
                <button onclick="iniciarTest()" class="btn-meet" style="margin-left: 10px; cursor: pointer; border: none;">Comenzar Test</button>
            </div>
            <div id="contenedorTest"></div>
        `;
    }

    else if (vista === 'tareas') {
        contenedor.innerHTML = `
            <h1>Gestor de Tareas</h1>
            <p>Organiza tus entregas y proyectos. Los datos se guardan en tu navegador.</p>
            
            <div class="task-container">
                <div class="task-input-group" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="nuevaTareaInput" placeholder="Ej: Terminar proyecto..." onkeypress="manejarEnter(event)" style="flex: 2; min-width: 200px;">
                    <input type="date" id="fechaLimiteInput" style="flex: 1; min-width: 150px; padding: 10px; background-color: var(--bg-dark); border: 1px solid #3f3f46; color: var(--text-main); border-radius: 5px; font-size: 1rem;">
                    <button onclick="agregarTarea()" class="btn-add" style="flex: 0 0 auto;">Añadir</button>
                </div>
                <ul id="listaTareas" class="task-list">
                    </ul>
            </div>
        `;
        renderizarTareas();
    }
}

// --- FUNCIONES PARA EL MOTOR DE TESTS ---

function iniciarTest() {
    const selector = document.getElementById("selectorTest");
    const indiceTest = selector.value;
    const contenedorTest = document.getElementById("contenedorTest");

    if (indiceTest === "") {
        contenedorTest.innerHTML = "<p style='color: #ef4444;'>Por favor, selecciona un test del desplegable primero.</p>";
        return;
    }

    const testActual = datosTests[indiceTest];
    let htmlPreguntas = `<h2>Repasando: ${testActual.tema}</h2>`;

    testActual.preguntas.forEach((pregunta, indexPregunta) => {
        htmlPreguntas += `
            <div class="card" style="margin-bottom: 15px;">
                <p><strong>${indexPregunta + 1}. ${pregunta.enunciado}</strong></p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        `;

        pregunta.opciones.forEach((opcion, indexOpcion) => {
            htmlPreguntas += `
                <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    <input type="radio" name="pregunta_${indexPregunta}" value="${indexOpcion}">
                    ${opcion}
                </label>
            `;
        });

        htmlPreguntas += `</div></div>`;
    });

    htmlPreguntas += `
        <button onclick="evaluarTest(${indiceTest})" class="btn-meet" style="cursor: pointer; border: none; font-size: 1.1rem; padding: 12px 20px;">Corregir Examen</button>
        <div id="resultadoTest" style="margin-top: 20px; font-size: 1.2rem; font-weight: bold; padding: 15px; border-radius: 8px;"></div>
    `;

    contenedorTest.innerHTML = htmlPreguntas;
}

function evaluarTest(indiceTest) {
    const testActual = datosTests[indiceTest];
    let aciertos = 0;
    let fallos = 0;

    testActual.preguntas.forEach((pregunta, indexPregunta) => {
        const opcionSeleccionada = document.querySelector(`input[name="pregunta_${indexPregunta}"]:checked`);

        if (opcionSeleccionada) {
            if (parseInt(opcionSeleccionada.value) === pregunta.respuesta_correcta) {
                aciertos++;
            } else {
                fallos++;
            }
        } else {
            fallos++;
        }
    });

    const totalPreguntas = testActual.preguntas.length;
    const nota = ((aciertos / totalPreguntas) * 10).toFixed(2);

    const resultadoDiv = document.getElementById("resultadoTest");
    if (nota >= 5) {
        resultadoDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
        resultadoDiv.style.border = '1px solid #22c55e';
        resultadoDiv.style.color = '#22c55e';
    } else {
        resultadoDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        resultadoDiv.style.border = '1px solid #ef4444';
        resultadoDiv.style.color = '#ef4444';
    }

    resultadoDiv.innerHTML = `
        <p style="margin: 0 0 10px 0;">✅ Aciertos: ${aciertos} | ❌ Fallos o Blanco: ${fallos}</p>
        <p style="margin: 0;">Nota Final: ${nota} / 10</p>
    `;
}

// --- GESTOR DE TAREAS CON ALERTAS ---

function obtenerTareas() {
    let tareas = localStorage.getItem("mis_tareas");
    if (!tareas) {
        const tareasIniciales = [
            { id: 1, texto: "Avanzar con el diseño web de AnimalMe", completada: false, fechaLimite: "" },
            { id: 2, texto: "Revisar conexión MySQL en puerto 3307", completada: false, fechaLimite: "" }
        ];
        localStorage.setItem("mis_tareas", JSON.stringify(tareasIniciales));
        return tareasIniciales;
    }
    return JSON.parse(tareas);
}

function guardarTareas(tareas) {
    localStorage.setItem("mis_tareas", JSON.stringify(tareas));
}

function renderizarTareas() {
    const lista = document.getElementById("listaTareas");
    if (!lista) return;

    const tareas = obtenerTareas();
    lista.innerHTML = "";

    // Obtener la fecha de hoy a medianoche para cálculos precisos
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    tareas.forEach(tarea => {
        const estadoClase = tarea.completada ? "completed" : "";
        const checkProp = tarea.completada ? "checked" : "";

        let htmlBadgeAlerta = "";

        // Solo calcular alertas si la tarea no está completada y tiene fecha límite
        if (!tarea.completada && tarea.fechaLimite) {
            const limite = new Date(tarea.fechaLimite);
            limite.setHours(0, 0, 0, 0);

            // Diferencia en milisegundos convertida a días enteros
            const diffTiempo = limite.getTime() - hoy.getTime();
            const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

            if (diffDias < 0) {
                htmlBadgeAlerta = `<span class="badge-alerta alerta-vencido">🛑 Vencido (${Math.abs(diffDias)}d)</span>`;
            } else if (diffDias === 0) {
                htmlBadgeAlerta = `<span class="badge-alerta alerta-urgente">🔥 ¡Hoy!</span>`;
            } else if (diffDias === 1) {
                htmlBadgeAlerta = `<span class="badge-alerta alerta-urgente">⏳ Mañana</span>`;
            } else if (diffDias <= 3) {
                htmlBadgeAlerta = `<span class="badge-alerta alerta-proximo">⚠️ Quedan ${diffDias} días</span>`;
            } else {
                htmlBadgeAlerta = `<span class="badge-alerta alerta-tiempo">📅 Con tiempo (${diffDias}d)</span>`;
            }
        } else if (!tarea.completada && !tarea.fechaLimite) {
            htmlBadgeAlerta = `<span class="badge-alerta" style="color: var(--text-muted); border: 1px dashed #3f3f46;">Sin fecha</span>`;
        }

        lista.innerHTML += `
            <li class="task-item ${estadoClase}">
                <div class="task-content" onclick="toggleTarea(${tarea.id})">
                    <input type="checkbox" ${checkProp}>
                    <span>${tarea.texto}</span>
                    ${htmlBadgeAlerta}
                </div>
                <button onclick="eliminarTarea(${tarea.id})" class="btn-delete">Borrar</button>
            </li>
        `;
    });
}

function agregarTarea() {
    const inputTexto = document.getElementById("nuevaTareaInput");
    const inputFecha = document.getElementById("fechaLimiteInput");

    const texto = inputTexto.value.trim();
    const fecha = inputFecha.value; // Formato YYYY-MM-DD

    if (texto === "") return;

    const tareas = obtenerTareas();
    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        fechaLimite: fecha // Se guarda la cadena de fecha
    };

    tareas.push(nuevaTarea);
    guardarTareas(tareas);

    // Limpiar inputs
    inputTexto.value = "";
    inputFecha.value = "";

    renderizarTareas();
}

function manejarEnter(event) {
    if (event.key === "Enter") {
        agregarTarea();
    }
}

function toggleTarea(id) {
    const tareas = obtenerTareas();
    const tareaEncontrada = tareas.find(t => t.id === id);
    if (tareaEncontrada) {
        tareaEncontrada.completada = !tareaEncontrada.completada;
        guardarTareas(tareas);
        renderizarTareas();
    }
}

function eliminarTarea(id) {
    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    renderizarTareas();
}

// --- RELOJ DIGITAL ---
setInterval(() => {
    const elementoReloj = document.getElementById('reloj');
    if (elementoReloj) elementoReloj.innerText = new Date().toLocaleTimeString();
}, 1000);