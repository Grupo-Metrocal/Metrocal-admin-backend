import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { EquipmentRegister, IvaRegister} from './entities/configuration.entity'
import { handleBadrequest, handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { CreateEquipmentRegisterDto, CreateIvaRegisterDto } from './dto/configuration.dto'
import { UpdateEquipmentRegisterDto, UpdateIvaRegisterDto } from './dto/update-configuration.dto'


@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(EquipmentRegister)
    private readonly equipmentregister: Repository<EquipmentRegister>,
    @InjectRepository(IvaRegister)
    private readonly ivaregister: Repository<IvaRegister>,
    private readonly dataSource: DataSource) {}
// Crear equipo
    async createEquipment(equipreg: CreateEquipmentRegisterDto) {
        
        const newEquipmentregister = this.equipmentregister.create({
          ...equipreg
        })
        
        try {
          await this.dataSource.transaction(async (manager) => {
            await manager.save(newEquipmentregister)
          })

          return handleOK(newEquipmentregister)
        } catch (error) {
          return handleInternalServerError(error.message)
        }
      }

//Create default equipo
      async createDefaultEquipment(){
      const calib = new EquipmentRegister();
      calib.id= 1;
      calib.type_service= 'calibracion';
      calib.equipment= ['equipo 1','equipo 2','equipo 3']
      calib.measuring_range= ['(0-100) mm','(0-100) mm','(0-100) mm']

      const veri = new EquipmentRegister();
      veri.id= 2;
      veri.type_service= 'verification';
      veri.equipment= ['equipo 1','equipo 2','equipo 3']
      veri.measuring_range= ['(0-100) mm','(0-100) mm','(0-100) mm']

      const calibration = new EquipmentRegister();
      calibration.id= 3;
      calibration.type_service= 'calibration';
      calibration.equipment= ['equipo 1','equipo 2','equipo 3']
      calibration.measuring_range= ['(0-100) mm','(0-100) mm','(0-100) mm']
      
      const IVA= new IvaRegister();
      IVA.IVA= 15
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.save(calib)
        })

        await this.dataSource.transaction(async (manager) => {
          await manager.save(veri)
        })

        await this.dataSource.transaction(async (manager) => {
          await manager.save(calibration)
        })

        await this.dataSource.transaction(async (manager) => {
          await manager.save(IVA)
        })

        return handleOK(calib),handleOK(veri),handleOK(calibration)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
      }
      
// Mostrar todos los equipos
    async findAllEquipment(){
      try{
        return await this.equipmentregister.find()

      }catch(error){
        return handleInternalServerError(error.message)
      }
    }

// buscar equipo por id
    async findEquipmentById(id: number){

      return await this.equipmentregister.findOne({
        where: { id },
        })

    }

// Eliminar equipo poe id
    async deleteEquipmentById(id: number) {
  const configuration = await this.equipmentregister.findOne({
    where: { id },
  })

  try {
    if (!configuration) {
      throw new Error('El registro no existe')
    }
    await this.equipmentregister.delete({ id })
    return true
  } catch (error) {
    return handleInternalServerError(error.message)
   
  }
    }

//Actualizar equipo
async updateEquipment(id:number, equip: UpdateEquipmentRegisterDto){

  const user = await this.equipmentregister.findOneBy({ id: +id })
  if (!user) return handleBadrequest(new Error('equipo no encontrado'))

  if (equip.type_service) {
    const userExists = await this.equipmentregister.findOneBy({
      type_service: equip.type_service,
    })
    if (userExists)
      return handleBadrequest(new Error('El IVA ya está en uso'))
  }

  try {
    const updated = await this.equipmentregister.update(+id, equip)
    return handleOK(updated)
  } catch (error) {
    return handleInternalServerError(error.message)
  } 
}


/*
//Crear IVA
    async createIva(iva:CreateIvaRegisterDto){
  const newIvaRegister = this.ivaregister.create({
    ...iva
  })
  
  try {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(newIvaRegister)
    })

    return handleOK(newIvaRegister)
  } catch (error) {
    return handleInternalServerError(error.message)
  }
    }

//Mostrar todos los IVA*/
    async findAllIva(){
  try{
    return await this.ivaregister.find()

  }catch(error){
    return handleInternalServerError(error.message)
  }
    }

//Buscar IVA por id
    async findIvaById(id: number){

  return await this.ivaregister.findOne({
    where: { id },
    })

    }
/*
//Eliminar IVA por id
async deleteIvaById(id: number) {
  const configuration = await this.ivaregister.findOne({
    where: { id },
  })

  try {
    if (!configuration) {
      throw new Error('El IVA no existe')
    }
    await this.ivaregister.delete({ id })
    return true
  } catch (error) {
    return handleInternalServerError(error.message)
   
  }
    }

//Actualizar IVA
    async updateIva(id:number, IVAsss: UpdateIvaRegisterDto){

      const user = await this.ivaregister.findOneBy({ id: +id })
      if (!user) return handleBadrequest(new Error('IVA no encontrado'))
  
      if (IVAsss.IVA) {
        const userExists = await this.ivaregister.findOneBy({
          IVA: IVAsss.IVA,
        })
        if (userExists)
          return handleBadrequest(new Error('El IVA ya está en uso'))
      }
  
      try {
        const updated = await this.ivaregister.update(+id, IVAsss)
        return handleOK(updated)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    
    }
*/
}