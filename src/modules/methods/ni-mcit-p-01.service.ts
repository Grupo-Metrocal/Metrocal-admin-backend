import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'
import { CalibrationResultsDto } from './dto/NI_MCIT_P_01/calibraion_results.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_P_01/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'
import { Activity } from '../activities/entities/activities.entity'

// entities
import { EquipmentInformationNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/description_pattern.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { generateServiceCodeToMethod } from 'src/utils/codeGenerator'
import { formatDate } from 'src/utils/formatDate'
import { calculateEnvironmentConditions } from 'src/utils/methods/functions_P_01'

@Injectable()
export class NI_MCIT_P_01Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_P_01)
    private readonly NI_MCIT_P_01Repository: Repository<NI_MCIT_P_01>,

    @InjectRepository(EquipmentInformationNI_MCIT_P_01)
    private readonly EquipmentInformationNI_MCIT_P_01Repository: Repository<EquipmentInformationNI_MCIT_P_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_P_01)
    private readonly EnvironmentalConditionsNI_MCIT_P_01Repository: Repository<EnvironmentalConditionsNI_MCIT_P_01>,
    @InjectRepository(CalibrationResultsNI_MCIT_P_01)
    private readonly CalibrationResultsNI_MCIT_P_01Repository: Repository<CalibrationResultsNI_MCIT_P_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_P_01)
    private readonly DescriptionPatternNI_MCIT_P_01Repository: Repository<DescriptionPatternNI_MCIT_P_01>,

    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_P_01 = this.NI_MCIT_P_01Repository.create()
      const method = await this.NI_MCIT_P_01Repository.save(newNI_MCIT_P_01)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEquipment = method.equipment_information

    if (existingEquipment) {
      this.EquipmentInformationNI_MCIT_P_01Repository.merge(
        existingEquipment,
        equipment,
      )
    } else {
      const newEquipment =
        this.EquipmentInformationNI_MCIT_P_01Repository.create(equipment)
      method.equipment_information = newEquipment
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.equipment_information)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.EnvironmentalConditionsNI_MCIT_P_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.EnvironmentalConditionsNI_MCIT_P_01Repository.create(
          environmentalConditions,
        )
      method.environmental_conditions = newEnvironmentalConditions
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.environmental_conditions)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async calibrationResults(
    calibrationResults: CalibrationResultsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.CalibrationResultsNI_MCIT_P_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.CalibrationResultsNI_MCIT_P_01Repository.create(calibrationResults)
      method.calibration_results = newCalibrationResults
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.calibration_results)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['description_pattern'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingDescriptionPattern = method.description_pattern

    if (existingDescriptionPattern) {
      this.DescriptionPatternNI_MCIT_P_01Repository.merge(
        existingDescriptionPattern,
        descriptionPattern,
      )
    } else {
      const newDescriptionPattern =
        this.DescriptionPatternNI_MCIT_P_01Repository.create(descriptionPattern)
      method.description_pattern = newDescriptionPattern
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.description_pattern)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodID },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const dataActivity =
      await this.activitiesService.getActivitiesByID(activityID)

    if (!dataActivity) {
      return handleInternalServerError('La actividad no existe')
    }

    const { data: activity } = dataActivity as { data: Activity }

    const equipment = activity.quote_request.equipment_quote_request.filter(
      (equipment) => equipment.method_id === method.id,
    )

    if (equipment.length === 0) {
      return handleInternalServerError(
        'El método no existe en la actividad seleccionada',
      )
    }

    const certificate = {
      equipment_information: {
        service_code: generateServiceCodeToMethod(method.id),
        certificate_issue_date: formatDate(new Date().toString()),
        calibration_date: formatDate(method.updated_at.toString()),
        object_calibrated: equipment[0].name,
        manufacturer: method.equipment_information.maker,
        no_series: method.equipment_information.serial_number,
        model: method.equipment_information.model,
        range_of_measurement: method.equipment_information.measurement_range,
        resolution: method.equipment_information.resolution,
        code: method.equipment_information.code,
        applicant: activity.quote_request.client.company_name,
        address: activity.quote_request.client.address,
        calibration_location: method.calibration_location,
      },
      environmental_conditions: calculateEnvironmentConditions(
        method.environmental_conditions,
      ),
    }

    return handleOK(certificate)
  }
}
