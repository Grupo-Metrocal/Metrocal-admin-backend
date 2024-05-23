import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiTags } from '@nestjs/swagger'

import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_D_01Service } from './ni-mcit-d-01.service'
import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'
import { NI_MCIT_T_01Service } from './ni-mcit-t-01.service'
import { NI_MCIT_M_01Service } from './ni-mcit-m-01.service'
import { NI_MCIT_B_01Service } from './ni-mcit-b-01.service'

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
import { AddLocationDto } from './dto/NI_MCIT_P_01/add_location.dto'
import { EmmitReportDto } from './dto/emmit-report.dto'

import { EquipmentInformationDto as EquipmentInformationT_01Dto } from './dto/NI_MCIT_T_01/equipment-information.dto'
import { DescriptionPatternDto as DescriptionPatternT_01Dto } from './dto/NI_MCIT_T_01/description_pattern.dto'
import { EnvironmentalConditionsDto as EnvironmentalConditionsT_01Dto } from './dto/NI_MCIT_T_01/environmental_condition.dto'
import { CalibrationResultsDto as CalibrationResultsT_01Dto } from './dto/NI_MCIT_T_01/calibraion_results.dto'

import { EquipmentInformationDto as EquipmentInformationM_01Dto } from './dto/NI_MCIT_M_01/equipment_information.dto'
import { DataDto as DataM_01Dto } from './dto/NI_MCIT_M_01/data.dto'

import { EquipmentInformationNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01equipment_information.dto'
import { EccentricityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01eccentricity_test.dto'
import { RepeatabilityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01repeatability_test.dto'
import { LinearityTestNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01linearity_test.dto'
import { EnviromentalConditionsNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01enviromental_condition.dto'
import { UnitOfMeasurementNI_MCIT_B_01Dto } from './dto/NI_MCIT_B_01/b01unitOfMeasurement.dto'

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
    { methodsStackID, quoteRequestID }: addOrRemoveMethodToStackDto,
  ) {
    return await this.methodsService.addMethodToStack({
      methodsStackID,
      quoteRequestID,
    })
  }

  @Post('remove-method-to-stack/')
  async removeMethodToStack(
    @Body()
    { methodsStackID, quoteRequestID, methodID }: addOrRemoveMethodToStackDto,
  ) {
    return await this.methodsService.removeMethodToStack({
      methodsStackID,
      quoteRequestID,
      methodID,
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
    return this.methodsService.reviewMethod(method_name, method_id, token)
  }

  @Get('send-certifications-to-client/:activityID')
  sendAllCertificatesToClient(@Param('activityID') activityID: number) {
    return this.methodsService.sendAllCertificatesToClient(activityID)
  }

  @Post('ni-mcit-p-01/calibration-location/:methodId')
  async createNI_MCIT_P_01CalibrationLocation(
    @Body() { location }: AddLocationDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.addCalibrationLocation(
      location,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/equipment-information/:methodId')
  async createNI_MCIT_P_01EquipmentInformation(
    @Body() equipment: EquipmentInformationDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/environmental-conditions/:methodId')
  async createNI_MCIT_P_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/calibration-results/:methodId')
  async createNI_MCIT_P_01CalibrationResults(
    @Body() calibrations: CalibrationResultsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.calibrationResults(
      calibrations,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_P_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternDto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
  ) {
    return await this.ni_mcit_p_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
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

  @Post('ni-mcit-d-02/create')
  async createNI_MCIT_D_02() {
    return await this.ni_mcit_d_02Service.create()
  }

  @Post('ni-mcit-d-02/equipment-information/:methodId')
  async createNI_MCIT_D_02EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/environmental-conditions/:methodId')
  async createNI_MCIT_D_02EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/description-pattern/:methodId')
  async createNI_MCIT_D_02DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.descriptionPattern(
      descriptionPattern,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/pre-installation-comment/:methodId')
  async createNI_MCIT_D_02PreInstallationComment(
    @Body() preInstallationComment: PreInstallationCommentNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.preInstallationComment(
      preInstallationComment,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/instrument-zero-check/:methodId')
  async createNI_MCIT_D_02InstrumentZeroCheck(
    @Body() instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.instrumentZeroCheck(
      instrumentZeroCheck,
      methodId,
    )
  }

  @Post('ni-mcit-d-02/accuracy-test/:methodId/:activityId')
  async createNI_MCIT_D_02AccuracyTest(
    @Body() accuracyTest: AccuracyTestNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
  ) {
    return await this.ni_mcit_d_02Service.accuracyTest(
      accuracyTest,
      methodId,
      activityId,
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

  //* Routing for D-01

  //create method for D-01
  @Post('ni-mcit-d-01/create')
  async createNI_MCIT_D_01() {
    return await this.ni_mcit_d_01Service.create()
  }

  //equipment-information
  @Post('ni-mcit-d-01/equipment-information/:methodId')
  async createNI_MCIT_D_01EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  //environmental-conditions
  @Post('ni-mcit-d-01/environmental-conditions/:methodId')
  async createNI_MCIT_D_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }

  //description-pattern
  @Post('ni-mcit-d-01/description-pattern/:methodId')
  async createNI_MCIT_D_01DescriptionPattern(
    @Body() descriptionPatterns: DescriptionPatternNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.descriptionPattern(
      descriptionPatterns,
      methodId,
    )
  }

  //pre-installation-comment
  @Post('ni-mcit-d-01/pre-installation-comment/:methodId')
  async createNI_MCIT_D_01PreInstallationComment(
    @Body() preInstallationComment: PreInstallationCommentNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.preInstallationComment(
      preInstallationComment,
      methodId,
    )
  }

  //instrument-zero-check
  @Post('ni-mcit-d-01/instrument-zero-check/:methodId')
  async createNI_MCIT_D_01InstrumentZeroCheck(
    @Body() instrumentZeroCheck: InstrumentZeroCheckNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.instrumentZeroCheck(
      instrumentZeroCheck,
      methodId,
    )
  }

  //exterior-parallelism-measurement
  @Post('ni-mcit-d-01/exterior-parallelism-measurement/:methodId')
  async createNI_MCIT_D_01ExteriorParallelismMeasurement(
    @Body()
    exteriorParallelismMeasurement: ExteriorParallelismMeasurementNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.exteriorParallelismMeasurement(
      exteriorParallelismMeasurement,
      methodId,
    )
  }

  //interior-parallelism-measurement
  @Post('ni-mcit-d-01/interior-parallelism-measurement/:methodId')
  async createNI_MCIT_D_01InteriorParallelismMeasurement(
    @Body()
    interiorParallelismMeasurement: InteriorParallelismMeasurementNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01Service.interiorParallelismMeasurement(
      interiorParallelismMeasurement,
      methodId,
    )
  }

  //exterior-measurement-accuracy
  @Post('ni-mcit-d-01/exterior-measurement-accuracy/:methodId/:activityId')
  async createNI_MCIT_D_01ExteriorMeasurementAccuracy(
    @Body()
    exteriorMeasurementAccuracy: ExteriorMeasurementAccuracyNI_MCIT_D_01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
  ) {
    return await this.ni_mcit_d_01Service.exteriorMeasurementAccuracy(
      exteriorMeasurementAccuracy,
      methodId,
      activityId,
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

  //T-01
  @Post('ni-mcit-t-01/calibration-location/:methodId')
  async createNI_MCIT_T_01CalibrationLocation(
    @Body() { location }: AddLocationDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.addCalibrationLocation(
      location,
      methodId,
    )
  }

  @Post('ni-mcit-t-01/equipment-information/:methodId')
  async createNI_MCIT_T_01EquipmentInformation(
    @Body() equipment: EquipmentInformationT_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-t-01/environmental-conditions/:methodId')
  async createNI_MCIT_T_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsT_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }

  @Post('ni-mcit-t-01/calibration-results/:methodId')
  async createNI_MCIT_T_01CalibrationResults(
    @Body() calibrations: CalibrationResultsT_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_t_01Service.calibrationResults(
      calibrations,
      methodId,
    )
  }
  @Post('ni-mcit-t-01/description-pattern/:methodId/:activityId')
  async createNI_MCIT_T_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternT_01Dto,
    @Param('methodId') methodId: number,
    @Param('activityId') activityId: number,
  ) {
    return await this.ni_mcit_t_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
      activityId,
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

  @Post('ni-mcit-m-01/equipment-information/:methodId')
  async createNI_MCIT_M_01EquipmentInformation(
    @Body() equipment: EquipmentInformationM_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_m_01Service.equipmentInformation(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-m-01/data-information/:methodId')
  async createNI_MCIT_M_01Data(
    @Body() data: DataM_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_m_01Service.dataInformation(data, methodId)
  }

  //controladores del method B01
  @Post('ni-mcit-b-01/create')
  async createNI_MCIT_B_01() {
    return await this.ni_mcit_b_01Service.createNI_MCIT_B_01()
  }

  @Post('ni-mcit-b-01/equipment-information/:methodId')
  async createNI_MCIT_B_01EquipmentInformation(
    @Body() equipment: EquipmentInformationNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.equipmentInfomationB01(
      equipment,
      methodId,
    )
  }

  @Post('ni-mcit-b-01/enviromental-condition/:methodId')
  async createNI_MCIT_B_01EnviromentalCondition(
    @Body() enviromentalCondition: EnviromentalConditionsNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.enviromentalConditionB01(
      enviromentalCondition,
      methodId,
    )
  }

  //eccentricityTestB01
  @Post('ni-mcit-b-01/eccentricity-test/:methodId')
  async createNI_MCIT_B_01EccentricityTest(
    @Body() eccentricityTest: EccentricityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.eccentricityTestB01(
      eccentricityTest,
      methodId,
    )
  }

  //repeatabilityTestB01
  @Post('ni-mcit-b-01/repeatability-test/:methodId')
  async createNI_MCIT_B_01RepeatabilityTest(
    @Body() repeatabilityTest: RepeatabilityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.repeatabilityTestB01(
      repeatabilityTest,
      methodId,
    )
  }

  //linearityTestB01
  @Post('ni-mcit-b-01/linearity-test/:methodId')
  async createNI_MCIT_B_01LinearityTest(
    @Body() linearityTest: LinearityTestNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.linearityTestB01(
      linearityTest,
      methodId,
    )
  }

  //unitOfMeasurementB01
  @Post('ni-mcit-b-01/unit-of-measurement/:methodId')
  async createNI_MCIT_B_01UnitOfMeasurement(
    @Body() unitOfMeasurement: UnitOfMeasurementNI_MCIT_B_01Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.unitOfMeasurementB01(
      unitOfMeasurement,
      methodId,
    )
  }

  //certificate
  @Get('ni-mcit-b-01/certificates/activity/:activityId/method/:methodId')
  async getNI_MCIT_B_01Certificate(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.generateCertificateB01({
      activityID: activityId,
      methodID: methodId,
    })
  }

  @Get('ni-mcit-b-01/generate-certificate/pdf/:idActivity/:idMethod')
  async getCertificatePdfB01(
    @Param('activityId') activityId: number,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_b_01Service.generatePDFCertificateB01({
      activityID: activityId,
      methodID: methodId,
    })
  }
}
