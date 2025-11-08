declare module 'swagger-ui-express' {
  import type { Request, Response, NextFunction } from 'express';
  
  interface SwaggerOptions {
    explorer?: boolean;
    swaggerOptions?: Record<string, unknown>;
    customCss?: string;
    customSiteTitle?: string;
  }
  
  const serve: Array<(req: Request, res: Response, next: NextFunction) => void>;
  const setup: (spec: unknown, options?: SwaggerOptions) => (req: Request, res: Response, next: NextFunction) => void;
  
  export { serve, setup };
}

