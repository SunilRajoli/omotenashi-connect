import * as path from 'path';
import * as fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';
import type { Express } from 'express';

export function mountSwagger(app: Express) {
  // assuming docs/openapi.yaml is at projectRoot/docs/openapi.yaml
  const openapiPath = path.resolve(__dirname, '../docs/openapi.yaml');
  let spec: Record<string, unknown> = {};
  if (fs.existsSync(openapiPath)) {
    const raw = fs.readFileSync(openapiPath, 'utf-8');
    spec = parse(raw);
  }
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec || undefined));
}
