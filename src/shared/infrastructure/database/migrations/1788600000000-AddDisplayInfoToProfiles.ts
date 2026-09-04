import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisplayInfoToProfiles1788600000000 implements MigrationInterface {
  name = 'AddDisplayInfoToProfiles1788600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" ADD "display_name" text`);
    await queryRunner.query(`ALTER TABLE "profiles" ADD "avatar_url" text`);
    await queryRunner.query(`
      UPDATE "profiles" p
      SET "display_name" = a."display_name",
          "avatar_url" = a."avatar_url"
      FROM "accounts" a
      WHERE a.id = p.account_id
    `);
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "display_name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "avatar_url"`);
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP COLUMN "display_name"`,
    );
  }
}
