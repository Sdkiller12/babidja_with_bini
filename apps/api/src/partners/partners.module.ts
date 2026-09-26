import { Module } from '@nestjs/common';
import { PartnersController, AdminPartnerApplicationsController } from './partners.controller';
import { PartnersService } from './partners.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [StorageModule, NotificationsModule],
  controllers: [PartnersController, AdminPartnerApplicationsController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
