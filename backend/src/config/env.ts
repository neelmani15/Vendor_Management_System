import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).default('5000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/fieldnerve'),
  JWT_SECRET: z.string().min(16).default('super-secret-jwt-key-fieldnerve-development-min-32-chars'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  AI_PROVIDER: z.enum(['deterministic', 'openai']).default('deterministic'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
