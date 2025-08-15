// src/comments/comments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CommentResponseDto, PaginatedCommentsResponseDto } from './dto/comment-response.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const { post_id, user_id, parent_id, content } = createCommentDto;

    // Verificar que el post existe
    const postExists = await this.prisma.posts.findUnique({
      where: { id: post_id },
      select: { id: true }
    });

    if (!postExists) {
      throw new NotFoundException('El post especificado no existe');
    }

    // Verificar que el usuario existe
    const userExists = await this.prisma.users.findUnique({
      where: { id: user_id },
      select: { id: true }
    });

    if (!userExists) {
      throw new NotFoundException('El usuario especificado no existe');
    }

    let parentComment: {
        id: string;
        depth: number | null;
        thread_path: string | null;
        root_comment_id: string | null;
        post_id: string;
    } | null = null;
    let depth = 0;
    let rootCommentId: string | null = null;
    let threadPath = '';

    // Si es una respuesta, verificar el comentario padre
    if (parent_id) {
      parentComment = await this.prisma.comments.findUnique({
        where: { id: parent_id },
        select: {
          id: true,
          depth: true,
          thread_path: true,
          root_comment_id: true,
          post_id: true
        }
      });

      if (!parentComment) {
        throw new NotFoundException('El comentario padre especificado no existe');
      }

      // Verificar que el comentario padre pertenece al mismo post
      if (parentComment.post_id !== post_id) {
        throw new BadRequestException('El comentario padre debe pertenecer al mismo post');
      }

      depth = (parentComment.depth || 0) + 1;
      rootCommentId = parentComment.root_comment_id || parentComment.id;

      // Limitar la profundidad máxima (configurable)
      const maxDepth = 10;
      if (depth > maxDepth) {
        throw new BadRequestException(`La profundidad máxima de comentarios es ${maxDepth}`);
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      // Crear el comentario
      const comment = await tx.comments.create({
        data: {
          post_id,
          user_id,
          parent_id,
          content,
          depth,
          root_comment_id: rootCommentId,
          thread_path: '', // Se actualizará después
        },
        include: {
          users: {
            select: { id: true, username: true }
          }
        }
      });

      // Generar thread_path basado en el ID del comentario creado
      if (parent_id && parentComment) {
        const parentPath = parentComment.thread_path || '';
        threadPath = parentPath + (parentPath ? '.' : '') + this.padCommentId(comment.id);
      } else {
        threadPath = this.padCommentId(comment.id);
      }

      // Actualizar el thread_path del comentario recién creado
      const updatedComment = await tx.comments.update({
        where: { id: comment.id },
        data: { thread_path: threadPath },
        include: {
          users: {
            select: { id: true, username: true }
          }
        }
      });

      // Incrementar reply_count del comentario padre si existe
      if (parent_id) {
        await tx.comments.update({
          where: { id: parent_id },
          data: {
            reply_count: {
              increment: 1
            }
          }
        });
      }

      return this.mapToResponseDto(updatedComment);
    });
  }

  async findAll(query: CommentQueryDto): Promise<PaginatedCommentsResponseDto> {
    const { page = 1, limit = 10, post_id, user_id, parent_id, sortBy, sortOrder, maxDepth } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.commentsWhereInput = {};

    if (post_id) where.post_id = post_id;
    if (user_id) where.user_id = user_id;
    if (parent_id) where.parent_id = parent_id;
    if (maxDepth !== undefined) {
      where.depth = { lte: maxDepth };
    }

    // Construcción dinámica del orderBy
    const orderBy: Prisma.commentsOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const [comments, total] = await Promise.all([
      this.prisma.comments.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          users: {
            select: { id: true, username: true }
          }
        }
      }),
      this.prisma.comments.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments.map(comment => this.mapToResponseDto(comment)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, username: true }
        }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return this.mapToResponseDto(comment);
  }

  async findByPostWithReplies(postId: string, maxDepth: number = 3): Promise<CommentResponseDto[]> {
    // Obtener todos los comentarios del post ordenados por thread_path
    const comments = await this.prisma.comments.findMany({
      where: {
        post_id: postId,
        depth: { lte: maxDepth }
      },
      orderBy: {
        thread_path: 'asc'
      },
      include: {
        users: {
          select: { id: true, username: true }
        }
      }
    });

    // Construir la estructura jerárquica
    return this.buildCommentTree(comments);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<CommentResponseDto> {
    // Verificar que el comentario existe
    const existingComment = await this.prisma.comments.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    });

    if (!existingComment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const updatedComment = await this.prisma.comments.update({
      where: { id },
      data: {
        ...updateCommentDto,
        updated_at: new Date()
      },
      include: {
        users: {
          select: { id: true, username: true }
        }
      }
    });

    return this.mapToResponseDto(updatedComment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
      select: { id: true, parent_id: true }
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      // Si tiene padre, decrementar reply_count
      if (comment.parent_id) {
        await tx.comments.update({
          where: { id: comment.parent_id },
          data: {
            reply_count: {
              decrement: 1
            }
          }
        });
      }

      // Eliminar el comentario (las respuestas se eliminan en cascada)
      await tx.comments.delete({
        where: { id }
      });
    });
  }

  async incrementLikeCount(id: string): Promise<CommentResponseDto> {
    const updatedComment = await this.prisma.comments.update({
      where: { id },
      data: {
        like_count: {
          increment: 1
        }
      },
      include: {
        users: {
          select: { id: true, username: true }
        }
      }
    });

    return this.mapToResponseDto(updatedComment);
  }

  async incrementDislikeCount(id: string): Promise<CommentResponseDto> {
    const updatedComment = await this.prisma.comments.update({
      where: { id },
      data: {
        dislike_count: {
          increment: 1
        }
      },
      include: {
        users: {
          select: { id: true, username: true }
        }
      }
    });

    return this.mapToResponseDto(updatedComment);
  }

  // Métodos auxiliares privados
  private padCommentId(id: string): string {
    // Tomar los primeros 8 caracteres del UUID y convertir a número
    const numericPart = parseInt(id.replace(/-/g, '').substring(0, 8), 16);
    return numericPart.toString().padStart(10, '0');
  }

  private buildCommentTree(comments: any[]): CommentResponseDto[] {
    const commentMap = new Map<string, CommentResponseDto>();
    const rootComments: CommentResponseDto[] = [];

    // Crear el mapa de comentarios
    comments.forEach(comment => {
      const commentDto = this.mapToResponseDto(comment);
      commentDto.replies = [];
      commentMap.set(comment.id, commentDto);
    });

    // Construir la jerarquía
    comments.forEach(comment => {
      const commentDto = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentDto);
        }
      } else {
        rootComments.push(commentDto);
      }
    });

    return rootComments;
  }

  private mapToResponseDto(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      parentId: comment.parent_id,
      content: comment.content,
      threadPath: comment.thread_path,
      depth: comment.depth,
      rootCommentId: comment.root_comment_id,
      likeCount: comment.like_count,
      dislikeCount: comment.dislike_count,
      replyCount: comment.reply_count,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  }
}