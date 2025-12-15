import { Note } from '../../../../entities/note.entity';

export interface INoteRepository {
  findById(id: string): Promise<Note | null>;
  findByTest(testId: string): Promise<Note[]>;
  findByStudent(studentId: string): Promise<Note[]>;
  findByStudentAndTest(studentId: string, testId: string): Promise<Note | null>;
  findByStudentAndCourse(studentId: string, courseId: string): Promise<Note[]>;
  findByTestAndCourse(testId: string, courseId: string): Promise<Note[]>;
  create(noteData: Partial<Note>): Promise<Note>;
  save(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
  bulkCreate(notesData: Partial<Note>[]): Promise<Note[]>;
  bulkUpsert(notesData: Partial<Note>[]): Promise<Note[]>;
}

export const NOTE_REPOSITORY = Symbol('NOTE_REPOSITORY');
