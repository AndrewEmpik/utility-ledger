import { Injectable } from '@nestjs/common';
import * as pug from 'pug';

import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';

@Injectable()
export class AppService {
  constructor(
    private readonly gasService: GasService,
    private readonly electricityService: ElectricityService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getIndexPage(request, res) {
    const previousGas = this.gasService.getLastReadings();
    const previousElectricity = this.electricityService.getLastReadings();

    const vars = {
      previousGas: (await previousGas)[0].reading,
      previousElectricity: (await previousElectricity)[0].reading,
      previousGasUse: (await previousGas)[0].use,
      previousElectricityUse: (await previousElectricity)[0].use,
    };
    res.send(pug.renderFile('./views/index.pug', vars));
  }

  async getHistoryPage(request, res) {
    const previousGas = await this.gasService.getLastReadings(30);
    const previousElectricity =
      await this.electricityService.getLastReadings(30);

    let allReadings = [];
    for (let i = 0; i < 30; i++) {
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
}
