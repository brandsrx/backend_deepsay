import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common'
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowersResponseDto } from './dto/followers-response.dto';
import { FollowingResponseDto } from './dto/following-response.dto';
import { FollowerDto } from './dto/follower.dto';
import { FollowingDto } from './dto/following.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class FollowsService {
    constructor(private readonly prisma: PrismaService) {}

  /**
   * Seguir a un usuario
   */
    async followUser(userId: string, followerId: string): Promise<FollowResponseDto> {
        // Verificar que no sea el mismo usuario
        if (userId === followerId) {
        throw new BadRequestException('No puedes seguirte a ti mismo');
        }

        // Verificar que el usuario a seguir existe y está activo
        const userToFollow = await this.prisma.users.findUnique({
        where: { id: userId }
        });

        if (!userToFollow) {
        throw new NotFoundException('Usuario no encontrado');
        }

        if (!userToFollow.is_active) {
        throw new BadRequestException('No puedes seguir a un usuario inactivo');
        }

        // Verificar que el follower existe y está activo
        const followerUser = await this.prisma.users.findUnique({
        where: { id: followerId }
        });

        if (!followerUser || !followerUser.is_active) {
        throw new ForbiddenException('Usuario seguidor no válido');
        }

        // Verificar si ya está siguiendo al usuario
        const existingFollow = await this.prisma.follows.findUnique({
        where: {
            follower_id_following_id: {
            follower_id: followerId,
            following_id: userId
            }
        }
        });

        if (existingFollow) {
        throw new ConflictException('Ya estás siguiendo a este usuario');
        }

        try {
        // Usar transacción para mantener consistencia
            const result = await this.prisma.$transaction(async (tx) => {
                // Crear el follow
                const newFollow = await tx.follows.create({
                data: {
                    follower_id: followerId,
                    following_id: userId
                }
                });

                // Actualizar contadores
                await tx.users.update({
                where: { id: userId },
                data: { follower_count: { increment: 1 } }
                });

                await tx.users.update({
                where: { id: followerId },
                data: { following_count: { increment: 1 } }
                });

                return newFollow;
            });
            return new FollowResponseDto(result);

        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Ya estás siguiendo a este usuario');
            }
            throw new BadRequestException('Error al seguir al usuario');
        }
     }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(userId: string, followerId: string): Promise<{ message: string }> {
    // Verificar que no sea el mismo usuario
    if (userId === followerId) {
      throw new BadRequestException('No puedes dejar de seguirte a ti mismo');
    }

    // Verificar que existe el follow
    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: userId
        }
      }
    });

    if (!existingFollow) {
      throw new NotFoundException('No estás siguiendo a este usuario');
    }

    try {
      // Usar transacción para mantener consistencia
      await this.prisma.$transaction(async (tx) => {
        // Eliminar el follow
        await tx.follows.delete({
          where: {
            follower_id_following_id: {
              follower_id: followerId,
              following_id: userId
            }
          }
        });

        // Actualizar contadores
        await tx.users.update({
          where: { id: userId },
          data: { follower_count: { decrement: 1 } }
        });

        await tx.users.update({
          where: { id: followerId },
          data: { following_count: { decrement: 1 } }
        });
      });

      return { message: 'Has dejado de seguir al usuario exitosamente' };

    } catch (error) {
      throw new BadRequestException('Error al dejar de seguir al usuario');
    }
  }

  /**
   * Obtener seguidores de un usuario
   */
    async getFollowers(
        userId: string, 
        page: number = 1, 
        limit: number = 20
    ): Promise<FollowersResponseDto> {
        // Verificar que el usuario existe
        const user = await this.prisma.users.findUnique({
            where: { id: userId, is_active: true }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const skip = (page - 1) * limit;

        // Obtener seguidores con información del usuario
        const [followers, total] = await Promise.all([
        this.prisma.follows.findMany({
            where: { following_id: userId },
            include: {
                users_follows_follower_idTousers: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    avatar_url: true,
                    is_verified: true,
                    follower_count: true
                }
            }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        this.prisma.follows.count({
            where: { following_id: userId }
        })
        ]);

        const followersDto = followers.map(follow => 
            new FollowerDto({
                id: follow.users_follows_follower_idTousers.id,
                username: follow.users_follows_follower_idTousers.username,
                name: follow.users_follows_follower_idTousers.name,
                avatar_url: follow.users_follows_follower_idTousers.avatar_url,
                is_verified: follow.users_follows_follower_idTousers.is_verified,
                follower_count: follow.users_follows_follower_idTousers.follower_count??0,
                followed_at: follow.created_at
            }) 
        );

        const totalPages = Math.ceil(total / limit);

        return new FollowersResponseDto({
            followers: followersDto,
            total,
            page,
            limit,
            totalPages
        });
    }

  /**
   * Obtener usuarios seguidos por un usuario
   */
    async getFollowing(
        userId: string, 
        page: number = 1, 
        limit: number = 20
    ): Promise<FollowingResponseDto> {
        // Verificar que el usuario existe
        const user = await this.prisma.users.findUnique({
        where: { id: userId, is_active: true }
        });

        if (!user) {
        throw new NotFoundException('Usuario no encontrado');
        }

        const skip = (page - 1) * limit;

        // Obtener seguidos con información del usuario
        const [following, total] = await Promise.all([
        this.prisma.follows.findMany({
            where: { follower_id: userId },
            include: {
            users_follows_following_idTousers: {
                select: {
                id: true,
                username: true,
                name: true,
                avatar_url: true,
                is_verified: true,
                follower_count: true
                }
            }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        this.prisma.follows.count({
            where: { follower_id: userId }
        })
        ]);

        const followingDto = following.map(follow => 
            new FollowingDto({
                id: follow.users_follows_following_idTousers.id,
                username: follow.users_follows_following_idTousers.username,
                name: follow.users_follows_following_idTousers.name,
                avatar_url: follow.users_follows_following_idTousers.avatar_url,
                is_verified: follow.users_follows_following_idTousers.is_verified??false,
                follower_count: follow.users_follows_following_idTousers.follower_count??0,
                followed_at: follow.created_at
            })
        );

        const totalPages = Math.ceil(total / limit);

        return new FollowingResponseDto({
            following: followingDto,
            total,
            page,
            limit,
            totalPages
        });
    }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    return !!follow;
  }
 
}
