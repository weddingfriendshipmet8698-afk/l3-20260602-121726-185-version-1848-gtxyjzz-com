(function () {
  function attach(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.getAttribute("src") !== source) {
        video.setAttribute("src", source);
      }
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hls) {
        video.__hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video.__hls.loadSource(source);
        video.__hls.attachMedia(video);
      }

      return new Promise(function (resolve) {
        var resolved = false;
        var done = function () {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        video.__hls.on(window.Hls.Events.MANIFEST_PARSED, done);
        video.__hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            video.__hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            video.__hls.recoverMediaError();
            return;
          }

          video.__hls.destroy();
          video.__hls = null;
        });
        window.setTimeout(done, 1500);
      });
    }

    video.setAttribute("src", source);
    return Promise.resolve();
  }

  window.initMoviePlayer = function (options) {
    var video = document.querySelector(options.video);
    var trigger = document.querySelector(options.trigger);
    var source = options.source;

    if (!video || !trigger || !source) {
      return;
    }

    function play() {
      trigger.classList.add("is-loading");
      attach(video, source).then(function () {
        trigger.classList.add("is-hidden");
        trigger.classList.remove("is-loading");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            trigger.classList.remove("is-hidden");
          });
        }
      });
    }

    trigger.addEventListener("click", play);
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        trigger.classList.remove("is-hidden");
      }
    });
  };
})();
