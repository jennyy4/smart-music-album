/* ================================================================
   ganleria.js – Carrusel vertical (mouse up/down) + lightbox
   ================================================================ */

(() => {
    const stage = document.getElementById('alb-stage');
    const cards = Array.from(document.querySelectorAll('.alb-card'));
    const lb = document.getElementById('alb-lightbox');
    const lbImg = document.getElementById('alb-lb-img');
    const lbDl = document.getElementById('alb-lb-download');
    const lbPrev = document.getElementById('alb-lb-prev');
    const lbNext = document.getElementById('alb-lb-next');
    const lbClose = document.getElementById('alb-lb-close');

    if (!cards.length) return;

    /* ----------------------------------------------------------
       LAYOUT: apilamos las tarjetas verticalmente en el stage
    ---------------------------------------------------------- */
    const CARD_H = 480;   // debe coincidir con --card-h
    const CARD_GAP = 32;    // separación entre tarjetas
    const STEP = CARD_H + CARD_GAP;

    // Posicionamos las tarjetas centradas horizontalmente,
    // distribuidas en Y dentro del stage (position:fixed inset:0)
    const layoutCards = () => {
        cards.forEach((card, i) => {
            card.style.left = '50%';
            card.style.marginLeft = `calc(-1 * var(--card-w) / 2)`;
            card.style.top = `${i * STEP}px`;
        });
    };
    layoutCards();

    /* ----------------------------------------------------------
       CARRUSEL – índice activo, desplazamiento suave
    ---------------------------------------------------------- */
    let activeIndex = 0;
    let currentY = 0;
    let targetY = 0;
    const ease = 0.18;
    let lbOpen = false;

    // Calcula el translateY para que la tarjeta `index` quede centrada en pantalla
    const getTargetY = (index) => {
        const vhCenter = window.innerHeight / 2;
        const cardCenterY = index * STEP + CARD_H / 2;
        return vhCenter - cardCenterY;
    };

    const setActive = (index) => {
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('is-active');
            } else {
                card.classList.remove('is-active');
            }
        });
    };

    const goTo = (index) => {
        activeIndex = Math.max(0, Math.min(cards.length - 1, index));
        targetY = getTargetY(activeIndex);
        setActive(activeIndex);
    };

    // LERP loop
    const animate = () => {
        currentY += (targetY - currentY) * ease;
        stage.style.transform = `translateY(${currentY}px)`;
        requestAnimationFrame(animate);
    };

    /* ----------------------------------------------------------
       CONTROL: rueda del ratón + drag vertical
    ---------------------------------------------------------- */

    // Rueda del ratón
    let wheelCooldown = false;
    window.addEventListener('wheel', (e) => {
        if (lbOpen || wheelCooldown) return;
        wheelCooldown = true;
        setTimeout(() => wheelCooldown = false, 350);

        if (e.deltaY > 0) goTo(activeIndex + 1);
        else goTo(activeIndex - 1);
    }, { passive: true });

    // Drag vertical con ratón
    let dragStartY = null;
    let isDragging = false;
    const SWIPE_THR = 50;

    window.addEventListener('mousedown', (e) => {
        if (lbOpen) return;
        dragStartY = e.clientY;
        isDragging = true;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || lbOpen) return;
        const diff = e.clientY - dragStartY;
        stage.style.transform = `translateY(${currentY + diff}px)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = e.clientY - dragStartY;
        if (diff < -SWIPE_THR) goTo(activeIndex + 1);
        else if (diff > SWIPE_THR) goTo(activeIndex - 1);
        else goTo(activeIndex);
    });

    // Touch vertical
    window.addEventListener('touchstart', (e) => {
        if (lbOpen) return;
        dragStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (lbOpen) return;
        const diff = e.touches[0].clientY - dragStartY;
        stage.style.transform = `translateY(${currentY + diff}px)`;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (lbOpen) return;
        const diff = e.changedTouches[0].clientY - dragStartY;
        if (diff < -SWIPE_THR) goTo(activeIndex + 1);
        else if (diff > SWIPE_THR) goTo(activeIndex - 1);
        else goTo(activeIndex);
    });

    /* ----------------------------------------------------------
       LIGHTBOX
    ---------------------------------------------------------- */
    let lbIndex = 0;

    const openLightbox = (index) => {
        lbIndex = index;
        const img = cards[index].querySelector('img');
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

    const lbGoTo = (index) => {
        lbIndex = (index + cards.length) % cards.length;
        const img = cards[lbIndex].querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbDl.href = img.src;
        // sincroniza el carrusel con la imagen del lightbox
        goTo(lbIndex);
    };

    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            if (!card.classList.contains('is-active')) return;
            openLightbox(i);
        });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => lbGoTo(lbIndex - 1));
    lbNext.addEventListener('click', () => lbGoTo(lbIndex + 1));

    lb.addEventListener('click', (e) => {
        if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (lbOpen) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lbGoTo(lbIndex - 1);
            if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
            if (e.key === 'ArrowUp') lbGoTo(lbIndex - 1);
            if (e.key === 'ArrowDown') lbGoTo(lbIndex + 1);
        } else {
            if (e.key === 'ArrowUp') goTo(activeIndex - 1);
            if (e.key === 'ArrowDown') goTo(activeIndex + 1);
        }
    });

    /* ----------------------------------------------------------
       ARRANQUE
    ---------------------------------------------------------- */
    setTimeout(() => {
        goTo(0);
        currentY = getTargetY(0);
        animate();
    }, 100);

})();