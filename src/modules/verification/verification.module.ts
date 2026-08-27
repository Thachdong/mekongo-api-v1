import { Module } from '@nestjs/common';
import { IssueAccountVerificationUseCase } from './application/use-cases/issue-account-verification.use-case';

@Module({
  providers: [IssueAccountVerificationUseCase],
  exports: [IssueAccountVerificationUseCase],
})
export class VerificationModule {}
