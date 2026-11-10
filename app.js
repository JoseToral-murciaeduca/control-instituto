// ==========================================
// CONFIGURACIÓN Y PERSISTENCIA (Local Storage)
// ==========================================
const STORAGE_KEY = 'control_instituto_db';

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tareas: [],
    asignaturas: [],
    perfil: null,
    tests: [],
    configHorario: null
};

// Migración de seguridad por si tenías datos antiguos
if(!appData.tests) appData.tests = [];
if (!appData.configHorario) {
    appData.configHorario = {
        tramos: [
            { id: 1, inicio: "15:20", fin: "16:15" },
            { id: 2, inicio: "16:15", fin: "17:10" },
            { id: 3, inicio: "17:10", fin: "18:05" },
            { id: 4, inicio: "18:05", fin: "19:00" },
            { id: 5, inicio: "19:15", fin: "20:10" },
            { id: 6, inicio: "20:10", fin: "21:05" }
        ],
        recreos: [
            { despuesDeIndex: 3, inicio: "19:00", fin: "19:15", descripcion: "Recreo" }
        ]
    };
}
appData.asignaturas.forEach(asig => {
    if (!asig.notas) asig.notas = [];
    if (!asig.sesiones) asig.sesiones = [];
    if (!asig.color) asig.color = '#3b82f6';
    if (!asig.colorTexto) asig.colorTexto = asig.color; // AÑADIDO: Migración color texto
    if (!asig.profesor) asig.profesor = '';
    if (!asig.enlace) asig.enlace = '';
    if (asig.enlace_clase === undefined) asig.enlace_clase = '';
});

function guardarDatos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    actualizarUI();
}

function getHorasSelectHTML() {
    let html = '<option value="" disabled selected>Elige franja horaria...</option>';
    appData.configHorario.tramos.forEach((t, i) => {
        html += `<option value="${t.id}">${i+1}ª Hora (${t.inicio} - ${t.fin})</option>`;
    });
    return html;
}

// ==========================================
// CONFIGURACIÓN DINÁMICA DEL HORARIO
// ==========================================
let tempConfigHorario = null;

window.abrirConfigHorario = function() {
    tempConfigHorario = JSON.parse(JSON.stringify(appData.configHorario));
    renderizarModalConfigHorario();
    document.getElementById('modal-config-horario').classList.remove('hidden');
}

