(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setMobileNav() {
    const toggle = $('.mobile-toggle');
    const panel = $('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  function setHeroCarousel() {
    const hero = $('[data-hero-carousel]');
    if (!hero) return;
    const track = $('.hero-track', hero);
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dot', hero);
    let index = 0;
    let timer = null;

    function render(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    const prev = $('.hero-prev', hero);
    const next = $('.hero-next', hero);
    if (prev) prev.addEventListener('click', function () { render(index - 1); start(); });
    if (next) next.addEventListener('click', function () { render(index + 1); start(); });
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  function setCategoryFilter() {
    const grid = $('[data-filter-grid]');
    if (!grid) return;
    const input = $('[data-filter-search]');
    const buttons = $$('[data-filter-btn]');
    const cards = $$('[data-movie-card]', grid);
    const empty = $('[data-empty-state]');
    let active = 'all';

    function matches(card, text, filter) {
      const title = (card.dataset.title || '').toLowerCase();
      const region = (card.dataset.region || '').toLowerCase();
      const type = (card.dataset.type || '').toLowerCase();
      const genre = (card.dataset.genre || '').toLowerCase();
      const year = (card.dataset.year || '').toLowerCase();
      const haystack = [title, region, type, genre, year].join(' ');
      const textOk = !text || haystack.includes(text);
      const filterOk = filter === 'all' || type.includes(filter) || region.includes(filter) || genre.includes(filter) || year.includes(filter);
      return textOk && filterOk;
    }

    function apply() {
      const text = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach(function (card) {
        const isVisible = matches(card, text, active);
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    if (input) input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = (button.dataset.filterBtn || 'all').toLowerCase();
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function createResultCard(item) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-hover">▶</span>',
      '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setSearchPage() {
    const form = $('[data-search-form]');
    const input = $('[data-search-input]');
    const grid = $('[data-search-results]');
    const summary = $('[data-search-summary]');
    if (!form || !input || !grid || !window.SEARCH_INDEX) return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      const q = query.trim().toLowerCase();
      grid.innerHTML = '';
      if (!q) {
        if (summary) summary.textContent = '输入剧名、地区、类型或关键词浏览相关内容';
        return;
      }
      const words = q.split(/\s+/).filter(Boolean);
      const results = window.SEARCH_INDEX.filter(function (item) {
        const haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return words.every(function (word) { return haystack.includes(word); });
      }).slice(0, 120);
      if (summary) summary.textContent = '关键词“' + query + '”的相关结果';
      results.forEach(function (item) {
        grid.appendChild(createResultCard(item));
      });
      if (!results.length && summary) summary.textContent = '没有找到与“' + query + '”匹配的内容';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });
    render(initial);
  }

  function startPlayer(url) {
    const video = $('#movie-video');
    const cover = $('.player-cover');
    if (!video || !url) return;
    if (cover) cover.classList.add('is-hidden');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== url) video.src = url;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) video.hlsInstance.destroy();
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video.hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }
    video.src = url;
    video.play().catch(function () {});
  }

  function setPlayer() {
    const player = $('[data-player-url]');
    if (!player) return;
    const url = player.getAttribute('data-player-url');
    const cover = $('.player-cover', player);
    const button = $('[data-play-button]', player);
    const video = $('#movie-video');
    if (cover) cover.addEventListener('click', function () { startPlayer(url); });
    if (button) button.addEventListener('click', function (event) { event.stopPropagation(); startPlayer(url); });
    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          startPlayer(url);
        } else if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setMobileNav();
    setHeroCarousel();
    setCategoryFilter();
    setSearchPage();
    setPlayer();
  });
})();
