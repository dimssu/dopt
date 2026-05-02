import { Hono } from 'hono';
import { parseTenantConfig } from '@clinical-notes/config';
import { require as requirePerm } from '@clinical-notes/auth';

export const config = new Hono()
  .get('/', async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const tenant = await db.tenant.findUnique({ where: { id: auth.tenantId } });
    if (!tenant) return c.json({ error: 'not_found' }, 404);
    return c.json({ tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name }, config: tenant.config });
  })
  .put('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'config_change');
    const body = await c.req.json();
    const parsed = parseTenantConfig(body);
    const db = c.get('db');
    const updated = await db.tenant.update({
      where: { id: auth.tenantId },
      data: { config: parsed },
    });
    return c.json({ config: updated.config });
  });
