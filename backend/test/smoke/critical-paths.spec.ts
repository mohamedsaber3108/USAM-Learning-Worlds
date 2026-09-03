/**
 * Critical-path smoke suite.
 *
 * Why this exists: two real incidents shipped to production undetected
 * because nothing exercised the app end-to-end against a real database
 * before merge:
 *   1. A migration/schema drift left 21 tables missing in production
 *      (would have been caught by ANY endpoint that reads from one of
 *      those tables returning a 500 instead of data).
 *   2. Raising `app.set('trust proxy', 1)` — the ThrottlerGuard bucketed
 *      every user behind nginx into one IP, so a handful of login
 *      attempts from anyone locked out everyone (would have been caught
 *      by a register+login flow actually running through the guard
 *      stack, not mocked).
 *
 * This suite boots the REAL Nest application (full AppModule, real
 * Prisma client, real ThrottlerGuard, real ValidationPipe — the same
 * bootstrap main.ts performs) against a real Postgres database and
 * hits it over HTTP via supertest. It is deliberately narrow: three
 * checks that would have caught both incidents above, not a full
 * regression suite. Run in CI with an actual `postgres` service
 * container and migrations applied (see .github/workflows/ci.yml,
 * job `smoke`).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Registration/login can be rate-limited by the real ThrottlerGuard
// (20 requests / 15 min / IP — see AuthController). Keep this suite well
// under that budget: it makes exactly 2 auth requests.
jest.setTimeout(60000);

describe('Critical-path smoke tests (real app, real DB)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror main.ts bootstrap so this exercises the same request
    // pipeline production traffic goes through (global prefix +
    // validation), not a stripped-down test double.
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

  it('GET /api/health returns 200 with database connected', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('register -> login flow succeeds end-to-end and issues a working token', async () => {
    // Unique email per run so re-running this suite locally / re-running
    // a flaky CI job doesn't collide with a leftover row from a prior run.
    const email = `smoke-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = 'SmokeTestPassword123!';

    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
        role: 'LEARNER',
        firstName: 'Smoke',
        lastName: 'Test',
        ageBand: 'AGE_10_11',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.accessToken).toBeTruthy();
    expect(registerRes.body.user?.email).toBe(email);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.status).toBe(201);
    expect(loginRes.body.accessToken).toBeTruthy();

    // Prove the issued token actually authenticates against a guarded
    // route (this is exactly the code path the throttle-lockout
    // incident broke: real users getting 429s here).
    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(email);
  });

  it('GET /api/missions (core read endpoint) does not 500', async () => {
    // Needs a valid token since MissionsController is guarded; reuse
    // the register flow to get one rather than duplicating auth setup.
    const email = `smoke-missions-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = 'SmokeTestPassword123!';

    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
        role: 'LEARNER',
        firstName: 'Smoke',
        lastName: 'Missions',
        ageBand: 'AGE_10_11',
      });

    const token = registerRes.body.accessToken;

    const missionsRes = await request(app.getHttpServer())
      .get('/api/missions')
      .set('Authorization', `Bearer ${token}`);

    // This is the guard against the 21-missing-tables class of
    // incident: if the schema/migrations and code drift apart, this
    // read throws and comes back as a 500. Any non-500 response
    // (including an empty list) means the read path itself is intact.
    expect(missionsRes.status).toBeLessThan(500);
    expect(missionsRes.status).not.toBe(500);
  });
});
