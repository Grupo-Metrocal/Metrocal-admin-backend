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
//User
  @Post('signinUser')
  async signinUser(@Body() user: SigninAuthDto) {
    return await this.authService.signinUser(user)
  }
//User
  @Post('signupUser')
  async register(@Body() user: CreateUserDto) {
    return await this.authService.registerUser(user)
  }
//Admin
  @Post('singinAdmin')
  async singinAdmin(){

  }
  //Admin
  @Post('singupdmin')
  async singinadmin(@Body() user: CreateUserDto){
    return await this.authService.registerAdmin(user)
  }
}
