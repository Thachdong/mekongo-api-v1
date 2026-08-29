import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsConsumedToOtps1787904088236 implements MigrationInterface {
    name = 'AddIsConsumedToOtps1787904088236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" ADD "is_consumed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "is_consumed"`);
    }

}
