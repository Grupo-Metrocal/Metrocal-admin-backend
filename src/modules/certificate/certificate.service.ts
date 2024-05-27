import { Injectable } from '@nestjs/common'
import { DataSource, MoreThan, Repository } from 'typeorm'
import { Certificate } from './entities/certificate.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { InjectRepository } from '@nestjs/typeorm'
import { generateCertCode } from 'src/utils/generateCertCode'

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly dataSource: DataSource,
  ) {}

  async create(prefix: string) {
    try {
      const certificate = new Certificate()

      const created = await this.dataSource.transaction(async (manager) => {
        const certificateCreated = await manager.save(certificate)

        const code = generateCertCode({
          id: certificateCreated.id,
          modificationsNumber: 1,
          prefix: prefix,
        })
        certificateCreated.code = code

        return await manager.save(certificateCreated)
      })

      return handleOK(created)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async filterCertificatesByMonth(month: number) {
    try {
      const currentDate = new Date()
      const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - month,
        1,
      )

      const certificates = await this.certificateRepository.find({
        where: {
          created_at: MoreThan(targetDate),
        },
      })

      return handleOK(certificates)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }
}
