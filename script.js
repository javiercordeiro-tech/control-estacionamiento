// ==========================================================
// CONFIGURACIÓN DE LA BASE DE DATOS (GOOGLE APPS SCRIPT URL)
// ==========================================================

// ¡Tu URL única del servidor de Apps Script ya está integrada aquí!
const WEB_APP_URL = 'https://script.google.com/a/macros/envases.mx/s/AKfycbyisgyk7BLP6riHZNPBcGBNnIMbOsfEI3TxUMY9nrub0TgyTXp9czxTI-mAwwThArcG/exec';


// ==========================================================
// FUNCIONES DE CONTROL DE PERSISTENCIA Y RENDERIZADO
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // 1. Cargamos el estado desde la base de datos al iniciar
    cargarEstadoEstacionamiento(); 
});


/**
 * 1. Lee los datos de Google Sheets y actualiza la interfaz.
 */
async function cargarEstadoEstacionamiento() {
    try {
        console.log("Cargando datos desde la base de datos...");
        const response = await fetch(WEB_APP_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const datosLugares = await response.json();
        
        // 2. Aplicamos el estado y nombre a cada lugar en el HTML
        datosLugares.forEach(data => {
            const lugarElement = document.getElementById(data.id); // L-A1, L-B3, etc.
            if (lugarElement) {
                aplicarEstadoLugar(lugarElement, data.estado, data.nombre);
            }
        });

        // 3. Una vez cargado, adjuntamos los listeners para clics
        adjuntarListenersDeClic();

    } catch (error) {
        console.error("Error al cargar el estado del estacionamiento:", error);
        alert("ERROR: No se pudo conectar a la base de datos. Revisa la URL de la App Web o los permisos.");
    }
}


/**
 * 2. Aplica las clases CSS y el nombre a un elemento HTML de lugar.
 */
function aplicarEstadoLugar(lugarElement, estado, nombre) {
    const spanNombre = lugarElement.querySelector('.nombre-asignado');

    // Limpiamos las clases de estado anteriores
    lugarElement.classList.remove('disponible', 'ocupado');

    if (estado === 'OCUPADO') {
        lugarElement.classList.add('ocupado');
        if (spanNombre) {
            spanNombre.textContent = nombre.toUpperCase() || "";
        }
    } else {
        lugarElement.classList.add('disponible');
        if (spanNombre) {
            spanNombre.textContent = "";
        }
    }
}


/**
 * 3. Adjunta la lógica de clic para actualizar tanto la interfaz como la base de datos.
 */
function adjuntarListenersDeClic() {
    const lugares = document.querySelectorAll('.lugar');

    lugares.forEach(lugar => {
        lugar.addEventListener('click', async function() {
            const lugarId = lugar.id; // L-A1, L-B3
            const numeroLugar = lugarId.split('-')[1]; // A1, B3

            let nuevoEstado;
            let nuevoNombre = "";

            // --- Lógica de Interfaz y Obtención de Datos ---
            if (lugar.classList.contains('ocupado')) {
                // De OCUPADO a DISPONIBLE (Liberar)
                nuevoEstado = 'DISPONIBLE';
                // Pedimos confirmación antes de liberar
                if (!confirm(`¿Estás seguro de que quieres liberar el lugar ${numeroLugar}?`)) {
                    return;
                }

            } else {
                // De DISPONIBLE a OCUPADO (Asignar)
                nuevoEstado = 'OCUPADO';
                const nombreInput = prompt(`Asignar el lugar ${numeroLugar}.\nIntroduce el nombre de la persona:`);

                if (!nombreInput || nombreInput.trim() === "") {
                    console.log(`Asignación cancelada para el lugar ${numeroLugar}.`);
                    return; 
                }
                nuevoNombre = nombreInput.trim().toUpperCase();
            }

            // --- Actualización de la Base de Datos (POST) ---
            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify({
                        id: lugarId,
                        estado: nuevoEstado,
                        nombre: nuevoNombre
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    console.log(data.message);
                    // Si la BD fue exitosa, actualizamos la interfaz inmediatamente
                    aplicarEstadoLugar(lugar, nuevoEstado, nuevoNombre); 
                    
                } else {
                    alert('Error al guardar en la BD: ' + data.message);
                    console.error('Error de BD:', data.message);
                }

            } catch (error) {
                console.error("Error al actualizar el estado:", error);
                alert("ERROR DE CONEXIÓN: No se pudo actualizar el estado en Google Sheets.");
            }
        });
    });
}


// ==========================================================
// FUNCIONES GLOBALES PARA BÚSQUEDA (Se mantienen)
// ==========================================================

// Maneja la pulsación de la tecla Enter en el campo de búsqueda
function manejarEnter(event) {
    if (event.keyCode === 13) {
        buscarLugar();
        event.preventDefault(); 
        return false;
    }
    return true;
}

// Busca la persona en la interfaz. Notar que la interfaz refleja el estado de la BD.
function buscarLugar() {
    const input = document.getElementById('inputBusqueda');
    const filtro = input.value.toUpperCase().trim();
    const resultado = document.getElementById('resultadoBusqueda');
    const lugares = document.querySelectorAll('.lugar.ocupado'); 

    let encontrado = false;
    let infoLugar = '';

    // Límite de 7 caracteres para búsqueda, como solicitaste anteriormente
    if (filtro.length < 7) { 
        resultado.className = 'mensaje';
        resultado.innerHTML = 'Ingrese al menos 7 caracteres para buscar.';
        return;
    }

    lugares.forEach(lugar => {
        const spanElement = lugar.querySelector('.nombre-asignado');
        const textoLugar = spanElement ? spanElement.textContent.toUpperCase() : ''; 
        
        if (textoLugar.includes(filtro)) {
            const numeroLugar = lugar.id.split('-')[1];
            infoLugar = `✅ ¡VERIFICADO! Asignado a ${textoLugar.trim()} en el **Lugar ${numeroLugar}**.`;
            encontrado = true;
        }
    });

    if (encontrado) {
        resultado.className = 'mensaje encontrado';
        resultado.innerHTML = infoLugar;
    } else {
        resultado.className = 'mensaje no-encontrado';
        resultado.innerHTML = `❌ No se encontró coincidencia para "${filtro}" o el lugar está disponible.`;
    }
}
