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
            cargarVista('inicio'); // Vista por defecto
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

function cargarVista(vista) {
    const contenedor = document.getElementById("content");

    if (vista === 'inicio') {
        contenedor.innerHTML = `
            <h1>Bienvenido a tu Panel de Control</h1>
            <p>Selecciona una opción en el menú izquierdo para gestionar tu curso.</p>
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
            htmlHorario += `<div class="dia-columna"><h3>${dia}</h3>`;

            // Recopilar las clases que tocan en este día específico
            let clasesDelDia = [];
            datosAsignaturas.forEach(asig => {
                if (asig.horario) {
                    asig.horario.forEach(h => {
                        if (h.dia === dia) {
                            clasesDelDia.push({ hora: h.hora, nombre: asig.nombre });
                        }
                    });
                }
            });

            // Ordenar las clases por hora de inicio de menor a mayor
            clasesDelDia.sort((a, b) => a.hora.localeCompare(b.hora));

            // Pintar las tarjetas de clase o un mensaje si el día está libre
            if (clasesDelDia.length > 0) {
                clasesDelDia.forEach(clase => {
                    htmlHorario += `
                        <div class="clase-card">
                            <span class="hora-badge">🕒 ${clase.hora}</span>
                            <p><strong>${clase.nombre}</strong></p>
                        </div>
                    `;
                });
            } else {
                htmlHorario += `<p class="text-muted">Día sin clases</p>`;
            }

            htmlHorario += `</div>`; // Cerrar la columna del día
        });

        htmlHorario += '</div>'; // Cerrar el grid del horario

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