(function () {
  var body = document.body;
  var root = body.getAttribute("data-root") || "";
  var header = document.querySelector("[data-site-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuToggle && mobilePanel && header) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      header.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q'], input[type='search']");
      var query = input ? input.value.trim() : "";
      var target = root + "search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === current);
      });
    }

    function playHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        showHero(Number(thumb.getAttribute("data-hero-thumb") || "0"));
        playHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", playHero);
    playHero();
  }

  document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
    var scope = panel.closest("section") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !type || card.getAttribute("data-type") === type;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-filter-hidden", !(matchKeyword && matchType && matchYear));
      });
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage && window.MOVIE_INDEX) {
    var form = searchPage.querySelector("[data-local-search-form]");
    var queryInput = searchPage.querySelector("[data-search-query]");
    var categorySelect = searchPage.querySelector("[data-search-category]");
    var results = searchPage.querySelector("[data-search-results]");
    var fallback = document.querySelector("[data-search-fallback]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">" +
        "<a class=\"poster-frame\" href=\"" + root + movie.link + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
        "<img src=\"" + root + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-glow\"></span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<div class=\"movie-card-meta\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
        "<h3><a href=\"" + root + movie.link + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>'"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          "\"": "&quot;"
        }[char];
      });
    }

    function runSearch() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var category = categorySelect ? categorySelect.value : "";
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var categoryMatch = !category || movie.category === category;
        return queryMatch && categoryMatch;
      }).slice(0, 96);

      if (fallback) {
        fallback.style.display = query || category ? "none" : "";
      }

      if (!results) {
        return;
      }

      if (!matched.length) {
        results.innerHTML = "<div class=\"search-empty\">没有匹配到相关影片，可以尝试更换关键词。</div>";
        return;
      }

      results.innerHTML = "<div class=\"movie-grid\">" + matched.map(cardTemplate).join("") + "</div>";
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });
    }
    [queryInput, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runSearch);
        control.addEventListener("change", runSearch);
      }
    });
    runSearch();
  }
})();
