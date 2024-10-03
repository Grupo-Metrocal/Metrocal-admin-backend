import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { EquipmentInformationNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/description_pattern.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { NI_MCIT_T_01 } from './entities/NI_MCIT_T_01/NI_MCIT_T_01.entity'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationT_01Dto } from './dto/NI_MCIT_T_01/equipment-information.dto'
import { EnvironmentalConditionsT_01Dto } from './dto/NI_MCIT_T_01/environmental_condition.dto'
import { ActivitiesService } from '../activities/activities.service'

import * as XlsxPopulate from 'xlsx-populate'
import * as path from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { DescriptionPatternT_01Dto } from './dto/NI_MCIT_T_01/description_pattern.dto'
import { CertificateService } from '../certificate/certificate.service'
import { CalibrationResultsT_01Dto } from './dto/NI_MCIT_T_01/calibraion_results.dto'
import { CalibrationResultsNI_MCIT_T_01 } from './entities/NI_MCIT_T_01/steps/calibration_results.entity'
import { PatternsService } from '../patterns/patterns.service'
import { formatDate } from 'src/utils/formatDate'
import { PdfService } from '../mail/pdf.service'
import { MailService } from '../mail/mail.service'
import { MethodsService } from './methods.service'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { formatCertCode } from 'src/utils/generateCertCode'
import {
  convertToValidNumber,
  formatNumberCertification,
  formatSameNumberCertification,
} from 'src/utils/formatNumberCertification'
import { countDecimals } from 'src/utils/countDecimal'

