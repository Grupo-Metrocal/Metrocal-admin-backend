import { Injectable, HttpException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    })
    if (user) throw new HttpException('El usuario ya existe', 400)
    return await this.userRepository.save(createUserDto)
  }

  async deleteById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new HttpException('Usuario no encontrado', 404)
    return await this.userRepository.remove(user)
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find()
  }

  async findById(id: number): Promise<User | {}> {
    const user = await this.userRepository.findOneBy({ id })
    return user ? user : { statusCode: 404, message: 'User not found' }
  }

  async findByEmail(email: string): Promise<User | {}> {
    const user = await this.userRepository.findOneBy({ email })
    return user || { statusCode: 404, message: 'User not found' }
  }
}
