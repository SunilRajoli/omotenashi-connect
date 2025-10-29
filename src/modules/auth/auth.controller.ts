import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.ts';
import { ok } from '../../utils/http.ts';
import { signupSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validator.ts';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = signupSchema.parse(req.body);
      const user = await AuthService.signup(email, password, fullName);
      const { status, body } = ok({ user }, 201);
      res.status(status).json(body);
    } catch (e) { next(e); }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = String(req.query.token || '');
      await AuthService.verifyEmail(token);
      res.json({ ok: true, message: 'Email verified' });
    } catch (e) { next(e); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const data = await AuthService.login(email, password);
      res.json({ ok: true, ...data });
    } catch (e) { next(e); }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const tokens = await AuthService.refresh(refreshToken);
      res.json({ ok: true, tokens });
    } catch (e) { next(e); }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const out = await AuthService.logout(refreshToken);
      res.json(out);
    } catch (e) { next(e); }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const out = await AuthService.forgotPassword(email);
      res.json(out);
    } catch (e) { next(e); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      const out = await AuthService.resetPassword(token, newPassword);
      res.json(out);
    } catch (e) { next(e); }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string;
      const me = await AuthService.me(userId);
      res.json({ ok: true, user: me });
    } catch (e) { next(e); }
  }
}
