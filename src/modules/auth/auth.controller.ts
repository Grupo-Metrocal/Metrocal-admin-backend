import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags } from '@nestjs/swagger'
import { SigninAuthDto } from './dto/signin-auth.dto'
import { CreateUserDto } from '../users/dto/create-user.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() user: SigninAuthDto) {
    return await this.authService.signin(user)
  }

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    return await this.authService.register(user)
  }
}
