(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        const restart = function () {
            window.clearInterval(timer);
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const value = Number(dot.getAttribute('data-hero-dot'));
                show(value);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        start();
    }

    const searchInput = document.querySelector('[data-search-input]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));

    const filterCards = function () {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const type = typeFilter ? typeFilter.value.trim() : '';
        const year = yearFilter ? yearFilter.value.trim() : '';

        cards.forEach(function (card) {
            const text = (card.getAttribute('data-text') || '').toLowerCase();
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const cardType = card.getAttribute('data-type') || '';
            const cardYear = card.getAttribute('data-year') || '';
            const matchedQuery = !query || text.includes(query) || title.includes(query);
            const matchedType = !type || cardType === type;
            const matchedYear = !year || cardYear.includes(year);

            card.classList.toggle('is-filter-hidden', !(matchedQuery && matchedType && matchedYear));
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }
})();
