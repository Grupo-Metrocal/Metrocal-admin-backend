import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiTags } from '@nestjs/swagger'
import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'

@ApiTags('methods')
@Controller('methods')
export class MethodsController {
  constructor(
    private readonly methodsService: MethodsService,
    private readonly ni_mcit_p_01Service: NI_MCIT_P_01Service,
  ) {}

  @Get()
  async getAll() {
    return await this.methodsService.getAllMethods()
  }

  @Get('clear')
  async getAllNI_MCIT_P_01() {
    return await this.methodsService.deleteAllMethods()
  }

  @Post('ni-mcit-p-01/equipment-information/:methodId')
  async createNI_MCIT_P_01EquipmentInformation(
    @Body() equipment: EquipmentInformationDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/environmental-conditions/:methodId')
  async createNI_MCIT_P_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/create')
  async createNI_MCIT_P_01() {
    return await this.ni_mcit_p_01Service.create()
  }
}
