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

  async getLastReadings(n: number = 1) {
    const set = await this.prisma.rEADINGS_GAS.findMany({
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

  update(id: number, updateGasDto: UpdateGasDto) {
    return `This action updates a #${id} gas`;
  }

  remove(id: number) {
    return `This action removes a #${id} gas`;
  }
}
