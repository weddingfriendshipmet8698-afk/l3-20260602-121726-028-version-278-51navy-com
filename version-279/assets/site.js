(function () {
    function closestScope(element) {
        return element.closest("main") || document;
    }

    function textOf(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
        ].join(" ").toLowerCase();
    }

    function runFilter(scope) {
        var input = scope.querySelector(".js-search-input");
        var active = scope.querySelector(".filter-buttons button.active");
        var query = input ? input.value.trim().toLowerCase() : "";
        var token = active ? active.dataset.filterValue : "all";
        var cards = scope.querySelectorAll(".movie-card");
        cards.forEach(function (card) {
            var haystack = textOf(card);
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesToken = token === "all" || haystack.indexOf(token.toLowerCase()) !== -1;
            card.classList.toggle("is-hidden", !(matchesQuery && matchesToken));
        });
    }

    document.querySelectorAll(".menu-toggle").forEach(function (button) {
        button.addEventListener("click", function () {
            var header = button.closest(".site-header");
            if (header) {
                header.classList.toggle("nav-open");
            }
        });
    });

    document.querySelectorAll(".js-search-input").forEach(function (input) {
        input.addEventListener("input", function () {
            runFilter(closestScope(input));
        });
    });

    document.querySelectorAll(".filter-buttons button").forEach(function (button) {
        button.addEventListener("click", function () {
            var group = button.closest(".filter-buttons");
            if (group) {
                group.querySelectorAll("button").forEach(function (item) {
                    item.classList.remove("active");
                });
            }
            button.classList.add("active");
            runFilter(closestScope(button));
        });
    });

    document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });

        carousel.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
            timer = null;
        });

        carousel.addEventListener("mouseleave", play);
        play();
    });

    window.initMoviePlayer = function (mediaUrl) {
        var video = document.getElementById("movieVideo");
        var shell = document.querySelector(".player-shell");
        var startButton = document.querySelector(".player-start");
        var hls = null;
        var prepared = false;

        function prepare() {
            if (!video || prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
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

        function start() {
            prepare();
            if (!video) {
                return;
            }
            if (shell) {
                shell.classList.add("is-playing");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (shell) {
                        shell.classList.remove("is-playing");
                    }
                });
            }
        }

        if (startButton) {
            startButton.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (shell) {
                    shell.classList.add("is-playing");
                }
            });
            video.addEventListener("pause", function () {
                if (shell && video.currentTime === 0) {
                    shell.classList.remove("is-playing");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
        prepare();
    };
})();
