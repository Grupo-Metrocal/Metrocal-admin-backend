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

    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    @Inject(forwardRef(() => QuotesService))
    private readonly quotesService: QuotesService,
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
            console.log(error)
            return handleBadrequest(error.message)
          }
        },
      )

      await Promise.all(promises)

      return handleOK(activity.quote_request.equipment_quote_request)
    } catch (error) {
      console.log(error)
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
      return handleOK({ NI_MCIT_P_01, NI_MCIT_D_02 })
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
}
