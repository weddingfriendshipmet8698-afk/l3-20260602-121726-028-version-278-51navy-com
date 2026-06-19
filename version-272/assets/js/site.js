(function () {
  function toArray(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupImageFallbacks() {
    document.addEventListener(
      "error",
      function (event) {
        var image = event.target;
        if (!image || image.tagName !== "IMG") {
          return;
        }

        var holder = image.closest(".poster-frame, .hero-poster, .detail-poster");
        if (holder) {
          holder.classList.add("no-image");
          holder.setAttribute("data-title", image.getAttribute("alt") || "影片封面");
          image.style.display = "none";
        }
      },
      true
    );
  }

  function setupHero() {
    var slides = toArray(".hero-slide");
    var dots = toArray(".hero-dot");
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        go(Number(dot.getAttribute("data-go-slide") || 0));
        start();
      });
    });

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    start();
  }

  function setupFilters() {
    var panels = toArray("[data-filter-panel]");
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cardGrid = scope.querySelector("[data-card-grid]");
      var table = scope.querySelector("[data-row-table]");
      var searchInput = panel.querySelector("[data-filter-search]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var sortSelect = panel.querySelector("[data-sort-select]");
      var countNode = panel.querySelector("[data-filter-count]");
      var items = cardGrid ? toArray(".movie-card", cardGrid) : toArray(".movie-row", table);

      function applyQueryFromUrl() {
        if (!searchInput) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          searchInput.value = q;
        }
      }

      function sortItems(visibleItems) {
        if (!sortSelect) {
          return visibleItems;
        }
        var mode = sortSelect.value;
        return visibleItems.slice().sort(function (a, b) {
          if (mode === "score-desc") {
            return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
          }
          if (mode === "title-asc") {
            return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      function render() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = [];

        items.forEach(function (item) {
          var haystack = normalize(item.dataset.search || item.textContent);
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || normalize(item.dataset.year) === year;
          var matchRegion = !region || normalize(item.dataset.region) === region;
          var show = matchKeyword && matchYear && matchRegion;
          item.classList.toggle("is-hidden", !show);
          if (show) {
            visible.push(item);
          }
        });

        sortItems(visible).forEach(function (item) {
          if (cardGrid) {
            cardGrid.appendChild(item);
          } else if (table) {
            table.querySelector("tbody").appendChild(item);
          }
        });

        if (countNode) {
          countNode.textContent = visible.length + " 部";
        }
      }

      applyQueryFromUrl();
      [searchInput, yearSelect, regionSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", render);
          control.addEventListener("change", render);
        }
      });
      render();
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayer() {
    var button = document.querySelector("[data-play-button]");
    var video = document.getElementById("video-player");
    if (!button || !video) {
      return;
    }

    button.addEventListener("click", function () {
      var source = button.getAttribute("data-src");
      if (!source) {
        return;
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {});
      }

      button.classList.add("hidden");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        playNative();
        return;
      }

      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          playNative();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
