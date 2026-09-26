import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PartnerApplicationStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnersService } from './partners.service';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { UpdatePartnerApplicationStatusDto } from './dto/update-partner-application-status.dto';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('apply')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'legalDoc', maxCount: 1 },
      { name: 'idDoc', maxCount: 1 },
    ]),
  )
  apply(
    @Body() dto: CreatePartnerApplicationDto,
    @UploadedFiles() files: { legalDoc?: Express.Multer.File[]; idDoc?: Express.Multer.File[] },
  ) {
    const legalDoc = files?.legalDoc?.[0];
    const idDoc = files?.idDoc?.[0];
    return this.partnersService.apply(dto, legalDoc, idDoc);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/application-status')
  getMyApplicationStatus(@CurrentUser('id') userId: string) {
    return this.partnersService.getMyApplicationStatus(userId);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/partner-applications')
export class AdminPartnerApplicationsController {
  constructor(private readonly partnersService: PartnersService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  listApplications(@Query('status') status?: PartnerApplicationStatus) {
    return this.partnersService.listApplications(status);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerApplicationStatusDto,
    @CurrentUser() reviewerUser: any,
  ) {
    return this.partnersService.updateApplicationStatus(id, dto, reviewerUser.userId);
  }
}
