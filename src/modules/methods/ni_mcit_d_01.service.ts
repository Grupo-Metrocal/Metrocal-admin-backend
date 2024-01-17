import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'

//steps Dto
import { EquipmentInformationDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EnvironmentalConditionsDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/enviromental_conditions.dto'
import { DescriptionPatternDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/description_patterns.dto'
import { ObservationPriorCalibrationDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/observation_prior_calibration.dto'
import { InstrumentZeroCheckDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/instrument_zero_check.dto'
import { ExternalParallelismMeasurementDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/external_parallelism_measurement.dto' 
// steps entities
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_information.entity'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/enviromental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { handleOK, handleInternalServerError } from 'src/common/handleHttp'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/Instrument_zero_check.entity'
import { ExternalParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/external_parallelism_measurement.entity'
import { ObservationPriorCalibrationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/observation_prior_calibration.entity'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class NI_MCIT_D_01Service {
  constructor(
    private readonly dataSource: DataSource,
    
    @InjectRepository(NI_MCIT_D_01)
    private readonly NI_MCIT_D_01Repository: Repository<NI_MCIT_D_01>,
    
    @InjectRepository(EquipmentInformationNI_MCIT_D_01)
    private readonly EquipmentInformationNI_MCIT_D_01Repository: Repository<EquipmentInformationNI_MCIT_D_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_D_01)
    private readonly EnvironmentalConditionsNI_MCIT_D_01Repository: Repository<EnvironmentalConditionsNI_MCIT_D_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_D_01)
    private readonly DescriptionPatternNI_MCIT_D_01Repository: Repository<DescriptionPatternNI_MCIT_D_01>,
    @InjectRepository(ObservationPriorCalibrationNI_MCIT_D_01)
    private readonly ObservationPriorCalibrationNI_MCIT_D_01Repository: Repository<ObservationPriorCalibrationNI_MCIT_D_01>,
    @InjectRepository(InstrumentZeroCheckNI_MCIT_D_01)
    private readonly InstrumentZeroCheckNI_MCIT_D_01Repository: Repository<InstrumentZeroCheckNI_MCIT_D_01>,
    @InjectRepository(ExternalParallelismMeasurementNI_MCIT_D_01)
    private readonly ExternalParallelismMeasurementNI_MCIT_D_01NI_MCIT_D_01Repository: Repository<ExternalParallelismMeasurementNI_MCIT_D_01>,

  ) {}

  async create() {
    try {
      const newNI_MCIT_D_01 = this.NI_MCIT_D_01Repository.create()
      const method = await this.NI_MCIT_D_01Repository.save(newNI_MCIT_D_01)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
//2
  async equipmentInformation(
    equipment: EquipmentInformationDtoNI_MCIT_D_01,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEquipment = method.equipment_information

    if (existingEquipment) {
      this.EquipmentInformationNI_MCIT_D_01Repository.merge(
        existingEquipment,
        equipment,
      )
    } else {
      const newEquipment =
        this.EquipmentInformationNI_MCIT_D_01Repository.create(equipment)
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
//3
async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsDtoNI_MCIT_D_01,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.EnvironmentalConditionsNI_MCIT_D_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.EnvironmentalConditionsNI_MCIT_D_01Repository.create(
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
//4
async descriptionPattern(
  descriptionPattern: DescriptionPatternDtoNI_MCIT_D_01,
  methodId: number,
) {
  const method = await this.NI_MCIT_D_01Repository.findOne({
    where: { id: methodId },
    relations: ['description_pattern'],
  })

  if (!method) {
    return handleInternalServerError('El método no existe')
  }

  const existingDescriptionPattern = method.description_pattern

  if (existingDescriptionPattern) {
    this.DescriptionPatternNI_MCIT_D_01Repository.merge(
      existingDescriptionPattern,
      descriptionPattern,
    )
  } else {
    const newDescriptionPattern =
      this.DescriptionPatternNI_MCIT_D_01Repository.create(descriptionPattern)
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
//5
async observationpriorcalibration(
  observationpriorcalibration: ObservationPriorCalibrationDtoNI_MCIT_D_01,
  methodId: number,
) {
  const method = await this.NI_MCIT_D_01Repository.findOne({
    where: { id: methodId },
    relations: ['description_pattern'],
  })

  if (!method) {
    return handleInternalServerError('El método no existe')
  }

  const existingDescriptionPattern = method.observation_prior_calibration

  if (existingDescriptionPattern) {
    this.ObservationPriorCalibrationNI_MCIT_D_01Repository.merge(
      existingDescriptionPattern,
      observationpriorcalibration,
    )
  } else {
    const newDescriptionPattern =
      this.ObservationPriorCalibrationNI_MCIT_D_01Repository.create(observationpriorcalibration)
    method.observation_prior_calibration = newDescriptionPattern
  }

  try {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(method.observation_prior_calibration)
      await manager.save(method)
    })

    return handleOK(method)
  } catch (error) {
    return handleInternalServerError(error.message)
  }
}
//6
async instrumentzerocheck(
  instrumentzerocheck: InstrumentZeroCheckDtoNI_MCIT_D_01,
  methodId: number,
) {
  const method = await this.NI_MCIT_D_01Repository.findOne({
    where: { id: methodId },
    relations: ['description_pattern'],
  })

  if (!method) {
    return handleInternalServerError('El método no existe')
  }

  const existingDescriptionPattern = method.instrument_zero_check

  if (existingDescriptionPattern) {
    this.InstrumentZeroCheckNI_MCIT_D_01Repository.merge(
      existingDescriptionPattern,
      instrumentzerocheck,
    )
  } else {
    const newDescriptionPattern =
      this.InstrumentZeroCheckNI_MCIT_D_01Repository.create(instrumentzerocheck)
    method.instrument_zero_check = newDescriptionPattern
  }

  try {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(method.instrument_zero_check)
      await manager.save(method)
    })

    return handleOK(method)
  } catch (error) {
    return handleInternalServerError(error.message)
  }
}
//7
async externalparallelismmeasurement (
  externalparallelismmeasurement: ExternalParallelismMeasurementDtoNI_MCIT_D_01,
  methodId: number,
) {
  const method = await this.NI_MCIT_D_01Repository.findOne({
    where: { id: methodId },
    relations: ['description_pattern'],
  })

  if (!method) {
    return handleInternalServerError('El método no existe')
  }

  const existingDescriptionPattern = method.external_parallelism_measurement

  if (existingDescriptionPattern) {
    this.ExternalParallelismMeasurementNI_MCIT_D_01NI_MCIT_D_01Repository.merge(
      existingDescriptionPattern,
      externalparallelismmeasurement,
    )
  } else {
    const newDescriptionPattern =
      this.ExternalParallelismMeasurementNI_MCIT_D_01NI_MCIT_D_01Repository.create(externalparallelismmeasurement)
    method.external_parallelism_measurement = newDescriptionPattern
  }

  try {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(method.external_parallelism_measurement)
      await manager.save(method)
    })

    return handleOK(method)
  } catch (error) {
    return handleInternalServerError(error.message)
  }
}
}