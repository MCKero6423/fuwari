import { visit } from 'unist-util-visit';

export function rehypeImageOptimization() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      
      // 1. 基础防御检查
      if (node.tagName !== 'img' || !node.properties) return;
      
      const src = node.properties.src;
      if (!src) return;

      let urlObj;
      try {
        urlObj = new URL(src);
      } catch (e) {
        // 相对路径兜底
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

      // 4. 构造 Worker 链接函数
      const generateWorkerUrl = (originalSrc, width) => {
        const workerUrl = new URL('https://opt.mckero.com/');
        workerUrl.searchParams.set('url', originalSrc);
        if (width) workerUrl.searchParams.set('width', width);
        return workerUrl.toString();
      };

      // ============================================================
      // 核心升级区域
      // ============================================================

      // 默认 src (回落地址): 给 800w，保证兼容性
      node.properties.src = generateWorkerUrl(src, 800);

      // 生成三档 srcset：
      // 500w: 省流/小屏
      // 800w: 标准/PC
      // 1200w: 高清/Retina
      const s500 = generateWorkerUrl(src, 500);
      const s800 = generateWorkerUrl(src, 800);
      const s1200 = generateWorkerUrl(src, 1200);
      
      node.properties.srcset = `${s500} 500w, ${s800} 800w, ${s1200} 1200w`;

      // 升级 sizes 逻辑：
      // (max-width: 600px) 100vw -> 手机端：图片宽度 = 屏幕宽度 (更符合实际)
      // 800px -> 电脑端：图片最大就是 800px (文章容器宽度)
      node.properties.sizes = '(max-width: 600px) 100vw, 800px';
      
      // 标准优化属性
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}