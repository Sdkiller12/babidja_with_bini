import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { PublicTenantsController } from './public-tenants.controller';
import { EmployeesController } from './employees.controller';
import { TenantsService } from './tenants.service';
import { EmployeesService } from './employees.service';

@Module({
  controllers: [TenantsController, EmployeesController, PublicTenantsController],
  providers: [TenantsService, EmployeesService],
  exports: [TenantsService, EmployeesService],
})
export class TenantsModule {}
