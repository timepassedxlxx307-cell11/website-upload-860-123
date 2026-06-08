(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                var isOpen = panel.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(isOpen));
                toggle.textContent = isOpen ? '×' : '☰';
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function play() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    play();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    play();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', play);
            show(0);
            play();
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function applyFilter(query) {
            var value = String(query || '').trim().toLowerCase();
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = String(card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var matched = !value || haystack.indexOf(value) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    shown += 1;
                }
            });

            var existing = document.querySelector('.empty-result');
            if (existing) {
                existing.remove();
            }

            if (cards.length && !shown) {
                var message = document.createElement('div');
                message.className = 'empty-result';
                message.textContent = '没有找到匹配的影片，请尝试其他关键词。';
                var section = document.querySelector('.movie-grid') || document.querySelector('.list-grid') || document.querySelector('.ranking-list');
                if (section && section.parentNode) {
                    section.parentNode.insertBefore(message, section.nextSibling);
                }
            }
        }

        if (filterInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';
            if (initial) {
                filterInput.value = initial;
                applyFilter(initial);
            }
            filterInput.addEventListener('input', function () {
                applyFilter(filterInput.value);
            });
        }
    });
}());
