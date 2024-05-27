import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Configuration } from './entities/configuration.entity'
import { AuthorizedServices } from './entities/authorized_services.entity'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { CreateEquipmentRegisterDto } from './dto/configuration.dto'
import {
  UpdateEquipmentRegisterDto,
  UpdateIvaRegisterDto,
} from './dto/update-configuration.dto'
import * as AuthorizedServicesJSON from './authorized-services.json'

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(AuthorizedServices)
    private readonly authorizedService: Repository<AuthorizedServices>,
    @InjectRepository(Configuration)
    private readonly ivaregister: Repository<Configuration>,
    private readonly dataSource: DataSource,
  ) {}
  async createEquipment(equipreg: CreateEquipmentRegisterDto) {
    const newEquipmentregister = this.authorizedService.create({
      ...equipreg,
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

  async createDefaultData() {
    const equipmentregister = AuthorizedServicesJSON.map((equipment) => {
      return this.authorizedService.create({
        ...equipment,
      })
    })

    try {
      for (const equipment of equipmentregister) {
        if (
          await this.authorizedService.findOneBy({
            equipment: equipment.equipment,
          })
        )
          continue

        await this.dataSource.transaction(async (manager) => {
          await manager.save(equipment)
        })
      }

      return handleOK(equipmentregister)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async findAllEquipment() {
    try {
      const results = await this.authorizedService.find()
      return handleOK(results)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async findEquipmentById(id: number) {
    try {
      return await this.authorizedService.findOne({
        where: { id },
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async findEquipmentByService(service: string) {
    try {
      const results = await this.authorizedService.findOne({
        where: { service },
      })

      return handleOK(results)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async deleteEquipmentById(id: number) {
    const configuration = await this.authorizedService.findOne({
      where: { id },
    })

    try {
      if (!configuration) {
        throw new Error('El registro no existe')
      }
      await this.authorizedService.delete({ id })

      return handleOK
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async updateEquipment(id: number, equip: UpdateEquipmentRegisterDto) {
    const equipreg = await this.authorizedService.findOneBy({ id: +id })

    if (!equipreg) return handleBadrequest(new Error('equipo no encontrado'))

    if (equip.service) {
      const userExists = await this.authorizedService.findOneBy({
        service: equip.service,
      })

      if (userExists)
        return handleBadrequest(new Error('El IVA ya está en uso'))
    }

    try {
      const updated = await this.authorizedService.update(+id, equip)
      return handleOK(updated)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async findAllIva() {
    try {
      return await this.ivaregister.find()
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async updateIva(id: 1, IVA: UpdateIvaRegisterDto) {
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
