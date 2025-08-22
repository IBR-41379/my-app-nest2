import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('/announcements (GET)', () => {
    it('should return announcements list', () => {
      return request(app.getHttpServer())
        .get('/announcements')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.headers).toHaveProperty('etag');
        });
    });

    it('should return 304 when ETag matches', async () => {
      // First request to get ETag
      const firstResponse = await request(app.getHttpServer())
        .get('/announcements')
        .expect(200);

      const etag = firstResponse.headers.etag;

      // Second request with ETag
      return request(app.getHttpServer())
        .get('/announcements')
        .set('If-None-Match', etag)
        .expect(304);
    });
  });

  describe('/announcements/:id/reactions (POST)', () => {
    it('should add a reaction', () => {
      return request(app.getHttpServer())
        .post('/announcements/1/reactions')
        .set('x-user-id', 'user-123')
        .send({ type: 'up' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('type', 'up');
        });
    });

    it('should handle idempotency', async () => {
      const idempotencyKey = 'test-key-123';
      
      // First request
      const firstResponse = await request(app.getHttpServer())
        .post('/announcements/1/reactions')
        .set('x-user-id', 'user-123')
        .set('Idempotency-Key', idempotencyKey)
        .send({ type: 'up' })
        .expect(200);

      // Second request with same idempotency key
      const secondResponse = await request(app.getHttpServer())
        .post('/announcements/1/reactions')
        .set('x-user-id', 'user-123')
        .set('Idempotency-Key', idempotencyKey)
        .send({ type: 'up' })
        .expect(200);

      expect(firstResponse.body).toEqual(secondResponse.body);
    });
  });

  describe('/announcements/:id/comments (POST)', () => {
    it('should add a comment', () => {
      return request(app.getHttpServer())
        .post('/announcements/1/comments')
        .send({
          authorName: 'John Doe',
          text: 'This is a test comment'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('authorName', 'John Doe');
          expect(res.body).toHaveProperty('text', 'This is a test comment');
          expect(res.body).toHaveProperty('createdAt');
        });
    });

    it('should validate comment length', () => {
      return request(app.getHttpServer())
        .post('/announcements/1/comments')
        .send({
          authorName: 'John Doe',
          text: 'a'.repeat(501) // Too long
        })
        .expect(400);
    });
  });

  describe('/announcements/:id/comments (GET)', () => {
    it('should get paginated comments', () => {
      return request(app.getHttpServer())
        .get('/announcements/1/comments')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should handle pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/announcements/1/comments?limit=5&cursor=abc123')
        .expect(200);
    });
  });
});
