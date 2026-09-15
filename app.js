// ==========================================
// CONFIGURACIÓN Y PERSISTENCIA (Local Storage)
// ==========================================
const STORAGE_KEY = 'control_instituto_db';

// DICCIONARIO MAESTRO DE HORARIOS (Turno de tarde - Global)
const TRAMOS_HORARIOS = {
    1: { inicio: "15:20", fin: "16:15" },
    2: { inicio: "16:15", fin: "17:10" },
    3: { inicio: "17:10", fin: "18:05" },
    4: { inicio: "18:05", fin: "19:00" },
    5: { inicio: "19:15", fin: "20:10" },
    6: { inicio: "20:10", fin: "21:05" }
};

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tareas: [],
    asignaturas: [],
    perfil: null // Si es null, pediremos los datos
};

// Migración de seguridad por si tenías datos antiguos
appData.asignaturas.forEach(asig => {
    if (!asig.notas) asig.notas = [];
    if (!asig.sesiones) asig.sesiones = [];
    if (!asig.color) asig.color = '#3b82f6';
    if (!asig.profesor) asig.profesor = '';
    if (!asig.enlace) asig.enlace = '';
});

function guardarDatos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    actualizarUI();
}

// ==========================================
// NAVEGACIÓN
// ==========================================
function cambiarSeccion(idSeccion) {
    document.querySelectorAll('.seccion-app').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(idSeccion).classList.remove('hidden');
}

// ==========================================
// 1. MÓDULO CENTRAL: GESTIÓN DE ASIGNATURAS
// ==========================================
const formCrearAsignatura = document.getElementById('form-crear-asignatura');
let contadorFilasHorario = 0;

