import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { EquipmentInformationNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_information.entity'
import { EnvironmentalConditionsNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/instrument_zero_check.entity'
import { ExteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_parallelism_measurement.dto'
import { ExteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_parallelism_measurement.entity'
import { InteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/interior_parallelism_measurement.dto'
import { InteriorParallelismMeasurementNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/interior_parallelism_measurement.entity'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_measurement_accuracy.dto'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/exterior_measurement_accuracy.entity'
import { ActivitiesService } from '../activities/activities.service'

import { Activity } from '../activities/entities/activities.entity'
import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { PatternsService } from '../patterns/patterns.service'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import {
  getPosition,
  getPositionNominal,
} from './dto/NI_MCIT_D_01/PositionBPDto'
import { formatDate } from 'src/utils/formatDate'
import { CertificateService } from '../certificate/certificate.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'
import { MethodsService } from './methods.service'
import { formatCertCode, formatQuoteCode } from 'src/utils/generateCertCode'

@Injectable()
export class NI_MCIT_D_01Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_D_01)
    private readonly NI_MCIT_D_01Repository: Repository<NI_MCIT_D_01>,
    @InjectRepository(EquipmentInformationNI_MCIT_D_01)
    private readonly EquipmentInformationRepository: Repository<EquipmentInformationNI_MCIT_D_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_D_01)
    private readonly EnvironmentalConditionsRepository: Repository<EnvironmentalConditionsNI_MCIT_D_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_D_01)
    private readonly DescriptionPatternRepository: Repository<DescriptionPatternNI_MCIT_D_01>,
    @InjectRepository(PreInstallationCommentNI_MCIT_D_01)
    private readonly PreInstallationCommentRepository: Repository<PreInstallationCommentNI_MCIT_D_01>,
    @InjectRepository(InstrumentZeroCheckNI_MCIT_D_01)
    private readonly InstrumentZeroCheckRepository: Repository<InstrumentZeroCheckNI_MCIT_D_01>,
    @InjectRepository(ExteriorParallelismMeasurementNI_MCIT_D_01)
    private readonly ExteriorParallelismMeasurementRepository: Repository<ExteriorParallelismMeasurementNI_MCIT_D_01>,
    @InjectRepository(InteriorParallelismMeasurementNI_MCIT_D_01)
    private readonly InteriorParallelismMeasurementRepository: Repository<InteriorParallelismMeasurementNI_MCIT_D_01>,
    @InjectRepository(ExteriorMeasurementAccuracyNI_MCIT_D_01)
    private readonly ExteriorMeasurementAccuracyRepository: Repository<ExteriorMeasurementAccuracyNI_MCIT_D_01>,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,

    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,

    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,

    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,

    @Inject(forwardRef(() => MethodsService))
    private readonly methodService: MethodsService,
  ) {}

  async create() {
    try {
      const newNI_MCIT_D_01 = this.NI_MCIT_D_01Repository.create()
      const method = await this.NI_MCIT_D_01Repository.save(newNI_MCIT_D_01)
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_D_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //equipment Information
  async equipmentInformation(
    equipment: EquipmentInformationNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
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
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const enviromentalCOnditionExist = method.environmental_conditions

      if (enviromentalCOnditionExist) {
        this.EnvironmentalConditionsRepository.merge(
          enviromentalCOnditionExist,
          environmentalConditions,
        )
      } else {
        const newEnviromentalCondition =
          this.EnvironmentalConditionsRepository.create(environmentalConditions)
        method.environmental_conditions = newEnviromentalCondition
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

  async setCertificateIssueDate(id: number) {
    const response = await this.getMethodById(id)

    const { data: method } = response as { data: NI_MCIT_D_01 }

    return await this.dataSource.transaction((manager) => {
      if (!method.certificate_issue_date) {
        method.certificate_issue_date = new Date()
      }

      return manager.save(method)
    })
  }

  //Description Pattern
  async descriptionPattern(
    descriptionPatterns: DescriptionPatternNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existDescriptioPattern = method.description_pattern

      if (existDescriptioPattern) {
        this.DescriptionPatternRepository.merge(
          existDescriptioPattern,
          descriptionPatterns,
        )
      } else {
        const newDescriptionPattern =
          this.DescriptionPatternRepository.create(descriptionPatterns)
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
    preInstallationComment: PreInstallationCommentNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['pre_installation_comment'],
      })

      const existPreInstallatioComment = method.pre_installation_comment

      if (existPreInstallatioComment) {
        this.PreInstallationCommentRepository.merge(
          existPreInstallatioComment,
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
        return handleOK(method)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //instrumentZeroChek
  async instrumentZeroCheck(
    instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['instrument_zero_check'],
      })

      const existInstrumentalZeroCheck = method.instrument_zero_check

      if (existInstrumentalZeroCheck) {
        this.InstrumentZeroCheckRepository.merge(
          existInstrumentalZeroCheck,
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
        return handleOK(method)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //  exteriorParallelismMeasurement
  async exteriorParallelismMeasurement(
    exteriorParallelismMeasurement: ExteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['exterior_parallelism_measurement'],
      })

      const existExteriorParallelism = method.exterior_parallelism_measurement

      if (existExteriorParallelism) {
        this.ExteriorParallelismMeasurementRepository.merge(
          existExteriorParallelism,
          exteriorParallelismMeasurement,
        )
      } else {
        const newExteriorParaelismo =
          this.ExteriorParallelismMeasurementRepository.create(
            exteriorParallelismMeasurement,
          )
        method.exterior_parallelism_measurement = newExteriorParaelismo
      }
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.exterior_parallelism_measurement)
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
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  // Mejor manejo de errores y debug
  async interiorParallelismMeasurement(
    interiorParallelismMeasurement: InteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['interior_parallelism_measurement'],
      })

      const existinteriorParallelismMeasurement =
        method.interior_parallelism_measurement

      if (existinteriorParallelismMeasurement) {
        this.InteriorParallelismMeasurementRepository.merge(
          existinteriorParallelismMeasurement,
          interiorParallelismMeasurement,
        )
      } else {
        const newInterrioParallelism =
          this.InteriorParallelismMeasurementRepository.create(
            interiorParallelismMeasurement,
          )
        method.interior_parallelism_measurement = newInterrioParallelism
      }

      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.interior_parallelism_measurement)
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
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //exteriorMeasurementAccuracy
  async exteriorMeasurementAccuracy(
    exteriorMeasurementAccuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01Dto,
    methodId: number,
    activityID: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: ['exterior_measurement_accuracy'],
      })

      const existexteriorMeasurementAccuracy =
        method.exterior_measurement_accuracy

      if (existexteriorMeasurementAccuracy) {
        this.ExteriorMeasurementAccuracyRepository.merge(
          existexteriorMeasurementAccuracy,
          exteriorMeasurementAccuracy,
        )
      } else {
        const newexteriorMeasurementAccuracy =
          this.ExteriorMeasurementAccuracyRepository.create(
            exteriorMeasurementAccuracy,
          )
        method.exterior_measurement_accuracy = newexteriorMeasurementAccuracy
      }
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.save(method.exterior_measurement_accuracy)
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

        return handleOK(method)
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
    const method = await this.NI_MCIT_D_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'description_pattern',
        'pre_installation_comment',
        'instrument_zero_check',
        'exterior_parallelism_measurement',
        'interior_parallelism_measurement',
        'exterior_measurement_accuracy',
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
    const dataQuote = activity.quote_request

    // if (equipment.length === 0) {
    //   return handleInternalServerError(
    //     'El método no existe en la actividad seleccionada',
    //   )
    // }

    const filePath = path.join(
      __dirname,
      `../mail/templates/excels/ni_mcit_d_01.xlsx`,
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

      //enter method selected
      const sheetEC = workbook.sheet('NI-R01-MCIT-D-01')
      const sheetEC2 = workbook.sheet('Datos Patrones')

      //client
      sheetEC.cell('B8').value(dataClient.company_name)
      sheetEC.cell('B9').value(dataClient.address)
      //data quiote
      sheetEC.cell('E9').value(dataQuote.no)

      // Obtener la fecha actual
      // Asignar la fecha formateada a la celda E8
      sheetEC.cell('E8').value(method.equipment_information?.date)
      //maker
      sheetEC.cell('B13').value(method.equipment_information?.maker)
      //serie
      sheetEC.cell('B14').value(method.equipment_information?.serial_number)
      //range
      // sheetEC.cell('B15').value(method.equipment_information.measurement_range)
      //resolution
      sheetEC.cell('B16').value(method.equipment_information?.resolution)
      //model
      sheetEC.cell('E13').value(method.equipment_information?.model)
      //code
      sheetEC.cell('E14').value(method.equipment_information.code)
      //length
      sheetEC.cell('E15').value(method.equipment_information.length)

      //environmental conditions
      sheetEC
        .cell('C20')
        .value(method.environmental_conditions.cycles.hr.initial)
      sheetEC.cell('C21').value(method.environmental_conditions.cycles.hr.end)
      sheetEC
        .cell('B20')
        .value(method.environmental_conditions.cycles.ta.initial)
      sheetEC.cell('B21').value(method.environmental_conditions.cycles.ta.end)
      sheetEC.cell('D20').value(method.environmental_conditions.equipment_used)
      sheetEC.cell('F20').value(method.calibration_location)
      sheetEC
        .cell('E20')
        .value(
          method.environmental_conditions.time.hours +
            ':' +
            method.environmental_conditions.time.minute,
        )

      //pre installation comment
      sheetEC.cell('A28').value(method.pre_installation_comment.comment)

      //instrument zero check
      sheetEC.cell('A34').value(method.instrument_zero_check?.nominal_value)
      sheetEC
        .cell('C34')
        .value(
          method.instrument_zero_check?.x1 == 0.0
            ? 0
            : method.instrument_zero_check?.x1,
        )
      sheetEC
        .cell('D34')
        .value(
          method.instrument_zero_check?.x2 == 0.0
            ? 0
            : method.instrument_zero_check?.x2,
        )
      sheetEC
        .cell('E34')
        .value(
          method.instrument_zero_check?.x3 == 0.0
            ? 0
            : method.instrument_zero_check?.x3,
        )
      sheetEC
        .cell('F34')
        .value(
          method.instrument_zero_check?.x4 == 0.0
            ? 0
            : method.instrument_zero_check?.x4,
        )
      sheetEC
        .cell('G34')
        .value(
          method.instrument_zero_check?.x5 == 0.0
            ? 0
            : method.instrument_zero_check?.x5,
        )

      //Medición de paralelismo (caras de medición de exteriores)
      if (method.exterior_parallelism_measurement != null) {
        if (method.exterior_parallelism_measurement.measurements != null) {
          let fila = 39
          let position = 1
          const columnas_verificacion_exterior = ['D', 'E', 'F', 'G', 'H']
          const columnas_verificacion_interior = ['D', 'E', 'F', 'G', 'H']

          method.exterior_parallelism_measurement.measurements.forEach(
            (item) => {
              //exterior
              Object.entries(item.verification_lengths.Exterior).forEach(
                ([key, value], index) => {
                  const columna = columnas_verificacion_exterior[index]
                  sheetEC.cell(`${columna}${fila}`).value(value)
                },
              )
              fila++
              Object.entries(item.verification_lengths.Interior).forEach(
                ([key, value], index) => {
                  const columna = columnas_verificacion_interior[index]
                  sheetEC.cell(`${columna}${fila}`).value(value)
                },
              )

              if (position == 1) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 6
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 2) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 13
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 3) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 20
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 4) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 27
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 5) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 34
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 6) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 41
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }
              if (position == 7) {
                const startingColumn = 'L'
                let currentColumn = startingColumn
                let fila_L = 48
                Object.entries(item.point_number).forEach(([key, value]) => {
                  let position_l = getPosition(String(value))
                  sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
                  currentColumn = String.fromCharCode(
                    currentColumn.charCodeAt(0) + 1,
                  )
                })
              }

              fila++
              position++
            },
          )
        }
      }

      //Medición de paralelismo (caras de medición de interiores)
      if (method.interior_parallelism_measurement != null) {
        if (method.interior_parallelism_measurement.measurementsd01 != null) {
          let fila_interior_parallelism = 56
          let position_interior_parallelism = 1
          const columnas_verificacion_exterior3 = ['D', 'E', 'F', 'G', 'H']
          const columnas_verificacion_interior3 = ['D', 'E', 'F', 'G', 'H']

          method.interior_parallelism_measurement.measurementsd01.forEach(
            (item) => {
              Object.entries(item.verification_lengths.Exterior).forEach(
                ([key, value], index) => {
                  const columna = columnas_verificacion_exterior3[index]
                  sheetEC
                    .cell(`${columna}${fila_interior_parallelism}`)
                    .value(value)
                },
              )
              fila_interior_parallelism++
              Object.entries(item.verification_lengths.Interior).forEach(
                ([key, value], index) => {
                  const columna = columnas_verificacion_interior3[index]
                  sheetEC
                    .cell(`${columna}${fila_interior_parallelism}`)
                    .value(value)
                },
              )

              if (position_interior_parallelism == 1) {
                const startingColumn = 'P'
                let currentColumn = startingColumn
                let fila_P = 6
                let position_P = getPositionNominal(item.point_number)
                sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
              }
              if (position_interior_parallelism == 2) {
                const startingColumn = 'P'
                let currentColumn = startingColumn
                let fila_P = 13
                let position_P = getPositionNominal(item.point_number)
                sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
              }
              if (position_interior_parallelism == 3) {
                const startingColumn = 'P'
                let currentColumn = startingColumn
                let fila_P = 20
                let position_P = getPositionNominal(item.point_number)
                sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
              }
              fila_interior_parallelism++
              position_interior_parallelism++
            },
          )
        }
      }

      // PRUEBA DE EXACTITUD CARA DE MEDICIÓN DE EXTERIORES
      let fila_acurrancy_test = 72
      let fila_position_acurrancy_test = 1
      const columnas_verificacion_exterior4 = ['C', 'D', 'E', 'F', 'G']

      method.exterior_measurement_accuracy?.measure?.forEach((item) => {
        Object.entries(item.verification_lengths).forEach(
          ([key, value], index) => {
            const columna = columnas_verificacion_exterior4[index]
            sheetEC.cell(`${columna}${fila_acurrancy_test}`).value(value)
          },
        )

        if (fila_position_acurrancy_test == 1) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 6
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (fila_position_acurrancy_test == 2) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 14
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (fila_position_acurrancy_test == 3) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 22
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (fila_position_acurrancy_test == 4) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 30
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (fila_position_acurrancy_test == 5) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 38
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (fila_position_acurrancy_test == 6) {
          const startingColumn = 'T'
          let currentColumn = startingColumn
          let fila_I = 46
          Object.entries(item.nominal_patron_value).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_I}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        fila_acurrancy_test++
        fila_position_acurrancy_test++
      })

      //tipo de patrone de medicion
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-02') {
        sheetEC.cell('S52').value(1)
      }
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-05') {
        sheetEC.cell('S52').value(2)
      }
      if (method.environmental_conditions.equipment_used == 'NI-MCPPT-06') {
        sheetEC.cell('S52').value(3)
      }

      const getNominalValue: Record<string, number> = {
        '0': 2,
        '5': 3,
        '10': 4,
        '15': 5,
        '20': 6,
        '25': 7,
      }

      sheetEC2
        .cell('P6')
        .value(
          getNominalValue[
            method.interior_parallelism_measurement.measurementsd01[0]
              .point_number[0]
          ],
        )

      // Procesamiento de equipos DA (mm) y FA (mm)
      const descipcioPatrines = []
      method.description_pattern?.descriptionPatterns.forEach(async (x) => {
        let dato = x
        let patterns = await this.patternsService.findByCodeAndMethod(
          dato,
          'NI-MCIT-D-01',
        )
        descipcioPatrines.push(patterns.data)
      })

      let patterns = await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.equipment_used,
        'NI-MCIT-D-01',
      )

      descipcioPatrines.push(patterns.data)

      workbook.toFileAsync(method.certificate_url)

      await this.autoSaveExcel(method.certificate_url)

      return this.getCertificateResult(method.id, activityID)
    } catch (error) {
      console.error('Error al generar el archivo:', error)
      return handleInternalServerError('Error al generar el archivo')
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'exterior_parallelism_measurement',
          'interior_parallelism_measurement',
          'exterior_measurement_accuracy',
        ],
      })

      const dataActivity =
        await this.activitiesService.getActivitiesByID(activityID)

      const { data: activity } = dataActivity as { data: Activity }

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)
      const sheet = workbook.sheet('DA (mm)')

      const calibration_point = []
      const nominal_value = []
      const value = []
      const current_reading = []
      const deviation = []
      const uncertainty = []

      for (let i = 0; i <= 7; i++) {
        const calibration_pointValue = sheet.cell(`C${27 + i}`).value()
        calibration_point.push(calibration_pointValue)

        const nominal_valueValue = sheet.cell(`G${27 + i}`).value()
        nominal_value.push(
          formatNumberCertification(
            nominal_valueValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const valueValue = sheet.cell(`K${27 + i}`).value()
        value.push(
          formatNumberCertification(
            valueValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const current_readingValue = sheet.cell(`O${27 + i}`).value()
        current_reading.push(
          formatNumberCertification(
            current_readingValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const deviationValue = sheet.cell(`S${27 + i}`).value()
        deviation.push(
          formatNumberCertification(
            deviationValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const uncertaintyValue = sheet.cell(`W${27 + i}`).value()
        uncertainty.push(
          this.methodService.getSignificantFigure(uncertaintyValue),
        )
      }

      const nominal_value_inside = []
      const current_reading_inside = []
      const deviation_inside = []

      nominal_value_inside.push(sheet.cell('T41').value())

      nominal_value_inside.push(
        formatNumberCertification(
          sheet.cell('T42').value(),
          countDecimals(method.equipment_information.resolution),
        ),
      )

      current_reading_inside.push(sheet.cell('W41').value())

      current_reading_inside.push(
        formatNumberCertification(
          sheet.cell('W42').value(),
          countDecimals(method.equipment_information.resolution),
        ),
      )

      current_reading_inside.push(
        formatNumberCertification(
          sheet.cell('W43').value(),
          countDecimals(method.equipment_information.resolution),
        ),
      )

      deviation_inside.push(sheet.cell('Z41').value())

      deviation_inside.push(
        formatNumberCertification(
          sheet.cell('Z42').value(),
          countDecimals(method.equipment_information.resolution),
        ),
      )

      const nominal_value_outside = []
      const current_reading_outside = []
      const deviation_outside = []

      for (let i = 0; i <= 12; i++) {
        const skip = i == 0 ? 0 : i === 1 ? 0 : 1
        let altSkip =
          41 + i + skip === 52 ? 54 : 41 + i + skip === 53 ? 55 : 41 + i + skip

        const altSkip2 = 41 + i === 52 ? 54 : 41 + i === 53 ? 55 : 41 + i

        if (altSkip % 2 === 0 || altSkip === 41) {
          const nominal_valueValue = sheet.cell(`E${altSkip}`).value()
          nominal_value_outside.push(nominal_valueValue)
        }

        const current_readingValue = sheet.cell(`H${altSkip2}`).value()

        current_reading_outside.push(
          formatNumberCertification(
            current_readingValue,
            countDecimals(method.equipment_information.resolution),
          ),
        )
        if (altSkip % 2 === 0 || altSkip === 41) {
          const deviationValue = sheet.cell(`L${altSkip}`).value()
          deviation_outside.push(
            formatNumberCertification(
              deviationValue,
              countDecimals(method.equipment_information.resolution),
            ),
          )
        }
      }

      const calibration_result = {
        calibration_point,
        nominal_value,
        value,
        current_reading,
        deviation,
        uncertainty: this.methodService.formatUncertainty(uncertainty),
      }

      const calibration_result_inside = {
        nominal_value_inside,
        current_reading_inside,
        deviation_inside,
      }

      const calibration_result_outside = {
        nominal_value_outside,
        current_reading_outside,
        deviation_outside,
      }

      const certificate = {
        pattern: 'NI-MCIT-D-01',
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
          object_calibrated: method.equipment_information.device || 'N/A',
          maker: method.equipment_information.maker || 'N/A',
          serial_number: method.equipment_information.serial_number || 'N/A',
          model: method.equipment_information.model || 'N/A',
          measurement_range:
            `${formatSameNumberCertification(method.equipment_information.range_min)} ${method.equipment_information.unit} a ${formatSameNumberCertification(method.equipment_information.range_max)} ${method.equipment_information.unit}` ||
            'N/A',
          resolution:
            `${formatSameNumberCertification(method.equipment_information.resolution)} ${sheet.cell('S17').value()}` ||
            'N/A',
          code: method.equipment_information.code || 'N/A',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        calibrations: {
          calibration_result,
          calibration_result_outside,
          calibration_result_inside,
        },
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(
            sheet.cell('G68').value(),
            1,
          )} ± ${formatNumberCertification(Number(Number(sheet.cell('J68').value()).toFixed(1)))} °C`,
          humidity: `Humedad relativa: ${formatNumberCertification(
            sheet.cell('G69').value(),
            1,
          )} ± ${formatNumberCertification(sheet.cell('J69').value(), 1)} %`,
        },
        descriptionPattern: await this.getPatternsTableToCertificate(method),
        observations: `
${method.pre_installation_comment.comment}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
La corrección corresponde al valor del patrón menos las indicación del equipo.
La indicación del equipo corresponde al promedio de 3 mediciones en cada punto de calibración.
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.`,
        creditable: method.pre_installation_comment.accredited,
      }

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getPatternsTableToCertificate(method: NI_MCIT_D_01) {
    const description_pattern = []

    for (
      let i = 0;
      i < method.description_pattern.descriptionPatterns.length;
      i++
    ) {
      const code = method.description_pattern.descriptionPatterns[i]
      const patternService = await this.patternsService.findByCodeAndMethod(
        code,
        'NI-MCIT-D-01',
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
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'exterior_parallelism_measurement',
          'interior_parallelism_measurement',
          'exterior_measurement_accuracy',
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

      dataCertificate.data.calibrations.calibration_result =
        dataCertificate.data.calibrations.calibration_result.calibration_point.map(
          (item, index) => ({
            calibration_point: item,
            nominal_value:
              dataCertificate.data.calibrations.calibration_result
                .nominal_value[index],
            value:
              dataCertificate.data.calibrations.calibration_result.value[index],
            current_reading:
              dataCertificate.data.calibrations.calibration_result
                .current_reading[index],
            deviation:
              dataCertificate.data.calibrations.calibration_result.deviation[
                index
              ],
            uncertainty:
              dataCertificate.data.calibrations.calibration_result.uncertainty[
                index
              ],
          }),
        )

      // formateo de datos para el PDF es necesario este cambio

      const tempInside =
        dataCertificate.data.calibrations.calibration_result_inside
          .nominal_value_inside
      const tempInside2 =
        dataCertificate.data.calibrations.calibration_result_inside
          .deviation_inside

      dataCertificate.data.calibrations.calibration_result_inside.nominal_value_inside =
        []
      dataCertificate.data.calibrations.calibration_result_inside.deviation_inside =
        []

      for (let i = 0; i < tempInside.length; i++) {
        dataCertificate.data.calibrations.calibration_result_inside.nominal_value_inside.push(
          tempInside[i],
        )
        dataCertificate.data.calibrations.calibration_result_inside.deviation_inside.push(
          tempInside2[i],
        )

        if (i !== 0) {
          dataCertificate.data.calibrations.calibration_result_inside.nominal_value_inside.push(
            '',
          )
          dataCertificate.data.calibrations.calibration_result_inside.deviation_inside.push(
            '',
          )
        }
      }

      dataCertificate.data.calibrations.calibration_result_inside =
        dataCertificate.data.calibrations.calibration_result_inside.current_reading_inside.map(
          (item, index) => ({
            point: index % 2 === 1 ? 'Superior' : 'Inferior',
            nominal_value:
              dataCertificate.data.calibrations.calibration_result_inside
                .nominal_value_inside[index],
            current_reading: item,

            deviation:
              dataCertificate.data.calibrations.calibration_result_inside
                .deviation_inside[index],
          }),
        )

      // formateo de datos para el PDF es necesario este cambio
      const tempOutside =
        dataCertificate.data.calibrations.calibration_result_outside
          .nominal_value_outside
      const tempOutside2 =
        dataCertificate.data.calibrations.calibration_result_outside
          .deviation_outside

      dataCertificate.data.calibrations.calibration_result_outside.nominal_value_outside =
        []
      dataCertificate.data.calibrations.calibration_result_outside.deviation_outside =
        []

      for (let i = 0; i < tempOutside.length; i++) {
        dataCertificate.data.calibrations.calibration_result_outside.nominal_value_outside.push(
          tempOutside[i],
        )
        dataCertificate.data.calibrations.calibration_result_outside.deviation_outside.push(
          tempOutside2[i],
        )

        if (i !== 0) {
          dataCertificate.data.calibrations.calibration_result_outside.nominal_value_outside.push(
            '',
          )
          dataCertificate.data.calibrations.calibration_result_outside.deviation_outside.push(
            '',
          )
        }
      }

      dataCertificate.data.calibrations.calibration_result_outside =
        dataCertificate.data.calibrations.calibration_result_outside.current_reading_outside.map(
          (item, index) => ({
            point: index % 2 === 1 ? 'Superior' : 'Inferior',
            nominal_value:
              dataCertificate.data.calibrations.calibration_result_outside
                .nominal_value_outside[index],
            current_reading: item,
            deviation:
              dataCertificate.data.calibrations.calibration_result_outside
                .deviation_outside[index],
          }),
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/d-01.hbs',
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
            resolve(stdout)
          }
        },
      )
    })
  }

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodID },
      })

      const currentYear = new Date().getFullYear()

      const lastMethod = await this.NI_MCIT_D_01Repository.createQueryBuilder(
        'NI_MCIT_D_01',
      )
        .where('EXTRACT(YEAR FROM NI_MCIT_D_01.created_at) = :currentYear', {
          currentYear,
        })
        .orderBy('NI_MCIT_D_01.last_record_index', 'DESC')
        .getOne()

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      await this.dataSource.transaction(async (manager) => {
        method.record_index = !lastMethod ? 1 : lastMethod.last_record_index + 1

        await this.methodService.updateLastRecordIndex('NI_MCIT_D_01')

        await manager.save(method)
      })

      const certificate = await this.certificateService.create(
        'D',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      return handleOK(await this.NI_MCIT_D_01Repository.save(method))
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMethodById(methodId: number) {
    try {
      const method = await this.NI_MCIT_D_01Repository.findOne({
        where: { id: methodId },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'description_pattern',
          'pre_installation_comment',
          'instrument_zero_check',
          'exterior_parallelism_measurement',
          'interior_parallelism_measurement',
          'exterior_measurement_accuracy',
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
