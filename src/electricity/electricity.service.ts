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

  async getLastReadings(n: number = 1) {
    const set = await this.prisma.rEADINGS_ELECTRICITY.findMany({
      orderBy: { DATE: 'desc' },
      take: n + 1,
    });

    const results = [];
    for (let i = 0; i < n; i++) {
      const res = {
        date: set[i].DATE.toLocaleDateString('uk-UA'),
        reading: set[i].VALUE,
        use: Math.round((+set[i].VALUE - +set[i + 1].VALUE) * 1000) / 1000,
      };
      results.push(res);
    }

    return results;
  }

  update(id: number, updateElectricityDto: UpdateElectricityDto) {
    return `This action updates a #${id} electricity`;
  }

  remove(id: number) {
    return `This action removes a #${id} electricity`;
  }
}
