import faker from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import * as request from 'supertest';

describe('Auth controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const baseUrl = '/auth';

  describe('local auth', () => {
    it('should login a user', async () => {
      const data = {
        name: faker.datatype.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer()).post('/users').send(data).expect(201);

      const { body } = await request(app.getHttpServer())
        .post(`${baseUrl}/password`)
        .send({
          email: data.email,
          password: data.password,
        })
        .expect(200);

      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('accessToken');
    });

    it('should not login a user with invalid credentials', async () => {
      const data = {
        name: faker.datatype.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer()).post('/users').send(data).expect(201);

      await request(app.getHttpServer())
        .post(`${baseUrl}/password`)
        .send({
          email: data.email,
          password: '123',
        })
        .expect(401);

      await request(app.getHttpServer())
        .post(`${baseUrl}/password`)
        .send({
          email: faker.internet.email(),
          password: data.password,
        })
        .expect(401);
    });

    it('should generate news tokens by a valid refresh token', async () => {
      const data = {
        name: faker.datatype.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app.getHttpServer()).post('/users').send(data).expect(201);

      const { body: authBody } = await request(app.getHttpServer())
        .post(`${baseUrl}/password`)
        .send({
          email: data.email,
          password: data.password,
        })
        .expect(200);

      const { refreshToken } = authBody;

      const { body: tokensBody } = await request(app.getHttpServer())
        .post(`${baseUrl}/refresh-token`)
        .send({ token: refreshToken })
        .expect(200);

      expect(tokensBody).toHaveProperty('refreshToken');
      expect(tokensBody).toHaveProperty('accessToken');
    });
  });

  describe('google auth', () => {
    it('should call the authentication', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/social/google`)
        .expect(302);
    });
  });
});
