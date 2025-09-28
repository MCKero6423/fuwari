<script>
  import { onMount, onDestroy } from 'svelte';
  
  let container;
  let playerInstance = null;
  
  onMount(() => {
    // 确保脚本加载完成后再初始化
    loadScripts().then(() => {
      initPlayer();
    });
  });
  
  onDestroy(() => {
    destroyPlayer();
  });
  
  function loadScripts() {
    return new Promise((resolve) => {
      // 检查是否已经加载了必要的脚本
      if (window.APlayer && window.Meting) {
        resolve();
        return;
      }
      
      let loadedCount = 0;
      const totalScripts = 3;
      
      function checkLoaded() {
        loadedCount++;
        if (loadedCount === totalScripts) {
          resolve();
        }
      }
      
      // 加载CSS
      if (!document.querySelector('link[href*="aplayer"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
        css.onload = checkLoaded;
        document.head.appendChild(css);
      } else {
        checkLoaded();
      }
      
      // 加载APlayer JS
      if (!window.APlayer) {
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
        script1.onload = checkLoaded;
        document.body.appendChild(script1);
      } else {
        checkLoaded();
      }
      
      // 加载Meting JS
      if (!window.Meting) {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js';
        script2.onload = checkLoaded;
        document.body.appendChild(script2);
      } else {
        checkLoaded();
      }
    });
  }
  
  function destroyPlayer() {
    if (playerInstance) {
      try {
        playerInstance.destroy();
        console.log('播放器实例已销毁');
      } catch (e) {
        console.log('销毁播放器时出错:', e);
      }
      playerInstance = null;
    }
    
    // 清理全局实例引用
    if (window.musicPlayerInstance === playerInstance) {
      window.musicPlayerInstance = null;
    }
  }
  
  function initPlayer() {
    if (!container) return;
    
    // 先销毁现有实例
    destroyPlayer();
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建meting-js元素
    const metingElement = document.createElement('meting-js');
    metingElement.setAttribute('server', 'netease');
    metingElement.setAttribute('type', 'playlist');
    metingElement.setAttribute('id', '420944487');
    metingElement.setAttribute('order', 'random');
    metingElement.setAttribute('list-folded', 'true');
    metingElement.setAttribute('list-max-height', '300px'); // 限制列表最大高度
    metingElement.setAttribute('fixed', 'false');
    metingElement.setAttribute('autoplay', 'false');
    metingElement.setAttribute('preload', 'auto');
    
    container.appendChild(metingElement);
    
    // 等待Meting初始化完成
    setTimeout(() => {
      const aplayerElement = container.querySelector('.aplayer');
      if (aplayerElement && aplayerElement.aplayer) {
        playerInstance = aplayerElement.aplayer;
        window.musicPlayerInstance = playerInstance;
        
        // 添加样式修复
        if (aplayerElement) {
          aplayerElement.style.boxShadow = 'none';
          aplayerElement.style.margin = '0';
          
          // 确保列表滚动正常
          const listElement = aplayerElement.querySelector('.aplayer-list');
          if (listElement) {
            listElement.style.maxHeight = '300px';
            listElement.style.overflowY = 'auto';
          }
        }
        
        console.log('播放器初始化完成');
      }
    }, 100);
  }
</script>

<!-- 播放器容器 -->
<div bind:this={container} class="music-player-container"></div>

<style>
  .music-player-container {
    width: 100%;
    position: relative;
  }
  
  /* 全局样式修复 */
  :global(.aplayer) {
    box-shadow: none !important;
    border-radius: 8px;
    overflow: hidden;
  }
  
  :global(.aplayer-list) {
    max-height: 300px !important;
    overflow-y: auto !important;
  }
  
  :global(.aplayer-list ol) {
    max-height: none !important;
  }
  
  /* 防止列表展开时影响页面布局 */
  :global(.aplayer.aplayer-withlist .aplayer-list) {
    position: relative !important;
  }
  
  /* 确保滚动条样式 */
  :global(.aplayer-list::-webkit-scrollbar) {
    width: 4px;
  }
  
  :global(.aplayer-list::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
  
  :global(.aplayer-list::-webkit-scrollbar-track) {
    background: transparent;
  }
</style>