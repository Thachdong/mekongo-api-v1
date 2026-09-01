import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshAccessStrategy } from './jwt-refresh-access.strategy';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

@Global()
@Module({
  imports: [PassportModule],
  providers: [
    JwtAccessStrategy,
    JwtAuthGuard,
    JwtRefreshAccessStrategy,
    JwtRefreshAuthGuard,
  ],
  exports: [PassportModule, JwtAuthGuard, JwtRefreshAuthGuard],
})
export class AuthPassportModule {}
