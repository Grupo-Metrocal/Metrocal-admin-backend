import { Inject, Injectable, Res, forwardRef } from '@nestjs/common'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, Column } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/equipment_information.entity'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/instrument_zero_check.entity'
import { AccuracyTestNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02accuracy_test.dto'
import { AccuracyTestNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/accuracy_test.entity'
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
import { CertificateService } from '../certificate/certificate.service'
import { formatDate } from 'src/utils/formatDate'
import { MailService } from '../mail/mail.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'
import { MethodsService } from './methods.service'
import { formatCertCode } from 'src/utils/generateCertCode'

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

    @Inject(forwardRef(() => MethodsService))
    private readonly methodService: MethodsService,
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

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_02Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

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
    increase?: boolean,
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
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_02Dto,
    methodId: number,
    increase?: boolean,
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
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,
    methodId: number,
    increase?: boolean,
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
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.description_pattern)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

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
    increase?: boolean,
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
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.pre_installation_comment)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

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
    increase?: boolean,
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
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.instrument_zero_check)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

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
    increase?: boolean,
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
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.accuracy_test)
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
          this.activitiesService.updateActivityProgress(activityID),
          this.methodService.isResolvedAllServices(activityID),
        ])

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
      sheetNI_R01_MCIT_D_02.cell('C15').value(equipmentInfo.resolution)
      sheetNI_R01_MCIT_D_02.cell('F11').value(equipmentInfo.unit)
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
      sheetNI_R01_MCIT_D_02.cell('J19').value(method.calibration_location)
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

      if (!dataActivity.success) {
        return handleInternalServerError('La actividad no existe')
      }

      const activity = dataActivity.data

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      const sheet = workbook.sheet('DA (mm)')

      const nominal_value = []
      const current_length = []
      const current_reading = []
      const deviation = []
      const uncertainty = []

      for (let i = 0; i <= method.accuracy_test.measureD02.length; i++) {
        const nominal_valueValue = sheet.cell(`C${30 + i}`).value()
        nominal_value.push(
          formatNumberCertification(
            nominal_valueValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const current_lengthValue = sheet.cell(`F${30 + i}`).value()
        current_length.push(
          formatNumberCertification(
            current_lengthValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const current_readingValue = sheet.cell(`K${30 + i}`).value()
        current_reading.push(
          formatNumberCertification(
            current_readingValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const deviationValue = sheet.cell(`Q${30 + i}`).value()
        deviation.push(
          formatNumberCertification(
            deviationValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const uncertaintyValue = sheet.cell(`W${30 + i}`).value()
        uncertainty.push(
          this.methodService.getSignificantFigure(uncertaintyValue),
        )
      }

      const calibration_result = {
        nominal_value,
        current_length,
        current_reading,
        deviation,
        uncertainty: this.methodService.formatUncertainty(uncertainty),
      }

      const certificate = {
        pattern: 'NI-MCIT-D-02',
        email: activity.quote_request.client.email,
        equipment_information: {
          certification_code: formatCertCode(
            method.certificate_code,
            method.modification_number,
          ),
          service_code: activity.quote_request.no,
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(
            method.method_end_date_finished.toString(),
          ),
          next_calibration_date: formatDate(
            method.description_pattern.next_calibration,
          ),
          object_calibrated: method.equipment_information.device || 'N/A',
          maker: method.equipment_information.maker || 'N/A',
          serial_number: method.equipment_information.serial_number || 'N/A',
          model: method.equipment_information.model || 'N/A',
          measurement_range:
            `${formatSameNumberCertification(method.equipment_information.range_min)} ${method.equipment_information.unit} a ${formatSameNumberCertification(method.equipment_information.range_max)} ${method.equipment_information.unit}` ||
            'N/A',
          resolution:
            `${formatSameNumberCertification(method.equipment_information.resolution)} ${sheet.cell('Q17').value()}` ||
            'N/A',
          code: method.equipment_information.code || 'N/A',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        calibration_result,
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(
            sheet.cell('G45').value(),
            1,
          )} ± ${formatNumberCertification(Number(Number(sheet.cell('J45').value()).toFixed(1)))} °C`,
          humidity: `Humedad relativa: ${formatNumberCertification(
            sheet.cell('G46').value(),
            1,
          )} ± ${formatNumberCertification(sheet.cell('J46').value(), 1)} % HR`,
        },
        creditable: method.pre_installation_comment.accredited,
        descriptionPattern: await this.getPatternsTableToCertificate(method),
        observations: `
${method.pre_installation_comment.comment}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
La corrección corresponde al valor del patrón menos las indicación del equipo.
La indicación del equipo corresponde al promedio de 3 mediciones en cada punto de calibración.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.`,
      }

      return handleOK(certificate)
    } catch (error) {
      console.log(error)
      return handleInternalServerError('Error al generar el archivo')
    }
  }

  async getPatternsTableToCertificate(method: NI_MCIT_D_02) {
    const description_pattern = []

    for (
      let i = 0;
      i < method.description_pattern.descriptionPattern.length;
      i++
    ) {
      const code = method.description_pattern.descriptionPattern[i]
      const patternService = await this.patternsService.findByCodeAndMethod(
        code,
        'NI-MCIT-D-02',
      )

      if (patternService.success) {
        description_pattern.push(patternService.data)
      }
    }

    const environmentalConditionPattern =
      await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.equipment_used,
        'all',
      )

    if (environmentalConditionPattern.success) {
      description_pattern.push(environmentalConditionPattern.data)
    }

    return description_pattern
  }

  async generatePDFCertificate(
    activityID: number,
    methodID: number,
    generatePDF = false,
  ) {
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

      let dataCertificate: any

      if (!fs.existsSync(method.certificate_url) || generatePDF) {
        dataCertificate = await this.generateCertificateData({
          activityID,
          methodID,
        })
      } else {
        dataCertificate = await this.getCertificateResult(methodID, activityID)
      }

      dataCertificate.data.calibration_result =
        dataCertificate.data.calibration_result.nominal_value.map(
          (item, index) => {
            return {
              nominal_value: item,
              current_length:
                dataCertificate.data.calibration_result.current_length[index],
              current_reading:
                dataCertificate.data.calibration_result.current_reading[index],
              deviation:
                dataCertificate.data.calibration_result.deviation[index],
              uncertainty:
                dataCertificate.data.calibration_result.uncertainty[index],
            }
          },
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/d-02.hbs',
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
      return handleInternalServerError('Error al generar el PDF')
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

      const lastMethod = await this.NI_MCIT_D_02Repository.createQueryBuilder(
        'NI_MCIT_D_02',
      )
        .orderBy('NI_MCIT_D_02.record_index', 'DESC')
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
        'D',
        method.record_index,
      )

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
          'accuracy_test',
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

      const { pdf, client_email, fileName, clientName } = data.data as any

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
