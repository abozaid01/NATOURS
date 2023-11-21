import request from 'supertest';
import express from 'express';
import apiRoutes from '../../src/routes/api';

const app = express();
app.use('/api/v1', apiRoutes);

describe('API Router', () => {
  it('should respond with JSON message on /greet', async () => {
    const response = await request(app).get('/api/v1/greet');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Greetings!' });
  });
});
