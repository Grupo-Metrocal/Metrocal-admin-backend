import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { CreateClientDto } from './dto/client.dto'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { DataSource } from 'typeorm'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async createClient(client: CreateClientDto) {
    const clientFound = await this.clientRepository.findOne({
      where: { company_name: client.company_name },
    })

    if (clientFound) {
      return handleBadrequest(new Error('El cliente ya existe'))
    }

    try {
      const clientCreated = await this.clientRepository.save(client)
      return handleOK(clientCreated)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async findById(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
    })

    if (!client) {
      return handleBadrequest(
        new Error('El cliente no existe, verifique el id'),
      )
    }

    return handleOK(client)
  }

  async findAll() {
    try {
      const clients = await this.clientRepository.find()
      return handleOK(clients)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async delete(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
      // si no existe el cliente, no se puede relacionar con quote_requests
      relations: ['quote_requests'],
    })

    if (!client) {
      return handleBadrequest(
        new Error('El cliente no existe, verifique el id'),
      )
    }

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
        return handleInternalServerError(error)
      }
    }

    try {
      await this.clientRepository.delete({ id })
      return handleOK(client)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async getClientsEmails() {
    try {
      const emails = await this.clientRepository.find({
        select: ['id', 'email', 'company_name'],
      })
      return handleOK(emails)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
