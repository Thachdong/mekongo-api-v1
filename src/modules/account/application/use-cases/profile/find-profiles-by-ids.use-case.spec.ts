import { Profile } from '../../../domain/profile.entity';
import { IProfileRepository } from '../../ports/profile-repository.interface';
import { FindProfilesByIdsUseCase } from './find-profiles-by-ids.use-case';

describe('FindProfilesByIdsUseCase', () => {
  let profileRepository: jest.Mocked<IProfileRepository>;
  let useCase: FindProfilesByIdsUseCase;

  beforeEach(() => {
    profileRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findAllByAccountId: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    useCase = new FindProfilesByIdsUseCase(profileRepository);
  });

  it('delegates to the repository with the given profile ids', async () => {
    const profiles = [
      new Profile({
        id: 'profile-1',
        activeProfile: 'INDIVIDUAL',
        accountId: 'account-1',
        displayName: 'John',
        avatarUrl: null,
        addressId: null,
        createdAt: null,
        updatedAt: null,
      }),
    ];
    profileRepository.findByIds.mockResolvedValue(profiles);

    const result = await useCase.execute({ profileIds: ['profile-1'] });

    expect(profileRepository.findByIds).toHaveBeenCalledWith(['profile-1']);
    expect(result).toBe(profiles);
  });
});
