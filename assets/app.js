import { H as Hls } from './hls-vendor.js';

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (header) {
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  previous?.addEventListener('click', () => showSlide(current - 1));
  next?.addEventListener('click', () => showSlide(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }
}

const filterRoot = document.querySelector('[data-card-filter]');

if (filterRoot) {
  const input = filterRoot.querySelector('[data-filter-input]');
  const year = filterRoot.querySelector('[data-filter-year]');
  const list = document.querySelector('[data-filter-list]');
  const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];

  const applyFilter = () => {
    const term = (input?.value || '').trim().toLowerCase();
    const yearValue = year?.value || '';

    cards.forEach((card) => {
      const title = (card.dataset.title || '').toLowerCase();
      const cardYear = parseInt(card.dataset.year || '0', 10);
      const textMatched = !term || title.includes(term);
      let yearMatched = true;

      if (yearValue === '2021') {
        yearMatched = cardYear <= 2021;
      } else if (yearValue) {
        yearMatched = String(cardYear) === yearValue;
      }

      card.classList.toggle('is-hidden-card', !(textMatched && yearMatched));
    });
  };

  input?.addEventListener('input', applyFilter);
  year?.addEventListener('change', applyFilter);
}

const searchPage = document.querySelector('[data-search-page]');

if (searchPage && Array.isArray(window.__MOVIES__)) {
  const input = searchPage.querySelector('[data-search-input]');
  const category = searchPage.querySelector('[data-search-category]');
  const year = searchPage.querySelector('[data-search-year]');
  const results = searchPage.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);

  if (params.get('q') && input) {
    input.value = params.get('q');
  }

  const renderCard = (movie) => {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<a class="movie-card movie-card-compact" href="${movie.url}" data-title="${escapeHtml(movie.title)}" data-year="${movie.year}" data-category="${escapeHtml(movie.category)}">
  <span class="poster-wrap">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-mask"></span>
    <span class="play-badge">播放</span>
  </span>
  <span class="card-body">
    <span class="card-meta">
      <span>${escapeHtml(movie.category)}</span>
      <span>${movie.year}</span>
    </span>
    <strong>${escapeHtml(movie.title)}</strong>
    <span class="card-desc">${escapeHtml(movie.description)}</span>
    <span class="tag-row">${tags}</span>
  </span>
</a>`;
  };

  const applySearch = () => {
    const term = (input?.value || '').trim().toLowerCase();
    const categoryValue = category?.value || '';
    const yearValue = year?.value || '';

    const filtered = window.__MOVIES__.filter((movie) => {
      const haystack = `${movie.title} ${movie.region} ${movie.type} ${movie.genre} ${movie.tags.join(' ')}`.toLowerCase();
      const termMatched = !term || haystack.includes(term);
      const categoryMatched = !categoryValue || movie.category === categoryValue;
      let yearMatched = true;

      if (yearValue === '2021') {
        yearMatched = Number(movie.year) <= 2021;
      } else if (yearValue) {
        yearMatched = String(movie.year) === yearValue;
      }

      return termMatched && categoryMatched && yearMatched;
    }).slice(0, 120);

    results.innerHTML = filtered.length
      ? filtered.map(renderCard).join('')
      : '<div class="empty-state">没有找到匹配内容，请尝试更换关键词。</div>';
  };

  input?.addEventListener('input', applySearch);
  category?.addEventListener('change', applySearch);
  year?.addEventListener('change', applySearch);
  applySearch();
}

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  let hlsInstance = null;

  const startPlayback = async () => {
    if (!video) {
      return;
    }

    const source = video.dataset.src;

    if (!source) {
      return;
    }

    button?.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
    } else if (Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else if (!video.src) {
      video.src = source;
    }

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  button?.addEventListener('click', startPlayback);
  video?.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });
});

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
