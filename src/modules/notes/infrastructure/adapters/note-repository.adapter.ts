import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../../../../entities/note.entity';
import { INoteRepository } from '../../application/ports/note-repository.port';

@Injectable()
export class NoteRepositoryAdapter implements INoteRepository {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async findById(id: string): Promise<Note | null> {
    return this.noteRepository.findOne({
      where: { id },
      relations: ['student', 'test', 'test.courseClass', 'test.trimester'],
    });
  }

  async findByTest(testId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { testId },
      relations: ['student', 'test'],
      order: { 
        student: { 
          lastName: 'ASC', 
          firstName: 'ASC' 
        } 
      },
    });
  }

  async findByStudent(studentId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { studentId },
      relations: ['test', 'test.courseClass', 'test.trimester'],
      order: { 
        test: { 
          date: 'ASC' 
        } 
      },
    });
  }

  async findByStudentAndTest(
    studentId: string,
    testId: string,
  ): Promise<Note | null> {
    return this.noteRepository.findOne({
      where: { studentId, testId },
      relations: ['student', 'test', 'course'],
    });
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Note[]> {
    return this.noteRepository.find({
      where: { studentId, courseId },
      relations: ['test', 'test.trimester', 'course'],
      order: {
        test: {
          date: 'ASC',
        },
      },
    });
  }

  async findByTestAndCourse(testId: string, courseId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { testId, courseId },
      relations: ['student', 'test', 'course'],
      order: {
        student: {
          lastName: 'ASC',
          firstName: 'ASC',
        },
      },
    });
  }

  async create(noteData: Partial<Note>): Promise<Note> {
    const note = this.noteRepository.create(noteData);
    return this.noteRepository.save(note);
  }

  async save(note: Note): Promise<Note> {
    return this.noteRepository.save(note);
  }

  async delete(id: string): Promise<void> {
    await this.noteRepository.delete(id);
  }

  async bulkCreate(notesData: Partial<Note>[]): Promise<Note[]> {
    const notes = this.noteRepository.create(notesData);
    return this.noteRepository.save(notes);
  }

  async bulkUpsert(notesData: Partial<Note>[]): Promise<Note[]> {
    const result = await this.noteRepository.upsert(notesData, {
      conflictPaths: ['studentId', 'testId'],
      skipUpdateIfNoValuesChanged: true,
    });

    // Fetch the upserted records with relations
    const ids = result.identifiers.map((identifier) => identifier.id);
    return this.noteRepository.find({
      where: ids.map((id) => ({ id })),
      relations: ['student', 'test', 'course'],
    });
  }
}