function renderizarModalConfigHorario() {
    const cTramos = document.getElementById('lista-config-tramos');
    let htmlT = '';
    tempConfigHorario.tramos.forEach((t, i) => {
        htmlT += `<div class="flex gap-2 mb-2 items-center bg-white p-2 rounded border border-slate-200 shadow-sm">
            <span class="font-bold text-sm text-slate-500 w-6 text-center">${i + 1}ª</span>
            <input type="time" class="p-2 border border-slate-300 rounded text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none" value="${t.inicio}" onchange="tempConfigHorario.tramos[${i}].inicio = this.value" required>
            <span class="text-slate-400 text-sm">a</span>
            <input type="time" class="p-2 border border-slate-300 rounded text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none" value="${t.fin}" onchange="tempConfigHorario.tramos[${i}].fin = this.value" required>
            <button type="button" onclick="borrarConfigTramo(${i})" class="text-red-400 hover:text-red-600 px-3 transition"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
    cTramos.innerHTML = htmlT;

    const cRecreos = document.getElementById('lista-config-recreos');
    let htmlR = '';
    tempConfigHorario.recreos.forEach((r, i) => {
        htmlR += `<div class="flex flex-col gap-3 mb-3 bg-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm">
            <div class="flex justify-between items-center">
                <input type="text" class="p-2 text-sm border border-slate-300 rounded font-bold w-1/2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value="${r.descripcion || 'Recreo'}" onchange="tempConfigHorario.recreos[${i}].descripcion = this.value" placeholder="Nombre (Ej. Recreo)">
                <button type="button" onclick="borrarConfigRecreo(${i})" class="text-red-400 hover:text-red-600 px-2"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs text-slate-500 font-bold uppercase tracking-wide">¿Cuándo se hace?</span>
                <select class="p-2 border border-slate-300 rounded text-sm w-full focus:ring-2 focus:ring-green-500 outline-none bg-white" onchange="tempConfigHorario.recreos[${i}].despuesDeIndex = parseInt(this.value)">
                    <option value="-1" ${r.despuesDeIndex === -1 ? 'selected' : ''}>Antes de empezar las clases</option>
                    ${tempConfigHorario.tramos.map((t, idx) => `<option value="${idx}" ${r.despuesDeIndex === idx ? 'selected' : ''}>Después de la ${idx+1}ª Hora</option>`).join('')}
                </select>
            </div>
            <div class="flex gap-2 items-center mt-1">
                <input type="time" class="p-2 border border-slate-300 rounded text-sm flex-1 focus:ring-2 focus:ring-green-500 outline-none bg-white" value="${r.inicio}" onchange="tempConfigHorario.recreos[${i}].inicio = this.value" required>
                <span class="text-slate-400 text-sm">-</span>
                <input type="time" class="p-2 border border-slate-300 rounded text-sm flex-1 focus:ring-2 focus:ring-green-500 outline-none bg-white" value="${r.fin}" onchange="tempConfigHorario.recreos[${i}].fin = this.value" required>
            </div>
        </div>`;
    });
    cRecreos.innerHTML = htmlR;
}

window.addConfigTramo = function() {
    const nextId = tempConfigHorario.tramos.length > 0 ? Math.max(...tempConfigHorario.tramos.map(t=>t.id)) + 1 : 1;
    tempConfigHorario.tramos.push({ id: nextId, inicio: "00:00", fin: "00:00" });
    renderizarModalConfigHorario();
}
window.borrarConfigTramo = function(idx) {
    tempConfigHorario.tramos.splice(idx, 1);
    renderizarModalConfigHorario();
}
window.addConfigRecreo = function() {
    const despues = tempConfigHorario.tramos.length > 0 ? tempConfigHorario.tramos.length - 1 : -1;
    tempConfigHorario.recreos.push({ despuesDeIndex: despues, inicio: "00:00", fin: "00:00", descripcion: "Recreo" });
    renderizarModalConfigHorario();
}
window.borrarConfigRecreo = function(idx) {
    tempConfigHorario.recreos.splice(idx, 1);
    renderizarModalConfigHorario();
}
window.guardarConfigHorario = function() {
    appData.configHorario = JSON.parse(JSON.stringify(tempConfigHorario));
    guardarDatos();
    document.getElementById('modal-config-horario').classList.add('hidden');
}


// ==========================================
// NAVEGACIÓN Y RESPONSIVE
// ==========================================
function cambiarSeccion(idSeccion) {
    document.querySelectorAll('.seccion-app').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(idSeccion).classList.remove('hidden');

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) {
        toggleSidebar();
    }
}

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

// ==========================================
// ONBOARDING, PERFIL Y GEOLOCALIZACIÓN
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

    const promptTexto = `beautiful landscape of ${ciudad}, near ${instituto}, cinematic lighting, high resolution, realistic`;
    const urlBanner = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptTexto)}?width=1600&height=900&nologo=true`;

    appData.perfil = { nombre, instituto, ciudad, banner: urlBanner };
    guardarDatos();
    document.getElementById('modal-bienvenida').classList.add('hidden');
    aplicarPersonalizacion();
}

window.detectarUbicacion = function() {
    const inputCiudad = document.getElementById('perfil-ciudad');

    if (!navigator.geolocation) {
        alert("Tu navegador no soporta la geolocalización.");
        return;
    }

    const textoOriginal = inputCiudad.value;
    inputCiudad.value = "Detectando ubicación...";
    inputCiudad.disabled = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();

            const ciudad = data.address.city || data.address.town || data.address.village || data.address.municipality || "Ubicación desconocida";
            const provincia = data.address.state || data.address.province || "";

            inputCiudad.value = provincia ? `${ciudad}, ${provincia}` : ciudad;
        } catch (error) {
            console.error("Error al conectar con el satélite:", error);
            inputCiudad.value = textoOriginal;
            alert("No se pudo obtener el nombre de la ciudad. Por favor, escríbela a mano.");
        } finally {
            inputCiudad.disabled = false;
        }
    }, (error) => {
        console.warn("Error de GPS:", error);
        inputCiudad.value = textoOriginal;
        inputCiudad.disabled = false;
        alert("No has dado permiso o hay un error con la ubicación. Por favor, escríbela a mano.");
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

    if(banner && appData.perfil.banner) {
        banner.style.backgroundImage = `url('${appData.perfil.banner}')`;
    }
}

// ==========================================
// 1. GESTIÓN DE ASIGNATURAS (CON EDICIÓN)
// ==========================================
const formCrearAsignatura = document.getElementById('form-crear-asignatura');
let contadorFilasHorario = 0;

window.agregarFilaHorarioFormulario = function() {
    const contenedor = document.getElementById('contenedor-filas-horario');
    const idFila = `fila-horario-${contadorFilasHorario++}`;
    const div = document.createElement('div');
    div.id = idFila;
    div.className = 'flex flex-col md:flex-row gap-3 items-center animate-fade-in w-full mb-2';
    div.innerHTML = `
        <select class="select-dia-nuevo w-full md:w-1/3 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-orange-500 bg-white">
            <option value="lunes">Lunes</option><option value="martes">Martes</option>
            <option value="miercoles">Miércoles</option><option value="jueves">Jueves</option>
            <option value="viernes">Viernes</option>
        </select>
        <select class="input-hora-nuevo w-full md:w-1/2 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-orange-500 bg-white" required>
            ${getHorasSelectHTML()}
        </select>
        <button type="button" onclick="document.getElementById('${idFila}').remove()" class="w-full md:w-auto text-red-400 hover:text-red-600 p-2 transition bg-white rounded border border-slate-200" title="Borrar fila">
            <i class="fa-solid fa-trash-can"></i> Borrar
        </button>
    `;
    contenedor.appendChild(div);
}

if (formCrearAsignatura) {
    formCrearAsignatura.addEventListener('submit', (e) => {
        e.preventDefault();

        const editId = document.getElementById('asig-edit-id').value;

        const sesiones = [];
        const filas = document.getElementById('contenedor-filas-horario').children;
        for(let fila of filas) {
            const dia = fila.querySelector('.select-dia-nuevo').value;
            const hora = parseInt(fila.querySelector('.input-hora-nuevo').value);
            if(!isNaN(hora) && !sesiones.some(s => s.dia === dia && s.hora === hora)) {
                sesiones.push({ dia, hora });
            }
        }

        const nombre = document.getElementById('asig-nombre').value.trim();
        const profesor = document.getElementById('asig-profesor').value.trim();
        const enlace = document.getElementById('asig-enlace').value.trim();
        const enlace_clase = document.getElementById('asig-enlace-class').value.trim();
        const color = document.getElementById('asig-color').value;
        const colorTexto = document.getElementById('asig-color-texto').value; // AÑADIDO: Color del Texto

        if (editId) {
            const asigIndex = appData.asignaturas.findIndex(a => a.id == editId);
            if (asigIndex >= 0) {
                appData.asignaturas[asigIndex].nombre = nombre;
                appData.asignaturas[asigIndex].profesor = profesor;
                appData.asignaturas[asigIndex].enlace = enlace;
                appData.asignaturas[asigIndex].enlace_clase = enlace_clase;
                appData.asignaturas[asigIndex].color = color;
                appData.asignaturas[asigIndex].colorTexto = colorTexto;
                appData.asignaturas[asigIndex].sesiones = sesiones;
            }
        } else {
            appData.asignaturas.push({
                id: Date.now(),
                nombre: nombre,
                profesor: profesor,
                enlace: enlace,
                enlace_clase: enlace_clase,
                color: color,
                colorTexto: colorTexto,
                notas: [],
                sesiones: sesiones
            });
        }

        cancelarEdicionAsignatura();
        guardarDatos();
    });
}

window.editarAsignaturaMaster = function(idAsig) {
    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if (!asig) return;

    document.getElementById('asig-edit-id').value = asig.id;
    document.getElementById('asig-nombre').value = asig.nombre;
    document.getElementById('asig-profesor').value = asig.profesor;
    document.getElementById('asig-enlace').value = asig.enlace;
    document.getElementById('asig-enlace-class').value = asig.enlace_clase || '';
    document.getElementById('asig-color').value = asig.color;
    document.getElementById('asig-color-texto').value = asig.colorTexto || asig.color; // AÑADIDO

    const contenedor = document.getElementById('contenedor-filas-horario');
    contenedor.innerHTML = '';

    asig.sesiones.forEach(ses => {
        window.agregarFilaHorarioFormulario();
        const filas = document.getElementById('contenedor-filas-horario').children;
        const ultimaFila = filas[filas.length - 1];
        ultimaFila.querySelector('.select-dia-nuevo').value = ses.dia;
        ultimaFila.querySelector('.input-hora-nuevo').value = ses.hora;
    });

    document.getElementById('btn-cancelar-edicion-asig').classList.remove('hidden');
    document.getElementById('asignaturas-config').scrollIntoView({ behavior: 'smooth' });
}

window.cancelarEdicionAsignatura = function() {
    const form = document.getElementById('form-crear-asignatura');
    if (form) form.reset();
    document.getElementById('asig-edit-id').value = '';
    document.getElementById('contenedor-filas-horario').innerHTML = '';
    const btnCancel = document.getElementById('btn-cancelar-edicion-asig');
    if (btnCancel) btnCancel.classList.add('hidden');
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
        asig.sesiones.sort((a, b) => a.hora - b.hora).forEach((sesion, index) => {
            const tramo = appData.configHorario.tramos.find(tr => tr.id === sesion.hora);
            const ordinal = appData.configHorario.tramos.findIndex(tr => tr.id === sesion.hora);
            const textoHora = tramo ? `${tramo.inicio} - ${tramo.fin}` : (ordinal >= 0 ? `${ordinal+1}ª Hora` : 'Hora eliminada');

            htmlSesiones += `
                <div class="flex justify-between items-center p-2 bg-slate-50 rounded mt-1 border border-slate-100">
                    <span class="capitalize font-medium text-xs md:text-sm"><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${sesion.dia} <span class="text-slate-400 mx-1">|</span> ${textoHora}</span>
                </div>
            `;
        });

        const div = document.createElement('div');
        div.className = 'bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden';
        div.innerHTML = `
            <div class="absolute top-0 left-0 right-0 h-2" style="background-color: ${asig.color}"></div>
            <div class="flex justify-between items-start mt-2 mb-4 pb-4 border-b border-slate-100">
                <div class="pr-4">
                    <h3 class="text-lg md:text-xl font-bold leading-tight" style="color: ${asig.colorTexto || asig.color}">${asig.nombre}</h3>
                    ${asig.profesor ? `<p class="text-xs md:text-sm text-slate-500 mt-1"><i class="fa-solid fa-chalkboard-user mr-1"></i>${asig.profesor}</p>` : ''}
                    <div>
                        ${asig.enlace ? `<a href="${asig.enlace}" target="_blank" class="text-xs md:text-sm text-blue-500 hover:underline mt-1 inline-block mr-3"><i class="fa-solid fa-video mr-1"></i>Enlace (Meet)</a>` : ''}
                        ${asig.enlace_clase ? `<a href="${asig.enlace_clase}" target="_blank" class="text-xs md:text-sm text-emerald-500 hover:underline mt-1 inline-block"><i class="fa-solid fa-school mr-1"></i>Enlace de clase</a>` : ''}
                    </div>
                </div>
                <div class="flex items-center">
                    <button onclick="editarAsignaturaMaster(${asig.id})" class="text-blue-400 hover:text-blue-600 p-2 rounded transition bg-blue-50 shrink-0 mr-2" title="Editar asignatura">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="eliminarAsignaturaMaster(${asig.id})" class="text-red-400 hover:text-red-600 p-2 rounded transition bg-red-50 shrink-0" title="Borrar asignatura completa">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            
            <div class="flex-1">
                <h4 class="text-xs font-bold uppercase text-slate-400 mb-2">Bloques de Horario</h4>
                ${htmlSesiones || '<p class="text-xs text-slate-400 italic">No tiene horario asignado.</p>'}
            </div>
        `;
        contenedor.appendChild(div);
    });
}

