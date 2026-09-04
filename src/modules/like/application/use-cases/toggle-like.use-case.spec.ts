import {
  IDecrementPostLikeCountUseCase,
  IFindPostByIdUseCase,
  IIncrementPostLikeCountUseCase,
} from '@modules/post/public-api';
import { Post } from '@modules/post/domain/post.entity';
import { Like } from '../../domain/like.entity';
import { ILikeRepository } from '../ports/like-repository.interface';
import { ToggleLikeUseCase } from './toggle-like.use-case';

function buildPost() {
  return new Post({
    id: 'post-id',
    postType: 'SELL',
    title: 'title',
    content: 'content',
    images: [],
    provinceCode: 79,
    profileId: 'author-profile-id',
    likeCount: 0,
    commentCount: 0,
    createdAt: null,
    updatedAt: null,
  });
}

function buildLike() {
  return new Like({
    id: 'like-id',
    postId: 'post-id',
    profileId: 'profile-id',
    reactionType: 'LIKE',
    createdAt: null,
  });
}

describe('ToggleLikeUseCase', () => {
  let likeRepository: jest.Mocked<ILikeRepository>;
  let findPostByIdUseCase: jest.Mocked<IFindPostByIdUseCase>;
  let incrementPostLikeCountUseCase: jest.Mocked<IIncrementPostLikeCountUseCase>;
  let decrementPostLikeCountUseCase: jest.Mocked<IDecrementPostLikeCountUseCase>;
  let useCase: ToggleLikeUseCase;

  beforeEach(() => {
    likeRepository = {
      create: jest.fn(),
      findByPostAndProfile: jest.fn(),
      delete: jest.fn(),
    };
    findPostByIdUseCase = { execute: jest.fn() };
    incrementPostLikeCountUseCase = { execute: jest.fn() };
    decrementPostLikeCountUseCase = { execute: jest.fn() };
    useCase = new ToggleLikeUseCase(
      likeRepository,
      findPostByIdUseCase,
      incrementPostLikeCountUseCase,
      decrementPostLikeCountUseCase,
    );
  });

  it('creates a Like and increments likeCount when not liked yet', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost());
    likeRepository.findByPostAndProfile.mockResolvedValue(null);

    await useCase.execute({ postId: 'post-id', profileId: 'profile-id' });

    expect(likeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: 'post-id',
        profileId: 'profile-id',
        reactionType: 'LIKE',
      }),
    );
    expect(incrementPostLikeCountUseCase.execute).toHaveBeenCalledWith({
      postId: 'post-id',
    });
    expect(likeRepository.delete).not.toHaveBeenCalled();
    expect(decrementPostLikeCountUseCase.execute).not.toHaveBeenCalled();
  });

  it('deletes the Like and decrements likeCount when already liked', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost());
    likeRepository.findByPostAndProfile.mockResolvedValue(buildLike());

    await useCase.execute({ postId: 'post-id', profileId: 'profile-id' });

    expect(likeRepository.delete).toHaveBeenCalledWith('like-id');
    expect(decrementPostLikeCountUseCase.execute).toHaveBeenCalledWith({
      postId: 'post-id',
    });
    expect(likeRepository.create).not.toHaveBeenCalled();
    expect(incrementPostLikeCountUseCase.execute).not.toHaveBeenCalled();
  });
});
