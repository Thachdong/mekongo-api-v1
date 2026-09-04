import { PostNotFoundError } from '../../domain/errors/post-not-found.error';
import { Post } from '../../domain/post.entity';
import { IPostRepository } from '../ports/post-repository.interface';
import { DecrementPostLikeCountUseCase } from './decrement-post-like-count.use-case';

function buildPost(likeCount = 0) {
  return new Post({
    id: 'post-id',
    postType: 'SELL',
    title: 'title',
    content: 'content',
    images: [],
    provinceCode: 79,
    profileId: 'profile-id',
    likeCount,
    commentCount: 0,
    createdAt: null,
    updatedAt: null,
  });
}

describe('DecrementPostLikeCountUseCase', () => {
  let postRepository: jest.Mocked<IPostRepository>;
  let useCase: DecrementPostLikeCountUseCase;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    useCase = new DecrementPostLikeCountUseCase(postRepository);
  });

  it('throws PostNotFoundError when post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ postId: 'post-id' }),
    ).rejects.toThrow(PostNotFoundError);
  });

  it('decrements likeCount and persists the post', async () => {
    const post = buildPost(1);
    postRepository.findById.mockResolvedValue(post);
    postRepository.update.mockImplementation(async (p) => p);

    const result = await useCase.execute({ postId: 'post-id' });

    expect(result.likeCount).toBe(0);
    expect(postRepository.update).toHaveBeenCalledWith(post);
  });
});
