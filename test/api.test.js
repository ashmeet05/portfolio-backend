// Run with a test database:  MONGO_URI=mongodb://127.0.0.1:27017/test npm test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-that-is-long-enough-1234567890';
process.env.ADMIN_EMAILS = 'admin@example.com';

const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/user');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_test';

describe('Portfolio API', function () {
  let adminToken, userToken, userId, otherUserId, projectId, serviceId, referenceId;

  before(async () => {
    process.env.MONGO_URI = MONGO_URI;
    process.env.DNS_SERVERS = 'system';
    await connectDB();
    await mongoose.connection.db.dropDatabase();
    await User.init();
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  describe('auth', () => {
    it('signs up a normal user without returning the password', async () => {
      const res = await request(app).post('/api/auth/signup')
        .send({ firstname: 'Test', lastname: 'User', email: 'TestUser@Example.com', password: 'password123' });
      assert.strictEqual(res.status, 201);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.email, 'testuser@example.com');
      assert.strictEqual(res.body.user.isAdmin, false);
      assert.strictEqual(res.body.user.password, undefined);
      userToken = res.body.token;
      userId = String(res.body.user.id);
    });

    it('signs up the admin', async () => {
      const res = await request(app).post('/api/auth/signup')
        .send({ firstname: 'Admin', lastname: 'Owner', email: 'admin@example.com', password: 'adminpass123' });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.user.isAdmin, true);
      adminToken = res.body.token;
    });

    it('stores the password hashed', async () => {
      const u = await User.findOne({ email: 'testuser@example.com' }).select('+password');
      assert.notStrictEqual(u.password, 'password123');
      assert.ok(u.password.startsWith('$2'));
    });

    it('rejects duplicate emails, short passwords and missing fields', async () => {
      let res = await request(app).post('/api/auth/signup')
        .send({ firstname: 'A', lastname: 'B', email: 'testuser@example.com', password: 'password123' });
      assert.strictEqual(res.status, 400);
      res = await request(app).post('/api/auth/signup')
        .send({ firstname: 'A', lastname: 'B', email: 'x@example.com', password: 'short' });
      assert.strictEqual(res.status, 400);
      res = await request(app).post('/api/auth/signup').send({ email: 'y@example.com' });
      assert.strictEqual(res.status, 400);
    });

    it('signs in with the right password only', async () => {
      let res = await request(app).post('/api/auth/signin')
        .send({ email: 'testuser@example.com', password: 'password123' });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.token);
      res = await request(app).post('/api/auth/signin')
        .send({ email: 'testuser@example.com', password: 'wrongpass' });
      assert.strictEqual(res.status, 401);
    });

    it('blocks NoSQL-injection login attempts', async () => {
      const res = await request(app).post('/api/auth/signin')
        .send({ email: { $ne: null }, password: { $ne: null } });
      assert.strictEqual(res.status, 401);
    });

    it('rejects forged and missing tokens', async () => {
      const forged = jwt.sign({ id: userId }, 'old-leaked-secret');
      let res = await request(app).post('/api/projects').set('Authorization', `Bearer ${forged}`).send({ title: 'x' });
      assert.strictEqual(res.status, 401);
      res = await request(app).post('/api/projects').send({ title: 'x' });
      assert.strictEqual(res.status, 401);
    });
  });

  describe('projects and services (public read, admin write)', () => {
    it('admin can create, update and delete a project', async () => {
      let res = await request(app).post('/api/projects').set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'My Project', completion: '2024-01-15', description: 'Desc', hacked: true });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.hacked, undefined);
      projectId = String(res.body.data.id);

      res = await request(app).put(`/api/projects/${projectId}`).set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Renamed' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.title, 'Renamed');
    });

    it('anyone can read projects', async () => {
      let res = await request(app).get('/api/projects');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 1);
      assert.ok(res.body.data[0].id && res.body.data[0]._id);
      res = await request(app).get(`/api/projects/${projectId}`);
      assert.strictEqual(res.status, 200);
    });

    it('a normal signed-in user cannot change projects', async () => {
      let res = await request(app).post('/api/projects').set('Authorization', `Bearer ${userToken}`).send({ title: 'Spam' });
      assert.strictEqual(res.status, 403);
      res = await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${userToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('handles bad and unknown ids without crashing', async () => {
      let res = await request(app).get('/api/projects/not-an-id');
      assert.strictEqual(res.status, 400);
      res = await request(app).get(`/api/projects/${new mongoose.Types.ObjectId()}`);
      assert.strictEqual(res.status, 404);
    });

    it('services work the same way', async () => {
      let res = await request(app).post('/api/services').set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Web Design', description: 'Sites' });
      assert.strictEqual(res.status, 201);
      serviceId = String(res.body.data.id);
      res = await request(app).get('/api/services');
      assert.strictEqual(res.body.data.length, 1);
      res = await request(app).post('/api/services').set('Authorization', `Bearer ${userToken}`).send({ title: 'x' });
      assert.strictEqual(res.status, 403);
      res = await request(app).delete(`/api/services/${serviceId}`).set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
    });

    it('admin can delete a project', async () => {
      const res = await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
    });
  });

  describe('references (admin only)', () => {
    it('hides references from the public and normal users', async () => {
      let res = await request(app).get('/api/references');
      assert.strictEqual(res.status, 401);
      res = await request(app).get('/api/references').set('Authorization', `Bearer ${userToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('admin can manage references', async () => {
      let res = await request(app).post('/api/references').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstname: 'Ref', lastname: 'One', email: 'ref@example.com', position: 'Lead', company: 'Co' });
      assert.strictEqual(res.status, 201);
      referenceId = String(res.body.data.id);
      res = await request(app).get('/api/references').set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.body.data.length, 1);
    });
  });

  describe('users', () => {
    it('does not show the user list to the public or normal users', async () => {
      let res = await request(app).get('/api/users');
      assert.strictEqual(res.status, 401);
      res = await request(app).get('/api/users').set('Authorization', `Bearer ${userToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('admin sees users, never with passwords', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 2);
      res.body.data.forEach(u => assert.strictEqual(u.password, undefined));
    });

    it('only admin can create users directly, and their passwords are hashed', async () => {
      let res = await request(app).post('/api/users')
        .send({ firstname: 'X', lastname: 'Y', email: 'anon@example.com', password: 'password123' });
      assert.strictEqual(res.status, 401);
      res = await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstname: 'Other', lastname: 'Person', email: 'other@example.com', password: 'password123' });
      assert.strictEqual(res.status, 201);
      otherUserId = String(res.body.data.id);
      const u = await User.findById(otherUserId).select('+password');
      assert.ok(u.password.startsWith('$2'));
    });

    it('a user can edit themselves (password gets hashed) but not others', async () => {
      let res = await request(app).put(`/api/users/${userId}`).set('Authorization', `Bearer ${userToken}`)
        .send({ firstname: 'Changed', password: 'newpassword1' });
      assert.strictEqual(res.status, 200);
      const u = await User.findById(userId).select('+password');
      assert.ok(u.password.startsWith('$2'));
      res = await request(app).post('/api/auth/signin').send({ email: 'testuser@example.com', password: 'newpassword1' });
      assert.strictEqual(res.status, 200);

      res = await request(app).put(`/api/users/${otherUserId}`).set('Authorization', `Bearer ${userToken}`)
        .send({ password: 'takeover123' });
      assert.strictEqual(res.status, 403);
      res = await request(app).delete(`/api/users/${otherUserId}`).set('Authorization', `Bearer ${userToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('an empty password on edit keeps the old one', async () => {
      const res = await request(app).put(`/api/users/${otherUserId}`).set('Authorization', `Bearer ${adminToken}`)
        .send({ firstname: 'Renamed', password: '' });
      assert.strictEqual(res.status, 200);
      const login = await request(app).post('/api/auth/signin').send({ email: 'other@example.com', password: 'password123' });
      assert.strictEqual(login.status, 200);
    });

    it('admin can delete a user, and their old token stops working', async () => {
      const login = await request(app).post('/api/auth/signin').send({ email: 'other@example.com', password: 'password123' });
      let res = await request(app).delete(`/api/users/${otherUserId}`).set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
      res = await request(app).get(`/api/users/${otherUserId}`).set('Authorization', `Bearer ${login.body.token}`);
      assert.strictEqual(res.status, 401);
    });
  });

  describe('general', () => {
    it('returns JSON 404 for unknown routes and sets security headers', async () => {
      const res = await request(app).get('/nope');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.headers['x-content-type-options']);
    });

    it('allows the local frontend origin and blocks unknown websites', async () => {
      let res = await request(app).get('/api/projects').set('Origin', 'http://localhost:3000');
      assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
      res = await request(app).get('/api/projects').set('Origin', 'https://evil.example');
      assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
    });

    it('rate-limits repeated login attempts', async () => {
      let last;
      for (let i = 0; i < 25; i++) {
        last = await request(app).post('/api/auth/signin').send({ email: 'nobody@example.com', password: 'wrongpass' });
      }
      assert.strictEqual(last.status, 429);
    });
  });
});
