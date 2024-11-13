import { plantas } from './Data.js';

// Recuperamos el carrito del LocalStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let compraEnProceso = false;

// Función para validar tarjeta de crédito
function validarTarjeta(numeroTarjeta, fechaExp, codigo, titular) {
    if (!/^\d{16}$/.test(numeroTarjeta)) {
        return { valido: false, mensaje: 'Número de tarjeta inválido. Debe tener 16 dígitos.' };
    }

    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(fechaExp)) {
        return { valido: false, mensaje: 'Fecha de expiración inválida. Use formato MM/AA.' };
    }

    if (!/^\d{3}$/.test(codigo)) {
        return { valido: false, mensaje: 'Código de seguridad inválido. Debe tener 3 dígitos.' };
    }

    if (titular.trim().length < 5) {
        return { valido: false, mensaje: 'Nombre del titular inválido.' };
    }

    return { valido: true, mensaje: 'Tarjeta válida' };
}

// Mostrar productos en el carrito
function mostrarCarrito() {
    const tablaCarrito = document.getElementById('tablaCarrito').getElementsByTagName('tbody')[0];
    tablaCarrito.innerHTML = ''; 
    let totalCompra = 0;

    carrito.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>
                <img src="${producto.imagen}" alt="${producto.nombreProducto}" 
                     class="producto-imagen" style="width: 100px; height: auto;">
            </td>
            <td>${producto.nombreProducto}</td>
            <td>
                <input type="number" value="${producto.cantidad}" min="1" max="20" 
                    class="cantidadProducto" data-index="${index}"
                    ${compraEnProceso ? 'disabled' : ''}>
            </td>
            <td>$${producto.precio.toLocaleString()}</td>
            <td>$${(producto.precio * producto.cantidad).toLocaleString()}</td>
            <td>
                <button class="eliminarProducto" data-index="${index}"
                    ${compraEnProceso ? 'disabled' : ''}>
                    🗑️
                </button>
            </td>
        `;
        tablaCarrito.appendChild(fila);
        totalCompra += producto.precio * producto.cantidad;
    });

    document.getElementById('totalCompra').textContent = totalCompra.toLocaleString();
    const totalConEnvio = totalCompra + 15000;
    document.getElementById('totalConEnvio').textContent = totalConEnvio.toLocaleString();
    document.getElementById('cantidadCarrito').textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Procesar la compra
function procesarCompra(formData) {
    return new Promise((resolve, reject) => {
        const clienteData = JSON.parse(localStorage.getItem('clienteData'));
        const presupuestoMaximo = clienteData ? clienteData.totalConCostoDomicilio : null;

        const tiempoEspera = Math.random() * (3000 - 2000) + 2000;

        setTimeout(() => {
            const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
            if (cantidadTotal > 20) {
                reject('No puede comprar más de 20 productos en total.');
                return;
            }

            const totalCompra = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            if (presupuestoMaximo && totalCompra > presupuestoMaximo) {
                reject(`El total de la compra excede el límite de presupuesto de $${presupuestoMaximo.toLocaleString()}.`);
                return;
            }

            const validacionTarjeta = validarTarjeta(
                formData.get('numeroTarjeta').replace(/\s/g, ''),
                formData.get('fechaExpiracion'),
                formData.get('codigoSeguridad'),
                formData.get('titular')
            );

            if (!validacionTarjeta.valido) {
                reject(validacionTarjeta.mensaje);
                return;
            }

            resolve('Pago realizado con éxito');
        }, tiempoEspera);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    document.getElementById('formPago').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (compraEnProceso) {
            alert('Ya hay una compra en proceso. Por favor espere.');
            return;
        }

        if (carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        compraEnProceso = true;
        const mensajeCompra = document.getElementById('mensajeCompra');
        mensajeCompra.textContent = 'Procesando compra...';
        
        try {
            const formData = new FormData(event.target);
            const resultado = await procesarCompra(formData);
            mensajeCompra.textContent = resultado;

            localStorage.removeItem('carrito');
            carrito = [];
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        } catch (error) {
            mensajeCompra.textContent = `Error: ${error}`;
        } finally {
            compraEnProceso = false;
        }
    });
});
