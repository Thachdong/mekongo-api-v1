import { Inject, Injectable } from '@nestjs/common';
import { PostNotFoundError } from '../../domain/errors/post-not-found.error';
import {
  IFindPostByIdUseCase,
  TFindPostByIdInput,
} from '../ports/find-post-by-id-use-case.interface';
import { POST_REPOSITORY } from '../ports/post-application.tokens';
import { IPostRepository } from '../ports/post-repository.interface';
import { Post } from '../../domain/post.entity';

@Injectable()
export class FindPostByIdUseCase implements IFindPostByIdUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly _postRepository: IPostRepository,
  ) {}

  async execute(input: TFindPostByIdInput): Promise<Post> {
    const post = await this._postRepository.findById(input.postId);

    if (!post) {
      throw new PostNotFoundError();
    }

    return post;
  }
}
