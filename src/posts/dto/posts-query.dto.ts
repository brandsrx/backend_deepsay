import { IsOptional, IsString, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PostStatus } from './create-post.dto';

export enum PostSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  PUBLISHED_AT = 'published_at',
  VIEW_COUNT = 'view_count',
  LIKE_COUNT = 'like_count',
  COMMENT_COUNT = 'comment_count',
  TITLE = 'title'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class PostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Transform(({ value }) => {
    const val = parseInt(value);
    return isNaN(val) ? 1 : Math.max(1, val);
  })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Transform(({ value }) => {
    const val = parseInt(value);
    return isNaN(val) ? 20 : Math.min(100, Math.max(1, val));
  })
  limit: number = 20;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : undefined))
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La categoría debe ser un número entero' })
  category_id?: number;

  @IsOptional()
  @IsEnum(PostStatus, { message: 'Estado inválido' })
  status?: PostStatus;

  @IsOptional()
  @IsString({ message: 'El ID del autor debe ser un texto' })
  author_id?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'is_featured debe ser verdadero o falso' })
  is_featured?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'is_pinned debe ser verdadero o falso' })
  is_pinned?: boolean;

  @IsOptional()
  @IsEnum(PostSortBy, { message: 'Campo de ordenamiento inválido' })
  sortBy: PostSortBy = PostSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Orden inválido. Debe ser asc o desc' })
  sortOrder: SortOrder = SortOrder.DESC;
}
