// Variables globales para almacenar los datos una vez cargados
let datosAsignaturas = [];
let datosTests = [];

// Cargar los datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    fetch('data/asignaturas.json')
        .then(response => response.json())
        .then(data => {
            datosAsignaturas = data;
            cargarVista('inicio');
        })
        .catch(error => console.error("Error cargando asignaturas:", error));

    fetch('data/tests.json')
        .then(response => response.json())
        .then(data => {
            datosTests = data;
        })
        .catch(error => console.error("Error cargando tests:", error));
});

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

    // CIERRE AUTOMÁTICO EN MÓVILES
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("abierto")) {
        sidebar.classList.remove("abierto");
    }

    if (vista === 'inicio') {
        const estado = obtenerEstadoClases();

        // Calcular tareas pendientes para el widget
        const tareasLocales = JSON.parse(localStorage.getItem("mis_tareas")) || [];
        const tareasPendientes = tareasLocales.filter(t => !t.completada).length;

        // Estado de la próxima clase para el widget
        let textoSiguienteClase = "Libre";
        if (estado.claseActual) textoSiguienteClase = "En curso ahora";
        else if (estado.proximaClase) textoSiguienteClase = estado.proximaClase.nombre;

        // Construir Widgets
        let htmlWidgets = `
            <div class="widgets-grid">
                <div class="widget-card">
                    <span class="widget-title">Día Actual</span>
                    <span class="widget-value" style="font-size: 1.4rem;">📅 ${estado.hoy}</span>
                </div>
                <div class="widget-card">
                    <span class="widget-title">Tareas Pendientes</span>
                    <span class="widget-value">📝 ${tareasPendientes}</span>
                </div>
                <div class="widget-card">
                    <span class="widget-title">Siguiente Clase</span>
                    <span class="widget-value" style="font-size: 1.1rem; padding-top: 5px;">🎓 ${textoSiguienteClase}</span>
                </div>
            </div>
        `;

        let htmlEstado = `<div class="card">
                            <h2>Resumen del Horario</h2>`;

        if (estado.hoy === 'Sábado' || estado.hoy === 'Domingo') {
            htmlEstado += `<p>¡Es fin de semana! Toca descansar o repasar la Zona de Test.</p>`;
        } else if (estado.claseActual) {
            htmlEstado += `
                <div style="background-color: rgba(79, 70, 229, 0.1); border: 1px solid var(--accent); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <h3 style="color: var(--accent); margin-top: 0;">🔴 Clase en curso</h3>
                    <p><strong>${estado.claseActual.nombre}</strong> (${estado.claseActual.horaTexto})</p>
                    <p>Profesor: ${estado.claseActual.profesor}</p>
                    <a href="${estado.claseActual.meet}" target="_blank" class="btn-meet" style="margin-top: 10px;">Entrar a Meet ahora</a>
                </div>
            `;
        } else if (estado.proximaClase) {
            htmlEstado += `
                <p>No tienes clase en este momento.</p>
                <div style="background-color: var(--bg-sidebar); border: 1px solid var(--border-color); border-left: 4px solid var(--text-muted); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <h3 style="margin-top: 0; color: var(--text-muted);">⏳ Próxima clase</h3>
                    <p><strong>${estado.proximaClase.nombre}</strong> (${estado.proximaClase.horaTexto})</p>
                </div>
            `;
        } else {
            htmlEstado += `<p>Has terminado todas tus clases por hoy. ¡Buen trabajo!</p>`;
        }

        htmlEstado += `</div>`;

        contenedor.innerHTML = `
            <h1>Dashboard</h1>
            <p style="color: var(--text-muted); margin-bottom: 30px;">Bienvenido a tu panel de control de 2º de DAM.</p>
            ${htmlWidgets}
            ${htmlEstado}
        `;
    }

    else if (vista === 'asignaturas') {
        let htmlCards = '';
        datosAsignaturas.forEach(asig => {
            htmlCards += `
                <div class="card">
                    <h3>${asig.nombre}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 15px;"><strong>Profesor:</strong> ${asig.profesor}</p>
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
                            <a href="${clase.meet}" target="_blank" class="btn-secundario" style="display: block; text-align: center; margin-top: 12px; padding: 6px; font-size: 0.85rem; border: none; background: rgba(94, 92, 230, 0.1); color: var(--accent);">🎥 Ir a Meet</a>
                        </div>
                    `;
                });

                htmlHorario += `</div>`;
            }
        });

        htmlHorario += '</div>';

        contenedor.innerHTML = `
            <h1>Horario de Clases</h1>
            <p style="color: var(--text-muted);">Tus clases semanales ordenadas automáticamente.</p>
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
                <select id="selectorTest" style="padding: 10px; margin-top: 10px; width: 100%; display: block; background: var(--bg-dark); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 8px;">
                    ${htmlOpciones}
                </select>
                <button onclick="iniciarTest()" class="btn-meet" style="margin-top: 15px; width: 100%;">Comenzar Test</button>
            </div>
            <div id="contenedorTest"></div>
        `;
    }

    else if (vista === 'tareas') {
        contenedor.innerHTML = `
            <h1>Gestor de Tareas</h1>
            <p style="color: var(--text-muted);">Organiza tus entregas y proyectos.</p>
            
            <div class="task-container">
                <div class="actions-container">
                    <button onclick="exportarTareas()" class="btn-secundario">📥 Exportar</button>
                    <label class="btn-secundario" style="cursor: pointer;">
                        📤 Importar
                        <input type="file" accept=".json" style="display: none;" onchange="importarTareas(event)">
                    </label>
                </div>

                <div class="progress-container">
                    <div id="taskProgressBar" class="progress-bar"></div>
                </div>
                <span id="taskProgressText" class="progress-text">Progreso: 0%</span>

                <div class="task-input-group" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
                    <input type="text" id="nuevaTareaInput" placeholder="Ej: Terminar proyecto..." onkeypress="manejarEnter(event)" style="flex: 2; min-width: 200px;">
                    <input type="date" id="fechaLimiteInput" style="flex: 1; min-width: 150px;">
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
        contenedorTest.innerHTML = "<p style='color: #ef4444; margin-top: 15px;'>Por favor, selecciona un test del desplegable primero.</p>";
        return;
    }

    const testActual = datosTests[indiceTest];
    let htmlPreguntas = `<h2 style="margin-top: 30px;">Repasando: ${testActual.tema}</h2>`;

    testActual.preguntas.forEach((pregunta, indexPregunta) => {
        htmlPreguntas += `
            <div class="card" style="margin-bottom: 15px;">
                <p><strong>${indexPregunta + 1}. ${pregunta.enunciado}</strong></p>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
        `;

        pregunta.opciones.forEach((opcion, indexOpcion) => {
            htmlPreguntas += `
                <label style="cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
                    <input type="radio" name="pregunta_${indexPregunta}" value="${indexOpcion}" style="accent-color: var(--accent); width: 18px; height: 18px;">
                    ${opcion}
                </label>
            `;
        });

        htmlPreguntas += `</div></div>`;
    });

    htmlPreguntas += `
        <button onclick="evaluarTest(${indiceTest})" class="btn-meet" style="width: 100%; padding: 15px; font-size: 1.1rem;">Corregir Examen</button>
        <div id="resultadoTest" style="margin-top: 20px; font-size: 1.1rem; font-weight: 500; padding: 20px; border-radius: 12px;"></div>
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
        resultadoDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        resultadoDiv.style.border = '1px solid #22c55e';
        resultadoDiv.style.color = '#4ade80';
    } else {
        resultadoDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        resultadoDiv.style.border = '1px solid #ef4444';
        resultadoDiv.style.color = '#f87171';
    }

    resultadoDiv.innerHTML = `
        <p style="margin: 0 0 10px 0;">✅ Aciertos: ${aciertos} &nbsp;|&nbsp; ❌ Fallos o Blanco: ${fallos}</p>
        <p style="margin: 0; font-size: 1.3rem; font-weight: 700;">Nota Final: ${nota} / 10</p>
    `;
}

