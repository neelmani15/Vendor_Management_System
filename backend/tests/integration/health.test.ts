import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

describe('API Integration Tests', () => {
  const app = createApp();

  it('GET /health should return 200 with service metadata', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.environment).toBeDefined();
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('POST /api/v1/auth/login should return 400 when missing credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
