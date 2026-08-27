export class DomainError extends Error {
  readonly code: string;
  readonly status: number;
  readonly extra: Record<string, any>;

  constructor(
    code: string,
    status: number,
    message: string,
    extra: Record<string, any> = {},
  ) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}
