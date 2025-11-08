declare module 'swagger-ui-express' {
  import type { Express, Request, Response, NextFunction } from 'express';
  
  interface SwaggerOptions {
    explorer?: boolean;
    swaggerOptions?: Record<string, any>;
    customCss?: string;
    customSiteTitle?: string;
  }
  
  const serve: Array<(req: Request, res: Response, next: NextFunction) => void>;
  const setup: (spec: any, options?: SwaggerOptions) => (req: Request, res: Response, next: NextFunction) => void;
  
  export { serve, setup };
}

