import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import faker from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';

describe('User Controller (e2e)', () => {
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

  const baseUrl = '/users';

  describe('/users (Post)', () => {
    it('should create a new user', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      await request(app.getHttpServer()).post(baseUrl).send(data).expect(201);
    });

    it('should not create a user if already exists a user with the same email', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      await request(app.getHttpServer()).post(baseUrl).send(data).expect(201);

      await request(app.getHttpServer()).post(baseUrl).send(data).expect(400);
    });

    it('should not create user with invalid params on the body', async () => {
      const data = {
        name: '',
        email: 'rodrigo@gmailcom',
        password: '123',
      };

      const result = await request(app.getHttpServer())
        .post(baseUrl)
        .send(data)
        .expect(400);

      ['password', 'email', 'name'].forEach((field) => {
        expect(result.body.message).toHaveProperty(field);
      });
    });
  });

  describe('/users (Delete)', () => {
    it('should delete a existing user by id ', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const secret = process.env.JWT_SECRET;

      const user = await request(app.getHttpServer()).post(baseUrl).send(data);

      const accessToken = new JwtService({ secret }).sign({ id: user.body.id });

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${user.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should not delete a not existing user by id', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const secret = process.env.JWT_SECRET;

      const user = await request(app.getHttpServer()).post(baseUrl).send(data);

      const accessToken = new JwtService({ secret }).sign({
        id: user.body.id,
      });

      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should not delete a user by id with a invalid access token', async () => {
      const secret = 'invalid-secret';

      const accessToken = new JwtService({ secret }).sign({});

      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should not delete a user by id if missing the access token', async () => {
      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${userId}`)
        .expect(401);
    });
  });

  describe('/users (Patch)', () => {
    it('should update a user by id ', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const newData = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatarUrl: faker.internet.avatar(),
      };

      const secret = process.env.JWT_SECRET;

      const user = await request(app.getHttpServer()).post(baseUrl).send(data);

      const accessToken = new JwtService({ secret }).sign({ id: user.body.id });

      const { body } = await request(app.getHttpServer())
        .patch(`${baseUrl}/${user.body.id}`)
        .send(newData)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining(newData));
    });

    it('should not update a user if not exists ', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const newData = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatarUrl: faker.internet.avatar(),
      };

      const secret = process.env.JWT_SECRET;

      const user = await request(app.getHttpServer()).post(baseUrl).send(data);

      const accessToken = new JwtService({ secret }).sign({ id: user.body.id });

      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${userId}`)
        .send(newData)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should not update a user if sent a invalid access token', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const newData = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatarUrl: faker.internet.avatar(),
      };

      const secret = 'invalid-secret';

      const user = await request(app.getHttpServer()).post(baseUrl).send(data);

      const accessToken = new JwtService({ secret }).sign({ id: user.body.id });

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${user.body.id}`)
        .send(newData)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should not update a user if not sent a access token', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${userId}`)
        .send(data)
        .expect(401);
    });
  });

  describe('/users (Get)', () => {
    it('should get a existing user', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const result = await request(app.getHttpServer())
        .post(baseUrl)
        .send(data)
        .expect(201);

      const secret = process.env.JWT_SECRET;

      const accessToken = new JwtService({ secret }).sign({
        id: result.body.id,
      });

      const { body } = await request(app.getHttpServer())
        .get(`${baseUrl}/${result.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      delete data.password;

      expect(body).toEqual(expect.objectContaining(data));
    });

    it('should not get a not existing user', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const result = await request(app.getHttpServer())
        .post(baseUrl)
        .send(data)
        .expect(201);

      const secret = process.env.JWT_SECRET;

      const accessToken = new JwtService({ secret }).sign({
        id: result.body.id,
      });

      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .get(`${baseUrl}/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should not get a user if set a not valid access token', async () => {
      const data = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatarUrl: faker.internet.avatar(),
      };

      const result = await request(app.getHttpServer())
        .post(baseUrl)
        .send(data)
        .expect(201);

      const secret = 'invalid-secret';

      const accessToken = new JwtService({ secret }).sign({
        id: result.body.id,
      });

      await request(app.getHttpServer())
        .get(`${baseUrl}/${result.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should not get a user if not sent a access token', async () => {
      const userId = faker.datatype.uuid();

      await request(app.getHttpServer())
        .get(`${baseUrl}/${userId}`)
        .expect(401);
    });
  });
});
