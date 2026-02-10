import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Flow (e2e)', () => {
    let app: INestApplication;
    let token: string;
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const password = 'password123';

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

    it('1. Register a new user', async () => {
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: uniqueEmail,
                password: password,
                role: 'DONOR',
                name: 'Test User',
            })
            .expect((res) => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error(`Expected 200 or 201, got ${res.status}: ${res.text}`);
                }
            });
    });

    it('2. Login', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: uniqueEmail,
                password: password,
            })
            .expect((res) => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error(`Expected 200 or 201, got ${res.status}: ${res.text}`);
                }
            });

        const data = response.body;
        expect(data).toHaveProperty('data');
        expect(data.data).toHaveProperty('token');

        token = data.data.token;
    });

    it('3. Access protected route', async () => {
        await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});
