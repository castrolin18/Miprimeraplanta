import { plantas } from './Data.js';

let productos = []; // Aquí se almacenan todos los productos que cargan desde la DB.
let paginaActual = 0;
const elementosPorPagina = 15;
let cargando = false; // Evita múltiples cargas mientras se hace scroll.
let finDeProductos = false; // Marca si se han cargado todos los productos

// Función para cargar productos simulando una base de datos
function cargarProductosDesdeDB() {
    if (cargando || finDeProductos) return; // Evita cargar mientras ya se está cargando o si ya estamos al final.
    cargando = true;

    // Calcular el índice de inicio y fin para la carga de productos
    const indiceInicio = paginaActual * elementosPorPagina;
    const indiceFin = indiceInicio + elementosPorPagina;

    // Crear un array con los productos para esa página
    const nuevosProductos = [];
    for (let i = indiceInicio; i < indiceFin; i++) {
        if (plantas[i]) {
            nuevosProductos.push(plantas[i]);
        } else {
            finDeProductos = true; // Si no hay más productos, marcamos el fin
            break;
        }
    }

    if (nuevosProductos.length > 0) {
        productos = [...productos, ...nuevosProductos];
        mostrarProductos(nuevosProductos);
        paginaActual++; // Avanzar a la siguiente página
    } else if (finDeProductos) {
        mostrarMensaje("No hay más productos para cargar.");
    }

    cargando = false;
}

// Mostrar los productos en la interfaz
function mostrarProductos(listaProductos) {
    const contenedorProductos = document.getElementById('listaProductos');
  

    if (listaProductos.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.textContent = "No hay productos que coincidan con los filtros.";
        contenedorProductos.appendChild(mensaje);
        return;
    }

    listaProductos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjetas');
        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombreProducto}">
            <p><strong>${producto.nombreProducto}</strong></p>
            <p>Precio: $${producto.precio}</p>
            <p>Categoría: ${producto.selectorCategoria}</p>
            <button class="verDetalleButton" data-id="${producto.idProducto}">Ver Detalle</button>
        `;
        contenedorProductos.appendChild(tarjeta);
    });

    // Agregar el evento 'click' para ver detalles de producto
    const botonesVerDetalle = document.querySelectorAll('.verDetalleButton');
    botonesVerDetalle.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const idProducto = e.target.getAttribute('data-id');
            verDetalle(idProducto);
        });
    });
}

// Mensaje para mostrar cuando no hay más productos
function mostrarMensaje(mensaje) {
    // Verificar si ya existe el mensaje para no duplicarlo
    const mensajeExistente = document.getElementById('mensajeFin');
    if (!mensajeExistente) {
        const contenedorProductos = document.getElementById('listaProductos');
        const mensajeElemento = document.createElement('h1');
        mensajeElemento.id = 'mensajeFin';
        mensajeElemento.textContent = mensaje;
        mensajeElemento.style.textAlign = 'center';
        contenedorProductos.appendChild(mensajeElemento);
    }
}

// Detecta cuando el usuario llega al final del contenedor de productos
document.getElementById('listaProductos').addEventListener('scroll', () => {
    const listaProductos = document.getElementById('listaProductos');
    const scrollFinal = Math.ceil(listaProductos.scrollTop + listaProductos.clientHeight) >= listaProductos.scrollHeight;
    if (scrollFinal && !cargando && !finDeProductos) {
        cargarProductosDesdeDB();
    }
});

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDesdeDB();
    actualizarIconoCarrito(); // Muestra la cantidad actual al cargar la página
});

// Muestra los detalles de un producto
function verDetalle(idProducto) {
    const producto = productos.find(prod => prod.idProducto === idProducto);
    if (producto) {
        const detalleSeccion = document.getElementById('detalleProducto');
        detalleSeccion.innerHTML = `
            <h3>${producto.nombreProducto}</h3>
            <img src="${producto.imagen}" alt="${producto.nombreProducto}">
            <p>Precio: $${producto.precio}</p>
            <p>Categoría: ${producto.selectorCategoria}</p>
            <p>Proveedor: ${producto.proveedor}</p>
            <input type="number" id="cantidadProducto" min="1" placeholder="Cantidad">
            <button id="agregarCarritoButton">Agregar al carrito</button>
        `;

        // Asocia el evento 'click' programáticamente
        document.getElementById('agregarCarritoButton').addEventListener('click', () => {
            agregarAlCarrito(idProducto);
        });
    }
}

// Agregar producto al carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function agregarAlCarrito(idProducto) {
    const cantidad = parseInt(document.getElementById('cantidadProducto').value);
    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Por favor, ingrese una cantidad válida.');
        return;
    }

    const producto = productos.find(prod => prod.idProducto === idProducto);
    if (producto) {
        carrito.push({ ...producto, cantidad });
        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert('Producto agregado al carrito.');
        actualizarIconoCarrito();
    }
}

function actualizarIconoCarrito() {
    const cantidadCarrito = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    document.getElementById('cantidadCarrito').textContent = cantidadCarrito;
}

// Filtrar productos
function filtrarProductos() {
    const categoria = document.getElementById('categoriaFilter').value.toLowerCase();
    const filtroLibre = document.getElementById('filtroLibre').value.toLowerCase();

    // Filtrar los productos según la categoría y el texto de búsqueda
    const productosFiltrados = productos.filter(producto => {
        const cumpleCategoria = categoria ? producto.selectorCategoria.toLowerCase() === categoria : true;
        const cumpleFiltroLibre = filtroLibre ? 
            producto.nombreProducto.toLowerCase().includes(filtroLibre) || 
            producto.precio.toString().includes(filtroLibre) : 
            true;
        return cumpleCategoria && cumpleFiltroLibre;
    });

    // Mostrar los productos filtrados
    mostrarProductos(productosFiltrados);
}

// Limpiar filtros
function limpiarFiltros() {
    // Restablecer filtros
    document.getElementById('categoriaFilter').value = '';
    document.getElementById('filtroLibre').value = '';

    // Mostrar todos los productos sin filtro
    mostrarProductos(productos);
}

// Eventos para los botones de filtrar y limpiar filtros
document.getElementById('filtrarButton').addEventListener('click', filtrarProductos);
document.getElementById('limpiarButton').addEventListener('click', limpiarFiltros);
