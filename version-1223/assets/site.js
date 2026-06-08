import { H as Hls } from "./hls-dru42stk.js";

const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    previous?.addEventListener("click", () => {
        showSlide(current - 1);
        start();
    });

    next?.addEventListener("click", () => {
        showSlide(current + 1);
        start();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const applyInitialQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (!query) {
        return;
    }
    document.querySelectorAll("[data-filter-keyword]").forEach((input) => {
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
};

const setupFilters = () => {
    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
        const keyword = panel.querySelector("[data-filter-keyword]");
        const year = panel.querySelector("[data-filter-year]");
        const type = panel.querySelector("[data-filter-type]");
        const list = document.querySelector("[data-filter-list]");
        const empty = document.querySelector("[data-empty-state]");

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll("[data-movie-card]"));

        const filter = () => {
            const keywordValue = normalize(keyword?.value);
            const yearValue = normalize(year?.value);
            const typeValue = normalize(type?.value);
            let visible = 0;

            cards.forEach((card) => {
                const content = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre
                ].join(" "));
                const matchedKeyword = !keywordValue || content.includes(keywordValue);
                const matchedYear = !yearValue || normalize(card.dataset.year) === yearValue;
                const matchedType = !typeValue || normalize(card.dataset.type).includes(typeValue);
                const matched = matchedKeyword && matchedYear && matchedType;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        keyword?.addEventListener("input", filter);
        year?.addEventListener("change", filter);
        type?.addEventListener("change", filter);
        filter();
    });
};

const setupPlayers = () => {
    document.querySelectorAll("[data-player]").forEach((player) => {
        const video = player.querySelector("video");
        const overlay = player.querySelector(".play-overlay");
        const src = player.dataset.src;
        let ready = false;
        let hls = null;

        if (!video || !src) {
            return;
        }

        const prepare = () => {
            if (ready) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }

            ready = true;
        };

        const play = () => {
            prepare();
            overlay?.classList.add("is-hidden");
            const playback = video.play();
            if (playback && typeof playback.catch === "function") {
                playback.catch(() => {
                    overlay?.classList.remove("is-hidden");
                });
            }
        };

        overlay?.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", () => overlay?.classList.add("is-hidden"));
        video.addEventListener("pause", () => {
            if (!video.ended) {
                overlay?.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", () => overlay?.classList.remove("is-hidden"));
        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
};

setupFilters();
applyInitialQuery();
setupPlayers();
