(function () {
  function startPlayer(shell) {
    const video = shell.querySelector('[data-player-video]');
    const cover = shell.querySelector('[data-play-button]');
    const source = shell.getAttribute('data-stream');

    if (!video || !source) {
      return;
    }

    function play() {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.dataset.hlsReady) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          video.dataset.hlsReady = '1';
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (!video.src) {
        video.src = source;
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(startPlayer);
})();
