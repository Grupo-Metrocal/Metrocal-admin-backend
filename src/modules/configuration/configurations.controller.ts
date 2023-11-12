import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Get } from '@nestjs/common'
import { ConfigurationService } from './configurations.service'
import { CreateConfigurationDto } from './dto/configuration.dto'
import { handleBadrequest } from 'src/common/handleHttp'

@ApiTags('Configuration')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationservice: ConfigurationService) {}

 @Get()
 async getAllconfig(){
    return await this.configurationservice.findAll
 }

 @Get(':id')
 async findById(@Param('id') id: number) {

    
}

@Post()
  async createClient(@Body() client: CreateConfigurationDto) {
    if (!client)
      return handleBadrequest(
        new Error('Porfavor envie un cliente que desea registrar'),
      )
    return await this.configurationservice.createConfiguration(client)
  }

 @Delete(':id')
 async delete(@Param('id') id: number) {
 

}
 
}