import { Sequelize } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load CLI config
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cliConfig = require('../config/config.cjs')[process.env.NODE_ENV || 'development'];

dotenv.config();
const sequelize = new Sequelize(cliConfig.database, cliConfig.username, cliConfig.password, cliConfig);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected');

    const qi = sequelize.getQueryInterface();
    const tables = (await qi.showAllTables()).map((t: string | { tableName: string }) => (typeof t === 'string' ? t : t.tableName)).sort();

    // Load model files
    const modelsDir = path.resolve(__dirname, '../models');
    const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts') || f.endsWith('.js')).sort();

    const missingInDB: string[] = [];
    const missingInModels: string[] = [];

    // naive mapping: tableName from model definition via init options
    // We’ll rely on convention: file name → expected table name as above.
    const expectedTablesFromModels: string[] = [];

    const mapName = (fname: string) =>
      fname
        .replace(/\.model\.(ts|js)$/, '')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase() + 's';

    for (const f of modelFiles) {
      if (!/\.model\.(ts|js)$/.test(f)) continue;
      const guess = mapName(f);
      expectedTablesFromModels.push(guess);
    }

    for (const t of expectedTablesFromModels) {
      if (!tables.includes(t)) missingInDB.push(t);
    }
    for (const t of tables) {
      // skip SequelizeMeta and views
      if (t === 'SequelizeMeta' || t === 'sequelize_meta') continue;
      // crude: mark tables that don't have a corresponding model
      const hasModel = expectedTablesFromModels.includes(t);
      if (!hasModel && !t.endsWith('_view')) missingInModels.push(t);
    }

    console.log('Tables in DB:', tables.length);
    if (missingInDB.length) console.log('⚠️ Tables expected from models but missing in DB:', missingInDB);
    if (missingInModels.length) console.log('⚠️ Tables present in DB but missing models:', missingInModels);
    if (!missingInDB.length && !missingInModels.length) console.log('✅ Basic DB ↔ model presence looks aligned');

    await sequelize.close();
  } catch (e) {
    console.error('❌ Verify error:', e);
    process.exit(1);
  }
}

main();
