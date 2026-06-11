// Variable global para almacenar los datos una vez cargados
let datosAsignaturas = [];

// Cargar los datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/asignaturas.json')
        .then(response => response.json())
        .then(data => {
            datosAsignaturas = data;
            cargarVista('Inicio'); // Vista por defecto
        })
        .catch(error => console.error("Error cargando asignaturas:", error));
});

function cargarVista(vista) {
    const contenedor = document.getElementById('content');
    
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
                    <p><strong>Profesor:</strong>${asig.profesor}</p>
                    <a href="${asig.meet}" target="_blank" class="btn-meet">Unirse a Meet</a>
                </div>
            `;
        })
    }
        
    else if (vista === 'horario') {
        contenedor.innerHTML = `
            <h1>Horario de Clases</h1>
            <p>Aquí construiremos la tabla dinámica cruzando los días del JSON.</p>
        `;
    }
    
    else if (vista === 'tests') {
        contenedor.innerHTML = `
            <h1>Zona de Prácticas (Exámenes Test)</h1>
            <p>Aquí cargaremos el motor de preguntas que desarrollaremos a continuación.</p>
        `;
    }
}