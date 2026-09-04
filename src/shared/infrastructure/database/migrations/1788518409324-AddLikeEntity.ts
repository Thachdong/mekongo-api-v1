import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLikeEntity1788518409324 implements MigrationInterface {
    name = 'AddLikeEntity1788518409324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "profile_id" uuid NOT NULL, "reaction_type" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e519a0d914237647d7503b2fd68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_likes_post_id_profile_id" ON "likes" ("post_id", "profile_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_likes_post_id_profile_id"`);
        await queryRunner.query(`DROP TABLE "likes"`);
    }

}
