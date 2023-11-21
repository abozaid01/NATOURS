import request from 'supertest';
import server from '../../src/app';

describe('GET /api/greet', () => {
  it('should respond with JSON message', async () => {
    const response = await request(server).get('/api/v1/greet');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Greetings!' });
  });
});

afterAll(async () => {
  server.close();
});
