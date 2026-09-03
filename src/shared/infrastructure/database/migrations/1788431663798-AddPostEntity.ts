import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostEntity1788431663798 implements MigrationInterface {
    name = 'AddPostEntity1788431663798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_type" character varying NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "images" text array NOT NULL DEFAULT '{}', "province_code" integer NOT NULL, "profile_id" uuid NOT NULL, "like_count" integer NOT NULL DEFAULT '0', "comment_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
