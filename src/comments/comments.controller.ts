import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CommentResponseDto, PaginatedCommentsResponseDto } from './dto/comment-response.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createCommentDto: CreateCommentDto
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: CommentQueryDto
  ): Promise<PaginatedCommentsResponseDto> {
    return this.commentsService.findAll(query);
  }

  @Get('post/:postId/tree')
  async findByPostWithReplies(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('maxDepth') maxDepth?: string
  ): Promise<CommentResponseDto[]> {
    const depth = maxDepth ? parseInt(maxDepth, 10) : 3;
    return this.commentsService.findByPostWithReplies(postId, depth);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCommentDto: UpdateCommentDto
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.commentsService.remove(id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<CommentResponseDto> {
    return this.commentsService.incrementLikeCount(id);
  }

  @Post(':id/dislike')
  @HttpCode(HttpStatus.OK)
  async dislike(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<CommentResponseDto> {
    return this.commentsService.incrementDislikeCount(id);
  }
}