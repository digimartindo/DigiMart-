import { neon } from '@neondatabase/serverless';

/**
 * Shared data-access helpers for cloud backups.
 * Used by both the Vercel serverless function (api/backups.ts)
 * and the Vite dev middleware (vite.config.ts) so the feature
 * works identically in the v0 preview and in production.
 */
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function listBackups() {
  const sql = getSql();
  return sql`
    SELECT id, label, created_by, created_at, pg_column_size(data) AS size_bytes
    FROM app_backups
    ORDER BY created_at DESC
    LIMIT 100
  `;
}

export async function getBackup(id: string | number) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, label, data, created_by, created_at
    FROM app_backups
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createBackup(label: string, data: unknown, createdBy: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO app_backups (label, data, created_by)
    VALUES (${label}, ${JSON.stringify(data)}, ${createdBy})
    RETURNING id, label, created_by, created_at
  `;
  return rows[0];
}

export async function deleteBackup(id: string | number) {
  const sql = getSql();
  await sql`DELETE FROM app_backups WHERE id = ${id}`;
}
