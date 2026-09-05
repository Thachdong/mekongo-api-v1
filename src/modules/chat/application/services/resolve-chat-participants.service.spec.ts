import { IFindProfilesByIdsUseCase } from '@modules/account/public-api';
import { ResolveChatParticipantsService } from './resolve-chat-participants.service';

describe('ResolveChatParticipantsService', () => {
  let findProfilesByIdsUseCase: jest.Mocked<IFindProfilesByIdsUseCase>;
  let service: ResolveChatParticipantsService;

  beforeEach(() => {
    findProfilesByIdsUseCase = { execute: jest.fn() };
    service = new ResolveChatParticipantsService(findProfilesByIdsUseCase);
  });

  it('maps profileId to participant info and de-duplicates ids', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([
      {
        id: 'profile-1',
        activeProfile: 'INDIVIDUAL',
        accountId: 'account-1',
        displayName: 'John',
        avatarUrl: 'avatar.png',
        createdAt: null,
        updatedAt: null,
      } as any,
    ]);

    const result = await service.execute(['profile-1', 'profile-1']);

    expect(findProfilesByIdsUseCase.execute).toHaveBeenCalledWith({
      profileIds: ['profile-1'],
    });
    expect(result.get('profile-1')).toEqual({
      profileId: 'profile-1',
      displayName: 'John',
      avatarUrl: 'avatar.png',
    });
  });

  it('returns an empty map when there are no profileIds', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([]);

    const result = await service.execute([]);

    expect(result.size).toBe(0);
  });
});
