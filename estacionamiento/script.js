// ==========================================================
// 1. MANEJO DE EVENTOS DE CLIC (Asignar / Liberar Lugar)
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    const lugares = document.querySelectorAll('.lugar');

    lugares.forEach(lugar => {
        lugar.addEventListener('click', function() {
            const spanNombre = lugar.querySelector('.nombre-asignado');
            const numeroLugar = lugar.id.split('-')[1];

            // Lógica para liberar un lugar (De OCUPADO a DISPONIBLE)
            if (lugar.classList.contains('ocupado')) {
                
                // 1. Quitar el estado de ocupado y poner disponible
                lugar.classList.remove('ocupado');
                lugar.classList.add('disponible');
                
                // 2. Borrar el contenido del nombre
                if (spanNombre) {
                    spanNombre.textContent = "";
                }

                // Aseguramos que la Placa/ID también se borre si se usó el método anterior
                lugar.removeAttribute('data-placa'); 

                // Opcional: Limpiar el resultado de la búsqueda después de un cambio
                document.getElementById('resultadoBusqueda').textContent = '';

                console.log(`Lugar ${numeroLugar} LIBERADO.`);
                
            } 
            
            // Lógica para asignar un lugar (De DISPONIBLE a OCUPADO)
            else if (lugar.classList.contains('disponible')) {
                
                const nuevoNombre = prompt(`Asignar el lugar ${numeroLugar}.\nIntroduce el nombre de la persona:`);

                if (nuevoNombre && nuevoNombre.trim() !== "") {
                    // El prompt original no pedía placa, mantenemos la lógica simple aquí
                    if (spanNombre) {
                        spanNombre.textContent = nuevoNombre.trim().toUpperCase();
                    }
                    
                    lugar.classList.remove('disponible');
                    lugar.classList.add('ocupado');

                    console.log(`Lugar ${numeroLugar} ASIGNADO a: ${nuevoNombre.trim().toUpperCase()}`);
                
                } else {
                    console.log(`Asignación cancelada para el lugar ${numeroLugar}.`);
                }
            }
        });
    });
});


// ==========================================================
// 2. FUNCIONES GLOBALES PARA BÚSQUEDA (Llamadas desde el HTML)
// ==========================================================

// Función para manejar la tecla ENTER en el campo de búsqueda
function manejarEnter(event) {
    // Código de la tecla Enter es 13
    if (event.keyCode === 13) {
        // Ejecuta la función de búsqueda
        buscarLugar();
        // Previene el comportamiento predeterminado del Enter (evita recarga de página)
        event.preventDefault(); 
        return false;
    }
    return true;
}

// Función para buscar y verificar si el nombre/placa es correcto
function buscarLugar() {
    const input = document.getElementById('inputBusqueda');
    const filtro = input.value.toUpperCase().trim();
    const resultado = document.getElementById('resultadoBusqueda');
    const lugares = document.querySelectorAll('.lugar.ocupado'); 

    let encontrado = false;
    let infoLugar = '';

    // Modificamos el límite de caracteres requeridos para empezar la búsqueda
    if (filtro.length < 7) { 
        resultado.className = 'mensaje';
        // Ajustamos el mensaje para reflejar el nuevo requisito
        resultado.innerHTML = 'Ingrese al menos 7 caracteres para buscar los apellidos.'; 
        return;
    
    }

    // Iterar solo en los lugares que están actualmente marcados como ocupados
    lugares.forEach(lugar => {
        // Obtenemos el texto completo del nombre
        const spanElement = lugar.querySelector('.nombre-asignado');
        // Usamos textContent para asegurarnos de que el texto esté ahí, y lo convertimos a mayúsculas.
        const textoLugar = spanElement ? spanElement.textContent.toUpperCase() : ''; 
        
        // Verificamos si el texto del lugar contiene lo que se busca
        if (textoLugar.includes(filtro)) {
            const numeroLugar = lugar.id.split('-')[1];
            infoLugar = `✅ ¡VERIFICADO! Asignado a ${textoLugar.trim()} en el **Lugar ${numeroLugar}**.`;
            encontrado = true;
            
            // NO usamos 'return' dentro de forEach para salir de todo el bucle, usamos una bandera
        }
    });

    // Mostrar el resultado de la búsqueda
    if (encontrado) {
        resultado.className = 'mensaje encontrado';
        resultado.innerHTML = infoLugar;
    } else {
        resultado.className = 'mensaje no-encontrado';
        resultado.innerHTML = `❌ No se encontró coincidencia para "${filtro}" o el lugar está disponible.`;
    }
}