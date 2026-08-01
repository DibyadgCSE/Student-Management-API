const request = require('supertest');
const app = require('../../src/app'); // Import the Express app (not the server)

describe('Health Check API', () => {
  it('should return 200 OK and success message', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Student Management API is running healthy');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 404 for an unknown route', async () => {
    const res = await request(app).get('/unknown-route-123');
    
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Not Found/);
  });
});
