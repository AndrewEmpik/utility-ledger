import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GasModule } from './gas/gas.module';
import { ElectricityModule } from './electricity/electricity.module';
import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [GasModule, ElectricityModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, GasService, ElectricityService],
})
export class AppModule {}
