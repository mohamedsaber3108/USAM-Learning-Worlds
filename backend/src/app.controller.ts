import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async health() {
    return this.appService.healthCheck();
  }

  @Get('domains')
  async getDomains() {
    return this.appService.getDomains();
  }
}
