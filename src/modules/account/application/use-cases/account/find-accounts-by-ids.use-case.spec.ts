import { Account } from '../../../domain/account.entity';
import { IAccountRepository } from '../../ports/account/account-repository.interface';
import { FindAccountsByIdsUseCase } from './find-accounts-by-ids.use-case';

describe('FindAccountsByIdsUseCase', () => {
  let accountRepository: jest.Mocked<IAccountRepository>;
  let useCase: FindAccountsByIdsUseCase;

  beforeEach(() => {
    accountRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByIdentifierHash: jest.fn(),
    };

    useCase = new FindAccountsByIdsUseCase(accountRepository);
  });

  it('delegates to the repository with the given account ids', async () => {
    const accounts = [
      new Account({
        id: 'account-1',
        loginType: 'EMAIL',
        identifierHash: 'hash',
        passwordHash: 'hash',
        status: 'ACTIVE',
        blockUntil: null,
        displayName: 'John',
        avatarUrl: null,
        currentAddressId: null,
        activeProfileId: null,
        createdAt: null,
        updatedAt: null,
      }),
    ];
    accountRepository.findByIds.mockResolvedValue(accounts);

    const result = await useCase.execute({ accountIds: ['account-1'] });

    expect(accountRepository.findByIds).toHaveBeenCalledWith(['account-1']);
    expect(result).toBe(accounts);
  });
});
