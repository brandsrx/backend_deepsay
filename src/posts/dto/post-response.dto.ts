import { Exclude, Expose, Transform } from 'class-transformer';

export class PostResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  excerpt: string | null;

  @Expose()
  slug: string;

  @Expose()
  user_id: string | null;

  @Expose()
  category_id: number;

  @Expose()
  is_anonymous: boolean;

  @Expose()
  allow_comments: boolean;

  @Expose()
  is_featured: boolean;

  @Expose()
  is_pinned: boolean;

  @Expose()
  status: string;

  @Expose()
  featured_image_url: string[];

  @Expose()
  reading_time_minutes: number | null;

  @Expose()
  view_count: number;

  @Expose()
  unique_view_count: number;

  @Expose()
  like_count: number;

  @Expose()
  dislike_count: number;

  @Expose()
  love_count: number;

  @Expose()
  laugh_count: number;

  @Expose()
  angry_count: number;

  @Expose()
  comment_count: number;

  @Expose()
  share_count: number;

  @Expose()
  published_at: Date | null;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Relaciones opcionales
  @Expose()
  author?: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };

  @Expose()
  category?: {
    id: number;
    name: string;
    slug: string;
  };

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
