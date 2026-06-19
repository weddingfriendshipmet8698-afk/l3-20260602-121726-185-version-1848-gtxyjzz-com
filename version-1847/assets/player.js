(function () {
    const area = document.querySelector('[data-player]');

    if (!area) {
        return;
    }

    const video = area.querySelector('video');
    const layer = area.querySelector('[data-layer]');
    const buttons = Array.from(area.querySelectorAll('[data-play]'));
    const url = area.getAttribute('data-stream');
    let prepared = false;
    let engine = null;

    const playVideo = function () {
        if (!video || !url) {
            return;
        }

        const run = function () {
            const result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        };

        if (!prepared) {
            prepared = true;
            video.setAttribute('controls', 'controls');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', run, { once: true });
            } else if (window.Hls) {
                engine = new Hls();
                engine.loadSource(url);
                engine.attachMedia(video);
                engine.on(Hls.Events.MANIFEST_PARSED, run);
            } else {
                video.src = url;
                video.addEventListener('loadedmetadata', run, { once: true });
            }
        } else {
            run();
        }

        if (layer) {
            layer.classList.add('is-hidden');
        }
    };

    buttons.forEach(function (button) {
        button.addEventListener('click', playVideo);
    });

    if (layer) {
        layer.addEventListener('click', playVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (engine && typeof engine.destroy === 'function') {
            engine.destroy();
        }
    });
})();