window.eliminarAsignaturaMaster = function(idAsig) {
    if(confirm("⚠️ ¿Borrar asignatura? Se eliminará del horario y se perderán sus calificaciones.")) {
        appData.asignaturas = appData.asignaturas.filter(a => a.id !== idAsig);
        guardarDatos();
    }
}

// ==========================================
// 2. HORARIO AUTOMÁTICO DINÁMICO
// ==========================================
function renderizarHorarioAuto() {
    const tablaHorario = document.getElementById('tabla-horario');
    if (!tablaHorario) return;

    let fullHTML = '';
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    const recreosIniciales = appData.configHorario.recreos.filter(r => r.despuesDeIndex === -1);
    recreosIniciales.forEach(r => {
        fullHTML += `<tr class="bg-slate-200 border-y border-slate-300 text-center shadow-inner"><td colspan="6" class="py-2"><span class="text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-widest"><i class="fa-solid fa-mug-hot mr-2"></i> ${r.descripcion || 'Recreo'} (${r.inicio} - ${r.fin})</span></td></tr>`;
    });

    appData.configHorario.tramos.forEach((tramo, index) => {
        let f = `<tr><td class="border border-slate-200 bg-white text-center align-middle p-2 w-16 md:w-20 shadow-sm relative z-10"><span class="block font-bold text-slate-800 text-xs md:text-sm leading-tight">${tramo.inicio}</span><span class="block font-bold text-slate-800 text-xs md:text-sm leading-tight">${tramo.fin}</span></td>`;

        dias.forEach(dia => {
            const asigEncontrada = appData.asignaturas.find(a => a.sesiones.some(s => s.dia === dia && s.hora === tramo.id));
            if (asigEncontrada) {
                const iconoMeet = asigEncontrada.enlace ? `<a href="${asigEncontrada.enlace}" target="_blank" class="block mt-2 text-[10px] bg-white bg-opacity-50 text-blue-700 py-1 rounded hover:bg-white transition" title="Enlace Meet/Zoom"><i class="fa-solid fa-video"></i></a>` : '';
                const iconoClase = asigEncontrada.enlace_clase ? `<a href="${asigEncontrada.enlace_clase}" target="_blank" class="block mt-1 text-[10px] bg-white bg-opacity-50 text-emerald-700 py-1 rounded hover:bg-white transition" title="Enlace de Clase"><i class="fa-solid fa-school"></i></a>` : '';

                f += `
                    <td class="border border-slate-200 p-1 md:p-2 h-20 md:h-24 text-center relative overflow-hidden align-middle" style="background-color: ${asigEncontrada.color}15;">
                        <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: ${asigEncontrada.color}"></div>
                        <span class="font-bold text-[10px] md:text-sm block leading-tight" style="color: ${asigEncontrada.colorTexto || asigEncontrada.color}">${asigEncontrada.nombre}</span>
                        <span class="text-[9px] md:text-[10px] text-slate-500 block leading-tight mt-1">${asigEncontrada.profesor || ''}</span>
                        ${iconoMeet}
                        ${iconoClase}
                    </td>`;
            } else {
                f += `<td class="border border-slate-200 border-dashed p-2 h-24 text-center align-middle"><span class="text-slate-300 text-[10px]">Libre</span></td>`;
            }
        });
        f += `</tr>`;
        fullHTML += f;

        const recreosDespues = appData.configHorario.recreos.filter(r => r.despuesDeIndex === index);
        recreosDespues.forEach(r => {
            fullHTML += `<tr class="bg-slate-200 border-y border-slate-300 text-center shadow-inner"><td colspan="6" class="py-2"><span class="text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-widest"><i class="fa-solid fa-mug-hot mr-2"></i> ${r.descripcion || 'Recreo'} (${r.inicio} - ${r.fin})</span></td></tr>`;
        });
    });

    tablaHorario.innerHTML = fullHTML;
}

// ==========================================
// 3. TAREAS
// ==========================================
const formTarea = document.getElementById('form-tarea');
if(formTarea) {
    formTarea.addEventListener('submit', (e) => {
        e.preventDefault();
        appData.tareas.push({ id: Date.now(), titulo: document.getElementById('input-tarea').value, asignatura: document.getElementById('input-asignatura').value, fecha: document.getElementById('input-fecha-tarea').value, completada: false });
        formTarea.reset(); guardarDatos();
    });
}
function renderizarTareas() {
    const listaTareas = document.getElementById('lista-tareas'); const selectAsig = document.getElementById('input-asignatura'); const dashPendientes = document.getElementById('dash-pendientes');
    if (!listaTareas || !selectAsig) return;

    selectAsig.innerHTML = '<option value="" disabled selected>Elige asignatura...</option>';
    if(appData.asignaturas.length === 0) selectAsig.innerHTML += `<option value="General">General</option>`; else appData.asignaturas.forEach(a => selectAsig.innerHTML += `<option value="${a.nombre}">${a.nombre}</option>`);

    listaTareas.innerHTML = ''; let pendientes = 0;
    if (appData.tareas.length === 0) listaTareas.innerHTML = '<li class="p-8 text-center text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</li>';

    const tareasOrdenadas = [...appData.tareas].sort((a, b) => {
        if (a.completada !== b.completada) return a.completada ? 1 : -1;
        if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
        if (a.fecha && !b.fecha) return -1; if (!a.fecha && b.fecha) return 1; return 0;
    });

    const hoyStr = new Date().toISOString().split('T')[0];
    tareasOrdenadas.forEach(tarea => {
        if (!tarea.completada) pendientes++;
        const asigInfo = appData.asignaturas.find(a => a.nombre === tarea.asignatura); const colorEtiqueta = asigInfo ? asigInfo.color : '#94a3b8';
        const colorTexto = asigInfo ? asigInfo.colorTexto || '#ffffff' : '#ffffff';

        let badgeFecha = '';
        if (tarea.fecha) {
            const esVencida = tarea.fecha <= hoyStr; const colorTexto = esVencida && !tarea.completada ? 'text-red-500 font-bold' : 'text-slate-500';
            const icono = esVencida && !tarea.completada ? 'fa-circle-exclamation' : 'fa-calendar';
            badgeFecha = `<span class="ml-2 md:ml-3 text-[10px] md:text-xs ${colorTexto}"><i class="fa-solid ${icono} mr-1"></i>${tarea.fecha.split('-')[2]}/${tarea.fecha.split('-')[1]}/${tarea.fecha.split('-')[0]}</span>`;
        }

        const li = document.createElement('li');
        li.className = `p-3 md:p-4 flex items-center justify-between transition-all ${tarea.completada ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`;
        li.innerHTML = `
            <div class="flex items-center gap-3 md:gap-4 overflow-hidden">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''} onchange="toggleTarea(${tarea.id})" class="h-5 w-5 md:h-6 md:w-6 text-blue-600 rounded shrink-0 cursor-pointer">
                <div class="min-w-0">
                    <p class="font-medium ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'} text-sm md:text-lg truncate">${tarea.titulo}</p>
                    <p class="text-xs mt-1 flex items-center flex-wrap gap-1"><span class="px-2 py-0.5 rounded font-semibold uppercase tracking-wide text-[9px] md:text-[10px]" style="background-color: ${colorEtiqueta}; color: ${colorTexto}">${tarea.asignatura}</span>${badgeFecha}</p>
                </div>
            </div>
            <button onclick="eliminarTarea(${tarea.id})" class="text-slate-400 hover:text-red-500 p-2 shrink-0"><i class="fa-solid fa-trash-can"></i></button>
        `;
        listaTareas.appendChild(li);
    });
    if(dashPendientes) dashPendientes.textContent = pendientes;
}
window.toggleTarea = function(id) { const t = appData.tareas.find(t => t.id === id); if (t) { t.completada = !t.completada; guardarDatos(); } }
window.eliminarTarea = function(id) { appData.tareas = appData.tareas.filter(t => t.id !== id); guardarDatos(); }

