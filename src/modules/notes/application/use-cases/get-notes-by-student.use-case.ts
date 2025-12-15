import { Injectable, Inject } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';

@Injectable()
export class GetNotesByStudentUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(studentId: string, courseId?: string) {
    if (courseId) {
      return this.noteRepository.findByStudentAndCourse(studentId, courseId);
    }
    return this.noteRepository.findByStudent(studentId);
  }
}
