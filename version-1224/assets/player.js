(function () {
  var HLS_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js',
    'https://unpkg.com/hls.js@1.5.17/dist/hls.min.js'
  ];

  function loadScriptSequentially(urls, onComplete) {
    var index = 0;

    function tryNext() {
      if (window.Hls || index >= urls.length) {
        onComplete();
        return;
      }

      var script = document.createElement('script');
      script.src = urls[index];
      script.async = true;
      script.onload = onComplete;
      script.onerror = function () {
        index += 1;
        tryNext();
      };
      document.head.appendChild(script);
    }

    tryNext();
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var src = player.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function hideOverlay() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已加载，可正常观看。');
          video.play().catch(function () {
            setStatus('播放源已加载，请再次点击视频播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络连接中断，正在重新加载播放源。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解码异常，正在尝试恢复播放。');
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放器遇到错误，请刷新页面后重试。');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('浏览器支持原生 HLS，播放源已绑定。');
        video.play().catch(function () {
          setStatus('播放源已绑定，请再次点击视频播放。');
        });
      } else {
        video.src = src;
        setStatus('已绑定 m3u8 地址；如当前浏览器无法播放，请使用支持 HLS 的浏览器。');
        video.play().catch(function () {
          setStatus('当前浏览器可能需要 HLS 支持，请等待播放器脚本加载或更换浏览器。');
        });
      }
    }

    function startPlayback() {
      hideOverlay();
      setStatus('正在初始化高清播放源。');

      if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
        attachSource();
      } else {
        loadScriptSequentially(HLS_CDN_URLS, attachSource);
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]')).forEach(setupPlayer);
})();
