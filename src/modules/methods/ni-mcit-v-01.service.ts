import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { PatternsService } from '../patterns/patterns.service'
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'
import { InjectRepository } from '@nestjs/typeorm'
import { NI_MCIT_V_01 } from './entities/NI_MCIT_V_01/NI_MCIT_V_01.entity'
import { DataSource, Repository } from 'typeorm'
import { EquipmentInformationNI_MCIT_V_01 } from './entities/NI_MCIT_V_01/steps/equipment_informatio.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationV01Dto } from './dto/NI_MCIT_V_01/equipment-information.dto'
import { CalibrationResultsNI_MCIT_V_01 } from './entities/NI_MCIT_V_01/steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_V_01 } from './entities/NI_MCIT_V_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_V_01 } from './entities/NI_MCIT_V_01/steps/description_pattern.entity'
import { CalibrationResultsV01Dto } from './dto/NI_MCIT_V_01/calibraion_results.dto'
import { EnvironmentalConditionsV01Dto } from './dto/NI_MCIT_V_01/environmental_condition.dto'
import { DescriptionPatternV01Dto } from './dto/NI_MCIT_V_01/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import { exec } from 'child_process'
import * as fs from 'fs'
import { Activity } from '../activities/entities/activities.entity'
import { formatDate } from 'src/utils/formatDate'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode, formatQuoteCode } from 'src/utils/generateCertCode'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'
import { EnginesService } from '../engines/engines.service'

