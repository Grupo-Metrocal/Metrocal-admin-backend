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
import { EquipmentInformationT_03Dto } from './dto/NI_MCIT_T_03/equipment-information.dto'
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
import { Activity } from '../activities/entities/activities.entity'
import { generateServiceCodeToMethod } from 'src/utils/codeGenerator'
import { formatDate } from 'src/utils/formatDate'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode } from 'src/utils/generateCertCode'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'

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

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_03Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_T_03Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationT_03Dto,
    methodId: number,
    increase?: boolean,
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

        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }

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
    increase?: boolean,
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

        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }

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
    increase?: boolean,
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

        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }

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
    increase?: boolean,
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
        method.updated_at = new Date()
        method.status = 'done'

        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }

        await manager.save(method)
      })

      await Promise.all([
        this.generateCertificateCodeToMethod(method.id),
        this.activitiesService.updateActivityProgress(activityId),
        this.methodService.isResolvedAllServices(activityId),
      ])

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

      const lastMethod = await this.NI_MCIT_T_03Repository.createQueryBuilder(
        'NI_MCIT_T_03',
      )
        .orderBy('NI_MCIT_T_03.record_index', 'DESC')
        .getOne()

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      await this.dataSource.transaction(async (manager) => {
        method.record_index =
          !lastMethod ||
          lastMethod.created_at.getFullYear() !==
            method.created_at.getFullYear()
            ? 1
            : lastMethod.record_index + 1

        await manager.save(method)
      })

      const certificate = await this.certificateService.create(
        'T',
        method.record_index,
      )

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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_T_03Repository.findOne({
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
        '../mail/templates/excels/ni_mcit_t_03.xlsx',
      )

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('Entrada de Datos')

      sheet.cell('C3').value(method.equipment_information.sensor)
      sheet.cell('C6').value(method.equipment_information.unit)
      sheet.cell('C7').value(Number(method.equipment_information.resolution))
      sheet.cell('L5').value(method.environmental_conditions.pattern)
      sheet.cell('H3').value(method.description_pattern.pattern)
      sheet
        .cell('L3')
        .value(Number(method.environmental_conditions.temperature))
      sheet.cell('L4').value(Number(method.environmental_conditions.humidity))

      for (const result of method.calibration_results.results) {
        for (const [
          index,
          calibrationFactor,
        ] of result.calibration_factor.entries()) {
          if (result.cicle_number === 1) {
            sheet
              .cell(`A${index + 14}`)
              .value(Number(calibrationFactor.pattern))

            sheet
              .cell(`B${index + 14}`)
              .value(Number(calibrationFactor.upward.equipment))
            sheet
              .cell(`C${index + 14}`)
              .value(Number(calibrationFactor.downward.equipment))
          }

          if (result.cicle_number === 2) {
            sheet
              .cell(`D${index + 14}`)
              .value(Number(calibrationFactor.upward.equipment))
            sheet
              .cell(`E${index + 14}`)
              .value(Number(calibrationFactor.downward.equipment))
          }
        }
      }

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return await this.getCertificateResult(methodID, activityID)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMehotdById(methodId: number) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
        where: { id: methodId },
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

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
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

      const sheet = workbook.sheet('Certificado')

      let pattern_indication = []
      let instrument_indication = []
      let correction = []
      let uncertainty = []

      for (
        let i = 0;
        i <= method.calibration_results.results[0].calibration_factor.length;
        i++
      ) {
        const patternIndication = sheet.cell(`D${25 + i}`).value()
        pattern_indication.push(
          formatNumberCertification(
            patternIndication,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const instrumentIndication = sheet.cell(`F${25 + i}`).value()
        instrument_indication.push(
          formatNumberCertification(
            instrumentIndication,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const correctionValue = sheet.cell(`L${25 + i}`).value()
        correction.push(
          formatNumberCertification(
            correctionValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const uncertaintyValue = sheet.cell(`R${25 + i}`).value()
        uncertainty.push(
          this.methodService.getSignificantFigure(uncertaintyValue),
        )
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = workbook.sheet('CMC')

      for (let i = 0; i <= method.calibration_results.results.length; i++) {
        const cmcPointValue = sheetCMC.cell(`I${16 + i}`).value()
        cmcPoint.push(
          typeof cmcPointValue === 'number'
            ? Number(cmcPointValue.toFixed(2))
            : cmcPointValue,
        )

        const cmcPrefValue = sheetCMC.cell(`J${16 + i}`).value()
        cmcPref.push(
          typeof cmcPrefValue === 'number'
            ? Number(cmcPrefValue.toFixed(5))
            : cmcPrefValue,
        )

        const uncertaintyCMCValue = sheetCMC.cell(`K${16 + i}`).value()
        uncertaintyCMC.push(
          typeof uncertaintyCMCValue === 'number'
            ? Number(uncertaintyCMCValue.toFixed(5))
            : uncertaintyCMCValue,
        )

        const cmcValue = sheetCMC.cell(`L${16 + i}`).value()
        cmc.push(
          typeof cmcValue === 'number' ? Number(cmcValue.toFixed(5)) : cmcValue,
        )

        const mincmcValue = sheetCMC.cell(`M${16 + i}`).value()
        mincmc.push(
          typeof mincmcValue === 'number'
            ? Number(mincmcValue.toFixed(5))
            : mincmcValue,
        )
      }

      const CMC = {
        cmcPoint,
        cmcPref,
        uncertaintyCMC,
        cmc,
        mincmc,
      }

      const process_calibrator = await this.patternsService.findByCodeAndMethod(
        method.description_pattern.pattern,
        'NI-MCIT-T-03',
      )

      const hygrothermometer = await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.pattern,
        'NI-MCIT-T-03',
      )

      const calibration_results_certificate = {
        pattern_indication,
        instrument_indication,
        correction,
        uncertainty: this.methodService.formatUncertainty(
          this.formatUncertaintyWithCMC(uncertainty, CMC),
        ),
      }

      return handleOK({
        calibration_results: calibration_results_certificate,
        process_calibrator_used: process_calibrator.data,
        hygrothermometer_used: hygrothermometer?.data || {},
        optionsCMCOnCertificate: method.optionsCMCOnCertificate,
        equipment_information: {
          certification_code: formatCertCode(
            method.certificate_code,
            method.modification_number,
          ),
          service_code: activity.quote_request.no,
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(method.updated_at.toString()),
          device: method.equipment_information.device || '---',
          maker: method.equipment_information.maker || '---',
          serial_number: method.equipment_information.serial_number || '---',
          measurement_range: `${method.equipment_information.temperature_min} ${method.equipment_information.unit} a ${method.equipment_information.temperature_max} ${method.equipment_information.unit}`,
          model: method.equipment_information.model || '---',
          code: method.equipment_information.code || '---',
          sensor: method.equipment_information.sensor || '---',
          resolution:
            `${formatSameNumberCertification(equipment_information.resolution)} ${equipment_information.unit}` ||
            '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(sheet.cell('E39').value())} °C ± ${formatNumberCertification(sheet.cell('G39').value())} °C`,
          humidity: `Humedad: ${formatNumberCertification(sheet.cell('E40').value())} % ± ${formatNumberCertification(sheet.cell('G40').value())} %`,
        },
        client_email: activity.quote_request.client.email,
        creditable: description_pattern.creditable,
        observations: `
${method.description_pattern.observation}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
La corrección corresponde al valor del patrón menos las indicación del equipo.
La indicación del patrón de referencia y del equipo corresponde al promedio de 4 mediciones.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no puede ser reproducido parcialmente excepto en su totalidad, sin previa aprobación escrita del laboratorio que lo emite.`,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  formatUncertaintyWithCMC(uncertainty: any, cmc: any) {
    const uncertaintyWithCMC = uncertainty.map(
      (uncertaintyValue: number, index: number) => {
        if (typeof uncertaintyValue !== 'number') return uncertaintyValue

        if (Number(uncertaintyValue) < Number(cmc.mincmc[index - 1])) {
          return this.methodService.getSignificantFigure(cmc.cmc[index - 1])
        }

        return uncertaintyValue
      },
    )

    return uncertaintyWithCMC
  }

  async generatePDFCertificate(
    activityID: number,
    methodID: number,
    generatePDF = false,
  ) {
    try {
      const method = await this.NI_MCIT_T_03Repository.findOne({
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
        dataCertificate.data.calibration_results.pattern_indication.map(
          (indication, index) => ({
            pattern_indication: indication,
            instrument_indication:
              dataCertificate.data.calibration_results.instrument_indication[
                index
              ],
            correction:
              dataCertificate.data.calibration_results.correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.uncertainty[index],
          }),
        )
      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/t-03.hbs',
        dataCertificate.data,
      )

      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      return handleOK({
        pdf: PDF,
        client_email: dataCertificate.data.client_email,
        fileName: `Certificado-${dataCertificate.data.equipment_information.device}-${dataCertificate.data.equipment_information.certification_code}.pdf`,
        clientName: dataCertificate.data.equipment_information.applicant,
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

      const { pdf, client_email, fileName, clientName } = data.data

      await this.mailService.sendMailCertification({
        user: client_email,
        pdf,
        fileName,
        clientName,
      })

      return handleOK('Certificado enviado con exito')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
