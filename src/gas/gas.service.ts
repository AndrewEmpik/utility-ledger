import { Injectable } from '@nestjs/common';
import { CreateGasDto } from './dto/create-gas.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GasService {
  constructor(private prisma: PrismaService) {}

  async create(createGasDto: CreateGasDto) {
    return await this.prisma.rEADINGS_GAS.create({
      data: createGasDto,
    });
  }
}
