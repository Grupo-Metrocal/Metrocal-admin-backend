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
import { TokenService } from '../auth/jwt/jwt.service'
import { InvitationMail } from '../mail/dto/invitation-mail.dto'
import * as admin from 'firebase-admin'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly mailService: MailService,
    private readonly rolesService: RolesService,
    private readonly tokenService: TokenService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    })

    if (user) return handleBadrequest(new Error('El usuario ya existe'))

    const role = (await this.rolesService.getDefaultsRole()) as any
    const hashedPassword = await hash(createUserDto.password, 10)
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })
    try {
      await this.mailService.sendMailWelcomeApp({
        user: createUserDto.email,
        name: createUserDto.username,
        loginURL: process.env.LOGIN_PAGE,
      })
      const response = await this.userRepository.save(newUser)
      const saved = await this.assignRole(response.id, role.data.id as number)

      delete saved.data.password

      return handleOK(saved.data)
    } catch (error) {
      console.log(
        `Error al crear al usuario:${createUserDto.username} ->`,
        error.message,
      )
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

      const filteredUsers = users.map((user: User) => {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles.map((role) => {
            return {
              id: role.id,
              name: role.name,
              description: role.description,
              priority: role.priority,
              label: role.label,
            }
          }),
          imageURL: user.imageURL,
          creted_at: user.created_at,
        }
      })

      return handleOK(filteredUsers)
    } catch (error) {
      handleBadrequest(error)
    }
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'quote_requests', 'activities'],
    })
    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    return handleOK(user)
  }

  async updateUserByToken(token: string, updateUserDto: UpdateUserDto) {
    const { sub: id } = this.tokenService.decodeToken(token)

    const user = await this.userRepository.findOneBy({ id: +id })
    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    if (updateUserDto.email) {
      const userExists = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      })
      if (userExists)
        return handleBadrequest(new Error('El email ya está en uso'))
    }

    if (updateUserDto.password) {
      const hashedPassword = await hash(updateUserDto.password, 10)
      updateUserDto.password = hashedPassword
    }

    try {
      const updated = await this.userRepository.update(+id, updateUserDto)
      return handleOK(updated)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }

  async updateImageProfileByToken(token: string, image: Express.Multer.File) {
    const { sub: id } = this.tokenService.decodeToken(token)

    const user = await this.userRepository.findOneBy({ id: +id })
    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    try {
      const bucket = admin.storage().bucket()
      const fileName = `${Date.now()}-${user.id}`
      const file = bucket.file(fileName)

      const stream = file.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      })

      stream.on('error', (error) => {
        console.log('Error al subir la imagen ->', error.message)
        return handleInternalServerError(error.message)
      })

      stream.on('finish', async () => {
        const imageURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.name}?alt=media`
        const updated = await this.userRepository.update(+id, { imageURL })
        console.log(imageURL)
        return handleOK(updated)
      })

      stream.end(image.buffer)
    } catch (error) {
      return handleInternalServerError(error.message)
    }
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
      const saved = await this.userRepository.save(user)
      return handleOK(saved)
    } catch (error) {
      return handleInternalServerError(error)
    }
  }

  async deleteRoleFromUser(idL: number, roleId: number) {
    const user = await this.userRepository.findOne({
      where: { id: idL },
      relations: ['roles'],
    })
    const role = await this.rolesService.findById(roleId)

    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))

    if (!role.success) return handleBadrequest(new Error('Rol no encontrado'))

    const roleExists = user.roles.find((role) => role.id === Number(roleId))
    if (!roleExists)
      return handleBadrequest(new Error('El usuario no tiene ese rol'))

    try {
      user.roles = user.roles.filter((role) => role.id !== Number(roleId))
      const saved = await this.userRepository.save(user)
      return handleOK(saved)
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

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new HttpException('Usuario no encontrado', 404)

    const deletedUser = await this.userRepository.remove(user)
    return handleOK(deletedUser)
  }

  async createDefaultUsers() {
    const users = [
      {
        username: 'Roberto REGXI',
        email: 'roberto.zelaya@regxi.com',
        password: 'Metrocal.2023',
        role: 'admin',
      },
    ]

    users.forEach(async (user) => {
      const userExists = await this.userRepository.findOne({
        where: { email: user.email },
      })
      if (!userExists) {
        // if (user.ignore) return
        console.log(`Creando usuario: ${user.username}`)
        const userCreated = await this.create({
          username: user.username,
          email: user.email,
          password: user.password,
        })

        if (userCreated.success) {
          const role = await this.rolesService.findByName(user.role)
          await this.assignRole(userCreated.data.id, role.data.id as number)
        } else {
          return handleBadrequest(new Error('Error al crear usuario'))
        }
      }
    })
  }

  async invitationForUser(email: InvitationMail) {
    try {
      email.linkToNewQuote = `${process.env.DOMAIN}/`

      await this.mailService.sendInvitationMail(email)
      return handleOK('Ok')
    } catch (error) {
      return handleInternalServerError(error.message)
    }
  }


  async updateProfileImageByToken(token: string, userName : string, image: Express.Multer.File, imageUrl: string) {
    const { sub: id } = this.tokenService.decodeToken(token)

    const user = await this.userRepository.findOneBy({ id: +id })
    user.username = userName
    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))
    if(!image && !imageUrl) 
    {
      const updateUserDto = {
        username: userName,
      }
       await this.userRepository.update(+id, updateUserDto)
       var user1 = await this.userRepository.findOneBy({ id: +id })
      
      return user1
    }

     if(!image && imageUrl){
      user.imageURL = imageUrl
       await this.userRepository.update(+id, user)
       var users = await this.userRepository.findOneBy({ id: +id })
      return users
     }else{
      try {
        const bucket = admin.storage().bucket()
        const fileName = `${userName}-${Date.now()}-${user.id}`
        const file = bucket.file(fileName)
  
        const stream = file.createWriteStream({
          metadata: {
            contentType: image.mimetype,
          },
        })
  
        stream.on('error', (error) => {
          console.log('Error al subir la imagen ->', error.message)
          return handleInternalServerError(error.message)
        })
  
        stream.on('finish', async () => {
          const imageURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.name}?alt=media`
          //preparar el objeto para actualizar UpdateUserDto
          const updateUserDto = {
            imageURL: imageURL,
            username: userName,
          }
           await this.userRepository.update(+id, updateUserDto)
           var user = await this.userRepository.findOneBy({ id: +id })
          return user
        })
  
        stream.end(image.buffer)
      } catch (error) {
        return handleInternalServerError(error.message)
      }
      
     }
  }

  async getUserData(token: string) {
    const { sub: id } = this.tokenService.decodeToken(token)
    const user = await this.userRepository.findOneBy({ id: +id })
    if (!user) return handleBadrequest(new Error('Usuario no encontrado'))
    return user   
  }

}
