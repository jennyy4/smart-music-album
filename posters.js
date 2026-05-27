/* ================================================================
   posters.js – Mazo 3D apilado
   Navegar: rueda / flechas / drag → la carta delantera "cae" hacia
   delante y se recoloca al fondo del mazo (bucle infinito)
   Click en carta delantera → lightbox con descarga
   ================================================================ */

(() => {
    const deck = document.getElementById('pst-deck');
    const lb = document.getElementById('pst-lightbox');
    const lbImg = document.getElementById('pst-lb-img');
    const lbDl = document.getElementById('pst-lb-download');
    const lbClose = document.getElementById('pst-lb-close');
    const lbPrev = document.getElementById('pst-lb-prev');
    const lbNext = document.getElementById('pst-lb-next');

    // Orden lógico del mazo (índices de las cartas en el DOM)
    const cards = Array.from(document.querySelectorAll('.pst-card'));
    if (!cards.length) return;

    // Cola circular: el primer elemento es la carta delantera
    let queue = cards.map((_, i) => i);   // [0,1,2,3,4,...]
    let lbOpen = false;
    let busy = false;   // bloquea durante la animación de caída

    /* ──────────────────────────────────────
       Asigna data-pos según la posición en la cola
    ────────────────────────────────────── */
    const VISIBLE = 4;   // cuántas cartas se ven en el mazo

    const render = () => {
        cards.forEach(card => card.removeAttribute('data-pos'));
        queue.forEach((idx, i) => {
            const card = cards[idx];
            if (i < VISIBLE) {
                card.setAttribute('data-pos', i);
                card.style.zIndex = 10 - i;
            } else {
                card.setAttribute('data-pos', 'hidden');
                card.style.zIndex = 0;
            }
        });
    };

    render();

    /* ──────────────────────────────────────
       Animación de caída + recoloca al fondo
    ────────────────────────────────────── */
    const fallAndNext = () => {
        if (busy || lbOpen) return;
        busy = true;

        const frontIdx = queue[0];
        const frontCard = cards[frontIdx];

        // Guarda el transform de partida para la animación keyframe
        const startTransform = getComputedStyle(frontCard).transform;
        frontCard.style.setProperty('--fall-start', startTransform !== 'none' ? startTransform : 'translateZ(0px)');

        // Quita la transición suave para que la animación CSS tome el control
        frontCard.style.transition = 'none';
        frontCard.classList.add('is-falling');

        frontCard.addEventListener('animationend', () => {
            frontCard.classList.remove('is-falling');
            frontCard.style.transition = '';

            // Mueve la carta al final de la cola
            queue.push(queue.shift());
            render();

            // Pequeño delay para que la nueva carta entre con su transición
            setTimeout(() => { busy = false; }, 80);
        }, { once: true });
    };

    /* ──────────────────────────────────────
       Controles
    ────────────────────────────────────── */

    // Rueda del ratón (solo hacia abajo)
    let wheelCooldown = false;
    window.addEventListener('wheel', (e) => {
        if (lbOpen || wheelCooldown) return;
        if (e.deltaY > 0) {
            wheelCooldown = true;
            setTimeout(() => wheelCooldown = false, 700);
            fallAndNext();
        }
    }, { passive: true });

    // Teclado (solo flecha abajo)
    document.addEventListener('keydown', (e) => {
        if (lbOpen) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lbGoTo(lbCurrentIndex - 1);
            if (e.key === 'ArrowRight') lbGoTo(lbCurrentIndex + 1);
            return;
        }
        if (e.key === 'ArrowDown') fallAndNext();
    });

    // Drag vertical (solo de arriba a abajo con el ratón)
    let dragStartY = null;
    const SWIPE_THR = 60;

    window.addEventListener('mousedown', (e) => { if (!lbOpen) dragStartY = e.clientY; });
    window.addEventListener('mouseup', (e) => {
        if (dragStartY === null || lbOpen) return;
        const diff = e.clientY - dragStartY;
        dragStartY = null;
        if (diff > SWIPE_THR) fallAndNext();
    });

    // Touch (solo swipe de arriba a abajo)
    window.addEventListener('touchstart', (e) => { if (!lbOpen) dragStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', (e) => {
        if (dragStartY === null || lbOpen) return;
        const diff = e.changedTouches[0].clientY - dragStartY;
        dragStartY = null;
        if (diff > SWIPE_THR) fallAndNext();
    });

    /* ──────────────────────────────────────
       Click en carta: si es la delantera → lightbox, si no → tráela al frente
    ────────────────────────────────────── */
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            if (lbOpen || busy) return;
            const pos = card.getAttribute('data-pos');
            if (pos === '0') {
                // Busca el índice original de la carta delantera
                openLightbox(queue[0]);
            } else if (pos !== null && pos !== 'hidden') {
                // Trae esa carta al frente reshuffleando la cola
                const posNum = parseInt(pos);
                for (let i = 0; i < posNum; i++) fallAndNext();
            }
        });
    });

    /* ──────────────────────────────────────
       Lightbox
    ────────────────────────────────────── */
    let lbCurrentIndex = 0;   // índice DOM de la carta mostrada

    const openLightbox = (domIndex) => {
        lbCurrentIndex = domIndex;
        const img = cards[domIndex].querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbDl.href = img.src;
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        lbOpen = true;
    };

    const closeLightbox = () => {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        lbOpen = false;
    };

    const lbGoTo = (domIndex) => {
        lbCurrentIndex = (domIndex + cards.length) % cards.length;
        const img = cards[lbCurrentIndex].querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbDl.href = img.src;
    };

    lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', () => lbGoTo(lbCurrentIndex - 1));
    if (lbNext) lbNext.addEventListener('click', () => lbGoTo(lbCurrentIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

})();
