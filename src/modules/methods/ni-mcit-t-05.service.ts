import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { PatternsService } from '../patterns/patterns.service'
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'
import { InjectRepository } from '@nestjs/typeorm'
import { NI_MCIT_T_05 } from './entities/NI_MCIT_T_05/NI_MCIT_T_05.entity'
import { DataSource, Repository } from 'typeorm'
import { EquipmentInformationNI_MCIT_T_05 } from './entities/NI_MCIT_T_05/steps/equipment_informatio.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationT05Dto } from './dto/NI_MCIT_T_05/equipment-information.dto'
import { CalibrationResultsNI_MCIT_T_05 } from './entities/NI_MCIT_T_05/steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_T_05 } from './entities/NI_MCIT_T_05/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_T_05 } from './entities/NI_MCIT_T_05/steps/description_pattern.entity'
import { CalibrationResultsT05Dto } from './dto/NI_MCIT_T_05/calibraion_results.dto'
import { EnvironmentalConditionsT05Dto } from './dto/NI_MCIT_T_05/environmental_condition.dto'
import { DescriptionPatternT05Dto } from './dto/NI_MCIT_T_05/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { Activity } from '../activities/entities/activities.entity'
import { generateServiceCodeToMethod } from 'src/utils/codeGenerator'
import { formatDate } from 'src/utils/formatDate'

@Injectable()
export class NI_MCIT_T_05Service {
  constructor(
    @InjectRepository(NI_MCIT_T_05)
    private NI_MCIT_T_05Repository: Repository<NI_MCIT_T_05>,

    @InjectRepository(EquipmentInformationNI_MCIT_T_05)
    private equipmentInformationNI_MCIT_T_05Repository: Repository<EquipmentInformationNI_MCIT_T_05>,

    @InjectRepository(CalibrationResultsNI_MCIT_T_05)
    private calibrationResultsNI_MCIT_T_05Repository: Repository<CalibrationResultsNI_MCIT_T_05>,

    @InjectRepository(EnvironmentalConditionsNI_MCIT_T_05)
    private environmentalConditionsNI_MCIT_T_05Repository: Repository<EnvironmentalConditionsNI_MCIT_T_05>,

    @InjectRepository(DescriptionPatternNI_MCIT_T_05)
    private descriptionPatternNI_MCIT_T_05Repository: Repository<DescriptionPatternNI_MCIT_T_05>,

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,
    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,
    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @Inject(forwardRef(() => MethodsService))
    private readonly methodService: MethodsService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_T_05 = this.NI_MCIT_T_05Repository.create()
      const mehotd = await this.NI_MCIT_T_05Repository.save(newNI_MCIT_T_05)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(calibrationLocation: string, methodId: number) {
    const method = await this.NI_MCIT_T_05Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = calibrationLocation

    try {
      await this.NI_MCIT_T_05Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationT05Dto,
    methodId: number,
  ) {
    try {
      const method = await this.NI_MCIT_T_05Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_T_05Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_T_05Repository.create(equipment)
        method.equipment_information = newEquipment
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.equipment_information)
        await manager.save(method)
      })

      return handleOK(method.equipment_information)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsT05Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_05Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_T_05Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_T_05Repository.create(
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
    calibrationResults: CalibrationResultsT05Dto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_05Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_T_05Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_T_05Repository.create(calibrationResults)
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
}
