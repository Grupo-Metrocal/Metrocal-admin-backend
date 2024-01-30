import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiTags } from '@nestjs/swagger'
import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { NI_MCIT_D_02Service } from './ni-mcit-d-02.service'

import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'
import { CalibrationResultsDto } from './dto/NI_MCIT_P_01/calibraion_results.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_P_01/description_pattern.dto'

import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/equipment_information.dto'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/environmental_conditions.dto'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/pre_installation_comment.dto'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/instrument_zero_check.dto'
import { AccuracyTestNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/accuracy_test.dto'

@ApiTags('methods')
@Controller('methods')
export class MethodsController {
  constructor(
    private readonly methodsService: MethodsService,
    private readonly ni_mcit_p_01Service: NI_MCIT_P_01Service,
    private readonly ni_mcit_d_02Service: NI_MCIT_D_02Service,
  ) {}

  @Get()
  async getAll() {
    return await this.methodsService.getAllMethods()
  }

  @Get('clear')
  async clearAll() {
    return await this.methodsService.deleteAllMethods()
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

  @Post('ni-mcit-p-01/calibratrion-results/:methodId')
  async createNI_MCIT_P_01CalibratrionResults(
    @Body() calibrations: CalibrationResultsDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.calibrationResults(
      calibrations,
      methodId,
    )
  }

  @Post('ni-mcit-p-01/description-pattern/:methodId')
  async createNI_MCIT_P_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternDto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_p_01Service.descriptionPattern(
      descriptionPattern,
      methodId,
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

  @Post('ni-mcit-d-02/accuracy-test/:methodId')
  async createNI_MCIT_D_02AccuracyTest(
    @Body() accuracyTest: AccuracyTestNI_MCIT_D_02Dto,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_02Service.accuracyTest(accuracyTest, methodId)
  }
}
