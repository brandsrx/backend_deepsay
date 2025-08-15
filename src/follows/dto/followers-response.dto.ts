import { FollowerDto } from './follower.dto';
import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FollowersResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowerDto)
  followers: FollowerDto[];

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  limit: number;

  @IsInt()
  @Min(0)
  totalPages: number;

  constructor(partial: Partial<FollowersResponseDto>) {
    Object.assign(this, partial);
  }
}
