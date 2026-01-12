import { visit } from 'unist-util-visit';

export function rehypeImageOptimization() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      
      // 1. 基础防御
      if (node.tagName !== 'img' || !node.properties) return;
      
      const src = node.properties.src;
      if (!src) return;

      let urlObj;
      try {
        urlObj = new URL(src);
      } catch (e) {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // 2. 业务逻辑：只处理 img.mckero.com
      if (urlObj.hostname !== 'img.mckero.com') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return;
      }

      // 3. 业务逻辑：跳过 WebP/AVIF
      const pathname = urlObj.pathname.toLowerCase();
      if (pathname.endsWith('.webp') || pathname.endsWith('.avif')) {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // 4. 构造 Worker 链接
      const generateWorkerUrl = (originalSrc, width) => {
        const workerUrl = new URL('https://opt.mckero.com/');
        workerUrl.searchParams.set('url', originalSrc);
        if (width) workerUrl.searchParams.set('width', width);
        return workerUrl.toString();
      };

      // ============================================================
      // 最终版配置：四大金刚 (500, 800, 1200, 1600)
      // ============================================================

      // 默认 src: 给 800w (兼容性最好)
      node.properties.src = generateWorkerUrl(src, 800);

      // 生成 srcset
      const s500 = generateWorkerUrl(src, 500);
      const s800 = generateWorkerUrl(src, 800);
      const s1200 = generateWorkerUrl(src, 1200);
      const s1600 = generateWorkerUrl(src, 1600); // 新增：MacBook/4K 专用
      
      node.properties.srcset = `${s500} 500w, ${s800} 800w, ${s1200} 1200w, ${s1600} 1600w`;

      // sizes 逻辑 (保持不变)
      // 手机端占满屏，电脑端最大 800px
      node.properties.sizes = '(max-width: 600px) 100vw, 800px';
      
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}