// Generar filas dinámicas en el formulario
window.agregarFilaHorarioFormulario = function() {
    const contenedor = document.getElementById('contenedor-filas-horario');
    const idFila = `fila-horario-${contadorFilasHorario++}`;
    const div = document.createElement('div');
    div.id = idFila;
    div.className = 'flex gap-3 items-center animate-fade-in';
    // ACTUALIZADO: Select desplegable con las franjas horarias exactas
    div.innerHTML = `
        <select class="select-dia-nuevo w-1/3 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-orange-500 bg-white">
            <option value="lunes">Lunes</option><option value="martes">Martes</option>
            <option value="miercoles">Miércoles</option><option value="jueves">Jueves</option>
            <option value="viernes">Viernes</option>
        </select>
        <select class="input-hora-nuevo w-1/2 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-orange-500 bg-white" required>
            <option value="" disabled selected>Elige franja horaria...</option>
            <option value="1">15:20 - 16:15</option>
            <option value="2">16:15 - 17:10</option>
            <option value="3">17:10 - 18:05</option>
            <option value="4">18:05 - 19:00</option>
            <option value="5">19:15 - 20:10</option>
            <option value="6">20:10 - 21:05</option>
        </select>
        <button type="button" onclick="document.getElementById('${idFila}').remove()" class="text-red-400 hover:text-red-600 p-2 transition bg-white rounded border border-slate-200" title="Borrar fila">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    contenedor.appendChild(div);
}

if (formCrearAsignatura) {
    formCrearAsignatura.addEventListener('submit', (e) => {
        e.preventDefault();

        // Recoger todas las filas de horario generadas
        const sesiones = [];
        const filas = document.getElementById('contenedor-filas-horario').children;
        for(let fila of filas) {
            const dia = fila.querySelector('.select-dia-nuevo').value;
            const hora = parseInt(fila.querySelector('.input-hora-nuevo').value);
            // Si la hora es válida y no hemos añadido ya esa misma hora y día
            if(!isNaN(hora) && !sesiones.some(s => s.dia === dia && s.hora === hora)) {
                sesiones.push({ dia, hora });
            }
        }

        const nuevaAsig = {
            id: Date.now(),
            nombre: document.getElementById('asig-nombre').value.trim(),
            profesor: document.getElementById('asig-profesor').value.trim(),
            enlace: document.getElementById('asig-enlace').value.trim(),
            color: document.getElementById('asig-color').value,
            notas: [],
            sesiones: sesiones // Se guardan todos los horarios a la vez
        };
        appData.asignaturas.push(nuevaAsig);

        formCrearAsignatura.reset();
        document.getElementById('contenedor-filas-horario').innerHTML = ''; // Limpiar filas tras guardar
        guardarDatos();
    });
}

function renderizarConfigAsignaturas() {
    const contenedor = document.getElementById('contenedor-config-asignaturas');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (appData.asignaturas.length === 0) {
        contenedor.innerHTML = '<div class="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">Crea tu primera asignatura arriba para empezar.</div>';
        return;
    }

    appData.asignaturas.forEach(asig => {
        let htmlSesiones = '';
        // Ordenamos las sesiones por hora antes de mostrarlas para que quede bonito
        asig.sesiones.sort((a, b) => a.hora - b.hora).forEach((sesion, index) => {
            const tramo = TRAMOS_HORARIOS[sesion.hora];
            const textoHora = tramo ? `${tramo.inicio} - ${tramo.fin}` : `${sesion.hora}ª Hora`;

            htmlSesiones += `
                <div class="flex justify-between items-center text-sm p-2 bg-slate-50 rounded mt-1 border border-slate-100">
                    <span class="capitalize font-medium"><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${sesion.dia} <span class="text-slate-400 mx-1">|</span> ${textoHora}</span>
                    <button onclick="borrarSesion(${asig.id}, ${index})" class="text-red-400 hover:text-red-600 transition"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        });

        const div = document.createElement('div');
        div.className = 'bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden';
        div.innerHTML = `
            <div class="absolute top-0 left-0 right-0 h-2" style="background-color: ${asig.color}"></div>
            <div class="flex justify-between items-start mt-2 mb-4 pb-4 border-b border-slate-100">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">${asig.nombre}</h3>
                    ${asig.profesor ? `<p class="text-sm text-slate-500 mt-1"><i class="fa-solid fa-chalkboard-user mr-1"></i>${asig.profesor}</p>` : ''}
                    ${asig.enlace ? `<a href="${asig.enlace}" target="_blank" class="text-sm text-blue-500 hover:underline mt-1 inline-block"><i class="fa-solid fa-video mr-1"></i>Enlace de clase</a>` : ''}
                </div>
                <button onclick="eliminarAsignaturaMaster(${asig.id})" class="text-red-400 hover:text-red-600 p-2 rounded transition bg-red-50" title="Borrar asignatura completa">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            
            <div class="flex-1">
                <h4 class="text-xs font-bold uppercase text-slate-400 mb-2">Bloques de Horario</h4>
                ${htmlSesiones || '<p class="text-xs text-slate-400 italic">No tiene horario asignado.</p>'}
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100">
                <form onsubmit="agregarSesion(event, ${asig.id})" class="flex gap-2">
                    <select id="dia-${asig.id}" required class="w-1/3 p-2 text-sm border border-slate-200 rounded">
                        <option value="lunes">Lunes</option><option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option><option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                    </select>
                    <!-- ACTUALIZADO: Permite elegir del desplegable -->
                    <select id="hora-${asig.id}" required class="w-1/2 p-2 text-[11px] border border-slate-200 rounded">
                        <option value="1">15:20 - 16:15</option><option value="2">16:15 - 17:10</option>
                        <option value="3">17:10 - 18:05</option><option value="4">18:05 - 19:00</option>
                        <option value="5">19:15 - 20:10</option><option value="6">20:10 - 21:05</option>
                    </select>
                    <button type="submit" class="bg-slate-800 text-white px-3 rounded hover:bg-slate-700 transition" title="Añadir bloque">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </form>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

window.agregarSesion = function(e, idAsig) {
    e.preventDefault();
    const dia = document.getElementById(`dia-${idAsig}`).value;
    const hora = parseInt(document.getElementById(`hora-${idAsig}`).value);

    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig && !isNaN(hora)) {
        if(!asig.sesiones.some(s => s.dia === dia && s.hora === hora)) {
            asig.sesiones.push({ dia, hora });
            guardarDatos();
        }
    }
}

window.borrarSesion = function(idAsig, indexSesion) {
    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig) {
        asig.sesiones.splice(indexSesion, 1);
        guardarDatos();
    }
}

window.eliminarAsignaturaMaster = function(idAsig) {
    if(confirm("⚠️ ¿Borrar asignatura? Se eliminará del horario y se perderán sus calificaciones.")) {
        appData.asignaturas = appData.asignaturas.filter(a => a.id !== idAsig);
        guardarDatos();
    }
}

// ==========================================
// 2. HORARIO AUTOMÁTICO (Idéntico a Captura)
// ==========================================
function renderizarHorarioAuto() {
    const tablaHorario = document.getElementById('tabla-horario');
    if (!tablaHorario) return;
    tablaHorario.innerHTML = '';
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    let maxHora = 6;
    appData.asignaturas.forEach(a => {
        a.sesiones.forEach(s => {
            if (s.hora > maxHora) maxHora = s.hora;
        });
    });

    for (let hora = 1; hora <= maxHora; hora++) {

        // Insertar la franja del recreo justo antes de imprimir la 5ª hora
        if (hora === 5) {
            const filaRecreo = document.createElement('tr');
            filaRecreo.innerHTML = `<td colspan="6" class="bg-slate-200 border-y border-slate-300 text-center py-2 shadow-inner">
                <span class="text-slate-600 font-bold text-xs uppercase tracking-widest"><i class="fa-solid fa-mug-hot mr-2"></i> Recreo (19:00 - 19:15)</span>
            </td>`;
            tablaHorario.appendChild(filaRecreo);
        }

        const fila = document.createElement('tr');
        const tramo = TRAMOS_HORARIOS[hora];

        // ACTUALIZADO: Horas apiladas (sin "1ª"), diseño exacto a captura
        let htmlFila = `<td class="border border-slate-200 bg-white text-center align-middle p-2 w-20 shadow-sm relative z-10">
            <span class="block font-bold text-slate-800 text-sm leading-tight">${tramo ? tramo.inicio : ''}</span>
            <span class="block font-bold text-slate-800 text-sm leading-tight">${tramo ? tramo.fin : ''}</span>
        </td>`;

        dias.forEach(dia => {
            const asigEncontrada = appData.asignaturas.find(a => a.sesiones.some(s => s.dia === dia && s.hora === hora));

            if (asigEncontrada) {
                const iconoMeet = asigEncontrada.enlace ? `<a href="${asigEncontrada.enlace}" target="_blank" class="block mt-2 text-xs bg-white bg-opacity-50 text-slate-700 py-1 rounded hover:bg-white transition" title="Abrir clase"><i class="fa-solid fa-video text-blue-600"></i> Entrar</a>` : '';

                htmlFila += `
                    <td class="border border-slate-200 p-2 h-24 text-center relative overflow-hidden align-middle" style="background-color: ${asigEncontrada.color}15;">
                        <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: ${asigEncontrada.color}"></div>
                        <span class="font-bold text-sm block" style="color: ${asigEncontrada.color}">${asigEncontrada.nombre}</span>
                        <span class="text-[10px] text-slate-500 block leading-tight mt-1">${asigEncontrada.profesor || ''}</span>
                        ${iconoMeet}
                    </td>`;
            } else {
                htmlFila += `<td class="border border-slate-200 border-dashed p-2 h-24 text-center align-middle"><span class="text-slate-300 text-xs">Libre</span></td>`;
            }
        });

        fila.innerHTML = htmlFila;
        tablaHorario.appendChild(fila);
    }
}

// ==========================================
// 3. TAREAS (Actualizadas con Fecha Límite)
// ==========================================
const formTarea = document.getElementById('form-tarea');

if(formTarea) {
    formTarea.addEventListener('submit', (e) => {
        e.preventDefault();
        appData.tareas.push({
            id: Date.now(),
            titulo: document.getElementById('input-tarea').value,
            asignatura: document.getElementById('input-asignatura').value,
            fecha: document.getElementById('input-fecha-tarea').value,
            completada: false
        });
        formTarea.reset();
        guardarDatos();
    });
}

function renderizarTareas() {
    const listaTareas = document.getElementById('lista-tareas');
    const selectAsig = document.getElementById('input-asignatura');
    const dashPendientes = document.getElementById('dash-pendientes');
    if (!listaTareas || !selectAsig) return;

    selectAsig.innerHTML = '<option value="" disabled selected>Elige asignatura...</option>';
    if(appData.asignaturas.length === 0) {
        selectAsig.innerHTML += `<option value="General">General (Crea asignaturas en el menú)</option>`;
    } else {
        appData.asignaturas.forEach(a => {
            selectAsig.innerHTML += `<option value="${a.nombre}">${a.nombre}</option>`;
        });
    }

    listaTareas.innerHTML = '';
    let pendientes = 0;

    if (appData.tareas.length === 0) {
        listaTareas.innerHTML = '<li class="p-8 text-center text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</li>';
    }

    const tareasOrdenadas = [...appData.tareas].sort((a, b) => {
        if (a.completada !== b.completada) return a.completada ? 1 : -1;
        if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
        if (a.fecha && !b.fecha) return -1;
        if (!a.fecha && b.fecha) return 1;
        return 0;
    });

    const hoyStr = new Date().toISOString().split('T')[0];

    tareasOrdenadas.forEach(tarea => {
        if (!tarea.completada) pendientes++;

        const asigInfo = appData.asignaturas.find(a => a.nombre === tarea.asignatura);
        const colorEtiqueta = asigInfo ? asigInfo.color : '#94a3b8';

        let badgeFecha = '';
        if (tarea.fecha) {
            const esVencida = tarea.fecha <= hoyStr;
            const colorTexto = esVencida && !tarea.completada ? 'text-red-500 font-bold' : 'text-slate-500';
            const icono = esVencida && !tarea.completada ? 'fa-circle-exclamation' : 'fa-calendar';
            const partes = tarea.fecha.split('-');
            const fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;

            badgeFecha = `<span class="ml-3 text-xs ${colorTexto}"><i class="fa-solid ${icono} mr-1"></i>${fechaFormateada}</span>`;
        }

        const li = document.createElement('li');
        li.className = `p-4 flex items-center justify-between transition-all ${tarea.completada ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`;
        li.innerHTML = `
            <div class="flex items-center gap-4">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''} onchange="toggleTarea(${tarea.id})" class="h-6 w-6 text-blue-600 rounded cursor-pointer">
                <div>
                    <p class="font-medium ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'} text-lg">${tarea.titulo}</p>
                    <p class="text-sm mt-1 flex items-center">
                        <span class="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide text-white" style="background-color: ${colorEtiqueta}">
                            ${tarea.asignatura}
                        </span>
                        ${badgeFecha}
                    </p>
                </div>
            </div>
            <button onclick="eliminarTarea(${tarea.id})" class="text-slate-400 hover:text-red-500 p-2"><i class="fa-solid fa-trash-can"></i></button>
        `;
        listaTareas.appendChild(li);
    });
    if(dashPendientes) dashPendientes.textContent = pendientes;
}

window.toggleTarea = function(id) {
    const t = appData.tareas.find(t => t.id === id);
    if (t) { t.completada = !t.completada; guardarDatos(); }
}
window.eliminarTarea = function(id) {
    appData.tareas = appData.tareas.filter(t => t.id !== id);
    guardarDatos();
}

// ==========================================
// 4. CALIFICACIONES (Enlazadas + Calculadora)
// ==========================================
function renderizarCalificaciones() {
    const contenedor = document.getElementById('contenedor-asignaturas');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (appData.asignaturas.length === 0) {
        contenedor.innerHTML = '<div class="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">Crea tus asignaturas en la sección "Asignaturas" del menú lateral para poder añadirles notas.</div>';
        return;
    }

    appData.asignaturas.forEach(asig => {
        let sumaPesos = 0; let sumaNotas = 0;
        asig.notas.forEach(n => { sumaPesos += n.peso; sumaNotas += n.valor * n.peso; });
        let media = sumaPesos > 0 ? (sumaNotas / sumaPesos).toFixed(2) : '0.00';
        let colorMedia = media >= 5 ? 'text-green-600' : (media > 0 ? 'text-red-500' : 'text-slate-400');

        let htmlNotas = '';
        asig.notas.forEach(n => {
            let colorNota = n.valor >= 5 ? 'text-green-600' : 'text-red-500';
            htmlNotas += `
                <div class="flex justify-between items-center py-2 px-3 hover:bg-slate-50 border-b border-slate-100 rounded">
                    <div>
                        <p class="text-sm font-medium text-slate-700">${n.nombre}</p>
                        <p class="text-xs text-slate-400">Peso: ${n.peso}%</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-bold ${colorNota}">${n.valor}</span>
                        <button onclick="eliminarNota(${asig.id}, ${n.id})" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>`;
        });

        const htmlCalculadora = `
            <div class="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <h4 class="text-xs font-bold uppercase text-blue-700 mb-3"><i class="fa-solid fa-bullseye mr-1"></i> Calculadora Objetivo</h4>
                <form onsubmit="calcularObjetivo(event, ${asig.id}, ${media})" class="flex gap-2 items-center">
                    <input type="number" step="0.1" min="0" max="10" id="calc-meta-${asig.id}" placeholder="Nota que deseas" required class="w-full p-2 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <input type="number" step="1" min="1" max="100" id="calc-peso-${asig.id}" placeholder="Peso %" required class="w-24 p-2 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none" title="Cuánto vale este examen del total de la nota">
                    <button type="submit" class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition shadow-sm text-xs font-bold">Calcular</button>
                </form>
                <div id="calc-resultado-${asig.id}" class="mt-3 text-sm hidden"></div>
            </div>
        `;

        const div = document.createElement('div');
        div.className = 'bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden';
        div.innerHTML = `
            <div class="absolute top-0 left-0 right-0 h-2" style="background-color: ${asig.color}"></div>
            <div class="flex justify-between items-start mt-2 mb-4 pb-4 border-b border-slate-100">
                <h3 class="text-xl font-bold text-slate-800">${asig.nombre}</h3>
                <div class="text-right ml-4">
                    <span class="block text-3xl font-black ${colorMedia} leading-none">${media}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Media Ponderada</span>
                </div>
            </div>
            
            <div class="flex-1 mb-4">
                ${htmlNotas || '<p class="text-sm text-slate-400 italic text-center py-4">Sin notas registradas.</p>'}
                ${htmlCalculadora}
            </div>

            <div class="mt-auto pt-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-slate-100">
                <h4 class="text-[10px] font-bold uppercase text-slate-400 mb-2">Añadir nueva nota real</h4>
                <form onsubmit="agregarNota(event, ${asig.id})" class="flex gap-2">
                    <input type="text" id="nota-nombre-${asig.id}" placeholder="Ej. Práctica 1" required class="w-1/2 p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <input type="number" step="0.01" min="0" max="10" id="nota-valor-${asig.id}" placeholder="Nota" required class="w-1/4 p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <input type="number" step="0.1" min="0.1" max="100" id="nota-peso-${asig.id}" placeholder="Peso %" required class="w-1/4 p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <button type="submit" class="bg-slate-800 text-white px-3 rounded hover:bg-slate-700"><i class="fa-solid fa-plus"></i></button>
                </form>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

