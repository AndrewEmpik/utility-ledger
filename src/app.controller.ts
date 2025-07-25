import { Controller, Get, Req, Res, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async indexPage(@Req() request: Request, @Res() res: Response) {
    this.appService.getIndexPage(request, res);
  }

  @Get('history')
  async historyPage(@Req() request: Request, @Res() res: Response) {
    this.appService.getHistoryPage(request, res);
  }

  @Post('submit')
  async submitReadings(
    @Body()
    data: {
      gas: string;
      electricity: string;
    },
    @Res() res: any,
  ) {
    await this.appService.submitReadings(
      parseFloat(data.gas),
      parseInt(data.electricity),
    );
    const pug = require('pug');
    res.send(pug.renderFile('./views/success.pug'));
  }
}
