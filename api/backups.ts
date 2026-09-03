import { listBackups, getBackup, createBackup, deleteBackup } from './_backupStore';

/**
 * Shared cloud backup endpoint (Vercel serverless function).
 * Every user reads/writes the same table, so backups are visible on all devices.
 *
 *  GET    /api/backups        -> list backups (metadata only, newest first)
 *  GET    /api/backups?id=123 -> full backup (with data) for restore
 *  POST   /api/backups        -> create a new backup  { label, data, createdBy }
 *  DELETE /api/backups?id=123 -> delete a backup
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (!process.env.DATABASE_URL) {
      return res
        .status(500)
        .json({ error: 'Database belum terkonfigurasi (DATABASE_URL kosong).' });
    }

    if (req.method === 'GET') {
      const id = req.query?.id;
      if (id) {
        const row = await getBackup(id);
        if (!row) return res.status(404).json({ error: 'Cadangan tidak ditemukan.' });
        return res.status(200).json(row);
      }
      return res.status(200).json(await listBackups());
    }

    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { label, data, createdBy } = body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Data cadangan tidak valid.' });
      }
      const row = await createBackup(
        label || 'Cadangan Otomatis',
        data,
        createdBy || 'Anonim'
      );
      return res.status(201).json(row);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ error: 'ID cadangan wajib diisi.' });
      await deleteBackup(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
  } catch (err: any) {
    console.error('[v0] backup api error:', err?.message || err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server cadangan.' });
  }
}
