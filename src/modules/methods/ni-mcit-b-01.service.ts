import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, Column } from 'typeorm'
import { NI_MCIT_B_01 } from './entities/NI_MCIT_B_01/NI_MCIT_B_01.entity'
import { EquipmentInformationNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01equipment_information.entity'
import { EccentricityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01eccentricity_test.entity'
import { RepeatabilityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01repeatability_test.entity'
import { LinearityTestNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01linearity_test.entity'
import { PdfService } from '../mail/pdf.service'
import { CertificateService } from '../certificate/certificate.service'
import { MailService } from '../mail/mail.service'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01equipment_information.dto'
import { EnviromentalConditionsNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01enviromental_condition.dto'
import { EnvironmentalConditionsNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01enviromental_condition.entity'
import { EccentricityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01eccentricity_test.dto'
import { RepeatabilityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01repeatability_test.dto'
import { LinearityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01linearity_test.dto'
import { ActivitiesService } from '../activities/activities.service'
import { PatternsService } from '../patterns/patterns.service'

import * as path from 'path'
import * as fs from 'fs'
import * as XlsxPopulate from 'xlsx-populate'
import { exec } from 'child_process'
import { UnitOfMeasurementNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01unitOfMeasurement.dto'
import { formatDate } from 'src/utils/formatDate'
import { MethodsService } from './methods.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode } from 'src/utils/generateCertCode'
import {
  convertToValidNumber,
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'
import { DescriptionPatternNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/description_pattern.entity'
import { DescriptionPatternB01Dto } from './dto/NI_MCIT_B_01/description_pattern.dto'

@Injectable()
export class NI_MCIT_B_01Service {
  constructor(
    private readonly DataSource: DataSource,
    @InjectRepository(NI_MCIT_B_01)
    private readonly NI_MCIT_B_01Repository: Repository<NI_MCIT_B_01>,
    @InjectRepository(EquipmentInformationNI_MCIT_B_01)
    private readonly EquipmentInformationNI_MCIT_B_01Repository: Repository<EquipmentInformationNI_MCIT_B_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_B_01)
    private readonly EnviromentalConditionsNI_MCIT_B_01Repository: Repository<EnvironmentalConditionsNI_MCIT_B_01>,
    @InjectRepository(EccentricityTestNI_MCIT_B_01)
    private readonly EccentricityTestNI_MCIT_B_01Repository: Repository<EccentricityTestNI_MCIT_B_01>,
    @InjectRepository(RepeatabilityTestNI_MCIT_B_01)
    private readonly RepeatabilityTestNI_MCIT_B_01Repository: Repository<RepeatabilityTestNI_MCIT_B_01>,
    @InjectRepository(LinearityTestNI_MCIT_B_01)
    private readonly LinearityTestNI_MCIT_B_01Repository: Repository<LinearityTestNI_MCIT_B_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_B_01)
    private readonly descriptionPatternNI_MCIT_B_01Repository: Repository<DescriptionPatternNI_MCIT_B_01>,

    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,

    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,

    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,

    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,

    @Inject(forwardRef(() => PatternsService))
    private readonly patternsService: PatternsService,

    @Inject(forwardRef(() => MethodsService))
    private readonly methodService: MethodsService,
  ) {}

  async create() {
    try {
      const methodNI_MCIT_B_01 = this.NI_MCIT_B_01Repository.create()
      const method = await this.NI_MCIT_B_01Repository.save(methodNI_MCIT_B_01)
      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_B_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_B_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInfomationB01(
    equipment: EquipmentInformationNI_MCIT_B_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El Metodo no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.EquipmentInformationNI_MCIT_B_01Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        equipment.date = new Date().toISOString()
        const newEquipment =
          this.EquipmentInformationNI_MCIT_B_01Repository.create(equipment)
        method.equipment_information = newEquipment
      }

      try {
        await this.DataSource.transaction(async (manager) => {
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
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async enviromentalConditionB01(
    enviromentalConditions: EnviromentalConditionsNI_MCIT_B_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions'],
      })

      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const existingEnviromentalCondition = method.environmental_conditions

      if (existingEnviromentalCondition) {
        this.EnviromentalConditionsNI_MCIT_B_01Repository.merge(
          existingEnviromentalCondition,
          enviromentalConditions,
        )
      } else {
        const newEnviromentalCondition =
          this.EnviromentalConditionsNI_MCIT_B_01Repository.create(
            enviromentalConditions,
          )
        method.environmental_conditions = newEnviromentalCondition
      }

      try {
        await this.DataSource.transaction(async (manager) => {
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
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async eccentricityTestB01(
    eccentricityTest: EccentricityTestNI_MCIT_B_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['eccentricity_test'],
      })

      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const existingEccentricityTest = method.eccentricity_test

      if (existingEccentricityTest) {
        this.EccentricityTestNI_MCIT_B_01Repository.merge(
          existingEccentricityTest,
          eccentricityTest,
        )
      } else {
        const newEccentricityTest =
          this.EccentricityTestNI_MCIT_B_01Repository.create(eccentricityTest)
        method.eccentricity_test = newEccentricityTest
      }

      try {
        await this.DataSource.transaction(async (manager) => {
          await manager.save(method.eccentricity_test)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

          await manager.save(method)
        })
        return handleOK(method.eccentricity_test)
      } catch (error) {
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async repeatabilityTestB01(
    repeatabilityTest: RepeatabilityTestNI_MCIT_B_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['repeatability_test'],
      })

      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const existingRepeatabilityTest = method.repeatability_test

      if (existingRepeatabilityTest) {
        this.RepeatabilityTestNI_MCIT_B_01Repository.merge(
          existingRepeatabilityTest,
          repeatabilityTest,
        )
      } else {
        const newRepeatabilityTest =
          this.RepeatabilityTestNI_MCIT_B_01Repository.create(repeatabilityTest)
        method.repeatability_test = newRepeatabilityTest
      }

      try {
        await this.DataSource.transaction(async (manager) => {
          await manager.save(method.repeatability_test)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

          await manager.save(method)
        })
        return handleOK(method.repeatability_test)
      } catch (error) {
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async linearityTestB01(
    linearityTest: LinearityTestNI_MCIT_B_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['linearity_test'],
      })

      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const existingLinearityTest = method.linearity_test

      if (existingLinearityTest) {
        this.LinearityTestNI_MCIT_B_01Repository.merge(
          existingLinearityTest,
          linearityTest,
        )
      } else {
        const newLinearityTest =
          this.LinearityTestNI_MCIT_B_01Repository.create(linearityTest)
        method.linearity_test = newLinearityTest
      }

      try {
        await this.DataSource.transaction(async (manager) => {
          await manager.save(method.linearity_test)

          if (increase) {
            method.modification_number =
              method.modification_number === null
                ? 1
                : method.modification_number + 1
          }

          await manager.save(method)
        })
        return handleOK(method.linearity_test)
      } catch (error) {
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async descriptionPattern(
    descriptionPattern: DescriptionPatternB01Dto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_B_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_B_01Repository.create(
            descriptionPattern,
          )
        method.description_pattern = newDescriptionPattern
      }

      await this.DataSource.transaction(async (manager) => {
        await manager.save(method.description_pattern)

        method.status = 'done'

        if (increase) {
          method.modification_number =
            method.modification_number === null
              ? 1
              : method.modification_number + 1
        }

        await manager.save(method)
      })

      await this.generateCertificateCodeToMethod(method.id)

      await this.activitiesService.updateActivityProgress(activityId)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generateCertificateData({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_B_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'eccentricity_test',
        'repeatability_test',
        'linearity_test',
      ],
    })

    if (!method) {
      return handleInternalServerError('El metodo no existe')
    }
    const dataActivity =
      await this.activitiesService.getActivitiesByID(activityID)

    if (!dataActivity) {
      return handleInternalServerError('La actividad no existe')
    }

    const filePath = path.join(
      __dirname,
      `../mail/templates/excels/ni_mcit_b_01.xlsx`,
    )

    try {
      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      if (!workbook) {
        return handleInternalServerError('Error al abrir el archivo')
      }

      const sheetGeneral = workbook.sheet('General')
      const sheetCalibración = workbook.sheet('Calibración')

      //informacion de equipo
      const equipment = method.equipment_information
      sheetGeneral.cell('F7').value(equipment.device)
      sheetGeneral.cell('F8').value(equipment.maker)
      sheetGeneral.cell('F9').value(equipment.model)
      sheetGeneral.cell('F10').value(equipment.serial_number)
      sheetGeneral.cell('F12').value(equipment.measurement_range)
      sheetGeneral
        .cell('F14')
        .value(`${equipment.resolution} ${equipment.unit}`)

      //environmental conditions
      const environmentalConditions = method.environmental_conditions
      sheetGeneral.cell('I3').value(method.calibration_location)
      sheetGeneral.cell('I4').value(environmentalConditions.equipment_used)
      sheetGeneral.cell('I6').value(environmentalConditions.cycles.ta.initial)
      sheetGeneral.cell('I7').value(environmentalConditions.cycles.ta.end)
      sheetGeneral.cell('I11').value(environmentalConditions.cycles.hr.initial)
      sheetGeneral.cell('I12').value(environmentalConditions.cycles.hr.end)
      sheetGeneral.cell('I16').value(environmentalConditions.cycles.hPa.initial)
      sheetGeneral.cell('I17').value(environmentalConditions.cycles.hPa.end)

      //linearity test
      const linearityTest = method.linearity_test
      for (let i = 0; i < linearityTest.linearity_test.length; i++) {
        const test = linearityTest.linearity_test[i]
        if (test.point === 1) {
          sheetCalibración.cell('D24').value(test.indicationIL)
          sheetCalibración.cell('E24').value(test.noLoadInfdication)
          const punto = 'M'
          let fila1 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila1}`).value(value)
            fila1++
          })
        }

        if (test.point === 2) {
          sheetCalibración.cell('D25').value(test.indicationIL)
          sheetCalibración.cell('E25').value(test.noLoadInfdication)
          const punto = 'T'
          let fila2 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila2}`).value(value)
            fila2++
          })
        }

        if (test.point === 3) {
          sheetCalibración.cell('D26').value(test.indicationIL)
          sheetCalibración.cell('E26').value(test.noLoadInfdication)
          const punto = 'AA'
          let fila3 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila3}`).value(value)
            fila3++
          })
        }

        if (test.point === 4) {
          sheetCalibración.cell('D27').value(test.indicationIL)
          sheetCalibración.cell('E27').value(test.noLoadInfdication)
          const punto = 'AH'
          let fila4 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila4}`).value(value)
            fila4++
          })
        }

        if (test.point === 5) {
          sheetCalibración.cell('D28').value(test.indicationIL)
          sheetCalibración.cell('E28').value(test.noLoadInfdication)
          const punto = 'AO'
          let fila5 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila5}`).value(value)
            fila5++
          })
        }

        if (test.point === 6) {
          sheetCalibración.cell('D29').value(test.indicationIL)
          sheetCalibración.cell('E29').value(test.noLoadInfdication)
          const punto = 'AV'
          let fila6 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila6}`).value(value)
            fila6++
          })
        }

        if (test.point === 7) {
          sheetCalibración.cell('D30').value(test.indicationIL)
          sheetCalibración.cell('E30').value(test.noLoadInfdication)
          const punto = 'BC'
          let fila7 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila7}`).value(value)
            fila7++
          })
        }

        if (test.point === 8) {
          sheetCalibración.cell('D31').value(test.indicationIL)
          sheetCalibración.cell('E31').value(test.noLoadInfdication)
          const punto = 'BI'
          let fila8 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila8}`).value(value)
            fila8++
          })
        }

        if (test.point === 9) {
          sheetCalibración.cell('D32').value(test.indicationIL)
          sheetCalibración.cell('E32').value(test.noLoadInfdication)
          const punto = 'BQ'
          let fila9 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila9}`).value(value)
            fila9++
          })
        }

        if (test.point === 10) {
          sheetCalibración.cell('D33').value(test.indicationIL)
          sheetCalibración.cell('E33').value(test.noLoadInfdication)
          const punto = 'BX'
          let fila10 = 5
          Object.entries(test.pointsComposition).forEach(([key, value]) => {
            sheetCalibración.cell(`${punto}${fila10}`).value(value)
            fila10++
          })
        }
      }

      //repeatibility test
      if (method.repeatability_test !== null) {
        sheetCalibración
          .cell('C37')
          .value(method.repeatability_test.pointNumber)
        let FilaR = 40

        for (
          let i = 0;
          i < method.repeatability_test.repeatability_test.length;
          i++
        ) {
          const test = method.repeatability_test.repeatability_test[i]
          sheetCalibración.cell(`E${FilaR}`).value(test.indicationIL)
          sheetCalibración.cell(`F${FilaR}`).value(test.noLoadInfdication)
          FilaR++
        }
      }

      //eccentricity test
      if (method.eccentricity_test !== null) {
        sheetCalibración.cell('C48').value(method.eccentricity_test.pointNumber)
        let FilaE = 51
        for (
          let i = 0;
          i < method.eccentricity_test.eccentricity_test.length;
          i++
        ) {
          const test = method.eccentricity_test.eccentricity_test[i]
          sheetCalibración.cell(`E${FilaE}`).value(test.indicationIL)
          sheetCalibración.cell(`F${FilaE}`).value(test.noLoadInfdication)
          FilaE++
        }
      }

      sheetCalibración.cell('C15').value(method.equipment_information.unit)
      sheetCalibración
        .cell('C16')
        .value(method.equipment_information.resolution)

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return await this.getCertificateResult(methodID, activityID)

      //fin de try
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  //resultados para generar PDF
  async getCertificateResult(methodID: number, activityID: number) {
    const method = await this.NI_MCIT_B_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'environmental_conditions',
        'eccentricity_test',
        'repeatability_test',
        'linearity_test',
        'description_pattern',
      ],
    })
    try {
      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const {
        equipment_information,
        environmental_conditions,
        eccentricity_test,
        repeatability_test,
        linearity_test,
      } = method

      if (
        !equipment_information ||
        !environmental_conditions ||
        !eccentricity_test ||
        !repeatability_test ||
        !linearity_test
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
      const activity = dataActivity.data
      const respWorkBook = await XlsxPopulate.fromFileAsync(
        method.certificate_url,
      )

      const sheetByUnit = [
        {
          unit: 'kg',
          sheetName: '+ONA_lb&kg',
        },
        {
          unit: 'lb',
          sheetName: '+ONA_kg&lb',
        },
        {
          unit: 'g',
          sheetName: '+ONA_kg',
        },
      ]

      const sheetResultB01 = respWorkBook.sheet(
        sheetByUnit.find((sheet) => sheet.unit === equipment_information.unit)
          .sheetName,
      )
      //resultados
      // Resultados

      const reference_mass = []
      const equipment_indication = []
      const error = []
      const repeatability = []
      const maximum_eccentricity = []
      const uncertainty = []

      for (let i = 30; i <= 37; i++) {
        let reference_massValue = sheetResultB01.cell(`B${i}`).value()
        let equipment_indicationValue = sheetResultB01.cell(`D${i}`).value()
        let errorValue = sheetResultB01.cell(`F${i}`).value()
        let expanded_uncertaintyValue = sheetResultB01.cell(`L${i}`).value()

        reference_mass.push(
          formatNumberCertification(
            convertToValidNumber(reference_massValue),
            countDecimals(equipment_information.resolution),
          ),
        )

        equipment_indication.push(
          formatNumberCertification(
            convertToValidNumber(equipment_indicationValue),
            countDecimals(equipment_information.resolution),
          ),
        )

        error.push(
          formatNumberCertification(
            convertToValidNumber(errorValue),
            countDecimals(equipment_information.resolution),
          ),
        )

        uncertainty.push(
          this.methodService.getSignificantFigure(expanded_uncertaintyValue),
        )

        // Solo agregar repeatability y maximum_eccentricity en las filas 30 y 31
        let repeatabilityValue = sheetResultB01.cell(`H${i}`).value()
        let maximum_eccentricityValue = sheetResultB01.cell(`J${i}`).value()
        if (i === 30 || i === 31) {
          repeatability.push(
            formatNumberCertification(
              repeatabilityValue,
              countDecimals(equipment_information.resolution),
            ),
          )
          maximum_eccentricity.push(
            formatNumberCertification(
              maximum_eccentricityValue,
              countDecimals(equipment_information.resolution),
            ),
          )
        }
      }

      let result_tests_lb = []

      if (method.equipment_information.unit === 'lb') {
        for (let i = 45; i <= 52; i++) {
          let reference_mass = sheetResultB01.cell(`B${i}`).value()
          let equipment_indication = sheetResultB01.cell(`D${i}`).value()
          let error = sheetResultB01.cell(`F${i}`).value()
          let expanded_uncertainty = sheetResultB01.cell(`L${i}`).value()
          let repeatability =
            i === 45 || i === 46 ? sheetResultB01.cell(`H${i}`).value() : null
          let maximum_eccentricity =
            i === 45 || i === 46 ? sheetResultB01.cell(`J${i}`).value() : null

          let result_lb = {
            reference_mass: formatNumberCertification(
              reference_mass,
              countDecimals(equipment_information.resolution),
            ),
            equipment_indication: formatNumberCertification(
              equipment_indication,
              countDecimals(equipment_information.resolution),
            ),
            error: formatNumberCertification(
              error,
              countDecimals(equipment_information.resolution),
            ),
            uncertainty:
              expanded_uncertainty !== undefined
                ? this.methodService.getSignificantFigure(expanded_uncertainty)
                : 0,
          }

          if (repeatability !== null && maximum_eccentricity !== null) {
            result_lb['repeatability'] = formatNumberCertification(
              repeatability,
              countDecimals(equipment_information.resolution),
            )
            result_lb['maximum_eccentricity'] = formatNumberCertification(
              maximum_eccentricity,
              countDecimals(equipment_information.resolution),
            )
          }

          result_tests_lb.push(result_lb)
        }
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = respWorkBook.sheet('CMC')

      for (let i = 0; i <= 12; i++) {
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

      const description_pattern = []

      const equipment_environmental_conditions =
        await this.patternsService.findByCodeAndMethod(
          method.environmental_conditions.equipment_used,
          'NI-MCIT-B-01',
        )

      if (equipment_environmental_conditions.success) {
        description_pattern.push(equipment_environmental_conditions.data)
      }

      for (let i = 0; i < method.linearity_test.linearity_test.length; i++) {
        const test = method.linearity_test.linearity_test[i]

        for (let j = 0; j < test.pointsComposition.length; j++) {
          const point = test.pointsComposition[j]
          const response = await this.patternsService.findByCodeAndMethod(
            point.point,
            'NI-MCIT-B-01',
          )

          if (response.success) {
            description_pattern.push(response.data)
          }
        }
      }

      const result_test = {
        reference_mass,
        equipment_indication,
        error,
        uncertainty: this.methodService.formatUncertainty(
          this.formatUncertaintyWithCMC(uncertainty, CMC),
        ),
        repeatability,
        maximum_eccentricity,
      }

      const certificate = {
        pattern: 'NI-MCIT-B-01',
        email: activity.quote_request.client.email,
        optionsCMCOnCertificate: method.optionsCMCOnCertificate,
        equipment_information: {
          certification_code:
            formatCertCode(
              method.certificate_code,
              method.modification_number,
            ) || '---',
          service_code: activity.quote_request.no,
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(method.equipment_information.date),
          object_calibrated: equipment_information.device || '---',
          maker: equipment_information.maker || '---',
          serial_number: equipment_information.serial_number || '---',
          model: equipment_information.model || '---',
          measurement_range: equipment_information.measurement_range || '---',
          resolution:
            `${formatSameNumberCertification(equipment_information.resolution)} ${equipment_information.unit}` ||
            '---',
          identification_code: equipment_information.code || '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
          code: equipment_information?.code || '---',
        },
        calibration_results: {
          result_test,
          result_tests_lb,
        },
        environmental_conditions: {
          temperature: `Temperatura ( ${formatSameNumberCertification(sheetResultB01.cell('D64').value())} ± ${formatSameNumberCertification(sheetResultB01.cell('F64').value())} ) °C`,
          atmospheric_pressure: `Presión atmosférica ( ${formatSameNumberCertification(Math.round(sheetResultB01.cell('J64').value()))} ± ${formatSameNumberCertification(Math.round(sheetResultB01.cell('L64').value()))} ) hPa`,
          humidity: `Humedad ( ${formatSameNumberCertification(sheetResultB01.cell('D65').value())} ± ${formatSameNumberCertification(sheetResultB01.cell('F65').value())} ) %`,
          stabilzation: environmental_conditions.stabilization_site,
          time:
            environmental_conditions.time.hours +
            ' horas ' +
            environmental_conditions.time.minute +
            ' minutos',
        },
        description_pattern,
        creditable: method.description_pattern.creditable,
        observations: `
          ${method.description_pattern.observation || ''}
          Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
          La corrección corresponde al valor del patrón menos las indicación del equipo.
          La indicación de temperatura de referencia y del equipo, corresponden al promedio de 3 mediciones.
          El factor de conversión al SI corresponde a T(K) = t(°C) + 273,15
          De acuerdo a lo establecido en NTON 07-004-01 Norma Metrológica del Sistema Internacional de Unidades (SI).
          Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes
          especificadas al momento de realizar el servicio.
          Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se
          reproduce en su totalidad.`,
        withLb: method.equipment_information.unit === 'lb' ? true : false,
      }

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error)
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
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodID },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'eccentricity_test',
          'repeatability_test',
          'linearity_test',
          'description_pattern',
        ],
      })
      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      let certificateData: any
      if (!fs.existsSync(method.certificate_url) || generatePDF) {
        certificateData = await this.generateCertificateData({
          activityID,
          methodID,
        })
      } else {
        certificateData = await this.getCertificateResult(methodID, activityID)
      }

      certificateData.data.calibration_results.result_test =
        certificateData.data.calibration_results.result_test.reference_mass.map(
          (reference_mass, index) => {
            return {
              reference_mass,
              equipment_indication:
                certificateData.data.calibration_results.result_test
                  .equipment_indication[index],
              error:
                certificateData.data.calibration_results.result_test.error[
                  index
                ],
              uncertainty:
                certificateData.data.calibration_results.result_test
                  .uncertainty[index],
              repeatability:
                certificateData.data.calibration_results.result_test
                  .repeatability[index],
              maximum_eccentricity:
                certificateData.data.calibration_results.result_test
                  .maximum_eccentricity[index],
            }
          },
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/b-01.hbs',
        certificateData.data,
      )
      if (!PDF) {
        return handleInternalServerError('Error al generar el PDF')
      }

      return handleOK({
        pdf: PDF,
        client_email: certificateData.data.email,
        fileName: `Certificado-${certificateData.data.equipment_information.object_calibrated}-${certificateData.data.equipment_information.certification_code}.pdf`,
        clientName: certificateData.data.equipment_information.applicant,
      })
    } catch (error) {
      return handleInternalServerError(error)
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
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodID },
      })

      const lastMethod = await this.NI_MCIT_B_01Repository.createQueryBuilder(
        'NI_MCIT_B_01',
      )
        .orderBy('NI_MCIT_B_01.record_index', 'DESC')
        .getOne()

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      await this.DataSource.transaction(async (manager) => {
        method.record_index =
          !lastMethod ||
          lastMethod.created_at.getFullYear() !==
            method.created_at.getFullYear()
            ? 1
            : lastMethod.record_index + 1

        await manager.save(method)
      })

      const certificate = await this.certificateService.create(
        'B',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      return handleOK(await this.NI_MCIT_B_01Repository.save(method))
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

  async getMethodById(methodId: number) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: [
          'equipment_information',
          'environmental_conditions',
          'linearity_test',
          'repeatability_test',
          'eccentricity_test',
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
}
