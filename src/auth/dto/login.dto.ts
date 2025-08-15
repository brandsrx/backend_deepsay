import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  email_or_username: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

}
