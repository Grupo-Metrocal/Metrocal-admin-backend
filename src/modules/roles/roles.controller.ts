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
import { ApiTags } from '@nestjs/swagger'
import { handleBadrequest } from 'src/common/handleHttp'

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll()
  }

  @Post()
  async create(@Body() role: CreateRoleDto) {
    if (!role) return handleBadrequest(new Error('El rol es requerido'))

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
