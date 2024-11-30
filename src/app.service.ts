import { Injectable } from '@nestjs/common';
import * as pug from 'pug';

import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';

type ReadingEntry = { date: string; reading: Decimal; use: Decimal };
export type ReadingsArray = ReadingEntry[];

@Injectable()
export class AppService {
  constructor(
    private readonly gasService: GasService,
    private readonly electricityService: ElectricityService,
    private prisma: PrismaService,
  ) {}

  gasRate = 7.95689;
  electricityRate = 4.32;

  async getIndexPage(request, res) {
    const previousGas = this.gasService.getLastReadings();
    const previousElectricity = this.electricityService.getLastReadings();

    const {
      gasCurrUsage,
      gasCurrCost,
      gasForecastUsage,
      gasForecastCost,
      gasCurrAvgUsagePerDay,
      gasCurrAvgCostPerDay,
      gasPrevMonthUsage,
      gasPrevMonthCost,
      gasPrevAvgUsagePerDay,
      gasPrevAvgCostPerDay,
      electricityCurrUsage,
      electricityCurrCost,
      electricityForecastUsage,
      electricityForecastCost,
      electricityCurrAvgUsagePerDay,
      electricityCurrAvgCostPerDay,
      electricityPrevMonthUsage,
      electricityPrevMonthCost,
      electricityPrevAvgUsagePerDay,
      electricityPrevAvgCostPerDay,

      currentMonthName,
      previousMonthName,
    } = await this.getSummary();

    const vars = {
      previousGas: (await previousGas)[0].reading,
      previousElectricity: (await previousElectricity)[0].reading,
      previousGasUse: (await previousGas)[0].use,
      previousElectricityUse: (await previousElectricity)[0].use,

      gasRate: this.gasRate,
      gasCurrUsage,
      gasCurrCost,
      gasForecastUsage,
      gasForecastCost,
      gasCurrAvgUsagePerDay,
      gasCurrAvgCostPerDay,
      gasPrevMonthUsage,
      gasPrevMonthCost,
      gasPrevAvgUsagePerDay,
      gasPrevAvgCostPerDay,

      electricityRate: this.electricityRate,
      electricityCurrUsage,
      electricityCurrCost,
      electricityForecastUsage,
      electricityForecastCost,
      electricityCurrAvgUsagePerDay,
      electricityCurrAvgCostPerDay,
      electricityPrevMonthUsage,
      electricityPrevMonthCost,
      electricityPrevAvgUsagePerDay,
      electricityPrevAvgCostPerDay,

      currentMonthName,
      previousMonthName,
    };
    res.send(pug.renderFile('./views/index.pug', vars));
  }

  async getHistoryPage(request, res) {
    const days = 32;
    const previousGas = await this.gasService.getLastReadings(days);
    const previousElectricity =
      await this.electricityService.getLastReadings(days);

    let allReadings = [];
    for (let i = 0; i < days; i++) {
      allReadings.push({
        date: previousGas[i].date,
        gasReading: previousGas[i].reading,
        gasUse: previousGas[i].use,
        electricityReading: previousElectricity[i].reading,
        electricityUse: previousElectricity[i].use,
      });
    }

    const vars = {
      readings: allReadings,
    };
    res.send(pug.renderFile('./views/history.pug', vars));
  }

  async submitReadings(gas: number, electricity: number) {
    console.log('Газ: ' + gas + ', електрика: ' + electricity);

    const gasCreateData = { VALUE: gas };
    const res1 = await this.gasService.create(gasCreateData);
    console.log(res1);

    const electricityCreateData = { VALUE: electricity };
    const res2 = await this.electricityService.create(electricityCreateData);
    console.log(res2);
  }

  async getLastReadingDate() {
    return (
      await this.prisma.rEADINGS_GAS.findFirst({
        select: { DATE: true },
        orderBy: { DATE: 'desc' },
      })
    ).DATE;
  }

