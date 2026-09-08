import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_ISSUER } from '../ports/auth-application.tokens';
import { ITokenIssuer } from '../ports/token-issuer.interface';

export type TIssueWsTokenInput = {
  accountId: string;
  profileId: string | null;
};

export type TIssueWsTokenOutput = {
  wsToken: string;
};

@Injectable()
export class IssueWsTokenUseCase {
  constructor(
    @Inject(TOKEN_ISSUER)
    private readonly _tokenIssuer: ITokenIssuer,
  ) {}

  execute(input: TIssueWsTokenInput): TIssueWsTokenOutput {
    const wsToken = this._tokenIssuer.signWsToken({
      accountId: input.accountId,
      profileId: input.profileId,
    });

    return { wsToken };
  }
}
