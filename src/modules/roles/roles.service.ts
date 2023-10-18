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

  async findAll() {
    try {
      const roles = await this.roleRepository.find()
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
}
