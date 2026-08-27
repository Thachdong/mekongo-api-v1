import { Module } from '@nestjs/common';
import { AccountModule } from '@modules/account/account.module';
import { VerificationModule } from '@modules/verification/verification.module';
import { RegisterUseCase } from './application/use-cases/register.use-case';

@Module({
  imports: [AccountModule, VerificationModule],
  providers: [RegisterUseCase],
  exports: [RegisterUseCase],
})
export class AuthModule {}
