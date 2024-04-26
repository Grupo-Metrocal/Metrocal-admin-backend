import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { EquipmentInformationNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/description_pattern.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { NI_MCIT_T_01 } from './entities/NI_MCIT_T_01/NI_MCIT_T_01.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationDto } from './dto/NI_MCIT_T_01/equipment-information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_T_01/environmental_condition.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { DescriptionPatternDto } from './dto/NI_MCIT_T_01/description_pattern.dto'
import { CertificateService } from '../certificate/certificate.service'
import { CalibrationResultsDto } from './dto/NI_MCIT_T_01/calibraion_results.dto'
import { CalibrationResultsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/calibration_results.entity'

@Injectable()
export class NI_MCIT_T_01Service {
  constructor(
    @InjectRepository(NI_MCIT_T_01)
    private NI_MCIT_T_01Repository: Repository<NI_MCIT_T_01>,
    @InjectRepository(EquipmentInformationNI_MCIT_T_01)
    private equipmentInformationNI_MCIT_T_01Repository: Repository<EquipmentInformationNI_MCIT_T_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_T_01)
    private environmentalConditionsNI_MCIT_T_01Repository: Repository<EnvironmentalConditionsNI_MCIT_T_01>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService,
    @InjectRepository(DescriptionPatternNI_MCIT_T_01)
    private descriptionPatternNI_MCIT_T_01Repository: Repository<DescriptionPatternNI_MCIT_T_01>,
    @InjectRepository(CalibrationResultsNI_MCIT_T_01)
    private calibrationResultsNI_MCIT_T_01Repository: Repository<CalibrationResultsNI_MCIT_T_01>,

    private readonly certificateService: CertificateService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_T_01 = this.NI_MCIT_T_01Repository.create()
      const mehotd = await this.NI_MCIT_T_01Repository.save(newNI_MCIT_T_01)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationDto,
    methodId: number,
  ) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_T_01Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_T_01Repository.create(equipment)
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

  async addCalibrationLocation(calibrationLocation: string, methodId: number) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = calibrationLocation

    try {
      await this.NI_MCIT_T_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async calibrationResults(
    calibrationResults: CalibrationResultsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_T_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_T_01Repository.create(calibrationResults)
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
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_T_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_T_01Repository.create(
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
      const method = await this.NI_MCIT_T_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_T_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_T_01Repository.create(
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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'description_pattern',
        'calibration_results',
      ],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const {
      equipment_information,
      environmental_conditions,
      description_pattern,
      calibration_results,
    } = method

    if (!equipment_information || !environmental_conditions) {
      return handleInternalServerError(
        'El método no tiene información de equipo o condiciones ambientales',
      )
    }

    const dataActivity =
      await this.activitiesService.getActivitiesByID(activityID)

    if (!dataActivity.success) {
      return handleInternalServerError('La actividad no existe')
    }

    const activity = dataActivity.data

    try {
      const filePath = path.join(
        __dirname,
        '../mail/templates/excels/ni_mcit_t_01.xlsx',
      )

      const newFilePath = path.join(
        __dirname,
        `../mail/templates/excels/ni_mcit_t_01_${activity.quote_request.no}-${methodID}.xlsx`,
      )

      fs.copyFileSync(filePath, newFilePath)

      const workbook = await XlsxPopulate.fromFileAsync(newFilePath)

      // condiciones ambientales
      const sheetEnviromentalConditions = workbook.sheet('NI-R01-MCIT-T-01')

      sheetEnviromentalConditions
        .cell('B18')
        .value(environmental_conditions.environment.ta.tac.initial)
      sheetEnviromentalConditions
        .cell('B19')
        .value(environmental_conditions.environment.ta.tac.final)
      sheetEnviromentalConditions
        .cell('C18')
        .value(environmental_conditions.environment.ta.hrp.initial)
      sheetEnviromentalConditions
        .cell('C19')
        .value(environmental_conditions.environment.ta.hrp.final)
      sheetEnviromentalConditions
        .cell('D18')
        .value(environmental_conditions.environment.ta.equipment)
      sheetEnviromentalConditions
        .cell('F18')
        .value(environmental_conditions.environment.hpa.pa.initial)
      sheetEnviromentalConditions
        .cell('F19')
        .value(environmental_conditions.environment.hpa.pa.final)
      sheetEnviromentalConditions
        .cell('G18')
        .value(environmental_conditions.environment.hpa.equipment)
      sheetEnviromentalConditions
        .cell('I18')
        .value(environmental_conditions.environment.hpa.stabilization_time)

      // calibration results
      let initialRow = 23
      for (const value of calibration_results.results) {
        initialRow++

        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`B${initialRow}`)
          .value(value?.indication_linear[0]?.patron || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`C${initialRow}`)
          .value(value?.indication_linear[0]?.thermometer || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`D${initialRow}`)
          .value(value?.indication_linear[1]?.patron || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`E${initialRow}`)
          .value(value?.indication_linear[1]?.thermometer || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`F${initialRow}`)
          .value(value?.indication_linear[2]?.patron || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`G${initialRow}`)
          .value(value?.indication_linear[2]?.thermometer || 0)
      }

      // descrition pattern
      workbook
        .sheet('Calibración')
        .cell('J5')
        .value(description_pattern.pattern)
      // resolucion
      workbook
        .sheet('Calibración')
        .cell('F5')
        .value(equipment_information.resolution)
      // unidad de medida
      workbook.sheet('Calibración').cell('F7').value(equipment_information.unit)

      workbook.toFileAsync(newFilePath)
      return await this.autoSaveExcel(newFilePath)
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

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
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

      await this.NI_MCIT_T_01Repository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
