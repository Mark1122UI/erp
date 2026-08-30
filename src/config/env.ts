import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/universal_erp'),
  JWT_SECRET: z.string().default('erp_super_secret_jwt_key_development_only_change_in_prod'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().default('erp_refresh_super_secret_key_development_only'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('erp_cookie_secret_sign_key_development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:4000'),
  APP_NAME: z.string().default('Universal ERP / BOS'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
