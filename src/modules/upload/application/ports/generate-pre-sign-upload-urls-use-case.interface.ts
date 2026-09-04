export type TGeneratePreSignUploadUrlsInput = {
  files: string[];
};

export type TGeneratePreSignUploadUrlsOutput = {
  keys: string[];
  presignUrls: string[];
};

export interface IGeneratePreSignUploadUrlsUseCase {
  execute(
    input: TGeneratePreSignUploadUrlsInput,
  ): Promise<TGeneratePreSignUploadUrlsOutput>;
}
