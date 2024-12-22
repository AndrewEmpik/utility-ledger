import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';
import { PrismaModule } from 'prisma/prisma.module';
import { CommonService } from './common/common.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, CommonService, GasService, ElectricityService],
})
export class AppModule {}
