import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
import { PostsResponseDto } from './dto/posts-response.dto';
import { plainToClass } from 'class-transformer';


@Injectable()
export class PostsService {
     constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo post
   */
  async create(createPostDto: CreatePostDto, userId?: string): Promise<PostResponseDto> {
    // Si es anónimo, no asignar user_id
    const finalUserId = createPostDto.is_anonymous ? null : userId;

    // Verificar que la categoría existe
    const category = await this.prisma.categories.findUnique({
      where: { id: createPostDto.category_id }
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Generar slug si no se proporciona
    let slug = createPostDto.slug;
    if (!slug) {
      slug = this.generateSlug(createPostDto.title);
    }

    // Verificar que el slug sea único
    await this.ensureUniqueSlug(slug);

    // Calcular tiempo de lectura si no se proporciona
    const readingTime = createPostDto.reading_time_minutes || 
      this.calculateReadingTime(createPostDto.content);

    // Generar excerpt si no se proporciona
    const excerpt = createPostDto.excerpt || 
      this.generateExcerpt(createPostDto.content);

    try {
      const post = await this.prisma.posts.create({
        data: {
          ...createPostDto,
          user_id: finalUserId,
          slug,
          excerpt,
          reading_time_minutes: readingTime,
          published_at: createPostDto.status === 'published' ? new Date() : null,
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar_url: true,
              is_verified: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      // Actualizar contador de posts del usuario
      if (finalUserId) {
        await this.prisma.users.update({
          where: { id: finalUserId },
          data: { post_count: { increment: 1 } }
        });
      }

      return plainToClass(PostResponseDto, post, { excludeExtraneousValues: true });

    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un post con ese slug');
      }
      throw new BadRequestException('Error al crear el post');
    }
  }

  /**
   * Obtener todos los posts con filtros y paginación
   */
  async findMany(query: PostsQueryDto): Promise<PostsResponseDto> {
    const { page, limit, search, category_id, status, author_id, is_featured, is_pinned, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category_id) where.category_id = category_id;
    if (status) where.status = status;
    if (author_id) where.user_id = author_id;
    if (is_featured !== undefined) where.is_featured = is_featured;
    if (is_pinned !== undefined) where.is_pinned = is_pinned;

    // Construir ordenamiento
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [posts, total] = await Promise.all([
      this.prisma.posts.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar_url: true,
              is_verified: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.posts.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const postsDto = posts.map(post => 
      plainToClass(PostResponseDto, post, { excludeExtraneousValues: true })
    );

    return new PostsResponseDto({
      posts: postsDto,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage
    });
  }

  /**
   * Obtener un post por ID
   */
  async findOne(id: string, incrementView: boolean = false): Promise<PostResponseDto> {
    const post = await this.prisma.posts.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar_url: true,
            is_verified: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Incrementar contador de vistas si se solicita
    if (incrementView) {
      await this.prisma.posts.update({
        where: { id },
        data: { view_count: { increment: 1 } }
      });
      post.view_count = (post.view_count ?? 0) + 1;
    }

    return plainToClass(PostResponseDto, post, { excludeExtraneousValues: true });
  }

  /**
   * Obtener un post por slug
   */
  async findBySlug(slug: string, incrementView: boolean = false): Promise<PostResponseDto> {
    const post = await this.prisma.posts.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar_url: true,
            is_verified: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Incrementar contador de vistas si se solicita
    if (incrementView) {
      await this.prisma.posts.update({
        where: { slug },
        data: { view_count: { increment: 1 } }
      });
      post.view_count = (post.view_count ?? 0) + 1;
    }

    return plainToClass(PostResponseDto, post, { excludeExtraneousValues: true });
  }

  /**
   * Actualizar un post
   */
  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<PostResponseDto> {
    const existingPost = await this.prisma.posts.findUnique({
      where: { id }
    });

    if (!existingPost) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar permisos: solo el autor o admin puede editar
    if (existingPost.user_id !== userId) {
      // Aquí podrías verificar si el usuario es admin
      throw new ForbiddenException('No tienes permisos para editar este post');
    }

    // Verificar categoría si se está actualizando
    if (updatePostDto.category_id) {
      const category = await this.prisma.categories.findUnique({
        where: { id: updatePostDto.category_id }
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Verificar slug único si se está actualizando
    if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
      await this.ensureUniqueSlug(updatePostDto.slug);
    }

    // Actualizar tiempo de lectura si se cambió el contenido
    if (updatePostDto.content && !updatePostDto.reading_time_minutes) {
      updatePostDto.reading_time_minutes = this.calculateReadingTime(updatePostDto.content);
    }

    // Generar excerpt si se cambió el contenido y no se proporciona excerpt
    if (updatePostDto.content && !updatePostDto.excerpt) {
      updatePostDto.excerpt = this.generateExcerpt(updatePostDto.content);
    }

    // Actualizar published_at si se cambia el estado a published
    const updateData: any = { ...updatePostDto };
    if (updatePostDto.status === 'published' && existingPost.status !== 'published') {
      updateData.published_at = new Date();
    }

    try {
      const updatedPost = await this.prisma.posts.update({
        where: { id },
        data: updateData,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar_url: true,
              is_verified: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      return plainToClass(PostResponseDto, updatedPost, { excludeExtraneousValues: true });

    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un post con ese slug');
      }
      throw new BadRequestException('Error al actualizar el post');
    }
  }

  /**
   * Eliminar un post
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const existingPost = await this.prisma.posts.findUnique({
      where: { id }
    });

    if (!existingPost) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar permisos: solo el autor o admin puede eliminar
    if (existingPost.user_id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este post');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Eliminar el post
        await tx.posts.delete({
          where: { id }
        });

        // Actualizar contador de posts del usuario
        if (existingPost.user_id) {
          await tx.users.update({
            where: { id: existingPost.user_id },
            data: { post_count: { decrement: 1 } }
          });
        }
      });

      return { message: 'Post eliminado exitosamente' };

    } catch (error) {
      throw new BadRequestException('Error al eliminar el post');
    }
  }

  /**
   * Métodos auxiliares privados
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(slug: string): Promise<void> {
    const existingPost = await this.prisma.posts.findUnique({
      where: { slug }
    });

    if (existingPost) {
      throw new ConflictException('Ya existe un post con ese slug');
    }
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  private generateExcerpt(content: string, maxLength: number = 200): string {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) {
      return plainText;
    }
    return plainText.substring(0, maxLength).trim() + '...';
  }
}
