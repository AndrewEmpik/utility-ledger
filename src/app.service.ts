import { Injectable } from '@nestjs/common';
import * as pug from 'pug';

import { GasService } from './gas/gas.service';
import { ElectricityService } from './electricity/electricity.service';

@Injectable()
export class AppService {
	constructor(private readonly gasService: GasService,
				private readonly electricityService: ElectricityService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getIndexPage(request, res)
  {
	res.send(
        pug.renderFile('../views/index.pug', {
        })
	)
  }

  async submitReadings(gas: number, electricity: number)
  {
	console.log("Газ: " + gas + ", електрика: " + electricity);

	const gasCreateData = { VALUE: gas };
    const res1 = await this.gasService.create(gasCreateData);
	console.log(res1);

	const electricityCreateData = { VALUE: electricity };
    const res2 = await this.electricityService.create(electricityCreateData);
	console.log(res2);

  }

}
