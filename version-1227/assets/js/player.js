(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  };

  ready(function () {
    var players = Array.prototype.slice.call(
      document.querySelectorAll("[data-player]"),
    );
    players.forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var overlay = wrap.querySelector(".player-overlay");
      var stream = wrap.getAttribute("data-stream");
      var hlsInstance = null;
      var attached = false;

      var attach = function () {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = stream;
        }
      };

      var play = function () {
        attach();
        if (!video) {
          return;
        }
        video.controls = true;
        wrap.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            wrap.classList.remove("is-playing");
          });
        }
      };

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          wrap.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            wrap.classList.remove("is-playing");
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  });
})();
