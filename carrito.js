(function () {

    const productos = [
        {
            nombre: "Cerillas Pulso",
            precio: "10€",
            imagen: "img/cerillas 1 web.webp"
        },
        {
            nombre: "Cerillas Vestigios",
            precio: "10€",
            imagen: "img/cerillas 2 web.webp"
        },
        {
            nombre: "Cuaderno Pulso",
            precio: "15€",
            imagen: "img/cuaderno 1 web.webp"
        },
        {
            nombre: "Cuaderno Vestigios",
            precio: "15€",
            imagen: "img/cuaderno 2 web.webp"
        },
        {
            nombre: "Lanyard Pulso",
            precio: "7€",
            imagen: "img/Lanyard 1 web.webp"
        },
        {
            nombre: "Lanyard Vestigios",
            precio: "7€",
            imagen: "img/Lanyard 2 web.webp"
        },
        {
            nombre: "Magnet Pulso",
            precio: "5€",
            imagen: "img/magnet 1 web.webp"
        },
        {
            nombre: "Magnet Vestigios",
            precio: "5€",
            imagen: "img/magnet 2 web.webp"
        },
        {
            nombre: "Vela Vestigios/Pulso",
            precio: "25€",
            imagen: "img/vela web.webp"
        }
    ];

    const STORAGE_KEY = "sma-carrito-edicion-limitada";
    const ENVIO_GRATIS = 60;

    const bagCount = document.getElementById("bag-count");
    const bagProducts = document.getElementById("bag-products");
    const bagSubtotal = document.getElementById("bag-subtotal");
    const bagShipping = document.getElementById("bag-shipping");
    const bagProgressFill = document.getElementById("bag-progress-fill");
    const bagKitList = document.getElementById("bag-kit-list");

    let carrito = cargarCarrito();

    function cargarCarrito() {
        const guardado = localStorage.getItem(STORAGE_KEY);

        if (!guardado) {
            return {};
        }

        try {
            return JSON.parse(guardado);
        } catch (error) {
            return {};
        }
    }

    function guardarCarrito() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    }

    function precioANumero(precioTexto) {
        return Number(
            String(precioTexto)
                .replace("€", "")
                .replace(",", ".")
                .trim()
        ) || 0;
    }

    function formatearPrecio(numero) {
        if (Number.isInteger(numero)) {
            return numero + "€";
        }

        return numero.toFixed(2).replace(".", ",") + "€";
    }

    function cantidadTotal() {
        return Object.values(carrito).reduce(function (total, cantidad) {
            return total + cantidad;
        }, 0);
    }

    function subtotal() {
        return Object.keys(carrito).reduce(function (total, indice) {
            const producto = productos[indice];
            const cantidad = carrito[indice];

            return total + precioANumero(producto.precio) * cantidad;
        }, 0);
    }

    function añadirProducto(indice) {
        carrito[indice] = (carrito[indice] || 0) + 1;
        guardarCarrito();
        render();
    }

    function quitarProducto(indice) {
        if (!carrito[indice]) return;

        carrito[indice]--;

        if (carrito[indice] <= 0) {
            delete carrito[indice];
        }

        guardarCarrito();
        render();
    }

    function renderHeader() {
        const totalCantidad = cantidadTotal();
        const totalPrecio = subtotal();

        bagCount.textContent = totalCantidad;
        bagSubtotal.textContent = formatearPrecio(totalPrecio);

        const restante = Math.max(ENVIO_GRATIS - totalPrecio, 0);
        const progreso = Math.min((totalPrecio / ENVIO_GRATIS) * 100, 100);

        bagProgressFill.style.width = progreso + "%";

        if (restante > 0) {
            bagShipping.textContent = "Spend another " + formatearPrecio(restante) + " to receive FREE SHIPPING";
        } else {
            bagShipping.textContent = "You have FREE SHIPPING";
        }
    }

    function renderProductos() {
        const indices = Object.keys(carrito);

        bagProducts.innerHTML = "";

        if (indices.length === 0) {
            const empty = document.createElement("p");
            empty.classList.add("bag-empty");
            empty.textContent = "Tu carrito está vacío";

            bagProducts.appendChild(empty);
            return;
        }

        indices.forEach(function (indice) {
            const producto = productos[indice];
            const cantidad = carrito[indice];
            const precioTotalProducto = precioANumero(producto.precio) * cantidad;

            const fila = document.createElement("article");
            fila.classList.add("bag-product");

            fila.innerHTML = `
                <img class="bag-product-img" src="${producto.imagen}" alt="${producto.nombre}">

                <h2 class="bag-product-name">${producto.nombre}</h2>

                <div class="bag-product-controls">
                    <button type="button" data-action="remove" data-index="${indice}">-</button>
                    <span>${cantidad}</span>
                    <button type="button" data-action="add" data-index="${indice}">+</button>
                </div>

                <p class="bag-product-price">${formatearPrecio(precioTotalProducto)}</p>
            `;

            bagProducts.appendChild(fila);
        });
    }

    function renderKit() {
        bagKitList.innerHTML = "";

        const indicesCarrito = Object.keys(carrito);

        let sugerencias = productos
            .map(function (_, index) {
                return index;
            })
            .filter(function (index) {
                return !indicesCarrito.includes(String(index));
            })
            .slice(0, 2);

        if (sugerencias.length < 2) {
            sugerencias = productos
                .map(function (_, index) {
                    return index;
                })
                .slice(0, 2);
        }

        sugerencias.forEach(function (indice) {
            const producto = productos[indice];

            const item = document.createElement("article");
            item.classList.add("bag-kit-item");

            item.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <p class="bag-kit-name">${producto.nombre}</p>
                <p class="bag-kit-price">${producto.precio}</p>
                <button class="bag-kit-add" type="button" data-action="kit-add" data-index="${indice}">
                    Add +
                </button>
            `;

            bagKitList.appendChild(item);
        });
    }

    function render() {
        renderHeader();
        renderProductos();
        renderKit();
    }

    bagProducts.addEventListener("click", function (e) {
        const boton = e.target.closest("button");

        if (!boton) return;

        const accion = boton.dataset.action;
        const indice = boton.dataset.index;

        if (accion === "add") {
            añadirProducto(indice);
        }

        if (accion === "remove") {
            quitarProducto(indice);
        }
    });

    bagKitList.addEventListener("click", function (e) {
        const boton = e.target.closest("button");

        if (!boton) return;

        const indice = boton.dataset.index;

        // Flash visual antes de que el render rehaga el DOM
        boton.style.color = "#95e5e3";
        boton.style.transition = "color 0.15s ease";

        setTimeout(function () {
            añadirProducto(indice);
        }, 300);
    });

    render();

})();
