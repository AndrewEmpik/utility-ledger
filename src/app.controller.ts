import { Controller, Get, Req, Res, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async indexPage(@Req() request: Request, @Res() res: Response) {
    this.appService.getIndexPage(request, res);
  }

  getHello(): string {
    return this.appService.getHello();
  }

  @Post('submit')
  async submitReadings(
    @Body()
    data: {
      gas: string;
      electricity: string;
    },
    //@Req() request: Request,
    //@Res() response: Response,
  ) {
    this.appService.submitReadings(
      parseFloat(data.gas),
      parseInt(data.electricity),
    );
  }
}
