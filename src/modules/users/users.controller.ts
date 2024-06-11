import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  HttpException,
  ParseFilePipeBuilder,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UpdateProfileImageDto } from './dto/update-profile-image.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PasswordRestoreDto } from './dto/password-restore.dto'
import { handleBadrequest, handleOK } from 'src/common/handleHttp'
import { InvitationMail } from '../mail/dto/invitation-mail.dto'
import { FileInterceptor } from '@nestjs/platform-express'

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() user: CreateUserDto) {
    if (!user) return handleBadrequest(new Error('El usuario es requerido'))

    if (user.password.length < 8)
      return handleBadrequest(
        new Error('La contraseña debe tener al menos 8 caracteres'),
      )

    return await this.usersService.create(user)
  }

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

  @UseGuards(JwtAuthGuard)
  @Post('assign/:userId/role/:roleId')
  async assingRole(
    @Param('userId') id: number,
    @Param('roleId') roleId: number,
  ) {
    return await this.usersService.assignRole(id, roleId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove/:userId/role/:roleId')
  async removeRole(
    @Param('userId') id: number,
    @Param('roleId') roleId: number,
  ) {
    return await this.usersService.deleteRoleFromUser(id, roleId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete() {
    return await this.usersService.deleteAllUsers()
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!id) throw new HttpException('El id es requerido', 400)

    if (isNaN(+id)) throw new HttpException('El id debe ser un número', 400)

    return await this.usersService.remove(+id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/update/:token')
  async update(@Param('token') token: string, @Body() user: UpdateUserDto) {
    console.log('update user', user)
    return await this.usersService.updateUserByToken(token, user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('invitation-user/:email')
  async invitationUser(@Param('email') email: string) {
    return await this.usersService.invitationForUser({
      email,
    } as InvitationMail)
  }

  @UseGuards(JwtAuthGuard)
  @Get('data-user/:token')
  async dataUser(@Param('token') token: string) {
    return await this.usersService.getUserData(token)
  }
}
