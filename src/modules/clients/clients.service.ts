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
  handlePaginate,
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

  async deleteQuoteFromClient(id: number) {
    const quoteRequest = await this.quoteRequestRepository.findOne({
      where: { id },
      relations: ['client'],
    })

    if (!quoteRequest) {
      return handleBadrequest(
        new Error('La cotización no existe, verifique el id'),
      )
    }

    try {
      await this.quoteRequestRepository.remove(quoteRequest)
      return handleOK(quoteRequest)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async getClientsPagination(page: number, limit: number) {
    try {
      const response = await this.clientRepository.find({
        relations: ['quote_requests', 'quote_requests.equipment_quote_request'],
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      })

      const total = await this.clientRepository.count()

      const clients: {
        id: number
        company_name: string
        email: string
        requested_by: string
        phone: string
        address: string
        quote_requests: any[]
      }[] = []

      response.forEach((client) => {
        const { id, company_name, email, requested_by, phone, address } = client
        const quote_requests = client.quote_requests.map((quote) => quote.id)

        clients.push({
          id,
          company_name,
          email,
          requested_by,
          phone,
          address,
          quote_requests,
        })
      })

      return handlePaginate(clients, total, limit, page)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async updateClient(id: number, clientInfo: CreateClientDto) {
    try {
      const client = await this.clientRepository.findOne({
        where: { id },
      })

      if (!client) {
        return handleBadrequest(new Error('El cliente no existe'))
      }

      await this.clientRepository.update({ id }, clientInfo)

      return handleOK(clientInfo)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