// ==========================================
// 4. CALIFICACIONES
// ==========================================
function renderizarCalificaciones() {
    const contenedor = document.getElementById('contenedor-asignaturas');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (appData.asignaturas.length === 0) return contenedor.innerHTML = '<div class="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">Crea tus asignaturas en la sección "Asignaturas".</div>';

    appData.asignaturas.forEach(asig => {
        let sumaPesos = 0; let sumaNotas = 0;
        asig.notas.forEach(n => { sumaPesos += n.peso; sumaNotas += n.valor * n.peso; });
        let media = sumaPesos > 0 ? (sumaNotas / sumaPesos).toFixed(2) : '0.00';
        let colorMedia = media >= 5 ? 'text-green-600' : (media > 0 ? 'text-red-500' : 'text-slate-400');

        let htmlNotas = '';
        asig.notas.forEach(n => {
            let colorNota = n.valor >= 5 ? 'text-green-600' : 'text-red-500';
            htmlNotas += `
                <div class="flex justify-between items-center py-2 px-2 hover:bg-slate-50 border-b border-slate-100 rounded">
                    <div class="truncate pr-2"><p class="text-xs md:text-sm font-medium text-slate-700 truncate">${n.nombre}</p><p class="text-[10px] text-slate-400">Peso: ${n.peso}%</p></div>
                    <div class="flex items-center gap-3 shrink-0"><span class="font-bold ${colorNota}">${n.valor}</span><button onclick="eliminarNota(${asig.id}, ${n.id})" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button></div>
                </div>`;
        });

        const htmlCalculadora = `
            <div class="mt-4 p-3 md:p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <h4 class="text-[10px] md:text-xs font-bold uppercase text-blue-700 mb-2"><i class="fa-solid fa-bullseye mr-1"></i> Calculadora Objetivo</h4>
                <form onsubmit="calcularObjetivo(event, ${asig.id}, ${media})" class="flex gap-2 items-center">
                    <input type="number" step="0.1" min="0" max="10" id="calc-meta-${asig.id}" placeholder="Nota" required class="w-full p-1.5 md:p-2 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <input type="number" step="1" min="1" max="100" id="calc-peso-${asig.id}" placeholder="Peso %" required class="w-16 md:w-20 p-1.5 md:p-2 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none" title="Cuánto vale este examen del total de la nota">
                    <button type="submit" class="bg-blue-600 text-white px-2 py-1.5 md:py-2 rounded transition shadow-sm font-bold text-xs"><i class="fa-solid fa-calculator"></i></button>
                </form>
                <div id="calc-resultado-${asig.id}" class="mt-2 text-xs md:text-sm hidden"></div>
            </div>`;

        const div = document.createElement('div');
        div.className = 'bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden';
        div.innerHTML = `
            <div class="absolute top-0 left-0 right-0 h-2" style="background-color: ${asig.color}"></div>
            <div class="flex justify-between items-start mt-2 mb-4 pb-4 border-b border-slate-100">
                <h3 class="text-lg md:text-xl font-bold leading-tight pr-2" style="color: ${asig.colorTexto || asig.color}">${asig.nombre}</h3>
                <div class="text-right shrink-0"><span class="block text-2xl md:text-3xl font-black ${colorMedia} leading-none">${media}</span></div>
            </div>
            <div class="flex-1 mb-4">${htmlNotas || '<p class="text-xs md:text-sm text-slate-400 italic text-center py-4">Sin notas registradas.</p>'}${htmlCalculadora}</div>
            <div class="mt-auto pt-4 bg-slate-50 -mx-4 -mb-4 md:-mx-6 md:-mb-6 p-4 md:p-6 rounded-b-xl border-t border-slate-100">
                <form onsubmit="agregarNota(event, ${asig.id})" class="flex gap-2">
                    <input type="text" id="nota-nombre-${asig.id}" placeholder="Examen" required class="w-1/2 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <input type="number" step="0.01" min="0" max="10" id="nota-valor-${asig.id}" placeholder="Nota" required class="w-1/4 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <input type="number" step="0.1" min="0.1" max="100" id="nota-peso-${asig.id}" placeholder="%" required class="w-1/4 p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-yellow-400 focus:outline-none">
                    <button type="submit" class="bg-slate-800 text-white px-2 rounded hover:bg-slate-700"><i class="fa-solid fa-plus"></i></button>
                </form>
            </div>`;
        contenedor.appendChild(div);
    });
}
window.agregarNota = function(e, idAsig) { e.preventDefault(); const asig = appData.asignaturas.find(a => a.id === idAsig); if(asig) { asig.notas.push({ id: Date.now(), nombre: document.getElementById(`nota-nombre-${idAsig}`).value, valor: parseFloat(document.getElementById(`nota-valor-${idAsig}`).value), peso: parseFloat(document.getElementById(`nota-peso-${idAsig}`).value) }); guardarDatos(); } }
window.eliminarNota = function(idAsig, idNota) { const asig = appData.asignaturas.find(a => a.id === idAsig); if(asig) { asig.notas = asig.notas.filter(n => n.id !== idNota); guardarDatos(); } }
window.calcularObjetivo = function(e, idAsig, mediaActualStr) {
    e.preventDefault(); const meta = parseFloat(document.getElementById(`calc-meta-${idAsig}`).value); const pesoFinal = parseFloat(document.getElementById(`calc-peso-${idAsig}`).value); const divResultado = document.getElementById(`calc-resultado-${idAsig}`); const mediaActual = parseFloat(mediaActualStr) || 0; const pesoRestante = 100 - pesoFinal; const puntosActuales = mediaActual * (pesoRestante / 100); let notaNecesaria = (meta - puntosActuales) / (pesoFinal / 100); notaNecesaria = notaNecesaria.toFixed(2);
    divResultado.classList.remove('hidden');
    if (notaNecesaria > 10) { divResultado.innerHTML = `Necesitas <b>${notaNecesaria}</b> (Imposible).`; divResultado.className = "mt-2 text-xs p-2 bg-red-100 text-red-700 rounded border border-red-200"; } else if (notaNecesaria <= 0) { divResultado.innerHTML = `¡Ya tienes el ${meta} asegurado!`; divResultado.className = "mt-2 text-xs p-2 bg-green-100 text-green-700 rounded border border-green-200"; } else { divResultado.innerHTML = `Necesitas sacar un <b>${notaNecesaria}</b>.`; divResultado.className = "mt-2 text-xs p-2 bg-blue-100 text-blue-800 rounded border border-blue-200"; }
}

