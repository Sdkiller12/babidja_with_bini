import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';
import { TenantType, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TableReservationsService } from '../src/restaurants/table-reservations.service';

describe('Restaurant Reservations Workflow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let config: ConfigService;
  let reservationsService: TableReservationsService;

  let customer1Id: string;
  let customer2Id: string;
  let customer1Token: string;
  let customer2Token: string;
  let restaurantId: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    config = app.get(ConfigService);
    reservationsService = app.get(TableReservationsService);

    const uniqueTime = Date.now().toString();

    // Prepare CUSTOMER 1
    const customer1 = await prisma.user.create({
      data: {
        phone: `+2252${uniqueTime.slice(-8)}`,
        email: `c1-${uniqueTime}@rest.ci`,
        role: UserRole.CUSTOMER,
        referralCode: `C1-${uniqueTime.slice(-4)}`,
      },
    });
    customer1Id = customer1.id;
    customer1Token = jwtService.sign(
      { sub: customer1.id, role: UserRole.CUSTOMER },
      { secret: config.get<string>('jwt.secret') },
    );

    // Prepare CUSTOMER 2
    const customer2 = await prisma.user.create({
      data: {
        phone: `+2253${uniqueTime.slice(-8)}`,
        email: `c2-${uniqueTime}@rest.ci`,
        role: UserRole.CUSTOMER,
        referralCode: `C2-${uniqueTime.slice(-4)}`,
      },
    });
    customer2Id = customer2.id;
    customer2Token = jwtService.sign(
      { sub: customer2.id, role: UserRole.CUSTOMER },
      { secret: config.get<string>('jwt.secret') },
    );

    // Prepare Restaurant Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Le Maquis',
        type: TenantType.RESTAURANT,
        address: 'Zone 4',
        city: 'Abidjan',
        isPlatformOwned: true,
      },
    });
    tenantId = tenant.id;

    // Prepare Restaurant Details
    const restaurant = await prisma.restaurant.create({
      data: {
        tenantId,
        cuisineType: ['Ivoirienne', 'Africaine'],
        priceRange: '$$',
        openingHours: { monday: '10:00-22:00' },
        capacity: 10, // Max 10 personnes par créneau
      },
    });
    restaurantId = restaurant.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.tableReservation.deleteMany({ where: { restaurantId } });
    await prisma.restaurant.deleteMany({ where: { id: restaurantId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    await prisma.user.deleteMany({ where: { id: { in: [customer1Id, customer2Id] } } });
    await app.close();
  });

  it('should prevent booking over capacity (concurrency check)', async () => {
    // Customer 1 reserves 6 seats
    const res1 = await request(app.getHttpServer())
      .post(`/api/v1/restaurants/${restaurantId}/reservations`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        reservationDate: new Date().toISOString(),
        reservationTime: '19:30',
        partySize: 6,
      })
      .expect(201);
    
    expect(res1.body.partySize).toBe(6);
    expect(res1.body.status).toBe('PENDING');

    // Customer 2 tries to reserve 5 seats concurrently (6 + 5 = 11 > 10)
    // This should fail with 409 Conflict
    const res2 = await request(app.getHttpServer())
      .post(`/api/v1/restaurants/${restaurantId}/reservations`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        reservationDate: new Date().toISOString(),
        reservationTime: '19:30',
        partySize: 5,
      })
      .expect(409);

    // Customer 2 tries again with 4 seats (6 + 4 = 10 <= 10)
    // This should succeed
    const res3 = await request(app.getHttpServer())
      .post(`/api/v1/restaurants/${restaurantId}/reservations`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        reservationDate: new Date().toISOString(),
        reservationTime: '19:30',
        partySize: 4,
      })
      .expect(201);

    expect(res3.body.partySize).toBe(4);
  });
});
