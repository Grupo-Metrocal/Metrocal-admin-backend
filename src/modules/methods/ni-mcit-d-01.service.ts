import { Injectable } from '@nestjs/common'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/instrument_zero_check.entity'
import { ExteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_parallelism_measurement.dto'
import { ExteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_parallelism_measurement.entity'
import { InteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/interior_parallelism_measurement.dto'
import { InteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/interior_parallelism_measurement.entity'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_measurement_accuracy.dto'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_measurement_accuracy.entity'

@Injectable()
export class NI_MCIT_D_01Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_D_01)
    private readonly NI_MCIT_D_01Repository: Repository<NI_MCIT_D_01>,
    @InjectRepository(EquipmentInformationNI_MCIT_D_01)
    private readonly EquipmentInformationRepository: Repository<EquipmentInformationNI_MCIT_D_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_D_01)
    private readonly EnvironmentalConditionsRepository: Repository<EnvironmentalConditionsNI_MCIT_D_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_D_01)
    private readonly DescriptionPatternRepository: Repository<DescriptionPatternNI_MCIT_D_01>,
    @InjectRepository(PreInstallationCommentNI_MCIT_D_01)
    private readonly PreInstallationCommentRepository: Repository<PreInstallationCommentNI_MCIT_D_01>,
    @InjectRepository(InstrumentZeroCheckNI_MCIT_D_01)
    private readonly InstrumentZeroCheckRepository: Repository<InstrumentZeroCheckNI_MCIT_D_01>,
    @InjectRepository(ExteriorParallelismMeasurementNI_MCIT_D_01)
    private readonly ExteriorParallelismMeasurementRepository: Repository<ExteriorParallelismMeasurementNI_MCIT_D_01>,
    @InjectRepository(InteriorParallelismMeasurementNI_MCIT_D_01)
    private readonly InteriorParallelismMeasurementRepository: Repository<InteriorParallelismMeasurementNI_MCIT_D_01>,
    @InjectRepository(ExteriorMeasurementAccuracyNI_MCIT_D_01)
    private readonly ExteriorMeasurementAccuracyRepository: Repository<ExteriorMeasurementAccuracyNI_MCIT_D_01>,
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

  async equipmentInformation(
    equipment: EquipmentInformationNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    const newEquipment = this.EquipmentInformationRepository.create(equipment)

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newEquipment)
        method.equipment_information = newEquipment
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    const newEnvironmentalConditions =
      this.EnvironmentalConditionsRepository.create(environmentalConditions)

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newEnvironmentalConditions)
        method.environmental_conditions = newEnvironmentalConditions
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['description_pattern'],
    })

    const newDescriptionPattern =
      this.DescriptionPatternRepository.create(descriptionPattern)

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newDescriptionPattern)
        method.description_pattern = newDescriptionPattern
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async preInstallationComment(
    preInstallationComment: PreInstallationCommentNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['pre_installation_comment'],
    })

    const newPreInstallationComment =
      this.PreInstallationCommentRepository.create(preInstallationComment)

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newPreInstallationComment)
        method.pre_installation_comment = newPreInstallationComment
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async instrumentZeroCheck(
    instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['instrument_zero_check'],
    })

    const newInstrumentZeroCheck =
      this.InstrumentZeroCheckRepository.create(instrumentZeroCheck)

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newInstrumentZeroCheck)
        method.instrument_zero_check = newInstrumentZeroCheck
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async exteriorParallelismMeasurement(
    exteriorParallelismMeasurement: ExteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['exterior_parallelism_measurement'],
    })

    const newExteriorParallelismMeasurement =
      this.ExteriorParallelismMeasurementRepository.create(
        exteriorParallelismMeasurement,
      )

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newExteriorParallelismMeasurement)
        method.exterior_parallelism_measurement =
          newExteriorParallelismMeasurement
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async interiorParallelismMeasurement(
    interiorParallelismMeasurement: InteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['interior_parallelism_measurement'],
    })

    const newInteriorParallelismMeasurement =
      this.InteriorParallelismMeasurementRepository.create(
        interiorParallelismMeasurement,
      )

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newInteriorParallelismMeasurement)
        method.interior_parallelism_measurement =
          newInteriorParallelismMeasurement
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async exteriorMeasurementAccuracy(
    exteriorMeasurementAccuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
      relations: ['exterior_measurement_accuracy'],
    })

    const newExteriorMeasurementAccuracy =
      this.ExteriorMeasurementAccuracyRepository.create(
        exteriorMeasurementAccuracy,
      )

    try {
      this.dataSource.transaction(async (manager) => {
        await manager.save(newExteriorMeasurementAccuracy)
        method.exterior_measurement_accuracy = newExteriorMeasurementAccuracy
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
