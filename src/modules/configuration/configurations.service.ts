import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { EquipmentRegister} from './entities/configuration.entity'
import { handleBadrequest, handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { CreateEquipmentRegisterDto } from './dto/configuration.dto'
import { UpdateEquipmentRegisterDto } from './dto/update-configuration.dto'


@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(EquipmentRegister)
    private readonly equipmentregister: Repository<EquipmentRegister>,
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
  async createDefaultData(){
    const equipmentregister=[
    {
      id:1, 
      method: 'NI-MCIT-D-01', 
      service: 'Calibracion acreditada',
      description: '',
      measuring_range: '(0 a 200) mm',
      accuracy: '',
      document_delivered: 'Certificado de calibracion acreditado', 
      price: 45,

    },

  ]

    
    try {
      
        for (const equipment of equipmentregister) {
          await this.equipmentregister.save(equipment);
        }
      
      
      return handleOK(equipmentregister)
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

        try{
          return await this.equipmentregister.findOne({
            where: { id },
            })
         
        }catch(error){
          return handleInternalServerError(error.message)
        }
       

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

    return handleOK
  } catch (error) {
    return handleInternalServerError(error.message)
   
  }
    }

//Actualizar equipo
async updateEquipment(id:number, equip: UpdateEquipmentRegisterDto){

  const equipreg = await this.equipmentregister.findOneBy({ id: +id })
  
  if (!equipreg) return handleBadrequest(new Error('equipo no encontrado'))

  if (equip.service) {
    const userExists = await this.equipmentregister.findOneBy({
      service: equip.service,
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

//Mostrar todos los IVA
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