import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  const dto: AuthDto = {
    email: 'test@gmail.com',
    password: '123'
  };

  describe('Auth', () => {
    describe('Signup', () => {
      it('Should throw an error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: '123' })
          .expectStatus(400);
      });

      it('Should throw an error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: 'test@gmail.com' })
          .expectStatus(400);
      });

      it('Should throw an error if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw an error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: '123' })
          .expectStatus(400);
      });

      it('Should throw an error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: 'test@gmail.com' })
          .expectStatus(400);
      });

      it('Should throw an error if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('authToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get the current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{authToken}'
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {});
  });

  describe('Log', () => {
    describe('Create log', () => {});

    describe('Get logs', () => {});

    describe('Get log by id', () => {});

    describe('Edit log', () => {});

    describe('Delete log', () => {});
  });
});
