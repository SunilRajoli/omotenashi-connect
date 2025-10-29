// Small shared helpers for API responses & errors
export class ApiError extends Error {
    status: number;
    meta?: any;
    constructor(status: number, message: string, meta?: any) {
      super(message);
      this.status = status;
      this.meta = meta;
    }
  }
  
  export function ok(data: any = {}, status = 200) {
    return { status, body: { ok: true, data } };
  }
  
  export function fail(status: number, message: string, meta?: any) {
    return { status, body: { ok: false, error: message, meta } };
  }
  