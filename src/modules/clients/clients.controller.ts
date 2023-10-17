import { Controller } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ApiTags } from '@nestjs/swagger'
import { Post, Body, Get, Param, Delete } from '@nestjs/common'
import { CreateClientDto } from './dto/client.dto'
import { handleBadresuest } from 'src/common/handleHttp'

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createClient(@Body() client: CreateClientDto) {
    if (!client)
      return handleBadresuest(
        new Error('Porfavor envie un cliente que desea registrar'),
      )
    return await this.clientsService.createClient(client)
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    if (!id) return handleBadresuest(new Error('El id es requerido'))
    return await this.clientsService.findById(id)
  }

  @Get()
  async findAll() {
    return await this.clientsService.findAll()
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    if (!id) return handleBadresuest(new Error('El id es requerido'))
    return await this.clientsService.delete(id)
  }
}
