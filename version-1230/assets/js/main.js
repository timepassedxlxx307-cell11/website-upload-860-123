(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var input = searchPage.querySelector('[data-search-input]');
    var cards = selectAll('[data-search-card]', searchPage);
    var empty = searchPage.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    function filterSearch() {
      var value = (input ? input.value : '').trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', filterSearch);
    }

    filterSearch();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var keyword = filterPanel.querySelector('[data-filter-keyword]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var genre = filterPanel.querySelector('[data-filter-genre]');
    var reset = filterPanel.querySelector('[data-filter-reset]');
    var scopedCards = selectAll('[data-filter-card]');
    var scopedEmpty = document.querySelector('[data-filter-empty]');

    function filterCards() {
      var kw = keyword ? keyword.value.trim().toLowerCase() : '';
      var yr = year ? year.value : '';
      var gr = genre ? genre.value : '';
      var visible = 0;

      scopedCards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var ok = true;

        if (kw && text.indexOf(kw) === -1) {
          ok = false;
        }

        if (yr && cardYear !== yr) {
          ok = false;
        }

        if (gr && cardGenre.indexOf(gr) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (scopedEmpty) {
        scopedEmpty.style.display = visible ? 'none' : 'block';
      }
    }

    [keyword, year, genre].forEach(function (field) {
      if (field) {
        field.addEventListener('input', filterCards);
        field.addEventListener('change', filterCards);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (genre) {
          genre.value = '';
        }
        filterCards();
      });
    }
  }
})();