// ==========================================
// 5. IMPORTAR / EXPORTAR / PRUEBAS (Ajustes)
// ==========================================
window.exportarDatos = function() { const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `control_instituto_backup_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
window.procesarImportacion = function(event) { const archivo = event.target.files[0]; if (!archivo) return; const lector = new FileReader(); lector.onload = function(e) { try { const importado = JSON.parse(e.target.result); if (importado && typeof importado === 'object' && confirm('⚠️ Esto sobrescribirá tus datos actuales. ¿Continuar?')) { appData = importado; guardarDatos(); alert('✅ Backup restaurado!'); cambiarSeccion('dashboard'); } } catch (error) { alert('❌ Error. Archivo no válido.'); } event.target.value = ''; }; lector.readAsText(archivo); }

window.reiniciarCurso = function() { if (confirm("⚠️ ATENCIÓN: Estás a punto de borrar TODAS tus asignaturas, horarios, notas y tareas.\n\n¿Continuar?")) { if (confirm("🚨 ÚLTIMO AVISO 🚨\n\n¿De verdad quieres perder todo tu historial?")) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } } }

// NUEVO: Limpieza ultra rápida del Caché para programar/hacer pruebas
window.limpiarLocalStorage = function() {
    if (confirm("🛠️ MODO DESARROLLO: ¿Borrar la base de datos local y recargar?")) {
        localStorage.clear();
        window.location.reload();
    }
}


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
                    clasesHoy.push({ hora: sesion.hora, nombre: asig.nombre, color: asig.color, colorTexto: asig.colorTexto, enlace: asig.enlace, enlace_clase: asig.enlace_clase, profesor: asig.profesor });
                }
            });
        });
        clasesHoy.sort((a, b) => a.hora - b.hora);
        contadorClases.textContent = clasesHoy.length;

        if (clasesHoy.length === 0) {
            contenedorClases.innerHTML = `<p class="text-slate-400 italic text-center py-6 text-sm">No hay clases programadas para hoy. 🎉</p>`;
        } else {
            let htmlClases = '';
            clasesHoy.forEach(clase => {
                const btnMeet = clase.enlace ? `<a href="${clase.enlace}" target="_blank" class="text-[10px] md:text-xs font-bold bg-white text-blue-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-50 transition shadow-sm border border-slate-200 shrink-0" title="Enlace Meet/Zoom"><i class="fa-solid fa-video"></i></a>` : '';
                const btnClase = clase.enlace_clase ? `<a href="${clase.enlace_clase}" target="_blank" class="text-[10px] md:text-xs font-bold bg-white text-emerald-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-emerald-50 transition shadow-sm border border-slate-200" title="Enlace de Clase"><i class="fa-solid fa-school"></i></a>` : '';

                const tramo = appData.configHorario.tramos.find(tr => tr.id === clase.hora);
                const oIdx = appData.configHorario.tramos.findIndex(tr => tr.id === clase.hora);

                htmlClases += `
                    <div class="flex items-center gap-3 p-2 md:p-3 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden group hover:bg-white hover:shadow-sm transition">
                        <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background-color: ${clase.color}"></div>
                        <div class="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col justify-center items-center ml-1 md:ml-2">
                            <span class="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase">${oIdx >= 0 ? oIdx + 1 + 'ª' : ''} H</span>
                            <span class="text-xs md:text-sm font-black text-slate-700">${tramo ? tramo.inicio : clase.hora}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm md:text-base leading-tight truncate" style="color: ${clase.colorTexto || clase.color}">${clase.nombre}</h4>
                            <p class="text-[9px] md:text-[11px] text-slate-500 mt-1 truncate">
                                <span><i class="fa-regular fa-clock mr-1 opacity-75"></i>${tramo ? tramo.inicio + ' - ' + tramo.fin : ''}</span>
                                ${clase.profesor ? `<span>|</span> <span><i class="fa-solid fa-user-tie mr-1 opacity-75"></i>${clase.profesor}</span>` : ''}
                            </p>
                        </div>
                        <div class="flex gap-1 shrink-0">${btnMeet}${btnClase}</div>
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
            listaTareasDash.innerHTML = `<li class="py-6 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2 text-sm">Todo al día. No hay tareas pendientes.</li>`;
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
                    badgeFechaDash = `<span class="ml-1 md:ml-2 px-1 py-0.5 rounded text-[9px] md:text-[10px] font-bold ${colorBadge}">${partes[2]}/${partes[1]}</span>`;
                }
                htmlTareas += `
                    <li class="py-2.5 md:py-3 flex justify-between items-center group border-b border-slate-50 last:border-0">
                        <div class="flex items-center gap-2 overflow-hidden flex-1">
                            <div class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" style="background-color: ${colorPunto}"></div>
                            <span class="text-slate-700 text-xs md:text-sm font-medium truncate flex-1 flex items-center">${tarea.titulo} ${badgeFechaDash}</span>
                        </div>
                        <button onclick="toggleTarea(${tarea.id})" class="text-[10px] md:text-xs bg-green-50 text-green-600 px-2 py-1 md:px-3 md:py-1.5 rounded border border-green-200 ml-2 shrink-0">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </li>
                `;
            });
            listaTareasDash.innerHTML = htmlTareas;
        }
    }

    const widgetMedia = document.getElementById('dash-media-global');
    if (widgetMedia) {
        let sumaMedias = 0; let asignaturasConNota = 0;
        appData.asignaturas.forEach(asig => {
            let sumaPesos = 0; let sumaNotas = 0;
            asig.notas.forEach(n => { sumaPesos += n.peso; sumaNotas += n.valor * n.peso; });
            if (sumaPesos > 0) { sumaMedias += (sumaNotas / sumaPesos); asignaturasConNota++; }
        });
        if (asignaturasConNota === 0) {
            widgetMedia.textContent = "-"; widgetMedia.className = "text-3xl font-bold text-slate-300";
        } else {
            const mediaGlobal = (sumaMedias / asignaturasConNota).toFixed(2);
            widgetMedia.textContent = mediaGlobal;
            widgetMedia.className = `text-3xl font-bold ${mediaGlobal >= 5 ? 'text-green-600' : 'text-red-500'}`;
        }
    }
}

// ==========================================
// 7. MOTOR DE EXÁMENES Y TESTS
// ==========================================
let testEnEdicion = null;

