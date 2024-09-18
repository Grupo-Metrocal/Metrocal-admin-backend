import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { DataSource, MoreThan, Repository } from 'typeorm'
import { Certificate } from './entities/certificate.entity'
import {
  ResponseHTTP,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { InjectRepository } from '@nestjs/typeorm'
import { generateCertCode, getCertCodeId } from 'src/utils/generateCertCode'
import { MethodsService } from '../methods/methods.service'

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    @Inject(forwardRef(() => MethodsService))
    private readonly methodsService: MethodsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(prefix: string, index: number) {
    try {
      const certificate = new Certificate()
      let newIndex = index

      if (prefix === 'T') {
        const [t_01, t_03, t_05]: [any, any, any] = await Promise.all([
          this.methodsService.getCeritifationCodeFromLastMethod('NI_MCIT_T_01'),
          this.methodsService.getCeritifationCodeFromLastMethod('NI_MCIT_T_03'),
          this.methodsService.getCeritifationCodeFromLastMethod('NI_MCIT_T_05'),
        ])

        const MethodsCodes = [
          Number(getCertCodeId(t_01?.data?.code || null)),
          Number(getCertCodeId(t_03?.data?.code || null)),
          Number(getCertCodeId(t_05?.data?.code || null)),
        ]

        newIndex = Math.max(...MethodsCodes) + 1
      }

      if (prefix === 'D') {
        const [d_01, d_02]: [any, any] = await Promise.all([
          this.methodsService.getCeritifationCodeFromLastMethod('NI_MCIT_D_01'),
          this.methodsService.getCeritifationCodeFromLastMethod('NI_MCIT_D_02'),
        ])

        const MethodsCodes = [
          Number(getCertCodeId(d_01?.data?.code || null)),
          Number(getCertCodeId(d_02?.data?.code || null)),
        ]

        newIndex = Math.max(...MethodsCodes) + 1
      }

      const created = await this.dataSource.transaction(async (manager) => {
        const certificateCreated = await manager.save(certificate)

        const code = generateCertCode({
          id: newIndex,
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
