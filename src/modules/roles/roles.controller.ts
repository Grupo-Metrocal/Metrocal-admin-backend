import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { HttpException } from '@nestjs/common'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll()
  }

  @Post()
  async create(@Body() role: CreateRoleDto) {
    if (!role)
      throw new HttpException('Por favor rellene todos los campos', 400)

    if (this.rolesService.findByName(role.name))
      throw new HttpException('El rol ya existe', 400)

    return this.rolesService.create(role)
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    if (!name) throw new HttpException('El nombre es requerido', 400)

    const role = await this.rolesService.findByName(name)
    if (!role) throw new HttpException('El rol no existe', 400)

    return role
  }
}
