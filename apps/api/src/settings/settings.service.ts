import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.platformSetting.findMany();
  }

  async updateSettings(settings: { key: string; value: string; description?: string }[]) {
    const results = [];
    for (const setting of settings) {
      const updated = await this.prisma.platformSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: { key: setting.key, value: setting.value, description: setting.description },
      });
      results.push(updated);
    }
    return results;
  }
}
