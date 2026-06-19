(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setText(node, value) {
    node.textContent = value || "";
  }

  function initNavigation() {
    var toggle = $(".nav-toggle");
    var mobileNav = $(".mobile-nav");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = $("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = $all(".hero-slide", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var prev = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var inputs = $all(".site-search-input");

    inputs.forEach(function (input) {
      var box = input.parentElement ? $(".site-search-results", input.parentElement) : null;

      if (!box || typeof SITE_MOVIES === "undefined") {
        return;
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        box.innerHTML = "";

        if (!keyword) {
          box.classList.remove("is-open");
          return;
        }

        var results = SITE_MOVIES.filter(function (movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 10);

        results.forEach(function (movie) {
          var item = document.createElement("a");
          item.className = "search-result-item";
          item.href = movie.href;

          var img = document.createElement("img");
          img.src = movie.image;
          img.alt = movie.title;
          img.loading = "lazy";

          var text = document.createElement("div");
          var title = document.createElement("strong");
          var meta = document.createElement("span");

          setText(title, movie.title);
          setText(meta, movie.region + " · " + movie.year + " · " + movie.type);
          text.appendChild(title);
          text.appendChild(meta);
          item.appendChild(img);
          item.appendChild(text);
          box.appendChild(item);
        });

        box.classList.toggle("is-open", results.length > 0);
      });

      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function initLocalFilters() {
    var inputs = $all(".page-filter-input");

    inputs.forEach(function (input) {
      var root = document;
      var cards = $all(".filterable-grid [data-search]", root);

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initSearch();
    initLocalFilters();
  });
})();
