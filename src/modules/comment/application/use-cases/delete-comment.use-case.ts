import { Inject, Injectable } from '@nestjs/common';
import { CommentHasChildrenError } from '../../domain/errors/comment-has-children.error';
import { CommentNotFoundError } from '../../domain/errors/comment-not-found.error';
import { ForbiddenCommentDeletionError } from '../../domain/errors/forbidden-comment-deletion.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import {
  COMMENT_REPOSITORY,
  TRANSACTION_MANAGER,
} from '../ports/comment-application.tokens';
import { ICommentRepository } from '../ports/comment-repository.interface';
import {
  IDeleteCommentUseCase,
  TDeleteCommentInput,
} from '../ports/delete-comment-use-case.interface';
import { ITransactionManager } from '../ports/transaction-manager.interface';

@Injectable()
export class DeleteCommentUseCase implements IDeleteCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly _commentRepository: ICommentRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly _transactionManager: ITransactionManager,
  ) {}

  async execute(input: TDeleteCommentInput): Promise<void> {
    if (!input.profileId) {
      throw new ProfileNotActiveError();
    }

    const comment = await this._commentRepository.findById(input.commentId);

    if (!comment) {
      throw new CommentNotFoundError();
    }

    if (comment.profileId !== input.profileId) {
      throw new ForbiddenCommentDeletionError();
    }

    if (comment.childIds.length > 0) {
      throw new CommentHasChildrenError();
    }

    await this._transactionManager.runInTransaction(async () => {
      if (comment.parentId) {
        const parent = await this._commentRepository.findById(
          comment.parentId as string,
        );

        if (parent) {
          parent.removeChildId(comment.id as string);
          await this._commentRepository.update(parent);
        }
      }

      await this._commentRepository.delete(input.commentId);
    });
  }
}
