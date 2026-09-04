import { Inject, Injectable } from '@nestjs/common';
import { PostNotFoundError } from '../../domain/errors/post-not-found.error';
import { Post } from '../../domain/post.entity';
import { POST_REPOSITORY } from '../ports/post-application.tokens';
import { IPostRepository } from '../ports/post-repository.interface';
import {
  IIncrementPostLikeCountUseCase,
  TIncrementPostLikeCountInput,
} from '../ports/increment-post-like-count-use-case.interface';

@Injectable()
export class IncrementPostLikeCountUseCase
  implements IIncrementPostLikeCountUseCase
{
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly _postRepository: IPostRepository,
  ) {}

  async execute(input: TIncrementPostLikeCountInput): Promise<Post> {
    const post = await this._postRepository.findById(input.postId);

    if (!post) {
      throw new PostNotFoundError();
    }

    post.addLikeCount();

    return this._postRepository.update(post);
  }
}
