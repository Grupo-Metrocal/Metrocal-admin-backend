import { Inject, Injectable, Res, forwardRef } from '@nestjs/common'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, Column } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02instrument_zero_check.entity'
import { AccuracyTestNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02accuracy_test.dto'
import { AccuracyTestNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/d02accuracy_test.entity'
import { executeTransaction } from 'src/utils/executeTransaction'
import { ActivitiesService } from '../activities/activities.service'
import { Activity } from '../activities/entities/activities.entity'
import { PatternsService } from '../patterns/patterns.service'
import * as XlsxPopulate from 'xlsx-populate'
import { PdfService } from '../mail/pdf.service'
import * as fs from 'fs'
import * as path from 'path'

import {
  getPosition,
  getPositionNominal,
} from './dto/NI_MCIT_D_02/d02PositionBPDto'
import { exec } from 'child_process'
import { generateServiceCodeToMethod } from 'src/utils/codeGenerator'
import { CertificateService } from '../certificate/certificate.service'
import { formatDate } from 'src/utils/formatDate'
import { MailService } from '../mail/mail.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'

@Injectable()
export class NI_MCIT_D_02Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_D_02)
    private readonly NI_MCIT_D_02Repository: Repository<NI_MCIT_D_02>,
    @InjectRepository(EquipmentInformationNI_MCIT_D_02)
    private readonly EquipmentInformationRepository: Repository<EquipmentInformationNI_MCIT_D_02>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_D_02)
    private readonly EnvironmentalConditionsRepository: Repository<EnvironmentalConditionsNI_MCIT_D_02>,
    @InjectRepository(DescriptionPatternNI_MCIT_D_02)
    private readonly DescriptionPatternRepository: Repository<DescriptionPatternNI_MCIT_D_02>,
    @InjectRepository(PreInstallationCommentNI_MCIT_D_02)
    private readonly PreInstallationCommentRepository: Repository<PreInstallationCommentNI_MCIT_D_02>,
    @InjectRepository(InstrumentZeroCheckNI_MCIT_D_02)
    private readonly InstrumentZeroCheckRepository: Repository<InstrumentZeroCheckNI_MCIT_D_02>,
    @InjectRepository(AccuracyTestNI_MCIT_D_02)
    private readonly AccuracyTestRepository: Repository<AccuracyTestNI_MCIT_D_02>,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,

    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,
    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_D_02 = this.NI_MCIT_D_02Repository.create()
      const method = await this.NI_MCIT_D_02Repository.save(newNI_MCIT_D_02)
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(certificatonDetails: CertificationDetailsDto, methodId: number) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_address
    method.applicant_address = certificatonDetails.applicant_name

    try {
      await this.NI_MCIT_D_02Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.EquipmentInformationRepository.merge(existingEquipment, equipment)
      } else {
        equipment.date = new Date().toISOString()
        const newEquipment =
          this.EquipmentInformationRepository.create(equipment)
        method.equipment_information = newEquipment
      }
      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.equipment_information)
          await manager.save(method)
        })
        return handleOK(method.equipment_information)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }
      const existingEnvironmentalConditions = method.environmental_conditions
      if (existingEnvironmentalConditions) {
        this.EnvironmentalConditionsRepository.merge(
          existingEnvironmentalConditions,
          environmentalConditions,
        )
      } else {
        const newEnvironmentalConditions =
          this.EnvironmentalConditionsRepository.create(environmentalConditions)
        method.environmental_conditions = newEnvironmentalConditions
      }

      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.environmental_conditions)
          await manager.save(method)
        })
        return handleOK(method.environmental_conditions)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.DescriptionPatternRepository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.DescriptionPatternRepository.create(descriptionPattern)
        method.description_pattern = newDescriptionPattern
      }

      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.description_pattern)
          await manager.save(method)
        })
        return handleOK(method.description_pattern)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async preInstallationComment(
    preInstallationComment: PreInstallationCommentNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['pre_installation_comment'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingPreInstallationComment = method.pre_installation_comment

      if (existingPreInstallationComment) {
        this.PreInstallationCommentRepository.merge(
          existingPreInstallationComment,
          preInstallationComment,
        )
      } else {
        const newPreInstallationComment =
          this.PreInstallationCommentRepository.create(preInstallationComment)
        method.pre_installation_comment = newPreInstallationComment
      }

      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.pre_installation_comment)
          await manager.save(method)
        })
        return handleOK(method.pre_installation_comment)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async instrumentZeroCheck(
    instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_02Dto,
    methodId: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['instrument_zero_check'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingInstrumentZeroCheck = method.instrument_zero_check

      if (existingInstrumentZeroCheck) {
        this.InstrumentZeroCheckRepository.merge(
          existingInstrumentZeroCheck,
          instrumentZeroCheck,
        )
      } else {
        const newInstrumentZeroCheck =
          this.InstrumentZeroCheckRepository.create(instrumentZeroCheck)
        method.instrument_zero_check = newInstrumentZeroCheck
      }

      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.instrument_zero_check)
          await manager.save(method)
        })
        return handleOK(method.instrument_zero_check)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async accuracyTest(
    accuracyTest: AccuracyTestNI_MCIT_D_02Dto,
    methodId: number,
    activityID: number,
  ) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['accuracy_test'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingAccuracyTest = method.accuracy_test

      if (existingAccuracyTest) {
        this.AccuracyTestRepository.merge(existingAccuracyTest, accuracyTest)
      } else {
        const newAccuracyTest = this.AccuracyTestRepository.create(accuracyTest)
        method.accuracy_test = newAccuracyTest
      }

      try {
        this.dataSource.transaction(async (manager) => {
          await manager.save(method.accuracy_test)
          method.status = 'done'

          await manager.save(method)
        })
        await this.generateCertificateCodeToMethod(method.id)
        await this.activitiesService.updateActivityProgress(activityID)

        return handleOK(method.accuracy_test)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //excel
  async generateCertificateData({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'description_pattern',
        'pre_installation_comment',
        'instrument_zero_check',
        'accuracy_test',
      ],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const dataActivity =
      await this.activitiesService.getActivityById(activityID)

    if (!dataActivity) {
      return handleInternalServerError('La actividad no existe')
    }

    const { data: activity } = dataActivity as { data: Activity }

    // const equipment = activity.quote_request.equipment_quote_request.filter(
    //   (item) => item.method_id == method.id,
    // )

    const dataClient = activity.quote_request.client

    // if (equipment.length === 0) {
    //   return handleInternalServerError('El equipo no existe')
    // }

    //ni_mcit_d_02
    const filePath = path.join(
      __dirname,
      `../mail/templates/excels/ni_mcit_d_02.xlsx`,
    )

    try {
      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      if (!workbook) {
        return handleInternalServerError('El archivo no existe')
      }

      const sheetNI_R01_MCIT_D_02 = workbook.sheet('NI-R01-MCIT-D-02')
      const sheetResultados = workbook.sheet('Resultados')
      const sheetPatrones = workbook.sheet('Patrones')

      //Datos del cliente
      sheetNI_R01_MCIT_D_02.cell('B7').value(dataClient.company_name)

      const equipmentInfo = method.equipment_information
      // Asignar la fecha formateada a la celda E8
      sheetNI_R01_MCIT_D_02.cell('H7').value(equipmentInfo.date)
      //Informacion de equipos
      sheetNI_R01_MCIT_D_02.cell('C11').value(equipmentInfo.device)
      sheetNI_R01_MCIT_D_02.cell('C12').value(equipmentInfo.maker)
      sheetNI_R01_MCIT_D_02.cell('C13').value(equipmentInfo.serial_number)
      sheetNI_R01_MCIT_D_02.cell('C14').value(equipmentInfo.measurement_range)
      sheetNI_R01_MCIT_D_02.cell('C15').value(equipmentInfo.resolution)
      sheetNI_R01_MCIT_D_02.cell('F12').value(equipmentInfo.model)
      sheetNI_R01_MCIT_D_02.cell('F13').value(equipmentInfo.code)
      sheetNI_R01_MCIT_D_02.cell('F14').value(equipmentInfo.length)

      //Condiciones ambientales
      const environmentalConditions = method.environmental_conditions
      sheetNI_R01_MCIT_D_02
        .cell('D19')
        .value(environmentalConditions.equipment_used)
      sheetNI_R01_MCIT_D_02
        .cell('F19')
        .value(environmentalConditions.time.minute)
      sheetNI_R01_MCIT_D_02
        .cell('J19')
        .value(method.calibration_location)
      sheetNI_R01_MCIT_D_02
        .cell('B19')
        .value(environmentalConditions.cycles.ta.initial)
      sheetNI_R01_MCIT_D_02
        .cell('B20')
        .value(environmentalConditions.cycles.ta.end)
      sheetNI_R01_MCIT_D_02
        .cell('C19')
        .value(environmentalConditions.cycles.hr.initial)
      sheetNI_R01_MCIT_D_02
        .cell('C20')
        .value(environmentalConditions.cycles.hr.end)

      //Observaciones pre-instalacion
      const preInstallationComment = method.pre_installation_comment
      sheetNI_R01_MCIT_D_02.cell('A26').value(preInstallationComment.comment)

      //Verificacion de cero del instrumento
      const instrumentZeroCheck = method.instrument_zero_check
      sheetNI_R01_MCIT_D_02.cell('A32').value(instrumentZeroCheck.nominal_value)
      sheetNI_R01_MCIT_D_02
        .cell('B32')
        .value(instrumentZeroCheck.x1 == 0.0 ? 0 : instrumentZeroCheck.x1)
      sheetNI_R01_MCIT_D_02
        .cell('C32')
        .value(instrumentZeroCheck.x2 == 0.0 ? 0 : instrumentZeroCheck.x2)
      sheetNI_R01_MCIT_D_02
        .cell('D32')
        .value(instrumentZeroCheck.x3 == 0.0 ? 0 : instrumentZeroCheck.x3)
      sheetNI_R01_MCIT_D_02
        .cell('E32')
        .value(instrumentZeroCheck.x4 == 0.0 ? 0 : instrumentZeroCheck.x4)
      sheetNI_R01_MCIT_D_02
        .cell('F32')
        .value(instrumentZeroCheck.x5 == 0.0 ? 0 : instrumentZeroCheck.x5)
      sheetNI_R01_MCIT_D_02
        .cell('G32')
        .value(instrumentZeroCheck.x6 == 0.0 ? 0 : instrumentZeroCheck.x6)
      sheetNI_R01_MCIT_D_02
        .cell('H32')
        .value(instrumentZeroCheck.x7 == 0.0 ? 0 : instrumentZeroCheck.x7)
      sheetNI_R01_MCIT_D_02
        .cell('I32')
        .value(instrumentZeroCheck.x8 == 0.0 ? 0 : instrumentZeroCheck.x8)
      sheetNI_R01_MCIT_D_02
        .cell('J32')
        .value(instrumentZeroCheck.x9 == 0.0 ? 0 : instrumentZeroCheck.x9)
      sheetNI_R01_MCIT_D_02
        .cell('K32')
        .value(instrumentZeroCheck.x10 == 0.0 ? 0 : instrumentZeroCheck.x10)

      //Prueba de exactitud
      let fila = 37
      let fila_position = 1
      const column_verificaction = [
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
      ]
      method.accuracy_test.measureD02.forEach((item) => {
        Object.entries(item.varification_lengths).forEach(
          ([key, value], index) => {
            const columna = column_verificaction[index]
            sheetNI_R01_MCIT_D_02.cell(`${columna}${fila}`).value(value)
          },
        )

        if (fila_position == 1) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 6
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 2) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 12
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPositionNominal(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 3) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 18
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 4) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 24
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 5) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 30
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPositionNominal(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 6) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 36
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 7) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 42
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPositionNominal(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 8) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 48
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 9) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 54
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPositionNominal(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        if (fila_position == 10) {
          const starinColumns = 'L'
          let currentColumn = starinColumns
          let fila_l = 60
          Object.entries(item.nominal_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetPatrones.cell(`${currentColumn}${fila_l}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        fila++
        fila_position++
      })

      //tipo patrones de medicion
      //tipo de patrone de medicion
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-02') {
        sheetResultados.cell('Z66').value(1)
      }
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-05') {
        sheetResultados.cell('Z66').value(2)
      }
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-06') {
        sheetResultados.cell('Z66').value(3)
      }

      //Para generarla certificacion
      const patronsUtilizados = []
      method.description_pattern.descriptionPattern.forEach(async (x) => {
        let dato = x
        let patterns = await this.patternsService.findByCodeAndMethod(
          dato,
          'NI-MCIT-D-02',
        )
        patronsUtilizados.push(patterns.data)
      })
      let patterns = await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.equipment_used,
        'NI-MCIT-D-02',
      )

      patronsUtilizados.push(patterns.data)

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return this.getCertificateResult(method.id, activityID)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'accuracy_test',
        ],
      })

      const dataActivity =
        await this.activitiesService.getActivityById(activityID)

      const { data: activity } = dataActivity as { data: Activity }

      const dataClient = activity.quote_request.client
      const dataQuote = activity.quote_request

      const workbook2 = await XlsxPopulate.fromFileAsync(method.certificate_url)
      const sheetDA3 = workbook2.sheet('DA (mm)')
      const sheetFA4 = workbook2.sheet('FA (mm)')

      //recoleccion de daotos de DA (mm)
      const dataResultCalibrationDAmm = []
      //temperatura
      let temperatura1DA = sheetDA3.cell('G45').value()
      let temperatura2DA = sheetDA3.cell('J45').value()
      let humedad1DA = sheetDA3.cell('G46').value()
      let humedad2DA = sheetDA3.cell('J46').value()
      if (method.pre_installation_comment.accredited) {
        //Prueba de exactitud
        let filaDAmm = 31
        let filaStopDAmm = 42
        const columna_resultados_calibacion = ['C', 'F', 'K', 'Q', 'W']
        for (let i = filaDAmm; i <= filaStopDAmm; i++) {
          let data = {}
          columna_resultados_calibacion.forEach((column) => {
            let value = sheetDA3.cell(`${column}${i}`).value()
            if (!isNaN(value)) {
              if (column == 'C') {
                value = parseFloat(value).toFixed(1)
              }
              if (column == 'F') {
                value = parseFloat(value).toFixed(5)
              }
              if (column == 'K') {
                value = parseFloat(value).toFixed(3)
              }
              if (column == 'Q') {
                value = parseFloat(value).toFixed(1)
              }
              if (column == 'W') {
                value = parseFloat(value).toFixed(1)
              }
            }
            data[column] = value
          })
          dataResultCalibrationDAmm.push(data)
        }
      }

      const dataResultCalibrationFAmm = []
      let temperatura1FA = sheetDA3.cell('G45').value()
      let temperatura2FA = sheetDA3.cell('J45').value()
      let humedad1FA = sheetDA3.cell('G46').value()
      let humedad2FA = sheetDA3.cell('J46').value()
      if (!method.pre_installation_comment.accredited) {
        //Prueba de exactitud
        let filaFAmm = 30
        let filaStopFAmm = 36
        const columna_resultados_calibacion = ['C', 'F', 'K', 'Q', 'W']
        for (let i = filaFAmm; i <= filaStopFAmm; i++) {
          let data = {}
          columna_resultados_calibacion.forEach((column) => {
            let value = sheetFA4.cell(`${column}${i}`).value()
            if (!isNaN(value)) {
              if (column == 'C') {
                value = parseFloat(value).toFixed(1)
              }
              if (column == 'F') {
                value = parseFloat(value).toFixed(5)
              }
              if (column == 'K') {
                value = parseFloat(value).toFixed(3)
              }
              if (column == 'Q') {
                value = parseFloat(value).toFixed(1)
              }
              if (column == 'W') {
                value = parseFloat(value).toFixed(1)
              }
            }
            data[column] = value
          })
          dataResultCalibrationFAmm.push(data)
        }
      }

      const patronsUtilizados = []


      //Datos de la certificacion
      const serviceCode = generateServiceCodeToMethod(method.id)
      const dataNI_MCIT_D_02 = {
        client: {
          Empresa: dataClient.company_name,
          fechaCalibracion: formatDate(method.equipment_information.date),
          LugarCalibracion: dataClient.address,
          Codigo: dataQuote.no,
          fechaCertificado: formatDate(Date.now().toString()),
        },
        patronsUtilizados,
      }

      const methodAcredited = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodID },
      })

      let dataDA
      if (method.pre_installation_comment.accredited) {
        dataDA = {
          datosCabecera: {
            identificacionServicio: methodAcredited.certificate_code,
            codigoServicio: serviceCode,
            fechaCalibracion: formatDate(method.equipment_information.date),
            fechaEmision: formatDate(new Date().toString()),
            objetocalibracion: method.equipment_information.device || '---',
            marca: method.equipment_information.maker || '---',
            serie: method.equipment_information.serial_number || '---',
            modelo: method.equipment_information.model || '---',
            rango: method.equipment_information.measurement_range || '---',
            resolucion: method.equipment_information.resolution || '---',
            codigoIdentificacion: method.equipment_information.code,
            solicitante: method?.applicant_name || dataClient.company_name ,
            direccion: method?.applicant_address || dataClient.address,
            lugarCalibracion: method.calibration_location,
          },
          temperatura1DA,
          temperatura2DA,
          humedad1DA,
          humedad2DA,
          dataResultCalibrationDAmm,
          acreedited: method.pre_installation_comment.accredited,
        }
      } else {
        dataDA = {
          datosCabecera: {
            codigoServicio: serviceCode,
            fechaCalibracion: formatDate(method.equipment_information.date),
            fechaEmision: formatDate(new Date().toString()),
            objetocalibracion: method.equipment_information.device || '---',
            marca: method.equipment_information.maker || '---',
            serie: method.equipment_information.serial_number || '---',
            modelo: method.equipment_information.model || '---',
            rango: method.equipment_information.measurement_range || '---',
            resolucion: method.equipment_information.resolution || '---',
            codigoIdentificacion: method.equipment_information.code,
            solicitante: method?.applicant_name || dataClient.company_name ,
            direccion: method?.applicant_address || dataClient.address,
            lugarCalibracion: method.calibration_location,
          },
          temperatura1FA,
          temperatura2FA,
          humedad1FA,
          humedad2FA,
          dataResultCalibrationFAmm,
          acreedited: method.pre_installation_comment.accredited,
        }
      }

      const CertificateData = {
        dataNI_MCIT_D_02,
        dataDA,
        creditable: method.pre_installation_comment.accredited,
      }

      return handleOK(CertificateData)
    } catch (error) {
      return handleInternalServerError('Error al generar el archivo')
    }
  }

  async generatePDFCertificate(activityID: number, methodID: number) {
    try {
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'accuracy_test',
        ],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      let CertificateData: any

      if (!fs.existsSync(method.certificate_url)) {
        CertificateData = await this.generateCertificateData({
          activityID,
          methodID,
        })
      } else {
        CertificateData = await this.getCertificateResult(methodID, activityID)
      }

      let PDF: any

      if (method.pre_installation_comment.accredited) {
        PDF = await this.pdfService.generateCertificatePdf(
          '/certificates/NI_CMIT_D_02/certificadoD02_1.hbs',
          // method.pre_installation_comment.accredited,
          CertificateData.data,
        )
      } else {
        PDF = await this.pdfService.generateCertificatePdf(
          '/certificates/NI_CMIT_D_02/certificadoD02_2.hbs',
          // method.pre_installation_comment.accredited,
          CertificateData.data,
        )
      }

      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      return handleOK({
        pdf: PDF,
        client_email: CertificateData,
      })
    } catch (error) {
      return handleInternalServerError('Error al generar el PDF')
    }
  }

  async getNI_MCIT_D_02Certificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    try {
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'accuracy_test',
        ],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      let respuesta
      if (method) {
        respuesta = await this.generateCertificateData({
          activityID,
          methodID,
        })
      }

      if (respuesta.status === 500) {
        return handleInternalServerError('Error al generar el certificado')
      }

      if (respuesta.status === 200) {
        return handleOK('Certificado generado correctamente')
      }
    } catch (error) {
      return handleInternalServerError('Error al generar el certificado')
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
            reject(error) // Aquí rechazamos la promesa con el error
          } else if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`)
            reject(new Error(stderr))
          } else {
            console.log(`Salida estándar: ${stdout}`)
            resolve(stdout)
          }
        },
      )
    })
  }

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodID },
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      const certificate = await this.certificateService.create('D', methodID)

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_D_02Repository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMethodById(methodId: number) {
    try {
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'accuracy_test'
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
}
