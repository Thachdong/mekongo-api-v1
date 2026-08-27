export interface IKeyedHasher {
  hash(value: string): string;
  verify(value: string, hashed: string): boolean;
}
