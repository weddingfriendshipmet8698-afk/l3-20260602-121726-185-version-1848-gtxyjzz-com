(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  var navSearch = document.querySelector('.nav-search');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
      if (navSearch) {
        navSearch.classList.toggle('is-open');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilter(value) {
    var keyword = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', keyword !== '' && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
      applyFilter(q);
    }
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();
