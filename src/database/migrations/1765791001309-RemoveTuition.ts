import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTuition1765791001309 implements MigrationInterface {
    name = 'RemoveTuition1765791001309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_inscriptions" DROP COLUMN "tuitionFee"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_inscriptions" ADD "tuitionFee" numeric(10,2)`);
    }

}
