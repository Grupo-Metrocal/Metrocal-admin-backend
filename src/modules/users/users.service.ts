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
    try {
      const user = await this.userRepository.save(createUserDto)
      return user
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async deleteById(id: number): Promise<User> {
    try {
      const user = await this.findById(id)
      await this.userRepository.remove(user)
      return user
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find()
      return users
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.find({ where: { id } })
      return user[0]
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.find({ where: { email } })
      return user[0]
    } catch (error) {
      throw new HttpException(error.message, 400)
    }
  }
}
