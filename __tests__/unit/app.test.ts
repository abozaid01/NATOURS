import request from 'supertest';
import server from './../../src/app';

describe('Express App', () => {
  it('responds with JSON message on /', async () => {
    const response = await request(server).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, World!!!' });
  });

  it('responds with 404 on unknown routes', async () => {
    const response = await request(server).get('/nonexistent-route');

    expect(response.status).toBe(404);
  });

  afterAll(() => {
    server.close();
  });
});
