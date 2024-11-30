import { Injectable } from '@nestjs/common';
import { CreateGasDto } from './dto/create-gas.dto';
import { UpdateGasDto } from './dto/update-gas.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { ReadingsArray } from 'src/app.service';

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

  async getLastReadings(n: number = 1): Promise<ReadingsArray> {
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

  async getFirstDayMonthReading(): Promise<Decimal> {
    const firstDay = new Date(new Date().setDate(1));
    const firstDayRange = this.dateToFullDayRange(firstDay);

    const reading = await this.prisma.rEADINGS_GAS.findFirst({
      where: { DATE: { gte: firstDayRange.start, lte: firstDayRange.end } },
      select: { VALUE: true },
    });

    return reading.VALUE;
  }

  async getLastMonthReadings() {
    // we need to check the last record date
    const lastReadingDate = await this.prisma.rEADINGS_GAS.findFirst({
      select: { DATE: true },
      orderBy: { DATE: 'desc' },
    });

    if (!lastReadingDate) {
      throw new Error('No readings found');
    }

    const currentMonth = lastReadingDate.DATE.getMonth() + 1;
    const currentYear = lastReadingDate.DATE.getFullYear();

    const previousMonth = currentMonth - 1 || 12;
    const previousMonthYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    // last month's first day reading
    const previousMonthFirstDay = new Date(
      previousMonthYear,
      previousMonth - 1,
      1,
    );
    const previousMonthFirstDayRange = this.dateToFullDayRange(
      previousMonthFirstDay,
    );
    const previousMonthReading = await this.prisma.rEADINGS_GAS.findFirst({
      where: {
        DATE: {
          gte: previousMonthFirstDayRange.start,
          lte: previousMonthFirstDayRange.end,
        },
      },
    });

    if (!previousMonthReading) {
      throw new Error(
        'No reading found for the first day of the previous month',
      );
    }

    // current month's first day reading
    const currentMonthFirstDay = new Date(currentYear, currentMonth - 1, 1);
    const currentMonthFirstDayRange =
      this.dateToFullDayRange(currentMonthFirstDay);
    const currentMonthReading = await this.prisma.rEADINGS_GAS.findFirst({
      where: {
        DATE: {
          gte: currentMonthFirstDayRange.start,
          lte: currentMonthFirstDayRange.end,
        },
      },
    });

    if (!currentMonthReading) {
      throw new Error(
        'No reading found for the first day of the current month',
      );
    }

    // last month's days count
    const daysInPreviousMonth = new Date(
      previousMonthYear,
      previousMonth,
      0,
    ).getDate();

    return {
      previousMonthReading: Number(previousMonthReading.VALUE),
      currentMonthReading: Number(currentMonthReading.VALUE),
      daysInPreviousMonth,
    };
  }

  update(id: number, updateGasDto: UpdateGasDto) {
    return `This action updates a #${id} gas`;
  }

  remove(id: number) {
    return `This action removes a #${id} gas`;
  }

  dateToFullDayRange(date: Date) {
    return {
      start: new Date(date.setHours(0, 0, 0, 0)),
      end: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
}
