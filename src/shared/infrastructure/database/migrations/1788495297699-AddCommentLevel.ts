import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentLevel1788495297699 implements MigrationInterface {
    name = 'AddCommentLevel1788495297699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "level" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "level" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "level"`);
    }

}
