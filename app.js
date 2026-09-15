// ==========================================
// CONFIGURACIÓN Y PERSISTENCIA (Local Storage)
// ==========================================
const STORAGE_KEY = 'control_instituto_db';

// Intentamos cargar datos previos. Si es la primera vez, creamos una estructura vacía.
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tareas: []
};

// Función maestra para guardar cualquier cambio
function guardarDatos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    actualizarUI(); // Refresca la pantalla automáticamente al guardar
}


// ==========================================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================================
function cambiarSeccion(idSeccion) {
    // 1. Ocultar todas
    document.querySelectorAll('.seccion-app').forEach(sec => {
        sec.classList.add('hidden');
    });
    // 2. Mostrar la solicitada
    document.getElementById(idSeccion).classList.remove('hidden');
}


// ==========================================
// LÓGICA DEL MÓDULO DE TAREAS
// ==========================================
const formTarea = document.getElementById('form-tarea');
const listaTareas = document.getElementById('lista-tareas');
const dashPendientes = document.getElementById('dash-pendientes');

// Capturar el envío del formulario
formTarea.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const titulo = document.getElementById('input-tarea').value;
    const asignatura = document.getElementById('input-asignatura').value;

    // Crear objeto tarea
    const nuevaTarea = {
        id: Date.now(), // ID único basado en la hora actual
        titulo: titulo,
        asignatura: asignatura,
        completada: false
    };

    // Añadir al array de datos y guardar
    appData.tareas.push(nuevaTarea);
    formTarea.reset(); // Limpiar inputs
    guardarDatos();
});

// Marcar/Desmarcar tarea como completada
window.toggleTarea = function(id) {
    const tarea = appData.tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        guardarDatos();
    }
}

// Eliminar tarea permanentemente
window.eliminarTarea = function(id) {
    // Filtramos para quedarnos con todas menos la que coincide con el ID
    appData.tareas = appData.tareas.filter(t => t.id !== id);
    guardarDatos();
}


