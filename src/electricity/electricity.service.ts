import { Injectable } from '@nestjs/common';
import { CreateElectricityDto } from './dto/create-electricity.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ElectricityService {
  constructor(private prisma: PrismaService) {}

  async create(createElectricityDto: CreateElectricityDto) {
    return await this.prisma.rEADINGS_ELECTRICITY.create({
      data: createElectricityDto,
    });
  }
}
