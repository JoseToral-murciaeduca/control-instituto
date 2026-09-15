const API_URL_TAREAS = "http://localhost:8080/api/tareas";
const API_URL_ASIGNATURAS = "http://localhost:8080/api/asignaturas";
const API_URL_ENTREGAS = "http://localhost:8080/api/entregas";
const API_URL_APUNTES = "http://localhost:8080/api/apuntes";

// ==========================================
// 0. UI GLOBAL Y TOASTS
// ==========================================
window.mostrarToast = function(mensaje, tipo = 'info') {
    document.querySelectorAll('.filter-dropdown').forEach(el => el.style.display = 'none');
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${tipo === 'info' ? 'ℹ️' : '🔔'}</span> ${mensaje}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

window.toggleFullscreen = function(btn) {
    const widget = btn.closest('.widget');
    widget.classList.toggle('fullscreen');
    mostrarToast(widget.classList.contains('fullscreen') ? 'Pantalla completa' : 'Vista minimizada', 'info');
}

let isPlaying = false;
window.togglePlay = function() {
    isPlaying = !isPlaying;
    const btn = document.querySelector('.play-btn');
    btn.innerText = isPlaying ? '⏸' : '▶';
    mostrarToast(isPlaying ? 'Reproduciendo lofi...' : 'Música pausada', 'info');
}

window.convertirImagenABase64 = function(inputElement, idInputTextoDestino) {
    const archivo = inputElement.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onloadend = function() {
        document.getElementById(idInputTextoDestino).value = lector.result;
        mostrarToast("Archivo local cargado", "info");
    }
    lector.readAsDataURL(archivo);
}

function formatoInputDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.toggleMenu = function(id) {
    document.querySelectorAll('.filter-dropdown').forEach(el => {
        if (el.id !== id) el.style.display = 'none';
    });
    const menu = document.getElementById(id);
    if(menu) menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.toolbar-right') && !event.target.closest('.widget-header') && !event.target.closest('.icon-wrapper')) {
        document.querySelectorAll('.filter-dropdown').forEach(el => el.style.display = 'none');
    }
});

function actualizarIconoFiltro(idIcono, idMenu) {
    const checkboxes = document.querySelectorAll(`#${idMenu} input[type="checkbox"]`);
    if(checkboxes.length === 0) return;
    const todosMarcados = Array.from(checkboxes).every(chk => chk.checked);
    const icono = document.getElementById(idIcono);
    if(icono) {
        if(!todosMarcados) icono.classList.add('active-icon');
        else icono.classList.remove('active-icon');
    }
}

function actualizarIconoOrden(idIcono, invertido) {
    const icono = document.getElementById(idIcono);
    if(icono) {
        if(invertido) icono.classList.add('active-icon');
        else icono.classList.remove('active-icon');
    }
}

// ==========================================
// 12. NAVEGACIÓN SCROLL 
// ==========================================
window.navegarA = function(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const originalBorder = elemento.style.borderColor;
        elemento.style.transition = 'all 0.5s ease';
        elemento.style.borderColor = '#60a5fa';
        elemento.style.boxShadow = '0 0 15px rgba(96, 165, 250, 0.4)';
        setTimeout(() => {
            elemento.style.borderColor = originalBorder;
            elemento.style.boxShadow = 'none';
        }, 1500);
    }
};

// ==========================================
// 1. MOTOR DE ASIGNATURAS
// ==========================================
let memoriaAsignaturas = [], asignaturasFiltradas = [], ordenAsigActual = 'defecto';
let ordenInvertidoAsignaturas = false;

async function cargarAsignaturasMySQL() {
    const contenedor = document.getElementById('grid-asignaturas-mysql');
    if (!contenedor) return;
    try {
        const respuesta = await fetch(API_URL_ASIGNATURAS);
        if (!respuesta.ok) throw new Error("Fallo API Asignaturas");
        memoriaAsignaturas = await respuesta.json();
        procesarAsignaturas();
    } catch (error) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; color: #ef4444; text-align: center;">⚠️ Backend de asignaturas no disponible.</p>';
    }
}

window.toggleBuscadorAsignaturas = function() {
    const buscador = document.getElementById('buscador-asignaturas');
    if (buscador.style.display === 'none') { buscador.style.display = 'block'; buscador.focus(); }
    else { buscador.style.display = 'none'; buscador.value = ''; filtrarAsignaturas(); }
}

window.toggleOrdenDireccionAsignaturas = function() {
    ordenInvertidoAsignaturas = !ordenInvertidoAsignaturas;
    actualizarIconoOrden('icon-sort-asig', ordenInvertidoAsignaturas);
    filtrarAsignaturas();
}

window.filtrarAsignaturas = function() {
    const txt = document.getElementById('buscador-asignaturas').value.toLowerCase();
    const chkCurso = document.querySelector('#filtro-asig input[value="en_curso"]').checked;
    const chkComp = document.querySelector('#filtro-asig input[value="completada"]').checked;

    asignaturasFiltradas = memoriaAsignaturas.filter(a => {
        const matchTxt = (a.nombre || '').toLowerCase().includes(txt);
        const isComp = a.progreso >= 100;
        const matchEst = (isComp && chkComp) || (!isComp && chkCurso);
        return matchTxt && matchEst;
    });

    actualizarIconoFiltro('icon-filter-asig', 'filtro-asig');

    if (ordenAsigActual === 'az') asignaturasFiltradas.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    else if (ordenAsigActual === 'progreso') asignaturasFiltradas.sort((a, b) => (b.progreso || 0) - (a.progreso || 0));
    else asignaturasFiltradas.sort((a, b) => a.id - b.id);

    if (ordenInvertidoAsignaturas) asignaturasFiltradas.reverse();

    dibujarAsignaturas();
}

window.cambiarOrdenAsignaturas = function() {
    if (ordenAsigActual === 'defecto') { ordenAsigActual = 'az'; mostrarToast('Orden: Alfabético'); }
    else if (ordenAsigActual === 'az') { ordenAsigActual = 'progreso'; mostrarToast('Orden: Mayor progreso'); }
    else { ordenAsigActual = 'defecto'; mostrarToast('Orden por defecto'); }
    filtrarAsignaturas();
}

window.toggleVistaAsignaturas = function(esLista) {
    const grid = document.getElementById('grid-asignaturas-mysql');
    const btnGaleria = document.getElementById('btn-galeria-asig');
    const btnLista = document.getElementById('btn-lista-asig');
    if (esLista) { grid.classList.add('list-view'); btnGaleria.classList.remove('active'); btnLista.classList.add('active'); }
    else { grid.classList.remove('list-view'); btnLista.classList.remove('active'); btnGaleria.classList.add('active'); }
}

function procesarAsignaturas() { filtrarAsignaturas(); }

