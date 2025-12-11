import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765449543718 implements MigrationInterface {
    name = 'Init1765449543718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "code" character varying(100) NOT NULL, "description" text, "coefficient" integer, "category" character varying(100), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_86b3589486bac01d2903e22471c" UNIQUE ("code"), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "code" character varying(100) NOT NULL, "level" integer NOT NULL, "description" text, "capacity" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cf7491878e0fca8599438629988" UNIQUE ("code"), CONSTRAINT "PK_e207aa15404e9b2ce35910f9f7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "class_years" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "classId" uuid NOT NULL, "academicYearId" uuid NOT NULL, "section" character varying(255), "roomNumber" character varying(255), "maxStudents" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4dd0d3fca9b070bfcef6b20b8f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_classes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" uuid NOT NULL, "classYearId" uuid NOT NULL, "teacherId" uuid, "hoursPerWeek" integer, "coefficient" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05ac0244dd8944211770d0cda55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trimesters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "order" integer NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "percentage" numeric(5,2) NOT NULL, "academicYearId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6634822987bcd6c996385a83391" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tests_type_enum" AS ENUM('exam', 'quiz', 'homework', 'practical', 'oral')`);
        await queryRunner.query(`CREATE TABLE "tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "type" "public"."tests_type_enum" NOT NULL DEFAULT 'exam', "date" date NOT NULL, "percentage" numeric(5,2) NOT NULL, "courseClassId" uuid NOT NULL, "trimesterId" uuid NOT NULL, "description" text, "duration" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid NOT NULL, "testId" uuid NOT NULL, "score" numeric(5,2) NOT NULL, "maxScore" numeric(5,2) NOT NULL DEFAULT '20', "isAbsent" boolean NOT NULL DEFAULT false, "comment" text, "enteredBy" uuid, "enteredAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_61fc48ac0c1bf50de1a9858dec" ON "notes" ("studentId", "testId") `);
        await queryRunner.query(`CREATE TYPE "public"."students_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "registrationNumber" character varying(100) NOT NULL, "dateOfBirth" date NOT NULL, "placeOfBirth" character varying(255), "gender" "public"."students_gender_enum" NOT NULL, "photo" character varying(255), "address" text, "phone" character varying(50), "email" character varying(255), "parentName" character varying(255), "parentPhone" character varying(50), "parentEmail" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3923ac7111bfdbdb86fcbd7e4ba" UNIQUE ("registrationNumber"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."student_inscriptions_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "student_inscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid NOT NULL, "academicYearId" uuid NOT NULL, "classYearId" uuid NOT NULL, "inscriptionDate" date NOT NULL, "status" "public"."student_inscriptions_status_enum" NOT NULL DEFAULT 'pending', "tuitionFee" numeric(10,2), "isPaid" boolean NOT NULL DEFAULT false, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_25ac472cd25f7eae2103242cef9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "academic_years" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "isCurrent" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "academyId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "academies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "code" character varying(255) NOT NULL, "address" text, "phone" character varying(50), "email" character varying(255), "logo" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2dfdf9c280e7e43de178ec3bc3e" UNIQUE ("code"), CONSTRAINT "PK_abce78680fbad7d56c23118f9e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'teacher', 'staff')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'staff', "phone" character varying(50), "avatar" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "academyId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "class_years" ADD CONSTRAINT "FK_23f4bc8d32b58921b6ff3af90d5" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_years" ADD CONSTRAINT "FK_33f33dfc2f4dc2a900297db40f9" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_classes" ADD CONSTRAINT "FK_544fb0b514e25450ff04f454a92" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_classes" ADD CONSTRAINT "FK_eeed1671adeb42989c788e49e9f" FOREIGN KEY ("classYearId") REFERENCES "class_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trimesters" ADD CONSTRAINT "FK_b69fb53c763d20b9ce3db40d638" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tests" ADD CONSTRAINT "FK_7b6e71358018464a71d5d0c000b" FOREIGN KEY ("courseClassId") REFERENCES "course_classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tests" ADD CONSTRAINT "FK_070944bc20266e347850ae991af" FOREIGN KEY ("trimesterId") REFERENCES "trimesters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_c4b5e5ac09bb41db7967ccfe34d" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_e0fc4da77a80901513ceab891b1" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" ADD CONSTRAINT "FK_acd157f969944c6bdbc19bd73b2" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" ADD CONSTRAINT "FK_45bbab1cbc1729e27a30a9f3dc3" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" ADD CONSTRAINT "FK_67642f04a73a7f31fd7a328e4fc" FOREIGN KEY ("classYearId") REFERENCES "class_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "academic_years" ADD CONSTRAINT "FK_ef7c1d799728f95ce24b02a9132" FOREIGN KEY ("academyId") REFERENCES "academies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ebd04e3dc623af836e27bce1416" FOREIGN KEY ("academyId") REFERENCES "academies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ebd04e3dc623af836e27bce1416"`);
        await queryRunner.query(`ALTER TABLE "academic_years" DROP CONSTRAINT "FK_ef7c1d799728f95ce24b02a9132"`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" DROP CONSTRAINT "FK_67642f04a73a7f31fd7a328e4fc"`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" DROP CONSTRAINT "FK_45bbab1cbc1729e27a30a9f3dc3"`);
        await queryRunner.query(`ALTER TABLE "student_inscriptions" DROP CONSTRAINT "FK_acd157f969944c6bdbc19bd73b2"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_e0fc4da77a80901513ceab891b1"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_c4b5e5ac09bb41db7967ccfe34d"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP CONSTRAINT "FK_070944bc20266e347850ae991af"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP CONSTRAINT "FK_7b6e71358018464a71d5d0c000b"`);
        await queryRunner.query(`ALTER TABLE "trimesters" DROP CONSTRAINT "FK_b69fb53c763d20b9ce3db40d638"`);
        await queryRunner.query(`ALTER TABLE "course_classes" DROP CONSTRAINT "FK_eeed1671adeb42989c788e49e9f"`);
        await queryRunner.query(`ALTER TABLE "course_classes" DROP CONSTRAINT "FK_544fb0b514e25450ff04f454a92"`);
        await queryRunner.query(`ALTER TABLE "class_years" DROP CONSTRAINT "FK_33f33dfc2f4dc2a900297db40f9"`);
        await queryRunner.query(`ALTER TABLE "class_years" DROP CONSTRAINT "FK_23f4bc8d32b58921b6ff3af90d5"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "academies"`);
        await queryRunner.query(`DROP TABLE "academic_years"`);
        await queryRunner.query(`DROP TABLE "student_inscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."student_inscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TYPE "public"."students_gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61fc48ac0c1bf50de1a9858dec"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`DROP TABLE "tests"`);
        await queryRunner.query(`DROP TYPE "public"."tests_type_enum"`);
        await queryRunner.query(`DROP TABLE "trimesters"`);
        await queryRunner.query(`DROP TABLE "course_classes"`);
        await queryRunner.query(`DROP TABLE "class_years"`);
        await queryRunner.query(`DROP TABLE "classes"`);
        await queryRunner.query(`DROP TABLE "courses"`);
    }

}