function renderizarTestsDashboard() {
    const contenedor = document.getElementById('contenedor-lista-tests');
    const selectAsig = document.getElementById('edit-test-asig');
    if (!contenedor || !selectAsig) return;

    selectAsig.innerHTML = '';
    appData.asignaturas.forEach(a => selectAsig.innerHTML += `<option value="${a.nombre}">${a.nombre}</option>`);
    contenedor.innerHTML = '';

    if (appData.tests.length === 0) {
        contenedor.innerHTML = '<div class="col-span-full text-center p-8 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">No hay tests creados. ¡Crea el primero!</div>';
        return;
    }

    appData.tests.forEach(test => {
        const asig = appData.asignaturas.find(a => a.nombre === test.asignatura);
        const color = asig ? asig.color : '#ec4899';
        contenedor.innerHTML += `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition group">
                <div class="h-2 w-full" style="background-color: ${color}"></div>
                <div class="p-6 flex-1">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">${test.asignatura} • ${test.tema}</span>
                    <h3 class="text-xl font-bold text-slate-800 mb-2 leading-tight">${test.titulo}</h3>
                    <p class="text-xs text-slate-500 font-medium"><i class="fa-solid fa-list-ol mr-1"></i> ${test.preguntas.length} preguntas</p>
                </div>
                <div class="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                    <button onclick="iniciarTest(${test.id})" class="flex-1 bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition shadow-sm transform active:scale-95 text-sm"><i class="fa-solid fa-play mr-1"></i> Iniciar</button>
                    <button onclick="abrirEditorTest(${test.id})" class="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-300 transition text-sm" title="Editar Test"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="borrarTest(${test.id})" class="bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm" title="Borrar Test"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

window.abrirEditorTest = function(id = null) {
    document.getElementById('form-pregunta-box').classList.add('hidden');
    if (id) {
        testEnEdicion = JSON.parse(JSON.stringify(appData.tests.find(t => t.id === id)));
    } else {
        testEnEdicion = { id: Date.now(), asignatura: appData.asignaturas[0]?.nombre || '', tema: '', titulo: '', preguntas: [] };
    }
    document.getElementById('edit-test-asig').value = testEnEdicion.asignatura;
    document.getElementById('edit-test-tema').value = testEnEdicion.tema;
    document.getElementById('edit-test-titulo').value = testEnEdicion.titulo;
    renderizarPreguntasEditor();
    document.getElementById('modal-editor-test').classList.remove('hidden');
    
    // Mostarmos el modal
    const MODAL = document.getElementById('modal-editor-test');
    MODAL.classList.remove('hidden');
    
    // LLevmos el foco
    setTimeout(() => {
       const PRIMERCAMPO = document.getElementById('edit-test-asig');
       if (PRIMERCAMPO) PRIMERCAMPO.focus(); 
    }, 50);
}

window.cerrarEditorTest = function() {
    document.getElementById('modal-editor-test').classList.add('hidden');
    testEnEdicion = null;
}

window.borrarTest = function(id) {
    if(confirm("⚠️ ¿Seguro que quieres borrar este test por completo?")) {
        appData.tests = appData.tests.filter(t => t.id !== id); guardarDatos();
    }
}

function renderizarPreguntasEditor() {
    const lista = document.getElementById('lista-preguntas-editor');
    lista.innerHTML = '';
    if(testEnEdicion.preguntas.length === 0) {
        lista.innerHTML = '<p class="text-sm text-slate-400 italic text-center py-4">Aún no hay preguntas. Pulsa Añadir Pregunta.</p>'; return;
    }

    testEnEdicion.preguntas.forEach((p, idx) => {
        let tipoIcon = p.tipo === 'vf' ? 'fa-scale-balanced' : p.tipo === 'fill' ? 'fa-keyboard' : 'fa-list-check';
        lista.innerHTML += `
            <div class="bg-white p-3 border border-slate-200 rounded-lg flex justify-between items-center gap-4 hover:border-pink-300 transition cursor-pointer" onclick="abrirFormularioPregunta(${idx})">
                <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-400"><i class="fa-solid ${tipoIcon} text-xs"></i></div>
                <div class="flex-1 truncate"><p class="text-sm font-bold text-slate-700 truncate">${p.enunciado}</p><p class="text-[10px] text-slate-400 uppercase tracking-wide">Pregunta ${idx + 1}</p></div>
                <button onclick="event.stopPropagation(); borrarPreguntaDeTest(${idx})" class="text-red-400 hover:text-red-600 p-2"><i class="fa-solid fa-trash-can"></i></button>
            </div>`;
    });
}

window.abrirFormularioPregunta = function(idx = -1) {
    document.getElementById('form-pregunta-box').classList.remove('hidden');
    document.getElementById('edit-preg-index').value = idx;
    if (idx >= 0) {
        const p = testEnEdicion.preguntas[idx];
        document.getElementById('edit-preg-tipo').value = p.tipo;
        document.getElementById('edit-preg-enunciado').value = p.enunciado;
        document.getElementById('edit-preg-imagen').value = p.imagen || '';
        document.getElementById('edit-preg-codigo').value = p.codigo || '';
        document.getElementById('edit-preg-explicacion').value = p.explicacion;
        cambiarTipoPreguntaEditor(p);
    } else {
        document.getElementById('edit-preg-tipo').value = 'single';
        document.getElementById('edit-preg-enunciado').value = '';
        document.getElementById('edit-preg-imagen').value = '';
        document.getElementById('edit-preg-codigo').value = '';
        document.getElementById('edit-preg-explicacion').value = '';
        cambiarTipoPreguntaEditor();
    }
}

window.borrarPreguntaDeTest = function(idx) {
    testEnEdicion.preguntas.splice(idx, 1);
    document.getElementById('form-pregunta-box').classList.add('hidden');
    renderizarPreguntasEditor();
}

window.cambiarTipoPreguntaEditor = function(pregGuardada = null) {
    const tipo = document.getElementById('edit-preg-tipo').value;
    const box = document.getElementById('edit-preg-opciones-box');
    box.innerHTML = '';

    if (tipo === 'vf') {
        let esCorrectaVerdadero = pregGuardada ? pregGuardada.respuestas[0] === 0 : true;
        box.innerHTML = `
            <p class="text-xs font-bold text-slate-500 mb-2">Marca la opción correcta:</p>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200 w-1/2"><input type="radio" name="vf-opt" value="0" ${esCorrectaVerdadero ? 'checked' : ''} class="w-4 h-4 text-pink-500 focus:ring-pink-500"> <span class="font-bold text-slate-700">Verdadero</span></label>
                <label class="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200 w-1/2"><input type="radio" name="vf-opt" value="1" ${!esCorrectaVerdadero ? 'checked' : ''} class="w-4 h-4 text-pink-500 focus:ring-pink-500"> <span class="font-bold text-slate-700">Falso</span></label>
            </div>`;
    } else if (tipo === 'fill') {
        let val = pregGuardada ? pregGuardada.respuestas[0] : '';
        box.innerHTML = `
            <p class="text-xs font-bold text-slate-500 mb-2">Escribe la palabra o código correcto:</p>
            <input type="text" id="fill-correcta" value="${val}" placeholder="Ej. out" class="w-full p-2 border border-slate-300 rounded font-mono text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
            <p class="text-[10px] text-slate-400 mt-1 italic">* En el enunciado pon "___" donde quieres que el alumno escriba.</p>`;
    } else if (tipo === 'select' || tipo === 'drag') {
        box.innerHTML = document.getElementById('pares-container');
        const container = document.getElementById('pares-container');
        pares.forEach((par, i) => {
           container.innerHTML += '<div class="flex gap-2 items-center"><input type="text" placeholder="Concepto/Texto" value="${par. || '`}" class="p-1.5 border rounded text-xs flex-1 par-a"><input type="text" placeholder="Respuesta/Hueco" value="${par.b || ''}" class="p-1.5 border rounded text-xs flex-1 par-b"></div>`; 
        });
    } else {
        box.innerHTML = `<p class="text-xs font-bold mb-2">Opciones (hasta 8):</p><div id="opciones-dinamicas" class="space-y-2"></div><button type="button" onclick="agregarOpcionEditor()" class="mt-2 text-xs bg-pink-100 text-pink-700 font-bold px-3 py-1.5 rounded">+ Añadir Opción</button>`;
        const container = document.getElementById('opciones-dinamicas');
        const opts = p.opciones.length ? p.opciones : ['', '', '', ''];
        opts.forEach((optText, i) => {
            const checked = p.respuestas.includes(i) ? 'checked' : '';
            container.innerHTML += `<div class="flex items-center gap-2 opt-row"><input type="${tipo === 'multi' ? 'checkbox' : 'radio'}" name="opt-correcta" value="${i}" ${checked} class="w-4 h-4"><input type="text" value="${optText}" placeholder="Opción ${i+1}" class="flex-1 p-1.5 border rounded text-xs opt-text"></div>`;
        });
    }
}

window.agregarOpcionEditor = function() {
    const container = document.getElementById('opciones-dinamicas');
    if(container.children.length >= 8) return alert("Máximo 8 opciones permitidas.");
    const i = container.children.length;
    const tipo = document.getElementById('edit-preg-tipo').value;
    container.innerHTML += `<div class="flex items-center gap-2 opt-row"><input type="${tipo === 'multi' ? 'checkbox' : 'radio'}" name="opt-correcta" value="${i}" class="w-4 h-4"><input type="text" placeholder="Opción ${i+1}" class="flex-1 p-1.5 border rounded text-xs opt-text"></div>`;
}

window.agregarParEditor = function() {
    const container = document.getElementById('pares-container');
    container.innerHTML += `<div class="flex gap-2 items-center"><input type="text" placeholder="Concepto/Texto" class="p-1.5 border rounded text-xs flex-1 par-a"><input type="text" placeholder="Respuesta / Hueco" class="p-1.5 border rounded text-xs flex-1 par-b"></div>`;
}

