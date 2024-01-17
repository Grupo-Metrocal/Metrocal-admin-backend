import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { MethodsService } from './methods.service'
import { ApiTags } from '@nestjs/swagger'
import { NI_MCIT_P_01Service } from './ni-mcit-p-01.service'
import { EquipmentInformationDto } from './dto/NI_MCIT_P_01/equipment_information.dto'
import { EnvironmentalConditionsDto } from './dto/NI_MCIT_P_01/environmental_condition.dto'
import { CalibrationResultsDto } from './dto/NI_MCIT_P_01/calibraion_results.dto'
import { DescriptionPatternDto } from './dto/NI_MCIT_P_01/description_pattern.dto'
//NI_MCIT_D_01
import { NI_MCIT_D_01Service } from './ni_mcit_d_01.service'
import { EquipmentInformationDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/equipment_information.dto'
import { EnvironmentalConditionsDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/enviromental_conditions.dto'
import { DescriptionPatternDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/description_patterns.dto'
import { ObservationPriorCalibrationDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/observation_prior_calibration.dto'
import { InstrumentZeroCheckDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/instrument_zero_check.dto'
import { ExternalParallelismMeasurementDtoNI_MCIT_D_01 } from './dto/NI_MCIT_D_01/external_parallelism_measurement.dto'

@ApiTags('methods')
@Controller('methods')
export class MethodsController {
  constructor(
    private readonly methodsService: MethodsService,
    private readonly ni_mcit_p_01Service: NI_MCIT_P_01Service,
    private readonly ni_mcit_d_01service: NI_MCIT_D_01Service
  ) {}

  @Get()
  async getAll() {
    return await this.methodsService.getAllMethods()
  }

  @Get('clear')
  async getAllNI_MCIT_P_01() {
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

  //NI_MCIT_D_01
  @Get('NI_MCIT_D_01')
  async getAllNI_MCIT_D_01() {
    return await this.methodsService.getAllMethodsNI_MCIT_D_01()
  }

  @Get('clearNI_MCIT_D_01')
  async clearAllNI_MCIT_D_01() {
    return await this.methodsService.deleteAllMethodsNI_MCIT_D_01()
  }
  //2
  @Post('ni-mcit-d-01/equipment-information/:methodId')
  async createNI_MCIT_D_01EquipmentInformation(
    @Body() equipmentInformation: EquipmentInformationDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.equipmentInformation(
      equipmentInformation,
      methodId,
    )
  }
  //3
  @Post('ni-mcit-d-01/environmental-conditions/:methodId')
  async createNI_MCIT_D_01EnvironmentalConditions(
    @Body() environmentalConditions: EnvironmentalConditionsDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.environmentalConditions(
      environmentalConditions,
      methodId,
    )
  }
  //4
  @Post('ni-mcit-d-01/description-pattern/:methodId')
  async createNI_MCIT_D_01DescriptionPattern(
    @Body() descriptionPattern: DescriptionPatternDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.descriptionPattern(
      descriptionPattern,
      methodId,
    )
  }
  //5
  @Post('ni-mcit-d-01/observation-prior-calibration/:methodId')
  async createNI_MCIT_D_01ObservationPriorCalibration(
    @Body() observationpriorcalibration: ObservationPriorCalibrationDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.observationpriorcalibration(
      observationpriorcalibration,
      methodId,
    )
  }
  //6
  @Post('ni-mcit-d-01/instrument-zero-check/:methodId')
  async createNI_MCIT_D_01InstrumentZeroCheck(
    @Body() instrumentzerocheck: InstrumentZeroCheckDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.instrumentzerocheck(
      instrumentzerocheck,
      methodId,
    )
  }
  //7
  @Post('ni-mcit-d-01/external-parallelism-measurement/:methodId')
  async createNI_MCIT_D_01ExternalParallelismMeasurement(
    @Body() externalparallelismmeasurement: ExternalParallelismMeasurementDtoNI_MCIT_D_01,
    @Param('methodId') methodId: number,
  ) {
    return await this.ni_mcit_d_01service.externalparallelismmeasurement(
      externalparallelismmeasurement,
      methodId,
    )
  }

}
