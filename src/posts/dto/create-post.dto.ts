import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  IsArray, 
  IsUrl, 
  MaxLength, 
  MinLength,
  IsEnum,
  ArrayMaxSize,
  IsUUID
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { post_status } from 'generated/prisma';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  HIDDEN = 'hidden'
}

export class CreatePostDto {
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(300, { message: 'El título no puede exceder 300 caracteres' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString({ message: 'El contenido debe ser un texto' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @Transform(({ value }) => value?.trim())
  content: string;

  @IsOptional()
  @IsString({ message: 'El excerpt debe ser un texto' })
  @MaxLength(500, { message: 'El excerpt no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  excerpt?: string;

  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  @MaxLength(350, { message: 'El slug no puede exceder 350 caracteres' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug?: string;

  @IsInt({ message: 'La categoría debe ser un número entero' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category_id: number;

  @IsOptional()
  @IsBoolean({ message: 'is_anonymous debe ser verdadero o falso' })
  is_anonymous?: boolean = false;

  @IsOptional()
  @IsBoolean({ message: 'allow_comments debe ser verdadero o falso' })
  allow_comments?: boolean = true;

  @IsOptional()
  @IsBoolean({ message: 'is_featured debe ser verdadero o falso' })
  is_featured?: boolean = false;

  @IsOptional()
  @IsBoolean({ message: 'is_pinned debe ser verdadero o falso' })
  is_pinned?: boolean = false;

    @IsOptional()
    @IsEnum(post_status, { message: 'Estado inválido. Debe ser: draft, published, archived, hidden' })
    status?: post_status = post_status.published;

    @IsOptional()
    @IsArray({ message: 'Las imágenes destacadas deben ser un array' })
    @ArrayMaxSize(5, { message: 'Máximo 5 imágenes destacadas permitidas' })
    @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
    @Type(() => String)
    featured_image_url?: string[] = [];

  @IsOptional()
  @IsInt({ message: 'El tiempo de lectura debe ser un número entero' })
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  reading_time_minutes?: number;
}
