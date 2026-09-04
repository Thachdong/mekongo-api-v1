import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentDeletedAt1788500000000 implements MigrationInterface {
  name = 'AddCommentDeletedAt1788500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "deleted_at"`);
  }
}
