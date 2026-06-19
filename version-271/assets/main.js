(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var navLinks = document.querySelector(".nav-links");
        if (menuButton && navLinks) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("open");
            });
        }

        var hero = document.querySelector(".hero");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function startAuto() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(index - 1);
                    startAuto();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    startAuto();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                    startAuto();
                });
            });
            showSlide(0);
            startAuto();
        }

        var searchForms = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
        searchForms.forEach(function (form) {
            var input = form.querySelector("input");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            if (!input || !cards.length) {
                return;
            }
            function applyFilter() {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var content = (card.getAttribute("data-title") || "").toLowerCase();
                    card.classList.toggle("is-filtered", keyword !== "" && content.indexOf(keyword) === -1);
                });
            }
            input.addEventListener("input", applyFilter);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter();
            });
        });
    });
})();

function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }
    var box = video.closest(".player-box");
    var button = box ? box.querySelector(".player-cover") : null;
    var started = false;

    function attach() {
        if (started) {
            return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else {
            video.src = sourceUrl;
        }
    }

    function start() {
        attach();
        if (button) {
            button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", attach);
}