function dibujarAsignaturas() {
    const contenedor = document.getElementById('grid-asignaturas-mysql');
    contenedor.innerHTML = '';
    if (asignaturasFiltradas.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; margin-top: 40px;">No hay asignaturas. Pulsa "Nuevo" para crear una.</p>'; return;
    }
    const colores = ['green', 'purple', 'gray', 'brown', 'blue', 'orange', 'red'];
    asignaturasFiltradas.forEach((asig, index) => {
        const colorT1 = colores[index % colores.length], colorT2 = colores[(index + 2) % colores.length];
        let estiloImagen = '', claseImagen = '';
        if (asig.urlImagen && asig.urlImagen.trim() !== '') { estiloImagen = `background-image: url('${asig.urlImagen}'); filter: none;`; }
        else { claseImagen = `placeholder-${(index % 3) + 1}`; const hue = (index * 90) % 360; if (hue > 0) estiloImagen = `filter: hue-rotate(${hue}deg);`; }
        contenedor.innerHTML += `
            <div class="course-card">
                <div class="course-img ${claseImagen}" style="${estiloImagen} cursor: pointer;" title="Clic para cambiar portada" onclick="abrirModalPortada(${asig.id})"></div>
                <div class="course-info">
                    <h4>${asig.nombre}</h4>
                    <div class="tags">${asig.tag1 ? `<span class="tag tag-${colorT1}">${asig.tag1}</span>` : ''}${asig.tag2 ? `<span class="tag tag-${colorT2}">${asig.tag2}</span>` : ''}</div>
                    <div class="prof">📄 ${asig.profesor || 'Sin asignar'}</div>
                    <div class="progress-bar"><div class="fill ${asig.progreso > 50 ? 'green' : ''}" style="width: ${asig.progreso || 0}%;"></div></div>
                </div>
            </div>`;
    });
}
window.abrirModalPortada = async function(id) {
    document.getElementById('input-portada-asig-id').value = id;
    document.getElementById('input-portada-url').value = '';
    document.getElementById('input-portada-archivo').value = '';
    try {
        const res = await fetch(`${API_URL_ASIGNATURAS}/${id}`);
        if (res.ok) {
            const asig = await res.json();
            if (asig.urlImagen && !asig.urlImagen.startsWith('data:image')) document.getElementById('input-portada-url').value = asig.urlImagen;
        }
    } catch(e){}
    document.getElementById('modal-cambiar-portada').style.display = 'flex';
}
window.cerrarModalPortada = function() { document.getElementById('modal-cambiar-portada').style.display = 'none'; }
window.guardarNuevaPortada = async function() {
    const id = document.getElementById('input-portada-asig-id').value;
    const rutaImagen = document.getElementById('input-portada-url').value.trim();
    try {
        const resGet = await fetch(`${API_URL_ASIGNATURAS}/${id}`);
        if (!resGet.ok) throw new Error("No encontrada");
        const asig = await resGet.json();
        asig.urlImagen = rutaImagen;
        await fetch(`${API_URL_ASIGNATURAS}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(asig) });
        cerrarModalPortada(); mostrarToast("Portada actualizada", "info"); cargarAsignaturasMySQL();
    } catch (e) { alert("Error al guardar la portada."); }
}

// ==========================================
// 2. MOTOR DE TAREAS
// ==========================================
let memoriaTareas = [], tareasFiltradas = [], paginaActual = 1, TAREAS_POR_PAGINA = 10, ordenActual = 'lista';
let ordenInvertidoTareas = false;

async function cargarTareasMySQL() {
    const contenedor = document.getElementById('lista-tareas-mysql');
    if (!contenedor) return;
    try {
        const respuesta = await fetch(API_URL_TAREAS);
        if (!respuesta.ok) throw new Error("Fallo servidor");
        memoriaTareas = await respuesta.json(); procesarTareas();
    } catch (error) { contenedor.innerHTML = '<li style="color: #ef4444; justify-content: center;">⚠️ Error al cargar Tareas.</li>'; }
}

window.toggleBuscador = function(idBusq) {
    const buscador = document.getElementById(idBusq || 'buscador-tareas');
    if (buscador.style.display === 'none') { buscador.style.display = 'block'; buscador.focus(); }
    else { buscador.style.display = 'none'; buscador.value = ''; filtrarPorBusqueda(); }
}

window.toggleOrdenDireccionTareas = function() {
    ordenInvertidoTareas = !ordenInvertidoTareas;
    actualizarIconoOrden('icon-sort-tareas', ordenInvertidoTareas);
    filtrarPorBusqueda();
}

window.filtrarPorBusqueda = function() {
    const txt = document.getElementById('buscador-tareas').value.toLowerCase();
    const chkPendiente = document.querySelector('#filtro-tareas input[value="PENDIENTE"]').checked;
    const chkCompletada = document.querySelector('#filtro-tareas input[value="COMPLETADA"]').checked;

    tareasFiltradas = memoriaTareas.filter(t => {
        const matchTxt = (t.titulo || t.texto || '').toLowerCase().includes(txt);
        const isComp = t.estado === 'COMPLETADA';
        const matchEst = (isComp && chkCompletada) || (!isComp && chkPendiente);
        return matchTxt && matchEst;
    });

    actualizarIconoFiltro('icon-filter-tareas', 'filtro-tareas');

    if (ordenActual === 'estado') tareasFiltradas.sort((a, b) => { if (a.estado === b.estado) return 0; return a.estado === 'PENDIENTE' ? -1 : 1; });
    else if (ordenActual === 'fecha') tareasFiltradas.sort((a, b) => { if (!a.fechaLimite) return 1; if (!b.fechaLimite) return -1; return new Date(a.fechaLimite) - new Date(b.fechaLimite); });
    else tareasFiltradas.sort((a, b) => a.id - b.id);

    if (ordenInvertidoTareas) tareasFiltradas.reverse();

    paginaActual = 1; dibujarTareas();
}

window.cambiarOrden = function(tipo) {
    ordenActual = tipo;
    const tabs = document.querySelectorAll('#tabs-tareas .t-tab');
    tabs.forEach(t => t.classList.remove('active')); event.currentTarget.classList.add('active');
    filtrarPorBusqueda();
}

window.cambiarPagina = function(direccion) {
    const maxPag = Math.ceil(tareasFiltradas.length / TAREAS_POR_PAGINA) || 1;
    if (direccion === -1 && paginaActual > 1) { paginaActual--; dibujarTareas(); }
    else if (direccion === 1 && paginaActual < maxPag) { paginaActual++; dibujarTareas(); }
}

function procesarTareas() {
    filtrarPorBusqueda();
    dibujarCalendario();
}

function dibujarTareas() {
    const contenedor = document.getElementById('lista-tareas-mysql');
    contenedor.innerHTML = '';
    if (tareasFiltradas.length === 0) {
        contenedor.innerHTML = '<li style="color: var(--text-muted); justify-content: center; font-style: italic;">No hay tareas.</li>';
        document.getElementById('info-paginacion').innerText = `1 / 1`; return;
    }
    const inicio = (paginaActual - 1) * TAREAS_POR_PAGINA;
    const tareasPagina = tareasFiltradas.slice(inicio, inicio + TAREAS_POR_PAGINA);

    tareasPagina.forEach(tarea => {
        const isComp = tarea.estado === 'COMPLETADA';
        let fTexto = 'Sin fecha';
        if (tarea.fechaLimite) fTexto = new Date(tarea.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
        const li = document.createElement('li');
        if (isComp) li.classList.add('completed');
        li.innerHTML = `<input type="checkbox" ${isComp ? 'checked' : ''} onchange="actualizarEstadoTareaBBDD(${tarea.id}, this)">
                        <span>${tarea.titulo || tarea.texto || 'Tarea sin título'}</span>
                        <span class="date-right">${fTexto}</span>`;
        contenedor.appendChild(li);
    });
    document.getElementById('info-paginacion').innerText = `${paginaActual} / ${Math.ceil(tareasFiltradas.length / TAREAS_POR_PAGINA)}`;
}

window.actualizarEstadoTareaBBDD = async function(id, checkbox) {
    const nuevo = checkbox.checked ? 'COMPLETADA' : 'PENDIENTE';
    const li = checkbox.parentElement;
    checkbox.checked ? li.classList.add('completed') : li.classList.remove('completed');
    try {
        const resGet = await fetch(`${API_URL_TAREAS}/${id}`);
        if (!resGet.ok) throw new Error("No encontrada");
        const tarea = await resGet.json();
        tarea.estado = nuevo;
        await fetch(`${API_URL_TAREAS}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tarea) });
        const idx = memoriaTareas.findIndex(t => t.id === id);
        if(idx !== -1) {
            memoriaTareas[idx].estado = nuevo;
            dibujarCalendario();
        }
    } catch (error) { alert("Error BBDD."); checkbox.checked = !checkbox.checked; li.classList.toggle('completed'); }
}

