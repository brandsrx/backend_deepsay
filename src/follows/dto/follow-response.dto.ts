import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl, isInt, isNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class FollowResponseDto{
    @IsNotEmpty()
    @IsString()
    id:string;
    @IsNotEmpty()
    @IsString()
    follower_id:string;
    @IsNotEmpty()
    @IsString()
    following_id:string;

    @IsDate()
    @Type(() => Date)
    created_at: Date | null;

    constructor(partial: Partial<FollowResponseDto>) {
        Object.assign(this, partial);
    }
}