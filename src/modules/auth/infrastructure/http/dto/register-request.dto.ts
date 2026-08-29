import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TAuthRegisterInput } from '../../../application/use-cases/register.use-case';

export class RegisterRequestDto {
  @ApiProperty({ enum: ['EMAIL', 'PHONE'] })
  @IsIn(['EMAIL', 'PHONE'])
  loginType: TAuthRegisterInput['loginType'];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'] })
  @IsIn(['INDIVIDUAL', 'DISTRIBUTOR', 'FACTORY'])
  profileType: TAuthRegisterInput['profileType'];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsInt()
  provinceCode: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  details: string;
}
