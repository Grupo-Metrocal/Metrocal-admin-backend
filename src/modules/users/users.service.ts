import { Injectable, HttpException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { hash } from 'bcrypt'
import { User } from './entities/user.entity'
import { ResetPassword } from './entities/reset-password.entity'
import { MailService } from '../mail/mail.service'
import { passwordResetCodeGenerator } from 'src/utils/codeGenerator'
import { PasswordRestoreDto } from './dto/password-restore.dto'
import {
  handleBadrequest,
  handleInternalServerError,
  handleOK,
} from 'src/common/handleHttp'
import { RolesService } from '../roles/roles.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly mailService: MailService,
    private readonly rolesService: RolesService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    })
    if (user) return handleBadrequest(new Error('El usuario ya existe'))

    const role = await this.rolesService.getDefaultsRole()
    if (!role.status)
      return handleBadrequest(new Error('El rol por defecto no existe'))

    const hashedPassword = await hash(createUserDto.password, 10)
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: [role.data],
    })

    try {
      await this.mailService.sendMailWelcomeApp({
        user: createUserDto.email,
        name: createUserDto.username,
      })
      const response = await this.userRepository.save(newUser)
      return handleOK({
        id: response.id,
        username: response.username,
        email: response.email,
        roles: response.roles,
      })
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async deleteById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new HttpException('Usuario no encontrado', 404)
    return await this.userRepository.remove(user)
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        relations: ['roles'],
      })

      return handleOK(users)
    } catch (error) {
      handleBadrequest(error)
    }
  }

  async findById(id: number): Promise<User | {}> {
    const user = await this.userRepository.findOneBy({ id })
    return user ? user : { statusCode: 404, message: 'Usuario no encontrado' }
  }

  async updateById(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new HttpException('Usuario no encontrado', 404)

    const hashedPassword = await hash(updateUserDto.password, 10)
    const updatedUser = this.userRepository.merge(user, {
      ...updateUserDto,
      password: hashedPassword,
    })

    return await this.userRepository.save(updatedUser)
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new HttpException('Usuario no encontrado', 404)

    return user
  }

  async passwordRestoreRequest(email: string) {
    const user = await this.userRepository.findOneBy({ email })

    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    const code = passwordResetCodeGenerator({ length: 6, suffix: 'MTC' })
    const experiedAt = new Date()
    experiedAt.setMinutes(experiedAt.getMinutes() + 1)

    const resetPassword = this.resetPasswordRepository.create({
      email,
      code,
      experiedAt,
    })

    try {
      const [reset] = await Promise.all([
        this.resetPasswordRepository.save(resetPassword),
        this.mailService.sendMailResetPassword(email, code),
      ])

      return handleOK({
        idCode: reset.id,
      })
    } catch (error) {
      handleInternalServerError(error)
    }
  }

  async restorePassword({ email, code, idCode, password }: PasswordRestoreDto) {
    const user = await this.findByEmail(email)

    const resetPassword = await this.resetPasswordRepository.findOneBy({
      id: idCode,
    })

    if (!resetPassword) return handleBadrequest(new Error('Código no válido'))

    if (resetPassword.code !== code)
      return handleBadrequest(new Error('Código no válido'))

    const now = new Date()
    if (now > resetPassword.experiedAt)
      return handleBadrequest(new Error('Código expirado'))

    const hashedPassword = await hash(password, 10)

    try {
      await Promise.all([
        this.userRepository.update(user.id, { password: hashedPassword }),
        this.resetPasswordRepository.delete(resetPassword.id),
      ])

      return handleOK('Contraseña actualizada')
    } catch (error) {
      handleInternalServerError(error)
    }
  }

  async assignRole(id: number, roleID: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    })
    const role = await this.rolesService.findById(roleID)

    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    if (!role.success) return handleBadrequest(new Error('Rol no encontrado'))

    const roleExists = user.roles.find((role) => role.id === Number(roleID))
    if (roleExists)
      return handleBadrequest(new Error('El usuario ya tiene ese rol'))

    try {
      user.roles.push(role.data)
      await this.userRepository.save(user)
      return handleOK('Rol asignado')
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async deleteAllUsers() {
    try {
      const users = await this.userRepository.find()
      await this.userRepository.remove(users)
      return handleOK('Usuarios eliminados')
    } catch (error) {
      return handleInternalServerError(error)
    }
  }
}
