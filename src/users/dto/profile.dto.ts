import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl, isInt, isNotEmpty } from 'class-validator';

export class UserProfileDto {
    @IsNotEmpty()
    id:string;
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsNotEmpty()
  followerCount: number;


  @IsNotEmpty()
  followingCount: number;

  
  @IsNotEmpty()
  postCount: number;

  @IsNotEmpty()
  totalLikesReceived: number; 

  @IsNotEmpty()
  isPrivate:boolean;

    @IsNotEmpty()
    isFollowing:boolean;
}
