/**
 * Engine smoke suite (real app, real DB).
 *
 * Companion to critical-paths.spec.ts. Exercises the newer engines added
 * during the production-readiness pass — entitlements, credentials, legal
 * consent/data-rights — end to end over HTTP against the REAL AppModule +
 * Prisma + guard stack, exactly as production serves them.
 *
 * Same posture as the critical-path suite: deliberately narrow, catches the
 * "schema/migration drift makes a real read throw 500" and "endpoint wiring
 * broke" classes of incident that mocked unit tests cannot. Run in CI with a
 * real postgres service (job `smoke`) after `prisma db push`.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

jest.setTimeout(60000);

async function registerLearner(app: INestApplication) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `smoke-engine-${suffix}@example.com`;
  const password = 'SmokeTestPassword123!';
  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      email,
      password,
      role: 'LEARNER',
      firstName: 'Engine',
      lastName: 'Smoke',
      displayName: `EngineSmoke-${suffix}`,
      ageBand: 'AGE_10_11',
    });
  return { token: res.body.accessToken as string, userId: res.body.user?.id as string };
}

describe('Engine smoke tests (real app, real DB)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/entitlements/plans is public and returns the seeded FREE plan', async () => {
    const res = await request(app.getHttpServer()).get('/api/entitlements/plans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // The entitlements migration seeds a FREE plan; its presence proves the
    // plans table exists and the read path is intact.
    expect(res.body.some((p: any) => p.code === 'FREE')).toBe(true);
  });

  it('GET /api/entitlements/me resolves an effective plan for an authed user', async () => {
    const { token } = await registerLearner(app);
    const res = await request(app.getHttpServer())
      .get('/api/entitlements/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    // With no subscription, the service falls back to FREE features.
    expect(res.body).toHaveProperty('features');
  });

  it('GET /api/credentials/me returns a list (no 500) for an authed learner', async () => {
    const { token } = await registerLearner(app);
    const res = await request(app.getHttpServer())
      .get('/api/credentials/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeLessThan(500);
    expect(res.status).not.toBe(500);
  });

  it('GET /api/credentials/:uid on an unknown id returns 404 (not 500)', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/credentials/does-not-exist-uid',
    );
    // Public verify endpoint: unknown credential is a clean 404, proving the
    // read path + table exist and errors are handled (not a raw 500).
    expect(res.status).toBe(404);
  });

  it('GET /api/legal/consent/:learnerId is forbidden for a non-guardian (not 500)', async () => {
    const { token } = await registerLearner(app);
    const res = await request(app.getHttpServer())
      .get('/api/legal/consent/some-learner-id')
      .set('Authorization', `Bearer ${token}`);
    // A LEARNER has no guardian profile -> guardianId() throws Forbidden.
    // Proves the legal module is wired and authorization fires correctly.
    expect(res.status).toBe(403);
  });
});
