import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FollowingDto {
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
  avatar_url: string | null;

  @IsNotEmpty()
  @IsBoolean()
  is_verified: boolean;

  @IsNotEmpty()
  @IsInt()
  follower_count: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  followed_at: Date | null;

  constructor(partial: Partial<FollowingDto>) {
    Object.assign(this, partial);
  }
}
