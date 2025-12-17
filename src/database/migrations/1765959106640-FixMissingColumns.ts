import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMissingColumns1765959106640 implements MigrationInterface {
    name = 'FixMissingColumns1765959106640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ADD "courseId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_a3fca84a5e23e9f5eb39e45fbbb" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_a3fca84a5e23e9f5eb39e45fbbb"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "courseId"`);
    }

}
