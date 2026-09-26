import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { AdminCommissionsController } from './admin-commissions.controller';

@Module({
  controllers: [AdminCommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
