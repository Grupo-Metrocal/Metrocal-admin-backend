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
import { exec } from 'child_process'
import { TokenService } from '../auth/jwt/jwt.service'

import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { PatternsService } from '../patterns/patterns.service'
import { NI_MCIT_T_01 } from './entities/NI_MCIT_T_01/NI_MCIT_T_01.entity'
import { NI_MCIT_M_01 } from './entities/NI_MCIT_M_01/NI_MCIT_M_01.entity'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_T_01Service } from './ni-mcit-t-01.service'
import { MailService } from '../mail/mail.service'

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

      const methodsStack = await this[method.method_name].find({
        where: {
          id: In(method.methodsID),
        },
        relations: relations,
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

  async killExcelProcess(excel_url: string) {
    console.log('Killing excel process')
    return new Promise((resolve, reject) => {
      const command = `powershell.exe Get-Process Excel | Where-Object { $_.MainWindowTitle -like "*${excel_url.replace(/\\/g, '\\\\')}*" } | ForEach-Object { $_.Kill() }`

      exec(command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al eliminar el proceso excel: ${error.message}`)
          reject(error)
        } else if (stderr) {
          console.error(`Error en la salida estándar: ${stderr}`)
          reject(new Error(stderr))
        } else {
          resolve(stdout)
        }
      })
    })
  }

  async reviewMethod(method_name: string, method_id: number, token: string) {
    if (!token || !method_id || !method_name) {
      return handleBadrequest(new Error('Faltan parámetros'))
    }

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
              const dataMethod = await this[method_name].generatePDFCertificate(
                activityID,
                method.id,
              )

              if (dataMethod.success) {
                collectionPDF.push({
                  filename: `Certificado de calibración equipo ${equipment.name} - ${method.id}.pdf`,
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
      })

      return handleOK('Email enviado')
    } catch (error) {
      console.log(error)
      return handleInternalServerError(error.message)
    }
  }
}
