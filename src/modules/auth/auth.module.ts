import { Module } from '@nestjs/common';
import { AccountModule } from '@modules/account/account.module';
import { VerificationModule } from '@modules/verification/verification.module';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyUseCase } from './application/use-cases/verify.use-case';
import { AuthController } from './infrastructure/http/auth.controller';

@Module({
  imports: [AccountModule, VerificationModule],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
  ],
})
export class AuthModule {}
