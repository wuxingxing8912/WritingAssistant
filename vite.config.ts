import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = (env.VITE_ZHIPU_API_KEY ?? env.ZHIPU_API_KEY ?? '').trim();

  /**
   * 智谱接口不支持浏览器跨域直连，因此由本地开发/预览服务器代理转发，
   * 并在服务端注入 Authorization（同时浏览器自带的同名请求头也会被透传）。
   */
  const zhipuProxy: ProxyOptions = {
    target: 'https://open.bigmodel.cn',
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(/^\/api\/zhipu/, '/api/paas/v4'),
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: { '/api/zhipu': zhipuProxy },
    },
    preview: {
      port: 4173,
      proxy: { '/api/zhipu': zhipuProxy },
    },
  };
});
