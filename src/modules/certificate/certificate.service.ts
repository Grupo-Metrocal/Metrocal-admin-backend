import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Certificate } from './entities/certificate.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly dataSource: DataSource,
  ) {}

  async create() {
    try {
      const certificate = new Certificate()

      const created = await this.dataSource.transaction(async (manager) => {
        const certificateCreated = await manager.save(certificate)

        const code = `CERT-${certificateCreated.id}`
        certificateCreated.code = code

        return await manager.save(certificateCreated)
      })

      return handleOK(created)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }
}
