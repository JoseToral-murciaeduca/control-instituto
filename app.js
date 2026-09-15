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