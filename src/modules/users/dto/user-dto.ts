import { IsEmail, IsNotEmpty, IsDate } from 'class-validator'
export class userDto {
  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}
