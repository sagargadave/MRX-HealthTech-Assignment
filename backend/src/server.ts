import dotenv from 'dotenv';
import app from './app';
import { testConnection } from './config/database';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await testConnection();
  } catch (err) {
    console.error('[server] Failed to connect to MySQL. Check your .env settings.', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] Healthcare Monitoring Dashboard API listening on http://localhost:${PORT}`);
    console.log(`[server] Swagger API docs available at http://localhost:${PORT}/api-docs`);
  });
}

start();
