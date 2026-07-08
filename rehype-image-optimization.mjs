import { visit } from 'unist-util-visit';

export function rehypeImageOptimization() {
  return (tree) => {
    visit(tree, 'element', (node) => {

      // 1. 基础防御：只处理 img 标签且有属性的
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

      // 3. 不再跳过 WebP/AVIF —— Cloudflare 可以对任意源格式做尺寸缩放，
      //    并通过 format=auto 自动为浏览器输出最优格式，所以全部走转换

      // ============================================================
      // ✅ 使用 Cloudflare Image Transformations（/cdn-cgi/image/）
      // 直接在 img.mckero.com 上生效，不再依赖 opt.mckero.com Worker
      // ============================================================
      const generateCdnUrl = (targetWidth) => {
        const options = `width=${targetWidth},format=auto,quality=80`;
        return `https://img.mckero.com/cdn-cgi/image/${options}${urlObj.pathname}`;
      };

      // 生成四档 srcset
      node.properties.src = generateCdnUrl(800);
      const s500 = generateCdnUrl(500);
      const s800 = generateCdnUrl(800);
      const s1200 = generateCdnUrl(1200);
      const s1600 = generateCdnUrl(1600);

      node.properties.srcset = `${s500} 500w, ${s800} 800w, ${s1200} 1200w, ${s1600} 1600w`;
      node.properties.sizes = '(max-width: 600px) 100vw, 800px';
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}