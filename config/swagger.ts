
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'yaml';
import type { Express } from 'express';

export function mountSwagger(app: Express) {
  const file = path.join(process.cwd(), 'docs', 'openapi.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  const spec = parse(raw);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}
