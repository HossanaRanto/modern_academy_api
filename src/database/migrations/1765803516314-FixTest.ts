import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTest1765803516314 implements MigrationInterface {
    name = 'FixTest1765803516314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP CONSTRAINT "FK_7b6e71358018464a71d5d0c000b"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "courseClassId"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "isActive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "duration" integer`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "courseClassId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tests" ADD CONSTRAINT "FK_7b6e71358018464a71d5d0c000b" FOREIGN KEY ("courseClassId") REFERENCES "course_classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
