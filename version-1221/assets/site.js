(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var searchInput = document.querySelector('[data-search-input]');
  if (searchInput && q) {
    searchInput.value = q;
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-control]'));
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var gridWrap = document.querySelector('[data-filter-wrap]');
  var textOf = function (card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-category'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  };
  var activeChip = '';
  var applyFilter = function () {
    if (!cards.length || !filterInputs.length) return;
    var value = '';
    filterInputs.forEach(function (input) {
      if (input.type === 'search' || input.type === 'text') value += ' ' + input.value;
      if (input.tagName === 'SELECT' && input.value) value += ' ' + input.value;
    });
    value += ' ' + activeChip;
    var terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0;
    cards.forEach(function (card) {
      var text = textOf(card);
      var ok = terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (gridWrap) {
      gridWrap.classList.toggle('empty', visible === 0);
    }
  };
  filterInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
    input.addEventListener('change', applyFilter);
  });
  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      chipButtons.forEach(function (other) {
        other.classList.remove('is-active');
      });
      if (activeChip === button.getAttribute('data-filter-chip')) {
        activeChip = '';
      } else {
        activeChip = button.getAttribute('data-filter-chip') || '';
        button.classList.add('is-active');
      }
      applyFilter();
    });
  });
  if (q) applyFilter();

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-cover');
    var stream = box.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;
    var prepare = function () {
      if (prepared || !video || !stream) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    var start = function () {
      prepare();
      if (button) button.hidden = true;
      if (video) {
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (button) button.hidden = false;
          });
        }
      }
    };
    if (button) button.addEventListener('click', start);
    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) start();
      });
      video.addEventListener('error', function () {
        if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
      });
    }
  });
})();
