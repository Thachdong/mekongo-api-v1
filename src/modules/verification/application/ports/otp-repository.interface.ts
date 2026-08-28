import { TOtpPurpose } from '../../domain/value-objects/otp-purpose.enum';
import { Otp } from '../../domain/otp.entity';

export interface IOtpRepository {
  create(otp: Otp): Promise<Otp>;
  findLatestByIdentifier(
    identifier: string,
    purpose: TOtpPurpose,
  ): Promise<Otp | null>;
  update(otp: Otp): Promise<Otp>;
}
