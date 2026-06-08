(function () {
  var menuButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function autoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        autoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        autoPlay();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        autoPlay();
      });
    });

    showSlide(0);
    autoPlay();
  }

  var filterBox = document.querySelector('[data-filter-box]');
  if (filterBox) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-no-match]');
    var textInput = filterBox.querySelector('[data-filter-text]');
    var typeSelect = filterBox.querySelector('[data-filter-type]');
    var yearSelect = filterBox.querySelector('[data-filter-year]');
    var regionSelect = filterBox.querySelector('[data-filter-region]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && textInput) {
      textInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilters() {
      var query = normalize(textInput && textInput.value).trim();
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category')
        ].join(' '));

        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [textInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('[data-player-start]');
    var sourceButtons = Array.prototype.slice.call(player.querySelectorAll('[data-play-url]'));
    var hlsInstance = null;

    function playUrl(url, activeButton) {
      if (!video || !url) {
        return;
      }

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      player.classList.add('is-playing');
      sourceButtons.forEach(function (button) {
        button.classList.toggle('is-active', button === activeButton);
      });

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function onReady() {
          video.removeEventListener('loadedmetadata', onReady);
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        playUrl(button.getAttribute('data-play-url'), button);
      });
    });

    if (startButton) {
      startButton.addEventListener('click', function () {
        var firstButton = sourceButtons[0];
        if (firstButton) {
          playUrl(firstButton.getAttribute('data-play-url'), firstButton);
        }
      });
    }

    var stage = player.querySelector('.player-stage');
    if (stage) {
      stage.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        if (!player.classList.contains('is-playing')) {
          var firstButton = sourceButtons[0];
          if (firstButton) {
            playUrl(firstButton.getAttribute('data-play-url'), firstButton);
          }
        }
      });
    }
  }
})();
