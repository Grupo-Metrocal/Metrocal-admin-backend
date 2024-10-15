import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, In, Brackets } from 'typeorm'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { ActivitiesService } from '../activities/activities.service'
import { CreateMethodDto } from './dto/create-method.dto'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { Activity } from '../activities/entities/activities.entity'
import { QuotesService } from '../quotes/quotes.service'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { Methods } from './entities/method.entity'
import { QuoteRequest } from '../quotes/entities/quote-request.entity'
import { addOrRemoveMethodToStackDto } from './dto/add-remove-method-stack.dto'
import * as path from 'path'
import { TokenService } from '../auth/jwt/jwt.service'

import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { PatternsService } from '../patterns/patterns.service'
import { NI_MCIT_T_01 } from './entities/NI_MCIT_T_01/NI_MCIT_T_01.entity'
import { NI_MCIT_M_01 } from './entities/NI_MCIT_M_01/NI_MCIT_M_01.entity'
import { NI_MCIT_B_01 } from './entities/NI_MCIT_B_01/NI_MCIT_B_01.entity'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_T_01Service } from './ni-mcit-t-01.service'
import { MailService } from '../mail/mail.service'
import { NI_MCIT_D_01Service } from './ni-mcit-d-01.service'
import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'
import { NI_MCIT_T_03 } from './entities/NI_MCIT_T_03/NI_MCIT_T_03.entity'
import { NI_MCIT_T_03Service } from './ni-mcit-t-03.service'
import { NI_MCIT_B_01Service } from './ni-mcit-b-01.service'
import { NI_MCIT_T_05Service } from './ni-mcit-t-05.service'
import { NI_MCIT_T_05 } from './entities/NI_MCIT_T_05/NI_MCIT_T_05.entity'

import { NI_MCIT_V_01 } from './entities/NI_MCIT_V_01/NI_MCIT_V_01.entity'
import { NI_MCIT_V_01Service } from './ni-mcit-v-01.service'

import { GENERIC_METHOD } from './entities/GENERIC METHOD/GENERIC_METHOD.entity'
import { GENERIC_METHODService } from './generic-method.service'
import { formatCertCode } from 'src/utils/generateCertCode'
import { OptionsCMCOnCertificateDto } from './dto/setSOptionsCMCOnCertificate.dto'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { NI_MCIT_M_01Service } from './ni-mcit-m-01.service'
import { countDecimals } from 'src/utils/countDecimal'