window.agregarNota = function(e, idAsig) {
    e.preventDefault();
    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig) {
        asig.notas.push({
            id: Date.now(),
            nombre: document.getElementById(`nota-nombre-${idAsig}`).value,
            valor: parseFloat(document.getElementById(`nota-valor-${idAsig}`).value),
            peso: parseFloat(document.getElementById(`nota-peso-${idAsig}`).value)
        });
        guardarDatos();
    }
}

window.eliminarNota = function(idAsig, idNota) {
    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig) { asig.notas = asig.notas.filter(n => n.id !== idNota); guardarDatos(); }
}

window.calcularObjetivo = function(e, idAsig, mediaActualStr) {
    e.preventDefault();
    const meta = parseFloat(document.getElementById(`calc-meta-${idAsig}`).value);
    const pesoFinal = parseFloat(document.getElementById(`calc-peso-${idAsig}`).value);
    const divResultado = document.getElementById(`calc-resultado-${idAsig}`);
    const mediaActual = parseFloat(mediaActualStr) || 0;
    const pesoRestante = 100 - pesoFinal;
    const puntosActuales = mediaActual * (pesoRestante / 100);
    let notaNecesaria = (meta - puntosActuales) / (pesoFinal / 100);
    notaNecesaria = notaNecesaria.toFixed(2);

    divResultado.classList.remove('hidden');
    if (notaNecesaria > 10) {
        divResultado.innerHTML = `<i class="fa-solid fa-face-dizzy mr-1"></i> Necesitas un <b>${notaNecesaria}</b>. Matemáticamente imposible.`;
        divResultado.className = "mt-3 text-sm p-3 bg-red-100 text-red-700 rounded border border-red-200";
    } else if (notaNecesaria <= 0) {
        divResultado.innerHTML = `<i class="fa-solid fa-party-horn mr-1"></i> Necesitas un <b>${notaNecesaria}</b>. ¡Ya tienes el ${meta} asegurado!`;
        divResultado.className = "mt-3 text-sm p-3 bg-green-100 text-green-700 rounded border border-green-200";
    } else {
        divResultado.innerHTML = `<i class="fa-solid fa-pen-nib mr-1"></i> Para tener un ${meta}, necesitas sacar un <b>${notaNecesaria}</b>.`;
        divResultado.className = "mt-3 text-sm p-3 bg-blue-100 text-blue-800 rounded border border-blue-200";
    }
}

