import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationEntity1788629647706 implements MigrationInterface {
  name = 'AddNotificationEntity1788629647706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient_profile_id" uuid NOT NULL, "actor_profile_id" uuid NOT NULL, "type" character varying NOT NULL, "post_id" uuid NOT NULL, "comment_id" uuid NOT NULL, "content_preview" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7da26cd759fc4f90c01cb84a09" ON "notifications"  ("recipient_profile_id", "is_read") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7da26cd759fc4f90c01cb84a09"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
