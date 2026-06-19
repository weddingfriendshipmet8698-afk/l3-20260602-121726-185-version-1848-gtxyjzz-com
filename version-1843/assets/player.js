(function () {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');
  var box = document.querySelector('[data-player-box]');

  if (!video || !button || !box) {
    return;
  }

  var url = button.getAttribute('data-video') || '';
  var prepared = false;
  var hls = null;

  function message(text) {
    button.innerHTML = '<span>▶</span><strong>' + text + '</strong>';
  }

  function prepare() {
    if (prepared) {
      return Promise.resolve();
    }
    prepared = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              message('暂时无法播放');
            }
          }
        });
        setTimeout(resolve, 1200);
      });
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }
    video.src = url;
    return Promise.resolve();
  }

  function play() {
    prepare().then(function () {
      button.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          button.classList.remove('is-hidden');
          message('再次点击播放');
        });
      }
    });
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
      message('继续播放');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
