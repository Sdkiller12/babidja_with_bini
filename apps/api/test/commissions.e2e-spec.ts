import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';
import { TenantType, UserRole, ResourceType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BookingsService } from '../src/bookings/bookings.service';

describe('Commissions Workflow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let config: ConfigService;
  let bookingsService: BookingsService;

  let superAdminId: string;
  let superAdminToken: string;
  let customerId: string;
  let partnerTenantId: string;
  let roomId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Set environment variable for test
    process.env.COMMISSION_RATE_HOTEL = '15';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    config = app.get(ConfigService);
    bookingsService = app.get(BookingsService);

    const uniqueTime = Date.now().toString();

    // Prepare SUPER_ADMIN
    const admin = await prisma.user.create({
      data: {
        phone: `+225${uniqueTime.slice(-8)}`,
        email: `admin-${uniqueTime}@commissions.ci`,
        role: UserRole.SUPER_ADMIN,
        referralCode: `ADM-${uniqueTime.slice(-4)}`,
      },
    });
    superAdminId = admin.id;
    superAdminToken = jwtService.sign(
      { sub: admin.id, role: UserRole.SUPER_ADMIN },
      { secret: config.get<string>('jwt.secret') },
    );

    // Prepare CUSTOMER
    const customer = await prisma.user.create({
      data: {
        phone: `+2251${uniqueTime.slice(-8)}`,
        email: `customer-${uniqueTime}@commissions.ci`,
        role: UserRole.CUSTOMER,
        referralCode: `CUS-${uniqueTime.slice(-4)}`,
      },
    });
    customerId = customer.id;

    // Prepare Partner Tenant (isPlatformOwned: false)
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Partner Hotel',
        type: TenantType.HOTEL,
        address: 'Rue 12',
        city: 'Abidjan',
        isPlatformOwned: false,
      },
    });
    partnerTenantId = tenant.id;

    // Prepare Room
    const room = await prisma.room.create({
      data: {
        tenantId: partnerTenantId,
        name: 'Chambre Standard',
        maxGuests: 2,
        basePrice: 50000,
        capacityAdults: 2,
        capacityChildren: 0,
      },
    });
    roomId = room.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.commission.deleteMany({ where: { tenantId: partnerTenantId } });
    await prisma.payment.deleteMany({ where: { booking: { tenantId: partnerTenantId } } });
    await prisma.booking.deleteMany({ where: { tenantId: partnerTenantId } });
    await prisma.availability.deleteMany({ where: { resourceId: roomId } });
    await prisma.room.deleteMany({ where: { id: roomId } });
    await prisma.tenant.deleteMany({ where: { id: partnerTenantId } });
    await prisma.user.deleteMany({ where: { id: { in: [superAdminId, customerId] } } });
    await app.close();
  });

  it('should calculate and record commission on booking confirm', async () => {
    // 1. Create a booking (using bookingsService)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 2 nights

    const booking = await bookingsService.createBooking(
      {
        resourceType: ResourceType.ROOM,
        resourceId: roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentType: 'FULL',
      },
      customerId
    );
    bookingId = booking.id;
    expect(booking.totalAmount.toNumber()).toBe(100000); // 50000 * 2 nights

    // 2. Confirm the booking
    await bookingsService.confirm(bookingId);

    // 3. Admin queries commissions
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/admin/commissions')
      .query({ tenantId: partnerTenantId })
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(listRes.body.items).toBeInstanceOf(Array);
    expect(listRes.body.items.length).toBeGreaterThan(0);

    const commission = listRes.body.items.find((c: any) => c.bookingRef === booking.bookingRef);
    expect(commission).toBeDefined();
    
    // Commission should be 15% of 100000 = 15000
    expect(Number(commission.grossAmount)).toBe(100000);
    expect(Number(commission.commissionRate)).toBe(15);
    expect(Number(commission.commissionAmount)).toBe(15000);
    expect(Number(commission.netAmount)).toBe(85000);
    expect(commission.payoutStatus).toBe('PENDING');

    expect(listRes.body.totals.totalGross).toBe(100000);
    expect(listRes.body.totals.totalCommission).toBe(15000);
    expect(listRes.body.totals.pendingCommission).toBe(15000);
  });
});
