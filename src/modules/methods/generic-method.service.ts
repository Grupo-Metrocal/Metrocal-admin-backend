import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { inject } from "vue";
import { GENERIC_METHOD } from "./entities/GENERIC METHOD/GENERIC_METHOD.entity";
import { EquipmentInformationGENERIC_METHODDto } from "./dto/GENERIC METHOD/equipment_information.dto";
import { EnvironmentalConditionsGENERIC_METHOD } from "./entities/GENERIC METHOD/steps/enviromental_condition.entity";
import { handleInternalServerError, handleOK } from "src/common/handleHttp";

@Injectable()
export class GENERIC_METHODService {
  // Add your methods here
  constructor(
    private readonly dataSource : DataSource,
    @InjectRepository(GENERIC_METHOD)
    private readonly GENERIC_METHODRepository: Repository<GENERIC_METHOD>,

    @InjectRepository(EquipmentInformationGENERIC_METHODDto) 
    private readonly equipmentInformationGENERIC_METHODRepository: Repository<EquipmentInformationGENERIC_METHODDto>,

    @InjectRepository(EnvironmentalConditionsGENERIC_METHOD)
    private readonly environmentalConditionsGENERIC_METHODRepository: Repository<EnvironmentalConditionsGENERIC_METHOD>,
    
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
    methodId : number
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
            // const newEquipment = 
            // this.equipmentInformationGENERIC_METHODRepository.create(equipement);
            // method.equipment_information = newEquipment;
            
        }
    }
    catch (error) {
      return handleInternalServerError(error.message);
    }
  }
}