// ==========================================
// 5. IMPORTAR / EXPORTAR (Ajustes)
// ==========================================
window.exportarDatos = function() {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_instituto_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

window.procesarImportacion = function(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const importado = JSON.parse(e.target.result);
            if (importado && typeof importado === 'object' && confirm('⚠️ Esto sobrescribirá tus datos actuales. ¿Continuar?')) {
                appData = importado;
                guardarDatos();
                alert('✅ Backup restaurado!');
                cambiarSeccion('dashboard');
            }
        } catch (error) { alert('❌ Error. Archivo .json no válido.'); }
        event.target.value = '';
    };
    lector.readAsText(archivo);
}

window.reiniciarCurso = function() {
    const primeraAlerta = confirm("⚠️ ATENCIÓN: Estás a punto de borrar TODAS tus asignaturas, horarios, notas y tareas.\n\n¿Continuar?");
    if (primeraAlerta) {
        const segundaAlerta = confirm("🚨 ÚLTIMO AVISO 🚨\n\n¿De verdad quieres perder todo tu historial?");
        if (segundaAlerta) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    }
}

// ==========================================
// NUEVO MÓDULO: PERSONALIZACIÓN Y ONBOARDING
// ==========================================
function comprobarPerfil() {
    const modalBienvenida = document.getElementById('modal-bienvenida');
    if (!appData.perfil) {
        if(modalBienvenida) modalBienvenida.classList.remove('hidden');
    } else {
        aplicarPersonalizacion();
    }
}

