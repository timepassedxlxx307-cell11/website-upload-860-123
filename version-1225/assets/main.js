(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        if (slideTimer) {
          clearInterval(slideTimer);
        }
        slideTimer = setInterval(function () {
          showSlide(currentSlide + 1);
        }, 5200);
      });
    });

    slideTimer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';
  var localSearch = document.querySelector('.local-search');
  var searchableGrid = document.querySelector('.searchable-grid');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applySearch(value) {
    var keyword = normalize(value);

    cards.forEach(function (card) {
      var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
      card.classList.toggle('is-search-hidden', !matched);
    });
  }

  if (localSearch && searchableGrid) {
    localSearch.value = queryValue;
    applySearch(queryValue);

    localSearch.addEventListener('input', function () {
      applySearch(localSearch.value);
    });
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilters = {
    genre: 'all',
    year: 'all'
  };

  function applyFilters() {
    cards.forEach(function (card) {
      var genre = cardText(card);
      var year = card.getAttribute('data-year') || '';
      var genreMatched = activeFilters.genre === 'all' || genre.indexOf(normalize(activeFilters.genre)) !== -1;
      var yearMatched = activeFilters.year === 'all' || year === activeFilters.year;
      card.classList.toggle('is-filtered-out', !(genreMatched && yearMatched));
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filterName = button.getAttribute('data-filter');
      var value = button.getAttribute('data-value') || 'all';
      activeFilters[filterName] = value;

      filterButtons
        .filter(function (item) {
          return item.getAttribute('data-filter') === filterName;
        })
        .forEach(function (item) {
          item.classList.toggle('active', item === button);
        });

      applyFilters();
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (video) {
    var stage = video.closest('.player-stage');
    var overlay = stage ? stage.querySelector('.js-play') : null;
    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;

    function attachStream() {
      if (!stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
