import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ReferralService } from './referral.service';

@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('me')
  findMyReferrals(@CurrentUser() user: AuthenticatedUser) {
    return this.referralService.findByUser(user.userId);
  }
}
