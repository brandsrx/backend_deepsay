import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileDto } from './dto/profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private prismaService:PrismaService,
    ){};

    async getUserProfile(username:string,requestingUserId?:string):Promise<UserProfileDto>{
        const user = await this.prismaService.users.findUnique({
            where:{username},
            select:{
                id:true,
                username:true,
                email:true,
                name:true,
                bio:true,
                avatar_url:true,
                location:true,
                website:true,
                follower_count:true,
                following_count:true,
                post_count:true,
                total_likes_received:true,
                is_private:true,
            }
        })
        if(!user){
            throw new NotFoundException('User not found');
        }
        if (user.is_private && requestingUserId !== user.id) {
            if (!requestingUserId) {
                throw new ForbiddenException('Private profile - login required');
            }

            const canView = await this.checkProfileVisibility(user.id, requestingUserId);
            if (!canView) {
                throw new ForbiddenException('Private profile - follow required');
            }
        }
        let isFollowing = false;
        if (requestingUserId) {
            isFollowing = await this.prismaService.follows.count({
                where: {
                follower_id: requestingUserId,
                following_id: user.id
                }
            }) > 0;
        }
        return {
            id:user.id,
            username:user.username,
            email:user.email,
            name:user.name,
            bio:user.bio??'Not bio',
            avatarUrl:user.avatar_url??'',
            location:user.location??'',
            website:user.website??'',
            followerCount:user.follower_count??0,
            followingCount:user.following_count??0,
            postCount:user.post_count??0,
            totalLikesReceived:user.total_likes_received??0,
            isPrivate:user.is_private??false,
            isFollowing,
        }

    }
    private async checkProfileVisibility(profileUserId: string, requestingUserId: string): Promise<boolean> {
        return await this.prismaService.follows.count({
        where: {
            follower_id:requestingUserId ,
            following_id: profileUserId
        }
        }) > 0;
    }
     /**
   * Actualizar perfil de usuario
   */
  async updateUser(
    userId: string, 
    updateUserDto: UpdateUserDto, 
    requestingUserId: string
  ): Promise<UserResponseDto> {
    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (userId !== requestingUserId) {
      throw new ForbiddenException('Solo puedes actualizar tu propio perfil');
    }

    // Verificar que el usuario existe y está activo
    const existingUser = await this.prismaService.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!existingUser.is_active) {
      throw new ForbiddenException('No puedes actualizar un perfil desactivado');
    }

    try {
      // Actualizar usuario
      const updatedUser = await this.prismaService.users.update({
        where: { id: userId },
        data: {
          ...updateUserDto,
          updated_at: new Date(),
        }
      });

      // Transformar y retornar respuesta sin campos sensibles
      return plainToClass(UserResponseDto, updatedUser, {
        excludeExtraneousValues: false
      });

    } catch (error) {
      if (error.code === 'P2002') {
        // Violación de constraint único
        throw new ConflictException('Ya existe un usuario con esos datos');
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  /**
   * Eliminar/Desactivar cuenta de usuario
   */
  async deleteUser(userId: string, requestingUserId: string): Promise<{ message: string }> {
    // Verificar que el usuario solo pueda eliminar su propia cuenta
    if (userId !== requestingUserId) {
      throw new ForbiddenException('Solo puedes eliminar tu propia cuenta');
    }

    // Verificar que el usuario existe
    const existingUser = await this.prismaService.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!existingUser.is_active) {
      throw new ConflictException('La cuenta ya está desactivada');
    }

    try {
      // En lugar de eliminar físicamente, desactivamos la cuenta
      // Esto preserva la integridad referencial y permite reactivar la cuenta
      await this.prismaService.users.update({
        where: { id: userId },
        data: {
          is_active: false,
          email: `deleted_${Date.now()}_${existingUser.email}`, // Liberar el email para futuros registros
          username: `deleted_${Date.now()}_${existingUser.username}`, // Liberar el username
          updated_at: new Date(),
        }
      });

      return { 
        message: 'Cuenta desactivada exitosamente. Puedes reactivarla contactando al soporte.' 
      };

    } catch (error) {
      throw new BadRequestException('Error al desactivar la cuenta');
    }
  }

  /**
   * Obtener usuario por ID (método auxiliar)
   */
  async findUserById(userId: string): Promise<UserResponseDto | null> {
    const user = await this.prismaService.users.findUnique({
      where: { 
        id: userId,
        is_active: true // Solo usuarios activos
      }
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: false
    });
  }
}
