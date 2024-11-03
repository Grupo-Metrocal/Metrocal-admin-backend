import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { PatternsService } from '../patterns/patterns.service'
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'
import { InjectRepository } from '@nestjs/typeorm'
import { NI_MCIT_M_01 } from './entities/NI_MCIT_M_01/NI_MCIT_M_01.entity'
import { DataSource, Repository } from 'typeorm'
import { EquipmentInformationNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/equipment_information.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationM01Dto } from './dto/NI_MCIT_M_01/equipment_information.dto'
import { CalibrationResultsNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/calibration_results.entity'
import { EnvironmentalConditionsNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/description_pattern.entity'
import { CalibrationResultsM01Dto } from './dto/NI_MCIT_M_01/calibraion_results.dto'
import { EnvironmentalConditionsM01Dto } from './dto/NI_MCIT_M_01/environmental_condition.dto'
import { DescriptionPatternM01Dto } from './dto/NI_MCIT_M_01/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
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

@Injectable()
export class NI_MCIT_M_01Service {
  constructor(
    @InjectRepository(NI_MCIT_M_01)
    private NI_MCIT_M_01Repository: Repository<NI_MCIT_M_01>,

    @InjectRepository(EquipmentInformationNI_MCIT_M_01)
    private equipmentInformationNI_MCIT_M_01Repository: Repository<EquipmentInformationNI_MCIT_M_01>,

    @InjectRepository(CalibrationResultsNI_MCIT_M_01)
    private calibrationResultsNI_MCIT_M_01Repository: Repository<CalibrationResultsNI_MCIT_M_01>,

    @InjectRepository(EnvironmentalConditionsNI_MCIT_M_01)
    private environmentalConditionsNI_MCIT_M_01Repository: Repository<EnvironmentalConditionsNI_MCIT_M_01>,

    @InjectRepository(DescriptionPatternNI_MCIT_M_01)
    private descriptionPatternNI_MCIT_M_01Repository: Repository<DescriptionPatternNI_MCIT_M_01>,

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
      const newNI_MCIT_M_01 = this.NI_MCIT_M_01Repository.create()
      const mehotd = await this.NI_MCIT_M_01Repository.save(newNI_MCIT_M_01)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_M_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_M_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationM01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_M_01Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_M_01Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_M_01Repository.create(equipment)
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
    environmentalConditions: EnvironmentalConditionsM01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_M_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_M_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_M_01Repository.create(
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
    calibrationResults: CalibrationResultsM01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_M_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_M_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_M_01Repository.create(calibrationResults)
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

    const { data: method } = response as { data: NI_MCIT_M_01 }

    return await this.dataSource.transaction((manager) => {
      if (!method.certificate_issue_date) {
        method.certificate_issue_date = new Date()
      }

      return manager.save(method)
    })
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternM01Dto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_M_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_M_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_M_01Repository.create(
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
      const method = await this.NI_MCIT_M_01Repository.findOne({
        where: { id: methodID },
      })

      const lastMethod = await this.NI_MCIT_M_01Repository.createQueryBuilder(
        'NI_MCIT_M_01',
      )
        .orderBy('NI_MCIT_M_01.record_index', 'DESC')
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
        'M',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_M_01Repository.save(method)

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
    const method = await this.NI_MCIT_M_01Repository.findOne({
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
        '../mail/templates/excels/ni_mcit_M_01.xlsx',
      )

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('datos')

      let indexPoint = 0
      for (let point of calibration_results.results) {
        const pointSkeep = (point.point_number - 1) * 17
        let indexPattern = 0

        for (let pattern of point.patterns) {
          sheet.cell(`C${14 + pointSkeep + indexPattern}`).value(pattern)
          indexPattern++
        }

        sheet.cell(`D${21 + pointSkeep}`).value(point.mass)
        sheet.cell(`E${22 + pointSkeep}`).value(point.nominal_mass)
        sheet.cell(`G${22 + pointSkeep}`).value(point.calibrated_material)
        sheet.cell(`H${22 + pointSkeep}`).value(point.balance)
        sheet.cell(`I${22 + pointSkeep}`).value(point.thermometer)

        for (let i = 0; i < point.calibrations.l1.length; i++) {
          sheet.cell(`C${25 + pointSkeep + i}`).value(point.calibrations.l1[i])
          sheet.cell(`D${25 + pointSkeep + i}`).value(point.calibrations.l2[i])
          sheet.cell(`E${25 + pointSkeep + i}`).value(point.calibrations.l3[i])
          sheet.cell(`F${25 + pointSkeep + i}`).value(point.calibrations.l4[i])
        }

        sheet
          .cell(`H${26 + pointSkeep}`)
          .value(
            environmental_conditions.points[indexPoint].temperature.initial,
          )
        sheet
          .cell(`I${26 + pointSkeep}`)
          .value(
            environmental_conditions.points[indexPoint].temperature.initial,
          )

        sheet
          .cell(`H${27 + pointSkeep}`)
          .value(environmental_conditions.points[indexPoint].humidity.initial)
        sheet
          .cell(`I${27 + pointSkeep}`)
          .value(environmental_conditions.points[indexPoint].humidity.final)

        sheet
          .cell(`H${28 + pointSkeep}`)
          .value(environmental_conditions.points[indexPoint].presion.initial)

        sheet
          .cell(`I${28 + pointSkeep}`)
          .value(environmental_conditions.points[indexPoint].presion.final)

        sheet.cell(`M${15 + pointSkeep}`).value(point.code)
        sheet.cell(`M${16 + pointSkeep}`).value(point.accuracy_class)

        indexPoint++
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
      const method = await this.NI_MCIT_M_01Repository.findOne({
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
      const method = await this.NI_MCIT_M_01Repository.findOne({
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

      const sheet = workbook.sheet('DA Individual (g-mg)')

      let items = []
      let serieCode = []
      let nominal_value = []
      let nominal_units = []
      let conventional_value = []
      let conventional_units = []
      let conventional_indication = []
      let conventional_value_2 = []
      let conventional_units_2 = []
      let uncertainty_value = []
      let uncertainty_units = []

      for (let i = 0; i < calibration_results.results.length; i++) {
        const itemValue = sheet.cell(`D${29 + i}`).value()
        items.push(itemValue)

        const serieCodeValue = sheet.cell(`E${29 + i}`).value()
        serieCode.push(serieCodeValue)

        const nominalValue = sheet.cell(`G${29 + i}`).value()
        const nominalUnit = sheet.cell(`H${29 + i}`).value()

        nominal_value.push(nominalValue)
        nominal_units.push(nominalUnit)

        const conventionalValue = sheet.cell(`I${29 + i}`).value()
        const conventionalUnit = sheet.cell(`K${29 + i}`).value()
        const conventionalIndicationValue = sheet.cell(`M${29 + i}`).value()
        const conventional_value_2Value = sheet.cell(`N${29 + i}`).value()
        const conventional_units_2Value = sheet.cell(`Q${29 + i}`).value()

        conventional_value.push(conventionalValue)
        conventional_units.push(conventionalUnit)
        conventional_indication.push(conventionalIndicationValue)
        conventional_value_2.push(conventional_value_2Value)
        conventional_units_2.push(conventional_units_2Value)

        const uncertaintyValue = sheet.cell(`S${29 + i}`).value()
        const uncertaintyUnit = sheet.cell(`U${29 + i}`).value()

        uncertainty_value.push(
          this.methodService.getSignificantFigure(uncertaintyValue),
        )
        uncertainty_units.push(uncertaintyUnit)
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = workbook.sheet("CMC's")

      for (let i = 0; i < calibration_results.results.length; i++) {
        const cmcPointValue = sheetCMC.cell(`I${19 + i}`).value()
        cmcPoint.push(
          typeof cmcPointValue === 'number'
            ? Number(cmcPointValue.toFixed(2))
            : cmcPointValue,
        )

        const cmcPrefValue = sheetCMC.cell(`J${19 + i}`).value()
        cmcPref.push(
          typeof cmcPrefValue === 'number'
            ? Number(cmcPrefValue.toFixed(5))
            : cmcPrefValue,
        )

        const uncertaintyCMCValue = sheetCMC.cell(`K${19 + i}`).value()
        uncertaintyCMC.push(
          typeof uncertaintyCMCValue === 'number'
            ? Number(uncertaintyCMCValue.toFixed(5))
            : uncertaintyCMCValue,
        )

        const cmcValue = sheetCMC.cell(`L${19 + i}`).value()
        cmc.push(
          typeof cmcValue === 'number' ? Number(cmcValue.toFixed(5)) : cmcValue,
        )

        const mincmcValue = sheetCMC.cell(`M${19 + i}`).value()
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
        items,
        serieCode,
        nominal_value,
        nominal_units,
        conventional_value,
        conventional_units,
        conventional_indication,
        conventional_value_2,
        conventional_units_2,
        uncertainty_value: this.methodService.formatUncertainty(
          this.formatUncertaintyWithCMC(uncertainty_value, CMC),
        ),
        uncertainty_units,
      }

      const masas = await this.patternsService.findByCodeAndMethod(
        'NI-MCPM-JM-03',
        'NI-MCIT-V-01',
      )

      return handleOK({
        calibration_results: calibration_results_certificate,
        masas: masas.data,
        optionsCMCOnCertificate: method.optionsCMCOnCertificate,
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
          device: method.equipment_information.calibration_object || '---',
          maximum_capacity: `${formatSameNumberCertification(method.equipment_information.maximum_capacity)} ${conventional_units[0]}`,
          maker: method.equipment_information.maker || '---',
          model: method.equipment_information.model || 'N/A',
          serial_number: 'N/A',
          code: method.equipment_information.code || 'N/A',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(Number(sheet.cell('E62').value()))} °C ± ${formatSameNumberCertification(Number(sheet.cell('G62').value()))} °C`,
          humidity: `Humedad Relativa: ${formatNumberCertification(Number(sheet.cell('E63').value()))} % ± ${formatSameNumberCertification(Number(sheet.cell('G63').value()))} % RH`,
          presion: `Presión: ${formatSameNumberCertification(Number(sheet.cell('R62').value()))} hPa ± ${formatSameNumberCertification(Number(sheet.cell('U62').value()))} hPa`,
        },
        creditable: description_pattern.creditable,
        client_email: activity.quote_request.client.email,
        observations: `
${method.description_pattern.observation}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
El error corresponde al valor de la indicación del equipo menos el valor convencional de la masa de referencia.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.`,
      })
    } catch (error) {
      console.error({ error })
      return handleInternalServerError(error.message)
    }
  }

  formatUncertaintyWithCMC(uncertainty: any, cmc: any) {
    const uncertaintyWithCMC = uncertainty.map(
      (uncertaintyValue: number, index: number) => {
        if (typeof uncertaintyValue !== 'number') return uncertaintyValue

        if (Number(uncertaintyValue) < Number(cmc.mincmc[index])) {
          return this.methodService.getSignificantFigure(cmc.cmc[index])
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
      const method = await this.NI_MCIT_M_01Repository.findOne({
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
        dataCertificate.data.calibration_results.items.map((item, index) => ({
          items: item,
          serieCode: dataCertificate.data.calibration_results.serieCode[index],
          nominal_value:
            dataCertificate.data.calibration_results.nominal_value[index],
          nominal_units:
            dataCertificate.data.calibration_results.nominal_units[index],
          conventional_value:
            dataCertificate.data.calibration_results.conventional_value[index],
          conventional_units:
            dataCertificate.data.calibration_results.conventional_units[index],
          conventional_indication:
            dataCertificate.data.calibration_results.conventional_indication[
              index
            ],
          conventional_value_2:
            dataCertificate.data.calibration_results.conventional_value_2[
              index
            ],
          conventional_units_2:
            dataCertificate.data.calibration_results.conventional_units_2[
              index
            ],
          uncertainty_value:
            dataCertificate.data.calibration_results.uncertainty_value[index],
          uncertainty_units:
            dataCertificate.data.calibration_results.uncertainty_units[index],
        }))
      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/m-01.hbs',
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
