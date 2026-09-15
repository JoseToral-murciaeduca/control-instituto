// ==========================================
// CONFIGURACIÓN Y PERSISTENCIA (Local Storage)
// ==========================================
const STORAGE_KEY = 'control_instituto_db';

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tareas: [],
    asignaturas: [] // Ahora este es el núcleo del programa
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

if (formCrearAsignatura) {
    formCrearAsignatura.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevaAsig = {
            id: Date.now(),
            nombre: document.getElementById('asig-nombre').value.trim(),
            profesor: document.getElementById('asig-profesor').value.trim(),
            enlace: document.getElementById('asig-enlace').value.trim(),
            color: document.getElementById('asig-color').value,
            notas: [],
            sesiones: [] // Aquí se guardarán los días y horas
        };
        appData.asignaturas.push(nuevaAsig);
        formCrearAsignatura.reset();
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
        // Generar lista de sesiones (Horario)
        let htmlSesiones = '';
        asig.sesiones.forEach((sesion, index) => {
            htmlSesiones += `
                <div class="flex justify-between items-center text-sm p-2 bg-slate-50 rounded mt-1 border border-slate-100">
                    <span class="capitalize font-medium"><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${sesion.dia} - ${sesion.hora}ª Hora</span>
                    <button onclick="borrarSesion(${asig.id}, ${index})" class="text-red-400 hover:text-red-600 transition"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        });

        // Crear la tarjeta de la asignatura
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
                    <select id="dia-${asig.id}" required class="w-1/2 p-2 text-sm border border-slate-200 rounded">
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                    </select>
                    <select id="hora-${asig.id}" required class="w-1/3 p-2 text-sm border border-slate-200 rounded">
                        <option value="1">1ª Hora</option><option value="2">2ª Hora</option><option value="3">3ª Hora</option>
                        <option value="4">4ª Hora</option><option value="5">5ª Hora</option><option value="6">6ª Hora</option>
                    </select>
                    <button type="submit" class="bg-slate-800 text-white px-3 rounded hover:bg-slate-700 transition" title="Añadir bloque al horario">
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
    if(asig) {
        // Evitar duplicados exactos
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
    if(confirm("⚠️ ¿Borrar asignatura? Se eliminará del horario y se perderán sus calificaciones. (Las tareas pendientes se mantendrán)")) {
        appData.asignaturas = appData.asignaturas.filter(a => a.id !== idAsig);
        guardarDatos();
    }
}

// ==========================================
// 2. HORARIO AUTOMÁTICO (Solo lectura)
// ==========================================
function renderizarHorarioAuto() {
    const tablaHorario = document.getElementById('tabla-horario');
    if (!tablaHorario) return;
    tablaHorario.innerHTML = '';
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    for (let hora = 1; hora <= 6; hora++) {
        const fila = document.createElement('tr');
        let htmlFila = `<td class="border border-slate-200 bg-slate-50 font-bold text-slate-400 text-center align-middle">${hora}ª</td>`;

        dias.forEach(dia => {
            // Buscar si alguna asignatura tiene configurado este día y hora
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
// 3. TAREAS (Actualizadas con Desplegable)
// ==========================================
const formTarea = document.getElementById('form-tarea');

if(formTarea) {
    formTarea.addEventListener('submit', (e) => {
        e.preventDefault();
        appData.tareas.push({
            id: Date.now(),
            titulo: document.getElementById('input-tarea').value,
            asignatura: document.getElementById('input-asignatura').value, // Ahora coge el valor del select
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

    // 1. Llenar el desplegable del formulario con las asignaturas maestras
    selectAsig.innerHTML = '<option value="" disabled selected>Elige asignatura...</option>';
    if(appData.asignaturas.length === 0) {
        selectAsig.innerHTML += `<option value="General">General (Crea asignaturas en el menú)</option>`;
    } else {
        appData.asignaturas.forEach(a => {
            selectAsig.innerHTML += `<option value="${a.nombre}">${a.nombre}</option>`;
        });
    }

    // 2. Pintar las tareas
    listaTareas.innerHTML = '';
    let pendientes = 0;

    if (appData.tareas.length === 0) {
        listaTareas.innerHTML = '<li class="p-8 text-center text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</li>';
    }

    appData.tareas.forEach(tarea => {
        if (!tarea.completada) pendientes++;

        // Buscar el color de la asignatura para ponerle la etiqueta bonita
        const asigInfo = appData.asignaturas.find(a => a.nombre === tarea.asignatura);
        const colorEtiqueta = asigInfo ? asigInfo.color : '#94a3b8'; // Gris por defecto

        const li = document.createElement('li');
        li.className = `p-4 flex items-center justify-between transition-all ${tarea.completada ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`;
        li.innerHTML = `
            <div class="flex items-center gap-4">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''} onchange="toggleTarea(${tarea.id})" class="h-6 w-6 text-blue-600 rounded cursor-pointer">
                <div>
                    <p class="font-medium ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'} text-lg">${tarea.titulo}</p>
                    <p class="text-sm mt-1">
                        <span class="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide text-white" style="background-color: ${colorEtiqueta}">
                            ${tarea.asignatura}
                        </span>
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
// 4. CALIFICACIONES (Enlazadas)
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
            <div class="flex-1 mb-6">${htmlNotas || '<p class="text-sm text-slate-400 italic text-center py-4">Sin notas registradas.</p>'}</div>
            <div class="mt-auto pt-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-slate-100">
                <form onsubmit="agregarNota(event, ${asig.id})" class="flex gap-2">
                    <input type="text" id="nota-nombre-${asig.id}" placeholder="Ej. Examen 1" required class="w-1/2 p-2 text-sm border border-slate-200 rounded">
                    <input type="number" step="0.01" min="0" max="10" id="nota-valor-${asig.id}" placeholder="Nota" required class="w-1/4 p-2 text-sm border border-slate-200 rounded">
                    <input type="number" step="0.1" min="0.1" max="100" id="nota-peso-${asig.id}" placeholder="Peso %" required class="w-1/4 p-2 text-sm border border-slate-200 rounded">
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

// ==========================================
// RENDERIZADO MAESTRO
// ==========================================
function actualizarUI() {
    renderizarConfigAsignaturas();
    renderizarHorarioAuto();
    renderizarTareas();
    renderizarCalificaciones();
}

// ARRANQUE DE LA APP
actualizarUI();
cambiarSeccion('dashboard');

// ==========================================
// 6. DASHBOARD INTELIGENTE
// ==========================================
function renderizarDashboard() {
    // 1. Calcular el día actual (0=Domingo, 1=Lunes...)
    const diasJS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaHoy = diasJS[new Date().getDay()];

    // Mostrar el día en el título (Si es finde, mostramos "Fin de semana")
    const spanDia = document.getElementById('dash-dia-actual');
    if(spanDia) spanDia.textContent = (diaHoy === 'sabado' || diaHoy === 'domingo') ? 'Fin de semana' : diaHoy;

    // 2. RENDERIZAR CLASES DE HOY
    const contenedorClases = document.getElementById('lista-clases-hoy');
    const contadorClases = document.getElementById('dash-clases-hoy');

    if (contenedorClases && contadorClases) {
        let clasesHoy = [];

        // Buscar clases que coincidan con el día de hoy
        appData.asignaturas.forEach(asig => {
            asig.sesiones.forEach(sesion => {
                if (sesion.dia === diaHoy) {
                    clasesHoy.push({ hora: sesion.hora, nombre: asig.nombre, color: asig.color, enlace: asig.enlace, profesor: asig.profesor });
                }
            });
        });

        // Ordenar las clases de 1ª hora a 6ª hora
        clasesHoy.sort((a, b) => a.hora - b.hora);
        contadorClases.textContent = clasesHoy.length;

        if (clasesHoy.length === 0) {
            contenedorClases.innerHTML = `<p class="text-slate-400 italic text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">No hay clases programadas para hoy. 🎉</p>`;
        } else {
            let htmlClases = '';
            clasesHoy.forEach(clase => {
                const btnMeet = clase.enlace ? `<a href="${clase.enlace}" target="_blank" class="text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shadow-sm border border-slate-200"><i class="fa-solid fa-video mr-1"></i> Entrar</a>` : '';
                htmlClases += `
                    <div class="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden group hover:bg-white hover:shadow-sm transition">
                        <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background-color: ${clase.color}"></div>
                        <div class="w-12 h-12 flex-shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col justify-center items-center ml-2">
                            <span class="text-[10px] text-slate-400 font-bold">HORA</span>
                            <span class="text-lg font-black text-slate-700 leading-none">${clase.hora}ª</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-slate-800 leading-tight" style="color: ${clase.color}">${clase.nombre}</h4>
                            <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-user-tie mr-1 opacity-50"></i>${clase.profesor || 'Sin profesor'}</p>
                        </div>
                        <div>${btnMeet}</div>
                    </div>
                `;
            });
            contenedorClases.innerHTML = htmlClases;
        }
    }

    // 3. RENDERIZAR TAREAS (Máximo 5 para no saturar)
    const listaTareasDash = document.getElementById('lista-tareas-dashboard');
    const dashPendientes = document.getElementById('dash-pendientes');

    if (listaTareasDash && dashPendientes) {
        const pendientes = appData.tareas.filter(t => !t.completada);
        dashPendientes.textContent = pendientes.length;

        if (pendientes.length === 0) {
            listaTareasDash.innerHTML = `<li class="py-8 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2">Todo al día. No hay tareas pendientes.</li>`;
        } else {
            let htmlTareas = '';
            pendientes.slice(0, 5).forEach(tarea => {
                const asigInfo = appData.asignaturas.find(a => a.nombre === tarea.asignatura);
                const colorPunto = asigInfo ? asigInfo.color : '#cbd5e1';

                htmlTareas += `
                    <li class="py-3 flex justify-between items-center group">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${colorPunto}"></div>
                            <span class="text-slate-700 font-medium truncate">${tarea.titulo}</span>
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

    // 4. RENDERIZAR MEDIA GLOBAL
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