import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentEntity1788451666380 implements MigrationInterface {
    name = 'AddCommentEntity1788451666380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "parent_id" uuid, "post_id" uuid NOT NULL, "profile_id" uuid NOT NULL, "child_ids" text array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
