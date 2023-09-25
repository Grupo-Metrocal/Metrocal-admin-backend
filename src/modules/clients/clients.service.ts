import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { CreateClientDto } from './dto/client.dto'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    private readonly dataSource: DataSource,
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

  async delete(id: number): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['quote_requests'],
    })

    if (client.quote_requests.length > 0) {
      const equipmentQuoteRequest = await this.quoteRequestRepository.find({
        where: { client: { id } },
        relations: ['equipment_quote_request', 'client'],
      })

      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.remove(equipmentQuoteRequest)
          await manager.remove(client)
        })
      } catch (error) {
        throw new Error(error)
      }
    }

    await this.clientRepository.delete({ id })
  }
}
