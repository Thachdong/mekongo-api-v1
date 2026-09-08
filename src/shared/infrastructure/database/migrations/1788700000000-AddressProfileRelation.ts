import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressProfileRelation1788700000000 implements MigrationInterface {
  name = 'AddressProfileRelation1788700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" ADD "address_id" uuid`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "profile_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "current_address_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "current_address_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "profile_id"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "address_id"`);
  }
}
