import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { dateToFullDayRange } from 'src/common/utils';

@Injectable()
export class CommonService {
  constructor(private prisma: PrismaService) {}

  async getLastReadings(
    modelName: string,
    n: number = 1, //: Promise<ReadingsArray>
  ) {
    const set = await this.prisma[modelName].findMany({
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

  async getFirstDayMonthReading(
    modelName: string,
    baseDate = new Date(),
  ): Promise<Decimal> {
    const firstDay = new Date(baseDate.setDate(1));
    const firstDayRange = dateToFullDayRange(firstDay);

    const reading = await this.prisma[modelName].findFirst({
      where: { DATE: { gte: firstDayRange.start, lte: firstDayRange.end } },
      select: { VALUE: true },
    });

    return reading.VALUE;
  }

  async getLastMonthReadings(modelName: string, baseDate?: Date) {
    if (!baseDate) {
      // we need to fetch the last record date
      baseDate = (
        await this.prisma[modelName].findFirst({
          select: { DATE: true },
          orderBy: { DATE: 'desc' },
        })
      ).DATE;

      if (!baseDate) {
        throw new Error('No readings found');
      }
    }

    const currentMonth = baseDate.getMonth() + 1;
    const currentYear = baseDate.getFullYear();

    const previousMonth = currentMonth - 1 || 12;
    const previousMonthYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    // last month's first day reading
    const previousMonthFirstDay = new Date(
      previousMonthYear,
      previousMonth - 1,
      1,
    );
    const previousMonthFirstDayRange = dateToFullDayRange(
      previousMonthFirstDay,
    );
    const previousMonthReading = await this.prisma[modelName].findFirst({
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
    const currentMonthFirstDayRange = dateToFullDayRange(currentMonthFirstDay);
    const currentMonthReading = await this.prisma[modelName].findFirst({
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
}
