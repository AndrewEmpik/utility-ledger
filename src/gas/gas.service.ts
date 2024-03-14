import { Injectable } from '@nestjs/common';
import { CreateGasDto } from './dto/create-gas.dto';
import { UpdateGasDto } from './dto/update-gas.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GasService {
  constructor(private prisma: PrismaService) {}

  async create(createGasDto: CreateGasDto) {
    return await this.prisma.rEADINGS_GAS.create({
      data: createGasDto,
    });
  }

  findAll() {
    return `This action returns all gas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gas`;
  }

  update(id: number, updateGasDto: UpdateGasDto) {
    return `This action updates a #${id} gas`;
  }

  remove(id: number) {
    return `This action removes a #${id} gas`;
  }
}
