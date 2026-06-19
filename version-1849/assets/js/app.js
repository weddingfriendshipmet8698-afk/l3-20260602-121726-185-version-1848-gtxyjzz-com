(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = all(".hero-slide");
        var dots = all(".hero-dot");
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = all(".filter-panel");
        panels.forEach(function (panel) {
            var section = panel.closest("section") || document;
            var cards = all(".movie-card", section);
            var grid = section.querySelector(".filter-grid");
            var input = panel.querySelector(".filter-input");
            var yearSelect = panel.querySelector(".filter-year");
            var categorySelect = panel.querySelector(".filter-category");
            if (!cards.length) {
                return;
            }
            function apply() {
                var q = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var category = categorySelect ? categorySelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matched = (!q || text.indexOf(q) !== -1) && (!year || cardYear === year) && (!category || cardCategory === category);
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (grid) {
                    grid.classList.toggle("has-empty", visible === 0);
                }
            }
            [input, yearSelect, categorySelect].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
