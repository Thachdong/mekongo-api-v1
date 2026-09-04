import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCommentChildIds1788491017611 implements MigrationInterface {
    name = 'RemoveCommentChildIds1788491017611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "child_ids"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "child_ids" text array NOT NULL DEFAULT '{}'`);
    }

}
