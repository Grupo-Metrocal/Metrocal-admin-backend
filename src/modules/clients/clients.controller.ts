import { Controller, UseGuards } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ApiTags } from '@nestjs/swagger'
import { Post, Body, Get, Param, Delete } from '@nestjs/common'
import { CreateClientDto } from './dto/client.dto'
import { handleBadrequest } from 'src/common/handleHttp'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createClient(@Body() client: CreateClientDto) {
    if (!client)
      return handleBadrequest(
        new Error('Porfavor envie un cliente que desea registrar'),
      )
    return await this.clientsService.createClient(client)
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    if (!id) return handleBadrequest(new Error('El id es requerido'))
    return await this.clientsService.findById(id)
  }

  @Get()
  async findAll() {
    return await this.clientsService.findAll()
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    if (!id) return handleBadrequest(new Error('El id es requerido'))
    return await this.clientsService.delete(id)
  }
  @Get('emails/all')
  async getClientsEmails() {
    return await this.clientsService.getClientsEmails()
  }
}
