import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// Serves /api/backups during `vite dev` so the shared cloud backup
// feature works in the v0 preview (Vite dev does not run Vercel functions).
function backupApiDevPlugin(databaseUrl?: string): Plugin {
  return {
    name: 'backup-api-dev',
    configureServer(server) {
      if (databaseUrl && !process.env.DATABASE_URL) {
        process.env.DATABASE_URL = databaseUrl;
      }
      server.middlewares.use('/api/backups', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          const store = await import('./api/_backupStore');
          const url = new URL(req.url || '', 'http://localhost');
          const id = url.searchParams.get('id');

          if (req.method === 'GET') {
            if (id) {
              const row = await store.getBackup(id);
              return row
                ? send(200, row)
                : send(404, {error: 'Cadangan tidak ditemukan.'});
            }
            return send(200, await store.listBackups());
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk as Buffer);
            const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
            if (!body.data || typeof body.data !== 'object') {
              return send(400, {error: 'Data cadangan tidak valid.'});
            }
            const row = await store.createBackup(
              body.label || 'Cadangan Otomatis',
              body.data,
              body.createdBy || 'Anonim',
            );
            return send(201, row);
          }

          if (req.method === 'DELETE') {
            if (!id) return send(400, {error: 'ID cadangan wajib diisi.'});
            await store.deleteBackup(id);
            return send(200, {ok: true});
          }

          return send(405, {error: 'Method tidak diizinkan.'});
        } catch (err: any) {
          console.error('[v0] backup dev api error:', err?.message || err);
          return send(500, {error: 'Terjadi kesalahan pada server cadangan.'});
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [react(), tailwindcss(), backupApiDevPlugin(env.DATABASE_URL)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
