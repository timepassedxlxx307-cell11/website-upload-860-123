(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function() {
            nav.classList.toggle("is-open");
            toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prevButton = hero.querySelector("[data-hero-prev]");
        var nextButton = hero.querySelector("[data-hero-next]");
        if (prevButton) {
            prevButton.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (nextButton) {
            nextButton.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupRails() {
        document.querySelectorAll("[data-rail]").forEach(function(rail) {
            var name = rail.getAttribute("data-rail");
            var prev = document.querySelector("[data-rail-prev='" + name + "']");
            var next = document.querySelector("[data-rail-next='" + name + "']");
            function scroll(direction) {
                rail.scrollBy({
                    left: direction * 330,
                    behavior: "smooth"
                });
            }
            if (prev) {
                prev.addEventListener("click", function() {
                    scroll(-1);
                });
            }
            if (next) {
                next.addEventListener("click", function() {
                    scroll(1);
                });
            }
        });
    }

    function includesText(value, query) {
        return String(value || "").toLowerCase().indexOf(query) !== -1;
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-form]").forEach(function(form) {
            var section = form.closest("section");
            var cards = section ? Array.prototype.slice.call(section.querySelectorAll("[data-card]")) : [];
            var search = form.querySelector("[data-search-input]");
            var year = form.querySelector("[data-year-filter]");
            var type = form.querySelector("[data-type-filter]");
            var region = form.querySelector("[data-region-filter]");
            var state = section ? section.querySelector("[data-filter-state]") : null;
            var empty = section ? section.querySelector("[data-empty-state]") : null;

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var regionValue = region ? region.value : "";
                var matches = 0;
                cards.forEach(function(card) {
                    var textMatch = !query || includesText(card.getAttribute("data-title"), query) || includesText(card.getAttribute("data-genre"), query) || includesText(card.getAttribute("data-tags"), query) || includesText(card.textContent, query);
                    var yearMatch = !yearValue || card.getAttribute("data-year") === yearValue;
                    var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
                    var regionMatch = !regionValue || card.getAttribute("data-region") === regionValue;
                    var visible = textMatch && yearMatch && typeMatch && regionMatch;
                    card.hidden = !visible;
                    if (visible) {
                        matches += 1;
                    }
                });
                if (state) {
                    state.textContent = matches ? "已显示匹配影片" : "暂无匹配影片";
                }
                if (empty) {
                    empty.hidden = matches !== 0;
                }
            }

            [search, year, type, region].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            form.addEventListener("reset", function() {
                window.setTimeout(apply, 0);
            });
            apply();
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupRails();
        setupFilters();
    });
}());
