import { PdfService } from './../mail/pdf.service'
import { Inject, Injectable, forwardRef, Get } from '@nestjs/common'
import { NI_MCIT_D_01 } from './entities/NI_MCIT_D_01/NI_MCIT_D_01.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { EquipmentInformationNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_01 } from './entities/NI_MCIT_D_01/steps/equipment_informatio.entity'
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
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import {
  getPosition,
  getPositionNominal,
  getValor,
} from './dto/NI_MCIT_D_01/PositionBPDto'

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

  //equipment Information
  async equipmentInformation(
    equipment: EquipmentInformationNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      const newEquipment = this.EquipmentInformationRepository.create(equipment)
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
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.environmental_conditions)
        await manager.save(method)
      })
      return handleOK(method.environmental_conditions)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //Description Pattern
  async descriptionPattern(
    descriptionPattern: DescriptionPatternNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
        descriptionPattern,
      )
    } else {
      const newDescriptioPattern =
        this.DescriptionPatternRepository.create(descriptionPattern)
      method.description_pattern = newDescriptioPattern
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
  }

  async preInstallationComment(
    preInstallationComment: PreInstallationCommentNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.pre_installation_comment)
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //instrumentZeroChek
  async instrumentZeroCheck(
    instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.instrument_zero_check)
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //  exteriorParallelismMeasurement
  async exteriorParallelismMeasurement(
    exteriorParallelismMeasurement: ExteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.exterior_parallelism_measurement)
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //interiorParallelismMeasurement
  async interiorParallelismMeasurement(
    interiorParallelismMeasurement: InteriorParallelismMeasurementNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.interior_parallelism_measurement)
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //exteriorMeasurementAccuracy
  async exteriorMeasurementAccuracy(
    exteriorMeasurementAccuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01Dto,
    methodId: number,
  ) {
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
      this.dataSource.transaction(async (manager) => {
        await manager.save(method.exterior_measurement_accuracy)
        await manager.save(method)
      })
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //excel
  async generateCertificateD_01({
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

    const equipment = activity.quote_request.equipment_quote_request.filter(
      (item) => item.method_id == method.id,
    )

    const dataClient = activity.quote_request.client
    const dataQuote = activity.quote_request

    if (equipment.length === 0) {
      return handleInternalServerError(
        'El método no existe en la actividad seleccionada',
      )
    }

    const filePath = path.join(
      __dirname,
      `../mail/templates/excels/ni_mcit_d_01.xlsx`,
    )

    try {
      const newFilePath = path.join(
        __dirname,
        `../mail/templates/excels/ni_mcit_d_01_${activityID}_${methodID}.xlsx`,
      )

      fs.copyFileSync(filePath, newFilePath)

      const workbook = await XlsxPopulate.fromFileAsync(newFilePath)

      if (!workbook) {
        return handleInternalServerError('El archivo no existe')
      }

      //enter method selected
      const sheetEC = workbook.sheet('NI-R01-MCIT-D-01')
      const sheetEC2 = workbook.sheet('Datos Patrones')
      const sheetEC3 = workbook.sheet('DA (mm)')
      const sheetEC4 = workbook.sheet('FA (mm)')

      //client
      sheetEC.cell('A9').value(dataClient.company_name)
      //data quiote
      sheetEC.cell('E9').value(dataQuote.no)

      // Obtener la fecha actual
      const fecha: Date = new Date()

      // Obtener los componentes de la fecha
      const dia: number = fecha.getDate()
      const mes: number = fecha.getMonth() + 1 // Los meses comienzan desde 0, por lo que se suma 1
      const año: number = fecha.getFullYear()

      // Ajustar el formato de la fecha para que tenga dos dígitos
      const diaFormateado: string = dia < 10 ? '0' + dia : dia.toString()
      const mesFormateado: string = mes < 10 ? '0' + mes : mes.toString()

      // Formatear la fecha al formato deseado (YYYY-MM-DD)
      const fechaFormateada: string = `${año}-${mesFormateado}-${diaFormateado}`

      // Asignar la fecha formateada a la celda E8
      sheetEC.cell('E8').value(fechaFormateada)

      //maker
      sheetEC.cell('B13').value(method.equipment_information.maker)
      //serie
      sheetEC.cell('B14').value(method.equipment_information.serial_number)
      //range
      sheetEC.cell('B15').value(method.equipment_information.measurement_range)
      //resolution
      sheetEC.cell('B16').value(method.equipment_information.resolution)
      //model
      sheetEC.cell('E13').value(method.equipment_information.model)
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
      sheetEC
        .cell('F20')
        .value(method.environmental_conditions.stabilization_site)
      sheetEC.cell('E20').value(method.environmental_conditions.time.minute)

      //description Pattern
      sheetEC
        .cell('A24')
        .value('NI-MCPD-' + method.description_pattern.NI_MCPD_01)
      sheetEC
        .cell('A25')
        .value('NI-MCPD-' + method.description_pattern.NI_MCPD_02)
      sheetEC
        .cell('B24')
        .value('NI-MCPD-' + method.description_pattern.NI_MCPD_03)
      sheetEC
        .cell('B25')
        .value('NI-MCPD-' + method.description_pattern.NI_MCPD_04)

      //pre installation comment
      sheetEC.cell('A28').value(method.pre_installation_comment.comment)

      //instrument zero check
      sheetEC.cell('A34').value(method.instrument_zero_check.nominal_value)
      sheetEC.cell('C34').value(method.instrument_zero_check.x1)
      sheetEC.cell('D34').value(method.instrument_zero_check.x2)
      sheetEC.cell('E34').value(method.instrument_zero_check.x3)
      sheetEC.cell('F34').value(method.instrument_zero_check.x4)
      sheetEC.cell('G34').value(method.instrument_zero_check.x5)

      //Medición de paralelismo (caras de medición de exteriores)
      let fila = 39
      let position = 1
      const columnas_verificacion_exterior = ['D', 'E', 'F', 'G', 'H']
      const columnas_verificacion_interior = ['D', 'E', 'F', 'G', 'H']

      method.exterior_parallelism_measurement.measurements.forEach((item) => {
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
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 2) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 13
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 3) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 20
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 4) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 27
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 5) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 34
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 6) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 41
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }
        if (position == 7) {
          const startingColumn = 'L'
          let currentColumn = startingColumn
          let fila_L = 48
          Object.entries(item.point_number).forEach(([key, value]) => {
            let position_l = getPosition(String(value))
            sheetEC2.cell(`${currentColumn}${fila_L}`).value(position_l)
            currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1)
          })
        }

        fila++
        position++
      })

      //Medición de paralelismo (caras de medición de interiores)
      let fila_interior_parallelism = 56
      let position_interior_parallelism = 1
      const column_point_number3 = 'A'
      const columnas_verificacion_exterior3 = ['D', 'E', 'F', 'G', 'H']
      const columnas_verificacion_interior3 = ['D', 'E', 'F', 'G', 'H']

      method.interior_parallelism_measurement.measurements.forEach((item) => {
        Object.entries(item.verification_lengths.Exterior).forEach(
          ([key, value], index) => {
            const columna = columnas_verificacion_exterior3[index]
            sheetEC.cell(`${columna}${fila_interior_parallelism}`).value(value)
          },
        )
        fila_interior_parallelism++
        Object.entries(item.verification_lengths.Interior).forEach(
          ([key, value], index) => {
            const columna = columnas_verificacion_interior3[index]
            sheetEC.cell(`${columna}${fila_interior_parallelism}`).value(value)
          },
        )

        if (position_interior_parallelism == 1) {
          const startingColumn = 'P'
          let currentColumn = startingColumn
          let fila_P = 6
          let position_P = getPositionNominal(item.nominal_patron)
          sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
        }
        if (position_interior_parallelism == 2) {
          const startingColumn = 'P'
          let currentColumn = startingColumn
          let fila_P = 13
          let position_P = getPositionNominal(item.nominal_patron)
          sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
        }
        if (position_interior_parallelism == 3) {
          const startingColumn = 'P'
          let currentColumn = startingColumn
          let fila_P = 20
          let position_P = getPositionNominal(item.nominal_patron)
          sheetEC2.cell(`${currentColumn}${fila_P}`).value(position_P)
        }
        fila_interior_parallelism++
        position_interior_parallelism++
      })

      // PRUEBA DE EXACTITUD CARA DE MEDICIÓN DE EXTERIORES
      let fila_acurrancy_test = 72
      let fila_position_acurrancy_test = 1
      const columnas_verificacion_exterior4 = ['C', 'D', 'E', 'F', 'G']

      method.exterior_measurement_accuracy.measure.forEach((item) => {
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

      async function procesarEquipo(sheet, fila, equipo, bandera) {
        let equipoNumber = equipo
        if (bandera) {
          if (equipoNumber < 10) {
            equipo = 'NI-MCPD-0' + equipo
          } else {
            equipo = 'NI-MCPD-' + equipo
          }
        }
        let valoresEquipo = getValor(equipo)
        console.log(valoresEquipo)
        sheet.cell(`A${fila}`).value(valoresEquipo[0])
        sheet.cell(`I${fila}`).value(equipo)
        sheet.cell(`M${fila}`).value(valoresEquipo[1])
        sheet.cell(`R${fila}`).value(valoresEquipo[2])
      }

      // Procesamiento de equipos DA (mm)
      let filaDA = 83
      for (let i = 1; i <= 4; i++) {
        let codigoEquipo = method.description_pattern['NI_MCPD_0' + i]
        if (codigoEquipo) {
          await procesarEquipo(sheetEC3, filaDA, codigoEquipo, true)
          filaDA++
        }
      }

      // Procesamiento de equipo usado para DA (mm)
      await procesarEquipo(
        sheetEC3,
        filaDA,
        method.environmental_conditions.equipment_used,
        false,
      )
      filaDA++

      // Procesamiento de equipos FA (mm)
      let filaFA = 82
      for (let i = 1; i <= 4; i++) {
        let codigoEquipo = method.description_pattern['NI_MCPD_0' + i]
        if (codigoEquipo) {
          await procesarEquipo(sheetEC4, filaFA, codigoEquipo, true)
          filaFA++
        }
      }

      // Procesamiento de equipo usado para FA (mm)
      await procesarEquipo(
        sheetEC4,
        filaFA,
        method.environmental_conditions.equipment_used,
        false,
      )

      workbook.toFileAsync(newFilePath)

      await this.autoSaveExcel(newFilePath)

      // /*GENERAR PDF DE LA CERTIFICACION*/
      // const sheet1Pdf = workbook.sheet('NI-R01-MCIT-D-01').usedRange().value()
      // const sheet2Pdf = workbook.sheet('DA (mm)').usedRange().value()
      // const sheet3Pdf = workbook.sheet('FA (mm)').usedRange().value()

      // let combineData = []
      // if (method.pre_installation_comment.accredited) {
      //   combineData = [...sheet1Pdf, ...sheet2Pdf]
      // } else {
      //   combineData = [...sheet1Pdf, ...sheet3Pdf]
      // }

      // //tomar los sheet combineData y generar el pdf con la libreria pdf-lib

      // const pdfFilePath = path.join(
      //   __dirname,
      //   `../mail/templates/excels/ni_mcit_d_01_${activityID}_${methodID}.pdf`,
      // )

      return handleOK('Archivo generado correctamente')
    } catch (error) {
      console.error('Error al generar el archivo:', error)
      return handleInternalServerError('Error al generar el archivo')
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
}
