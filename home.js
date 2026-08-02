/* home.js – Carrusel con drag/swipe estilo Instagram */

(() => {
    const track = document.getElementById('cards-track');
    const cards = document.querySelectorAll('.sma-card');
    if (!cards.length) return;

    let activeIndex = 0;
    let currentX = 0;
    let targetX = 0;
    const SWIPE_THRESHOLD = 40;

    // Transición "a tirones": un salto rápido y directo de una tarjeta a otra,
    // sin planeo largo ni deceleración suave.
    const SNAP_TRANSITION = 'transform 180ms cubic-bezier(0.3, 0.7, 0.4, 1)';
    const ANIM_DURATION = 190; // ms que tarda la animación en completarse (debe casar con SNAP_TRANSITION)

    // Bloqueo: mientras se anima no se acepta otro swipe
    let busy = false;

    const isMobile = () => window.matchMedia('(pointer: coarse)').matches;

    const getTargetForIndex = (index) => {
        const card = cards[index];
        const vwCenter = window.innerWidth / 2;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        return vwCenter - cardCenter;
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

    // Mueve el track a "x". Si instant=true, no hay transición (salto sin animar).
    const moveTrackTo = (x, instant = false) => {
        if (instant) {
            track.style.transition = 'none';
            track.style.transform = `translateX(${x}px)`;
            // Fuerza reflow para que el siguiente cambio de transición se aplique bien
            void track.offsetHeight;
        } else {
            track.style.transition = SNAP_TRANSITION;
            // Fuerza reflow por si veníamos de "transition: none" (p.ej. tras un drag)
            void track.offsetHeight;
            track.style.transform = `translateX(${x}px)`;
        }
        currentX = x;
    };

    const goTo = (index) => {
        activeIndex = Math.max(0, Math.min(cards.length - 1, index));
        targetX = getTargetForIndex(activeIndex);
        setActive(activeIndex);
        moveTrackTo(targetX);

        // Bloquea hasta que la animación termina
        busy = true;
        setTimeout(() => { busy = false; }, ANIM_DURATION);
    };

    // Mouse drag (solo escritorio)
    let dragStartX = null;
    let isDragging = false;

    window.addEventListener('mousedown', (e) => {
        if (isMobile()) return;
        dragStartX = e.clientX;
        isDragging = true;
        // Mientras arrastras, sin transición: la tarjeta sigue al ratón al instante
        track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || isMobile()) return;
        const diff = e.clientX - dragStartX;
        track.style.transform = `translateX(${currentX + diff}px)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging || isMobile()) return;
        isDragging = false;
        const diff = e.clientX - dragStartX;
        if (diff < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
        else if (diff > SWIPE_THRESHOLD) goTo(activeIndex - 1);
        else goTo(activeIndex);
    });

    // Touch (móvil): un swipe = exactamente un paso. Sin seguimiento en vivo del dedo
    // (nada de arrastre "fluido"): la tarjeta salta de golpe, rápido, cuando sueltas el dedo.
    // Se bloquea hasta que termina la animación de la tarjeta anterior.
    let touchStartX = null;
    let touchStartY = null;
    let touchDragging = false; // true solo cuando confirmamos que es un swipe horizontal

    window.addEventListener('touchstart', (e) => {
        if (busy) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchDragging = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (touchStartX === null || busy) return;

        const diffX = e.touches[0].clientX - touchStartX;
        const diffY = e.touches[0].clientY - touchStartY;

        if (!touchDragging) {
            // Decidimos la dirección del gesto una sola vez, al principio del movimiento
            if (Math.abs(diffX) < Math.abs(diffY)) return; // es un gesto vertical, lo ignoramos
            touchDragging = true;
        }

        // Solo evitamos que el navegador haga scroll/zoom nativo mientras el dedo se mueve;
        // no tocamos el transform aquí, así no hay arrastre visual pegado al dedo.
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (touchStartX === null || busy) {
            touchStartX = null;
            touchStartY = null;
            touchDragging = false;
            return;
        }

        const wasDragging = touchDragging;
        const diffX = e.changedTouches[0].clientX - touchStartX;

        touchStartX = null;
        touchStartY = null;
        touchDragging = false;

        if (!wasDragging) return; // era un gesto vertical o un simple toque, no navegamos

        if (diffX < -SWIPE_THRESHOLD) {
            goTo(activeIndex + 1);
        } else if (diffX > SWIPE_THRESHOLD) {
            goTo(activeIndex - 1);
        }
        // si no llega al umbral, no pasa nada: como no había arrastre visual, la tarjeta
        // ya estaba en su sitio y no hace falta "recolocarla"
    });

    // Tilt 3D y shine (solo escritorio)
    const addTilt = (card) => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('is-active') || isDragging || isMobile()) return;
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
    card.style.transform = '';
        });
    };

    // Arranque: coloca la primera tarjeta activa sin animar el salto inicial
    setTimeout(() => {
        activeIndex = 0;
        setActive(0);
        moveTrackTo(getTargetForIndex(0), true);
        busy = false;
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
