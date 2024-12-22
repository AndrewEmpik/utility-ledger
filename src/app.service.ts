import { Injectable } from '@nestjs/common';
import * as pug from 'pug';

import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';
import { PrismaService } from 'prisma/prisma.service';
import { CommonService } from './common/common.service';
import { getDaysInMonth, getMonthName, round2 } from './common/utils';
import { ModelName } from './common/types';
import { electricityRate, gasRate } from './common/constants';

@Injectable()
export class AppService {
  constructor(
    private readonly gasService: GasService,
    private readonly electricityService: ElectricityService,
    private readonly commonService: CommonService,
    private prisma: PrismaService,
  ) {}

  async getIndexPage(request, res) {
    const previousGas = this.commonService.getLastReadings(ModelName.GAS);
    const previousElectricity = this.commonService.getLastReadings(
      ModelName.ELECTRICITY,
    );

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

      gasRate: gasRate,
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

      electricityRate: electricityRate,
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

    const roundedVars = Object.fromEntries(
      Object.entries(vars).map(([key, value]) => [
        key,
        (() => {
          if (typeof value === 'string') return value;
          return round2(value);
        })(),
      ]),
    );

    res.send(pug.renderFile('./views/index.pug', roundedVars));
  }

  async getHistoryPage(request, res) {
    const days = 32;
    const previousGas = await this.commonService.getLastReadings(
      ModelName.GAS,
      days,
    );
    const previousElectricity = await this.commonService.getLastReadings(
      ModelName.ELECTRICITY,
      days,
    );

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
    const daysInMonth = getDaysInMonth(baseDate);
    const forecastCoefficient = daysPassed > 0 ? daysInMonth / daysPassed : 0;

    const currentMonthName = getMonthName(baseDate.getMonth() + 1);
    const previousMonthName = getMonthName(baseDate.getMonth());

    // GAS
    const gasFirstDay = Number(
      await this.commonService.getFirstDayMonthReading(
        ModelName.GAS,
        new Date(baseDate),
      ),
    );
    const gasCurrReading = (
      await this.commonService.getLastReadings(ModelName.GAS, 1)
    )[0];
    const gasCurrReadingValue = Number(gasCurrReading.reading);

    const gasCurrUsage = gasCurrReadingValue - gasFirstDay;
    let gasCurrCost = gasCurrUsage * gasRate;
    let gasForecastUsage = gasCurrUsage * forecastCoefficient;
    let gasForecastCost = gasCurrCost * forecastCoefficient;
    let gasCurrAvgUsagePerDay = daysPassed > 0 ? gasCurrUsage / daysPassed : 0;
    let gasCurrAvgCostPerDay = daysPassed > 0 ? gasCurrCost / daysPassed : 0;

    // previous month
    const gasLastMonthReadings = await this.commonService.getLastMonthReadings(
      ModelName.GAS,
      new Date(baseDate),
    );

    let gasPrevMonthUsage =
      gasLastMonthReadings.currentMonthReading -
      gasLastMonthReadings.previousMonthReading;
    let gasPrevMonthCost = gasPrevMonthUsage * gasRate;
    let gasPrevAvgUsagePerDay =
      gasPrevMonthUsage / gasLastMonthReadings.daysInPreviousMonth;
    let gasPrevAvgCostPerDay =
      gasPrevMonthCost / gasLastMonthReadings.daysInPreviousMonth;

    // ELECTRICITY

    const electricityFirstDay = Number(
      await this.commonService.getFirstDayMonthReading(
        ModelName.ELECTRICITY,
        new Date(baseDate),
      ),
    );
    const electricityCurrReading = Number(
      (await this.commonService.getLastReadings(ModelName.ELECTRICITY, 1))[0]
        .reading,
    );

    const electricityCurrUsage = electricityCurrReading - electricityFirstDay;
    let electricityCurrCost = electricityCurrUsage * electricityRate;
    let electricityForecastUsage = electricityCurrUsage * forecastCoefficient;
    let electricityForecastCost = electricityCurrCost * forecastCoefficient;
    let electricityCurrAvgUsagePerDay =
      daysPassed > 0 ? electricityCurrUsage / daysPassed : 0;
    let electricityCurrAvgCostPerDay =
      daysPassed > 0 ? electricityCurrCost / daysPassed : 0;

    // previos month
    const electricityLastMonthReadings =
      await this.commonService.getLastMonthReadings(
        ModelName.ELECTRICITY,
        new Date(baseDate),
      );

    let electricityPrevMonthUsage =
      electricityLastMonthReadings.currentMonthReading -
      electricityLastMonthReadings.previousMonthReading;
    let electricityPrevMonthCost = electricityPrevMonthUsage * electricityRate;
    let electricityPrevAvgUsagePerDay =
      electricityPrevMonthUsage /
      electricityLastMonthReadings.daysInPreviousMonth;
    let electricityPrevAvgCostPerDay =
      electricityPrevMonthCost /
      electricityLastMonthReadings.daysInPreviousMonth;

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
}
