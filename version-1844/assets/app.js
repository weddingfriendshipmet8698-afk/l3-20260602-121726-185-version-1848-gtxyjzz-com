(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        var active = dotIndex === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var searchInput = panel.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
      var empty = scope.querySelector('[data-empty-state]');
      var filters = {};

      buttons.forEach(function (button) {
        if (button.getAttribute('data-filter-value') === '全部') {
          button.classList.add('is-active');
        }
      });

      function apply() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedFilters = Object.keys(filters).every(function (name) {
            var value = filters[name];
            if (!value || value === '全部') {
              return true;
            }
            return normalize(card.getAttribute('data-' + name)) === normalize(value);
          });
          var visible = matchedKeyword && matchedFilters;
          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          searchInput.value = query;
        }
        searchInput.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var name = button.getAttribute('data-filter-name');
          var value = button.getAttribute('data-filter-value');
          filters[name] = value;
          buttons.forEach(function (item) {
            if (item.getAttribute('data-filter-name') === name) {
              item.classList.toggle('is-active', item === button);
            }
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute('data-video');
      var initialized = false;
      var hls = null;

      function attach() {
        if (initialized || !url) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
