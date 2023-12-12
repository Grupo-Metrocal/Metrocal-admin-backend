import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Get } from '@nestjs/common'
import { ConfigurationService } from './configurations.service'
import { CreateEquipmentRegisterDto } from './dto/configuration.dto'
import { handleBadrequest } from 'src/common/handleHttp'
import {
  UpdateEquipmentRegisterDto,
  UpdateIvaRegisterDto,
} from './dto/update-configuration.dto'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('Configuration')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationservice: ConfigurationService) {}
  //equipment
  @Get('all/authorized_services')
  async getAllEquipment() {
    return await this.configurationservice.findAllEquipment()
  }

  //equipment
  @Get('findby/equipment/:id')
  async findEquipmentById(@Param('id') id: number) {
    return await this.configurationservice.findEquipmentById(id)
  }

  //equipment
  @Post('create/equipment')
  async createEquipment(@Body() equipment: CreateEquipmentRegisterDto) {
    if (!equipment)
      return handleBadrequest(
        new Error('Porfavor envie el equipo que desea registrar'),
      )

    return await this.configurationservice.createEquipment(equipment)
  }

  //equipment
  @Delete('delete/equipment/:id')
  async deleteEquipmentById(@Param('id') id: number) {
    return await this.configurationservice.deleteEquipmentById(id)
  }

  //equipment
  @Put('update/equipment/:id')
  async updateEquipment(
    @Param('id') id: number,
    @Body() equipment: UpdateEquipmentRegisterDto,
  ) {
    return await this.configurationservice.updateEquipment(id, equipment)
  }

  //IVA
  @Get('all/iva')
  async getAllIVA() {
    return await this.configurationservice.findAllIva()
  }

  //IVA
  @Put('update/iva/:id')
  async update(@Body() IVA: UpdateIvaRegisterDto) {
    return await this.configurationservice.updateIva(1, IVA)
  }
}
