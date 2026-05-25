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

    const carrusel = document.getElementById("el-carrusel");
    const nombre = document.getElementById("el-nombre");
    const precio = document.getElementById("el-precio");
    const dots = document.getElementById("el-dots");

    const item1 = document.getElementById("el-item-1");
    const item2 = document.getElementById("el-item-2");
    const item3 = document.getElementById("el-item-3");
    const item4 = document.getElementById("el-item-4");

    const items = [item1, item2, item3, item4];

    const cartButton = document.getElementById("el-cart-button");
    const cartPanel = document.getElementById("el-cart-panel");
    const cartClose = document.getElementById("el-cart-close");
    const cartCount = document.getElementById("el-cart-count");
    const cartItems = document.getElementById("el-cart-items");
    const cartTotal = document.getElementById("el-cart-total");
    const toast = document.getElementById("el-toast");

    // Precargar todas las imágenes
    const totalImagenes = productos.length;
    let imagenesCargadas = 0;

    carrusel.style.opacity = "0";

    productos.forEach(function(producto) {
        const img = new Image();
        img.src = producto.imagen;
        img.onload = img.onerror = function() {
            imagenesCargadas++;
            if (imagenesCargadas === totalImagenes) {
                carrusel.style.transition = "opacity 0.4s ease";
                carrusel.style.opacity = "1";
            }
        };
    });

    let roles = {
        prev: item1,
        center: item2,
        next: item3,
        reserve: item4
    };

    let indiceActivo = 0;
    let animando = false;

    const duracionAnimacion = 780;
    const distanciaSwipe = 50;

    let inicioX = 0;
    let arrastrando = false;
    let seHaArrastrado = false;
    let bloquearClickHasta = 0;
    let bloqueandoRueda = false;

    let carrito = cargarCarrito();

    function envolverIndice(indice) {
        if (indice < 0) {
            return productos.length - 1;
        }

        if (indice > productos.length - 1) {
            return 0;
        }

        return indice;
    }

    function ponerImagen(item, indiceProducto) {
        const img = item.querySelector("img");
        const producto = productos[indiceProducto];

        img.src = producto.imagen;
        img.alt = producto.nombre;

        item.dataset.productIndex = indiceProducto;
    }

    function ponerSlot(item, slot, sinTransicion) {
        if (sinTransicion) {
            item.classList.add("sin-transicion");
            item.dataset.slot = slot;

            item.offsetHeight;

            item.classList.remove("sin-transicion");
        } else {
            item.dataset.slot = slot;
        }
    }

    function actualizarInfo() {
        const producto = productos[indiceActivo];

        nombre.textContent = producto.nombre;
        precio.textContent = producto.precio;

        const botonesDots = document.querySelectorAll(".el-dot");

        botonesDots.forEach(function (dot, index) {
            dot.classList.toggle("activo", index === indiceActivo);
        });
    }

    function crearDots() {
        dots.innerHTML = "";

        productos.forEach(function (_, index) {
            const dot = document.createElement("button");
            dot.classList.add("el-dot");

            if (index === indiceActivo) {
                dot.classList.add("activo");
            }

            dot.addEventListener("click", function () {
                saltarA(index);
            });

            dots.appendChild(dot);
        });
    }

    function iniciarCarrusel() {
        const indicePrevio = envolverIndice(indiceActivo - 1);
        const indiceSiguiente = envolverIndice(indiceActivo + 1);
        const indiceReserva = envolverIndice(indiceActivo + 2);

        ponerImagen(roles.prev, indicePrevio);
        ponerImagen(roles.center, indiceActivo);
        ponerImagen(roles.next, indiceSiguiente);
        ponerImagen(roles.reserve, indiceReserva);

        ponerSlot(roles.prev, "prev", true);
        ponerSlot(roles.center, "center", true);
        ponerSlot(roles.next, "next", true);
        ponerSlot(roles.reserve, "hidden-right", true);

        actualizarInfo();
    }

    function siguiente() {
        if (animando) return;

        animando = true;

        const oldPrev = roles.prev;
        const oldCenter = roles.center;
        const oldNext = roles.next;
        const oldReserve = roles.reserve;

        const nuevoIndiceActivo = envolverIndice(indiceActivo + 1);
        const nuevoIndiceSiguiente = envolverIndice(nuevoIndiceActivo + 1);

        ponerImagen(oldReserve, nuevoIndiceSiguiente);
        ponerSlot(oldReserve, "hidden-right", true);

        oldReserve.offsetHeight;

        ponerSlot(oldPrev, "hidden-left", false);
        ponerSlot(oldCenter, "prev", false);
        ponerSlot(oldNext, "center", false);
        ponerSlot(oldReserve, "next", false);

        indiceActivo = nuevoIndiceActivo;

        setTimeout(function () {
            roles = {
                prev: oldCenter,
                center: oldNext,
                next: oldReserve,
                reserve: oldPrev
            };

            actualizarInfo();
            animando = false;
        }, duracionAnimacion);
    }

    function anterior() {
        if (animando) return;

        animando = true;

        const oldPrev = roles.prev;
        const oldCenter = roles.center;
        const oldNext = roles.next;
        const oldReserve = roles.reserve;

        const nuevoIndiceActivo = envolverIndice(indiceActivo - 1);
        const nuevoIndicePrevio = envolverIndice(nuevoIndiceActivo - 1);

        ponerImagen(oldReserve, nuevoIndicePrevio);
        ponerSlot(oldReserve, "hidden-left", true);

        oldReserve.offsetHeight;

        ponerSlot(oldNext, "hidden-right", false);
        ponerSlot(oldCenter, "next", false);
        ponerSlot(oldPrev, "center", false);
        ponerSlot(oldReserve, "prev", false);

        indiceActivo = nuevoIndiceActivo;

        setTimeout(function () {
            roles = {
                prev: oldReserve,
                center: oldPrev,
                next: oldCenter,
                reserve: oldNext
            };

            actualizarInfo();
            animando = false;
        }, duracionAnimacion);
    }

    function saltarA(indice) {
        if (animando) return;

        indiceActivo = envolverIndice(indice);
        iniciarCarrusel();
    }

    /* =========================================================
       CARRITO
       ========================================================= */

    function cargarCarrito() {
        const guardado = localStorage.getItem("sma-carrito-edicion-limitada");

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
        localStorage.setItem("sma-carrito-edicion-limitada", JSON.stringify(carrito));
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

    function precioTotal() {
        return Object.keys(carrito).reduce(function (total, indice) {
            const producto = productos[indice];
            const cantidad = carrito[indice];

            return total + precioANumero(producto.precio) * cantidad;
        }, 0);
    }

    function renderCarrito() {
        const indices = Object.keys(carrito);

        cartCount.textContent = cantidadTotal();
        cartTotal.textContent = formatearPrecio(precioTotal());

        if (indices.length === 0) {
            cartItems.innerHTML = '<p class="el-cart-empty">Tu carrito está vacío</p>';
            return;
        }

        cartItems.innerHTML = "";

        indices.forEach(function (indice) {
            const producto = productos[indice];
            const cantidad = carrito[indice];

            const fila = document.createElement("div");
            fila.classList.add("el-cart-row");

            fila.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="el-cart-row-info">
                    <p class="el-cart-row-name">${producto.nombre}</p>
                    <p class="el-cart-row-meta">${producto.precio} · x${cantidad}</p>
                </div>
                <button class="el-cart-remove" type="button" data-remove="${indice}" aria-label="Quitar producto">×</button>
            `;

            cartItems.appendChild(fila);
        });
    }

    function cerrarCarrito() {
        cartPanel.classList.remove("is-open");
        cartPanel.setAttribute("aria-hidden", "true");
    }

    function mostrarToast(texto) {
        toast.textContent = texto;
        toast.classList.add("is-visible");

        clearTimeout(mostrarToast.timeout);

        mostrarToast.timeout = setTimeout(function () {
            toast.classList.remove("is-visible");
        }, 1400);
    }

    function añadirAlCarrito(indiceProducto) {
        if (indiceProducto === undefined || indiceProducto === null) return;

        carrito[indiceProducto] = (carrito[indiceProducto] || 0) + 1;

        guardarCarrito();
        renderCarrito();

        mostrarToast(productos[indiceProducto].nombre + " añadido");
    }

    function quitarDelCarrito(indiceProducto) {
        if (!carrito[indiceProducto]) return;

        carrito[indiceProducto]--;

        if (carrito[indiceProducto] <= 0) {
            delete carrito[indiceProducto];
        }

        guardarCarrito();
        renderCarrito();
    }

    cartButton.addEventListener("click", function () {
        cartPanel.classList.toggle("is-open");

        const abierto = cartPanel.classList.contains("is-open");
        cartPanel.setAttribute("aria-hidden", abierto ? "false" : "true");
    });

    cartClose.addEventListener("click", cerrarCarrito);

    cartItems.addEventListener("click", function (e) {
        const boton = e.target.closest("[data-remove]");

        if (!boton) return;

        quitarDelCarrito(boton.dataset.remove);
    });

    document.addEventListener("click", function (e) {
        const clickDentroCarrito = e.target.closest(".el-cart-panel");
        const clickBotonCarrito = e.target.closest(".el-cart-button");

        if (!clickDentroCarrito && !clickBotonCarrito) {
            cerrarCarrito();
        }
    });

    /* Click en cada imagen visible */
    items.forEach(function (item) {
        item.addEventListener("click", function () {
            const ahora = Date.now();

            if (ahora < bloquearClickHasta) return;
            if (item.dataset.slot === "hidden-left" || item.dataset.slot === "hidden-right") return;

            const indiceProducto = Number(item.dataset.productIndex);

            añadirAlCarrito(indiceProducto);
        });
    });

    /* =========================================================
       CONTROLES DEL CARRUSEL
       ========================================================= */

    /* Ruleta del ratón */
    window.addEventListener("wheel", function (e) {
        if (e.target.closest(".el-cart-panel")) return;
        if (bloqueandoRueda || animando) return;

        bloqueandoRueda = true;

        if (e.deltaY > 0) {
            siguiente();
        } else {
            anterior();
        }

        setTimeout(function () {
            bloqueandoRueda = false;
        }, duracionAnimacion);

    }, { passive: true });

    /* Arrastrar con ratón */
    carrusel.addEventListener("mousedown", function (e) {
        inicioX = e.clientX;
        arrastrando = true;
        seHaArrastrado = false;
    });

    window.addEventListener("mousemove", function (e) {
        if (!arrastrando) return;

        const diferencia = e.clientX - inicioX;

        if (Math.abs(diferencia) > 8) {
            seHaArrastrado = true;
        }
    });

    window.addEventListener("mouseup", function (e) {
        if (!arrastrando) return;

        arrastrando = false;

        const diferencia = e.clientX - inicioX;

        if (seHaArrastrado) {
            bloquearClickHasta = Date.now() + 120;
        }

        if (diferencia < -distanciaSwipe) {
            siguiente();
        } else if (diferencia > distanciaSwipe) {
            anterior();
        }
    });

    /* Swipe en móvil */
    carrusel.addEventListener("touchstart", function (e) {
        inicioX = e.touches[0].clientX;
        seHaArrastrado = false;
    }, { passive: true });

    carrusel.addEventListener("touchmove", function (e) {
        const diferencia = e.touches[0].clientX - inicioX;

        if (Math.abs(diferencia) > 8) {
            seHaArrastrado = true;
        }
    }, { passive: true });

    carrusel.addEventListener("touchend", function (e) {
        const diferencia = e.changedTouches[0].clientX - inicioX;

        if (seHaArrastrado) {
            bloquearClickHasta = Date.now() + 160;
        }

        if (diferencia < -distanciaSwipe) {
            siguiente();
        } else if (diferencia > distanciaSwipe) {
            anterior();
        }
    });

    /* Flechas del teclado */
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            cerrarCarrito();
        }

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            siguiente();
        }

        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            anterior();
        }
    });

    crearDots();
    iniciarCarrusel();
    renderCarrito();

})();
