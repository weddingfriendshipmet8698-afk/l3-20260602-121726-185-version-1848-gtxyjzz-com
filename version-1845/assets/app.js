(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }

            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-card-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function applyFilter() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';

        cards.forEach(function (card) {
            var content = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' ').toLowerCase();
            var matchQuery = !query || content.indexOf(query) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            card.classList.toggle('is-filtered-out', !(matchQuery && matchYear));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var startButton = player.querySelector('.player-start');
        var source = player.getAttribute('data-src');
        var loaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (loaded || !video || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function startPlayback() {
            loadSource();

            if (startButton) {
                startButton.classList.add('is-hidden');
            }

            if (video) {
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        if (startButton) {
                            startButton.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (startButton) {
            startButton.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
