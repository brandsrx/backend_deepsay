import { IsString, IsUUID, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsUUID('4', { message: 'post_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'post_id es requerido' })
  post_id: string;

  @IsUUID('4', { message: 'user_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'user_id es requerido' })
  user_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'parent_id debe ser un UUID válido' })
  parent_id?: string;

  @IsString({ message: 'content debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'content es requerido' })
  @MaxLength(2000, { message: 'content no puede exceder 2000 caracteres' })
  content: string;
}