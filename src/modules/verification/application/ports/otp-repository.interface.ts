import { Otp } from '../../domain/otp.entity';

export interface IOtpRepository {
  create(otp: Otp): Promise<Otp>;
}
