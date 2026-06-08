(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-card-search]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var clearButton = document.querySelector('[data-clear-filters]');
    var result = document.querySelector('[data-filter-result]');

    if (!cards.length) {
      return;
    }

    function uniqueValues(attribute) {
      var values = cards.map(function (card) {
        return card.getAttribute(attribute) || '';
      }).filter(Boolean);

      return Array.from(new Set(values)).sort(function (a, b) {
        return b.localeCompare(a, 'zh-CN', { numeric: true });
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(typeFilter, uniqueValues('data-type'));
    fillSelect(regionFilter, uniqueValues('data-region'));
    fillSelect(yearFilter, uniqueValues('data-year'));

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var regionValue = regionFilter ? regionFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var visible = matchesQuery && matchesType && matchesRegion && matchesYear;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
      }
    }

    [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    applyFilters();
  }

  setupHero();
  setupFilters();
})();
