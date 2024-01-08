import { Injectable } from '@nestjs/common'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/instrument_zero_check.entity'

@Injectable()
export class NI_MCIT_D_02Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_D_02)
    private readonly NI_MCIT_D_02Repository: Repository<NI_MCIT_D_02>,
  
    @InjectRepository(EquipmentInformationNI_MCIT_D_02)
    private readonly EquipmentInformationRepository: Repository<EquipmentInformationNI_MCIT_D_02>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_D_02)
    private readonly EnvironmentalConditionsRepository: Repository<EnvironmentalConditionsNI_MCIT_D_02>,
    @InjectRepository(DescriptionPatternNI_MCIT_D_02)
    private readonly DescriptionPatternRepository: Repository<DescriptionPatternNI_MCIT_D_02>,
    @InjectRepository(PreInstallationCommentNI_MCIT_D_02)
    private readonly PreInstallationCommentRepository: Repository<PreInstallationCommentNI_MCIT_D_02>,
    @InjectRepository(InstrumentZeroCheckNI_MCIT_D_02)
    private readonly InstrumentZeroCheckRepository: Repository<InstrumentZeroCheckNI_MCIT_D_02>,
  ) {}

  async create() {
    try {
      const newNI_MCIT_D_02 = this.NI_MCIT_D_02Repository.create()
      const method = await this.NI_MCIT_D_02Repository.save(newNI_MCIT_D_02)
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    const newEquipment =
      this.EquipmentInformationRepository.create(equipment)

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
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
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

  async descriptionPattern (
    descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
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
    preInstallationComment: PreInstallationCommentNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
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
    instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
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
}
