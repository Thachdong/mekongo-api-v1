import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatEntity1788602354430 implements MigrationInterface {
  name = 'AddChatEntity1788602354430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "owner_profile_id" uuid NOT NULL, "buyer_profile_id" uuid NOT NULL, "sender_profile_id" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6a18097999c31d57f287da630" ON "chats"  ("post_id", "buyer_profile_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6a18097999c31d57f287da630"`,
    );
    await queryRunner.query(`DROP TABLE "chats"`);
  }
}
