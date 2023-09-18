import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { CreateClientDto } from './dto/client.dto'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async createClient(client: CreateClientDto): Promise<CreateClientDto> {
    return await this.clientRepository.save(client)
  }

  async findById(id: number): Promise<Client> {
    return await this.clientRepository.findOne({
      where: { id },
    })
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find()
  }
}
