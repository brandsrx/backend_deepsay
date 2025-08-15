import { PostResponseDto } from "./post-response.dto";

export class PostsResponseDto {
  posts: PostResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;

  constructor(partial: Partial<PostsResponseDto>) {
    Object.assign(this, partial);
  }
}