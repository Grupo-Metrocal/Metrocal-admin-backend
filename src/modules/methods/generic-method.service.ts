import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GENERIC_METHOD } from "./entities/GENERIC METHOD/GENERIC_METHOD.entity";
import { EquipmentInformationGENERIC_METHODDto } from "./dto/GENERIC METHOD/equipment_information.dto";
import { EnvironmentalConditionsGENERIC_METHODDto } from "./dto/GENERIC METHOD/enviromental_condition.dto";
import { Result_MeditionGENERIC_METHODDto } from "./dto/GENERIC METHOD/result_medition.dto";
import { EnvironmentalConditionsGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/enviromental_condition.entity";
import { handleInternalServerError, handleOK } from "src/common/handleHttp";
import { EquipmentInformationGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/equipment_information.entity";
import { ComputerDataGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/computer_data.entity";
import { ComputerDataGENERIC_METHODDto } from "./dto/GENERIC METHOD/computer_data.dto";
import { ResultMeditionGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/result_medition.entity";

@Injectable()
export class GENERIC_METHODService {
  // Add your methods here
  constructor(
    private readonly dataSource : DataSource,
    @InjectRepository(GENERIC_METHOD)
    private readonly GENERIC_METHODRepository: Repository<GENERIC_METHOD>,

    @InjectRepository(EquipmentInformationGENERIC_METHOD) 
    private readonly equipmentInformationGENERIC_METHODRepository: Repository<EquipmentInformationGENERIC_METHOD>,

    @InjectRepository(EnvironmentalConditionsGENERIC_METHOD)
    private readonly environmentalConditionsGENERIC_METHODRepository: Repository<EnvironmentalConditionsGENERIC_METHOD>,

    @InjectRepository(ComputerDataGENERIC_METHOD)
    private readonly computerDataGENERIC_METHODRepository: Repository<ComputerDataGENERIC_METHOD>,
    
    @InjectRepository(ResultMeditionGENERIC_METHOD)
    private readonly resultMeditionGENERIC_METHODRepository: Repository<ResultMeditionGENERIC_METHOD>,
  ) {}

  async create(){
    try {
      const newGENERIC_METHOD = this.GENERIC_METHODRepository.create();
      const method = await this.GENERIC_METHODRepository.save(newGENERIC_METHOD);
      return handleOK(method);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async equipmentInformationCreate(
    equipement : EquipmentInformationGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['equipment_information']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingEquipment = method.equipment_information;

        if (existingEquipment) {
           this.equipmentInformationGENERIC_METHODRepository.merge(
            existingEquipment,
            equipement
           )
        }else{
            const newEquipment = 
            this.equipmentInformationGENERIC_METHODRepository.create(equipement);
            method.equipment_information = newEquipment;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.equipment_information);
            await manager.save(method);
          });
          return handleOK(method.equipment_information);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async environmentalConditionsCreate(
    environmentalConditions : EnvironmentalConditionsGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['environmental_conditions']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingEnvironmentalConditions = method.environmental_conditions;

        if (existingEnvironmentalConditions) {
           this.environmentalConditionsGENERIC_METHODRepository.merge(
            existingEnvironmentalConditions,
            environmentalConditions
           )
        }else{
            const newEnvironmentalConditions = 
            this.environmentalConditionsGENERIC_METHODRepository.create(environmentalConditions);
            method.environmental_conditions = newEnvironmentalConditions;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.environmental_conditions);
            await manager.save(method);
          });
          return handleOK(method.environmental_conditions);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async computerDataCreate(
    computerData : ComputerDataGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['computer_data']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingComputerData = method.computer_data;

        if (existingComputerData) {
           this.computerDataGENERIC_METHODRepository.merge(
            existingComputerData,
            computerData
           )
        }else{
            const newComputerData = 
            this.computerDataGENERIC_METHODRepository.create(computerData);
            method.computer_data = newComputerData;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.computer_data);
            await manager.save(method);
          });
          return handleOK(method.computer_data);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }

  async resultMeditionCreate(
    resultMedition : Result_MeditionGENERIC_METHODDto,
    methodId : number,
  ){
    try {
      const method = await this.GENERIC_METHODRepository.findOne({
        where: { id: methodId },
        relations: ['result_medition']
      })
        if (!method) {
            return handleInternalServerError('Method not found');
        }
        const existingResultMedition = method.result_medition;

        if (existingResultMedition) {
           this.resultMeditionGENERIC_METHODRepository.merge(
            existingResultMedition,
            resultMedition
           )
        }else{
            const newResultMedition = 
            this.resultMeditionGENERIC_METHODRepository.create(resultMedition);
            method.result_medition = newResultMedition;         
          }

          await this.dataSource.transaction(async (manager) => {
            await manager.save(method.result_medition);
            await manager.save(method);
          });
          return handleOK(method.result_medition);
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }
}