  async getSummary() {
    const baseDate = await this.getLastReadingDate();
    const daysPassed = baseDate.getDate() - 1;
    const daysInMonth = this.getDaysInMonth(baseDate);
    const forecastCoefficient = daysInMonth / daysPassed;

    const currentMonthName = this.getMonthName(baseDate.getMonth() + 1);
    const previousMonthName = this.getMonthName(baseDate.getMonth());

    // GAS
    const gasFirstDay = Number(
      await this.gasService.getFirstDayMonthReading(new Date(baseDate)),
    );
    const gasCurrReading = (await this.gasService.getLastReadings(1))[0];
    const gasCurrReadingValue = Number(gasCurrReading.reading);

    const gasCurrUsage = gasCurrReadingValue - gasFirstDay;
    let gasCurrCost = this.round2(gasCurrUsage * this.gasRate);
    let gasForecastUsage = this.round2(gasCurrUsage * forecastCoefficient);
    let gasForecastCost = this.round2(gasCurrCost * forecastCoefficient);
    let gasCurrAvgUsagePerDay =
      daysPassed > 0 ? this.round2(gasCurrUsage / daysPassed) : 0;
    let gasCurrAvgCostPerDay =
      daysPassed > 0 ? this.round2(gasCurrCost / daysPassed) : 0;

    // previous month
    const gasLastMonthReadings = await this.gasService.getLastMonthReadings(
      new Date(baseDate),
    );

    let gasPrevMonthUsage = this.round2(
      gasLastMonthReadings.currentMonthReading -
        gasLastMonthReadings.previousMonthReading,
    );
    let gasPrevMonthCost = this.round2(gasPrevMonthUsage * this.gasRate);
    let gasPrevAvgUsagePerDay = this.round2(
      gasPrevMonthUsage / gasLastMonthReadings.daysInPreviousMonth,
    );
    let gasPrevAvgCostPerDay = this.round2(
      gasPrevMonthCost / gasLastMonthReadings.daysInPreviousMonth,
    );

    // ELECTRICITY

    const electricityFirstDay = Number(
      await this.electricityService.getFirstDayMonthReading(new Date(baseDate)),
    );
    const electricityCurrReading = Number(
      (await this.electricityService.getLastReadings(1))[0].reading,
    );

    const electricityCurrUsage = electricityCurrReading - electricityFirstDay;
    let electricityCurrCost = electricityCurrUsage * this.electricityRate;
    let electricityForecastUsage = this.round2(
      electricityCurrUsage * forecastCoefficient,
    );
    let electricityForecastCost = this.round2(
      electricityCurrCost * forecastCoefficient,
    );
    let electricityCurrAvgUsagePerDay =
      daysPassed > 0 ? this.round2(electricityCurrUsage / daysPassed) : 0;
    let electricityCurrAvgCostPerDay =
      daysPassed > 0 ? this.round2(electricityCurrCost / daysPassed) : 0;

    // previos month
    const electricityLastMonthReadings =
      await this.electricityService.getLastMonthReadings(new Date(baseDate));

    let electricityPrevMonthUsage = this.round2(
      electricityLastMonthReadings.currentMonthReading -
        electricityLastMonthReadings.previousMonthReading,
    );
    let electricityPrevMonthCost = this.round2(
      electricityPrevMonthUsage * this.electricityRate,
    );
    let electricityPrevAvgUsagePerDay = this.round2(
      electricityPrevMonthUsage /
        electricityLastMonthReadings.daysInPreviousMonth,
    );
    let electricityPrevAvgCostPerDay = this.round2(
      electricityPrevMonthCost /
        electricityLastMonthReadings.daysInPreviousMonth,
    );

    return {
      gasCurrUsage,
      gasCurrCost,
      gasForecastUsage,
      gasForecastCost,
      gasCurrAvgUsagePerDay,
      gasCurrAvgCostPerDay,
      gasPrevMonthUsage,
      gasPrevMonthCost,
      gasPrevAvgUsagePerDay,
      gasPrevAvgCostPerDay,
      electricityCurrUsage,
      electricityCurrCost,
      electricityForecastUsage,
      electricityForecastCost,
      electricityCurrAvgUsagePerDay,
      electricityCurrAvgCostPerDay,
      electricityPrevMonthUsage,
      electricityPrevMonthCost,
      electricityPrevAvgUsagePerDay,
      electricityPrevAvgCostPerDay,
      currentMonthName,
      previousMonthName,
    };
  }

  round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  getDaysInMonth(baseDate: Date = new Date()): number {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth() + 1;

    return new Date(year, month, 0).getDate();
  }

  getMonthName(monthNumber: number): string {
    const months = [
      'СІЧЕНЬ',
      'ЛЮТИЙ',
      'БЕРЕЗЕНЬ',
      'КВІТЕНЬ',
      'ТРАВЕНЬ',
      'ЧЕРВЕНЬ',
      'ЛИПЕНЬ',
      'СЕРПЕНЬ',
      'ВЕРЕСЕНЬ',
      'ЖОВТЕНЬ',
      'ЛИСТОПАД',
      'ГРУДЕНЬ',
    ];

    if (monthNumber < 1 || monthNumber > 12) {
      throw new Error('Month number should be between 1 and 12.');
    }

    return months[monthNumber - 1];
  }
}
