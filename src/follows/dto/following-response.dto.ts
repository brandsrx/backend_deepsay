import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { FollowingDto } from './following.dto';

export class FollowingResponseDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowingDto)
  following: FollowingDto[];

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  total: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  page: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  limit: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalPages: number;

  constructor(partial: Partial<FollowingResponseDto>) {
    Object.assign(this, partial);
  }
}
