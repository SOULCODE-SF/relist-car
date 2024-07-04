const db = require('../db');
const { getUser } = require('../src/controllers/adminController');

describe('getUser function', () => {
  it('should return list of users', async () => {
    const req = {};
    const res = {
      send: jest.fn(),
    };

    await getUser(req, res);

    expect(res.send).toHaveBeenCalled();
    const responseData = res.send.mock.calls[0][0];
    expect(responseData).toHaveLength(2);
  });

  it('should handle errors', async () => {
    const req = {};
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mock db.query to throw an error
    jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'));

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Database error');
  });
});
