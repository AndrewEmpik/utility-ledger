import { Module } from '@nestjs/common';
import { GasService } from './gas.service';
import { GasController } from './gas.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [GasController],
  providers: [GasService],
  imports: [PrismaModule]
})
export class GasModule {}
