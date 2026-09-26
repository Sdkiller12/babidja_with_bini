import { Body, Controller, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApplyTenantDto } from './dto/apply-tenant.dto';

@Controller('tenants')
export class PublicTenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('apply')
  apply(@Body() dto: ApplyTenantDto) {
    return this.tenantsService.apply(dto);
  }
}
