(function () {
    function setupPlayer(shell) {
        const video = shell.querySelector('video');
        const cover = shell.querySelector('.player-cover');
        const start = shell.querySelector('.player-start');
        const mediaUrl = shell.getAttribute('data-play');
        let ready = false;
        let hls = null;

        function prepare() {
            if (ready || !video || !mediaUrl) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = mediaUrl;
        }

        function play() {
            prepare();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                const attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (start) {
            start.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(setupPlayer);
})();