window.guardarPreguntaEnTest = function() {
    const idx = parseInt(document.getElementById('edit-preg-index').value);
    const tipo = document.getElementById('edit-preg-tipo').value;
    const enunciado = document.getElementById('edit-preg-enunciado').value.trim();
    const imagen = document.getElementById('edit-preg-imagen').value.trim();
    const codigo = document.getElementById('edit-preg-codigo').value.trim();
    const explicacion = document.getElementById('edit-preg-explicacion').value.trim();

    if(!enunciado) return alert("Falta el enunciado");
    if(!explicacion) return alert("Falta la explicación para el feedback");

    let opciones = []; let respuestas = [];

    if (tipo === 'vf') {
        opciones = ["Verdadero", "Falso"]; respuestas = [parseInt(document.querySelector('input[name="vf-opt"]:checked').value)];
    } else if (tipo === 'fill') {
        let val = document.getElementById('fill-correcta').value.trim();
        if(!val) return alert("Falta la respuesta correcta"); respuestas = [val];
    } else if (tipo === 'select' || tipo === 'drag') {
        document.querySelectorAll('#pares-container > div').forEach(row => {
            const a = row.querySelector('.par-a').value.trim();
            const b = row.querySelector('.par-b').value.trim();
            if (a && b) opciones.push({a, b});
        });
        if (opciones.length === 0) return alert("Añade al menos una pareja válida.");
    } else {
        document.querySelectorAll('.opt-row').forEach((row, i) => {
            const txt = row.querySelector('.opt-text').value.trim();
            if(txt) opciones.push(txt);
            if(row.querySelector('input').checked) respuestas.push(i);
        });
        if(opciones.length < 2) return alert("Mínimo 2 opciones.");
        if(respuestas.length === 0) return alert("Marca al menos una respuesta correcta.");
    }

    const nuevaPregunta = { tipo, enunciado, imagen, codigo, opciones, respuestas, explicacion };
    if (idx === -1) testEnEdicion.preguntas.push(nuevaPregunta); else testEnEdicion.preguntas[idx] = nuevaPregunta;
    document.getElementById('form-pregunta-box').classList.add('hidden');
    renderizarPreguntasEditor();
}

window.guardarTestCompleto = function() {
    testEnEdicion.asignatura = document.getElementById('edit-test-asig').value;
    testEnEdicion.tema = document.getElementById('edit-test-tema').value.trim() || 'General';
    testEnEdicion.titulo = document.getElementById('edit-test-titulo').value.trim() || 'Test sin título';

    if(testEnEdicion.preguntas.length === 0) return alert("El test debe tener al menos una pregunta.");
    const index = appData.tests.findIndex(t => t.id === testEnEdicion.id);
    if (index >= 0) appData.tests[index] = testEnEdicion; else appData.tests.push(testEnEdicion);

    guardarDatos(); cerrarEditorTest();
}

// --- EJECUCIÓN DEL TEST (RUNNER) ---
let runnerEstado = null;

function mezclarArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
}

window.iniciarTest = function(idTest) {
    const testInfo = appData.tests.find(t => t.id === idTest);
    if(!testInfo || testInfo.preguntas.length === 0) return;

    runnerEstado = { test: testInfo, preguntas: mezclarArray(testInfo.preguntas), actual: 0, aciertos: 0, fallos: 0, blancos: 0 };
    document.getElementById('runner-titulo').textContent = testInfo.titulo;
    document.getElementById('runner-tema').textContent = `${testInfo.asignatura} • ${testInfo.tema}`;

    cambiarSeccion('test-runner'); pintarPreguntaActual();
}

window.cerrarTestEnEjecucion = function() {
    if(confirm("¿Seguro que quieres salir? Se perderá el progreso.")) { cambiarSeccion('tests-manager'); runnerEstado = null; }
}

function pintarPreguntaActual() {
    const p = runnerEstado.preguntas[runnerEstado.actual]; const total = runnerEstado.preguntas.length;

    document.getElementById('runner-progreso-texto').textContent = `${runnerEstado.actual + 1}/${total}`;
    document.getElementById('runner-progreso-barra').style.width = `${((runnerEstado.actual) / total) * 100}%`;

    document.getElementById('runner-feedback').classList.add('hidden'); document.getElementById('btn-comprobar').classList.remove('hidden'); document.getElementById('btn-saltar').classList.remove('hidden'); document.getElementById('btn-siguiente').classList.add('hidden');

    const uiOpciones = document.getElementById('runner-opciones'); uiOpciones.innerHTML = '';
    let enunHtml = p.enunciado;
    if (p.tipo === 'fill') {
        enunHtml = enunHtml.replace(/___/g, `<input type="text" id="resp-fill" class="border-b-2 border-pink-500 bg-pink-50 focus:bg-white text-center font-mono outline-none px-2 mx-1 w-32" autocomplete="off" autofocus>`);
        document.getElementById('runner-enunciado').innerHTML = enunHtml;
        setTimeout(()=> { const i = document.getElementById('resp-fill'); if(i) i.focus(); }, 100);
    } else { document.getElementById('runner-enunciado').textContent = enunHtml; }

    if (p.tipo === 'vf' || p.tipo === 'single' || p.tipo === 'multi') {
        let inputType = p.tipo === 'multi' ? 'checkbox' : 'radio';
        p.opciones.forEach((optTexto, idx) => {
            uiOpciones.innerHTML += `
                <label class="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-pink-300 transition group">
                    <input type="${inputType}" name="runner-opt" value="${idx}" class="w-5 h-5 text-pink-500 focus:ring-pink-500 border-slate-300">
                    <span class="text-slate-700 font-medium text-lg group-hover:text-pink-700 transition">${optTexto}</span>
                </label>
            `;
        });
    }
}

// Renderizar multimedia (Imagen y Código)
const multimediaBox = document.getElementById('runner-multimedia');
multimediaBox.innerHTML = '';
if(p.imagen) {
    multimediaBox.innerHTML += `<img src="${p.imagen}" class="max-h-48 rounded-lg mx-auto shadow border object-contain">`;
}
if(p.codigo) {
    multimediaBox.innerHTML += `<pre class="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner"><code>${p.codigo}</code></pre>`;
}

const uiOpciones = document.getElementById('runner-opciones');
uiOpciones.innerHTML = '';

if (p.tipo === 'vf' || p.tipo === 'single' || p.tipo === 'multi') {
    const inputType = p.tipo === 'multi' ? 'checkbox' : 'radio';
    p.opciones.forEach((opt, idx) => {
        uiOpciones.innerHTML += `<label class="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition"><input type="${inputType}" name="runner-opt" value="${idx}" class="w-4 h-4 text-pink-500"><span class="text-sm font-medium">${opt}</span></label>`;
    });
} else if (p.tipo === 'fill') {
    uiOpciones.innerHTML = `<input type="text" id="resp-fill" placeholder="Escribe tu respuesta..." class="w-full p-3 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-pink-500 outline-none">`;
} else if (p.tipo === 'select') {
    p.opciones.forEach((par, idx) => {
        const opcionesAleatorias = [...p.opciones.map(o => o.b)].sort(()=>Math.random()-0.5);
        uiOpciones.innerHTML += `<div class="flex items-center justify-between p-3 bg-slate-50 border rounded-xl gap-4"><span class="text-sm font-medium">${par.a}</span><select class="p-2 border rounded text-xs select-resp" data-correct="${par.b}"><option value="">-- Elige opción --</option>${opcionesAleatorias.map(op => `<option value="${op}">${op}</option>`).join('')}</select></div>`;
    });
} else if (p.tipo === 'drag') {
    uiOpciones.innerHTML = `<p class="text-xs font-bold text-slate-500">Arrastra las etiquetas a sus huecos:</p><div class="flex flex-wrap gap-2 mb-4" id="drag-chips">${p.opciones.map(o => `<div draggable="true" ondragstart="event.dataTransfer.setData('text', '${o.b}')" class="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg font-bold text-xs drag-chip shadow-sm">${o.b}</div>`).join('')}</div><div class="space-y-2" id="drop-zones">${p.opciones.map((par, i) => `<div class="flex justify-between items-center p-3 bg-slate-50 border rounded-xl"><span class="text-sm">${par.a}</span><div class="drop-zone w-48 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 bg-white" ondragover="event.preventDefault(); this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault(); this.classList.remove('drag-over'); this.textContent = event.dataTransfer.getData('text'); this.dataset.val = event.dataTransfer.getData('text');" data-correct="${par.b}">Arrastra aquí</div></div>`).join('')}</div>`;
}

