import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
}

export const tokenService = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '15m',
    });
  },

  generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { userId: string };
  },

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = env.NODE_ENV === 'production';

    // Access Token Cookie (15 mins)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Refresh Token Cookie (7 days)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  },

  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  },
};
