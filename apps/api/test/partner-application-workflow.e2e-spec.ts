import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';
import { PartnerApplicationStatus, TenantType, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../src/storage/storage.service';

describe('Partner Application Workflow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let config: ConfigService;

  let superAdminId: string;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(StorageService)
      .useValue({ upload: jest.fn().mockResolvedValue('https://fake-s3-url.com/dummy.pdf') })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    config = app.get(ConfigService);

    // Prepare SUPER_ADMIN with unique info
    const uniqueTime = Date.now().toString();
    const admin = await prisma.user.create({
      data: {
        phone: `+225${uniqueTime.slice(-8)}`,
        email: `admin-${uniqueTime}@babydja.ci`,
        role: UserRole.SUPER_ADMIN,
        referralCode: `ADM-${uniqueTime.slice(-4)}`,
      },
    });
    superAdminId = admin.id;
    superAdminToken = jwtService.sign(
      { sub: admin.id, role: UserRole.SUPER_ADMIN },
      { secret: config.get<string>('jwt.secret') },
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.tenantEmployee.deleteMany();
    await prisma.partnerApplication.deleteMany();
    await prisma.tenant.deleteMany({ where: { isPlatformOwned: false } });
    if (superAdminId) {
      await prisma.user.delete({ where: { id: superAdminId } });
    }
    // Also delete any users created by the test
    await prisma.user.deleteMany({ where: { phone: '+2250102030405' } });
    await app.close();
  });

  it('should complete the partner application workflow', async () => {
    // 1. Soumission de la candidature (Public)
    // In a real e2e we'd use .attach() for files, but we can simulate the DTO
    // Note: Since FileInterceptor is used, we need to send multipart/form-data
    const applyRes = await request(app.getHttpServer())
      .post('/api/v1/partners/apply')
      .field('businessName', 'My New Hotel')
      .field('serviceType', TenantType.HOTEL)
      .field('registryNumber', 'CI-12345')
      .field('contactPhone', '+2250102030405')
      .field('contactEmail', 'partner@hotel.ci')
      // Simulate file upload by attaching a dummy buffer
      .attach('legalDoc', Buffer.from('dummy'), 'legal.pdf')
      .attach('idDoc', Buffer.from('dummy'), 'id.pdf');
    if (applyRes.status !== 201) {
      console.log('applyRes Error:', applyRes.body);
    }
    expect(applyRes.status).toBe(201);

    const applicationId = applyRes.body.id;
    expect(applicationId).toBeDefined();
    expect(applyRes.body.status).toBe(PartnerApplicationStatus.PENDING);
    expect(applyRes.body.applicantUserId).toBeDefined();

    // 2. Vérification que l'utilisateur a été créé avec passwordHash = null
    const applicantId = applyRes.body.applicantUserId;
    const user = await prisma.user.findUnique({ where: { id: applicantId } });
    expect(user).toBeDefined();
    expect(user?.passwordHash).toBeNull();
    expect(user?.phone).toBe('+2250102030405');

    // 3. Admin liste les candidatures
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/admin/partner-applications')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(listRes.body).toBeInstanceOf(Array);
    const myApp = listRes.body.find((a: any) => a.id === applicationId);
    expect(myApp).toBeDefined();
    expect(myApp.status).toBe(PartnerApplicationStatus.PENDING);

    // 4. Admin passe la candidature en UNDER_REVIEW
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/partner-applications/${applicationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: PartnerApplicationStatus.UNDER_REVIEW })
      .expect(200);

    let checkApp = await prisma.partnerApplication.findUnique({ where: { id: applicationId } });
    expect(checkApp?.status).toBe(PartnerApplicationStatus.UNDER_REVIEW);

    // 5. Admin approuve la candidature -> création automatique du Tenant et TenantEmployee
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/partner-applications/${applicationId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: PartnerApplicationStatus.APPROVED })
      .expect(200);

    checkApp = await prisma.partnerApplication.findUnique({ where: { id: applicationId } });
    expect(checkApp?.status).toBe(PartnerApplicationStatus.APPROVED);
    expect(checkApp?.reviewedByUserId).toBe(superAdminId);

    // 6. Vérifications finales (Tenant et TenantEmployee)
    const employee = await prisma.tenantEmployee.findFirst({
      where: { userId: applicantId },
      include: { tenant: true },
    });
    expect(employee).toBeDefined();
    expect(employee?.role).toBe(UserRole.TENANT_ADMIN);
    expect(employee?.tenant.name).toBe('My New Hotel');
    expect(employee?.tenant.type).toBe(TenantType.HOTEL);
    expect(employee?.tenant.isPlatformOwned).toBe(false);
  });
});
