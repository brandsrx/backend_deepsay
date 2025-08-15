import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostsResponseDto } from './dto/posts-response.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto, req.user?.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard) // Permite acceso público pero con auth opcional
  async findAll(@Query() query: PostsQueryDto): Promise<PostsResponseDto> {
    return this.postsService.findMany(query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PostResponseDto> {
    return this.postsService.findOne(id, true); // Incrementar vistas
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postsService.findBySlug(slug, true); // Incrementar vistas
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any
  ): Promise<PostResponseDto> {
    return this.postsService.update(id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ): Promise<{ message: string }> {
    return this.postsService.remove(id, req.user.id);
  }
}
