import server from '../../src/server';
import request from 'supertest';
import mongoose from 'mongoose';
import Tour from '../../src/models/tour.models';

let tourID: string;

describe('POST /api/v1/tours', () => {
  it('should create new tour in the DB', async () => {
    const response = await request(server)
      .post('/api/v1/tours')
      .set('Accept', 'application/json')
      .send({
        name: 'test',
        duration: 5,
        maxGroupSize: 25,
        difficulty: 'easy',
        ratingsAverage: 4.7,
        ratingsQuantity: 37,
        price: 999,
        summary: 'Breathtaking hike through the Canadian Banff National Park',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        imageCover: 'tour-1-cover.jpg',
        images: ['tour-1-1.jpg', 'tour-1-2.jpg', 'tour-1-3.jpg'],
        startDates: [
          '2021-04-25,10:00',
          '2021-07-20,10:00',
          '2021-10-05,10:00',
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ status: 'success' });
    expect(response.body.data.tour.name).toBe('test');
    expect(response.body.data.tour.price).toBe(999);

    tourID = response.body.data.tour._id;
  });
});

describe('GET /api/v1/tours', () => {
  it('should retrieve all tours from DB', async () => {
    const response = await request(server).get('/api/v1/tours');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'success' });
    expect(response.body.data.tours).toBeDefined();
    expect(response.body.data.tours).toHaveLength(1);
  });
});

describe('GET /api/v1/tours/:id', () => {
  it('should retrieve one tour from DB', async () => {
    const response = await request(server).get(`/api/v1/tours/${tourID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'success' });
    expect(response.body.data.tour).toBeDefined();
    expect(response.body.data.tour.name).toBe('test');
  });
});

describe('PATCH /api/v1/tours/:id', () => {
  it(`should update tour's name in the DB`, async () => {
    const response = await request(server)
      .patch(`/api/v1/tours/${tourID}`)
      .set('Accept', 'application/json')
      .send({ name: 'updated' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'success' });
    expect(response.body.data.tour).toBeDefined();
    expect(response.body.data.tour.name).toBe('updated');
  });
});

// describe('DELETE /api/v1/tours/:id', () => {
//   it(`should delete tour from the DB`, async () => {
//     const response = await request(server).delete(`/api/v1/tours/${tourID}`);

//     expect(response.status).toBe(204);
//     expect(response.body.data).toBeNull();
//   });
// });

afterAll(async () => {
  await Tour.deleteMany();
  server.close();
  mongoose.connection.close();
});
