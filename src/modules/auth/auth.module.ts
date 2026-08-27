import { Module } from '@nestjs/common';
import { AccountModule } from '@modules/account/account.module';
import { VerificationModule } from '@modules/verification/verification.module';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { AuthController } from './infrastructure/http/auth.controller';

@Module({
  imports: [AccountModule, VerificationModule],
  controllers: [AuthController],
  providers: [RegisterUseCase],
  exports: [RegisterUseCase],
})
export class AuthModule {}
