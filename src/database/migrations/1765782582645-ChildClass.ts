import { MigrationInterface, QueryRunner } from "typeorm";

export class ChildClass1765782582645 implements MigrationInterface {
    name = 'ChildClass1765782582645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" ADD "childClassId" uuid`);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "UQ_7c9d15f7c85a980801acef1fd05" UNIQUE ("childClassId")`);
        await queryRunner.query(`ALTER TABLE "classes" ADD "parentClassId" uuid`);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_7c9d15f7c85a980801acef1fd05" FOREIGN KEY ("childClassId") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_ee6c80fddafbcc91f0b6f05a3c9" FOREIGN KEY ("parentClassId") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_ee6c80fddafbcc91f0b6f05a3c9"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_7c9d15f7c85a980801acef1fd05"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "parentClassId"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "UQ_7c9d15f7c85a980801acef1fd05"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "childClassId"`);
    }

}
