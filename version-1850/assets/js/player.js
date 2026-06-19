(function () {
  var players = document.querySelectorAll("[data-player]");

  players.forEach(function (player) {
    var video = player.querySelector("[data-player-video]");
    var button = player.querySelector("[data-player-start]");
    var message = player.querySelector("[data-player-message]");
    var hls = null;
    var ready = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function hideMessage() {
      if (!message) {
        return;
      }
      message.textContent = "";
      message.classList.remove("is-visible");
    }

    function prepare() {
      if (!video || ready) {
        return Promise.resolve();
      }

      var source = video.getAttribute("data-src");
      if (!source) {
        showMessage("暂时无法播放，请稍后重试。");
        return Promise.resolve();
      }

      ready = true;
      hideMessage();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage("网络连接异常，正在重新加载。");
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage("媒体加载异常，正在恢复播放。");
            hls.recoverMediaError();
            return;
          }
          showMessage("暂时无法播放，请稍后重试。");
        });
        return Promise.resolve();
      }

      showMessage("当前浏览器暂时不支持播放。");
      return Promise.resolve();
    }

    function start() {
      prepare().then(function () {
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
