import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { NI_MCIT_P_01 } from './entities/NI_MCIT_P_01/NI_MCIT_P_01.entity'
import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'
import { CalibrationResultsDto } from './dto/NI_MCIT_P_01/calibraion_results.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_P_01/description_pattern.dto'
import { ActivitiesService } from '../activities/activities.service'
import { Activity } from '../activities/entities/activities.entity'

// entities
import { EquipmentInformationNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/environmental_conditions.entity'
import { CalibrationResultsNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/calibration_results.entity'
import { DescriptionPatternNI_MCIT_P_01 } from './entities/NI_MCIT_P_01/steps/description_pattern.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { formatDate } from 'src/utils/formatDate'
import { CertificateService } from '../certificate/certificate.service'
import { PdfService } from '../mail/pdf.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { MailService } from '../mail/mail.service'
import { PatternsService } from '../patterns/patterns.service'
import { MethodsService } from './methods.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode } from 'src/utils/generateCertCode'
import {
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { conversionTableToKPA } from 'src/common/converionTable'
import { countDecimals } from 'src/utils/countDecimal'

@Injectable()
export class NI_MCIT_P_01Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_P_01)
    private readonly NI_MCIT_P_01Repository: Repository<NI_MCIT_P_01>,

    @InjectRepository(EquipmentInformationNI_MCIT_P_01)
    private readonly EquipmentInformationNI_MCIT_P_01Repository: Repository<EquipmentInformationNI_MCIT_P_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_P_01)
    private readonly EnvironmentalConditionsNI_MCIT_P_01Repository: Repository<EnvironmentalConditionsNI_MCIT_P_01>,
    @InjectRepository(CalibrationResultsNI_MCIT_P_01)
    private readonly CalibrationResultsNI_MCIT_P_01Repository: Repository<CalibrationResultsNI_MCIT_P_01>,
    @InjectRepository(DescriptionPatternNI_MCIT_P_01)
    private readonly DescriptionPatternNI_MCIT_P_01Repository: Repository<DescriptionPatternNI_MCIT_P_01>,

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
      const newNI_MCIT_P_01 = this.NI_MCIT_P_01Repository.create()
      const method = await this.NI_MCIT_P_01Repository.save(newNI_MCIT_P_01)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationDto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEquipment = method.equipment_information

    if (existingEquipment) {
      this.EquipmentInformationNI_MCIT_P_01Repository.merge(
        existingEquipment,
        equipment,
      )
    } else {
      const newEquipment =
        this.EquipmentInformationNI_MCIT_P_01Repository.create(equipment)
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

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_P_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsDto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.EnvironmentalConditionsNI_MCIT_P_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.EnvironmentalConditionsNI_MCIT_P_01Repository.create(
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
    calibrationResults: CalibrationResultsDto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.CalibrationResultsNI_MCIT_P_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.CalibrationResultsNI_MCIT_P_01Repository.create(calibrationResults)
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

  async descriptionPattern(
    descriptionPattern: DescriptionPatternDto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.DescriptionPatternNI_MCIT_P_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.DescriptionPatternNI_MCIT_P_01Repository.create(
            descriptionPattern,
          )
        method.description_pattern = newDescriptionPattern
      }

      await this.dataSource.transaction(async (manager) => {
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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'equipment_information',
        'calibration_results',
        'description_pattern',
        'environmental_conditions',
      ],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    // const equipment = activity.quote_request.equipment_quote_request.filter(
    //   async (equipment) => {
    //     const stack = await this.methodsService.getMethodsID(equipment.id)

    //     // IS BAD, FIX IT
    //     if (stack.success) {
    //       return stack.data.some((method) => method.id === methodID)
    //     }
    //   },
    // )

    // if (equipment.length === 0) {
    //   return handleInternalServerError(
    //     'El método no existe en la actividad seleccionada',
    //   )
    // }

    try {
      let filePath = ''

      if (method.description_pattern.pattern === 'NI-MCPP-05') {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01_5.xlsx',
        )
      } else if (method.description_pattern.pattern === 'NI-MCPP-06') {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01_06.xlsx',
        )
      } else {
        filePath = path.join(
          __dirname,
          '../mail/templates/excels/ni_mcit_p_01.xlsx',
        )
      }

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      if (!workbook) {
        return handleInternalServerError('El archivo no existe')
      }

      // enter method selected
      const sheetCalibration = workbook.sheet('Calibración')
      const sheetGeneral = workbook.sheet('General')

      sheetCalibration.cell('I3').value(method.description_pattern.pattern)

      sheetCalibration
        .cell('E10')
        .value(method.calibration_results.results.length)

      sheetGeneral.cell('F13').value(method.equipment_information.range_min)

      sheetGeneral.cell('F14').value(method.equipment_information.range_max)

      sheetGeneral.cell('F15').value(method.equipment_information.resolution)

      sheetGeneral.cell('F16').value(method.equipment_information.unit)

      // enter environmental conditions

      for (const result of method.environmental_conditions.cycles) {
        const rowOffset = (result.cycle_number - 1) * 2

        sheetGeneral.cell(`P${3 + rowOffset}`).value(result.ta.tac.initial)
        sheetGeneral.cell(`P${4 + rowOffset}`).value(result.ta.tac.final)

        sheetGeneral.cell(`Q${3 + rowOffset}`).value(result.ta.hrp.initial)
        sheetGeneral.cell(`Q${4 + rowOffset}`).value(result.ta.hrp.final)

        sheetGeneral.cell(`R${3 + rowOffset}`).value(result.hPa.pa.initial)
        sheetGeneral.cell(`R${4 + rowOffset}`).value(result.hPa.pa.final)
      }

      sheetGeneral
        .cell('I4')
        .value(method.environmental_conditions.cycles[0].ta.equipement)

      sheetGeneral
        .cell('J21')
        .value(method.environmental_conditions.cycles[0].hPa.equipement)

      // enter calibration result
      for (const result of method.calibration_results.results) {
        if (result.cicle_number === 1) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 1) {
              sheetCalibration
                .cell(`C${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              sheetCalibration
                .cell(`D${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              sheetCalibration
                .cell(`E${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              sheetCalibration
                .cell(`F${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }

        if (result.cicle_number === 2) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 2) {
              sheetCalibration
                .cell(`G${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              sheetCalibration
                .cell(`H${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              sheetCalibration
                .cell(`I${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              sheetCalibration
                .cell(`J${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }

        if (result.cicle_number === 3) {
          for (const [
            index,
            calibrationFactor,
          ] of result.calibration_factor.entries()) {
            if (result.cicle_number === 3) {
              sheetCalibration
                .cell(`K${15 + index}`)
                .value(Number(calibrationFactor.upward.pattern))

              sheetCalibration
                .cell(`L${15 + index}`)
                .value(Number(calibrationFactor.upward.equipment))

              sheetCalibration
                .cell(`M${15 + index}`)
                .value(Number(calibrationFactor.downward.pattern))

              sheetCalibration
                .cell(`N${15 + index}`)
                .value(Number(calibrationFactor.downward.equipment))
            }
          }
        }
      }
      workbook.toFileAsync(method.certificate_url)

      await this.autoSaveExcel(method.certificate_url)

      return await this.getCertificateResult(methodID, activityID)
    } catch (error) {
      console
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    const method = await this.NI_MCIT_P_01Repository.findOne({
      where: { id: methodID },
      relations: [
        'calibration_results',
        'description_pattern',
        'environmental_conditions',
        'equipment_information',
      ],
    })

    const dataActivity =
      await this.activitiesService.getActivitiesByID(activityID)

    const { data: activity } = dataActivity as { data: Activity }

    try {
      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)
      const sheetCER = workbook.sheet('DA Unid-kPa (5 ptos)')

      let reference_pressure = []
      let equipment_indication = []
      let correction = []
      let uncertainty = []

      let reference_pressureSys = []
      let equipment_indicationSys = []
      let correctionSys = []
      let uncertaintySys = []

      for (
        let i = 0;
        i <= method.calibration_results.results[0].calibration_factor.length;
        i++
      ) {
        const pressureValue = sheetCER.cell(`D${27 + i}`).value()
        reference_pressure.push(
          typeof pressureValue === 'number'
            ? formatNumberCertification(
                Number(pressureValue.toFixed(2)),
                countDecimals(method.equipment_information.resolution),
              )
            : pressureValue,
        )

        const indicationValue = sheetCER.cell(`F${27 + i}`).value()
        equipment_indication.push(
          typeof indicationValue === 'number'
            ? formatNumberCertification(
                Number(indicationValue.toFixed(2)),
                countDecimals(method.equipment_information.resolution),
              )
            : indicationValue,
        )

        const correctionValue = sheetCER.cell(`L${27 + i}`).value()
        correction.push(
          typeof correctionValue === 'number'
            ? formatNumberCertification(
                Number(correctionValue.toFixed(2)),
                countDecimals(method.equipment_information.resolution),
              )
            : correctionValue,
        )

        const uncertaintyValue = sheetCER.cell(`R${27 + i}`).value()
        uncertainty.push(
          typeof uncertaintyValue === 'number'
            ? this.methodService.getSignificantFigure(
                Number(uncertaintyValue.toFixed(7)),
              )
            : uncertaintyValue,
        )

        const pressureSysValue = sheetCER.cell(`D${63 + i}`).value()
        reference_pressureSys.push(
          typeof pressureSysValue === 'number'
            ? formatNumberCertification(
                Number(pressureSysValue.toFixed(1)),
                countDecimals(method.equipment_information.resolution),
              )
            : pressureSysValue,
        )

        const indicationSysValue = sheetCER.cell(`F${63 + i}`).value()
        equipment_indicationSys.push(
          typeof indicationSysValue === 'number'
            ? formatNumberCertification(
                Number(indicationSysValue.toFixed(1)),
                countDecimals(method.equipment_information.resolution),
              )
            : indicationSysValue,
        )

        const correctionSysValue = sheetCER.cell(`L${63 + i}`).value()
        correctionSys.push(
          typeof correctionSysValue === 'number'
            ? formatNumberCertification(
                Number(correctionSysValue.toFixed(1)),
                countDecimals(method.equipment_information.resolution),
              )
            : correctionSysValue,
        )

        const uncertaintySysValue = sheetCER.cell(`R${63 + i}`).value()
        uncertaintySys.push(
          typeof uncertaintySysValue === 'number'
            ? this.methodService.getSignificantFigure(
                Number(uncertaintySysValue.toFixed(7)),
              )
            : uncertaintySysValue,
        )
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = workbook.sheet('CMC Presión')

      for (
        let i = 0;
        i < method.calibration_results.results[0].calibration_factor.length;
        i++
      ) {
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

      const calibration_results = {
        result: {
          reference_pressure,
          equipment_indication,
          correction,
          uncertainty: this.methodService.formatUncertainty(
            this.formatUncertaintyWithCMC(
              uncertainty,
              CMC,
              true,
              method.equipment_information.unit,
            ),
          ),
        },

        result_unid_system: {
          reference_pressure: reference_pressureSys,
          equipment_indication: equipment_indicationSys,
          correction: correctionSys,
          uncertainty: this.methodService.formatUncertainty(
            this.formatUncertaintyWithCMC(uncertaintySys, CMC, false),
          ),
        },
      }

      const ta_eq_enviromental_conditions =
        await this.patternsService.findByCodeAndMethod(
          method.environmental_conditions.cycles[0].ta.equipement,
          'NI-MCIT-P-01',
        )
      const pressurePattern = await this.patternsService.findByCodeAndMethod(
        method.description_pattern.pattern,
        'NI-MCIT-P-01',
      )

      const certificate = {
        pattern: 'NI-MCIT-P-01',
        email: activity.quote_request.client.email,
        CMC,
        optionsCMCOnCertificate: method.optionsCMCOnCertificate,
        equipment_information: {
          certification_code: formatCertCode(
            method.certificate_code,
            method.modification_number,
          ),
          service_code: activity.quote_request.no,
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(activity.updated_at.toString()),
          object_calibrated: method.equipment_information.device || '---',
          manufacturer: method.equipment_information.maker || '---',
          no_series: method.equipment_information.serial_number || '---',
          model: method.equipment_information.model || '---',
          measurement_range: `${method.equipment_information.range_min} ${method.equipment_information.unit} a ${method.equipment_information.range_max} ${method.equipment_information.unit}`,
          resolution:
            `${formatSameNumberCertification(method.equipment_information.resolution)} ${method.equipment_information.unit}` ||
            '---',
          code: method.equipment_information.code || '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        calibration_results,
        environmental_conditions: {
          atmospheric_pressure: `Presión (kPa): ${formatNumberCertification(
            sheetCER.cell('T80').value(),
          )} ± ${formatNumberCertification(Number(sheetCER.cell('W80').value()))}`,
          temperature: `Temperatura: ${formatNumberCertification(
            sheetCER.cell('E80').value(),
          )} °C ± ${formatNumberCertification(Number(Number(sheetCER.cell('G80').value()).toFixed(1)))} °C`,
          humidity: `Humedad relativa: ${formatNumberCertification(
            sheetCER.cell('E81').value(),
          )} % ± ${formatNumberCertification(sheetCER.cell('G81').value())} %`,
        },
        descriptionPattern: method.description_pattern,
        used_patterns: {
          ta_eq_enviromental_conditions: ta_eq_enviromental_conditions.data,
          pressurePattern: pressurePattern.data,
        },
        creditable: method.description_pattern.creditable,
        ta_eq_enviromental_conditions:
          method.environmental_conditions.cycles[0].ta.equipement,
        hPa_eq_enviromental_conditions:
          method.environmental_conditions.cycles[0].hPa.equipement,
        observations: `
          ${method.description_pattern.observation || ''}
          Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
          La corrección corresponde al valor del patrón menos la indicación del equipo.
          ${sheetCER.cell('A113').value()}
          Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
          Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando se reproduce en su totalidad.
          ${sheetCER.cell('A119').value()}
          De acuerdo a lo establecido en NTON 07-004-01 Norma Metrológica del Sistema Internacional de Unidades (SI).
        `,
      }

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  formatUncertaintyWithCMC(
    uncertainty: any,
    cmc: any,
    useConversionTable: boolean,
    unit?: string,
  ) {
    const uncertaintyWithCMC = uncertainty.map(
      (uncertaintyValue: number, index: number) => {
        if (typeof uncertaintyValue !== 'number') return uncertaintyValue

        if (uncertaintyValue < cmc.mincmc[index - 1] && useConversionTable) {
          return this.methodService.getSignificantFigure(
            cmc.cmc[index - 1] / conversionTableToKPA[unit],
          )
        }

        if (uncertaintyValue < cmc.mincmc[index - 1]) {
          return this.methodService.getSignificantFigure(cmc.cmc[index - 1])
        }

        return uncertaintyValue
      },
    )

    return uncertaintyWithCMC
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

  async generateCertificateCodeToMethod(methodID: number) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodID },
      })

      const lastMethod = await this.NI_MCIT_P_01Repository.createQueryBuilder(
        'NI_MCIT_P_01',
      )
        .orderBy('NI_MCIT_P_01.record_index', 'DESC')
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
        'P',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_P_01Repository.save(method)

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getMehotdById(methodId: number) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
        where: { id: methodId },
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

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async generatePDFCertificate(
    activityID: number,
    methodID: number,
    generatePDF = false,
  ) {
    try {
      const method = await this.NI_MCIT_P_01Repository.findOne({
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

      dataCertificate.data.calibration_results.result =
        dataCertificate.data.calibration_results.result.reference_pressure.map(
          (pressure, index) => ({
            reference_pressure: pressure,
            equipment_indication:
              dataCertificate.data.calibration_results.result
                .equipment_indication[index],
            correction:
              dataCertificate.data.calibration_results.result.correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.result.uncertainty[
                index
              ],
          }),
        )

      dataCertificate.data.calibration_results.result_unid_system =
        dataCertificate.data.calibration_results.result_unid_system.reference_pressure.map(
          (pressure, index) => ({
            reference_pressure: pressure,
            equipment_indication:
              dataCertificate.data.calibration_results.result_unid_system
                .equipment_indication[index],
            correction:
              dataCertificate.data.calibration_results.result_unid_system
                .correction[index],
            uncertainty:
              dataCertificate.data.calibration_results.result_unid_system
                .uncertainty[index],
          }),
        )

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/p-01.hbs',
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
}
