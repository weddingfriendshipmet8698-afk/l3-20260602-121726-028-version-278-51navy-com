(function () {
  const menuButton = document.querySelector(".menu-button");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".slider-dots button"));

  if (slides.length) {
    let current = 0;

    const showSlide = function (index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });

      current = index;
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  const normalize = function (value) {
    return (value || "").toString().trim().toLowerCase();
  };

  const applyFilter = function (scope) {
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const keyword = normalize(scope.querySelector("[data-filter-keyword]")?.value);
    const year = normalize(scope.querySelector("[data-filter-year]")?.value);
    const genre = normalize(scope.querySelector("[data-filter-genre]")?.value);
    const empty = scope.querySelector(".empty-state");
    let shown = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      const okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const okYear = !year || normalize(card.dataset.year) === year;
      const okGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1;
      const visible = okKeyword && okYear && okGenre;

      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  };

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    scope.querySelectorAll("input, select").forEach(function (control) {
      control.addEventListener("input", function () {
        applyFilter(scope);
      });

      control.addEventListener("change", function () {
        applyFilter(scope);
      });
    });

    scope.querySelectorAll("[data-filter-reset]").forEach(function (button) {
      button.addEventListener("click", function () {
        scope.querySelectorAll("input, select").forEach(function (control) {
          control.value = "";
        });

        applyFilter(scope);
      });
    });
  });
})();

function setupPlayer(videoUrl) {
  const shell = document.querySelector(".player-shell");
  const video = document.querySelector("#movie-player");
  const cover = document.querySelector(".play-cover");

  if (!shell || !video || !cover || !videoUrl) {
    return;
  }

  let ready = false;

  const loadVideo = function () {
    if (!ready) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      ready = true;
    }

    cover.classList.add("hidden");
    video.controls = true;
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  };

  cover.addEventListener("click", loadVideo);
  video.addEventListener("click", function () {
    if (!ready) {
      loadVideo();
    }
  });
}
