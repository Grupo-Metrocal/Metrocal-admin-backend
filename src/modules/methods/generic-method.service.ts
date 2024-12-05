import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { GENERIC_METHOD } from './entities/GENERIC METHOD/GENERIC_METHOD.entity'
import { EquipmentInformationGENERIC_METHODDto } from './dto/GENERIC METHOD/equipment_information.dto'
import { EnvironmentalConditionsGENERIC_METHODDto } from './dto/GENERIC METHOD/enviromental_condition.dto'
import { Result_MeditionGENERIC_METHODDto } from './dto/GENERIC METHOD/result_medition.dto'
import { EnvironmentalConditionsGENERIC_METHOD } from './entities/GENERIC METHOD/steps/enviromental_condition.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationGENERIC_METHOD } from './entities/GENERIC METHOD/steps/equipment_information.entity'
import { ComputerDataGENERIC_METHOD } from './entities/GENERIC METHOD/steps/computer_data.entity'
import { ComputerDataGENERIC_METHODDto } from './dto/GENERIC METHOD/computer_data.dto'
import { ResultMeditionGENERIC_METHOD } from './entities/GENERIC METHOD/steps/result_medition.entity'
import { formatDate } from 'src/utils/formatDate'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'

import * as path from 'path'
import * as fs from 'fs'
import * as XlsxPopulate from 'xlsx-populate'
import { PatternsService } from '../patterns/patterns.service'
import { CertificateService } from '../certificate/certificate.service'
import { exec } from 'child_process'
import { ActivitiesService } from '../activities/activities.service'
import { formatCertCode, formatQuoteCode } from 'src/utils/generateCertCode'
import { DescriptionPatternGENERIC_METHOD } from './entities/GENERIC METHOD/steps/description_pattern.entity'
import {
  convertToValidNumber,
  formatNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { DescriptionPatternGenericMethodDto } from './dto/GENERIC METHOD/description_pattern.dto'
import { QuotesService } from '../quotes/quotes.service'
import { EquipmentQuoteRequest } from '../quotes/entities/equipment-quote-request.entity'

@Injectable()
export class GENERIC_METHODService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(GENERIC_METHOD)
    private readonly GENERIC_METHODRepository: Repository<GENERIC_METHOD>,

    @InjectRepository(EquipmentInformationGENERIC_METHOD)
    private readonly equipmentInformationGENERIC_METHODRepository: Repository<EquipmentInformationGENERIC_METHOD>,

    @InjectRepository(EnvironmentalConditionsGENERIC_METHOD)
    private readonly environmentalConditionsGENERIC_METHODRepository: Repository<EnvironmentalConditionsGENERIC_METHOD>,

    @InjectRepository(ComputerDataGENERIC_METHOD)
    private readonly computerDataGENERIC_METHODRepository: Repository<ComputerDataGENERIC_METHOD>,

    @InjectRepository(ResultMeditionGENERIC_METHOD)
    private readonly resultMeditionGENERIC_METHODRepository: Repository<ResultMeditionGENERIC_METHOD>,

    @InjectRepository(DescriptionPatternGENERIC_METHOD)
    private readonly descriptionPatternGENERIC_METHODRepository: Repository<DescriptionPatternGENERIC_METHOD>,

    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService,

    @Inject(forwardRef(() => QuotesService))
    private quoeteRequestService: QuotesService,

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
  ) {}

  async create() {
    try {
      const newGENERIC_METHOD = this.GENERIC_METHODRepository.create()
      const method = await this.GENERIC_METHODRepository.save(newGENERIC_METHOD)
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformationCreate(
    equipement: EquipmentInformationGENERIC_METHODDto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })
      if (!method) {
        return handleInternalServerError('Method not found')
      }
      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationGENERIC_METHODRepository.merge(
          existingEquipment,
          equipement,
        )
      } else {
        const newEquipment =
          this.equipmentInformationGENERIC_METHODRepository.create(equipement)
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
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditionsCreate(
    environmentalConditions: EnvironmentalConditionsGENERIC_METHODDto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions'],
      })
      if (!method) {
        return handleInternalServerError('Method not found')
      }
      const existingEnvironmentalConditions = method.environmental_conditions

      if (existingEnvironmentalConditions) {
        this.environmentalConditionsGENERIC_METHODRepository.merge(
          existingEnvironmentalConditions,
          environmentalConditions,
        )
      } else {
        const newEnvironmentalConditions =
          this.environmentalConditionsGENERIC_METHODRepository.create(
            environmentalConditions,
          )
        method.environmental_conditions = newEnvironmentalConditions
      }

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
      return handleOK(method.environmental_conditions)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async computerDataCreate(
    computerData: ComputerDataGENERIC_METHODDto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['computer_data'],
      })
      if (!method) {
        return handleInternalServerError('Method not found')
      }
      const existingComputerData = method.computer_data

      if (existingComputerData) {
        this.computerDataGENERIC_METHODRepository.merge(
          existingComputerData,
          computerData,
        )
      } else {
        const newComputerData =
          this.computerDataGENERIC_METHODRepository.create(computerData)
        method.computer_data = newComputerData
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.computer_data)
        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }
        await manager.save(method)
      })
      return handleOK(method.computer_data)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async descriptionPattern(
    equipmentId,
    descriptionPattern: DescriptionPatternGenericMethodDto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternGENERIC_METHODRepository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternGENERIC_METHODRepository.create(
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
        this.generateCertificateCodeToMethod(method.id, equipmentId),
        this.activitiesService.updateActivityProgress(activityId),
        this.methodService.isResolvedAllServices(activityId),
      ])

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.GENERIC_METHODRepository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.GENERIC_METHODRepository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async resultMeditionCreate(
    resultMedition: Result_MeditionGENERIC_METHODDto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['result_medition'],
      })
      if (!method) {
        return handleInternalServerError('Method not found')
      }
      const existingResultMedition = method.result_medition

      if (existingResultMedition) {
        this.resultMeditionGENERIC_METHODRepository.merge(
          existingResultMedition,
          resultMedition,
        )
      } else {
        const newResultMedition =
          this.resultMeditionGENERIC_METHODRepository.create(resultMedition)
        method.result_medition = newResultMedition
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.result_medition)
        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }
        await manager.save(method)
      })

      return handleOK(method.result_medition)
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
    const method = await this.GENERIC_METHODRepository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'computer_data',
        'result_medition',
        'description_pattern',
      ],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const {
      equipment_information,
      environmental_conditions,
      computer_data,
      result_medition,
    } = method

    if (
      !equipment_information ||
      !environmental_conditions ||
      !computer_data ||
      !result_medition
    ) {
      return handleInternalServerError(
        'Faltan datos para generar el certificado',
      )
    }

    try {
      let filePath = path.join(
        __dirname,
        '../mail/templates/excels/method-generic.xlsx',
      )

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const generalSheet = workbook.sheet('Generales')
      const inputSheet = workbook.sheet('Entrada de Datos')

      workbook
        .sheet('NI-R01-MCIT-T-01')
        .cell('F12')
        .value(method.computer_data.unit_of_measurement)
      inputSheet.cell('C2').value(method.computer_data.scale_division)

      generalSheet
        .cell('C30')
        .value(method.environmental_conditions.temperature)
      generalSheet.cell('C31').value(method.environmental_conditions.hr)
      inputSheet.cell('J4').value(method.environmental_conditions.pattern)

      let initialRow = 9
      for (const value of method.result_medition.meditions) {
        initialRow++

        inputSheet
          .cell(`A${initialRow}`)
          .value(Number(value?.medition[0]?.pattern) || 0)
        inputSheet
          .cell(`B${initialRow}`)
          .value(Number(value?.medition[0]?.equipment) || 0)
        inputSheet
          .cell(`C${initialRow}`)
          .value(Number(value?.medition[1]?.pattern) || 0)
        inputSheet
          .cell(`D${initialRow}`)
          .value(Number(value?.medition[1]?.equipment) || 0)
        inputSheet
          .cell(`E${initialRow}`)
          .value(Number(value?.medition[2]?.pattern) || 0)
        inputSheet
          .cell(`F${initialRow}`)
          .value(Number(value?.medition[2]?.equipment) || 0)
      }

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return this.getCertificateResult(method.id, activityID)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'computer_data',
          'result_medition',
          'description_pattern',
        ],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const {
        equipment_information,
        environmental_conditions,
        computer_data,
        result_medition,
      } = method

      if (
        !equipment_information ||
        !environmental_conditions ||
        !computer_data ||
        !result_medition
      ) {
        return handleInternalServerError(
          'Faltan datos para generar el certificado',
        )
      }

      const dataActivity =
        await this.activitiesService.getActivitiesByID(activityID)

      if (!dataActivity) {
        return handleInternalServerError('La actividad no existe')
      }

      const activity = dataActivity.data
      const reopnedWorkbook = await XlsxPopulate.fromFileAsync(
        method.certificate_url,
      )
      const sheet = reopnedWorkbook.sheet('Fuera del Alcance')

      let patternIndication = []
      let instrumentIndication = []
      let correction = []
      let uncertainty = []

      for (let i = 0; i <= method.result_medition.meditions.length; i++) {
        const patternIndicationVal = sheet.cell(`D${28 + i}`).value()
        patternIndication.push(
          formatNumberCertification(
            patternIndicationVal,
            countDecimals(method.computer_data.scale_division),
          ),
        )

        const instrumentIndicationVal = sheet.cell(`F${28 + i}`).value()
        instrumentIndication.push(
          formatNumberCertification(
            instrumentIndicationVal,
            countDecimals(method.computer_data.scale_division),
          ),
        )
        // const correctionVal = sheet.cell(`L${28 + i}`).value()

        correction.push(
          i === 0
            ? patternIndication[i]
            : formatNumberCertification(
                convertToValidNumber(patternIndication[i]) -
                  convertToValidNumber(instrumentIndication[i]),
                countDecimals(method.computer_data.scale_division),
              ),
        )

        const uncertaintyValue = sheet.cell(`R${28 + i}`).value()
        uncertainty.push(
          typeof uncertaintyValue === 'number'
            ? this.methodService.getSignificantFigure(
                Number(uncertaintyValue.toFixed(7)),
              )
            : uncertaintyValue,
        )
      }

      const calibration_results = {
        result: {
          patternIndication,
          instrumentIndication,
          correction,
          uncertainty: this.methodService.formatUncertainty(uncertainty),
        },
      }

      const certificate = {
        pattern: 'GENERIC_METHOD',
        email: activity.quote_request.client.email,
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
          object_calibrated: method.equipment_information.device || '---',
          maker: method.equipment_information.maker || '---',
          serial_number: method.equipment_information.serial_number || '---',
          model: method.equipment_information.model || '---',
          measurement_range: `${method.equipment_information.range_min} ${method.computer_data.unit_of_measurement} a ${method.equipment_information.range_max} ${method.computer_data.unit_of_measurement}`,
          scale_interval: method.equipment_information.scale_interval || '---',
          code: method.equipment_information.code || '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        calibration_results,
        creditable: method.description_pattern.creditable,
        description_pattern: await this.getPatternsTableToCertificate(method),
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(
            sheet.cell('E57').value(),
          )} °C ± ${formatNumberCertification(sheet.cell('G57').value())} °C`,
          humidity: `Humedad relativa: ${formatNumberCertification(sheet.cell('E58').value())} % ± ${formatNumberCertification(sheet.cell('G58').value())} %`,
        },
        observations: `
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
La corrección corresponde al valor del patrón menos las indicación del equipo.
La indicación del patrón de referencia y del equipo corresponde al promedio de 3 mediciones.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.
         `,
      }
      return handleOK(certificate)
    } catch (error) {
      console.error({ error })
      return handleInternalServerError(error.message)
    }
  }

  async getPatternsTableToCertificate(method: GENERIC_METHOD) {
    const description_pattern = []

    const environment_method_used =
      await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.pattern,
        'all',
      )
    if (environment_method_used.success) {
      description_pattern.push(environment_method_used.data)
    }

    return description_pattern
  }

  async autoSaveExcel(filePath: string) {
    return new Promise((resolve, reject) => {
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

  async generatePDFCertificate(
    activityID: number,
    methodID: number,
    generatePDF = false,
  ) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'computer_data',
          'result_medition',
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

      dataCertificate.data.calibration_results_certificate.result =
        dataCertificate.data.calibration_results_certificate.result.patternIndication.map(
          (value, index) => ({
            patternIndication: value,
            instrumentIndication:
              dataCertificate.data.calibration_results_certificate.result
                .instrumentIndication[index],
            correction:
              dataCertificate.data.calibration_results_certificate.result
                .correction[index],
            uncertainty:
              dataCertificate.data.calibration_results_certificate.result
                .uncertainty[index],
          }),
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/generic-method.hbs',
        dataCertificate.data,
      )

      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      return handleOK({
        pdf: PDF,
        client_email: dataCertificate.data.email,
        fileName: `Certificado-${dataCertificate.data.equipment_information.object_calibrated}-${dataCertificate.data.equipment_information.certification_code}.pdf`,
        clientName: dataCertificate.data.equipment_information.applicant,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateCertificateCodeToMethod(methodID: number, equipmentId: number) {
    try {
      const resEquipment =
        await this.quoeteRequestService.getEquipmentById(equipmentId)

      const { data: equipment } = resEquipment as {
        data: EquipmentQuoteRequest
      }

      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodID },
      })

      const lastMethod = await this.GENERIC_METHODRepository.createQueryBuilder(
        'GENERIC_METHOD',
      )
        .orderBy('GENERIC_METHOD.last_record_index', 'DESC')
        .getOne()

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      // if (method.certificate_code) {
      //   return handleOK('El método ya tiene un código de certificado')
      // }

      if (
        !equipment.use_alternative_certificate_method ||
        equipment.use_alternative_certificate_method === 'GENERIC_METHOD' ||
        equipment.use_alternative_certificate_method === '(N/A)'
      ) {
        await this.dataSource.transaction(async (manager) => {
          method.record_index =
            !lastMethod ||
            lastMethod.created_at.getFullYear() !==
              method.created_at.getFullYear()
              ? 1
              : lastMethod.last_record_index + 1

          await this.methodService.updateLastRecordIndex('GENERIC_METHOD')

          await manager.save(method)
        })

        const certificate = await this.certificateService.create(
          'FA',
          method.record_index,
        )

        method.certificate_code = certificate.data.code
        method.certificate_id = certificate.data.id

        await this.GENERIC_METHODRepository.save(method)
      } else {
        await this.methodService.updateRecordByAlternativeIndex(
          equipment.use_alternative_certificate_method
            .split(' ')[0]
            .replaceAll('-', '_'),
          'GENERIC_METHOD',
          method.id,
        )
      }

      return handleOK('certificate')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMehotdById(methodId: number) {
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'computer_data',
          'result_medition',
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
