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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    if (!user) throw new HttpException('Todos los campos son requeridos', 400)

    if (this.usersService.findByEmail(user.email))
      throw new HttpException('El usuario ya existe', 400)

    return this.usersService.create(user)
  }

  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) throw new HttpException('El id es requerido', 400)

    const user = await this.usersService.findById(+id)
    if (!user) throw new HttpException('El usuario no existe', 400)

    return user
  }
}