@Injectable()
export class MethodsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Methods)
    private readonly methodsRepository: Repository<Methods>,

    @InjectRepository(NI_MCIT_P_01)
    private readonly NI_MCIT_P_01Repository: Repository<NI_MCIT_P_01>,
    @InjectRepository(NI_MCIT_D_02)
    private readonly NI_MCIT_D_02Repository: Repository<NI_MCIT_D_02>,
    @InjectRepository(NI_MCIT_D_01)
    private readonly NI_MCIT_D_01Repository: Repository<NI_MCIT_D_01>,
    @InjectRepository(NI_MCIT_T_01)
    private readonly NI_MCIT_T_01Repository: Repository<NI_MCIT_T_01>,
    @InjectRepository(NI_MCIT_M_01)
    private readonly NI_MCIT_M_01Repository: Repository<NI_MCIT_M_01>,
    @InjectRepository(NI_MCIT_T_03)
    private readonly NI_MCIT_T_03Repository: Repository<NI_MCIT_T_03>,
    @InjectRepository(NI_MCIT_B_01)
    private readonly NI_MCIT_B_01Repository: Repository<NI_MCIT_B_01>,
    @InjectRepository(NI_MCIT_T_05)
    private readonly NI_MCIT_T_05Repository: Repository<NI_MCIT_T_05>,
    @InjectRepository(NI_MCIT_V_01)
    private readonly NI_MCIT_V_01Repository: Repository<NI_MCIT_V_01>,
    @InjectRepository(GENERIC_METHOD)
    private readonly GENERIC_METHODRepository: Repository<GENERIC_METHOD>,

    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    @Inject(forwardRef(() => QuotesService))
    private readonly quotesService: QuotesService,

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly NI_MCIT_P_01Services: NI_MCIT_P_01Service,
    private readonly NI_MCIT_T_01Services: NI_MCIT_T_01Service,
    private readonly NI_MCIT_D_01Services: NI_MCIT_D_01Service,
    private readonly NI_MCIT_D_02Services: NI_MCIT_D_02Service,
    private readonly NI_MCIT_T_03Services: NI_MCIT_T_03Service,
    private readonly NI_MCIT_B_01Services: NI_MCIT_B_01Service,
    private readonly NI_MCIT_T_05Services: NI_MCIT_T_05Service,
    private readonly NI_MCIT_V_01Services: NI_MCIT_V_01Service,
    private readonly NI_MCIT_M_01Services: NI_MCIT_M_01Service,
    private readonly GENERIC_METHODServices: GENERIC_METHODService,
  ) {}

  async createMethod(createMethod: CreateMethodDto) {
    const { activity_id } = createMethod
    const data = await this.activitiesService.getActivitiesByID(activity_id)

    const activity = data.data as Activity

    if (!activity) {
      return handleBadrequest(new Error('Activity not found'))
    }

    // Dynamically create method by method_name
    try {
      const promises = activity.quote_request.equipment_quote_request.map(
        async (equipment) => {
          try {
            await this.dataSource.transaction(async (manager) => {
              if (equipment.status === 'done') {
                const methodName = `${equipment.calibration_method
                  .split(' ')[0]
                  .replaceAll('-', '_')}Repository`

                if (typeof this[methodName] === 'undefined') {
                  return handleBadrequest(new Error('Method not found'))
                }

                const methodsID = [] as any

                for (let i = 0; i < equipment.count; i++) {
                  const newMethod = await this[methodName].create()
                  await manager.save(newMethod)
                  methodsID.push(newMethod.id)
                }

                const method = await this.createMethodID(methodsID, methodName)

                await this.quotesService.asyncMethodToEquipment({
                  equipmentID: equipment.id,
                  methodID: method.id,
                })
              }
            })
          } catch (error) {
            return handleBadrequest(error.message)
          }
        },
      )

      await Promise.all(promises)

      return handleOK(activity.quote_request.equipment_quote_request)
    } catch (error) {
      return handleBadrequest(error.message)
    }
  }

  async createMethodID(methodsID: number[], method_name: string) {
    const newMethod = this.methodsRepository.create({
      methodsID,
      method_name,
    })

    const method = await this.methodsRepository.save(newMethod)

    return method
  }

  async getMethodsID(id: number) {
    try {
      const method = await this.methodsRepository.findOneBy({
        id,
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      const relations = this[method.method_name].metadata.relations.map(
        (relation: any) => relation.propertyName,
      )

      let methodsStack = await this[method.method_name].find({
        where: {
          id: In(method.methodsID),
        },
        relations: relations,
      })

      methodsStack = methodsStack.map((method) => {
        return {
          ...method,
          certificate_code: method.certificate_code
            ? formatCertCode(
                method.certificate_code,
                method.modification_number,
              )
            : '',
        }
      })

      return handleOK(methodsStack)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getAllMethods() {
    try {
      const NI_MCIT_P_01 = await this.NI_MCIT_P_01Repository.find({
        relations: [
          'equipment_information',
          'environmental_conditions',
          'calibration_results',
          'description_pattern',
        ],
      })
      const NI_MCIT_D_02 = await this.NI_MCIT_D_02Repository.find({
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'accuracy_test',
        ],
      })
      const NI_MCIT_D_01 = await this.NI_MCIT_D_01Repository.find({
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'exterior_parallelism_measurement',
          'interior_parallelism_measurement',
          'exterior_measurement_accuracy',
        ],
      })
      const NI_MCIT_M_01 = await this.NI_MCIT_M_01Repository.find({
        relations: ['equipment_information', 'data'],
      })
      return handleOK({ NI_MCIT_P_01, NI_MCIT_D_02, NI_MCIT_D_01 })
    } catch (error) {
      return handleBadrequest(error.message)
    }
  }

  async deleteStackMethods(id: number) {
    try {
      const method = await this.methodsRepository.findOneBy({
        id,
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      await this.dataSource.transaction(async (manager) => {
        const relations = this[method.method_name].metadata.relations.map(
          (relation: any) => relation.propertyName,
        )

        const methodsStack = await this[method.method_name].find({
          where: {
            id: In(method.methodsID),
          },
          relations: relations,
        })

        for (const methodStack of methodsStack) {
          await this[method.method_name].delete({
            id: methodStack.id,
          })
        }

        for (const relation of relations) {
          if (methodsStack[relation]) {
            await manager.delete(relation, {
              id: methodsStack[relation].id,
            })
          }
        }

        await manager.delete(Methods, {
          id,
        })

        await this.quotesService.asyncDeleteMethodToEquipment({
          methodID: method.id,
        })
      })

      return handleOK('Método eliminado')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addMethodToStack({
    methodsStackID,
    quoteRequestID,
    activityID,
  }: addOrRemoveMethodToStackDto) {
    try {
      const method = await this.methodsRepository.findOneBy({
        id: methodsStackID,
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      return await this.dataSource.transaction(async (manager) => {
        const quoteRequest =
          await this.quotesService.getQuoteRequestById(quoteRequestID)

        const { data } = quoteRequest as { data: QuoteRequest }

        const newMethod = await this[method.method_name].create()

        await manager.save(newMethod)
        method.methodsID.push(newMethod.id)
        await manager.save(method)

        await this.quotesService.addOrRemvoQuantityToEquipment({
          quoteRequestID: data.id,
          actionType: 'add',
          equipmentID: data.equipment_quote_request.find(
            (equipment) => equipment.method_id === methodsStackID,
          ).id,
        })
        await this.activitiesService.updateActivityProgress(data.activity.id)
        await this.isResolvedAllServices(activityID)
        return handleOK(newMethod)
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async removeMethodToStack({
    methodsStackID,
    quoteRequestID,
    methodID,
    activityID,
  }: addOrRemoveMethodToStackDto) {
    try {
      const method = await this.methodsRepository.findOneBy({
        id: methodsStackID,
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      return await this.dataSource.transaction(async (manager) => {
        const quoteRequest =
          await this.quotesService.getQuoteRequestById(quoteRequestID)

        const { data } = quoteRequest as { data: QuoteRequest }

        const methodStack = await this[method.method_name].findOneBy({
          id: methodID,
        })

        if (!methodStack) {
          return handleBadrequest(new Error('El método no existe'))
        }

        await this[method.method_name].delete({
          id: methodID,
        })

        method.methodsID = method.methodsID.filter(
          (id: number) => id !== methodID,
        )
        await manager.save(method)

        await this.quotesService.addOrRemvoQuantityToEquipment({
          quoteRequestID: data.id,
          actionType: 'remove',
          equipmentID: data.equipment_quote_request.find(
            (equipment) => equipment.method_id === methodsStackID,
          ).id,
        })

        await this.activitiesService.updateActivityProgress(data.activity.id)
        await this.isResolvedAllServices(activityID)
        return handleOK('Método eliminado')
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async emmitReportToMethod(
    method_name: string,
    method_id: number,
    report_messages: string,
  ) {
    try {
      const repository = `${method_name}Repository`
      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      if (report_messages === '') {
        return handleBadrequest(new Error('El reporte no puede estar vacío'))
      }

      await this.dataSource.transaction(async (manager) => {
        method.report_status = true
        method.report_messages.push(report_messages)
        await manager.save(method)
      })

      return handleOK('Reporte emitido')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async clearReport(method_name: string, method_id: number) {
    try {
      const repository = `${method_name}Repository`
      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      await this.dataSource.transaction(async (manager) => {
        method.report_status = false
        method.report_messages = []
        await manager.save(method)
      })

      return handleOK('Reportes eliminados')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getPatternsByMethodAndCode(method_name: string, code: string) {
    const patterns = await this.patternsService.findByCodeAndMethod(
      code,
      method_name,
    )

    return patterns
  }

  async setCertificateUrlToMethod(
    method_name: string,
    method_id: number,
    stackID: number,
  ) {
    try {
      const repository = `${method_name}Repository`
      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })
      const path_file = '../mail/templates/excels/'
      const excel_name = `${method_name.toLowerCase()}-${stackID}_${method_id}.xlsx`

      await this.dataSource.transaction(async (manager) => {
        method.certificate_url = path.join(
          __dirname,
          `${path_file}${excel_name}`,
        )
        await manager.save(method)
      })

      return handleOK('URL de certificado agregado')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async reviewMethod(method_name: string, method_id: number, token: string) {
    try {
      const repository = `${method_name}Repository`

      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      const { sub: id } = this.tokenService.decodeToken(token)

      await this.dataSource.transaction(async (manager) => {
        method.review_state = true
        method.review_user_id = +id
        await manager.save(method)
      })

      return handleOK('Método revisado')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async sendAllCertificatesToClient(activityID: number) {
    try {
      const activity = await this.activitiesService.getActivityById(activityID)
      const { equipment_quote_request } = activity.data.quote_request

      const collectionPDF = []

      for (const equipment of equipment_quote_request) {
        if (equipment.method_id) {
          const method_name = `${equipment.calibration_method.split(' ')[0].replaceAll('-', '_')}Services`

          const { data: stackMethods } = await this.getMethodsID(
            equipment.method_id,
          )

          for (const method of stackMethods) {
            if (method.review_state) {
              await this[method_name].setCertificateIssueDate(method.id)
              const dataMethod = await this[method_name].generatePDFCertificate(
                activityID,
                method.id,
              )

              if (dataMethod.success) {
                collectionPDF.push({
                  filename: `Certificado-${equipment.name}-${method.certificate_code}.pdf`,
                  content: dataMethod.data.pdf,
                })
              }
            } else {
              continue
            }
          }
        } else {
          continue
        }
      }

      await this.mailService.sendMailCollectionCertificate({
        user: activity.data.quote_request.client.email,
        collection: collectionPDF as any,
        clientName: activity.data.quote_request.client.company_name,
      })

      await this.activitiesService.changeIsCertificateActivity(activityID)

      return handleOK('Email enviado')
    } catch (error) {
      console.log({ error })
      return handleInternalServerError(error.message)
    }
  }

  async getMethodByID(method_name: string, method_id: number) {
    try {
      const repository = `${method_name}Repository`
      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async increseModificationNumber(method_name: string, method_id: number) {
    try {
      const repository = `${method_name}Repository`

      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      if (!method) {
        return handleBadrequest(new Error('El método no existe'))
      }

      await this.dataSource.transaction(async (manager) => {
        method.modification_number += 1
        await manager.save(method)
      })

      return handleOK({ modification_number: method.modification_number })
    } catch (e) {
      return handleInternalServerError(e.message)
    }
  }

  async getCeritifationCodeFromLastMethod(method_name: string) {
    try {
      const repository = `${method_name}Repository`
      const lastMethod = await this[repository].find({
        order: {
          id: 'DESC',
        },
        take: 1,
      })

      const method = lastMethod[0]

      if (!method) {
        return handleBadrequest(new Error('No se encontró el método'))
      }

      console.log(method)

      return handleOK({ code: method.certificate_code })
    } catch (e) {
      console.log(e)
      return handleInternalServerError(e.message)
    }
  }

  async setSOptionsCMCOnCertificate({
    method_name,
    method_id,
    optionsCMCOnCertificate,
  }: OptionsCMCOnCertificateDto) {
    try {
      const repository = `${method_name}Repository`
      const method = await this[repository].findOne({
        where: {
          id: method_id,
        },
      })

      await this.dataSource.transaction(async (manager) => {
        method.optionsCMCOnCertificate = optionsCMCOnCertificate
        await manager.save(method)
      })

      return handleOK('Opciones de CMC en certificado actualizadas')
    } catch (e) {
      return handleInternalServerError(e.message)
    }
  }

  async downloadCertificatePDF(
    activity_id: number,
    method_name: string,
    method_id: number,
  ) {
    try {
      const repository = `${method_name}Services`
      const dataMethod = await this[repository].generatePDFCertificate(
        activity_id,
        method_id,
        true,
      )

      if (!dataMethod.success) {
        return handleBadrequest(new Error('No se pudo generar el PDF'))
      }

      return handleOK(dataMethod.data.pdf)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  getSignificantFigure(number: number) {
    const convertNumber = typeof number === 'string' ? Number(number) : number

    if (isNaN(convertNumber) || convertNumber === 0) {
      return number
    }

    const [integer, decimal] = convertNumber.toString().split('.')

    if (Number(integer) >= 10) {
      let firstNumber: number = 0
      for (let i = 0; i < decimal.length; i++) {
        if (Number(decimal[i]) !== 0 && i < 2) {
          firstNumber = Number(decimal[i])
          break
        }
      }

      return Math.round(Number(`${integer}.${firstNumber}`))
    }

    if (Number(integer) < 10 && Number(integer) >= 1) {
      let complement = ''
      let firstNumber: number = 0
      for (let i = 0; i < decimal.length; i++) {
        if (Number(decimal[i]) !== 0 && i < 2) {
          firstNumber = Number(Number(`0.${decimal}`).toFixed(1))
          break
        } else if (Number(decimal[i]) !== 0) {
          complement += decimal[i]
        }
      }

      return parseFloat(
        `${integer}.${complement && complement}${firstNumber !== 0 ? firstNumber.toString().split('.')[1] : 0}`,
      )
    }

    if (Number(integer) < 1) {
      const newDecimal = Number(decimal)
      const firstFigure = Number(newDecimal.toString().charAt(0))
      let result = 0
      const complement = decimal.split(firstFigure.toString())[0]

      const roundDecimal =
        Math.round(Number(newDecimal.toString().substring(1, 3)) / 10) * 10

      if (roundDecimal === 100) {
        if (firstFigure === 9) {
          return Number(`0.${firstFigure + 1}`)
        }

        result = parseFloat(
          Number(`0.${complement && complement}${firstFigure + 1}0`).toFixed(2),
        )
      } else {
        result = Number(
          `0.${complement && complement}${firstFigure}${roundDecimal.toString().charAt(0)}`,
        )
      }

      return result
    }

    return number
  }

  formatUncertainty(uncertainty: number[]) {
    return uncertainty.map((value) => {
      const convertNumber = typeof value === 'string' ? Number(value) : value

      if (isNaN(convertNumber)) {
        return value
      }

      if (convertNumber === 0) {
        return formatNumberCertification(
          convertNumber,
          countDecimals(uncertainty[uncertainty.length - 1]),
        )
      }

      const decimal = value.toString().split('.')[1]
      return typeof value === 'number'
        ? value >= 10
          ? value
          : value < 1
            ? decimal.length > 2
              ? formatSameNumberCertification(value)
              : formatNumberCertification(value, 2)
            : formatNumberCertification(value, 1)
        : value
    })
  }

  async isResolvedAllServices(activityID: number) {
    try {
      const activity = await this.activitiesService.getActivityById(activityID)
      const { equipment_quote_request } = activity.data.quote_request

      for (const equipment of equipment_quote_request) {
        if (equipment.calibration_method === 'N/A') {
          continue
        }
        let flagResolved = true
        const { data: stackMethods } = await this.getMethodsID(
          equipment.method_id,
        )

        for (const method of stackMethods) {
          if (method.status !== 'done') {
            flagResolved = false
            break
          }
        }

        await this.dataSource.transaction(async (manager) => {
          equipment.isResolved = flagResolved

          await manager.save(equipment)
        })
      }

      return handleOK('')
    } catch (error) {
      console.log(error.message)
      handleInternalServerError(error.message)
    }
  }
}
