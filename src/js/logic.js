// Función para limpiar el formulario
function limpiarFormulario() {
    const formulario = document.getElementById("registroFormulario");
    formulario.reset();
}

// Función para validar y registrar el cliente
function validarRegistro(event) {
    event.preventDefault(); 

    const nombreUsuario = document.getElementById('nombreUsuario').value.trim();
    const presupuesto = document.getElementById('presupuesto').value;
    const cantidadArticulos = document.getElementById('cantidadArticulos').value;
    const direccion = document.getElementById('direccion').value.trim();
    const entrega = document.querySelector('input[name="entrega"]:checked'); 

    if (nombreUsuario === '' || nombreUsuario.length > 20) {
        alert('El nombre es obligatorio y no debe superar los 20 caracteres.');
        return;
    }

    if (cantidadArticulos === '' || isNaN(cantidadArticulos) || Number(cantidadArticulos) < 0 || Number(cantidadArticulos) > 20) {
        alert('La cantidad de artículos debe ser un número positivo y no debe superar 20.');
        return;
    }

    if (direccion === '') {
        alert('La dirección es obligatoria.');
        return;
    }

    if (!entrega) {
        alert('Debe seleccionar un tipo de entrega.');
        return;
    }

    const costoDomicilio = 15000;
    const totalConCostoDomicilio = (entrega.value === 'domicilio') ? (parseFloat(presupuesto) + costoDomicilio) : parseFloat(presupuesto);

    const clienteData = {
        nombreUsuario: nombreUsuario,
        presupuesto: parseFloat(presupuesto),
        cantidadArticulos: Number(cantidadArticulos),
        direccion: direccion,
        entrega: entrega.value,
        totalConCostoDomicilio: totalConCostoDomicilio
    };

    localStorage.setItem('clienteData', JSON.stringify(clienteData));
    window.location.href = '/views/ListarProductos.html';
}
