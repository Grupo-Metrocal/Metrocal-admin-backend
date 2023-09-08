import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { HttpException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    if (!user) throw new HttpException('Todos los campos son requeridos', 400)

    return this.usersService.create(user)
  }

  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) throw new HttpException('El id es requerido', 400)

    if (isNaN(+id)) throw new HttpException('El id debe ser un número', 400)

    return await this.usersService.findById(+id)
  }
}
