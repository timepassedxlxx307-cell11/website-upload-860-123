
(function () {
  "use strict";

  const scriptUrl = document.currentScript ? document.currentScript.src : "";
  const hlsModuleUrl = scriptUrl ? new URL("hls-dru42stk.js", scriptUrl).href : "assets/hls-dru42stk.js";
  let hlsModulePromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupImageFallback() {
    document.addEventListener(
      "error",
      function (event) {
        const image = event.target;
        if (!(image instanceof HTMLImageElement)) {
          return;
        }
        if (!image.hasAttribute("data-fallback-poster")) {
          return;
        }
        image.style.display = "none";
        const frame = image.closest(".poster-frame, .hero-poster, .small-poster");
        if (frame) {
          frame.classList.add("is-missing");
        }
      },
      true
    );
  }

  function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-menu-toggle]");
    const panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      const isOpen = panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", isOpen);
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupCategoryFilter() {
    const panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    const input = panel.querySelector("[data-page-filter]");
    const chips = Array.from(panel.querySelectorAll("[data-filter-value]"));
    const cards = Array.from(document.querySelectorAll("[data-filter-results] .movie-card"));
    let activeValue = "all";

    function applyFilter() {
      const query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        const haystack = normalize(
          [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ")
        );
        const matchesQuery = !query || haystack.includes(query);
        const matchesChip = activeValue === "all" || haystack.includes(normalize(activeValue));
        card.style.display = matchesQuery && matchesChip ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeValue = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.link) + '" data-title="' + escapeHtml(movie.title) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-poster>',
      '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="poster-score">' + escapeHtml(movie.score) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function setupSearchPage() {
    const page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    const input = page.querySelector("[data-search-input]");
    const typeSelect = page.querySelector("[data-search-type]");
    const results = page.querySelector("[data-search-results]");
    const count = page.querySelector("[data-search-count]");
    const data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function render() {
      const query = normalize(input ? input.value : "");
      const typeValue = normalize(typeSelect ? typeSelect.value : "all");
      const matched = data.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        const matchesQuery = !query || haystack.includes(query);
        const matchesType = typeValue === "all" || normalize(movie.type).includes(typeValue);
        return matchesQuery && matchesType;
      });
      const limited = matched.slice(0, 120);
      if (count) {
        count.textContent = "共找到 " + matched.length + " 部影片" + (matched.length > limited.length ? "，当前显示前 " + limited.length + " 部" : "");
      }
      if (results) {
        results.innerHTML = limited.map(movieCardTemplate).join("") || '<p class="empty-state">没有找到匹配影片，请更换关键词。</p>';
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    render();
  }

  async function getHls() {
    if (!hlsModulePromise) {
      hlsModulePromise = import(hlsModuleUrl).then(function (module) {
        return module.H;
      });
    }
    return hlsModulePromise;
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll("[data-hls-player]"));
    players.forEach(function (wrapper) {
      const video = wrapper.querySelector("video");
      const button = wrapper.querySelector("[data-player-start]");
      const status = wrapper.querySelector("[data-player-status]");
      const source = wrapper.getAttribute("data-src");
      let initialized = false;
      let hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      async function startPlayback() {
        if (!video || !source) {
          setStatus("未找到播放源");
          return;
        }
        wrapper.classList.add("is-loading");
        setStatus("正在加载播放源…");
        try {
          if (!initialized) {
            video.controls = true;
            const canNativePlay = video.canPlayType("application/vnd.apple.mpegurl");
            if (canNativePlay) {
              video.src = source;
            } else {
              const Hls = await getHls();
              if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                  enableWorker: true,
                  lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                  if (!data || !data.fatal) {
                    return;
                  }
                  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus("网络错误，正在重试…");
                    hlsInstance.startLoad();
                  } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus("媒体错误，正在恢复…");
                    hlsInstance.recoverMediaError();
                  } else {
                    setStatus("无法播放该视频源");
                    wrapper.classList.add("has-error");
                  }
                });
              } else {
                throw new Error("当前浏览器不支持 HLS 播放");
              }
            }
            initialized = true;
            wrapper.classList.add("is-ready");
          }
          await video.play();
          wrapper.classList.remove("is-loading");
          wrapper.classList.add("is-playing");
          setStatus("正在播放");
        } catch (error) {
          wrapper.classList.remove("is-loading");
          wrapper.classList.add("has-error");
          setStatus(error && error.message ? error.message : "播放失败，请稍后重试");
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!initialized || video.paused) {
            startPlayback();
          } else {
            video.pause();
            wrapper.classList.remove("is-playing");
          }
        });
        video.addEventListener("pause", function () {
          wrapper.classList.remove("is-playing");
        });
        video.addEventListener("play", function () {
          wrapper.classList.add("is-playing");
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupImageFallback();
    setupMobileMenu();
    setupHeroCarousel();
    setupCategoryFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
