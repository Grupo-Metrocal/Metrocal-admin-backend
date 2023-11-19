import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Configuration, EquipmentRegister} from './entities/configuration.entity'
import { handleBadrequest, handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { CreateEquipmentRegisterDto } from './dto/configuration.dto'
import { UpdateEquipmentRegisterDto, UpdateIvaRegisterDto } from './dto/update-configuration.dto'


@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(EquipmentRegister)
    private readonly equipmentregister: Repository<EquipmentRegister>,
    @InjectRepository(Configuration)
    private readonly ivaregister: Repository<Configuration>,
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
      description: ['Calibrador universal, (vernier o pie de rey) - Analogico','ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['0.01 mm'],
      document_delivered: 'Certificado de calibracion acreditado', 
      price: 45,
    },
    {
      id:2, 
      method: 'NI-MCIT-D-01', 
      service: 'Calibracion acreditada',
      description: ['Calibracion universal, (vernier o pie de rey) - Digital','ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['0.01 mm'],
      document_delivered: 'Certificado de calibracion acreditado', 
      price: 45,
    },
    {
      id:3, 
      method: 'NI-MCIT-D-02', 
      service: 'Calibracion acreditada',
      description: ['Micrometro de exteriores - Analogico','ACREDITADO'],
      measuring_range: '(0 a 25) mm',
      accuracy: ['0.001 mm'],
      document_delivered: 'Certificado de calibracion acreditado', 
      price: 45,
    },
    {
      id:4, 
      method: 'NI-MCIT-D-02', 
      service: 'Calibracion acreditada',
      description: ['Micrometro de exteriores - Digital','ACREDITADO'],
      measuring_range: '(0 a 25) mm',
      accuracy: ['0.001 mm'],
      document_delivered: 'Certificado de calibracion acreditado', 
      price: 45,
    },
    {
      id:4, 
      method: 'No Aplica (N/A)', 
      service: 'Calibracion intermedia',
      description: ['*Comprobacion intermedia de qeuipos de longitud','Aplica solo para equipos calibrados previamente por Metrocal (Max. 2pts de comprobacion)','NO ACREDITADO'],
      measuring_range: '(0 a 300) mm',
      accuracy: ['0.001 mm','0.01 mm'],
      document_delivered: 'Certificado trazable', 
      price: 25,
    },
    {
      id:5, 
      method: 'Comprobacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Pin de longitud','Variable con micrometros (Unidad - Válido para mas de 5)','NO ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['0.001 mm'],
      document_delivered: 'Certificado trazable', 
      price: 25,
    },
    {
      id:6, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Compradores de caratula','NO ACREDITADO'],
      measuring_range: '(0 a 300) mm',
      accuracy: ['0.001 mm'],
      document_delivered: 'Certificado trazable', 
      price: 45,
    },
    {
      id:7, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Medidor de altura, altimetro','NO ACREDITADO'],
      measuring_range: '(0 a 300) mm',
      accuracy: ['0.01 mm'],
      document_delivered: 'Certificado trazable', 
      price: 70,
    },
    {
      id:8, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Medidor de profundidad','NO ACREDITADO'],
      measuring_range: '(0 a 25) mm',
      accuracy: ['0.1 mm'],
      document_delivered: 'Certificado trazable', 
      price: 45,
    },
    {
      id:9, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Rreglas rigidas','NO ACREDITADO'],
      measuring_range: '(0 a 1000) mm',
      accuracy: ['0.1 mm'],
      document_delivered: 'Certificado trazable', 
      price: 70,
    },
    {
      id:10, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Cintas metricas','NO ACREDITADO'],
      measuring_range: '(0 a 1000) mm',
      accuracy: ['10 mm'],
      document_delivered: 'Certificado trazable', 
      price: 70,
    },
    {
      id:11, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Calibracion de bloques longitudinales (unidad)','Valido para mas de 5 Unidades','NO ACREDITADO'],
      measuring_range: '(0 a 100) mm',
      accuracy: ['N/A'],
      document_delivered: 'Certificado trazable', 
      price: 10,
    },
    {
      id:12, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Calibre pasa no pasa','NO ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['N/A'],
      document_delivered: 'Certificado trazable', 
      price: 30,
    },
    {
      id:13, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Gaje para engargolado','NO ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['N/A'],
      document_delivered: 'Certificado trazable', 
      price: 30,
    },
    {
      id:14, 
      method: 'Comparacion directa', 
      service: 'Calibracion no acreditada',
      description: ['*Medidor de nivel','NO ACREDITADO'],
      measuring_range: '(0 a 200) mm',
      accuracy: ['N/A'],
      document_delivered: 'Certificado trazable', 
      price: 70,
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

//Mostrar IVA
    async findAllIva(){
  try{
    return await this.ivaregister.find()

  }catch(error){
    return handleInternalServerError(error.message)
  }
    }

//Actualizar IVA
    async updateIva(id: 1, IVA: UpdateIvaRegisterDto){
      
      const user = await this.ivaregister.findOneBy({ id: +id })
      if (!user) return handleBadrequest(new Error('IVA no encontrado'))
  
      if (IVA.IVA) {
        const userExists = await this.ivaregister.findOneBy({
          IVA: IVA.IVA,
        })
        if (userExists)
          return handleBadrequest(new Error('El IVA ya está en uso'))
      }
  
      try {
        const updated = await this.ivaregister.update(+id, IVA)
        return handleOK(updated)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
    
    }

}