import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
