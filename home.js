/* home.js – Carrusel con drag/swipe estilo Instagram */

(() => {
    const track = document.getElementById('cards-track');
    const cards = document.querySelectorAll('.sma-card');
    if (!cards.length) return;

    let activeIndex = 0;
    let currentX = 0;
    let targetX = 0;
    const ease = 0.08;

    // --- Drag state ---
    let dragStartX = null;
    let isDragging = false;
    const SWIPE_THRESHOLD = 50; // px mínimos para considerar swipe

    // ---------------------------------------------------
    // Centra una tarjeta concreta
    // ---------------------------------------------------
    const getTargetForIndex = (index) => {
        const card = cards[index];
        const vwCenter = window.innerWidth / 2;
        return vwCenter - (card.offsetLeft + card.offsetWidth / 2);
    };

    const setActive = (index) => {
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('is-active');
                card.style.transform = '';
            } else {
                card.classList.remove('is-active');
                card.style.transform = 'scale(0.85)';
            }
        });
    };

    const goTo = (index) => {
        activeIndex = Math.max(0, Math.min(cards.length - 1, index));
        targetX = getTargetForIndex(activeIndex);
        setActive(activeIndex);
    };

    // ---------------------------------------------------
    // LERP animation
    // ---------------------------------------------------
    const animate = () => {
        currentX += (targetX - currentX) * ease;
        track.style.transform = `translateX(${currentX}px)`;
        requestAnimationFrame(animate);
    };

    // ---------------------------------------------------
    // Mouse drag
    // ---------------------------------------------------
    window.addEventListener('mousedown', (e) => {
        dragStartX = e.clientX;
        isDragging = true;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        // Mueve el track en tiempo real mientras arrastras
        const diff = e.clientX - dragStartX;
        track.style.transform = `translateX(${currentX + diff}px)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = e.clientX - dragStartX;

        if (diff < -SWIPE_THRESHOLD) goTo(activeIndex + 1);      // swipe izquierda → siguiente
        else if (diff > SWIPE_THRESHOLD) goTo(activeIndex - 1);  // swipe derecha → anterior
        else goTo(activeIndex);                                   // sin cambio, vuelve al sitio
    });

    // ---------------------------------------------------
    // Touch (móvil)
    // ---------------------------------------------------
    window.addEventListener('touchstart', (e) => {
        dragStartX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        const diff = e.touches[0].clientX - dragStartX;
        track.style.transform = `translateX(${currentX + diff}px)`;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - dragStartX;

        if (diff < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
        else if (diff > SWIPE_THRESHOLD) goTo(activeIndex - 1);
        else goTo(activeIndex);
    });

    // ---------------------------------------------------
    // Tilt 3D y shine
    // ---------------------------------------------------
    const addTilt = (card) => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('is-active') || isDragging) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2, cy = rect.height / 2;
            const rotateX = ((cy - y) / cy) * 10;
            const rotateY = ((x - cx) / cx) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`;

            const bg = card.querySelector('.sma-card-bg');
            if (bg) {
                bg.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
                bg.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('is-active')) {
                card.style.transform = '';
            }
            const bg = card.querySelector('.sma-card-bg');
            if (bg) {
                bg.style.setProperty('--shine-x', '50%');
                bg.style.setProperty('--shine-y', '50%');
            }
        });
    };

    // Iniciar
    setTimeout(() => {
        goTo(0);
        currentX = getTargetForIndex(0);
        animate();
    }, 100);

    cards.forEach(addTilt);

    // Flechas del teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
        if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    });

    // Ruleta del ratón
    let wheelTimeout = null;
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0 || e.deltaX > 0) goTo(activeIndex + 1);
            else goTo(activeIndex - 1);
        }, 50);
    }, { passive: false });
})();