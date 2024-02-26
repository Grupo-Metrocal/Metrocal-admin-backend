import { Injectable } from '@nestjs/common'
import { NI_MCIT_D_02 } from './entities/NI_MCIT_D_02/NI_MCIT_D_02.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { EquipmentInformationNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/equipment_information.dto'
import { EquipmentInformationNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/equipment_informatio.entity'
import { EnvironmentalConditionsNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/environmental_conditions.dto'
import { EnvironmentalConditionsNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/environmental_conditions.entity'
import { DescriptionPatternNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/description_pattern.entity'
import { DescriptionPatternNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/description_pattern.dto'
import { PreInstallationCommentNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/pre_installation_comment.dto'
import { PreInstallationCommentNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/pre_installation_comment.entity'
import { InstrumentZeroCheckNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/instrument_zero_check.dto'
import { InstrumentZeroCheckNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/instrument_zero_check.entity'
import { AccuracyTestNI_MCIT_D_02Dto } from './dto/NI_MCIT_D_02/accuracy_test.dto'
import { AccuracyTestNI_MCIT_D_02 } from './entities/NI_MCIT_D_02/steps/accuracy_test.entity'
import { executeTransaction } from 'src/utils/executeTransaction'

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
      });
  
 
      if (!method) {
        return handleInternalServerError('El método no existe');  
      }

      const existingEquipment = method.equipment_information; 

      if (existingEquipment) {
        this.EquipmentInformationRepository.merge(existingEquipment, equipment);
      } else {
        const newEquipment = this.EquipmentInformationRepository.create(equipment);
        method.equipment_information = newEquipment;
      }
      await executeTransaction(this.dataSource, method, method.equipment_information);
      return handleOK(method);
    
    } catch (error) {
      return handleInternalServerError(error.message);
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
      });

      if(!method){
        return handleInternalServerError('El método no existe');
      }
      const existingEnvironmentalConditions = method.environmental_conditions;
      if (existingEnvironmentalConditions) {
        this.EnvironmentalConditionsRepository.merge(
          existingEnvironmentalConditions,
          environmentalConditions,
        );
      } else {
        const newEnvironmentalConditions = this.EnvironmentalConditionsRepository.create(
          environmentalConditions,
        );
        method.environmental_conditions = newEnvironmentalConditions;
      }
      
      await executeTransaction(this.dataSource, method, method.environmental_conditions);
    } catch (error) {
      return handleInternalServerError(error.message);
    }
  }
  

  async descriptionPattern(descriptionPattern: DescriptionPatternNI_MCIT_D_02Dto,methodId: number,) {
    try {
      // Buscar el método existente
      const method = await this.NI_MCIT_D_02Repository.findOne({
        where: { id: methodId },
        relations: ['description_pattern'],
      });

      if (!method) {
        return handleInternalServerError('El método no existe');
      }

      const existingDescriptionPattern = method.description_pattern;

      if (existingDescriptionPattern) {
        this.DescriptionPatternRepository.merge(existingDescriptionPattern, descriptionPattern);
      } else {
        const newDescriptionPattern = this.DescriptionPatternRepository.create(descriptionPattern);
        method.description_pattern = newDescriptionPattern;
      }
      await executeTransaction(this.dataSource, method, method.description_pattern);

    } catch (error) {
      return handleInternalServerError(error.message);
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
      });
  
      if (!method) {
        return handleInternalServerError('El método no existe');
      }

      const existingPreInstallationComment = method.pre_installation_comment;

      if (existingPreInstallationComment) {
        this.PreInstallationCommentRepository.merge(existingPreInstallationComment, preInstallationComment);
      } else {
        const newPreInstallationComment = this.PreInstallationCommentRepository.create(preInstallationComment);
        method.pre_installation_comment = newPreInstallationComment;
      }
       await executeTransaction(this.dataSource, method, method.pre_installation_comment);

    } catch (error) {
      return handleInternalServerError(error.message);
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
      });
  
      if (!method) {
        return handleInternalServerError('El método no existe');
      }

      const existingInstrumentZeroCheck = method.instrument_zero_check;

      if (existingInstrumentZeroCheck) {
        this.InstrumentZeroCheckRepository.merge(existingInstrumentZeroCheck, instrumentZeroCheck);
      } else {
        const newInstrumentZeroCheck = this.InstrumentZeroCheckRepository.create(instrumentZeroCheck);
        method.instrument_zero_check = newInstrumentZeroCheck;
      }
      await executeTransaction(this.dataSource, method, method.instrument_zero_check);

    } catch (error) {
      return handleInternalServerError(error.message);
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
      });
  
      if (!method) {
        return handleInternalServerError('El método no existe');
      }

      const existingAccuracyTest = method.accuracy_test;

      if (existingAccuracyTest) {
        this.AccuracyTestRepository.merge(existingAccuracyTest, accuracyTest);
      } else {
        const newAccuracyTest = this.AccuracyTestRepository.create(accuracyTest);
        method.accuracy_test = newAccuracyTest;
      }

      await executeTransaction(this.dataSource, method, method.accuracy_test);
    } catch (error) {
      return handleInternalServerError(error.message);
    }
  }
  
}
