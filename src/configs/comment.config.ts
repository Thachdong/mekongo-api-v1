import { registerAs } from '@nestjs/config';

export type TCommentConfig = {
  levelLimit: number;
};

export const commentConfig = registerAs('comment', (): TCommentConfig => ({
  levelLimit: Number(process.env.COMMENT_LEVEL_LIMIT ?? 3),
}));
