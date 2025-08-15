import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, ValidateNested, IsDate } from 'class-validator';


class PaginationMetaDto {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  limit: number;

  @Type(() => Number)
  total: number;

  @Type(() => Number)
  totalPages: number;

  @Type(() => Boolean)
  hasNextPage: boolean;

  @Type(() => Boolean)
  hasPrevPage: boolean;
}

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  postId: string;

  @Expose()
  userId: string;

  @Expose()
  parentId: string | null;

  @Expose()
  content: string;

  @Expose()
  depth: number;

  @Expose()
  rootCommentId: string | null;

  @Expose()
  likeCount: number;

  @Expose()
  dislikeCount: number;

  @Expose()
  replyCount: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
@IsOptional()
  @IsString()
  threadPath?: string;
  
  @Expose()
  @Type(() => CommentResponseDto)
  replies?: CommentResponseDto[];
}

export class PaginatedCommentsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentResponseDto)
  data: CommentResponseDto[];

  @ValidateNested()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}