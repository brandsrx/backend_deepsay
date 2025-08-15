import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(
  OmitType(CreateCommentDto, ['post_id', 'user_id', 'parent_id'] as const)
) {}