window.guardarPerfilPersonalizado = function(e) {
    e.preventDefault();
    const nombre = document.getElementById('perfil-nombre').value.trim();
    const instituto = document.getElementById('perfil-instituto').value.trim();
    const ciudad = document.getElementById('perfil-ciudad').value.trim();
    const urlBanner = `https://picsum.photos/seed/${encodeURIComponent(nombre)}/1600/900`;

    appData.perfil = { nombre: nombre, instituto: instituto, ciudad: ciudad, banner: urlBanner };
    guardarDatos();
    document.getElementById('modal-bienvenida').classList.add('hidden');
    aplicarPersonalizacion();
}

window.detectarUbicacion = function() {
    const inputCiudad = document.getElementById('perfil-ciudad');
    if (!navigator.geolocation) { alert("Tu navegador no soporta la geolocalización."); return; }

    const textoOriginal = inputCiudad.value;
    inputCiudad.value = "Detectando ubicación...";
    inputCiudad.disabled = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await response.json();
            const ciudad = data.address.city || data.address.town || data.address.village || data.address.municipality || "Ubicación desconocida";
            const provincia = data.address.state || data.address.province || "";
            inputCiudad.value = provincia ? `${ciudad}, ${provincia}` : ciudad;
        } catch (error) {
            inputCiudad.value = textoOriginal;
            alert("Error al obtener la ciudad.");
        } finally {
            inputCiudad.disabled = false;
        }
    }, (error) => {
        inputCiudad.value = textoOriginal;
        inputCiudad.disabled = false;
    });
}

