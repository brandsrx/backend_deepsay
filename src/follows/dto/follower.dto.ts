import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsDate } from 'class-validator';

export class FollowerDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  username: string;

    @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar_url?: string | null;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean | null;

  @IsNotEmpty()
  @IsNumber()
  follower_count: number;

    @IsDate()
    @Type(() => Date)
    followed_at: Date | null;

  constructor(partial: Partial<FollowerDto>) {
    Object.assign(this, partial);
  }
}
