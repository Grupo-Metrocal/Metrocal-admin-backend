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
import { HttpException, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PasswordRestoreDto } from './dto/password-restore.dto'
import { handleBadrequest } from 'src/common/handleHttp'

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() user: CreateUserDto) {
    if (!user) throw new HttpException('Todos los campos son requeridos', 400)

    if (!user.password)
      throw new HttpException('La contraseña es requerida', 400)

    if (user.password.length < 8)
      throw new HttpException(
        'La contraseña debe tener al menos 8 caracteres',
        400,
      )

    try {
      return await this.usersService.create(user)
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) throw new HttpException('El id es requerido', 400)

    if (isNaN(+id)) throw new HttpException('El id debe ser un número', 400)

    return await this.usersService.findById(+id)
  }

  @Post('password-restore-request/:email')
  async passwordRestoreRequest(@Param('email') email: string) {
    if (!email) handleBadrequest(new Error('El email es requerido'))

    return await this.usersService.passwordRestoreRequest(email)
  }

  @Post('restore-password')
  async restorePassword(@Body() passwordRestoreDto: PasswordRestoreDto) {
    return await this.usersService.restorePassword(passwordRestoreDto)
  }
}
