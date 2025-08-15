import { IsOptional, IsUUID, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum CommentSortBy {
  CREATED_AT = 'created_at',
  LIKE_COUNT = 'like_count',
  REPLY_COUNT = 'reply_count',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CommentQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'post_id debe ser un UUID válido' })
  post_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'user_id debe ser un UUID válido' })
  user_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'parent_id debe ser un UUID válido' })
  parent_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(100, { message: 'limit no puede ser mayor a 100' })
  limit: number = 20;

  @IsOptional()
  @IsEnum(CommentSortBy, { message: 'sortBy inválido' })
  sortBy: CommentSortBy = CommentSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'sortOrder inválido' })
  sortOrder: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDepth?: number;
}
