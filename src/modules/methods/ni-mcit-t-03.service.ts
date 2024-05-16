import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { PatternsService } from '../patterns/patterns.service'
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'
import { InjectRepository } from '@nestjs/typeorm'
import { NI_MCIT_T_03 } from './entities/NI_MCIT_T_03/NI_MCIT_T_03.entity'
import { DataSource, Repository } from 'typeorm'
import { EquipmentInformationNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/equipment_informatio.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationDto } from './dto/NI_MCIT_T_03/equipment-information.dto'
import { CalibrationResultsNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_T_03 } from './entities/NI_MCIT_T_03/steps/description_pattern.entity'
import { CalibrationResultsDto } from './dto/NI_MCIT_T_03/calibraion_results.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_T_03/environmental_condition.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_T_03/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'

@Injectable()
export class NI_MCIT_T_03Service {
  constructor(
    @InjectRepository(NI_MCIT_T_03)
    private NI_MCIT_T_03Repository: Repository<NI_MCIT_T_03>,

    @InjectRepository(EquipmentInformationNI_MCIT_T_03)
    private equipmentInformationNI_MCIT_T_03Repository: Repository<EquipmentInformationNI_MCIT_T_03>,

    @InjectRepository(CalibrationResultsNI_MCIT_T_03)
    private calibrationResultsNI_MCIT_T_03Repository: Repository<CalibrationResultsNI_MCIT_T_03>,

    @InjectRepository(EnvironmentalConditionsNI_MCIT_T_03)
    private environmentalConditionsNI_MCIT_T_03Repository: Repository<EnvironmentalConditionsNI_MCIT_T_03>,

    @InjectRepository(DescriptionPatternNI_MCIT_T_03)
    private descriptionPatternNI_MCIT_T_03Repository: Repository<DescriptionPatternNI_MCIT_T_03>,

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
      const newNI_MCIT_T_03 = this.NI_MCIT_T_03Repository.create()
      const mehotd = await this.NI_MCIT_T_03Repository.save(newNI_MCIT_T_03)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(calibrationLocation: string, methodId: number) {
    const method = await this.NI_MCIT_T_03Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = calibrationLocation

    try {
      await this.NI_MCIT_T_03Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationDto,
    methodId: number,
  ) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_T_03Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_T_03Repository.create(equipment)
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

  async calibrationResults(
    calibrationResults: CalibrationResultsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_03Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_T_03Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_T_03Repository.create(calibrationResults)
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

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_03Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_T_03Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_T_03Repository.create(
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

  async descriptionPattern(
    descriptionPattern: DescriptionPatternDto,
    methodId: number,
    activityId: number,
  ) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_T_03Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_T_03Repository.create(
            descriptionPattern,
          )
        method.description_pattern = newDescriptionPattern
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.description_pattern)

        method.status = 'done'
        await manager.save(method)
      })

      await this.generateCertificateCodeToMethod(method.id)

      await this.activitiesService.updateActivityProgress(activityId)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
        where: { id: methodID },
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      const certificate = await this.certificateService.create('T')

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_T_03Repository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async autoSaveExcel(filePath: string) {
    return new Promise((resolve, reject) => {
      // save excel file from powershell

      const powershellCommand = `
      $Excel = New-Object -ComObject Excel.Application
      $Excel.Visible = $false
      $Excel.DisplayAlerts = $false
      $Workbook = $Excel.Workbooks.Open('${filePath}')
      $Workbook.Save()
      $Workbook.Close()
      $Excel.Quit()

      `

      exec(
        powershellCommand,
        { shell: 'powershell.exe' },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`)
            reject(error)
          } else if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`)
            reject(new Error(stderr))
          } else {
            resolve(stdout)
          }
        },
      )
    })
  }
}
