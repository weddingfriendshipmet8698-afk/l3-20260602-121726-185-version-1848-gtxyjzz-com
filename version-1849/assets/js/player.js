function initVideoPlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var button = document.querySelector(".play-layer");
    var ready = false;

    function attach() {
        if (!video || ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            return;
        }
        video.src = sourceUrl;
    }

    function start() {
        attach();
        if (!video) {
            return;
        }
        if (button) {
            button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });
    }
}
