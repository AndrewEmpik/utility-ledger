import { Module } from '@nestjs/common';
import { ElectricityService } from './electricity.service';
import { ElectricityController } from './electricity.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ElectricityController],
  providers: [ElectricityService],
  imports: [PrismaModule],
})
export class ElectricityModule {}
