import { Controller, Get } from '@nestjs/common';
<<<<<<< HEAD
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
=======

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Backend is running!';
>>>>>>> feat/api-integration-setup
  }
}
