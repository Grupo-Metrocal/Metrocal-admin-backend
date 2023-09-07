import { Injectable, HttpException } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './entities/role.entity'
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.roleRepository.save(createRoleDto)
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      const roles = await this.roleRepository.find()
      return roles
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async findByName(name: string): Promise<Role> {
    try {
      const role = await this.roleRepository.find({ where: { name } })
      return role[0]
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }
}
