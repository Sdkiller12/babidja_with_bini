import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { UpdatePartnerApplicationStatusDto } from './dto/update-partner-application-status.dto';
import { PartnerApplicationStatus, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(
    dto: CreatePartnerApplicationDto,
    legalDoc?: Express.Multer.File,
    idDoc?: Express.Multer.File,
  ) {
    if (!legalDoc || !idDoc) {
      throw new BadRequestException('Les documents (legalDoc et idDoc) sont requis.');
    }

    const legalDocUrl = await this.storageService.upload(
      `partners/${Date.now()}-legal-${legalDoc.originalname}`,
      legalDoc.buffer,
      legalDoc.mimetype,
    );
    const idDocUrl = await this.storageService.upload(
      `partners/${Date.now()}-id-${idDoc.originalname}`,
      idDoc.buffer,
      idDoc.mimetype,
    );

    return this.prisma.$transaction(async (tx) => {
      // Find or create the applicant User based on phone or email
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { phone: dto.contactPhone },
            { email: dto.contactEmail },
          ],
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            phone: dto.contactPhone,
            email: dto.contactEmail,
            passwordHash: null,
            firstName: '',
            lastName: '',
            referralCode: `P${randomBytes(4).toString('hex').toUpperCase()}`,
          },
        });
      }

      return tx.partnerApplication.create({
        data: {
          applicantUserId: user.id,
          businessName: dto.businessName,
          serviceType: dto.serviceType,
          registryNumber: dto.registryNumber,
          contactPhone: dto.contactPhone,
          contactEmail: dto.contactEmail,
          legalDocUrl,
          idDocUrl,
        },
      });
    });
  }

  async getMyApplicationStatus(userId: string) {
    const applications = await this.prisma.partnerApplication.findMany({
      where: { applicantUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return applications;
  }

  async listApplications(status?: PartnerApplicationStatus) {
    return this.prisma.partnerApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
      },
    });
  }

  async updateApplicationStatus(id: string, dto: UpdatePartnerApplicationStatusDto, reviewerUserId: string) {
    const application = await this.prisma.partnerApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Candidature introuvable.');
    }

    // Si on l'approuve et qu'elle n'était pas déjà approuvée
    if (dto.status === PartnerApplicationStatus.APPROVED && application.status !== PartnerApplicationStatus.APPROVED) {
      return this.prisma.$transaction(async (tx) => {
        // Mettre à jour la candidature
        const updated = await tx.partnerApplication.update({
          where: { id },
          data: {
            status: dto.status,
            reviewNotes: dto.reviewNotes,
            reviewedByUserId: reviewerUserId,
            reviewedAt: new Date(),
          },
        });

        // 1. Créer le Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: application.businessName,
            type: application.serviceType,
            address: '', // A compléter par le partenaire
            city: '',    // A compléter par le partenaire
            isPlatformOwned: false,
          },
        });

        // 2. Créer l'employé Tenant (TenantAdmin)
        await tx.tenantEmployee.create({
          data: {
            tenantId: tenant.id,
            userId: application.applicantUserId,
            role: UserRole.TENANT_ADMIN,
            permissions: [],
          },
        });

        // 3. Envoyer le SMS d'activation pour inviter à se connecter via OTP
        await this.notificationsService.sendPartnerAccountCreatedSms(application.contactPhone);

        return updated;
      });
    }

    // Sinon, juste mettre à jour le statut
    return this.prisma.partnerApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNotes: dto.reviewNotes,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
      },
    });
  }
}