@Injectable()
export class NI_MCIT_V_01Service {
  constructor(
    @InjectRepository(NI_MCIT_V_01)
    private NI_MCIT_V_01Repository: Repository<NI_MCIT_V_01>,

    @InjectRepository(EquipmentInformationNI_MCIT_V_01)
    private equipmentInformationNI_MCIT_V_01Repository: Repository<EquipmentInformationNI_MCIT_V_01>,

    @InjectRepository(CalibrationResultsNI_MCIT_V_01)
    private calibrationResultsNI_MCIT_V_01Repository: Repository<CalibrationResultsNI_MCIT_V_01>,

    @InjectRepository(EnvironmentalConditionsNI_MCIT_V_01)
    private environmentalConditionsNI_MCIT_V_01Repository: Repository<EnvironmentalConditionsNI_MCIT_V_01>,

    @InjectRepository(DescriptionPatternNI_MCIT_V_01)
    private descriptionPatternNI_MCIT_V_01Repository: Repository<DescriptionPatternNI_MCIT_V_01>,

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

    @Inject(forwardRef(() => EnginesService))
    private readonly enginesService: EnginesService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_V_01 = this.NI_MCIT_V_01Repository.create()
      const mehotd = await this.NI_MCIT_V_01Repository.save(newNI_MCIT_V_01)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_V_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_V_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationV01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_V_01Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_V_01Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_V_01Repository.create(equipment)
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

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsV01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_V_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_V_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_V_01Repository.create(
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

  async calibrationResults(
    calibrationResults: CalibrationResultsV01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_V_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_V_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_V_01Repository.create(calibrationResults)
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

  async setCertificateIssueDate(id: number) {
    const response = await this.getMehotdById(id)

    const { data: method } = response as { data: NI_MCIT_V_01 }

    return await this.dataSource.transaction((manager) => {
      if (!method.certificate_issue_date) {
        method.certificate_issue_date = new Date()
      }

      return manager.save(method)
    })
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternV01Dto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_V_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_V_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_V_01Repository.create(
            descriptionPattern,
          )
        method.description_pattern = newDescriptionPattern
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.description_pattern)
        method.updated_at = new Date()
        method.status = 'done'

        if (!method.method_end_date_finished) {
          method.method_end_date_finished = new Date()
        }

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
      const method = await this.NI_MCIT_V_01Repository.findOne({
        where: { id: methodID },
      })
      const currentYear = new Date().getFullYear()

      const lastMethod = await this.NI_MCIT_V_01Repository.createQueryBuilder(
        'NI_MCIT_V_01',
      )
        .where('EXTRACT(YEAR FROM NI_MCIT_V_01.created_at) = :currentYear', {
          currentYear,
        })
        .orderBy('NI_MCIT_V_01.last_record_index', 'DESC')
        .getOne()

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      await this.dataSource.transaction(async (manager) => {
        method.record_index = !lastMethod ? 1 : lastMethod.last_record_index + 1

        await this.methodService.updateLastRecordIndex('NI_MCIT_V_01')

        await manager.save(method)
      })

      const certificate = await this.certificateService.create(
        'V',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_V_01Repository.save(method)

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
    const method = await this.NI_MCIT_V_01Repository.findOne({
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
      const enginePath =
        await this.enginesService.getPathByCalibrationMethodAndPattern(
          'NI-MCIT-V-01',
        )

      if (!enginePath) {
        return handleInternalServerError('No se encontró la ruta del motor')
      }

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(enginePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('Datos')

      // Equipment Information
      sheet
        .cell('D8')
        .value(
          `${method.equipment_information.nominal_range} ${method.equipment_information.unit}`,
        )

      sheet.cell('D9').value(`${method.equipment_information.scale_division}`)

      sheet.cell('K4').value(equipment_information.material)
      sheet.cell('N4').value(equipment_information.balance)
      sheet.cell('K10').value(equipment_information.neck_diameter)
      sheet.cell('R4').value(equipment_information.thermometer)
      sheet.cell('U4').value(equipment_information.volumetric_container)

      // Environmental Conditions

      const pointSkips = {
        1: 0,
        2: 11,
        3: 21,
        4: 32,
        5: 43,
      }

      for (let point of environmental_conditions.points) {
        const pointSkip = pointSkips[point.point_number]

        sheet.cell(26 + pointSkip, 14).value(Number(point.temperature.initial))
        sheet.cell(26 + pointSkip, 15).value(Number(point.temperature.final))
        sheet
          .cell(26 + pointSkip, 16)
          .value(Number(point.temperature.resolution))

        sheet.cell(27 + pointSkip, 14).value(Number(point.humidity.initial))
        sheet.cell(27 + pointSkip, 15).value(Number(point.humidity.final))
        sheet.cell(27 + pointSkip, 16).value(Number(point.humidity.resolution))

        sheet.cell(28 + pointSkip, 14).value(Number(point.presion_pa.initial))
        sheet.cell(28 + pointSkip, 15).value(Number(point.presion_pa.final))
        sheet
          .cell(28 + pointSkip, 16)
          .value(Number(point.presion_pa.resolution))
      }

      for (let calibrations of calibration_results.results) {
        const pointSkip = pointSkips[calibrations.point_number]
        sheet
          .cell(23 + pointSkip, 5)
          .value(Number(calibrations?.nominal_value || 0))

        for (let [index, calibration] of calibrations.calibrations.entries()) {
          sheet
            .cell(27 + pointSkip + index, 4)
            .value(Number(calibration.pattern_dough.full))
          sheet
            .cell(27 + pointSkip + index, 5)
            .value(Number(calibration.pattern_dough.empty))
          sheet
            .cell(27 + pointSkip + index, 6)
            .value(Number(calibration.water_temperature))
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

  async getMehotdById(methodId: number) {
    try {
      const method = await this.NI_MCIT_V_01Repository.findOne({
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
      const method = await this.NI_MCIT_V_01Repository.findOne({
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

      const sheet = workbook.sheet('+DA')

      let nominal_volume = []
      let conventional_volume = []
      let desviation = []
      let uncertainty = []

      for (let i = 0; i <= calibration_results.results.length; i++) {
        const nominalVolume = sheet.cell(`B${30 + i}`).value()
        nominal_volume.push(
          formatNumberCertification(
            nominalVolume,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const conventionalVolume = sheet.cell(`D${30 + i}`).value()
        conventional_volume.push(
          formatNumberCertification(conventionalVolume, 2),
        )

        const desviationValue = sheet.cell(`H${30 + i}`).value()
        desviation.push(formatNumberCertification(desviationValue, 2))

        const uncertaintyValue = sheet.cell(`L${30 + i}`).value()
        uncertainty.push(
          this.methodService.getSignificantFigure(uncertaintyValue),
        )
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = workbook.sheet("CMC's")

      for (let i = 0; i <= calibration_results.results.length; i++) {
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

      const calibration_results_certificate = {
        nominal_volume,
        conventional_volume,
        desviation,
        uncertainty: this.methodService.formatUncertainty(
          this.formatUncertaintyWithCMC(uncertainty, CMC),
        ),
      }

      return handleOK({
        calibration_results: calibration_results_certificate,
        email:
          activity.quote_request?.alt_client_email ||
          activity.quote_request?.client.email,
        equipment_information: {
          certification_code: formatCertCode(
            method.certificate_code,
            method.modification_number,
          ),
          service_code: formatQuoteCode(
            activity.quote_request.no,
            activity.quote_request.modification_number,
          ),
          certificate_issue_date: formatDate(
            method?.certificate_issue_date?.toString(),
          ),
          calibration_date: formatDate(
            method?.description_pattern.calibration_date?.toString() || Date(),
          ),
          next_calibration_date: method?.description_pattern?.next_calibration
            ? formatDate(method?.description_pattern?.next_calibration)
            : 'No especificado',
          device: method.equipment_information.device || '---',
          maker: method.equipment_information.maker || '---',
          serial_number: method.equipment_information.serial_number || '---',
          model: method.equipment_information.model || '---',
          nominal_range:
            `${method.equipment_information.nominal_range} ${method.equipment_information.unit}` ||
            '---',
          scale_division:
            formatSameNumberCertification(
              Number(method.equipment_information.scale_division),
            ) || '---',
          code: method.equipment_information.code || '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(sheet.cell('D38').value())} ± ${formatNumberCertification(sheet.cell('F38').value())} °C`,
          humidity: `Humedad Relativa: ${formatNumberCertification(sheet.cell('D39').value())} ± ${formatNumberCertification(sheet.cell('F39').value())} % HR`,
          presion: `Presión: ${formatNumberCertification(sheet.cell('J38').value())} ± ${formatNumberCertification(sheet.cell('L38').value())} Pa`,
        },
        creditable: description_pattern.creditable,
        client_email: activity.quote_request.client.email,
        description_pattern: await this.getPatternsTableToCertificate(method),
        observations: `
${method.description_pattern.observation}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
El error corresponde al valor de la indicación del equipo menos el valor convencional de la masa de referencia.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.`,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getPatternsTableToCertificate(method: NI_MCIT_V_01) {
    const description_pattern = []

    const environment_method_used =
      await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.pattern,
        'all',
      )
    if (environment_method_used.success) {
      description_pattern.push(environment_method_used.data)
    }

    for (let i = 0; i < method.description_pattern.patterns.length; i++) {
      const pattern = method.description_pattern.patterns[i]

      const response = await this.patternsService.findByCodeAndMethod(
        pattern,
        'NI-MCIT-V-01',
      )

      if (response.success) {
        description_pattern.push(response.data)
      } else {
        const fallbackResponse = await this.patternsService.findByCodeAndMethod(
          pattern,
          'all',
        )
        if (fallbackResponse.success) {
          description_pattern.push(fallbackResponse.data)
        }
      }
    }

    return description_pattern
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
      const method = await this.NI_MCIT_V_01Repository.findOne({
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
        dataCertificate.data.calibration_results.nominal_volume.map(
          (indication, index) => ({
            nominal_volume: indication,
            conventional_volume:
              dataCertificate.data.calibration_results.conventional_volume[
                index
              ],
            desviation:
              dataCertificate.data.calibration_results.desviation[index],
            uncertainty:
              dataCertificate.data.calibration_results.uncertainty[index],
          }),
        )
      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/v-01.hbs',
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
