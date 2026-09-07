import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TCommentConfig } from '@config/comment.config';
import {
  FIND_POST_BY_ID_USECASE,
  IFindPostByIdUseCase,
} from '@modules/post/public-api';
import {
  CREATE_NOTIFICATION_USECASE,
  ICreateNotificationUseCase,
} from '@modules/notification/public-api';
import { CommentLevelLimitExceededError } from '../../domain/errors/comment-level-limit-exceeded.error';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import {
  COMMENT_PRESENCE_PORT,
  COMMENT_REPOSITORY,
} from '../ports/comment-application.tokens';
import { ICommentPresencePort } from '../ports/comment-presence.interface';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  ICreateCommentUseCase,
  TCreateCommentInput,
} from '../ports/create-comment-use-case.interface';

@Injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    @Inject(FIND_POST_BY_ID_USECASE)
    private readonly _findPostByIdUseCase: IFindPostByIdUseCase,
    @Inject(COMMENT_PRESENCE_PORT)
    private readonly _commentPresencePort: ICommentPresencePort,
    @Inject(CREATE_NOTIFICATION_USECASE)
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
    private readonly _configService: ConfigService,
  ) {}

  async execute(input: TCreateCommentInput): Promise<Comment> {
    if (!input.profileId) {
      throw new ProfileNotActiveError();
    }

    const post = await this._findPostByIdUseCase.execute({
      postId: input.postId,
    });

    let level = 0;
    let parent: Comment | null = null;

    if (input.parentId) {
      parent = await this._commentRepository.findById(input.parentId);

      if (!parent || parent.postId !== input.postId) {
        throw new ParentCommentNotFoundError();
      }

      level = parent.level + 1;
    }

    const commentConfig =
      this._configService.getOrThrow<TCommentConfig>('comment');

    if (level >= commentConfig.levelLimit) {
      throw new CommentLevelLimitExceededError();
    }

    const comment = await this._commentRepository.create(
      new Comment({
        id: null,
        content: input.content,
        parentId: input.parentId,
        postId: input.postId,
        profileId: input.profileId as string,
        level,
        createdAt: null,
        updatedAt: null,
      }),
    );

    await this._notifyIfNeeded(comment, post.profileId, parent);

    return comment;
  }

  private async _notifyIfNeeded(
    comment: Comment,
    postOwnerProfileId: string,
    parent: Comment | null,
  ): Promise<void> {
    const recipientProfileId = parent ? parent.profileId : postOwnerProfileId;

    if (recipientProfileId === comment.profileId) {
      return;
    }

    if (
      this._commentPresencePort.isViewingPost(
        comment.postId,
        recipientProfileId,
      )
    ) {
      return;
    }

    await this._createNotificationUseCase.execute({
      recipientProfileId,
      actorProfileId: comment.profileId,
      type: parent ? 'NEW_REPLY' : 'NEW_COMMENT',
      postId: comment.postId,
      commentId: comment.id as string,
      contentPreview: comment.content,
    });
  }
}
