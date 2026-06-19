(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const localSearchForms = document.querySelectorAll('[data-search-form]');
  localSearchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input');
      const keyword = input ? input.value.trim() : '';
      const url = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
      window.location.href = url;
    });
  });

  const filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    const keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    const yearSelect = filterRoot.querySelector('[data-filter-year]');
    const typeSelect = filterRoot.querySelector('[data-filter-type]');
    const cards = Array.from(filterRoot.querySelectorAll('[data-movie-card]'));
    const noResult = filterRoot.querySelector('[data-no-result]');
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q');

    if (initialKeyword && keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilters() {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const yearOk = !year || normalize(card.dataset.year) === year;
        const typeOk = !type || normalize(card.dataset.type) === type;
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        const visible = yearOk && typeOk && keywordOk;
        card.classList.toggle('hidden-by-filter', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle('visible', visibleCount === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
