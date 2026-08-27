export type TMeta = Record<string, any>;

export type TResponse<T> = {
  data: T | null;
  meta?: TMeta;
};
