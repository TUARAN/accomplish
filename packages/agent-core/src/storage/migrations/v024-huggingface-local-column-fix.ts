import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 24,
  up: (db: Database) => {
    const columns = db.prepare('PRAGMA table_info(app_settings)').all() as Array<{ name: string }>;
    const hasHuggingFaceLocalConfig = columns.some(
      (column) => column.name === 'huggingface_local_config',
    );

    if (!hasHuggingFaceLocalConfig) {
      db.exec('ALTER TABLE app_settings ADD COLUMN huggingface_local_config TEXT');
    }
  },
  down: (_db: Database) => {
    // SQLite cannot drop columns safely in-place.
  },
};
