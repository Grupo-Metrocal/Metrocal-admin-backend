import { Body, Controller, Delete, Param, Patch, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Get } from '@nestjs/common'
import { ConfigurationService } from './configurations.service'
import { CreateEquipmentRegisterDto, CreateIvaRegisterDto } from './dto/configuration.dto'
import { handleBadrequest } from 'src/common/handleHttp'
import { UpdateEquipmentRegisterDto, UpdateIvaRegisterDto } from './dto/update-configuration.dto'
import { IvaRegister } from './entities/configuration.entity'

@ApiTags('Configuration')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationservice: ConfigurationService) {}
//equipment
  @Get('all/equipment')
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
@Post('create/defaultequipment')
  async createDefaultEquipment(){
    return await this.configurationservice.createDefaultEquipment()
  }

//equipment
 @Delete('delete/equipment/:id')
 async deleteEquipmentById(@Param('id') id: number) {
 return await this.configurationservice.deleteEquipmentById(id)
}

//equipment
@Put('update/equipment/:id')
async updateEquipment(@Param('id') id: number, @Body() equipment: UpdateEquipmentRegisterDto) {
  return await this.configurationservice.updateEquipment(id, equipment)
  }

  
//IVA
@Get('all/iva')
async getAllIVA(){
  return await this.configurationservice.findAllIva()
}

//IVA
@Get('findby/iva/:id')
async findIvatById(@Param('id') id : number){
  return await this.configurationservice.findIvaById(id)
}
/*
//IVA
@Post('/create/iva')
  async createIVA(@Body() iva: CreateIvaRegisterDto) {
    if (!iva)
      return handleBadrequest(
        new Error('Porfavor envie el IVA que desea registrar'),
      )
    
    return await this.configurationservice.createIva(iva)
  }
//IVA
 @Delete('delete/iva/:id')
 async deleteIVAById(@Param('id') id: number) {
 return await this.configurationservice.deleteIvaById(id)
}

//IVA
@Put('update/iva/:id')
async update(@Param('id') id: number, @Body() IVA: UpdateIvaRegisterDto) {
  return await this.configurationservice.updateIva(id, IVA)
  }
  */
}