import { IsOptional, IsString, IsBoolean, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty({ 
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({ 
    description: 'Biografía del usuario',
    example: 'Desarrollador apasionado por la tecnología',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;

  @ApiProperty({ 
    description: 'URL del avatar del usuario',
    example: 'https://example.com/avatar.jpg',
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar debe ser válida' })
  avatar_url?: string;

  @ApiProperty({ 
    description: 'URL de la imagen de portada',
    example: 'https://example.com/cover.jpg',
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de portada debe ser válida' })
  cover_url?: string;

  @ApiProperty({ 
    description: 'Ubicación del usuario',
    example: 'Buenos Aires, Argentina',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La ubicación no puede exceder 100 caracteres' })
  location?: string;

  @ApiProperty({ 
    description: 'Sitio web del usuario',
    example: 'https://miportfolio.com',
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del sitio web debe ser válida' })
  website?: string;

  @ApiProperty({ 
    description: 'Si el perfil es privado',
    example: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean;

  @ApiProperty({ 
    description: 'Notificaciones de comentarios',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  notify_comments?: boolean;

  @ApiProperty({ 
    description: 'Notificaciones de likes',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  notify_likes?: boolean;

  @ApiProperty({ 
    description: 'Notificaciones de follows',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  notify_follows?: boolean;
}
