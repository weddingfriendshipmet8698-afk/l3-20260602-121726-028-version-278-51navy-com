(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var src = box.getAttribute('data-src');

    if (!video || !src) {
      return;
    }

    if (!box.hlsReady) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        box.hlsInstance = hls;
      } else {
        video.src = src;
      }
      box.hlsReady = true;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll('.player-box').forEach(function (box) {
    var overlay = box.querySelector('.player-overlay');
    var video = box.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!box.hlsReady || video.paused) {
          startPlayer(box);
        }
      });
    }
  });
})();
