import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { EquipmentInformationNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/environmental_conditions.entity'
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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodID },
      relations: ['equipment_information', 'environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const { equipment_information, environmental_conditions } = method

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
        `../mail/templates/excels/ni_mcit_p_01_${activity.quote_request.no}.xlsx`,
      )

      fs.copyFileSync(filePath, newFilePath)

      const workbook = await XlsxPopulate.fromFileAsync(newFilePath)
      workbook
        .sheet('NI-R01-MCIT-T-01')
        .cell('B6')
        .value('FRANCISCO JAVIER GARCIA')

      workbook.toFileAsync(newFilePath)
      await this.autoSaveExcel(newFilePath)
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