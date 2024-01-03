import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { ActivitiesService } from '../activities/activities.service'
import { CreateMethodDto } from './dto/create-method.dto'
import { handleBadrequest, handleOK } from 'src/common/handleHttp'
import { Activity } from '../activities/entities/activities.entity'
import { QuotesService } from '../quotes/quotes.service'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'

@Injectable()
export class MethodsService {
  constructor(
    private readonly dataSource: DataSource,

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

                const newMethod = await this[methodName].create()
                await manager.save(newMethod)

                await this.quotesService.asyncMethodToEquipment({
                  equipmentID: equipment.id,
                  methodID: newMethod.id,
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
          'pattern_description',
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

  async deleteAllMethods() {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(NI_MCIT_P_01, {})
        await manager.delete(NI_MCIT_D_02, {})
      })
      return handleOK('Deleted all methods')
    } catch (error) {
      return handleBadrequest(error.message)
    }
  }
}
