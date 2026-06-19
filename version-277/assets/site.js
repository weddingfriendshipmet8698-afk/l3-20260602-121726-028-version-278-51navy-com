(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const root = scope.closest('main') || document;
        const searchInput = scope.querySelector('[data-search-input]');
        const filters = Array.from(scope.querySelectorAll('[data-filter]'));
        const cards = Array.from(root.querySelectorAll('.js-movie-card'));
        const empty = root.querySelector('[data-empty-state]');

        function applyFilters() {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = (card.getAttribute('data-search') || '').toLowerCase();
                let matched = !keyword || searchText.indexOf(keyword) !== -1;

                filters.forEach(function (filter) {
                    const key = filter.getAttribute('data-filter');
                    const value = filter.value;
                    if (value && card.getAttribute('data-' + key) !== value) {
                        matched = false;
                    }
                });

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', applyFilters);
        });
    });
})();
