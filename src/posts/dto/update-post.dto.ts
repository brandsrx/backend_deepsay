import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  IsArray, 
  IsUrl, 
  MaxLength, 
  MinLength,
  IsEnum,
  ArrayMaxSize
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PostStatus } from './create-post.dto';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(300, { message: 'El título no puede exceder 300 caracteres' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString({ message: 'El contenido debe ser un texto' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @Transform(({ value }) => value?.trim())
  content?: string;

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

  @IsOptional()
  @IsInt({ message: 'La categoría debe ser un número entero' })
  category_id?: number;

  @IsOptional()
  @IsBoolean({ message: 'is_anonymous debe ser verdadero o falso' })
  is_anonymous?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'allow_comments debe ser verdadero o falso' })
  allow_comments?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'is_featured debe ser verdadero o falso' })
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'is_pinned debe ser verdadero o falso' })
  is_pinned?: boolean;

  @IsOptional()
  @IsEnum(PostStatus, { message: 'Estado inválido. Debe ser: draft, published, archived, hidden' })
  status?: PostStatus;

  @IsOptional()
  @IsArray({ message: 'Las imágenes destacadas deben ser un array' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
  @ArrayMaxSize(5, { message: 'Máximo 5 imágenes destacadas permitidas' })
  featured_image_url?: string[];

  @IsOptional()
  @IsInt({ message: 'El tiempo de lectura debe ser un número entero' })
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  reading_time_minutes?: number;
}