@Injectable()
export class NI_MCIT_T_01Service {
  constructor(
    @InjectRepository(NI_MCIT_T_01)
    private NI_MCIT_T_01Repository: Repository<NI_MCIT_T_01>,
    @InjectRepository(EquipmentInformationNI_MCIT_T_01)
    private equipmentInformationNI_MCIT_T_01Repository: Repository<EquipmentInformationNI_MCIT_T_01>,
    @InjectRepository(EnvironmentalConditionsNI_MCIT_T_01)
    private environmentalConditionsNI_MCIT_T_01Repository: Repository<EnvironmentalConditionsNI_MCIT_T_01>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ActivitiesService))
    private activitiesService: ActivitiesService,
    @InjectRepository(DescriptionPatternNI_MCIT_T_01)
    private descriptionPatternNI_MCIT_T_01Repository: Repository<DescriptionPatternNI_MCIT_T_01>,
    @InjectRepository(CalibrationResultsNI_MCIT_T_01)
    private calibrationResultsNI_MCIT_T_01Repository: Repository<CalibrationResultsNI_MCIT_T_01>,

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
      const newNI_MCIT_T_01 = this.NI_MCIT_T_01Repository.create()
      const mehotd = await this.NI_MCIT_T_01Repository.save(newNI_MCIT_T_01)

      return handleOK(mehotd)
    } catch (error: any) {
      return handleInternalServerError(error.message)
    }
  }

  async equipmentInformation(
    equipment: EquipmentInformationT_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
        where: { id: methodId },
        relations: ['equipment_information'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingEquipment = method.equipment_information

      if (existingEquipment) {
        this.equipmentInformationNI_MCIT_T_01Repository.merge(
          existingEquipment,
          equipment,
        )
      } else {
        const newEquipment =
          this.equipmentInformationNI_MCIT_T_01Repository.create(equipment)
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

  async addCalibrationLocation(
    certificatonDetails: CertificationDetailsDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    method.calibration_location = certificatonDetails.location
    method.applicant_name = certificatonDetails.applicant_name
    method.applicant_address = certificatonDetails.applicant_address

    try {
      await this.NI_MCIT_T_01Repository.save(method)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async calibrationResults(
    calibrationResults: CalibrationResultsT_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
      relations: ['calibration_results'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingCalibrationResults = method.calibration_results

    if (existingCalibrationResults) {
      this.calibrationResultsNI_MCIT_T_01Repository.merge(
        existingCalibrationResults,
        calibrationResults,
      )
    } else {
      const newCalibrationResults =
        this.calibrationResultsNI_MCIT_T_01Repository.create(calibrationResults)
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
  async environmentalConditions(
    environmentalConditions: EnvironmentalConditionsT_01Dto,
    methodId: number,
    increase?: boolean,
  ) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
      where: { id: methodId },
      relations: ['environmental_conditions'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEnvironmentalConditions = method.environmental_conditions

    if (existingEnvironmentalConditions) {
      this.environmentalConditionsNI_MCIT_T_01Repository.merge(
        existingEnvironmentalConditions,
        environmentalConditions,
      )
    } else {
      const newEnvironmentalConditions =
        this.environmentalConditionsNI_MCIT_T_01Repository.create(
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

  async descriptionPattern(
    descriptionPattern: DescriptionPatternT_01Dto,
    methodId: number,
    activityId: number,
    increase?: boolean,
  ) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      })

      if (!method) {
        return handleInternalServerError('El método no existe')
      }

      const existingDescriptionPattern = method.description_pattern

      if (existingDescriptionPattern) {
        this.descriptionPatternNI_MCIT_T_01Repository.merge(
          existingDescriptionPattern,
          descriptionPattern,
        )
      } else {
        const newDescriptionPattern =
          this.descriptionPatternNI_MCIT_T_01Repository.create(
            descriptionPattern,
          )
        method.description_pattern = newDescriptionPattern
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.description_pattern)
        method.updated_at = new Date()
        method.status = 'done'

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

  async getMehotdById(methodId: number) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
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

  async generateCertificate({
    activityID,
    methodID,
  }: {
    activityID: number
    methodID: number
  }) {
    const method = await this.NI_MCIT_T_01Repository.findOne({
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
      calibration_results.results.length === 0
    ) {
      return handleInternalServerError(
        'El método no tiene la información necesaria para generar el certificado',
      )
    }

    try {
      const filePath = path.join(
        __dirname,
        '../mail/templates/excels/ni_mcit_t_01.xlsx',
      )

      if (fs.existsSync(method.certificate_url)) {
        fs.unlinkSync(method.certificate_url)
      }

      fs.copyFileSync(filePath, method.certificate_url)

      const workbook = await XlsxPopulate.fromFileAsync(method.certificate_url)

      // condiciones ambientales
      const sheetEnviromentalConditions = workbook.sheet('NI-R01-MCIT-T-01')

      workbook
        .sheet('Calibración')
        .cell('F5')
        .value(equipment_information.resolution)

      workbook
        .sheet('Calibración')
        .cell('F8')
        .value(equipment_information.probe_type)

      sheetEnviromentalConditions
        .cell('B18')
        .value(Number(environmental_conditions.environment.ta.tac.initial))
      sheetEnviromentalConditions
        .cell('B19')
        .value(Number(environmental_conditions.environment.ta.tac.final))
      sheetEnviromentalConditions
        .cell('C18')
        .value(Number(environmental_conditions.environment.ta.hrp.initial))
      sheetEnviromentalConditions
        .cell('C19')
        .value(Number(environmental_conditions.environment.ta.hrp.final))
      sheetEnviromentalConditions
        .cell('D18')
        .value(environmental_conditions.environment.ta.equipment)
      sheetEnviromentalConditions
        .cell('F18')
        .value(Number(environmental_conditions.environment.hpa.pa.initial))
      sheetEnviromentalConditions
        .cell('F19')
        .value(Number(environmental_conditions.environment.hpa.pa.final))
      sheetEnviromentalConditions
        .cell('G18')
        .value(environmental_conditions.environment.hpa.equipment)
      sheetEnviromentalConditions
        .cell('I18')
        .value(
          Number(environmental_conditions.environment.hpa.stabilization_time),
        )

      // calibration results
      let initialRow = 23

      for (const value of calibration_results.results) {
        initialRow++

        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`B${initialRow}`)
          .value(Number(value?.indication_linear[0]?.patron) || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`C${initialRow}`)
          .value(Number(value?.indication_linear[0]?.thermometer) || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`D${initialRow}`)
          .value(Number(value?.indication_linear[1]?.patron) || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`E${initialRow}`)
          .value(Number(value?.indication_linear[1]?.thermometer) || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`F${initialRow}`)
          .value(Number(value?.indication_linear[2]?.patron) || 0)
        workbook
          .sheet('NI-R01-MCIT-T-01')
          .cell(`G${initialRow}`)
          .value(Number(value?.indication_linear[2]?.thermometer) || 0)
      }

      // descrition pattern
      workbook
        .sheet('Calibración')
        .cell('J5')
        .value(description_pattern.pattern)

      // unidad de medida
      workbook.sheet('Calibración').cell('F7').value(equipment_information.unit)

      workbook.toFileAsync(method.certificate_url)
      await this.autoSaveExcel(method.certificate_url)

      return this.getCertificateResult(method.id, activityID)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getCertificateResult(methodID: number, activityID: number) {
    try {
      const method = await this.NI_MCIT_T_01Repository.findOne({
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

      const activity = dataActivity.data

      const reopnedWorkbook = await XlsxPopulate.fromFileAsync(
        method.certificate_url,
      )

      let temperatureReference = []
      let thermometerIndication = []
      let correction = []
      let expandedUncertaintyK2 = []

      let temperatureReferenceInternationalSystemUnits = []
      let thermometerIndicationInternationalSystemUnits = []
      let correctionInternationalSystemUnits = []
      let expandedUncertaintyK2InternationalSystemUnits = []

      const calibrationResultsSheet = reopnedWorkbook.sheet(
        'DA Unidad-K (5 ptos)',
      )

      for (let i = 0; i <= method.calibration_results.results.length; i++) {
        const temperatureReferenceVal = calibrationResultsSheet
          .cell(`D${28 + i}`)
          .value()
        temperatureReference.push(
          formatNumberCertification(
            temperatureReferenceVal,
            countDecimals(method.equipment_information.resolution),
          ),
        )

        const thermometerIndicationVal = calibrationResultsSheet
          .cell(`F${28 + i}`)
          .value()
        thermometerIndication.push(
          formatNumberCertification(
            thermometerIndicationVal,
            countDecimals(method.equipment_information.resolution),
          ),
        )
        // const correctionVal = calibrationResultsSheet.cell(`L${28 + i}`).value()

        correction.push(
          i === 0
            ? temperatureReference[i]
            : formatNumberCertification(
                convertToValidNumber(temperatureReference[i]) -
                  convertToValidNumber(thermometerIndication[i]),
                countDecimals(method.equipment_information.resolution),
              ),
        )

        const expandedUncertaintyK2Val = calibrationResultsSheet
          .cell(`R${28 + i}`)
          .value()

        expandedUncertaintyK2.push(
          this.methodService.getSignificantFigure(expandedUncertaintyK2Val),
        )

        if (description_pattern.show_table_international_system_units) {
          const reference = calibrationResultsSheet.cell(`D${62 + i}`).value()
          temperatureReferenceInternationalSystemUnits.push(
            i !== 0
              ? formatNumberCertification(
                  Number(reference),
                  countDecimals(method.equipment_information.resolution),
                )
              : reference,
          )
          const thermometer = calibrationResultsSheet.cell(`F${62 + i}`).value()
          thermometerIndicationInternationalSystemUnits.push(
            i !== 0
              ? formatNumberCertification(Number(thermometer))
              : thermometer,
          )
          correctionInternationalSystemUnits.push(
            i !== 0
              ? formatNumberCertification(
                  convertToValidNumber(
                    temperatureReferenceInternationalSystemUnits[i],
                  ) -
                    convertToValidNumber(
                      thermometerIndicationInternationalSystemUnits[i],
                    ),
                  countDecimals(method.equipment_information.resolution),
                )
              : calibrationResultsSheet.cell(`L${62 + i}`).value(),
          )

          const uncertainty = calibrationResultsSheet.cell(`R${62 + i}`).value()

          expandedUncertaintyK2InternationalSystemUnits.push(
            formatNumberCertification(
              this.methodService.getSignificantFigure(uncertainty),
              2,
            ),
          )
        }
      }

      let cmcPoint = []
      let cmcPref = []
      let uncertaintyCMC = []
      let cmc = []
      let mincmc = []

      const sheetCMC = reopnedWorkbook.sheet('CMC')

      for (let i = 0; i <= method.calibration_results.results.length; i++) {
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

      const calibration_results_certificate = {
        result: {
          temperatureReference,
          thermometerIndication,
          correction,
          expandedUncertaintyK2: this.methodService.formatUncertainty(
            this.formatUncertaintyWithCMC(expandedUncertaintyK2, CMC),
          ),
        },
        result_unid_system: {
          temperatureReference: temperatureReferenceInternationalSystemUnits,
          thermometerIndication: thermometerIndicationInternationalSystemUnits,
          correction: correctionInternationalSystemUnits,
          expandedUncertaintyK2: this.methodService.formatUncertainty(
            this.formatUncertaintyWithCMC(expandedUncertaintyK2, CMC),
          ),
        },
      }

      const certificate = {
        pattern: 'NI-MCIT-T-01',
        email: activity.quote_request.client.email,
        optionsCMCOnCertificate: method.optionsCMCOnCertificate,
        show_table_international_system_units:
          description_pattern.show_table_international_system_units,
        equipment_information: {
          certification_code: formatCertCode(
            method.certificate_code,
            method.modification_number,
          ),
          service_code: activity.quote_request.no,
          certificate_issue_date: formatDate(new Date().toString()),
          calibration_date: formatDate(method.updated_at.toString()),
          object_calibrated: equipment_information.device || '---',
          maker: equipment_information.maker || '---',
          serial_number: method.equipment_information.serial_number || '---',
          model: equipment_information.model || '---',
          measurement_range: `${equipment_information.range_min} ${equipment_information.unit} a ${equipment_information.range_max} ${equipment_information.unit}`,
          resolution:
            `${formatSameNumberCertification(equipment_information.resolution)} ${equipment_information.unit}` ||
            '---',
          code: equipment_information.code || '---',
          unit: equipment_information.unit || '---',
          applicant:
            method?.applicant_name ||
            activity.quote_request.client.company_name,
          address:
            method?.applicant_address || activity.quote_request.client.address,
          calibration_location: method.calibration_location || '---',
        },
        calibration_results: calibration_results_certificate,
        creditable: description_pattern.creditable,
        description_pattern: await this.getPatternsTableToCertificate(method),
        environmental_conditions: {
          temperature: `Temperatura: ${formatNumberCertification(
            calibrationResultsSheet.cell('E75').value(),
          )} °C ± ${formatNumberCertification(calibrationResultsSheet.cell('G75').value())} °C`,
          humidity: `Humedad: ${formatNumberCertification(calibrationResultsSheet.cell('E76').value())} % ± ${formatNumberCertification(calibrationResultsSheet.cell('G76').value())} %`,
        },
        observations: `
${description_pattern.observation}
Es responsabilidad del encargado del instrumento establecer la frecuencia del servicio de calibración.
La corrección corresponde al valor del patrón menos las indicación del equipo.
La indicación de temperatura de referencia y del equipo, corresponden al promedio de 3 mediciones.
El factor de conversión al SI corresponde a T(K) = t(°C) + 273,15 De acuerdo a lo establecido en NTON 07-004-01 Norma Metrológica del Sistema Internacional de Unidades (SI).
Los resultados emitidos en este certificado corresponden únicamente al objeto calibrado y a las magnitudes especificadas al momento de realizar el servicio.
Este certificado de calibración no debe ser reproducido sin la aprobación del laboratorio, excepto cuando sereproduce en su totalidad.`,
      }

      return handleOK(certificate)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async getPatternsTableToCertificate(method: NI_MCIT_T_01) {
    const description_pattern = []

    const environment_method_used =
      await this.patternsService.findByCodeAndMethod(
        method.environmental_conditions.environment.ta.equipment,
        'all',
      )
    if (environment_method_used.success) {
      description_pattern.push(environment_method_used.data)
    }

    const calibration_method_used =
      await this.patternsService.findByCodeAndMethod(
        method.description_pattern.pattern,
        'NI-MCIT-T-01',
      )

    if (calibration_method_used.success) {
      description_pattern.push(calibration_method_used.data)
    }

    return description_pattern
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
      const method = await this.NI_MCIT_T_01Repository.findOne({
        where: { id: methodID },
      })

      const lastMethod = await this.NI_MCIT_T_01Repository.createQueryBuilder(
        'NI_MCIT_T_01',
      )
        .orderBy('NI_MCIT_T_01.record_index', 'DESC')
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
        'T',
        method.record_index,
      )

      method.certificate_code = certificate.data.code
      method.certificate_id = certificate.data.id

      await this.NI_MCIT_T_01Repository.save(method)

      return handleOK(certificate)
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
      const method = await this.NI_MCIT_T_01Repository.findOne({
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
        dataCertificate.data.calibration_results.result.temperatureReference.map(
          (temperature, index) => ({
            temperatureReference: temperature,
            thermometerIndication:
              dataCertificate.data.calibration_results.result
                .thermometerIndication[index],
            correction:
              dataCertificate.data.calibration_results.result.correction[index],
            expandedUncertaintyK2:
              dataCertificate.data.calibration_results.result
                .expandedUncertaintyK2[index],
          }),
        )

      if (dataCertificate.data.show_table_international_system_units) {
        dataCertificate.data.calibration_results.result_unid_system =
          dataCertificate.data.calibration_results.result_unid_system.temperatureReference.map(
            (temperature, index) => ({
              temperatureReference: temperature,
              thermometerIndication:
                dataCertificate.data.calibration_results.result_unid_system
                  .thermometerIndication[index],
              correction:
                dataCertificate.data.calibration_results.result_unid_system
                  .correction[index],
              expandedUncertaintyK2:
                dataCertificate.data.calibration_results.result_unid_system
                  .expandedUncertaintyK2[index],
            }),
          )
      }

      const PDF = await this.pdfService.generateCertificatePdf(
        '/certificates/t-01.hbs',
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
