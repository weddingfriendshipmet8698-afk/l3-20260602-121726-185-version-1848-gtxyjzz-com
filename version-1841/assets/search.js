(function () {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');

    if (!input || !results || !window.SEARCH_MOVIES) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function movieCard(movie) {
        var tags = [movie.year, movie.region, movie.genre].filter(Boolean).slice(0, 3).map(function (item) {
            return '<span>' + escapeHtml(item) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + movie.url + '">',
            '<span class="poster-bg"></span>',
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove();">',
            '<span class="play-mark">▶</span>',
            '<span class="corner-badge">' + escapeHtml(movie.year || '精选') + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p class="card-line">' + escapeHtml(movie.summary) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render() {
        var query = normalize(input.value);
        var words = query.split(/\s+/).filter(Boolean);
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.summary
            ].join(' '));

            if (!words.length) {
                return true;
            }

            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);

        results.innerHTML = matched.map(movieCard).join('');
    }

    input.addEventListener('input', render);
    render();
})();
