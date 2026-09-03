export type TChangeAccountPasswordInput = {
  accountId: string;
  passwordHash: string;
};

export interface IChangeAccountPasswordUseCase {
  execute(input: TChangeAccountPasswordInput): Promise<void>;
}