// --- GESTOR DE TAREAS ---
function obtenerTareas() {
    let tareas = localStorage.getItem("mis_tareas");
    if (!tareas) return [];
    return JSON.parse(tareas);
}

function guardarTareas(tareas) {
    localStorage.setItem("mis_tareas", JSON.stringify(tareas));
}

function renderizarTareas() {
    const lista = document.getElementById("listaTareas");
    const pBar = document.getElementById("taskProgressBar");
    const pText = document.getElementById("taskProgressText");

    if (!lista) return;

    const tareas = obtenerTareas();
    lista.innerHTML = "";

    // Cálculo y renderizado de la barra de progreso
    const completadas = tareas.filter(t => t.completada).length;
    const porcentaje = tareas.length === 0 ? 0 : Math.round((completadas / tareas.length) * 100);

    if (pBar) pBar.style.width = `${porcentaje}%`;
    if (pText) pText.innerText = tareas.length === 0
        ? "Añade una tarea para ver tu progreso."
        : `Progreso: ${porcentaje}% (${completadas} de ${tareas.length} completadas)`;

    if (tareas.length === 0) {
        lista.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 40px; font-style: italic;">No hay tareas pendientes. ¡Todo al día!</p>`;
        return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    tareas.forEach(tarea => {
        const estadoClase = tarea.completada ? "completed" : "";
        const checkProp = tarea.completada ? "checked" : "";

        let htmlBadgeAlerta = "";

        if (!tarea.completada && tarea.fechaLimite) {
            const limite = new Date(tarea.fechaLimite);
            limite.setHours(0, 0, 0, 0);

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
            htmlBadgeAlerta = `<span class="badge-alerta" style="color: var(--text-muted); border: 1px dashed var(--border-color);">Sin fecha</span>`;
        }

        lista.innerHTML += `
            <li class="task-item ${estadoClase}">
                <div class="task-content" onclick="toggleTarea(${tarea.id})">
                    <input type="checkbox" ${checkProp}>
                    <span>${tarea.texto}</span>
                    ${htmlBadgeAlerta}
                </div>
                <button onclick="eliminarTarea(${tarea.id})" class="btn-delete">✖</button>
            </li>
        `;
    });
}

function agregarTarea() {
    const inputTexto = document.getElementById("nuevaTareaInput");
    const inputFecha = document.getElementById("fechaLimiteInput");

    const texto = inputTexto.value.trim();
    const fecha = inputFecha.value;

    if (texto === "") return;

    const tareas = obtenerTareas();
    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        fechaLimite: fecha
    };

    tareas.push(nuevaTarea);
    guardarTareas(tareas);

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

function exportarTareas() {
    const tareasStr = localStorage.getItem("mis_tareas");
    if (!tareasStr || tareasStr === "[]") {
        alert("No hay tareas para exportar.");
        return;
    }
    const blob = new Blob([tareasStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mis_tareas_backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarTareas(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const contenido = e.target.result;
            const tareasImportadas = JSON.parse(contenido);
            if (Array.isArray(tareasImportadas)) {
                localStorage.setItem("mis_tareas", JSON.stringify(tareasImportadas));
                renderizarTareas();
                alert("¡Backup restaurado con éxito!");
            } else {
                alert("El archivo no tiene el formato correcto.");
            }
        } catch (error) {
            alert("Error al leer el archivo.");
        }
    };
    lector.readAsText(archivo);
    event.target.value = "";
}

// --- POP-UP Y CONEXIÓN CON LA API DE GEMINI ---
function toggleChat() {
    const popup = document.getElementById("chatPopup");
    if (popup.style.display === "none" || popup.style.display === "") {
        popup.style.display = "flex";
        document.getElementById("chatInput").focus();
    } else {
        popup.style.display = "none";
    }
}

function manejarEnterChat(event) {
    if (event.key === "Enter") {
        enviarMensajeIA();
    }
}

function enviarMensajeIA() {
    const input = document.getElementById("chatInput");
    const prompt = input.value.trim();
    if (prompt === "") return;

    const boxMensajes = document.getElementById("chatMessages");

    boxMensajes.innerHTML += `<div class="message user">${prompt}</div>`;
    input.value = "";
    boxMensajes.scrollTop = boxMensajes.scrollHeight;

    const idCarga = "carga_" + Date.now();
    boxMensajes.innerHTML += `<div id="${idCarga}" class="message ai"><i>Pensando...</i></div>`;
    boxMensajes.scrollTop = boxMensajes.scrollHeight;

    if (typeof CONFIG === "undefined" || !CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "TU_API_KEY_AQUÍ") {
        document.getElementById(idCarga).innerHTML = "⚠️ Falta la API Key. Asegúrate de tener tu archivo config.js creado correctamente.";
        return;
    }

    const urlAPI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    fetch(urlAPI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta de la API");
            return response.json();
        })
        .then(data => {
            let textoRespuesta = "No he recibido una respuesta válida.";
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                textoRespuesta = data.candidates[0].content.parts[0].text;
            }

            document.getElementById(idCarga).innerHTML = textoRespuesta.replace(/\n/g, "<br>");
            boxMensajes.scrollTop = boxMensajes.scrollHeight;
        })
        .catch(error => {
            console.error("Error al conectar con Gemini:", error);
            document.getElementById(idCarga).innerHTML = "❌ Error de conexión.";
        });
}

// --- MENÚ MÓVIL ---
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("abierto");
}

// --- RELOJ DIGITAL ---
setInterval(() => {
    const elementoReloj = document.getElementById('reloj');
    if (elementoReloj) elementoReloj.innerText = new Date().toLocaleTimeString();
}, 1000);