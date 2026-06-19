(function () {
    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var source = shell.getAttribute('data-stream');

        if (!video || !source) {
            return;
        }

        shell.classList.add('playing');

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                video.hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video.hlsInstance.loadSource(source);
                video.hlsInstance.attachMedia(video);
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var cover = shell.querySelector('.player-cover');
        var video = shell.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!shell.classList.contains('playing')) {
                    startPlayer(shell);
                }
            });
        }
    });
})();
