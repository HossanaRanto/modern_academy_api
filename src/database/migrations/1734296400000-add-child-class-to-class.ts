import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddChildClassToClass1734296400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add childClassId column to classes table
    await queryRunner.addColumn(
      'classes',
      new TableColumn({
        name: 'childClassId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'classes',
      new TableForeignKey({
        name: 'FK_classes_childClass',
        columnNames: ['childClassId'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add unique constraint to ensure a class can only be a child of one parent
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_classes_childClassId_unique" 
      ON "classes" ("childClassId") 
      WHERE "childClassId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_classes_childClassId_unique"`);

    // Drop the foreign key
    await queryRunner.dropForeignKey('classes', 'FK_classes_childClass');

    // Drop the column
    await queryRunner.dropColumn('classes', 'childClassId');
  }
}
