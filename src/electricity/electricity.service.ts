import { Injectable } from '@nestjs/common';
import { CreateElectricityDto } from './dto/create-electricity.dto';
import { UpdateElectricityDto } from './dto/update-electricity.dto';
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

  findAll() {
    return `This action returns all electricity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} electricity`;
  }

  update(id: number, updateElectricityDto: UpdateElectricityDto) {
    return `This action updates a #${id} electricity`;
  }

  remove(id: number) {
    return `This action removes a #${id} electricity`;
  }
}
