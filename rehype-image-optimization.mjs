import { visit } from 'unist-util-visit';

export function rehypeImageOptimization() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      
      // 1. 基础防御：只处理 img 标签且有属性的
      if (node.tagName !== 'img' || !node.properties) return;
      
      const src = node.properties.src;
      // 没有 src 或者是相对路径导致解析失败的，直接跳过
      if (!src) return;

      let urlObj;
      try {
        urlObj = new URL(src);
      } catch (e) {
        // 相对路径兜底优化
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // 2. 业务逻辑：只处理 img.mckero.com (你的橱窗)
      if (urlObj.hostname !== 'img.mckero.com') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return;
      }

      // 3. 业务逻辑：跳过 WebP/AVIF (Worker 处理不了)
      const pathname = urlObj.pathname.toLowerCase();
      if (pathname.endsWith('.webp') || pathname.endsWith('.avif')) {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // ============================================================
      // 🚨 核心修正：适配 Photon 的 action 参数 🚨
      // 格式：action=resize!宽,高,模式
      // 高度设为 0 代表自适应，模式 2 代表缩放
      // ============================================================
      const generateWorkerUrl = (originalSrc, targetWidth) => {
        const workerUrl = new URL('https://opt.mckero.com/');
        
        // 1. 设置 url 参数 (原图地址)
        workerUrl.searchParams.set('url', originalSrc);
        
        // 2. 设置 action 参数 (这才是 Worker 能看懂的指令！)
        if (targetWidth) {
          // 例如：resize!800,0,2
          workerUrl.searchParams.set('action', `resize!${targetWidth},0,2`);
        }
        
        return workerUrl.toString();
      };

      // ============================================================
      // 生成四档 srcset (500, 800, 1200, 1600)
      // ============================================================

      // 默认 src: 给 800w (兼容性兜底)
      node.properties.src = generateWorkerUrl(src, 800);

      const s500 = generateWorkerUrl(src, 500);
      const s800 = generateWorkerUrl(src, 800);
      const s1200 = generateWorkerUrl(src, 1200);
      const s1600 = generateWorkerUrl(src, 1600);
      
      node.properties.srcset = `${s500} 500w, ${s800} 800w, ${s1200} 1200w, ${s1600} 1600w`;

      // sizes 逻辑 (手机满屏，电脑最大800)
      node.properties.sizes = '(max-width: 600px) 100vw, 800px';
      
      // 标准优化属性
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}