window.abrirEdicionPerfil = function() {
    if (appData.perfil) {
        document.getElementById('perfil-nombre').value = appData.perfil.nombre;
        document.getElementById('perfil-instituto').value = appData.perfil.instituto;
        document.getElementById('perfil-ciudad').value = appData.perfil.ciudad;
    }
    document.getElementById('modal-bienvenida').classList.remove('hidden');
}

function aplicarPersonalizacion() {
    if (!appData.perfil) return;
    const textInstituto = document.getElementById('sidebar-instituto');
    if(textInstituto) textInstituto.innerHTML = `<i class="fa-solid fa-building-columns mr-1"></i> ${appData.perfil.instituto}`;

    const textSaludo = document.getElementById('dash-saludo');
    const textUbicacion = document.getElementById('dash-ubicacion');
    const banner = document.getElementById('dash-banner');

    if(textSaludo) textSaludo.innerHTML = `Hola, ${appData.perfil.nombre} 👋`;
    if(textUbicacion) textUbicacion.innerHTML = `<i class="fa-solid fa-location-dot mr-1"></i> ${appData.perfil.ciudad}`;
    if(banner && appData.perfil.banner) { banner.style.backgroundImage = `url('${appData.perfil.banner}')`; }
}

// ==========================================
// RENDERIZADO MAESTRO
// ==========================================
function actualizarUI() {
    comprobarPerfil();
    renderizarConfigAsignaturas();
    renderizarHorarioAuto();
    renderizarTareas();
    renderizarCalificaciones();
    renderizarDashboard();
}

