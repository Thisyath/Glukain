import app from './app';
import { env } from './config/env';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   Glukain API Server                             ║
  ║   AI Pemantau Mandiri Pasien Diabetes            ║
  ╠══════════════════════════════════════════════════╣
  ║   Server running on http://localhost:${PORT}        ║
  ║   Environment: ${env.nodeEnv.padEnd(36)}║
  ╚══════════════════════════════════════════════════╝
  `);
});
