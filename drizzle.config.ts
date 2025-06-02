import type { Config } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Parse DATABASE_URL
const url = new URL(process.env.DATABASE_URL);
const [username, password] = url.username.split(':');

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: username,
    password: password || url.password,
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false
    }
  },
} satisfies Config;
