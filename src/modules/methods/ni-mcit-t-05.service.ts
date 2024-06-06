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

  async descriptionPattern(
    descriptionPattern: DescriptionPatternT05Dto,
    methodId: number,
    activityId: number,
  ) {
    try {
      const method = await this.NI_MCIT_T_05Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_T_05Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_T_05Repository.create(
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
      const method = await this.NI_MCIT_T_05Repository.findOne({
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

      await this.NI_MCIT_T_05Repository.save(method)

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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_T_05Repository.findOne({
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

    if (
      !equipment_information ||
      !environmental_conditions ||
      !description_pattern ||
      !calibration_results
    ) {
      return handleInternalServerError(
        'El método no tiene la información necesaria para generar el certificado',
      )
    }

    try {
      const filePath = path.join(
        __dirname,
        '../mail/templates/excels/ni_mcit_t_05.xlsx',
      )

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('DATOS')

      // define unit
      let unit: number

      if (equipment_information.unit === '°C') {
        unit = 1
      } else if (equipment_information.unit === '°F') {
        unit = 2
      }

      let type_thermometer: number

      if (equipment_information.type_thermometer === 'mercurio') {
        type_thermometer = 1
      } else if (equipment_information.type_thermometer === 'Alcohol, etanol') {
        type_thermometer = 2
      } else if (equipment_information.type_thermometer === 'Tolueno') {
        type_thermometer = 3
      } else if (equipment_information.type_thermometer === 'Pentano') {
        type_thermometer = 4
      } else {
        type_thermometer = 1
      }

      sheet.cell('S5').value(unit)
      sheet.cell('V5').value(type_thermometer)

      sheet.cell('O14').value(equipment_information.no_points)
      sheet.cell('O15').value(equipment_information.no_readings)
      sheet.cell('I14').value(equipment_information.resolution)
      sheet
        .cell('I13')
        .value(
          `${equipment_information.temperature_min} a ${equipment_information.temperature_max}`,
        )

      // define environmental conditions

      for (let i = 0; i < environmental_conditions.points.length; i++) {
        const point = environmental_conditions.points[i]
        let row = 6 + (point.point_number - 1) * 2

        if (point.point_number === -1) {
          sheet.cell('H40').value(point.temperature.initial)
          sheet.cell('I40').value(point.temperature.final)

          sheet.cell('H41').value(point.humidity.initial)
          sheet.cell('I41').value(point.humidity.final)

          continue
        }

        point.point_number > 1 && (row += 2)

        sheet.cell(40, row).value(point.temperature.initial)
        sheet.cell(40, row + 1).value(point.temperature.final)

        sheet.cell(41, row).value(point.humidity.initial)
        sheet.cell(41, row + 1).value(point.humidity.final)
      }

      // define calibration results
      for (let i = 0; i < calibration_results.results.length; i++) {
        const result = calibration_results.results[i]

        sheet.cell(`D${29 + i}`).value(result.temperature)

        for (let j = 0; j < result.calibrations.length; j++) {
          const calibration = result.calibrations[j]

          if (calibration.point_number === -1) {
            sheet.cell(`H${29 + i}`).value(calibration.initial)
            sheet.cell(`I${29 + i}`).value(calibration.final)
            continue
          }

          let row = 6 + (calibration.point_number - 1) * 2
          const col = 29 + i

          calibration.point_number > 1 && (row += 2)

          sheet.cell(col, row).value(calibration.initial)
          sheet.cell(col, row + 1).value(calibration.final)
        }
      }

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return await this.getCertificateResult(methodID, activityID)
    } catch (error) {
      console.error(error)
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.NI_MCIT_T_05Repository.findOne({
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

      if (
        !equipment_information ||
        !environmental_conditions ||
        !description_pattern ||
        !calibration_results
      ) {
        return handleInternalServerError(
          'El método no tiene la información necesaria para generar el certificado',
        )
      }

      const dataActivity =
        await this.activitiesService.getActivitiesByID(activityID)

      if (!dataActivity.success) {
        return handleInternalServerError('La actividad no existe')
      }

      const activity = dataActivity.data as Activity

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('DA °C (5 ptos)')

      let reference_temperature = []
      let thermometer_indication = []
      let correction = []
      let uncertainty = []

      for (
        let i = 0;
        i <= method.calibration_results.results[0].calibrations.length;
        i++
      ) {
        const referenceTemperature = sheet.cell(`D${28 + i}`).value()
        reference_temperature.push(
          typeof referenceTemperature === 'number'
            ? referenceTemperature.toFixed(2)
            : referenceTemperature,
        )

        const thermometerIndication = sheet.cell(`F${28 + i}`).value()
        thermometer_indication.push(
          typeof thermometerIndication === 'number'
            ? thermometerIndication.toFixed(2)
            : thermometerIndication,
        )

        const correctionValue = sheet.cell(`L${28 + i}`).value()
        correction.push(
          typeof correctionValue === 'number'
            ? correctionValue.toFixed(2)
            : correctionValue,
        )

        const uncertaintyValue = sheet.cell(`R${28 + i}`).value()
        uncertainty.push(
          typeof uncertaintyValue === 'number'
            ? uncertaintyValue.toFixed(2)
            : uncertaintyValue,
        )
      }

      const calibration_results_certificate = {
        reference_temperature,
        thermometer_indication,
        correction,
        uncertainty,
      }

      const digitalThermometer = await this.patternsService.findByCodeAndMethod(
        method.description_pattern.pattern,
        'NI-MCIT-T-05',
      )

      const hygrothermometer = await this.patternsService.findByCodeAndMethod(
        'NI-MCPPT-05',
        'NI-MCIT-T-05',
      )

      const oilBath = await this.patternsService.findByCodeAndMethod(
        'NI-MCPT-38',
        'NI-MCIT-T-05',
      )

      return handleOK({
        calibration_results: calibration_results_certificate,
        digitalThermometer: digitalThermometer.data,
        hygrothermometer: hygrothermometer.data,
        oilBath: oilBath.data,
        equipment_information: {
          certification_code: method.certificate_code,
          service_code: generateServiceCodeToMethod(method.id),
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(activity.updated_at as any),
          device: method.equipment_information.device || '---',
          maker: method.equipment_information.maker || '---',
          serial_number: method.equipment_information.serial_number || '---',
          measurement_range: `${method.equipment_information.temperature_min} ${method.equipment_information.unit} a ${method.equipment_information.temperature_max} ${method.equipment_information.unit}`,
          model: method.equipment_information.model || '---',
          code: method.equipment_information.code || '---',
          applicant: activity.quote_request.client.company_name,
          address: activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        environmental_conditions: {
          temperature: `Temperatura: ${sheet.cell('E46').value()} °C ± ${sheet.cell('G46').value()} °C`,
          humidity: `Humedad: ${sheet.cell('E47').value()} % ± ${sheet.cell('G47').value()} %`,
        },
        client_email: activity.quote_request.client.email,
        observations: `
        ${method.description_pattern.observation}
        Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
        ${sheet.cell('A91').value()}
        ${sheet.cell('A92').value()}
        Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
        Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.
        `,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generatePDFCertificate(
    activityID: number,
    methodID: number,
    generatePDF = false,
  ) {
    try {
      const method = await this.NI_MCIT_T_05Repository.findOne({
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

      let dataCertificate: any

      if (!fs.existsSync(method.certificate_url) || generatePDF) {
        dataCertificate = await this.generateCertificate({
          activityID,
          methodID,
        })
      } else {
        dataCertificate = await this.getCertificateResult(methodID, activityID)
      }

      if (!dataCertificate.success) {
        return dataCertificate
      }

      dataCertificate.data.calibration_results =
        dataCertificate.data.calibration_results.reference_temperature.map(
          (indication, index) => ({
            reference_temperature: indication,
            thermometer_indication:
              dataCertificate.data.calibration_results.thermometer_indication[
                index
              ],
            correction:
              dataCertificate.data.calibration_results.correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.uncertainty[index],
          }),
        )
      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/t-05.hbs',
        dataCertificate.data,
      )

      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      return handleOK({
        pdf: PDF,
        client_email: dataCertificate.data.client_email,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async sendCertificateToClient(activityID: number, methodID: number) {
    try {
      const data = await this.generatePDFCertificate(activityID, methodID, true)

      if (!data.success) {
        return data
      }

      const { pdf, client_email } = data.data

      await this.mailService.sendMailCertification({
        user: client_email,
        pdf,
      })

      return handleOK('Certificado enviado con exito')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