// ==========================================
// RENDERIZADO VISUAL (Actualizar la pantalla)
// ==========================================
function actualizarUI() {
    listaTareas.innerHTML = '';
    let pendientes = 0;

    // Si no hay tareas, mostrar mensaje amigable
    if (appData.tareas.length === 0) {
        listaTareas.innerHTML = '<li class="p-8 text-center text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</li>';
    }

    // Recorrer las tareas guardadas y generar el HTML
    appData.tareas.forEach(tarea => {
        if (!tarea.completada) pendientes++;

        const li = document.createElement('li');
        li.className = `p-4 flex items-center justify-between transition-all ${tarea.completada ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`;

        li.innerHTML = `
            <div class="flex items-center gap-4">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''} 
                       onchange="toggleTarea(${tarea.id})" 
                       class="h-6 w-6 text-blue-600 rounded border-slate-300 cursor-pointer">
                <div>
                    <p class="font-medium ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'} text-lg">
                        ${tarea.titulo}
                    </p>
                    <p class="text-sm text-slate-500 mt-1">
                        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                            ${tarea.asignatura}
                        </span>
                    </p>
                </div>
            </div>
            <button onclick="eliminarTarea(${tarea.id})" class="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar tarea">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        listaTareas.appendChild(li);
    });

    // Actualizar el número del dashboard principal
    dashPendientes.textContent = pendientes;
}

// Arrancar la aplicación la primera vez que carga
actualizarUI();
cambiarSeccion('dashboard');

// ==========================================
// LÓGICA DEL MÓDULO DE HORARIO
// ==========================================

// Asegurarnos de que el objeto horario existe en la base de datos local
if (!appData.horario) {
    appData.horario = {};
    guardarDatos();
}

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const periodosClase = 6; // Configurado para 6 horas al día
const tablaHorario = document.getElementById('tabla-horario');

// Referencias a los elementos del Modal
const modalHorario = document.getElementById('modal-horario');
const inputModalDia = document.getElementById('modal-dia');
const inputModalHora = document.getElementById('modal-hora');
const inputModalAsignatura = document.getElementById('modal-input-asignatura');
const inputModalColor = document.getElementById('modal-input-color');
const modalTitulo = document.getElementById('modal-titulo');
const btnEliminarHorario = document.getElementById('btn-eliminar-horario');

// Construir la tabla del horario en pantalla
function renderizarHorario() {
    if (!tablaHorario) return;
    tablaHorario.innerHTML = '';

    for (let hora = 1; hora <= periodosClase; hora++) {
        const fila = document.createElement('tr');

        // Primera columna: Número de hora
        let htmlFila = `<td class="border border-slate-200 bg-slate-50 font-bold text-slate-400 text-center">${hora}ª</td>`;

        // Columnas de los días
        diasSemana.forEach(dia => {
            const idCelda = `${dia}-${hora}`;
            const datosAsignatura = appData.horario[idCelda];

            if (datosAsignatura) {
                // Celda con datos guardados
                htmlFila += `
                    <td onclick="abrirModalHorario('${dia}', ${hora})" 
                        class="border border-slate-200 p-2 h-20 cursor-pointer hover:opacity-80 transition-opacity text-center relative overflow-hidden"
                        style="background-color: ${datosAsignatura.color}15;">
                        <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: ${datosAsignatura.color}"></div>
                        <span class="font-semibold text-sm" style="color: ${datosAsignatura.color}">
                            ${datosAsignatura.asignatura}
                        </span>
                    </td>`;
            } else {
                // Celda vacía
                htmlFila += `
                    <td onclick="abrirModalHorario('${dia}', ${hora})" 
                        class="border border-slate-200 border-dashed p-2 h-20 cursor-pointer hover:bg-slate-50 transition-colors">
                    </td>`;
            }
        });

        fila.innerHTML = htmlFila;
        tablaHorario.appendChild(fila);
    }
}

// Interacción con el Modal
window.abrirModalHorario = function(dia, hora) {
    const idCelda = `${dia}-${hora}`;
    const datosAsignatura = appData.horario[idCelda];

    inputModalDia.value = dia;
    inputModalHora.value = hora;

    if (datosAsignatura) {
        modalTitulo.textContent = 'Editar Asignatura';
        inputModalAsignatura.value = datosAsignatura.asignatura;
        inputModalColor.value = datosAsignatura.color;
        btnEliminarHorario.classList.remove('hidden');
    } else {
        modalTitulo.textContent = 'Añadir a 1ª Hora' .replace('1', hora);
        inputModalAsignatura.value = '';
        inputModalColor.value = '#a855f7'; // Color predeterminado (Morado Tailwind)
        btnEliminarHorario.classList.add('hidden');
    }

    modalHorario.classList.remove('hidden');
    setTimeout(() => inputModalAsignatura.focus(), 100);
}

window.cerrarModalHorario = function() {
    modalHorario.classList.add('hidden');
}

window.guardarCeldaHorario = function() {
    const dia = inputModalDia.value;
    const hora = inputModalHora.value;
    const asignatura = inputModalAsignatura.value.trim();
    const color = inputModalColor.value;

    if (asignatura === '') return; // No guardar si está vacío

    const idCelda = `${dia}-${hora}`;
    appData.horario[idCelda] = { asignatura, color };

    guardarDatos();
    renderizarHorario();
    cerrarModalHorario();
}

window.eliminarCeldaHorario = function() {
    const dia = inputModalDia.value;
    const hora = inputModalHora.value;
    const idCelda = `${dia}-${hora}`;

    delete appData.horario[idCelda];

    guardarDatos();
    renderizarHorario();
    cerrarModalHorario();
}

// Conectar con el sistema de guardado original sin modificar su código base
const uiOriginal = window.actualizarUI;
window.actualizarUI = function() {
    if (typeof uiOriginal === 'function') uiOriginal();
    renderizarHorario();
}

// Dibujar horario inicial
renderizarHorario();

// ==========================================
// LÓGICA DEL MÓDULO DE CALIFICACIONES
// ==========================================

// Asegurar que el array de asignaturas existe
if (!appData.asignaturas) {
    appData.asignaturas = [];
    guardarDatos();
}

const formAsignaturaNotas = document.getElementById('form-asignatura-notas');
const inputNombreAsignatura = document.getElementById('input-nombre-asignatura');
const contenedorAsignaturas = document.getElementById('contenedor-asignaturas');

// Crear una nueva asignatura para registrar notas
if (formAsignaturaNotas) {
    formAsignaturaNotas.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = inputNombreAsignatura.value.trim();
        if (!nombre) return;

        appData.asignaturas.push({
            id: Date.now(),
            nombre: nombre,
            notas: [] // Array para guardar los exámenes/trabajos
        });

        inputNombreAsignatura.value = '';
        guardarDatos();
    });
}

// Dibujar las tarjetas de calificaciones
function renderizarCalificaciones() {
    if (!contenedorAsignaturas) return;
    contenedorAsignaturas.innerHTML = '';

    if (appData.asignaturas.length === 0) {
        contenedorAsignaturas.innerHTML = '<div class="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No hay asignaturas. Añade una arriba para empezar a registrar tus notas.</div>';
        return;
    }

    appData.asignaturas.forEach(asig => {
        // Calcular la media ponderada actual
        let sumaPesos = 0;
        let sumaNotas = 0;

        asig.notas.forEach(n => {
            const peso = parseFloat(n.peso);
            const valor = parseFloat(n.valor);
            sumaPesos += peso;
            sumaNotas += valor * peso;
        });

        // Media sobre lo evaluado hasta ahora
        let media = sumaPesos > 0 ? (sumaNotas / sumaPesos).toFixed(2) : '0.00';

        // Color de la media según la nota (>= 5 verde, < 5 rojo)
        let colorMedia = media >= 5 ? 'text-green-600' : (media > 0 ? 'text-red-500' : 'text-slate-400');

        // Generar lista HTML de notas
        let htmlNotas = '';
        asig.notas.forEach(n => {
            let colorNota = n.valor >= 5 ? 'text-green-600' : 'text-red-500';
            htmlNotas += `
                <div class="flex justify-between items-center py-2 px-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 rounded transition">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-700">${n.nombre}</p>
                        <p class="text-xs text-slate-400">Peso: ${n.peso}%</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-bold ${colorNota}">${n.valor}</span>
                        <button onclick="eliminarNota(${asig.id}, ${n.id})" class="text-slate-300 hover:text-red-500 transition" title="Borrar nota">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        // Generar tarjeta HTML
        const div = document.createElement('div');
        div.className = 'bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <h3 class="text-xl font-bold text-slate-800">${asig.nombre}</h3>
                <div class="text-right ml-4">
                    <span class="block text-3xl font-black ${colorMedia} leading-none">${media}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nota Media</span>
                </div>
            </div>
            
            <div class="flex-1 mb-6">
                ${htmlNotas || '<p class="text-sm text-slate-400 italic text-center py-4">No hay notas registradas aún.</p>'}
            </div>

            <div class="mt-auto pt-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-slate-100">
                <form onsubmit="agregarNota(event, ${asig.id})" class="flex gap-2">
                    <input type="text" id="nota-nombre-${asig.id}" placeholder="Ej. Examen T1" required class="w-1/2 p-2 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400">
                    <input type="number" step="0.01" min="0" max="10" id="nota-valor-${asig.id}" placeholder="Nota" required class="w-1/4 p-2 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400">
                    <input type="number" step="0.1" min="0.1" max="100" id="nota-peso-${asig.id}" placeholder="Peso %" required class="w-1/4 p-2 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400">
                    <button type="submit" class="bg-yellow-500 text-white px-3 rounded hover:bg-yellow-600 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </form>
                <div class="mt-4 text-right">
                    <button onclick="eliminarAsignatura(${asig.id})" class="text-xs text-red-400 hover:text-red-600 font-medium transition">
                        <i class="fa-solid fa-trash-can mr-1"></i> Borrar asignatura entera
                    </button>
                </div>
            </div>
        `;
        contenedorAsignaturas.appendChild(div);
    });
}

// Funciones globales para manejar los clicks
window.agregarNota = function(e, idAsig) {
    e.preventDefault();
    const inputNombre = document.getElementById(`nota-nombre-${idAsig}`);
    const inputValor = document.getElementById(`nota-valor-${idAsig}`);
    const inputPeso = document.getElementById(`nota-peso-${idAsig}`);

    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig) {
        asig.notas.push({
            id: Date.now(),
            nombre: inputNombre.value,
            valor: parseFloat(inputValor.value),
            peso: parseFloat(inputPeso.value)
        });
        guardarDatos(); // Esto autoguarda y recarga la UI
    }
}

window.eliminarNota = function(idAsig, idNota) {
    const asig = appData.asignaturas.find(a => a.id === idAsig);
    if(asig) {
        asig.notas = asig.notas.filter(n => n.id !== idNota);
        guardarDatos();
    }
}

window.eliminarAsignatura = function(idAsig) {
    if(confirm("¿Seguro que quieres borrar esta asignatura y TODAS sus notas?")) {
        appData.asignaturas = appData.asignaturas.filter(a => a.id !== idAsig);
        guardarDatos();
    }
}

// Conectar con el renderizador maestro (actualizarUI)
const uiConHorario = window.actualizarUI;
window.actualizarUI = function() {
    if (typeof uiConHorario === 'function') uiConHorario();
    renderizarCalificaciones();
}

// Ejecutar el renderizado inicial de calificaciones
renderizarCalificaciones();

// ==========================================
// MÓDULO DE EXPORTACIÓN / IMPORTACIÓN
// ==========================================

// EXPORTAR: Convierte los datos a un archivo y fuerza la descarga
window.exportarDatos = function() {
    // 1. Convertir nuestro objeto appData a texto JSON con un formato legible (2 espacios)
    const datosJSON = JSON.stringify(appData, null, 2);

    // 2. Crear un "Blob" (un archivo de datos crudos en la memoria del navegador)
    const blob = new Blob([datosJSON], { type: 'application/json' });

    // 3. Crear una URL temporal que apunte a ese Blob
    const url = URL.createObjectURL(blob);

    // 4. Crear un enlace <a> invisible para forzar la descarga
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = url;

    // Añadimos la fecha actual al nombre del archivo para mejor organización
    const fecha = new Date().toISOString().split('T')[0];
    enlaceDescarga.download = `control_instituto_backup_${fecha}.json`;

    // 5. Simular el clic y hacer limpieza
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
    URL.revokeObjectURL(url);
}

// IMPORTAR: Lee el archivo subido y sobrescribe los datos actuales
window.procesarImportacion = function(event) {
    const archivo = event.target.files[0];
    if (!archivo) return; // Si el usuario cancela la ventana, no hacemos nada

    // Usamos FileReader, una API del navegador para leer archivos locales
    const lector = new FileReader();

    lector.onload = function(e) {
        try {
            // Intentamos convertir el texto del archivo a un objeto JavaScript
            const datosImportados = JSON.parse(e.target.result);

            // Verificación básica para asegurar que no es un archivo vacío o erróneo
            if (datosImportados && typeof datosImportados === 'object') {

                // Pedimos confirmación porque esto borra lo actual
                if (confirm('⚠️ ¿Estás seguro? Esta acción sobrescribirá todos los datos que tienes actualmente en la aplicación.')) {

                    appData = datosImportados; // Sustituimos los datos
                    guardarDatos(); // Guardamos en localStorage (y renderiza la UI)

                    alert('✅ ¡Copia de seguridad restaurada con éxito!');
                    cambiarSeccion('dashboard'); // Llevamos al usuario al inicio
                }
            } else {
                alert('❌ El archivo no tiene un formato válido.');
            }
        } catch (error) {
            alert('❌ Error al leer el archivo. Asegúrate de que es un .json válido de Control Instituto.');
            console.error("Error de importación:", error);
        }

        // Vaciamos el input para que permita subir el mismo archivo de nuevo si fuera necesario
        event.target.value = '';
    };

    // Leer el contenido del archivo como texto
    lector.readAsText(archivo);
}