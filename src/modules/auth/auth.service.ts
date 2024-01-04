import { Injectable, HttpException } from '@nestjs/common'
import { SigninAuthDto } from './dto/signin-auth.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { handleBadrequest, handleOK } from 'src/common/handleHttp'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
//User
  async signinUser(user: SigninAuthDto) {
    const { email, password } = user

    const userFound = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'password'],
      // relations: ['roles'],
    })
    if (!userFound) return handleBadrequest(new Error('Credenciales inválidas'))

    const isMathPassword = await compare(password, userFound.password)
    if (!isMathPassword)
      return handleBadrequest(new Error('Credenciales inválidas'))

    const payload = {
      sub: userFound.id,
      email: userFound.email,
      // roles: userFound.roles.map((role) => role.name),
    }
    const token = this.jwtService.sign(payload)

    return handleOK({
      username: userFound.username,
      token,
    })
  }
//User
  async registerUser(user: CreateUserDto) {
    return await this.usersService.createUser(user)
  }
  //Admin
  async registerAdmin(admin: CreateUserDto) {
    return await this.usersService.createAdmin(admin)
  }
  //Admin
  async singinAdmin(){}
}
