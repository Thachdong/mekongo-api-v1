import { Address } from '../../domain/address.entity';

export type TCreateAddressInput = {
  accountId: string;
  label: string;
  province: string;
  provinceCode: number;
  ward: string;
  details: string;
};

export interface ICreateAddressUseCase {
  execute(input: TCreateAddressInput): Promise<Address>;
}
