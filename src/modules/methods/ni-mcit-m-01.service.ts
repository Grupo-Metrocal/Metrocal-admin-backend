import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { handleInternalServerError, handleOK } from 'src/common/handleHttp'
import { exec } from 'child_process'

import { DataDto } from './dto/NI_MCIT_M_01/data.dto'
import { EquipmentInformationDto } from './dto/NI_MCIT_M_01/equipment_information.dto'

import { NI_MCIT_M_01 } from './entities/NI_MCIT_M_01/NI_MCIT_M_01.entity'
import { EquipmentInformationNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/equipment_information.entity'
import { DataNI_MCIT_M_01 } from './entities/NI_MCIT_M_01/steps/data.entity'

@Injectable()
export class NI_MCIT_M_01Service {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NI_MCIT_M_01)
    private readonly NI_MCIT_M_01Repository: Repository<NI_MCIT_M_01>,

    @InjectRepository(EquipmentInformationNI_MCIT_M_01)
    private readonly EquipmentInformationNI_MCIT_M_01Repository: Repository<EquipmentInformationNI_MCIT_M_01>,
    @InjectRepository(DataNI_MCIT_M_01)
    private readonly DataNI_MCIT_M_01Repository: Repository<DataNI_MCIT_M_01>,
  
    
  ) {}

  async create() {
    try {
      const newNI_MCIT_M_01 = this.NI_MCIT_M_01Repository.create()
      const method = await this.NI_MCIT_M_01Repository.save(newNI_MCIT_M_01)

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async autoSaveExcel(filePath: string) {
    return new Promise((resolve, reject) => {
      // save excel file from powershell

      const powershellCommand = `
      $Excel = New-Object -ComObject Excel.Application
      $Excel.Visible = $false
      $Excel.DisplayAlerts = $false
      $Workbook = $Excel.Workbooks.Open('${filePath}')
      $Workbook.Save()
      $Workbook.Close()
      $Excel.Quit()

      `

      exec(
        powershellCommand,
        { shell: 'powershell.exe' },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`)
            reject(error)
          } else if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`)
            reject(new Error(stderr))
          } else {
            resolve(stdout)
          }
        },
      )
    })
  }

  async equipmentInformation(
    equipment: EquipmentInformationDto,
    methodId: number,
  ) {
    const method = await this.NI_MCIT_M_01Repository.findOne({
      where: { id: methodId },
      relations: ['equipment_information'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingEquipment = method.equipment_information

    if (existingEquipment) {
      this.EquipmentInformationNI_MCIT_M_01Repository.merge(
        existingEquipment,
        equipment,
      )
    } else {
      const newEquipment =
        this.EquipmentInformationNI_MCIT_M_01Repository.create(equipment)
      method.equipment_information = newEquipment
    }
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.equipment_information)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async dataInformation(data: DataDto, methodId: number) {
    const method = await this.NI_MCIT_M_01Repository.findOne({
      where: { id: methodId },
      relations: ['data'],
    })

    if (!method) {
      return handleInternalServerError('El método no existe')
    }

    const existingData = method.data

    if (existingData) {
      this.DataNI_MCIT_M_01Repository.merge(existingData, data)
    } else {
      const newData = this.DataNI_MCIT_M_01Repository.create(data)
      method.data = newData
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(method.data)
        await manager.save(method)
      })

      return handleOK(method)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }
}
