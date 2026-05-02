import { serve } from '@hono/node-server';
import pino from 'pino';

import { app } from './app.js';

const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  log.info({ port: info.port }, 'api listening');
});
