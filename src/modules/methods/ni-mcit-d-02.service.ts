import { Inject, Injectable, forwardRef } from '@nestjs/common'
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
import * as XlsxPopulate from 'xlsx-populate'
import * as fs from 'fs'
import * as path from 'path'

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
        const newEquipment =
          this.EquipmentInformationRepository.create(equipment)
        method.equipment_information = newEquipment
      }
      await executeTransaction(
        this.dataSource,
        method,
        method.equipment_information,
      )
      return handleOK(method)
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

      await executeTransaction(
        this.dataSource,
        method,
        method.environmental_conditions,
      )
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
      await executeTransaction(
        this.dataSource,
        method,
        method.description_pattern,
      )
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
      await executeTransaction(
        this.dataSource,
        method,
        method.pre_installation_comment,
      )
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
      await executeTransaction(
        this.dataSource,
        method,
        method.instrument_zero_check,
      )
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async accuracyTest(
    accuracyTest: AccuracyTestNI_MCIT_D_02Dto,
    methodId: number,
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

      await executeTransaction(this.dataSource, method, method.accuracy_test)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  //excel
  async generateCertificateD_02({
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

    const equipment = activity.quote_request.equipment_quote_request.filter(
      (item) => item.method_id == method.id,
    )

    const dataClient = activity.quote_request.client
    const dataQuote = activity.quote_request

    if (equipment.length === 0) {
      return handleInternalServerError('El equipo no existe')
    }

    //ni_mcit_d_02
    const filePath = path.join(
      __dirname,
      `../mail/templates/excels/ni_mcit_d_02.xlsx`,
    )

    try {
      const newFilePath = path.join(
        __dirname,
        `../mail/templates/excels/ni_mcit_d_02_${activityID}_${methodID}.xlsx`,
      )
      fs.copyFileSync(filePath, newFilePath)

      const workbook = await XlsxPopulate.fromFileAsync(newFilePath)

      if (!workbook) {
        return handleInternalServerError('El archivo no existe')
      }

      const sheetNI_R01_MCIT_D_02 = workbook.sheet('NI-R01-MCIT-D-02')
      const sheetResultados = workbook.sheet('Resultados')
      const sheetDatos_Patrones = workbook.sheet('Datos Patrones')
      const sheetEC3 = workbook.sheet('DA (mm)')
      const sheetEC4 = workbook.sheet('FA (mm)')

      //Datos del cliente
      sheetNI_R01_MCIT_D_02.cell('B7').value(dataClient.company_name)

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
      sheetNI_R01_MCIT_D_02.cell('H7').value(fechaFormateada)

      //Informacion de equipos
      const equipmentInfo = method.equipment_information
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
        .value(environmentalConditions.stabilization_site)
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

      //Patron de descripcion
      const descriptionPattern = method.description_pattern
      sheetNI_R01_MCIT_D_02
        .cell('A23')
        .value('NI-MCPD-' + descriptionPattern.NI_MCPD_01)
      sheetNI_R01_MCIT_D_02
        .cell('A24')
        .value('NI-MCPD-' + descriptionPattern.NI_MCPD_02)
      sheetNI_R01_MCIT_D_02
        .cell('A25')
        .value('NI-MCPD-' + descriptionPattern.NI_MCPD_03)
      sheetNI_R01_MCIT_D_02
        .cell('A26')
        .value('NI-MCPD-' + descriptionPattern.NI_MCPD_04)

      //Observaciones pre-instalacion
      const preInstallationComment = method.pre_installation_comment
      sheetNI_R01_MCIT_D_02.cell('A26').value(preInstallationComment.comment)

      //Verificacion de cero del instrumento
      const instrumentZeroCheck = method.instrument_zero_check
      sheetNI_R01_MCIT_D_02.cell('A32').value(instrumentZeroCheck.nominal_value)
      sheetNI_R01_MCIT_D_02.cell('B32').value(instrumentZeroCheck.x1)
      sheetNI_R01_MCIT_D_02.cell('C32').value(instrumentZeroCheck.x2)
      sheetNI_R01_MCIT_D_02.cell('D32').value(instrumentZeroCheck.x3)
      sheetNI_R01_MCIT_D_02.cell('E32').value(instrumentZeroCheck.x4)
      sheetNI_R01_MCIT_D_02.cell('F32').value(instrumentZeroCheck.x5)
      sheetNI_R01_MCIT_D_02.cell('G32').value(instrumentZeroCheck.x6)
      sheetNI_R01_MCIT_D_02.cell('H32').value(instrumentZeroCheck.x7)
      sheetNI_R01_MCIT_D_02.cell('I32').value(instrumentZeroCheck.x8)
      sheetNI_R01_MCIT_D_02.cell('J32').value(instrumentZeroCheck.x9)
      sheetNI_R01_MCIT_D_02.cell('K32').value(instrumentZeroCheck.x10)

      //Prueba de exactitud
      let fila = 37
      let position = 1
      const Column = 'B'
      const accuracyTest = method.accuracy_test

      //fin del metodo
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
