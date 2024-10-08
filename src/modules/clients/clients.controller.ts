import { Controller, UseGuards } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ApiTags } from '@nestjs/swagger'
import { Post, Body, Get, Param, Delete } from '@nestjs/common'
import { CreateClientDto } from './dto/client.dto'
import { handleBadrequest } from 'src/common/handleHttp'

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

  @Get()
  async findAll() {
    return await this.clientsService.findAll()
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    if (!id) return handleBadrequest(new Error('El id es requerido'))
    return await this.clientsService.findById(id)
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

  @Get(':page/:limit/:company_name?')
  async getClientsPagination(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('company_name') company_name: string,
  ) {
    return await this.clientsService.getClientsPagination(
      page,
      limit,
      company_name,
    )
  }

  @Post('update/:id')
  async updateClient(@Param('id') id: number, @Body() client: CreateClientDto) {
    if (!id) return handleBadrequest(new Error('El id es requerido'))
    if (!client)
      return handleBadrequest(
        new Error('Porfavor envie un cliente que desea registrar'),
      )
    return await this.clientsService.updateClient(id, client)
  }
}
