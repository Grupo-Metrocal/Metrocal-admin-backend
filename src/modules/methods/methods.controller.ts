import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiQuery, ApiTags } from '@nestjs/swagger'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_D_01Service } from './ni-mcit-d-01.service'
import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'
import { NI_MCIT_T_01Service } from './ni-mcit-t-01.service'
import { NI_MCIT_M_01Service } from './ni-mcit-m-01.service'
import { NI_MCIT_B_01Service } from './ni-mcit-b-01.service'
import { NI_MCIT_T_03Service } from './ni-mcit-t-03.service'
import { GENERIC_METHODService } from './generic-method.service'

import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'
import { CalibrationResultsDto } from './dto/NI_MCIT_P_01/calibraion_results.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_P_01/description_pattern.dto'

import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02equipment_information.dto'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02environmental_conditions.dto'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02pre_installation_comment.dto'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02instrument_zero_check.dto'
import { AccuracyTestNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/d02accuracy_test.dto'
import { addOrRemoveMethodToStackDto } from './dto/add-remove-method-stack.dto'

import { EquipmentInformationNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EnvironmentalConditionsNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/environmental_conditions.dto'
import { DescriptionPatternNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/pre_installation_comment.dto'
import { InstrumentZeroCheckNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/instrument_zero_check.dto'
import { ExteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_parallelism_measurement.dto'
import { InteriorParallelismMeasurementNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/interior_parallelism_measurement.dto'
import { ExteriorMeasurementAccuracyNI_MCIT_D_01Dto } from './dto/NI_MCIT_D_01/exterior_measurement_accuracy.dto'
import { CertificationDetailsDto } from './dto/NI_MCIT_P_01/certification_details.dto'
import { EmmitReportDto } from './dto/emmit-report.dto'

import { EquipmentInformationT_01Dto } from './dto/NI_MCIT_T_01/equipment-information.dto'
import { DescriptionPatternT_01Dto } from './dto/NI_MCIT_T_01/description_pattern.dto'
import { EnvironmentalConditionsT_01Dto } from './dto/NI_MCIT_T_01/environmental_condition.dto'
import { CalibrationResultsT_01Dto } from './dto/NI_MCIT_T_01/calibraion_results.dto'

import { handleBadrequest } from 'src/common/handleHttp'

import { EquipmentInformationT_03Dto } from './dto/NI_MCIT_T_03/equipment-information.dto'
import { DescriptionPatternDto as DescriptionPatternT_03Dto } from './dto/NI_MCIT_T_03/description_pattern.dto'
import { EnvironmentalConditionsDto as EnvironmentalConditionsT_03Dto } from './dto/NI_MCIT_T_03/environmental_condition.dto'
import { CalibrationResultsDto as CalibrationResultsT_03Dto } from './dto/NI_MCIT_T_03/calibraion_results.dto'

import { EquipmentInformationNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01equipment_information.dto'
import { EccentricityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01eccentricity_test.dto'
import { RepeatabilityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01repeatability_test.dto'
import { LinearityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01linearity_test.dto'
import { EnviromentalConditionsNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01enviromental_condition.dto'
import { NI_MCIT_T_05Service } from './ni-mcit-t-05.service'
import { EquipmentInformationT05Dto } from './dto/NI_MCIT_T_05/equipment-information.dto'
import { CalibrationResultsT05Dto } from './dto/NI_MCIT_T_05/calibraion_results.dto'
import { EnvironmentalConditionsT05Dto } from './dto/NI_MCIT_T_05/environmental_condition.dto'
import { NI_MCIT_V_01Service } from './ni-mcit-v-01.service'
import { EquipmentInformationV01Dto } from './dto/NI_MCIT_V_01/equipment-information.dto'
import { EnvironmentalConditionsV01Dto } from './dto/NI_MCIT_V_01/environmental_condition.dto'
import { CalibrationResultsV01Dto } from './dto/NI_MCIT_V_01/calibraion_results.dto'
import { DescriptionPatternV01Dto } from './dto/NI_MCIT_V_01/description_pattern.dto'

import { EnvironmentalConditionsGENERIC_METHODDto } from './dto/GENERIC METHOD/enviromental_condition.dto'
import { EquipmentInformationGENERIC_METHODDto } from './dto/GENERIC METHOD/equipment_information.dto'
import { ComputerDataGENERIC_METHODDto } from './dto/GENERIC METHOD/computer_data.dto'
import { Result_MeditionGENERIC_METHODDto } from './dto/GENERIC METHOD/result_medition.dto'

import { EquipmentInformationM01Dto } from './dto/NI_MCIT_M_01/equipment_information.dto'
import { EnvironmentalConditionsM01Dto } from './dto/NI_MCIT_M_01/environmental_condition.dto'
import { CalibrationResultsM01Dto } from './dto/NI_MCIT_M_01/calibraion_results.dto'
import { DescriptionPatternM01Dto } from './dto/NI_MCIT_M_01/description_pattern.dto'
import { Response } from 'express'
import { DescriptionPatternB01Dto } from './dto/NI_MCIT_B_01/description_pattern.dto'
import { DescriptionPatternGenericMethodDto } from './dto/GENERIC METHOD/description_pattern.dto'

@ApiTags('methods')
@Controller('methods')
export class MethodsController {
  constructor(
    private readonly methodsService: MethodsService,
    private readonly ni_mcit_p_01Service: NI_MCIT_P_01Service,
    private readonly ni_mcit_d_02Service: NI_MCIT_D_02Service,
    private readonly ni_mcit_d_01Service: NI_MCIT_D_01Service,
    private readonly ni_mcit_t_01Service: NI_MCIT_T_01Service,
    private readonly ni_mcit_m_01Service: NI_MCIT_M_01Service,
    private readonly ni_mcit_b_01Service: NI_MCIT_B_01Service,
    private readonly ni_mcit_t_03Service: NI_MCIT_T_03Service,
    private readonly ni_mcit_t_05Service: NI_MCIT_T_05Service,
    private readonly ni_mcit_v_01Service: NI_MCIT_V_01Service,
    private readonly GenericMethodService: GENERIC_METHODService,
  ) {}

  @Get()
  async getAll() {
    return await this.methodsService.getAllMethods()
  }

  @Get('get-stack/:id')
  async getMethodsID(@Param('id') id: number) {
    return await this.methodsService.getMethodsID(id)
  }

  @Delete('delete-stack/:id')
  async deleteStack(@Param('id') id: number) {
    return await this.methodsService.deleteStackMethods(id)
  }

  @Post('add-method-to-stack/')
  async addMethodToStack(
    @Body()
    { methodsStackID, quoteRequestID, activityID }: addOrRemoveMethodToStackDto,
  ) {
    return await this.methodsService.addMethodToStack({
      methodsStackID,
      quoteRequestID,
      activityID,
    })
  }

  @Post('remove-method-to-stack/')
  async removeMethodToStack(
    @Body()
    {
      methodsStackID,
      quoteRequestID,
      methodID,
      activityID,
    }: addOrRemoveMethodToStackDto,
  ) {
    return await this.methodsService.removeMethodToStack({
      methodsStackID,
      quoteRequestID,
      methodID,
      activityID,
    })
  }

  @Post('emmit-report/:id')
  async emmitReport(
    @Body() { method_name, report }: EmmitReportDto,
    @Param('id') id: number,
  ) {
    return await this.methodsService.emmitReportToMethod(
      method_name,
      id,
      report,
    )
  }

  @Get('clear-report/:method_name/:id')
  async clearReport(
    @Param('method_name') method_name: string,
    @Param('id') id: number,
  ) {
    return this.methodsService.clearReport(method_name, id)
  }

  @Post('review-method/')
  async reviewMethod(
    @Body()
    {
      method_name,
      method_id,
      token,
    }: {
      method_name: string
      method_id: number
      token: string
    },
  ) {
    if (!token || !method_id || !method_name) {
      return handleBadrequest(new Error('Faltan parámetros'))
    }

    return this.methodsService.reviewMethod(method_name, method_id, token)
  }

  @Get('send-certifications-to-client/:activityID')
  async sendAllCertificatesToClient(@Param('activityID') activityID: number) {
    return this.methodsService.sendAllCertificatesToClient(activityID)
  }

  @Get('download-certificate-pdf/:acitivty_id/:method_name/:methodID')
  async downloadCertificatePDF(
    @Param('method_name') method_name: string,
    @Param('methodID') methodID: number,
    @Param('acitivty_id') activityID: number,
    @Res() res: Response,
  ) {
    const certificateBuffer = await this.methodsService.downloadCertificatePDF(
      activityID,
      method_name,
      methodID,
    )

    if (!certificateBuffer.success) {
      // return handleBadrequest(new Error('No se encontró el certificado'))
      throw new HttpException(
        {
          message: 'No se encontró el certificado',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf')
    res.send(certificateBuffer.data)
  }

  @Get('get-alternative-certification-code/:method_name')
  async getAlternativeRecordIndex(@Param('method_name') method_name: string) {
    return await this.methodsService.getAlternativeRecordIndex(method_name)
  }

  @Get(
    'update-certification-code/:from_method_name/:to_method_name/:equipmentID',
  )
  async updateRecordByAlternativeIndex(
    @Param('from_method_name') from_method_name: string,
    @Param('to_method_name') to_method_name: string,
    @Param('equipmentID') equipmentID: number,
  ) {
    return await this.methodsService.updateRecordByAlternativeIndex(
      from_method_name,
      to_method_name,
      equipmentID,
    )
  }

  @Post('ni-mcit-p-01/calibration-location/:methodId')
  async createNI_MCIT_P_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-p-01/equipment-information/:methodId')
  async createNI_MCIT_P_01EquipmentInformation(
    @Body() equipment: EquipmentInformationDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_p_01Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-p-01/environmental-conditions/:methodId')
  async createNI_MCIT_P_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_p_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-p-01/calibration-results/:methodId')
  async createNI_MCIT_P_01CalibrationResults(
    @Body() calibrations: CalibrationResultsDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_p_01Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-p-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_P_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternDto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_p_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-p-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_P_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-p-01/equipment/:id')
  async getEquipmentP_01ById(@Param('id') id: number) {
    return await this.ni_mcit_p_01Service.getMehotdById(id)
  }

  @Get('ni-mcit-p-01/generate-certificate/pdf/:idActivity/:idMethod')
  async getCertificatePdf(
    @Param('idActivity') idActivity: number,
    @Param('idMethod') idMethod: number,
  ) {
    return await this.ni_mcit_p_01Service.generatePDFCertificate(
      idActivity,
      idMethod,
    )
  }

  @Get('ni-mcit-p-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientP01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/calibration-location/:methodId')
  async createNI_MCIT_D_02CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @Get('ni-mcit-d-02/equipment/:id')
  async getEquipmentD_02ById(@Param('id') id: number) {
    return await this.ni_mcit_d_02Service.getMethodById(id)
  }

  @Post('ni-mcit-d-02/create')
  async createNI_MCIT_D_02() {
    return await this.ni_mcit_d_02Service.create()
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/equipment-information/:methodId')
  async createNI_MCIT_D_02EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/environmental-conditions/:methodId')
  async createNI_MCIT_D_02EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/description-pattern/:methodId')
  async createNI_MCIT_D_02DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.descriptionPattern(
      descriptionPattern,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/pre-installation-comment/:methodId')
  async createNI_MCIT_D_02PreInstallationComment(
    @Body() preInstallationComment: PreInstallationCommentNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.preInstallationComment(
      preInstallationComment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/instrument-zero-check/:methodId')
  async createNI_MCIT_D_02InstrumentZeroCheck(
    @Body() instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.instrumentZeroCheck(
      instrumentZeroCheck,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-02/accuracy-test/:methodId/:activityId')
  async createNI_MCIT_D_02AccuracyTest(
    @Body() accuracyTest: AccuracyTestNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_02Service.accuracyTest(
      accuracyTest,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  //certificate
  @Get('ni-mcit-d-02/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_D_02Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.generateCertificateData({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-d-02/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientD02(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Post('ni-mcit-d-01/calibration-location/:methodId')
  async createNI_MCIT_D_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  //* Routing for D-01
  @Get('ni-mcit-d-01/equipment/:id')
  async getEquipmentD_01ById(@Param('id') id: number) {
    return await this.ni_mcit_d_01Service.getMethodById(id)
  }

  //create method for D-01
  @Post('ni-mcit-d-01/create')
  async createNI_MCIT_D_01() {
    return await this.ni_mcit_d_01Service.create()
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/equipment-information/:methodId')
  async createNI_MCIT_D_01EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/environmental-conditions/:methodId')
  async createNI_MCIT_D_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/description-pattern/:methodId')
  async createNI_MCIT_D_01DescriptionPattern(
    @Body() descriptionPatterns: DescriptionPatternNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.descriptionPattern(
      descriptionPatterns,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/pre-installation-comment/:methodId')
  async createNI_MCIT_D_01PreInstallationComment(
    @Body() preInstallationComment: PreInstallationCommentNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.preInstallationComment(
      preInstallationComment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/instrument-zero-check/:methodId')
  async createNI_MCIT_D_01InstrumentZeroCheck(
    @Body() instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.instrumentZeroCheck(
      instrumentZeroCheck,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/exterior-parallelism-measurement/:methodId')
  async createNI_MCIT_D_01ExteriorParallelismMeasurement(
    @Body()
    exteriorParallelismMeasurement: ExteriorParallelismMeasurementNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.exteriorParallelismMeasurement(
      exteriorParallelismMeasurement,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/interior-parallelism-measurement/:methodId')
  async createNI_MCIT_D_01InteriorParallelismMeasurement(
    @Body()
    interiorParallelismMeasurement: InteriorParallelismMeasurementNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.interiorParallelismMeasurement(
      interiorParallelismMeasurement,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-d-01/exterior-measurement-accuracy/:methodId/:activityId')
  async createNI_MCIT_D_01ExteriorMeasurementAccuracy(
    @Body()
    exteriorMeasurementAccuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_d_01Service.exteriorMeasurementAccuracy(
      exteriorMeasurementAccuracy,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  //certificate
  @Get('ni-mcit-d-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_D_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.generateCertificateData({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-d-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientD01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Post('ni-mcit-t-01/calibration-location/:methodId')
  async createNI_MCIT_T_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-01/equipment-information/:methodId')
  async createNI_MCIT_T_01EquipmentInformation(
    @Body() equipment: EquipmentInformationT_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_01Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-01/environmental-conditions/:methodId')
  async createNI_MCIT_T_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsT_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-01/calibration-results/:methodId')
  async createNI_MCIT_T_01CalibrationResults(
    @Body() calibrations: CalibrationResultsT_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_01Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }
  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_T_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternT_01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-t-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_T_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-t-01/generate-certificate/pdf/:idActivity/:idMethod')
  async getCertificatePdfT01(
    @Param('idActivity') idActivity: number,
    @Param('idMethod') idMethod: number,
  ) {
    return await this.ni_mcit_t_01Service.generatePDFCertificate(
      idActivity,
      idMethod,
    )
  }

  @Get('ni-mcit-t-01/equipment/:id')
  async getEquipmentT_01ById(@Param('id') id: number) {
    return await this.ni_mcit_t_01Service.getMehotdById(id)
  }

  @Get('ni-mcit-t-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientT01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Post('ni-mcit-m-01/calibration-location/:methodId')
  async createNI_MCIT_M_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_m_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-m-01/equipment-information/:methodId')
  async createNI_MCIT_M_01EquipmentInformation(
    @Body() equipment: EquipmentInformationM01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_m_01Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-m-01/environmental-conditions/:methodId')
  async createNI_MCIT_M_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsM01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_m_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-m-01/calibration-results/:methodId')
  async createNI_MCIT_M_01CalibrationResults(
    @Body() calibrations: CalibrationResultsM01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_m_01Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-m-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_M_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternM01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_m_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-m-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_M_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_m_01Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-m-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientM01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_m_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Get('ni-mcit-m-01/equipment/:id')
  async getEquipmentM_01ById(@Param('id') id: number) {
    return await this.ni_mcit_m_01Service.getMehotdById(id)
  }

  @Post('ni-mcit-b-01/calibration-location/:methodId')
  async createNI_MCIT_B_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @Get('ni-mcit-b-01/equipment/:id')
  async getEquipmentB_01ById(@Param('id') id: number) {
    return await this.ni_mcit_b_01Service.getMethodById(id)
  }

  //controladores del method B01
  @Post('ni-mcit-b-01/create')
  async createNI_MCIT_B_01() {
    return await this.ni_mcit_b_01Service.create()
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/equipment-information/:methodId')
  async createNI_MCIT_B_01EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.equipmentInfomationB01(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  //T-03
  @Post('ni-mcit-t-03/calibration-location/:methodId')
  async createNI_MCIT_T_03CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_03Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/enviromental-condition/:methodId')
  async createNI_MCIT_B_01EnviromentalCondition(
    @Body() enviromentalCondition: EnviromentalConditionsNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.enviromentalConditionB01(
      enviromentalCondition,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/eccentricity-test/:methodId')
  async createNI_MCIT_B_01EccentricityTest(
    @Body() eccentricityTest: EccentricityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.eccentricityTestB01(
      eccentricityTest,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-03/equipment-information/:methodId')
  async createNI_MCIT_T_03EquipmentInformation(
    @Body() equipment: EquipmentInformationT_03Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_03Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/repeatability-test/:methodId')
  async createNI_MCIT_B_01RepeatabilityTest(
    @Body() repeatabilityTest: RepeatabilityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.repeatabilityTestB01(
      repeatabilityTest,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-03/environmental-conditions/:methodId')
  async createNI_MCIT_T_03EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsT_03Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_03Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/linearity-test/:methodId')
  async createNI_MCIT_B_01LinearityTest(
    @Body() linearityTest: LinearityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.linearityTestB01(
      linearityTest,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-b-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_B_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternB01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_b_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  //certificate
  @Get('ni-mcit-b-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_B_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.generateCertificateData({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-b-01/generate-certificate/pdf/:idActivity/:idMethod')
  async getCertificatePdfB01(
    @Param('idActivity') idActivity: number,
    @Param('idMethod') idMethod: number,
  ) {
    return await this.ni_mcit_b_01Service.generatePDFCertificate(
      idActivity,
      idMethod,
    )
  }

  @Get('ni-mcit-b-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientB01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-03/calibration-results/:methodId')
  async createNI_MCIT_T_03CalibrationResults(
    @Body() calibrations: CalibrationResultsT_03Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_03Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }
  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-03/description-pattern/:methodId/:activityId')
  async createNI_MCIT_T_03DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternT_03Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_03Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-t-03/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_T_03Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_03Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-t-03/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClient(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_t_03Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Get('ni-mcit-t-03/equipment/:id')
  async getEquipmentT_03ById(@Param('id') id: number) {
    return await this.ni_mcit_t_03Service.getMehotdById(id)
  }

  @Post('ni-mcit-t-05/calibration-location/:methodId')
  async createNI_MCIT_T_05CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_05Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-05/equipment-information/:methodId')
  async createNI_MCIT_T_05EquipmentInformation(
    @Body() equipment: EquipmentInformationT05Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_05Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-05/environmental-conditions/:methodId')
  async createNI_MCIT_T_05EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsT05Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_05Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-05/calibration-results/:methodId')
  async createNI_MCIT_T_05CalibrationResults(
    @Body() calibrations: CalibrationResultsT05Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_05Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-t-05/description-pattern/:methodId/:activityId')
  async createNI_MCIT_T_05DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternT_03Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_t_05Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-t-05/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_T_05Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_05Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-t-05/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientT05(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_t_05Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Get('ni-mcit-t-05/equipment/:id')
  async getEquipmentT_05ById(@Param('id') id: number) {
    return await this.ni_mcit_t_05Service.getMehotdById(id)
  }

  @Post('ni-mcit-v-01/calibration-location/:methodId')
  async createNI_MCIT_V_01CalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_v_01Service.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-v-01/equipment-information/:methodId')
  async createNI_MCIT_V_01EquipmentInformation(
    @Body() equipment: EquipmentInformationV01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_v_01Service.equipmentInformation(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-v-01/environmental-conditions/:methodId')
  async createNI_MCIT_V_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsV01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_v_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-v-01/calibration-results/:methodId')
  async createNI_MCIT_V_01CalibrationResults(
    @Body() calibrations: CalibrationResultsV01Dto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_v_01Service.calibrationResults(
      calibrations,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('ni-mcit-v-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_V_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternV01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.ni_mcit_v_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('ni-mcit-v-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_V_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_v_01Service.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-v-01/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientV01(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.ni_mcit_v_01Service.sendCertificateToClient(
      activityId,
      methodId,
    )
  }

  @Get('ni-mcit-v-01/equipment/:id')
  async getEquipmentV_01ById(@Param('id') id: number) {
    return await this.ni_mcit_v_01Service.getMehotdById(id)
  }

  @Post('generic-method/calibration-location/:methodId')
  async createGENERIC_METHODCalibrationLocation(
    @Body() certificationDetails: CertificationDetailsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.GenericMethodService.addCalibrationLocation(
      certificationDetails,
      methodId,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('generic-method/equipment-information/:methodId')
  async createGenericMethodEquipmentInformation(
    @Body() equipment: EquipmentInformationGENERIC_METHODDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.GenericMethodService.equipmentInformationCreate(
      equipment,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('generic-method/environmental-conditions/:methodId')
  async createGenericMethodEnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsGENERIC_METHODDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.GenericMethodService.environmentalConditionsCreate(
      environmentalConditions,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('generic-method/results-medition/:methodId/')
  async createGenericMethodResultsMedition(
    @Body() resultsMedition: Result_MeditionGENERIC_METHODDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.GenericMethodService.resultMeditionCreate(
      resultsMedition,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('generic-method/computer-data/:methodId')
  async createGenericMethodComputerData(
    @Body() computerData: ComputerDataGENERIC_METHODDto,
    @Param('methodId') methodId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.GenericMethodService.computerDataCreate(
      computerData,
      methodId,
      valueIncrease,
    )
  }

  @ApiQuery({ name: 'increase', required: false })
  @Post('generic-method/description-pattern/:equipmentId/:methodId/:activityId')
  async createGENERIC_METHODDescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternGenericMethodDto,
    @Param('equipmentId') equipmentId: number,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
    @Query('increase') increase?: string,
  ) {
    const valueIncrease = increase === 'true' ? true : false

    return await this.GenericMethodService.descriptionPattern(
      equipmentId,
      descriptionPattern,
      methodId,
      activityId,
      valueIncrease,
    )
  }

  @Get('generic_method/certificates/activity/:activityId/method/:methodId')
  async getGENERIC_METHODCertificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.GenericMethodService.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('generic_method/generate-certificate/send/pdf/:idActivity/:idMethod')
  async sendCertificateToClientGenericMethod(
    @Param('idActivity') activityId: number,
    @Param('idMethod') methodId: number,
  ) {
    return await this.GenericMethodService.generatePDFCertificate(
      activityId,
      methodId,
    )
  }

  @Get('generic-method/generate-certificate/pdf/:idActivity/:idMethod')
  async getCertificatePdfGenericMethod(
    @Param('idActivity') idActivity: number,
    @Param('idMethod') idMethod: number,
  ) {
    return await this.ni_mcit_t_01Service.generatePDFCertificate(
      idActivity,
      idMethod,
    )
  }

  @Get('generic_method/equipment/:id')
  async getEquipmentGenericMethodId(@Param('id') id: number) {
    return await this.GenericMethodService.getMehotdById(id)
  }

  @Get('generic-method/certificates/activity/:activityId/method/:methodId')
  async getCetficateGeneric(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.GenericMethodService.generateCertificate({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('generic-method/equipment/:id')
  async getEquipmentGeneric(@Param('id') id: number) {
    return await this.GenericMethodService.getMehotdById(id)
  }
}
