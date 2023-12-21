import { Controller, Get } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('methods')
@Controller('methods')
export class MethodsController {
  constructor(private readonly methodsService: MethodsService) {}

  @Get()
  async getAll() {
    return await this.methodsService.getAllMethods()
  }

  @Get('clear')
  async getAllNI_MCIT_P_01() {
    return await this.methodsService.deleteAllMethods()
  }
}
