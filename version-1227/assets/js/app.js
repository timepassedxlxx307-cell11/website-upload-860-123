(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  };

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(
        slider.querySelectorAll(".hero-slide"),
      );
      var dots = Array.prototype.slice.call(
        slider.querySelectorAll("[data-hero-dot]"),
      );
      var current = 0;
      var setSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === current);
        });
      };
      var next = function () {
        setSlide(current + 1);
      };
      var timer = window.setInterval(next, 5200);
      var restart = function () {
        window.clearInterval(timer);
        timer = window.setInterval(next, 5200);
      };
      var prevButton = slider.querySelector("[data-hero-prev]");
      var nextButton = slider.querySelector("[data-hero-next]");
      if (prevButton) {
        prevButton.addEventListener("click", function () {
          setSlide(current - 1);
          restart();
        });
      }
      if (nextButton) {
        nextButton.addEventListener("click", function () {
          setSlide(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(Number(dot.getAttribute("data-hero-dot") || 0));
          restart();
        });
      });
    }

    var inputs = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-input]"),
    );
    inputs.forEach(function (input) {
      var queryName = input.getAttribute("data-query-param");
      if (queryName) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get(queryName);
        if (initial) {
          input.value = initial;
        }
      }
      var applyFilter = function () {
        var value = input.value.trim().toLowerCase();
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
          return;
        }
        var items = Array.prototype.slice.call(
          list.querySelectorAll(".movie-card, .rank-row"),
        );
        items.forEach(function (item) {
          var text = [
            item.getAttribute("data-title") || "",
            item.getAttribute("data-region") || "",
            item.getAttribute("data-type") || "",
            item.getAttribute("data-genre") || "",
            item.getAttribute("data-year") || "",
            item.textContent || "",
          ]
            .join(" ")
            .toLowerCase();
          item.classList.toggle(
            "is-hidden",
            value && text.indexOf(value) === -1,
          );
        });
      };
      input.addEventListener("input", applyFilter);
      applyFilter();
    });

    var chipWrap = document.querySelector("[data-chip-filter]");
    if (chipWrap) {
      var chips = Array.prototype.slice.call(
        chipWrap.querySelectorAll("[data-chip]"),
      );
      var input = document.querySelector("[data-filter-input]");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          if (input) {
            input.value = chip.getAttribute("data-chip") || "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      });
    }
  });
})();