window.comprobarRespuestaTest = function(saltada = false) {
    const p = runnerEstado.preguntas[runnerEstado.actual];
    let esCorrecta = false; let haRespondido = true;

    if (!saltada) {
        if (p.tipo === 'fill') {
            const userText = document.getElementById('resp-fill').value.trim().toLowerCase();
            const correctText = p.respuestas[0].trim().toLowerCase();
            if (userText === '') haRespondido = false; else esCorrecta = (userText === correctText);
            document.getElementById('resp-fill').disabled = true;
        } else if (p.tipo === 'multi') {
            const checks = Array.from(document.querySelectorAll('input[name="runner-opt"]:checked')).map(c => parseInt(c.value));
            if(checks.length === 0) respondido = false;
            else {
                const cor = [...p.respuestas].sort(), chk = checks.sort();
                esCorrecta = (cor.length === chk.length && cor.every((v, i) => v === chk[i]));
            }
        } else if (p.tipo === 'single' || p.tipo === 'vf') {
            const chk = document.querySelector('input[name="runner-opt"]:checked');
            if(!chk) respondido = false; else esCorrecta = (parseInt(chk.value) === p.respuestas[0]);
        } else if (p.tipo === 'select') {
            const selects = document.querySelectorAll('.select-resp');
            let aciertosPar = 0;
            selects.forEach(s => { if(s.value === s.dataset.correct) aciertosPar++; });
            esCorrecta = (aciertosPar === selects.length);
        } else if (p.tipo === 'drag') {
            const zones = document.querySelectorAll('.drop-zone');
            let aciertosDrag = 0;
            zones.forEach(z => { if(z.dataset.val === z.dataset.correct) aciertosDrag++; });
            esCorrecta = (aciertosDrag === zones.length);
        }
    }

    if (!saltada && !haRespondido) { return alert("Selecciona o escribe una respuesta, o pulsa Saltar."); }

    document.querySelectorAll('input[name="runner-opt"]').forEach(i => i.disabled = true);

    const divFeed = document.getElementById('runner-feedback'); const iconFeed = document.getElementById('runner-feedback-icon'); const titFeed = document.getElementById('runner-feedback-title');
    divFeed.classList.remove('hidden'); document.getElementById('runner-feedback-exp').innerHTML = `<i class="fa-solid fa-graduation-cap text-slate-400 mr-2"></i><b>Explicación:</b> ${p.explicacion}`;

    if (saltada) {
        runnerEstado.blancos++; iconFeed.innerHTML = '<i class="fa-solid fa-forward text-slate-400"></i>'; titFeed.textContent = "Saltada (+0)"; titFeed.className = "font-black text-xl mb-1 text-slate-500";
    } else if (esCorrecta) {
        runnerEstado.aciertos++; iconFeed.innerHTML = '<i class="fa-solid fa-circle-check text-green-500 animate-bounce"></i>'; titFeed.textContent = "¡Correcto! (+1)"; titFeed.className = "font-black text-xl mb-1 text-green-600 animate-pop"; lanzarConfeti();
    } else {
        runnerEstado.fallos++; iconFeed.innerHTML = '<i class="fa-solid fa-circle-xmark text-red-500"></i>'; titFeed.textContent = "Incorrecto (-0.5)"; titFeed.className = "font-black text-xl mb-1 text-red-600 animate-pop";
        const tarjeta = document.getElementById('runner-tarjeta'); tarjeta.classList.add('translate-x-2', 'border-red-500', 'border-2'); setTimeout(() => tarjeta.classList.remove('translate-x-2', 'border-red-500', 'border-2'), 300);
    }

    document.getElementById('btn-comprobar').classList.add('hidden'); document.getElementById('btn-saltar').classList.add('hidden');
    const btnSiguiente = document.getElementById('btn-siguiente'); btnSiguiente.classList.remove('hidden');

    if (runnerEstado.actual === runnerEstado.preguntas.length - 1) {
        btnSiguiente.innerHTML = 'Ver Resultados <i class="fa-solid fa-flag-checkered ml-1"></i>';
        btnSiguiente.className = "bg-blue-600 text-white font-black px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md transition transform active:scale-95 animate-pulse";
    }
}

window.siguientePreguntaTest = function() {
    runnerEstado.actual++;
    if (runnerEstado.actual < runnerEstado.preguntas.length) { pintarPreguntaActual(); } else { finalizarTest(); }
}

function finalizarTest() {
    const total = runnerEstado.preguntas.length;
    let puntuacionCruda = runnerEstado.aciertos - (runnerEstado.fallos * 0.5);
    let nota10 = (puntuacionCruda / total) * 10;
    if (nota10 < 0) nota10 = 0;

    let nivelText = ""; let esAprobado = nota10 >= 5.0;
    if (nota10 < 5) nivelText = "Insuficiente"; else if (nota10 < 7) nivelText = "Suficiente"; else if (nota10 < 9) nivelText = "Notable"; else nivelText = "Sobresaliente";

    document.getElementById('res-aciertos').textContent = runnerEstado.aciertos; 
    document.getElementById('res-fallos').textContent = runnerEstado.fallos; 
    document.getElementById('res-blancos').textContent = runnerEstado.blancos;
    document.getElementById('resultados-titulo').textContent = nota10.toFixed(2); 
    document.getElementById('resultados-subtitulo').textContent = nivelText;

    const header = document.getElementById('resultados-header'); const icon = document.getElementById('resultados-icon');
    if (esAprobado) {
        header.className = "p-10 text-white bg-gradient-to-br from-green-400 to-emerald-600"; icon.innerHTML = '<i class="fa-solid fa-trophy animate-bounce"></i>'; lanzarConfeti(100);
    } else {
        header.className = "p-10 text-white bg-gradient-to-br from-red-500 to-rose-700"; icon.innerHTML = '<i class="fa-solid fa-skull-crossbones"></i>';
    }

    const modal = document.getElementById('modal-resultados'); modal.classList.remove('hidden');
    setTimeout(() => { document.getElementById('resultados-card').classList.remove('scale-90'); document.getElementById('resultados-card').classList.add('scale-100'); }, 50);
}

window.cerrarResultados = function() {
    document.getElementById('modal-resultados').classList.add('hidden'); document.getElementById('resultados-card').classList.remove('scale-100'); document.getElementById('resultados-card').classList.add('scale-90');
    cambiarSeccion('tests-manager'); runnerEstado = null;
}

function lanzarConfeti(cantidad = 30) {
    const container = document.getElementById('runner-fx'); if(!container) return;
    container.innerHTML = ''; container.style.opacity = '1';
    const colors = ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777'];
    for (let i = 0; i < cantidad; i++) {
        const conf = document.createElement('div'); conf.className = 'absolute w-3 h-3 rounded-sm opacity-80'; conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + '%'; conf.style.top = '-10%';
        const dur = Math.random() * 2 + 1; const delay = Math.random() * 0.5;
        conf.style.transition = `all ${dur}s cubic-bezier(.37,0,.63,1) ${delay}s`;
        container.appendChild(conf); conf.getBoundingClientRect(); // Trigger reflow
        conf.style.top = '110%'; conf.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
    }
    setTimeout(() => { container.style.opacity = '0'; }, 2000);
}

// ==========================================
// ARRANQUE DE LA APP
// ==========================================
function actualizarUI() {
    comprobarPerfil();
    renderizarConfigAsignaturas();
    renderizarHorarioAuto();
    renderizarTareas();
    renderizarCalificaciones();
    renderizarDashboard();
    renderizarTestsDashboard();
}

actualizarUI();
cambiarSeccion('dashboard');