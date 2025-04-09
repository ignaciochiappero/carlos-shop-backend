import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get('api/health')
  healthCheck() {
    return { status: 'ok' };
  }
}