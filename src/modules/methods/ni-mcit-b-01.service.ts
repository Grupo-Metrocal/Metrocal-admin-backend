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
import { Activity } from '../activities/entities/activities.entity'
import { PatternsService } from '../patterns/patterns.service'

import * as path from 'path'
import * as fs from 'fs'
import * as XlsxPopulate from 'xlsx-populate'
import { exec } from 'child_process'
import { UnitOfMeasurementNI_MCIT_B_01 } from './entities/NI_MCIT_B_01/steps/b01unitOfMeasurement.entity'
import { UnitOfMeasurementNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01unitOfMeasurement.dto'
import { generateServiceCodeToMethod } from 'src/utils/codeGenerator'
import { formatDate } from 'src/utils/formatDate'
import { MethodsService } from './methods.service'
import { Methods } from './entities/method.entity'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode } from 'src/utils/generateCertCode'
import { time } from 'console'

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
    @InjectRepository(UnitOfMeasurementNI_MCIT_B_01)
    private readonly UnitOfMeasurementNI_MCIT_B_01Repository: Repository<UnitOfMeasurementNI_MCIT_B_01>,

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
        this.DataSource.transaction(async (manager) => {
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
        this.DataSource.transaction(async (manager) => {
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
        this.DataSource.transaction(async (manager) => {
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
        this.DataSource.transaction(async (manager) => {
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
        this.DataSource.transaction(async (manager) => {
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

  async unitOfMeasurementB01(
    unitOfMeasurement: UnitOfMeasurementNI_MCIT_B_01Dto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_B_01Repository.findOne({
        where: { id: methodId },
        relations: ['unit_of_measurement'],
      })

      if (!method) {
        return handleInternalServerError('El metodo no existe')
      }

      const existingUnitOfMeasurement = method.unit_of_measurement

      if (existingUnitOfMeasurement) {
        this.UnitOfMeasurementNI_MCIT_B_01Repository.merge(
          existingUnitOfMeasurement,
          unitOfMeasurement,
        )
      } else {
        const newUnitOfMeasurement =
          this.UnitOfMeasurementNI_MCIT_B_01Repository.create(unitOfMeasurement)
        method.unit_of_measurement = newUnitOfMeasurement
      }

      try {
        await this.DataSource.transaction(async (manager) => {
          await manager.save(method.unit_of_measurement)

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

        return handleOK(method.unit_of_measurement)
      } catch (error) {
        return handleInternalServerError(error)
      }
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async generateCertificateB01({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    try {
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

      let respuesta = await this.generateCertificateData({
        activityID,
        methodID,
      })

      return handleOK('Certificado generado correctamente')
    } catch (error) {
      return handleInternalServerError(error)
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
        'unit_of_measurement',
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
      sheetGeneral.cell('F14').value(equipment.resolution)

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
        const repeatibilityTest = method.repeatability_test
        sheetCalibración.cell('C37').value(repeatibilityTest.pointNumber)
        let FilaR = 40
        for (
          let i = FilaR;
          i <= repeatibilityTest.repeatability_test.length;
          i++
        ) {
          const test = repeatibilityTest.repeatability_test[i]
          sheetCalibración.cell(`E${FilaR}`).value(test.indicationIL)
          sheetCalibración.cell(`F${FilaR}`).value(test.noLoadInfdication)
          FilaR++
        }
      }

      //eccentricity test
      if (method.eccentricity_test !== null) {
        const eccentricityTest = method.eccentricity_test
        sheetCalibración.cell('C48').value(eccentricityTest.pointNumber)
        let FilaE = 51
        for (
          let i = FilaE;
          i <= eccentricityTest.eccentricity_test.length;
          i++
        ) {
          const test = eccentricityTest.eccentricity_test[i]
          sheetCalibración.cell(`E${FilaE}`).value(test.indicationIL)
          sheetCalibración.cell(`F${FilaE}`).value(test.noLoadInfdication)
          FilaE++
        }
      }

      sheetCalibración.cell('C15').value(method.unit_of_measurement.measure)
      sheetCalibración.cell('C16').value(method.unit_of_measurement.resolution)

      workbook.toFileAsync(method.certificate_url)
      return this.getCertificateResult(methodID, activityID)

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
        'unit_of_measurement',
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
        unit_of_measurement,
      } = method

      if (
        !equipment_information ||
        !environmental_conditions ||
        !eccentricity_test ||
        !repeatability_test ||
        !linearity_test ||
        !unit_of_measurement
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

      let result_test = []

      const sheetResultONAlbkg = respWorkBook.sheet('+ONA_lb&kg')
      //resultados
      // Resultados
      for (let i = 30; i <= 37; i++) {
        let result = {
          reference_mass: sheetResultONAlbkg.cell(`B${i}`).value(),
          equipment_indication: sheetResultONAlbkg.cell(`D${i}`).value(),
          error: sheetResultONAlbkg.cell(`F${i}`).value(),
          expanded_uncertainty: sheetResultONAlbkg.cell(`L${i}`).value(),
        }

        // Solo agregar repeatability y maximum_eccentricity en las filas 30 y 31
        if (i === 30 || i === 31) {
          result['repeatability'] = sheetResultONAlbkg.cell(`H${i}`).value()

          result['maximum_eccentricity'] = sheetResultONAlbkg
            .cell(`J${i}`)
            .value()
        }

        result_test.push(result)
      }
      //result data
      let result_tests_lb = []

      if (method.unit_of_measurement.measure === 'lb') {
        for (let i = 45; i <= 52; i++) {
          let reference_mass = sheetResultONAlbkg.cell(`B${i}`).value()
          let equipment_indication = sheetResultONAlbkg.cell(`D${i}`).value()
          let error = sheetResultONAlbkg.cell(`F${i}`).value()
          let expanded_uncertainty = sheetResultONAlbkg.cell(`L${i}`).value()
          let repeatability =
            i === 45 || i === 46
              ? sheetResultONAlbkg.cell(`H${i}`).value()
              : null
          let maximum_eccentricity =
            i === 45 || i === 46
              ? sheetResultONAlbkg.cell(`J${i}`).value()
              : null

          let result_lb = {
            reference_mass:
              reference_mass !== undefined ? reference_mass.toString() : '',
            equipment_indication:
              equipment_indication !== undefined
                ? equipment_indication.toString()
                : '',
            error: error !== undefined ? error.toString() : '',
            expanded_uncertainty:
              expanded_uncertainty !== undefined
                ? expanded_uncertainty.toString()
                : '',
          }

          if (repeatability !== null && maximum_eccentricity !== null) {
            result_lb['repeatability'] =
              repeatability !== undefined ? repeatability.toString() : ''
            result_lb['maximum_eccentricity'] =
              maximum_eccentricity !== undefined
                ? maximum_eccentricity.toString()
                : ''
          }

          result_tests_lb.push(result_lb)
        }
      }
      //descripcion patron
      const descriptionPatron = await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.equipment_used,
        'NI-MCIT-B-01',
      )

      console.log(
        `Temperatura ( ${sheetResultONAlbkg.cell('D55').value()} ± ${sheetResultONAlbkg.cell('F55').value()} ) °C`,
      )

      const certificate = {
        pattern: 'NI_MCIT_B_01',
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
          resolution: equipment_information.resolution || '---',
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
          temperature: `Temperatura ( ${sheetResultONAlbkg.cell('D55').value()} ± ${sheetResultONAlbkg.cell('F55').value()} ) °C`,
          atmospheric_pressure: `Presión atmosférica ( ${sheetResultONAlbkg.cell('J55').value()} ± ${sheetResultONAlbkg.cell('L55').value()} ) hPa`,
          humidity: `Humedad ( ${sheetResultONAlbkg.cell('D56').value()} ± ${sheetResultONAlbkg.cell('F56').value()} ) %`,
          stabilzation: environmental_conditions.stabilization_site,
          time:
            environmental_conditions.time.hours +
            ' horas ' +
            environmental_conditions.time.minute +
            ' minutos',
        },
        description_pattern: [descriptionPatron.data],
        creditable: method.equipment_information.acredited,
        observations: `
          Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
          La corrección corresponde al valor del patrón menos las indicación del equipo.
          La indicación de temperatura de referencia y del equipo, corresponden al promedio de 3 mediciones.
          El factor de conversión al SI corresponde a T(K) = t(°C) + 273,15
          De acuerdo a lo establecido en NTON 07-004-01 Norma Metrológica del Sistema Internacional de Unidades (SI).
          Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes
          especificadas al momento de realizar el servicio.
          Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se
          reproduce en su totalidad.`,
        withLb: method.unit_of_measurement.measure === 'lb' ? true : false,
      }

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error)
    }
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
          'unit_of_measurement',
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

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      if (method.certificate_code) {
        return handleOK('El método ya tiene un código de certificado')
      }

      const certificate = await this.certificateService.create('B', methodID)

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

      const { pdf, client_email } = data.data

      await this.mailService.sendMailCertification({
        user: client_email,
        pdf,
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
          'unit_of_measurement',
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
