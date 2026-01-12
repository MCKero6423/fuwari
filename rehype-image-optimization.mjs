import { visit } from 'unist-util-visit';

export function rehypeImageOptimization() {
  return (tree) => {
    // 1. 严谨写法：只遍历 element 类型的节点
    visit(tree, 'element', (node) => {
      
      // 2. 防御检查：必须是 img 标签，且必须有属性
      if (node.tagName !== 'img' || !node.properties) {
        return;
      }

      const src = node.properties.src;
      
      // 3. 防御检查：没有 src 属性直接跳过
      if (!src) return;

      let urlObj;
      try {
        // 4. 防御检查：尝试解析 URL，如果是相对路径会报错进入 catch
        urlObj = new URL(src);
      } catch (e) {
        // 解析失败（相对路径），只加懒加载，不处理链接
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // ============================================================
      // 业务逻辑：只处理 img.mckero.com
      // ============================================================
      if (urlObj.hostname !== 'img.mckero.com') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return;
      }

      // ============================================================
      // 业务逻辑：跳过 WebP/AVIF
      // ============================================================
      const pathname = urlObj.pathname.toLowerCase();
      if (pathname.endsWith('.webp') || pathname.endsWith('.avif')) {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return; 
      }

      // ============================================================
      // 业务逻辑：构造 Worker 链接
      // ============================================================
      const generateWorkerUrl = (originalSrc, width) => {
        const workerUrl = new URL('https://opt.mckero.com/');
        workerUrl.searchParams.set('url', originalSrc);
        if (width) {
          workerUrl.searchParams.set('width', width);
        }
        return workerUrl.toString();
      };

      // 修改 src (默认 800px)
      node.properties.src = generateWorkerUrl(src, 800);

      // 生成 srcset (500px 手机, 800px 电脑)
      const srcSmall = generateWorkerUrl(src, 500);
      const srcMedium = generateWorkerUrl(src, 800);
      node.properties.srcset = `${srcSmall} 500w, ${srcMedium} 800w`;

      // 补充标准属性
      node.properties.sizes = '(max-width: 600px) 500px, 800px';
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}