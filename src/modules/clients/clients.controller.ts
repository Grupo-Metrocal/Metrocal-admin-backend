import { Controller } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ApiTags } from '@nestjs/swagger'
import { Post, Body, Get, Param } from '@nestjs/common'
import { CreateClientDto } from './dto/client.dto'

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async createClient(@Body() client: CreateClientDto) {
    return await this.clientsService.createClient(client)
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.clientsService.findById(id)
  }

  @Get()
  async findAll() {
    return await this.clientsService.findAll()
  }
}