// ARRANQUE DE LA APP
actualizarUI();
cambiarSeccion('dashboard');

// ==========================================
// 6. DASHBOARD INTELIGENTE
// ==========================================
function renderizarDashboard() {
    const diasJS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaHoy = diasJS[new Date().getDay()];

    const spanDia = document.getElementById('dash-dia-actual');
    if(spanDia) spanDia.textContent = (diaHoy === 'sabado' || diaHoy === 'domingo') ? 'Fin de semana' : diaHoy;

    const contenedorClases = document.getElementById('lista-clases-hoy');
    const contadorClases = document.getElementById('dash-clases-hoy');

    if (contenedorClases && contadorClases) {
        let clasesHoy = [];
        appData.asignaturas.forEach(asig => {
            asig.sesiones.forEach(sesion => {
                if (sesion.dia === diaHoy) {
                    clasesHoy.push({ hora: sesion.hora, nombre: asig.nombre, color: asig.color, enlace: asig.enlace, profesor: asig.profesor });
                }
            });
        });

        clasesHoy.sort((a, b) => a.hora - b.hora);
        contadorClases.textContent = clasesHoy.length;

        if (clasesHoy.length === 0) {
            contenedorClases.innerHTML = `<p class="text-slate-400 italic text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">No hay clases programadas para hoy. 🎉</p>`;
        } else {
            let htmlClases = '';
            clasesHoy.forEach(clase => {
                const btnMeet = clase.enlace ? `<a href="${clase.enlace}" target="_blank" class="text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shadow-sm border border-slate-200"><i class="fa-solid fa-video mr-1"></i> Entrar</a>` : '';

                // ACTUALIZADO: Usa el diccionario global TRAMOS_HORARIOS
                const tramo = TRAMOS_HORARIOS[clase.hora];

                htmlClases += `
                    <div class="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden group hover:bg-white hover:shadow-sm transition">
                        <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background-color: ${clase.color}"></div>
                        <div class="w-14 h-14 flex-shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col justify-center items-center ml-2">
                            <span class="text-[9px] text-slate-400 font-bold uppercase">${clase.hora}ª HORA</span>
                            <span class="text-sm font-black text-slate-700">${tramo ? tramo.inicio : clase.hora}</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-slate-800 leading-tight" style="color: ${clase.color}">${clase.nombre}</h4>
                            <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                <span><i class="fa-regular fa-clock mr-1 opacity-75"></i>${tramo ? tramo.inicio + ' - ' + tramo.fin : ''}</span>
                                ${clase.profesor ? `<span>|</span> <span><i class="fa-solid fa-user-tie mr-1 opacity-75"></i>${clase.profesor}</span>` : ''}
                            </p>
                        </div>
                        <div>${btnMeet}</div>
                    </div>
                `;
            });
            contenedorClases.innerHTML = htmlClases;
        }
    }

    const listaTareasDash = document.getElementById('lista-tareas-dashboard');
    const dashPendientes = document.getElementById('dash-pendientes');

    if (listaTareasDash && dashPendientes) {
        let pendientes = appData.tareas.filter(t => !t.completada);
        dashPendientes.textContent = pendientes.length;

        if (pendientes.length === 0) {
            listaTareasDash.innerHTML = `<li class="py-8 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2">Todo al día. No hay tareas pendientes.</li>`;
        } else {
            pendientes.sort((a, b) => {
                if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
                if (a.fecha && !b.fecha) return -1;
                if (!a.fecha && b.fecha) return 1;
                return 0;
            });

            const hoyStr = new Date().toISOString().split('T')[0];
            let htmlTareas = '';

            pendientes.slice(0, 5).forEach(tarea => {
                const asigInfo = appData.asignaturas.find(a => a.nombre === tarea.asignatura);
                const colorPunto = asigInfo ? asigInfo.color : '#cbd5e1';

                let badgeFechaDash = '';
                if(tarea.fecha) {
                    const esVencida = tarea.fecha <= hoyStr;
                    const colorBadge = esVencida ? 'text-red-600 bg-red-100' : 'text-slate-600 bg-slate-100';
                    const partes = tarea.fecha.split('-');
                    const fechaCorta = `${partes[2]}/${partes[1]}`;
                    badgeFechaDash = `<span class="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorBadge}">${fechaCorta}</span>`;
                }

                htmlTareas += `
                    <li class="py-3 flex justify-between items-center group">
                        <div class="flex items-center gap-3 overflow-hidden flex-1">
                            <div class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${colorPunto}"></div>
                            <span class="text-slate-700 font-medium truncate flex-1 flex items-center">${tarea.titulo} ${badgeFechaDash}</span>
                        </div>
                        <button onclick="toggleTarea(${tarea.id})" class="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-4 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition border border-green-200 font-bold">
                            <i class="fa-solid fa-check mr-1"></i> Hecho
                        </button>
                    </li>
                `;
            });
            listaTareasDash.innerHTML = htmlTareas;
        }
    }

    const widgetMedia = document.getElementById('dash-media-global');
    if (widgetMedia) {
        let sumaMedias = 0;
        let asignaturasConNota = 0;

        appData.asignaturas.forEach(asig => {
            let sumaPesos = 0; let sumaNotas = 0;
            asig.notas.forEach(n => { sumaPesos += n.peso; sumaNotas += n.valor * n.peso; });

            if (sumaPesos > 0) {
                sumaMedias += (sumaNotas / sumaPesos);
                asignaturasConNota++;
            }
        });

        if (asignaturasConNota === 0) {
            widgetMedia.textContent = "-";
            widgetMedia.className = "text-3xl font-bold text-slate-300";
        } else {
            const mediaGlobal = (sumaMedias / asignaturasConNota).toFixed(2);
            widgetMedia.textContent = mediaGlobal;
            widgetMedia.className = `text-3xl font-bold ${mediaGlobal >= 5 ? 'text-green-600' : 'text-red-500'}`;
        }
    }
}