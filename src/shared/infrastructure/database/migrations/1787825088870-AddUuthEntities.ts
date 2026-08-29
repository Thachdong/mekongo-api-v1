import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUuthEntities1787825088870 implements MigrationInterface {
    name = 'AddUuthEntities1787825088870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login_type" character varying NOT NULL, "identifier_hash" character varying NOT NULL, "password_hash" character varying NOT NULL, "status" character varying NOT NULL, "block_until" TIMESTAMP WITH TIME ZONE, "display_name" character varying NOT NULL, "avatar_url" character varying, "current_address_id" uuid, "active_profile_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d7b4a8f148f4b89ed96b3eb06c" UNIQUE ("identifier_hash"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "province" character varying NOT NULL, "province_code" integer NOT NULL, "ward" character varying NOT NULL, "details" character varying NOT NULL, "account_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "active_profile" character varying NOT NULL, "account_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purpose" character varying NOT NULL, "identifier" character varying NOT NULL, "account_id" uuid NOT NULL, "code_hash" character varying NOT NULL, "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "retry_count" integer NOT NULL DEFAULT '0', "wrong_count" integer NOT NULL DEFAULT '0', "block_type" character varying, "block_until" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
