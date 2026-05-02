import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import { authMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { errorHandler } from './middleware/errors.js';
import { health } from './routes/health.js';
import { encounters } from './routes/encounters.js';
import { patients } from './routes/patients.js';
import { notes } from './routes/notes.js';
import { transcripts } from './routes/transcripts.js';
import { audit } from './routes/audit.js';
import { config } from './routes/config.js';

export const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({ origin: (o) => o ?? '*', credentials: true }));

app.route('/health', health);

const v1 = new Hono();
v1.use('*', authMiddleware);
v1.use('*', tenantMiddleware);
v1.route('/patients', patients);
v1.route('/encounters', encounters);
v1.route('/transcripts', transcripts);
v1.route('/notes', notes);
v1.route('/audit', audit);
v1.route('/config', config);

app.route('/v1', v1);

app.onError(errorHandler);
