import { Post } from '../../domain/post.entity';
import { TPostType } from '../../domain/value-objects/post-type.enum';

export type TCreatePostInput = {
  accountId: string;
  profileId: string | null;
  postType: TPostType;
  title: string;
  content: string;
  images: string[];
};

export interface ICreatePostUseCase {
  execute(input: TCreatePostInput): Promise<Post>;
}
