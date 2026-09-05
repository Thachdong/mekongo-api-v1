import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatReadStateEntity1788624303747 implements MigrationInterface {
  name = 'AddChatReadStateEntity1788624303747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chat_read_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "buyer_profile_id" uuid NOT NULL, "profile_id" uuid NOT NULL, "last_read_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_fe36275a193940908f09ef31280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_29f412c01d23fd72036a1233ce" ON "chat_read_states"  ("post_id", "buyer_profile_id", "profile_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_29f412c01d23fd72036a1233ce"`,
    );
    await queryRunner.query(`DROP TABLE "chat_read_states"`);
  }
}
