import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { QuoteRequest } from 'src/modules/quotes/entities/quote-request.entity'
import { User } from 'src/modules/users/entities/user.entity'

export class CreateActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  quote_request: QuoteRequest

  @ApiProperty()
  @IsNotEmpty()
  team_members: User[]

  @ApiProperty()
  @IsNotEmpty()
  status: 'pending' | 'done' | 'canceled'
}

export class AddActivityDto {
  @ApiProperty()
  id: number
}
