import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ description: 'ID único del usuario' })
  id: string;

  @ApiProperty({ description: 'Nombre de usuario único' })
  username: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Nombre completo' })
  name: string;

  @ApiProperty({ description: 'Biografía del usuario' })
  bio: string;

  @ApiProperty({ description: 'Rol del usuario' })
  role: string;

  @ApiProperty({ description: 'URL del avatar' })
  avatar_url: string | null;

  @ApiProperty({ description: 'URL de portada' })
  cover_url: string | null;

  @ApiProperty({ description: 'Ubicación' })
  location: string | null;

  @ApiProperty({ description: 'Sitio web' })
  website: string | null;

  @ApiProperty({ description: 'Si está activo' })
  is_active: boolean;

  @ApiProperty({ description: 'Si es perfil privado' })
  is_private: boolean;

  @ApiProperty({ description: 'Si está verificado' })
  is_verified: boolean;

  @ApiProperty({ description: 'Si el email está verificado' })
  email_verified: boolean;

  @ApiProperty({ description: 'Cantidad de seguidores' })
  follower_count: number;

  @ApiProperty({ description: 'Cantidad de seguidos' })
  following_count: number;

  @ApiProperty({ description: 'Cantidad de posts' })
  post_count: number;

  @ApiProperty({ description: 'Total de likes recibidos' })
  total_likes_received: number;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updated_at: Date;

  @ApiProperty({ description: 'Última actividad' })
  last_active: Date;

  // Excluir campos sensibles de la respuesta
  @Exclude()
  password_hash: string;

  @Exclude()
  notify_comments: boolean;

  @Exclude()
  notify_likes: boolean;

  @Exclude()
  notify_follows: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}