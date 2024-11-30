import { Injectable } from '@nestjs/common';
import * as pug from 'pug';

import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';
import { Decimal } from '@prisma/client/runtime/library';

type ReadingEntry = { date: string; reading: Decimal; use: Decimal };
export type ReadingsArray = ReadingEntry[];

@Injectable()
export class AppService {
  constructor(
    private readonly gasService: GasService,
    private readonly electricityService: ElectricityService,
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

  async getSummary() {
    // GAS

    const gasFirstDay = Number(await this.gasService.getFirstDayMonthReading());
    const gasCurrReading = (await this.gasService.getLastReadings(1))[0];
    const gasCurrReadingValue = Number(gasCurrReading.reading);
    const daysPassed = Number(gasCurrReading.date.split('.')[0]) - 1;

    // temporary solution, TODO reconsider it later
    const isTodaysReading = new Date().getDate() === daysPassed + 1;
    const daysInMonth = this.getDaysInMonth(!isTodaysReading);
    const forecastCoefficient = daysInMonth / daysPassed;

    const gasCurrUsage = gasCurrReadingValue - gasFirstDay;
    let gasCurrCost = this.round2(gasCurrUsage * this.gasRate);
    let gasForecastUsage = this.round2(gasCurrUsage * forecastCoefficient);
    let gasForecastCost = this.round2(gasCurrCost * forecastCoefficient);
    let gasCurrAvgUsagePerDay =
      daysPassed > 0 ? this.round2(gasCurrUsage / daysPassed) : 0;
    let gasCurrAvgCostPerDay =
      daysPassed > 0 ? this.round2(gasCurrCost / daysPassed) : 0;

    // previos month
    const gasLastMonthReadings = await this.gasService.getLastMonthReadings();

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
      await this.electricityService.getFirstDayMonthReading(),
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
      await this.electricityService.getLastMonthReadings();

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
    };
  }

  round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  getDaysInMonth(yesterday: boolean = false): number {
    const now = new Date();

    // temporary condition, TODO reconsider it later
    if (yesterday) {
      now.setDate(now.getDate() - 1);
    }

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return new Date(year, month, 0).getDate();
  }
}
