import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function mediapipePoseAssetsPlugin(): Plugin {
  const mpDir = path.resolve(process.cwd(), 'node_modules/@mediapipe/pose');
  const mimeMap: Record<string, string> = {
    '.js': 'application/javascript; charset=utf-8',
    '.wasm': 'application/wasm',
    '.tflite': 'application/octet-stream',
    '.data': 'application/octet-stream',
    '.binarypb': 'application/octet-stream',
  };

  return {
    name: 'serve-mediapipe-pose-assets',
    configureServer(server) {
      server.middlewares.use('/mediapipe/pose', (req, res, next) => {
        const cleanUrl = (req.url || '').split('?')[0].replace(/^\/+/, '');
        if (!cleanUrl || cleanUrl.includes('..')) return next();
        const filePath = path.join(mpDir, cleanUrl);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
    writeBundle(options) {
      const outDir = options.dir || path.resolve(process.cwd(), 'dist');
      const targetDir = path.join(outDir, 'mediapipe', 'pose');
      if (!fs.existsSync(mpDir)) return;
      fs.mkdirSync(targetDir, { recursive: true });
      for (const file of fs.readdirSync(mpDir)) {
        const ext = path.extname(file);
        if (ext in mimeMap && !['pose_landmark_heavy.tflite', 'pose_landmark_lite.tflite'].includes(file)) {
          fs.copyFileSync(path.join(mpDir, file), path.join(targetDir, file));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mediapipePoseAssetsPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
