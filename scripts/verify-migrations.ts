import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load CLI config (CJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cliConfig = require('../config/config.cjs')[process.env.NODE_ENV || 'development'];

dotenv.config();
const sequelize = new Sequelize(cliConfig.database, cliConfig.username, cliConfig.password, cliConfig);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected');

    // 1) read filesystem migrations
    const migDir = path.resolve(process.cwd(), 'migrations');
    const files = fs
      .readdirSync(migDir)
      .filter(f => /\.(cjs|js)$/.test(f))
      .sort(); // alphabetical → timestamp order

    // 2) read SequelizeMeta (if it exists)
    let applied: string[] = [];
    try {
      const [rows] = await sequelize.query(`SELECT name FROM "SequelizeMeta" ORDER BY name ASC;`);
      applied = (rows as Array<{ name: string }>).map(r => r.name);
    } catch (err: unknown) {
      const error = err as { parent?: { code?: string } };
      // If SequelizeMeta doesn't exist, no migrations have been run yet
      if (error.parent?.code === '42P01') {
        console.log('ℹ️  SequelizeMeta table does not exist - no migrations have been run yet');
      } else {
        throw err;
      }
    }

    // 3) sets
    const fileSet = new Set(files);
    const appliedSet = new Set(applied);

    const pending = files.filter(f => !appliedSet.has(f));
    const orphaned = applied.filter(name => !fileSet.has(name));

    // 4) sanity: strictly increasing timestamp prefixes
    const ts = (s: string) => {
      const p = s.split('-')[0].replace('.cjs', '').replace('.js', '');
      return p.replace(/[^0-9]/g, '');
    };
    const badOrder = files.some((f, i) => i > 0 && ts(files[i - 1]) > ts(f));

    console.log('📁 Files in migrations/:', files.length);
    console.log('🗂️  Applied (SequelizeMeta):', applied.length);

    if (pending.length) console.log('⏳ Pending (not applied):', pending);
    if (!pending.length) console.log('✅ No pending migrations.');

    if (orphaned.length) console.log('⚠️ Orphaned (applied but file missing):', orphaned);
    if (!orphaned.length) console.log('✅ No orphaned migrations.');

    if (badOrder) {
      console.log('⚠️ Warning: migration filenames are not strictly increasing by timestamp.');
    } else {
      console.log('✅ Filenames are in increasing timestamp order.');
    }

    // 5) optional: check that every file exports up/down (static check)
    const missingExports: string[] = [];
    for (const f of files) {
      const full = path.join(migDir, f);
      const src = fs.readFileSync(full, 'utf-8');
      if (!/module\.exports\s*=\s*{[\s\S]*up\s*:/.test(src) || !/down\s*:/.test(src)) {
        missingExports.push(f);
      }
    }
    if (missingExports.length) console.log('⚠️ Files missing up/down exports:', missingExports);
    else console.log('✅ All migrations export up/down.');

    await sequelize.close();
  } catch (e) {
    console.error('❌ Verify error:', e);
    process.exit(1);
  }
}

main();
