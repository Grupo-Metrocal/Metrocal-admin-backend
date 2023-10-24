import { Injectable, HttpException } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './entities/role.entity'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { User } from '../users/entities/user.entity'
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    })

    if (role) return handleBadrequest(new Error('El rol ya existe'))

    try {
      const created = await this.roleRepository.save(createRoleDto)
      return handleOK(created)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async createDefaultRoles() {
    const roles = [
      {
        name: 'admin',
        description:
          'Todos los usuarios que tengan este rol seran administradores, y tendran acceso a todas las funcionalidades del sistema',
        priority: 1,
        label: 'Administrador',
      },
      {
        name: 'user',
        description:
          'Todos los usuarios que tengan este rol seran usuarios, y su acceso sera limitado',
        priority: 5,
        label: 'Usuario',
      },
    ]

    roles.forEach(async (role) => {
      const roleExists = await this.roleRepository.findOne({
        where: { name: role.name },
      })

      if (!roleExists) await this.roleRepository.save(role)
    })
  }

  async getDefaultsRole() {
    const role = await this.roleRepository.findOne({ where: { name: 'user' } })
    if (!role) return handleBadrequest(new Error('El rol user no existe'))
    return handleOK({ ...role })
  }

  async findAll() {
    try {
      const roles = await this.roleRepository.find({
        relations: ['users'],
        order: { id: 1 },
      })
      return handleOK(roles)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async findByName(name: string) {
    try {
      const role = await this.roleRepository.find({ where: { name } })
      return handleOK(role[0])
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async findById(id: number) {
    try {
      const role = await this.roleRepository.findOneBy({ id })

      if (!role) return handleBadrequest(new Error('El rol no existe'))

      return handleOK(role)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async updateById(id: number, user: User) {
    try {
      const role = await this.roleRepository.findOneBy({ id })

      const updated = await this.roleRepository.save({ ...role, ...user })
      return handleOK(updated)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async renameRole(id: number, label: string) {
    try {
      const role = await this.roleRepository.findOneBy({ id })

      const updated = await this.roleRepository.save({ ...role, label })
      return handleOK(updated)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }
}
