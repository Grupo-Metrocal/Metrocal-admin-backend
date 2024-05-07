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
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { MailService } from '../mail/mail.service'
import { PatternsService } from '../patterns/patterns.service'

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

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,

    private readonly certificateService: CertificateService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
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

  async addCalibrationLocation(calibrationLocation: string, methodId: number) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = calibrationLocation

    try {
      await this.NI_MCIT_P_01Repository.save(method)

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
    activityId: number,
  ) {
    try {
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
          this.DescriptionPatternNI_MCIT_P_01Repository.create(
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
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'calibration_results',
        'description_pattern',
        'environmental_conditions',
      ],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const dataActivity =
      await this.activitiesService.getActivitiesByID(activityID)

    if (!dataActivity.success) {
      return handleInternalServerError('La actividad no existe')
    }

    const { data: activity } = dataActivity as { data: Activity }

    // const equipment = activity.quote_request.equipment_quote_request.filter(
    //   async (equipment) => {
    //     const stack = await this.methodsService.getMethodsID(equipment.id)

    //     // IS BAD, FIX IT
    //     if (stack.success) {
    //       return stack.data.some((method) => method.id === methodID)
    //     }
    //   },
    // )

    // if (equipment.length === 0) {
    //   return handleInternalServerError(
    //     'El método no existe en la actividad seleccionada',
    //   )
    // }

    try {
      let filePath = ''

      if (method.description_pattern.pattern === 'NI-MCPP-05') {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01_5.xlsx',
        )
      } else if (method.description_pattern.pattern === 'NI-MCPP-06') {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01_06.xlsx',
        )
      } else {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01.xlsx',
        )
      }

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      if (!workbook) {
        return handleInternalServerError('El archivo no existe')
      }

      // enter method selected
      workbook
        .sheet('Calibración')
        .cell('I3')
        .value(method.description_pattern.pattern)

      workbook
        .sheet('Calibración')
        .cell('E10')
        .value(method.calibration_results.results.length)

      workbook
        .sheet('General')
        .cell('F16')
        .value(method.equipment_information.unit)

      workbook
        .sheet('NI-R01-MCIT-P-01')
        .cell('I10')
        .value(method.equipment_information.unit)

      workbook
        .sheet('General')
        .cell('F13')
        .value(method.equipment_information.range_min)

      workbook
        .sheet('General')
        .cell('F14')
        .value(method.equipment_information.range_max)

      // enter environmental conditions
      const sheetEC = workbook.sheet('NI-R01-MCIT-P-01')

      for (const result of method.environmental_conditions.cycles) {
        const rowOffset = (result.cycle_number - 1) * 2

        sheetEC.cell(`C${20 + rowOffset}`).value(result.ta.tac.initial)
        sheetEC.cell(`C${21 + rowOffset}`).value(result.ta.tac.final)

        sheetEC.cell(`D${20 + rowOffset}`).value(result.ta.hrp.initial)
        sheetEC.cell(`D${21 + rowOffset}`).value(result.ta.hrp.final)

        sheetEC.cell(`I${20 + rowOffset}`).value(result.hPa.pa.initial)
        sheetEC.cell(`I${21 + rowOffset}`).value(result.hPa.pa.final)
      }

      sheetEC
        .cell('E21')
        .value(method.environmental_conditions.cycles[0].ta.equipement)

      sheetEC
        .cell('J21')
        .value(method.environmental_conditions.cycles[0].hPa.equipement)

      // enter calibration result
      for (const result of method.calibration_results.results) {
        if (result.cicle_number === 1) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 1) {
              workbook
                .sheet('Calibración')
                .cell(`C${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`D${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              workbook
                .sheet('Calibración')
                .cell(`E${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`F${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }

        if (result.cicle_number === 2) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 2) {
              workbook
                .sheet('Calibración')
                .cell(`G${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`H${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              workbook
                .sheet('Calibración')
                .cell(`I${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`J${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }

        if (result.cicle_number === 3) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 3) {
              workbook
                .sheet('Calibración')
                .cell(`K${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`L${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              workbook
                .sheet('Calibración')
                .cell(`M${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              workbook
                .sheet('Calibración')
                .cell(`N${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }
      }
      workbook.toFileAsync(method.certificate_url)

      await this.autoSaveExcel(method.certificate_url)

      const workbook2 = await XlsxPopulate.fromFileAsync(method.certificate_url)
      const sheetCER = workbook2.sheet('DA Unid-kPa (5 ptos)')

      let reference_pressure = []
      let equipment_indication = []
      let correction = []
      let uncertainty = []

      let reference_pressureSys = []
      let equipment_indicationSys = []
      let correctionSys = []
      let uncertaintySys = []

      for (
        let i = 0;
        i <= method.calibration_results.results[0].calibration_factor.length;
        i++
      ) {
        const pressureValue = sheetCER.cell(`D${27 + i}`).value()
        reference_pressure.push(
          typeof pressureValue === 'number'
            ? pressureValue.toFixed(2)
            : pressureValue,
        )

        const indicationValue = sheetCER.cell(`F${27 + i}`).value()
        equipment_indication.push(
          typeof indicationValue === 'number'
            ? indicationValue.toFixed(2)
            : indicationValue,
        )

        const correctionValue = sheetCER.cell(`L${27 + i}`).value()
        correction.push(
          typeof correctionValue === 'number'
            ? correctionValue.toFixed(2)
            : correctionValue,
        )

        const uncertaintyValue = sheetCER.cell(`R${27 + i}`).value()
        uncertainty.push(
          typeof uncertaintyValue === 'number'
            ? uncertaintyValue.toFixed(2)
            : uncertaintyValue,
        )

        const pressureSysValue = sheetCER.cell(`D${64 + i}`).value()
        reference_pressureSys.push(
          typeof pressureSysValue === 'number'
            ? pressureSysValue.toFixed(1)
            : pressureSysValue,
        )

        const indicationSysValue = sheetCER.cell(`F${64 + i}`).value()
        equipment_indicationSys.push(
          typeof indicationSysValue === 'number'
            ? indicationSysValue.toFixed(1)
            : indicationSysValue,
        )

        const correctionSysValue = sheetCER.cell(`L${64 + i}`).value()
        correctionSys.push(
          typeof correctionSysValue === 'number'
            ? correctionSysValue.toFixed(1)
            : correctionSysValue,
        )

        const uncertaintySysValue = sheetCER.cell(`R${64 + i}`).value()
        uncertaintySys.push(
          typeof uncertaintySysValue === 'number'
            ? uncertaintySysValue.toFixed(1)
            : uncertaintySysValue,
        )
      }

      const calibration_results = {
        result: {
          reference_pressure,
          equipment_indication,
          correction,
          uncertainty,
        },

        result_unid_system: {
          reference_pressure: reference_pressureSys,
          equipment_indication: equipment_indicationSys,
          correction: correctionSys,
          uncertainty: uncertaintySys,
        },
      }

      const ta_eq_enviromental_conditions =
        await this.patternsService.findByCodeAndMethod(
          method.environmental_conditions.cycles[0].ta.equipement,
          'NI-MCIT-P-01',
        )
      const pressurePattern = await this.patternsService.findByCodeAndMethod(
        method.description_pattern.pattern,
        'NI-MCIT-P-01',
      )

      const certificate = {
        pattern: 'NI-MCIT-P-01',
        email: activity.quote_request.client.email,
        equipment_information: {
          certification_code: method.certificate_code,
          service_code: generateServiceCodeToMethod(method.id),
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(activity.updated_at.toString()),
          object_calibrated: method.equipment_information.device,
          manufacturer: method.equipment_information.maker,
          no_series: method.equipment_information.serial_number,
          model: method.equipment_information.model,
          measurement_range: `${method.equipment_information.range_min} ${method.equipment_information.unit} a ${method.equipment_information.range_max} ${method.equipment_information.unit}`,
          resolution: `${method.equipment_information.resolution} ${method.equipment_information.unit}`,
          code: method.equipment_information.code,
          applicant: activity.quote_request.client.company_name,
          address: activity.quote_request.client.address,
          calibration_location: method.calibration_location,
        },
        calibration_results,
        environmental_conditions: {
          atmospheric_pressure: `Presión (kPa): ${sheetCER
            .cell('T80')
            .value()} ± ${sheetCER.cell('W80').value()}`,
          temperature: `Temperatura: ${sheetCER
            .cell('E80')
            .value()} °C ± ${sheetCER.cell('G80').value()} °C`,
          humidity: `Humedad relativa: ${sheetCER
            .cell('E81')
            .value()} % ± ${sheetCER.cell('G81').value()} %`,
        },
        descriptionPattern: method.description_pattern,
        used_patterns: {
          ta_eq_enviromental_conditions: ta_eq_enviromental_conditions.data,
          pressurePattern: pressurePattern.data,
        },
        creditable: method.description_pattern.creditable,
        ta_eq_enviromental_conditions:
          method.environmental_conditions.cycles[0].ta.equipement,
        hPa_eq_enviromental_conditions:
          method.environmental_conditions.cycles[0].hPa.equipement,
        observations: `
          ${method.description_pattern.observation}
          Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
          La corrección corresponde al valor del patrón menos la indicación del equipo.
          ${sheetCER.cell('A113').value()}
          Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
          Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.
          ${sheetCER.cell('A119').value()}
          De acuerdo a lo establecido en NTON 07-004-01 Norma Metrológica del Sistema Internacional de Unidades (SI).
        `,
      }

      return handleOK(certificate)
    } catch (error) {
      console.error(error.message)
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
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodID },
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      const certificate = await this.certificateService.create('P')

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_P_01Repository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMehotdById(methodId: number) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodId },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'calibration_results',
          'description_pattern',
        ],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generatePDFCertificate(activityID: number, methodID: number) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'calibration_results',
          'description_pattern',
        ],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const dataCertificate = await this.generateCertificate({
        activityID,
        methodID,
      })

      if (!dataCertificate.success) {
        return dataCertificate
      }

      dataCertificate.data.calibration_results.result =
        dataCertificate.data.calibration_results.result.reference_pressure.map(
          (pressure, index) => ({
            reference_pressure: pressure,
            equipment_indication:
              dataCertificate.data.calibration_results.result
                .equipment_indication[index],
            correction:
              dataCertificate.data.calibration_results.result.correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.result.uncertainty[
                index
              ],
          }),
        )

      dataCertificate.data.calibration_results.result_unid_system =
        dataCertificate.data.calibration_results.result_unid_system.reference_pressure.map(
          (pressure, index) => ({
            reference_pressure: pressure,
            equipment_indication:
              dataCertificate.data.calibration_results.result_unid_system
                .equipment_indication[index],
            correction:
              dataCertificate.data.calibration_results.result_unid_system
                .correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.result_unid_system
                .uncertainty[index],
          }),
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/p-01.hbs',
        dataCertificate.data,
      )

      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      const response = await this.mailService.sendMailCertification({
        user: dataCertificate.data.email,
        pdf: PDF,
      })

      return handleOK(response)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