// ==========================================
// 3. MOTOR DE ENTREGAS
// ==========================================
let memoriaEntregas = [], entregasFiltradas = [], ordenEntregasActual = 'todo';
let paginaActualEntregas = 1;
const ENTREGAS_POR_PAGINA = 5;
let ordenInvertidoEntregas = false;

async function cargarEntregasMySQL() {
    const contenedor = document.getElementById('tabla-entregas-mysql');
    if (!contenedor) return;
    try {
        const res = await fetch(API_URL_ENTREGAS);
        if (!res.ok) throw new Error();
        memoriaEntregas = await res.json();
        filtrarEntregasPrincipal();
    } catch (e) { contenedor.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">⚠️ Backend de entregas no conectado.</td></tr>'; }
}

window.toggleBuscadorEntregas = function(idBusq) {
    const buscador = document.getElementById(idBusq);
    if (buscador.style.display === 'none') { buscador.style.display = 'inline-block'; buscador.focus(); }
    else { buscador.style.display = 'none'; buscador.value = ''; filtrarEntregasPrincipal(); }
}

window.toggleOrdenDireccionEntregas = function() {
    ordenInvertidoEntregas = !ordenInvertidoEntregas;
    actualizarIconoOrden('icon-sort-entregas', ordenInvertidoEntregas);
    filtrarEntregasPrincipal();
}

window.cambiarOrdenEntregas = function(tipo) {
    ordenEntregasActual = tipo;
    const tabs = document.querySelectorAll('#tabs-entregas .t-tab');
    tabs.forEach(t => t.classList.remove('active')); event.currentTarget.classList.add('active');
    filtrarEntregasPrincipal();
}

window.filtrarEntregasPrincipal = function() {
    const txtElement = document.getElementById('buscador-entregas');
    const txt = txtElement ? txtElement.value.toLowerCase() : '';
    const checkboxes = document.querySelectorAll('#menu-filtros-entregas input[type="checkbox"]');
    const tiposPermitidos = Array.from(checkboxes).filter(chk => chk.checked).map(chk => chk.value);

    entregasFiltradas = memoriaEntregas.filter(e => {
        const coincideTexto = (e.titulo || '').toLowerCase().includes(txt);
        const coincideTipo = tiposPermitidos.includes(e.tipo) || (!e.tipo && tiposPermitidos.length > 0);
        return coincideTexto && coincideTipo;
    });

    actualizarIconoFiltro('icon-filter-entregas', 'menu-filtros-entregas');

    if (ordenEntregasActual === 'fecha') {
        entregasFiltradas.sort((a, b) => {
            if(!a.fechaLimite) return 1; if(!b.fechaLimite) return -1;
            return new Date(a.fechaLimite) - new Date(b.fechaLimite);
        });
    } else if (ordenEntregasActual === 'estado') {
        const peso = {"Pendiente": 1, "En progreso": 2, "Planeado": 3, "Completado": 4};
        entregasFiltradas.sort((a, b) => (peso[a.estado] || 99) - (peso[b.estado] || 99));
    } else { entregasFiltradas.sort((a, b) => a.id - b.id); }

    if (ordenInvertidoEntregas) entregasFiltradas.reverse();

    paginaActualEntregas = 1; dibujarEntregas();
}

window.cambiarPaginaEntregas = function(direccion) {
    const maxPag = Math.ceil(entregasFiltradas.length / ENTREGAS_POR_PAGINA) || 1;
    if (direccion === -1 && paginaActualEntregas > 1) { paginaActualEntregas--; dibujarEntregas(); }
    else if (direccion === 1 && paginaActualEntregas < maxPag) { paginaActualEntregas++; dibujarEntregas(); }
}
function calcularPlazo(fechaString) {
    if (!fechaString) return '<span class="text-blue">Sin fecha</span>';
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const limite = new Date(fechaString); limite.setHours(0,0,0,0);
    const diffTime = limite - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `<span class="text-red">Atrasado (${Math.abs(diffDays)}d)</span>`;
    if (diffDays === 0) return `<span class="text-red">Vence hoy</span>`;
    if (diffDays === 1) return `<span class="text-orange">Mañana</span>`;
    if (diffDays <= 3) return `<span class="text-orange">En ${diffDays} días</span>`;
    return `<span class="text-blue">En ${diffDays} días</span>`;
}
function obtenerColorTipo(tipo) { const m = {"Proyecto":"red", "Examen":"orange", "Práctica":"purple", "Deberes":"green", "Presentación":"blue"}; return m[tipo]||"gray"; }
function obtenerColorEstado(est) { const m = {"En progreso":"blue", "Pendiente":"orange", "Planeado":"gray", "Completado":"green"}; return m[est]||"gray"; }

function procesarEntregas() {
    filtrarEntregasPrincipal();
    dibujarCalendario();
}

function dibujarEntregas() {
    const contenedor = document.getElementById('tabla-entregas-mysql');
    contenedor.innerHTML = '';
    if (entregasFiltradas.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No hay entregas para mostrar.</td></tr>';
        document.getElementById('info-paginacion-entregas').innerText = `1 / 1`; return;
    }
    const inicio = (paginaActualEntregas - 1) * ENTREGAS_POR_PAGINA;
    const entregasPagina = entregasFiltradas.slice(inicio, inicio + ENTREGAS_POR_PAGINA);

    entregasPagina.forEach(e => {
        let fTexto = e.fechaLimite ? new Date(e.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.','') : '---';
        const colorTipo = obtenerColorTipo(e.tipo);
        const colorEst = obtenerColorEstado(e.estado);
        const htmlPlazo = calcularPlazo(e.fechaLimite);

        contenedor.innerHTML += `
            <tr>
                <td>${e.titulo}</td>
                <td><span class="tag tag-${colorTipo}">${e.tipo || 'Desconocido'}</span></td>
                <td><span class="tag tag-${colorEst}">${e.estado || 'Desconocido'}</span></td>
                <td>${fTexto}</td>
                <td>${htmlPlazo}</td>
                <td><button class="btn-delete-mini" onclick="borrarEntrega(${e.id})" title="Borrar">🗑️</button></td>
            </tr>
        `;
    });
    document.getElementById('info-paginacion-entregas').innerText = `${paginaActualEntregas} / ${Math.ceil(entregasFiltradas.length / ENTREGAS_POR_PAGINA)}`;
}
window.borrarEntrega = async function(id) {
    if(!confirm("¿Seguro que quieres borrar esta entrega?")) return;
    try {
        await fetch(`${API_URL_ENTREGAS}/${id}`, { method: 'DELETE' });
        mostrarToast("Entrega eliminada", "info"); cargarEntregasMySQL();
    } catch(e) { alert("Error al borrar en BBDD."); }
}

// ==========================================
// 4. MOTOR DE APUNTES
// ==========================================
let memoriaApuntes = [], apuntesFiltrados = [];
let ordenApuntesActual = 'fecha';
let ordenInvertidoApuntes = false;
let fechaReferenciaApuntes = new Date();

function getLunes(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

async function cargarApuntesMySQL() {
    const grid = document.getElementById('grid-apuntes-mysql');
    if (!grid) return;
    try {
        const res = await fetch(API_URL_APUNTES);
        if (!res.ok) throw new Error();
        memoriaApuntes = await res.json();
        filtrarApuntesPrincipal();
    } catch (e) {
        grid.innerHTML = '<div style="padding: 20px; color: #ef4444; text-align: center; grid-column: 1/-1;">⚠️ Backend de apuntes no conectado.</div>';
    }
}

window.toggleBuscadorApuntes = function(id) {
    const buscador = document.getElementById(id);
    if (buscador.style.display === 'none') { buscador.style.display = 'inline-block'; buscador.focus(); }
    else { buscador.style.display = 'none'; buscador.value = ''; filtrarApuntesPrincipal(); }
}

window.toggleOrdenDireccionApuntes = function() {
    ordenInvertidoApuntes = !ordenInvertidoApuntes;
    actualizarIconoOrden('icon-sort-apuntes', ordenInvertidoApuntes);
    filtrarApuntesPrincipal();
}
window.cambiarOrdenApuntes = function(tipo) {
    ordenApuntesActual = tipo;
    const tabs = document.querySelectorAll('#tabs-apuntes .t-tab');
    tabs.forEach(t => t.classList.remove('active')); event.currentTarget.classList.add('active');
    filtrarApuntesPrincipal();
}
window.cambiarSemanaApuntes = function(direccion) {
    if (direccion === 0) {
        fechaReferenciaApuntes = new Date();
    } else {
        fechaReferenciaApuntes.setDate(fechaReferenciaApuntes.getDate() + (direccion * 7));
    }
    dibujarApuntes();
}

window.filtrarApuntesPrincipal = function() {
    const txtElement = document.getElementById('buscador-apuntes');
    const txt = txtElement ? txtElement.value.toLowerCase() : '';
    const checkboxes = document.querySelectorAll('#menu-filtros-apuntes input[type="checkbox"]');
    const coloresPermitidos = Array.from(checkboxes).filter(chk => chk.checked).map(chk => chk.value);

    apuntesFiltrados = memoriaApuntes.filter(a => {
        const coincideTexto = (a.titulo || '').toLowerCase().includes(txt) || (a.asignatura || '').toLowerCase().includes(txt);
        const coincideColor = coloresPermitidos.includes(a.color) || (!a.color && coloresPermitidos.length > 0);
        return coincideTexto && coincideColor;
    });

    actualizarIconoFiltro('icon-filter-apuntes', 'menu-filtros-apuntes');

    dibujarApuntes();
    dibujarCalendario();
}

function dibujarApuntes() {
    const grid = document.getElementById('grid-apuntes-mysql');
    if(!grid) return;
    grid.innerHTML = '';

    const lunes = getLunes(fechaReferenciaApuntes);
    const hoyLunes = getLunes(new Date());

    const mesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('texto-mes-apuntes').innerText = `${mesNombres[lunes.getMonth()]} ${lunes.getFullYear()}`;

    const diffSemanas = Math.round((lunes - hoyLunes) / (7 * 24 * 60 * 60 * 1000));
    let textoSemana = "Esta semana";
    if (diffSemanas === -1) textoSemana = "Semana anterior";
    else if (diffSemanas === 1) textoSemana = "Próxima semana";
    else if (diffSemanas < -1) textoSemana = `Hace ${Math.abs(diffSemanas)} semanas`;
    else if (diffSemanas > 1) textoSemana = `En ${diffSemanas} semanas`;

    const infoPagApuntes = document.getElementById('info-paginacion-apuntes');
    if(infoPagApuntes) infoPagApuntes.innerText = textoSemana;

    const diasNombres = ["Lun", "Mar", "Mié", "Jue", "Vie"];

    for (let i = 0; i < 5; i++) {
        let fechaDia = new Date(lunes);
        fechaDia.setDate(lunes.getDate() + i);
        let fechaString = formatoInputDate(fechaDia);

        let apuntesDelDia = apuntesFiltrados.filter(a => a.fecha === fechaString);

        if (ordenApuntesActual === 'asignatura') {
            apuntesDelDia.sort((a,b) => (a.asignatura||'').localeCompare(b.asignatura||''));
        }
        if (ordenInvertidoApuntes) apuntesDelDia.reverse();

        let htmlCol = `<div class="day-col"><div class="day-name">${diasNombres[i]} ${fechaDia.getDate()}</div>`;

        apuntesDelDia.forEach(a => {
            htmlCol += `
            <div class="note-card">
                <button class="btn-delete-mini" style="position:absolute; top:4px; right:4px; font-size:0.8rem; padding:0;" onclick="borrarApunte(${a.id})" title="Borrar">×</button>
                <span class="dot ${a.color || 'gray'}"></span> ${a.titulo}<br>
                <span class="sub">${a.asignatura || 'Sin Asignatura'}</span>
            </div>`;
        });

        htmlCol += `</div>`;
        grid.innerHTML += htmlCol;
    }
}

window.borrarApunte = async function(id) {
    if(!confirm("¿Borrar este apunte?")) return;
    try {
        await fetch(`${API_URL_APUNTES}/${id}`, { method: 'DELETE' });
        mostrarToast("Apunte eliminado", "info"); cargarApuntesMySQL();
    } catch(e) { alert("Error al borrar en BBDD."); }
}

// ==========================================
// 5. MOTOR DE OBJETIVOS (DINÁMICO CON DRAG & DROP)
// ==========================================
let misObjetivos = [];
let dragObjBlockId = null;
let dragObjTaskId = null;

function inicializarObjetivos() {
    const guardado = localStorage.getItem('academic_os_objetivos_v2');
    if (guardado) {
        misObjetivos = JSON.parse(guardado);
    } else {
        misObjetivos = [
            { id: 'b1', title: 'Esta semana', tasks: [{id: 't1', text: 'Preparar test teórico', completed: true}, {id: 't2', text: 'Subir práctica a producción', completed: true}, {id: 't3', text: 'Revisar logs del servidor', completed: false}] },
            { id: 'b2', title: 'Este Trimestre', tasks: [{id: 't4', text: 'Desarrollar Proyecto Integrado', completed: false}, {id: 't5', text: 'Aprobar todas las evaluaciones', completed: false}, {id: 't6', text: 'Conseguir plaza FCT', completed: false}] },
            { id: 'b3', title: 'Este año', tasks: [{id: 't7', text: 'Terminar el ciclo formativo', completed: false}, {id: 't8', text: 'Montar portfolio web completo', completed: false}, {id: 't9', text: 'Certificación oficial Java', completed: false}] }
        ];
    }
    dibujarObjetivos();
}

function guardarObjetivosLocales() {
    localStorage.setItem('academic_os_objetivos_v2', JSON.stringify(misObjetivos));
    dibujarObjetivos();
}

window.agregarBloqueObjetivo = function() {
    const title = prompt("Nombre del nuevo bloque (ej. Próximo mes):");
    if(title && title.trim() !== "") {
        misObjetivos.push({ id: 'b' + Date.now(), title: title.trim(), tasks: [] });
        guardarObjetivosLocales();
        mostrarToast("Bloque añadido", "info");
    }
}

window.borrarBloqueObjetivo = function(id) {
    if(confirm("¿Seguro que quieres borrar este bloque y todos sus objetivos?")) {
        misObjetivos = misObjetivos.filter(b => b.id !== id);
        guardarObjetivosLocales();
        mostrarToast("Bloque eliminado", "info");
    }
}

window.agregarTareaObjetivo = function(blockId) {
    const text = prompt("Nuevo objetivo:");
    if(text && text.trim() !== "") {
        const b = misObjetivos.find(x => x.id === blockId);
        b.tasks.push({ id: 't' + Date.now(), text: text.trim(), completed: false });
        guardarObjetivosLocales();
    }
}

window.borrarTareaObjetivo = function(blockId, taskId) {
    const b = misObjetivos.find(x => x.id === blockId);
    b.tasks = b.tasks.filter(t => t.id !== taskId);
    guardarObjetivosLocales();
}

window.editarTituloBloque = function(blockId) {
    const b = misObjetivos.find(x => x.id === blockId);
    const nuevo = prompt("Editar título del bloque:", b.title);
    if(nuevo && nuevo.trim() !== "") {
        b.title = nuevo.trim();
        guardarObjetivosLocales();
    }
}

window.editarTextoTareaObjetivo = function(blockId, taskId, event) {
    event.preventDefault();
    event.stopPropagation();
    const b = misObjetivos.find(x => x.id === blockId);
    const t = b.tasks.find(x => x.id === taskId);
    const nuevo = prompt("Editar objetivo:", t.text);
    if(nuevo && nuevo.trim() !== "") {
        t.text = nuevo.trim();
        guardarObjetivosLocales();
    }
}

window.toggleTareaObjetivo = function(blockId, taskId) {
    const b = misObjetivos.find(x => x.id === blockId);
    const t = b.tasks.find(x => x.id === taskId);
    t.completed = !t.completed;
    guardarObjetivosLocales();
}

window.dragStartObjetivo = function(e, blockId, taskId) {
    dragObjBlockId = blockId;
    dragObjTaskId = taskId;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
window.dragEndObjetivo = function(e) {
    e.target.classList.remove('dragging');
    dragObjBlockId = null;
    dragObjTaskId = null;
}
window.dragOverObjetivo = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}
window.dropObjetivo = function(e, targetBlockId, targetTaskId) {
    e.preventDefault(); e.stopPropagation();
    if (!dragObjBlockId || !dragObjTaskId) return;
    const bOrigen = misObjetivos.find(b => b.id === dragObjBlockId);
    const bDestino = misObjetivos.find(b => b.id === targetBlockId);
    if (!bOrigen || !bDestino) return;
    const idxOrigen = bOrigen.tasks.findIndex(t => t.id === dragObjTaskId);
    const idxDestino = bDestino.tasks.findIndex(t => t.id === targetTaskId);
    if (idxOrigen === -1 || idxDestino === -1) return;
    const tarea = bOrigen.tasks.splice(idxOrigen, 1)[0];
    bDestino.tasks.splice(idxDestino, 0, tarea);
    guardarObjetivosLocales();
}
window.dropObjetivoEmpty = function(e, targetBlockId) {
    e.preventDefault();
    if (e.target.tagName === 'LI' || e.target.closest('li')) return;
    if (!dragObjBlockId || !dragObjTaskId) return;
    const bOrigen = misObjetivos.find(b => b.id === dragObjBlockId);
    const bDestino = misObjetivos.find(b => b.id === targetBlockId);
    if (!bOrigen || !bDestino) return;
    const idxOrigen = bOrigen.tasks.findIndex(t => t.id === dragObjTaskId);
    if (idxOrigen === -1) return;
    const tarea = bOrigen.tasks.splice(idxOrigen, 1)[0];
    bDestino.tasks.push(tarea);
    guardarObjetivosLocales();
}

function dibujarObjetivos() {
    const containerStats = document.getElementById('objetivos-stats');
    const containerBloques = document.getElementById('objetivos-bloques');
    if(!containerStats || !containerBloques) return;

    containerStats.innerHTML = '';
    containerBloques.innerHTML = '';

    misObjetivos.forEach(bloque => {
        const total = bloque.tasks.length;
        const hechos = bloque.tasks.filter(t => t.completed).length;
        const pct = total === 0 ? 0 : Math.round((hechos / total) * 100);

        containerStats.innerHTML += `
            <div class="stat-bar">
                <span>${bloque.title}: ${pct}%</span>
                <div class="bar"><div class="fill" style="width: ${pct}%"></div></div>
            </div>
        `;

        let htmlTasks = bloque.tasks.map(t => `
            <li draggable="true"
                ondragstart="dragStartObjetivo(event, '${bloque.id}', '${t.id}')"
                ondragend="dragEndObjetivo(event)"
                ondragover="dragOverObjetivo(event)"
                ondrop="dropObjetivo(event, '${bloque.id}', '${t.id}')"
                class="${t.completed ? 'completed' : ''}">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; margin: 0;">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTareaObjetivo('${bloque.id}', '${t.id}')">
                    <span onclick="editarTextoTareaObjetivo('${bloque.id}', '${t.id}', event)">${t.text}</span>
                </label>
                <button class="btn-delete-mini" onclick="borrarTareaObjetivo('${bloque.id}', '${t.id}')" title="Borrar objetivo">🗑️</button>
            </li>
        `).join('');

        containerBloques.innerHTML += `
            <div class="goal-col" style="min-width: 250px;">
                <div class="goal-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span onclick="editarTituloBloque('${bloque.id}')" style="cursor: pointer;" title="Editar título">${bloque.title}</span>
                    <button class="btn-delete-mini" onclick="borrarBloqueObjetivo('${bloque.id}')" title="Borrar bloque entero">🗑️</button>
                </div>
                <ul class="clean-list goal-list" 
                    ondragover="dragOverObjetivo(event)" 
                    ondrop="dropObjetivoEmpty(event, '${bloque.id}')"
                    style="min-height: 40px;">
                    ${htmlTasks}
                </ul>
                <div class="new-page-btn" style="padding-top: 10px;" onclick="agregarTareaObjetivo('${bloque.id}')">+ Añadir objetivo</div>
            </div>
        `;
    });
}

// ==========================================
// 6. MOTOR DE CALENDARIO MENSUAL
// ==========================================
let fechaReferenciaCalendario = new Date();
let filtroCalendarioActual = 'todo';
let ordenInvertidoCalendario = false;

window.cambiarMesCalendario = function(direccion) {
    if (direccion === 0) {
        fechaReferenciaCalendario = new Date();
    } else {
        fechaReferenciaCalendario.setMonth(fechaReferenciaCalendario.getMonth() + direccion);
    }
    dibujarCalendario();
}

window.cambiarFiltroCalendario = function(tipo) {
    filtroCalendarioActual = tipo;
    const tabs = document.querySelectorAll('#tabs-calendario .t-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    dibujarCalendario();
}

window.toggleOrdenDireccionCalendario = function() {
    ordenInvertidoCalendario = !ordenInvertidoCalendario;
    actualizarIconoOrden('icon-sort-calendario', ordenInvertidoCalendario);
    dibujarCalendario();
}

function dibujarCalendario() {
    const grid = document.getElementById('grid-calendario-mysql');
    if (!grid) return;
    grid.innerHTML = '';

    const year = fechaReferenciaCalendario.getFullYear();
    const month = fechaReferenciaCalendario.getMonth();

    const mesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const headerSpan = document.getElementById('texto-mes-calendario');
    if (headerSpan) headerSpan.innerText = `${mesNombres[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    for (let i = 0; i < startDayIndex; i++) {
        grid.innerHTML += `<div class="cal-cell" style="background: rgba(0,0,0,0.2); cursor: default;"></div>`;
    }

    const chkTareas = document.querySelector('#filtro-calendario input[value="tareas"]').checked;
    const chkEntregas = document.querySelector('#filtro-calendario input[value="entregas"]').checked;
    const chkApuntes = document.querySelector('#filtro-calendario input[value="apuntes"]').checked;

    actualizarIconoFiltro('icon-filter-calendario', 'filtro-calendario');

    for (let day = 1; day <= totalDays; day++) {
        let currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let arraysEventosHTML = [];

        if (chkTareas && (filtroCalendarioActual === 'todo' || filtroCalendarioActual === 'tareas')) {
            let tareasDia = memoriaTareas.filter(t => t.fechaLimite === currentDateStr);
            tareasDia.forEach(t => {
                let colorClass = t.estado === 'COMPLETADA' ? 'gray' : 'green';
                arraysEventosHTML.push(`<div class="cal-event ${colorClass}" title="${t.titulo}">✅ ${t.titulo}</div>`);
            });
        }

        if (chkEntregas && (filtroCalendarioActual === 'todo' || filtroCalendarioActual === 'entregas')) {
            let entregasDia = memoriaEntregas.filter(e => e.fechaLimite === currentDateStr);
            entregasDia.forEach(e => {
                let colorClass = obtenerColorTipo(e.tipo);
                arraysEventosHTML.push(`<div class="cal-event ${colorClass}" title="${e.titulo}">🎯 ${e.titulo}</div>`);
            });
        }

        if (chkApuntes && (filtroCalendarioActual === 'todo' || filtroCalendarioActual === 'apuntes')) {
            let apuntesDia = memoriaApuntes.filter(a => a.fecha === currentDateStr);
            apuntesDia.forEach(a => {
                let colorClass = a.color || 'blue';
                arraysEventosHTML.push(`<div class="cal-event ${colorClass}" title="${a.titulo}">🗒️ ${a.titulo}</div>`);
            });
        }

        if(ordenInvertidoCalendario) arraysEventosHTML.reverse();

        const hoy = new Date();
        let isToday = (day === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear());
        let dateStyle = isToday ? 'background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;' : '';

        grid.innerHTML += `
            <div class="cal-cell" onclick="abrirModalSelectorUniversal()">
                <span class="cal-date" style="${dateStyle}">${day}</span>
                ${arraysEventosHTML.join('')}
            </div>
        `;
    }

    const totalCells = startDayIndex + totalDays;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
        const cellsToAdd = 7 - remainder;
        for (let i = 0; i < cellsToAdd; i++) {
            grid.innerHTML += `<div class="cal-cell" style="background: rgba(0,0,0,0.2); cursor: default;"></div>`;
        }
    }
}

// ==========================================
// 7. MODALES DE CREACIÓN Y SELECTOR DE EVENTOS
// ==========================================
window.abrirModalSelectorUniversal = function() { document.getElementById('modal-selector-universal').style.display = 'flex'; }
window.cerrarModalSelectorUniversal = function() { document.getElementById('modal-selector-universal').style.display = 'none'; }
window.seleccionarTipoEventoUniversal = function(tipo) {
    cerrarModalSelectorUniversal();
    if(tipo === 'asignatura') abrirModalAsignatura();
    if(tipo === 'tarea') abrirModal();
    if(tipo === 'entrega') abrirModalEntrega();
    if(tipo === 'apunte') abrirModalApunte();
}

window.abrirModal = function() { document.getElementById('modal-nueva-tarea').style.display = 'flex'; }
window.cerrarModal = function() { document.getElementById('modal-nueva-tarea').style.display = 'none'; document.getElementById('input-tarea-titulo').value = ''; document.getElementById('input-tarea-fecha').value = ''; }
window.guardarNuevaTarea = async function() {
    const titulo = document.getElementById('input-tarea-titulo').value.trim();
    if (!titulo) return alert("Escribe un título.");
    const nuevaTarea = { titulo: titulo, texto: titulo, estado: "PENDIENTE", fechaLimite: document.getElementById('input-tarea-fecha').value || null };
    try {
        await fetch(API_URL_TAREAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaTarea) });
        cerrarModal(); cargarTareasMySQL(); mostrarToast("Tarea creada", "info");
    } catch (e) { alert("Error al guardar tarea."); }
};

window.abrirModalAsignatura = function() { document.getElementById('modal-nueva-asignatura').style.display = 'flex'; }
window.cerrarModalAsignatura = function() {
    document.getElementById('modal-nueva-asignatura').style.display = 'none';
    ['nombre', 'profesor', 'tag1', 'tag2', 'imagen', 'archivo-local'].forEach(id => { const el = document.getElementById(`input-asig-${id}`); if(el) el.value = ''; });
}
window.guardarNuevaAsignatura = async function() {
    const nombre = document.getElementById('input-asig-nombre').value.trim();
    if (!nombre) return alert("Falta el nombre.");
    const nuevaAsig = {
        nombre: nombre, profesor: document.getElementById('input-asig-profesor').value.trim(), progreso: 0,
        tag1: document.getElementById('input-asig-tag1').value.trim(), tag2: document.getElementById('input-asig-tag2').value.trim(), urlImagen: document.getElementById('input-asig-imagen').value.trim()
    };
    try {
        await fetch(API_URL_ASIGNATURAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaAsig) });
        cerrarModalAsignatura(); cargarAsignaturasMySQL(); mostrarToast("Asignatura guardada", "info");
    } catch (e) { alert("Error BBDD Asignaturas."); }
}

window.abrirModalEntrega = function() { document.getElementById('modal-nueva-entrega').style.display = 'flex'; }
window.cerrarModalEntrega = function() {
    document.getElementById('modal-nueva-entrega').style.display = 'none';
    document.getElementById('input-entrega-titulo').value = ''; document.getElementById('input-entrega-fecha').value = '';
}
window.guardarNuevaEntrega = async function() {
    const titulo = document.getElementById('input-entrega-titulo').value.trim();
    if (!titulo) return alert("Escribe un título.");
    const nueva = {
        titulo: titulo, tipo: document.getElementById('input-entrega-tipo').value, estado: document.getElementById('input-entrega-estado').value, fechaLimite: document.getElementById('input-entrega-fecha').value || null
    };
    try {
        await fetch(API_URL_ENTREGAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nueva) });
        cerrarModalEntrega(); cargarEntregasMySQL(); mostrarToast("Entrega registrada", "info");
    } catch (e) { alert("Error al guardar entrega."); }
}

window.abrirModalApunte = function() {
    document.getElementById('input-apunte-fecha').value = formatoInputDate(new Date());
    document.getElementById('modal-nuevo-apunte').style.display = 'flex';
}
window.cerrarModalApunte = function() {
    document.getElementById('modal-nuevo-apunte').style.display = 'none';
    document.getElementById('input-apunte-titulo').value = '';
    document.getElementById('input-apunte-asignatura').value = '';
}
window.guardarNuevoApunte = async function() {
    const titulo = document.getElementById('input-apunte-titulo').value.trim();
    if (!titulo) return alert("Escribe un título (tema) para el apunte.");

    const nuevo = {
        titulo: titulo,
        asignatura: document.getElementById('input-apunte-asignatura').value.trim(),
        color: document.getElementById('input-apunte-color').value,
        fecha: document.getElementById('input-apunte-fecha').value || formatoInputDate(new Date())
    };
    try {
        await fetch(API_URL_APUNTES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevo) });
        cerrarModalApunte(); cargarApuntesMySQL(); mostrarToast("Apunte guardado en la semana", "info");
    } catch (e) { alert("Error al guardar apunte en BBDD."); }
}

// ==========================================
// 8. LÓGICA WIDGET PERSONAL
// ==========================================
window.editarPerfil = function(campo, nombreLegible) {
    const spanElemento = document.getElementById(`perfil-${campo}`);
    if(!spanElemento) return;
    const valorActual = spanElemento.innerText;
    const nuevoValor = prompt(`Introduce el nuevo valor para [${nombreLegible}]:`, valorActual);
    if (nuevoValor !== null && nuevoValor.trim() !== "") {
        const limpio = nuevoValor.trim();
        spanElemento.innerText = limpio;
        // Garantiza que la clave exacta usada para leer sea la misma usada para guardar
        localStorage.setItem(`academic_os_perfil_${campo}`, limpio);
        mostrarToast(`Perfil actualizado: ${nombreLegible}`, "info");
    }
}
function inicializarPerfilLocalStorage() {
    // Array exacto de las claves que coinciden con los IDs del HTML
    const camposPerfil = ['programa', 'nombre', 'id', 'grupo', 'opcion'];

    camposPerfil.forEach(campo => {
        const guardado = localStorage.getItem(`academic_os_perfil_${campo}`);
        const spanElemento = document.getElementById(`perfil-${campo}`);
        if (guardado && spanElemento) {
            spanElemento.innerText = guardado;
        }
    });
}

// ==========================================
// 10. MOTOR DE NOTAS RÁPIDAS (DRAG & DROP)
// ==========================================
let notasRapidas = [];
let dragNotaIndex = -1;

function inicializarNotasRapidas() {
    const guardado = localStorage.getItem('academic_os_notas_rapidas');
    if (guardado) {
        notasRapidas = JSON.parse(guardado);
    } else {
        notasRapidas = [
            { id: 'n1', text: 'Revisar documentación de Spring' },
            { id: 'n2', text: 'Organizar el repositorio de GitHub' },
            { id: 'n3', text: 'Repasar patrones de diseño' },
            { id: 'n4', text: 'Descargar instalador de Docker' }
        ];
    }
    dibujarNotasRapidas();
}

function guardarNotasRapidas() {
    localStorage.setItem('academic_os_notas_rapidas', JSON.stringify(notasRapidas));
    dibujarNotasRapidas();
}

window.agregarNotaRapida = function() {
    const text = prompt("Escribe tu nueva nota rápida:");
    if (text && text.trim() !== "") {
        notasRapidas.push({ id: 'n' + Date.now(), text: text.trim() });
        guardarNotasRapidas();
    }
}

window.editarNotaRapida = function(id) {
    const nota = notasRapidas.find(n => n.id === id);
    if (!nota) return;
    const nuevo = prompt("Modificar nota:", nota.text);
    if (nuevo !== null && nuevo.trim() !== "") {
        nota.text = nuevo.trim();
        guardarNotasRapidas();
    }
}

window.borrarNotaRapida = function(id) {
    if (confirm("¿Seguro que quieres borrar esta nota?")) {
        notasRapidas = notasRapidas.filter(n => n.id !== id);
        guardarNotasRapidas();
    }
}

window.dragStartNota = function(event, index) {
    dragNotaIndex = index;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
}

window.dragEndNota = function(event) {
    event.target.classList.remove('dragging');
    dragNotaIndex = -1;
}

window.dragOverNota = function(event) {
    event.preventDefault();
}

window.dropNota = function(index) {
    if (dragNotaIndex === -1 || dragNotaIndex === index) return;
    const notaMovida = notasRapidas.splice(dragNotaIndex, 1)[0];
    notasRapidas.splice(index, 0, notaMovida);
    guardarNotasRapidas();
}

function dibujarNotasRapidas() {
    const lista = document.getElementById('lista-notas-rapidas');
    if (!lista) return;
    lista.innerHTML = '';

    notasRapidas.forEach((nota, index) => {
        const li = document.createElement('li');
        li.className = 'nota-rapida-item';
        li.draggable = true;
        li.ondragstart = (e) => dragStartNota(e, index);
        li.ondragend = (e) => dragEndNota(e);
        li.ondragover = (e) => dragOverNota(e);
        li.ondrop = () => dropNota(index);

        li.innerHTML = `
            <div class="nota-text">▸ ${nota.text}</div>
            <div class="nota-actions">
                <button class="btn-nota-action" onclick="editarNotaRapida('${nota.id}')" title="Editar">✏️</button>
                <button class="btn-nota-action delete" onclick="borrarNotaRapida('${nota.id}')" title="Borrar">🗑️</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// ==========================================
// 11. TIMER POMODORO CON SONIDOS Y NEBULOSA
// ==========================================
window.cambiarSonido = function(nombre, url, icono, themeClass) {
    document.getElementById('current-sound-tag').innerText = icono + ' ' + nombre;
    toggleMenu('menu-sonidos');

    const audio = document.getElementById('bg-audio');
    if(audio) {
        if(url) {
            audio.src = url;
            audio.play().catch(e => mostrarToast("Haz clic en la página para habilitar el sonido.", "info"));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    const widget = document.getElementById('timer-widget');
    if(widget) {
        widget.classList.remove('theme-silencio', 'theme-lluvia', 'theme-bosque', 'theme-fuego', 'theme-olas');
        if(themeClass) widget.classList.add(themeClass);
    }
}

// ==========================================
// 12. MOTOR DE TEMAS RECIENTES
// ==========================================
let temasRecientes = [];

function inicializarTemas() {
    const guardado = localStorage.getItem('academic_os_temas');
    if (guardado) {
        temasRecientes = JSON.parse(guardado);
    } else {
        temasRecientes = [
            { id: 'tm1', icono: '📘', titulo: 'Mapeo de Ficheros', subtitulo: 'Acceso a Datos' },
            { id: 'tm2', icono: '💻', titulo: 'Controladores REST', subtitulo: 'Programación' },
            { id: 'tm3', icono: '🧠', titulo: 'Hilos de Ejecución', subtitulo: 'Procesos' },
            { id: 'tm4', icono: '📐', titulo: 'Layouts Avanzados', subtitulo: 'Desarrollo de Interfaces' },
            { id: 'tm5', icono: '📱', titulo: 'Fragmentos en Android', subtitulo: 'Multimedia' }
        ];
    }
    dibujarTemas();
}

function guardarTemas() {
    localStorage.setItem('academic_os_temas', JSON.stringify(temasRecientes));
    dibujarTemas();
}

window.agregarTema = function() {
    const titulo = prompt("Título del nuevo tema:");
    if (!titulo || titulo.trim() === "") return;
    const subtitulo = prompt("Asignatura o categoría (opcional):", "General") || "General";

    temasRecientes.push({
        id: 'tm' + Date.now(),
        icono: '📄',
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim()
    });
    guardarTemas();
    mostrarToast("Nuevo tema añadido", "info");
}

function dibujarTemas() {
    const lista = document.getElementById('lista-temas-recientes');
    if (!lista) return;
    lista.innerHTML = '';
    temasRecientes.forEach(t => {
        lista.innerHTML += `<li onclick="mostrarToast('Abriendo tema: ${t.titulo}')"><strong>${t.icono} ${t.titulo}</strong><span class="sub">${t.subtitulo}</span></li>`;
    });
}


// ==========================================
// 13. INTERFAZ Y RELOJ
// ==========================================
function iniciarInterfaz() {
    document.querySelectorAll('.toolbar-left:not(#tabs-tareas):not(#tabs-asignaturas):not(#tabs-entregas):not(#tabs-apuntes):not(#tabs-calendario)').forEach(toolbar => {
        const tabs = toolbar.querySelectorAll('.t-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => { tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active'); });
        });
    });

    const reloj = document.getElementById('analog-clock');
    if (reloj) for (let i = 0; i < 12; i++) { const t = document.createElement('div'); t.className = 'clock-tick'; t.style.transform = `translateX(-50%) rotate(${i * 30}deg)`; reloj.appendChild(t); }
}

function actualizarReloj() {
    const elReloj = document.getElementById('digital-clock'), elFecha = document.getElementById('date-display'), hHand = document.getElementById('hour-hand'), mHand = document.getElementById('min-hand'), sHand = document.getElementById('sec-hand');
    const d = new Date();
    if (elReloj && elFecha) { elReloj.innerText = d.toLocaleTimeString('es-ES', { hour12: false }); elFecha.innerText = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''); }
    if (hHand && mHand && sHand) { const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds(); sHand.style.transform = `translateX(-50%) rotate(${s * 6}deg)`; mHand.style.transform = `translateX(-50%) rotate(${(m * 6) + (s * 0.1)}deg)`; hHand.style.transform = `translateX(-50%) rotate(${(h * 30) + (m * 0.5)}deg)`; }
}

let timerInterval = null, tiempoRestante = 25 * 60, duracionActual = 25 * 60;
function actualizarPomodoro() {
    const m = Math.floor(tiempoRestante / 60), s = tiempoRestante % 60;
    document.getElementById('pomodoro-time').innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

window.cambiarModoTimer = function(minutos, boton) {
    document.querySelectorAll('.timer-buttons .t-btn').forEach(b => b.classList.remove('active')); boton.classList.add('active');
    clearInterval(timerInterval); timerInterval = null; document.getElementById('btn-start-timer').innerText = "iniciar";
    duracionActual = minutos * 60; tiempoRestante = duracionActual; actualizarPomodoro();
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarInterfaz(); actualizarReloj(); setInterval(actualizarReloj, 1000);

    inicializarPerfilLocalStorage();
    inicializarObjetivos();
    inicializarNotasRapidas();
    inicializarTemas();

    cargarTareasMySQL();
    cargarAsignaturasMySQL();
    cargarEntregasMySQL();
    cargarApuntesMySQL();

    const btnStart = document.getElementById('btn-start-timer'), btnReset = document.getElementById('btn-reset-timer');
    if(btnStart && btnReset) {
        btnStart.addEventListener('click', () => {
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; btnStart.innerText = "iniciar"; }
            else {
                btnStart.innerText = "pausa";
                timerInterval = setInterval(() => {
                    if (tiempoRestante > 0) { tiempoRestante--; actualizarPomodoro(); }
                    else { clearInterval(timerInterval); timerInterval = null; btnStart.innerText = "iniciar"; mostrarToast("¡Bloque completado!", "info"); }
                }, 1000);
            }
        });
        btnReset.addEventListener('click', () => {
            clearInterval(timerInterval); timerInterval = null;
            tiempoRestante = duracionActual; actualizarPomodoro(); btnStart.innerText = "iniciar";
        });
    }
});